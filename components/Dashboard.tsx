'use client';
import { useState, useEffect, useCallback } from 'react';
import { Sprint, ProjectMeta } from '@/lib/types';
import Header from './Header';
import TabBar from './TabBar';
import CurrentSprint from './CurrentSprint';
import UpcomingSprints from './UpcomingSprints';
import CompletedSprints from './CompletedSprints';
import RevisionSidebar from './RevisionSidebar';

export type TabType = 'current' | 'upcoming' | 'completed';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('current');
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [meta, setMeta] = useState<ProjectMeta | null>(null);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [s, m] = await Promise.all([fetch('/api/sprints'), fetch('/api/meta')]);
    const sd = await s.json();
    const md = await m.json();
    setSprints(sd.sprints || []);
    setMeta(md.meta || null);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const currentSprint = sprints.find(s => s.status === 'current');
  const upcomingSprints = sprints.filter(s => s.status === 'upcoming');
  const completedSprints = sprints.filter(s => s.status === 'completed');
  const totalTasks = sprints.reduce((a, s) => a + s.total_tasks, 0);
  const completedTasks = sprints.reduce((a, s) => a + s.completed_tasks, 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg0)', flexDirection: 'column', gap: 12 }}>
        <div className="spin" style={{ width: 28, height: 28, border: '2px solid var(--bg4)', borderTopColor: 'var(--blue)', borderRadius: '50%' }} />
        <span style={{ color: 'var(--text2)', fontSize: 13 }}>Loading…</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg0)' }}>
      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header
          meta={meta}
          sprints={sprints}
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          completedSprintCount={completedSprints.length}
          revisionOpen={revisionOpen}
          onToggleRevision={() => setRevisionOpen(v => !v)}
        />

        {/* Tab bar */}
        <div style={{ borderBottom: '1px solid var(--border0)', background: 'var(--bg1)', padding: '0 24px', flexShrink: 0 }}>
          <TabBar activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {activeTab === 'current' && <CurrentSprint sprint={currentSprint || null} onUpdate={fetchData} />}
          {activeTab === 'upcoming' && <UpcomingSprints sprints={upcomingSprints} onUpdate={fetchData} />}
          {activeTab === 'completed' && <CompletedSprints sprints={completedSprints} />}
        </div>
      </div>

      {/* Sidebar */}
      <RevisionSidebar open={revisionOpen} onClose={() => setRevisionOpen(false)} />
    </div>
  );
}
