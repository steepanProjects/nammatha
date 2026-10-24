'use client';
import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/lib/types';
import { X, Star, BookOpen, ChevronLeft } from 'lucide-react';

export default function RevisionSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    const r = await fetch('/api/revision');
    const d = await r.json();
    setTasks(d.tasks || []);
    setLoading(false);
  }, [open]);

  useEffect(() => { load(); }, [load]);

  const remove = async (id: number) => {
    setTasks(p => p.filter(t => t.id !== id));
    await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId: id, is_revision: false }) });
  };

  const grouped = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    const k = t.sprint_title || 'Unknown';
    (acc[k] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div style={{
      width: open ? 300 : 0,
      minWidth: open ? 300 : 0,
      overflow: 'hidden',
      borderLeft: open ? '1px solid var(--border0)' : 'none',
      background: 'var(--bg1)',
      transition: 'width 0.22s ease, min-width 0.22s ease',
      display: 'flex', flexDirection: 'column', height: '100vh',
      position: 'sticky', top: 0,
    }}>
      {open && (
        <>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 14px', borderBottom: '1px solid var(--border0)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ChevronLeft size={14} style={{ color: 'var(--text2)' }} />
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text0)' }}>Revision list</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text2)', background: 'var(--bg3)', padding: '1px 7px', borderRadius: 4 }}>
                {tasks.length} items
              </span>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', display: 'flex', padding: 2 }}>
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                <div className="spin" style={{ width: 20, height: 20, border: '2px solid var(--bg4)', borderTopColor: 'var(--blue)', borderRadius: '50%' }} />
              </div>
            ) : tasks.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 56, gap: 10, color: 'var(--text2)' }}>
                <BookOpen size={30} style={{ opacity: 0.25 }} />
                <p style={{ fontSize: 13, textAlign: 'center' }}>No tasks marked for revision yet.</p>
                <p style={{ fontSize: 11, textAlign: 'center', color: 'var(--text2)', lineHeight: 1.5 }}>
                  Click the ★ on any task to add it here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Object.entries(grouped).map(([title, stasks]) => (
                  <div key={title}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, padding: '0 2px' }}>
                      {title}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {stasks.map(task => (
                        <RevItem key={task.id} task={task} onRemove={remove} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function RevItem({ task, onRemove }: { task: Task; onRemove: (id: number) => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 8,
        padding: '8px 10px', borderRadius: 8,
        border: `1px solid ${hover ? 'var(--border2)' : 'var(--border0)'}`,
        background: 'var(--bg2)', transition: 'border-color 0.12s',
      }}
    >
      <Star size={11} style={{ color: 'var(--yellow)', marginTop: 2, flexShrink: 0 }} fill="currentColor" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: 'var(--text0)', lineHeight: 1.4 }}>{task.title}</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
          Day {task.day_number}{task.est_minutes ? ` · ${task.est_minutes}m` : ''}
        </div>
      </div>
      <button onClick={() => onRemove(task.id)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text2)', opacity: hover ? 1 : 0,
        padding: 0, display: 'flex', transition: 'opacity 0.12s',
      }}>
        <X size={11} />
      </button>
    </div>
  );
}
