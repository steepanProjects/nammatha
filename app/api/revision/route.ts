import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const tasks = db.prepare(`
      SELECT t.*, d.day_number, s.sprint_number, s.title as sprint_title
      FROM tasks t
      JOIN days d ON t.day_id = d.id
      JOIN sprints s ON d.sprint_id = s.id
      WHERE t.is_revision = 1
      ORDER BY s.sprint_number, d.day_number, t.task_order
    `).all();
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch revision tasks' }, { status: 500 });
  }
}
