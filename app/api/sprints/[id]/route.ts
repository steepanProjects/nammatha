import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const sprintId = parseInt(id);

    const sprint = db.prepare(`SELECT * FROM sprints WHERE id=?`).get(sprintId);
    if (!sprint) return NextResponse.json({ error: 'Sprint not found' }, { status: 404 });

    const days = db.prepare(`
      SELECT d.*,
        COUNT(t.id) as total_tasks,
        SUM(t.is_completed) as completed_tasks
      FROM days d
      LEFT JOIN tasks t ON t.day_id = d.id
      WHERE d.sprint_id = ?
      GROUP BY d.id
      ORDER BY d.day_number
    `).all(sprintId);

    const tasks = db.prepare(`
      SELECT t.*, d.day_number, d.sprint_id
      FROM tasks t
      JOIN days d ON t.day_id = d.id
      WHERE d.sprint_id = ?
      ORDER BY d.day_number, t.task_order
    `).all(sprintId);

    return NextResponse.json({ sprint, days, tasks });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch sprint' }, { status: 500 });
  }
}
