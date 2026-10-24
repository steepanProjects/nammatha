import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare(`SELECT key, value FROM project_meta`).all() as { key: string; value: string }[];
    const meta: Record<string, string> = {};
    for (const row of rows) meta[row.key] = row.value;
    return NextResponse.json({ meta });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch meta' }, { status: 500 });
  }
}
