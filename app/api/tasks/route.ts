import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PATCH(req: Request) {
  try {
    const db = getDb();
    const { taskId, is_completed, is_revision } = await req.json();

    if (is_completed !== undefined) {
      const completedAt = is_completed ? new Date().toISOString() : null;
      db.prepare(`UPDATE tasks SET is_completed=?, completed_at=? WHERE id=?`)
        .run(is_completed ? 1 : 0, completedAt, taskId);
    }

    if (is_revision !== undefined) {
      db.prepare(`UPDATE tasks SET is_revision=? WHERE id=?`)
        .run(is_revision ? 1 : 0, taskId);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
