'use client';
import { useState } from 'react';
import { Sprint, Day, Task } from '@/lib/types';
import { ChevronDown, ChevronUp, Circle, Coffee, Clock } from 'lucide-react';

interface Props { sprints: Sprint[]; onUpdate: () => void; }

function fmtEst(m: number): string {
  if (!m) return '0m';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

export default function UpcomingSprints({ sprints }: Props) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [data, setData] = useState<Record<number, { days: Day[]; tasks: Task[] }>>({});

  const toggle = async (s: Sprint) => {
    if (openId === s.id) { setOpenId(null); return; }
    setOpenId(s.id);
    if (!data[s.id]) {
      const r = await fetch(`/api/sprints/${s.id}`);
      const d = await r.json();
      setData(p => ({ ...p, [s.id]: { days: d.days || [], tasks: d.tasks || [] } }));
    }
  };

  if (!sprints.length) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 260, gap: 10, color: 'var(--text2)' }}>
      <Circle size={44} style={{ opacity: 0.2 }} />
      <span>No upcoming sprints.</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 6 }} className="fadeIn">
      {sprints.map(sprint => {
        const isOpen = openId === sprint.id;
        const d = data[sprint.id];
        return (
          <div key={sprint.id} style={{ borderRadius: 10, border: `1px solid ${isOpen ? 'var(--border2)' : 'var(--border0)'}`, background: 'var(--bg1)', overflow: 'hidden', transition: 'border-color 0.15s' }}>
            {/* Sprint row */}
            <button onClick={() => toggle(sprint)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <Circle size={14} style={{ color: 'var(--text2)', flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text0)' }}>{sprint.title}</span>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>0/{sprint.total_days} days completed</span>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ padding: '2px 9px', borderRadius: 5, border: '1px solid var(--border0)', color: 'var(--text2)', fontSize: 11, fontWeight: 500 }}>Upcoming</span>
                <span style={{ color: 'var(--text2)', display: 'flex' }}>{isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
              </div>
            </button>

            {/* Expanded content */}
            {isOpen && d && (
              <div style={{ borderTop: '1px solid var(--border0)' }}>
                {/* Summary */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 16px', background: 'var(--bg0)', borderBottom: '1px solid var(--border0)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={12} style={{ color: 'var(--text2)' }} />
                    <span style={{ fontSize: 12, color: 'var(--text2)' }}>Est. total:</span>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--text1)', fontWeight: 600 }}>{fmtEst(sprint.total_est_minutes)}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{sprint.total_tasks} tasks · {sprint.active_days} active days</span>
                </div>

                {d.days.map(day => {
                  const dayTasks = d.tasks.filter(t => t.day_id === day.id);
                  return (
                    <div key={day.id} style={{ borderBottom: '1px solid var(--border0)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: 'var(--bg0)' }}>
                        {day.is_day_off
                          ? <Coffee size={12} style={{ color: 'var(--text2)' }} />
                          : <Circle size={12} style={{ color: 'var(--blue)' }} />
                        }
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)' }}>Day {day.day_number}</span>
                        {day.is_day_off
                          ? <span style={{ fontSize: 12, color: 'var(--text2)' }}>— Day Off</span>
                          : <span style={{ fontSize: 12, color: 'var(--text2)' }}>· {day.total_tasks} tasks</span>
                        }
                      </div>
                      {!day.is_day_off && dayTasks.map(task => (
                        <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px 7px 38px', borderBottom: '1px solid var(--border0)' }}>
                          <Circle size={12} style={{ color: 'var(--text2)', flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 12, color: 'var(--text1)' }}>
                            <span className="mono" style={{ fontSize: 11, color: 'var(--text2)', marginRight: 6 }}>{task.task_order}.</span>
                            {task.title}
                          </span>
                          <span className="mono" style={{ fontSize: 11, color: 'var(--text2)', flexShrink: 0 }}>{fmtEst(task.est_minutes ?? 0)}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
