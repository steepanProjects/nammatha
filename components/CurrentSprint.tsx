'use client';
import { useState, useEffect, useCallback } from 'react';
import { Sprint, Day, Task } from '@/lib/types';
import { ChevronDown, ChevronUp, BarChart2, RefreshCw, Star, CheckCircle2, Circle, Coffee, CheckCheck } from 'lucide-react';
import SprintPerformanceModal from './SprintPerformanceModal';

interface Props { sprint: Sprint | null; onUpdate: () => void; }

function fmtEst(m: number | null): string {
  if (!m) return '—';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

export default function CurrentSprint({ sprint, onUpdate }: Props) {
  const [days, setDays] = useState<Day[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [showPerf, setShowPerf] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!sprint) return;
    setLoading(true);
    const r = await fetch(`/api/sprints/${sprint.id}`);
    const d = await r.json();
    setDays(d.days || []);
    setTasks(d.tasks || []);
    if (d.days?.length) setExpanded(new Set([d.days[0].id]));
    setLoading(false);
  }, [sprint]);

  useEffect(() => { load(); }, [load]);

  const toggle = (id: number) => setExpanded(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleTask = async (task: Task) => {
    const v = task.is_completed === 1 ? 0 : 1;
    setTasks(p => p.map(t => t.id === task.id ? { ...t, is_completed: v } : t));
    setDays(p => p.map(d => {
      if (d.id !== task.day_id) return d;
      const delta = v === 1 ? 1 : -1;
      return { ...d, completed_tasks: d.completed_tasks + delta };
    }));
    await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId: task.id, is_completed: v === 1 }) });
    onUpdate();
  };

  const toggleRevision = async (task: Task) => {
    const v = task.is_revision === 1 ? 0 : 1;
    setTasks(p => p.map(t => t.id === task.id ? { ...t, is_revision: v } : t));
    await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId: task.id, is_revision: v === 1 }) });
  };

  if (!sprint) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 10, color: 'var(--text2)' }}>
      <Circle size={44} style={{ opacity: 0.25 }} />
      <span style={{ fontSize: 14 }}>No active sprint.</span>
    </div>
  );

  const activeDays = days.filter(d => !d.is_day_off);
  const completedDays = activeDays.filter(d => d.total_tasks > 0 && d.completed_tasks >= d.total_tasks).length;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }} className="fadeIn">
      {/* Sprint bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text0)', letterSpacing: '-0.02em' }}>{sprint.title}</span>
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>{completedDays}/{activeDays.length} days completed</span>
          {/* Mini progress */}
          <div style={{ display: 'flex', gap: 3 }}>
            {activeDays.map(d => (
              <div key={d.id} style={{
                width: 20, height: 4, borderRadius: 2,
                background: d.completed_tasks >= d.total_tasks && d.total_tasks > 0 ? 'var(--green)' : d.completed_tasks > 0 ? 'var(--blue)' : 'var(--bg4)',
                transition: 'background 0.2s',
              }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowPerf(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 8,
            border: '1px solid var(--border0)', background: 'var(--bg2)',
            color: 'var(--text1)', cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}>
            <BarChart2 size={13} />
            Review &amp; Complete
          </button>
          <button onClick={load} title="Refresh" style={{
            padding: '6px 8px', borderRadius: 8,
            border: '1px solid var(--border0)', background: 'var(--bg2)',
            color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center',
          }}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div className="spin" style={{ width: 24, height: 24, border: '2px solid var(--bg4)', borderTopColor: 'var(--blue)', borderRadius: '50%' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {days.map(day => {
            const dayTasks = tasks.filter(t => t.day_id === day.id);
            const isOpen = expanded.has(day.id);
            const done = !day.is_day_off && day.total_tasks > 0 && day.completed_tasks >= day.total_tasks;
            const completedInDay = dayTasks.filter(t => t.is_completed).length;
            const pendingTasks = dayTasks.filter(t => !t.is_completed);
            const completedTasks = dayTasks.filter(t => t.is_completed === 1);

            if (day.is_day_off) return (
              <div key={day.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', borderRadius: 10,
                border: '1px solid var(--border0)', background: 'var(--bg1)',
              }}>
                <Coffee size={14} style={{ color: 'var(--text2)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)' }}>Day {day.day_number}</span>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>Day off · Rest &amp; Revise</span>
                <Chip label="Day Off" />
              </div>
            );

            return (
              <div key={day.id} style={{
                borderRadius: 10,
                border: `1px solid ${isOpen ? 'var(--border2)' : 'var(--border0)'}`,
                background: 'var(--bg1)',
                overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}>
                {/* Day header */}
                <button onClick={() => toggle(day.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left',
                }}>
                  <span style={{ color: done ? 'var(--green)' : 'var(--text2)', display: 'flex', flexShrink: 0 }}>
                    {done ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text0)' }}>Day {day.day_number}</span>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{day.total_tasks} tasks</span>

                  {/* Day progress bar */}
                  {day.total_tasks > 0 && !done && (
                    <div style={{ flex: 1, maxWidth: 80, height: 3, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2, background: 'var(--blue)',
                        width: `${(completedInDay / day.total_tasks) * 100}%`, transition: 'width 0.3s',
                      }} />
                    </div>
                  )}

                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {done && <Chip label="Completed" green />}
                    {!done && completedInDay > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--text2)' }} className="mono">{completedInDay}/{day.total_tasks}</span>
                    )}
                    <span style={{ color: 'var(--text2)', display: 'flex' }}>
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </div>
                </button>

                {/* Tasks */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border0)' }}>
                    {/* Column labels */}
                    <div style={{ display: 'flex', alignItems: 'center', padding: '6px 16px 6px 44px', borderBottom: '1px solid var(--border0)' }}>
                      <span style={{ flex: 1, fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Task</span>
                      <span style={{ width: 72, textAlign: 'right', fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Est. time</span>
                      <span style={{ width: 28 }} />
                    </div>

                    {/* Pending tasks */}
                    {pendingTasks.map(task => (
                      <TaskRow key={task.id} task={task} onToggle={toggleTask} onRevision={toggleRevision} />
                    ))}

                    {/* Completed section */}
                    {completedTasks.length > 0 && (
                      <>
                        <div style={{ padding: '8px 16px 4px 44px', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CheckCheck size={12} style={{ color: 'var(--green)' }} />
                          <span style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 500 }}>Completed tasks</span>
                        </div>
                        {completedTasks.map(task => (
                          <TaskRow key={task.id} task={task} onToggle={toggleTask} onRevision={toggleRevision} />
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showPerf && (
        <SprintPerformanceModal sprint={sprint} days={days} tasks={tasks} onClose={() => setShowPerf(false)}
          onComplete={async () => {
            await fetch('/api/sprints', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sprintId: sprint.id, status: 'completed' }) });
            setShowPerf(false); onUpdate();
          }}
        />
      )}
    </div>
  );
}

function TaskRow({ task, onToggle, onRevision }: { task: Task; onToggle: (t: Task) => void; onRevision: (t: Task) => void }) {
  const done = task.is_completed === 1;
  const rev = task.is_revision === 1;
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 16px',
        borderBottom: '1px solid var(--border0)',
        background: hover ? 'var(--bg2)' : done ? 'rgba(34,211,106,0.025)' : 'transparent',
        transition: 'background 0.1s',
      }}
    >
      <button onClick={() => onToggle(task)} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        color: done ? 'var(--green)' : 'var(--text2)', display: 'flex', flexShrink: 0,
        transition: 'color 0.12s',
      }}>
        {done ? <CheckCircle2 size={15} /> : <Circle size={15} />}
      </button>

      <span style={{ flex: 1, fontSize: 13, color: done ? 'var(--text2)' : 'var(--text0)', textDecoration: done ? 'line-through' : 'none', textDecorationColor: 'var(--text3)' }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text2)', marginRight: 7 }}>{task.task_order}.</span>
        {task.title}
      </span>

      <span className="mono" style={{ width: 72, textAlign: 'right', fontSize: 11, color: 'var(--text2)', flexShrink: 0 }}>
        {fmtEst(task.est_minutes)}
      </span>

      <button onClick={() => onRevision(task)} title={rev ? 'Remove from revision' : 'Add to revision'} style={{
        width: 28, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        color: rev ? 'var(--yellow)' : hover ? 'var(--text2)' : 'transparent',
        display: 'flex', justifyContent: 'center', transition: 'color 0.12s', flexShrink: 0,
      }}>
        <Star size={12} fill={rev ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}

function Chip({ label, green }: { label: string; green?: boolean }) {
  return (
    <span style={{
      marginLeft: 'auto',
      padding: '2px 9px', borderRadius: 5, fontSize: 11, fontWeight: 500,
      background: green ? 'rgba(34,211,106,0.1)' : 'var(--bg3)',
      color: green ? 'var(--green)' : 'var(--text2)',
    }}>{label}</span>
  );
}
