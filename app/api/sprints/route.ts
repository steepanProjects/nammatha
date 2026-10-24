import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();

    const sprints = db.prepare(`
      SELECT s.*,
        COUNT(DISTINCT d.id) as total_days_count,
        COUNT(DISTINCT CASE WHEN d.is_day_off=0 THEN d.id END) as active_days,
        COUNT(t.id) as total_tasks,
        SUM(t.is_completed) as completed_tasks,
        COALESCE(SUM(t.est_minutes),0) as total_est_minutes
      FROM sprints s
      LEFT JOIN days d ON d.sprint_id = s.id
      LEFT JOIN tasks t ON t.day_id = d.id AND d.is_day_off = 0
      GROUP BY s.id
      ORDER BY s.sprint_number
    `).all();

    return NextResponse.json({ sprints });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch sprints' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const db = getDb();
    const { sprintId, status } = await req.json();
    db.prepare(`UPDATE sprints SET status=? WHERE id=?`).run(status, sprintId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update sprint' }, { status: 500 });
  }
}
