'use client';
import { Sprint } from '@/lib/types';
import { CheckCircle2, ClipboardList } from 'lucide-react';

function fmtEst(m: number): string {
  if (!m) return '0m';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

export default function CompletedSprints({ sprints }: { sprints: Sprint[] }) {
  if (!sprints.length) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12, color: 'var(--text2)' }}>
      <ClipboardList size={52} style={{ opacity: 0.18 }} />
      <p style={{ fontSize: 14 }}>No completed sprints.</p>
      <p style={{ fontSize: 12, color: 'var(--text2)' }}>Complete your current sprint to see it here.</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 6 }} className="fadeIn">
      {sprints.map(s => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border0)', background: 'var(--bg1)' }}>
          <CheckCircle2 size={15} style={{ color: 'var(--green)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text0)' }}>{s.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
              {s.completed_tasks}/{s.total_tasks} tasks · {s.total_days} days · {fmtEst(s.total_est_minutes)}
            </div>
          </div>
          <span style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 6, background: 'rgba(34,211,106,0.1)', color: 'var(--green)', fontSize: 12, fontWeight: 600 }}>
            Completed
          </span>
        </div>
      ))}
    </div>
  );
}
