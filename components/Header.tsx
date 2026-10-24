'use client';
import { Sprint, ProjectMeta } from '@/lib/types';
import { Folder, Clock, Calendar, MoreHorizontal, Coffee } from 'lucide-react';

interface Props {
  meta: ProjectMeta | null;
  sprints: Sprint[];
  totalTasks: number;
  completedTasks: number;
  completedSprintCount: number;
  revisionOpen: boolean;
  onToggleRevision: () => void;
}

export default function Header({ meta, sprints, totalTasks, completedTasks, completedSprintCount, revisionOpen, onToggleRevision }: Props) {
  const totalSprints = sprints.length;
  const pct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const formatTime = (min: number) => {
    if (!min) return '0m';
    if (min < 60) return `${min}m`;
    const h = Math.floor(min / 60), m = min % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  };

  const totalCompleted = sprints.reduce((a, s) =>
    a + (s.total_est_minutes || 0) * (s.completed_tasks / Math.max(s.total_tasks, 1)), 0);

  return (
    <header style={{ background: 'var(--bg1)', borderBottom: '1px solid var(--border0)', flexShrink: 0 }}>
      {/* Breadcrumb */}
      <div style={{ padding: '8px 24px', borderBottom: '1px solid var(--border0)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: 'var(--text2)', fontSize: 12 }}>Planly</span>
        <span style={{ color: 'var(--text3)', fontSize: 12 }}>/</span>
        <span style={{ color: 'var(--blue)', fontSize: 12, fontWeight: 600 }}>{meta?.project_name ?? 'Nammatha'}</span>
      </div>

      {/* Title + Actions */}
      <div style={{ padding: '14px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text0)' }}>
          {meta?.project_name ?? 'Nammatha'}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onToggleRevision} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 8,
            border: `1px solid ${revisionOpen ? 'var(--border2)' : 'var(--border0)'}`,
            background: revisionOpen ? 'var(--bg3)' : 'var(--bg2)',
            color: 'var(--text1)', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            transition: 'all 0.15s',
          }}>
            <Coffee size={13} />
            Take a break
          </button>
          <button style={{
            padding: '6px 8px', borderRadius: 8,
            border: '1px solid var(--border0)', background: 'var(--bg2)',
            color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center',
          }}>
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ padding: '16px 24px 16px', display: 'flex', alignItems: 'center', gap: 0 }}>
        <Stat icon={<Folder size={13} />} label="Sprints" value={`${completedSprintCount} / ${totalSprints}`} />
        <Divider />
        <Stat icon={<Clock size={13} />} label="Time spent" value={formatTime(Math.round(totalCompleted))} />
        <Divider />
        <Stat icon={<Calendar size={13} />} label="Started on" value={meta?.started_on ?? '22 Oct 2026'} large />
        <Divider />
        <Stat icon={<Calendar size={13} />} label="Est. completion" value={meta?.est_completion ?? '6 Dec 2026'} large />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--text2)', fontSize: 12 }} className="mono">{completedTasks}/{totalTasks}</span>
          <div style={{ width: 100, height: 3, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--blue)', borderRadius: 3, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      </div>
    </header>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 36, background: 'var(--border0)', margin: '0 20px', flexShrink: 0 }} />;
}

function Stat({ icon, label, value, large }: { icon: React.ReactNode; label: string; value: string; large?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <span style={{ color: 'var(--text2)', display: 'flex' }}>{icon}</span>
      <div>
        <div style={{ color: 'var(--text2)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 1 }}>{label}</div>
        <div style={{ color: 'var(--text0)', fontWeight: large ? 700 : 600, fontSize: large ? 15 : 14, letterSpacing: '-0.02em' }}>{value}</div>
      </div>
    </div>
  );
}
