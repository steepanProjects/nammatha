'use client';
import { Sprint, Day, Task } from '@/lib/types';
import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props { sprint: Sprint; days: Day[]; tasks: Task[]; onClose: () => void; onComplete: () => void; }

function fmtTime(m: number): string {
  if (!m) return '0m';
  const h = Math.floor(m / 60), r = m % 60;
  if (!h) return `${r}m`;
  return r ? `${h}h ${r}m` : `${h}h`;
}

export default function SprintPerformanceModal({ sprint, days, tasks, onClose, onComplete }: Props) {
  const activeDays = days.filter(d => !d.is_day_off);
  const completedCount = tasks.filter(t => t.is_completed).length;

  const chartData = activeDays.map(day => {
    const dt = tasks.filter(t => t.day_id === day.id);
    const est = dt.reduce((a, t) => a + (t.est_minutes || 0), 0);
    const done = dt.filter(t => t.is_completed).length;
    const actual = Math.round(est * (done / Math.max(dt.length, 1)) * 0.85);
    return { name: `Day ${day.day_number}`, Actual: actual, Allocated: est };
  });

  const strengths = activeDays.map(day => {
    const dt = tasks.filter(t => t.day_id === day.id);
    const done = dt.filter(t => t.is_completed).length;
    const ratio = done / Math.max(dt.length, 1);
    const est = dt.reduce((a, t) => a + (t.est_minutes || 0), 0);
    return { day, done, total: dt.length, ratio, est };
  }).filter(d => d.ratio >= 0.8 && d.done > 0);

  const weaknesses = activeDays.map(day => {
    const dt = tasks.filter(t => t.day_id === day.id);
    const done = dt.filter(t => t.is_completed).length;
    const ratio = done / Math.max(dt.length, 1);
    return { day, done, total: dt.length, ratio };
  }).filter(d => d.ratio < 0.5 && d.total > 0);

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 100, padding: 20,
    }}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 14, width: '100%', maxWidth: 760,
        maxHeight: '88vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border0)', flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text0)', letterSpacing: '-0.02em' }}>Sprint Performance</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', display: 'flex', padding: 4, borderRadius: 6 }}>
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 22 }}>
            {[
              { label: 'Time spent', value: fmtTime(Math.round(sprint.total_est_minutes * (completedCount / Math.max(sprint.total_tasks, 1)) * 0.85)) },
              { label: 'Tasks', value: `${completedCount} / ${sprint.total_tasks}` },
              { label: 'Days taken', value: `${activeDays.filter(d => { const dt = tasks.filter(t => t.day_id === d.id); return dt.some(t => t.is_completed); }).length} / ${activeDays.length}` },
              { label: 'Allocated time', value: fmtTime(sprint.total_est_minutes), sub: '0.00× efficiency', accent: true },
            ].map((s, i) => (
              <div key={i} style={{ padding: '14px 14px', borderRadius: 10, border: '1px solid var(--border0)', background: 'var(--bg1)' }}>
                <div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.accent ? 'var(--blue)' : 'var(--text0)', letterSpacing: '-0.03em' }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 2 }}>{s.sub}</div>}
              </div>
            ))}
          </div>

          {/* Chart */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text0)' }}>Daily analytics</span>
              <span style={{ fontSize: 11, color: 'var(--text2)' }}>— Actual &nbsp; ‐ ‐ Allocated</span>
            </div>
            <div style={{ background: 'var(--bg1)', borderRadius: 10, border: '1px solid var(--border0)', padding: '16px 12px', height: 210 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: '#606075', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#606075', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `${v}m` : ''} />
                  <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text0)', fontSize: 12 }} formatter={(v) => [`${v}m`]} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#606075' }} />
                  <Line type="monotone" dataKey="Actual" stroke="#4f8fff" strokeWidth={2} dot={{ fill: '#4f8fff', r: 4 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Allocated" stroke="#3a3a4a" strokeWidth={2} strokeDasharray="5 4" dot={{ fill: '#3a3a4a', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strengths / Weaknesses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text0)', marginBottom: 10 }}>Strengths</div>
              {strengths.length === 0
                ? <EmptyCard text="No strengths recorded yet." />
                : strengths.map(({ day, done, total, est }) => (
                  <StrengthCard key={day.id} title={`Day ${day.day_number}`} sub={`${done}/${total} tasks · ~${Math.round(est / 60 * 10) / 10}h est`} label={`${done} efficient`} />
                ))}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text0)', marginBottom: 10 }}>Weaknesses</div>
              {weaknesses.length === 0
                ? <EmptyCard text="No weaknesses reported." />
                : weaknesses.map(({ day, done, total }) => (
                  <WeaknessCard key={day.id} title={`Day ${day.day_number}`} sub={`${done}/${total} tasks completed`} />
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, padding: '14px 20px', borderTop: '1px solid var(--border0)', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border0)', background: 'transparent', color: 'var(--text1)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            Cancel
          </button>
          <button onClick={onComplete} style={{ padding: '8px 22px', borderRadius: 8, border: 'none', background: 'var(--blue)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
            Complete {sprint.title}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div style={{ padding: '20px 16px', borderRadius: 8, border: '1px solid var(--border0)', background: 'var(--bg1)', color: 'var(--text2)', fontSize: 12, textAlign: 'center' }}>{text}</div>
  );
}

function StrengthCard({ title, sub, label }: { title: string; sub: string; label: string }) {
  return (
    <div style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border0)', background: 'var(--bg1)', marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text0)' }}>{title}</span>
        <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{sub}</div>
    </div>
  );
}

function WeaknessCard({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid rgba(240,90,90,0.2)', background: 'rgba(240,90,90,0.05)', marginBottom: 6 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text0)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--red)' }}>{sub}</div>
    </div>
  );
}
