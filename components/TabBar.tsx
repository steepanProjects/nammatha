'use client';
import { TabType } from './Dashboard';

const TABS: { id: TabType; label: string }[] = [
  { id: 'current', label: 'Current Sprint' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
];

export default function TabBar({ activeTab, onChange }: { activeTab: TabType; onChange: (t: TabType) => void }) {
  return (
    <div style={{ display: 'flex', gap: 2, padding: '10px 0' }}>
      {TABS.map(tab => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: '5px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: active ? 600 : 400,
              background: active ? 'var(--bg3)' : 'transparent',
              color: active ? 'var(--text0)' : 'var(--text2)',
              transition: 'all 0.12s',
              outline: 'none',
            }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--text1)'; }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--text2)'; }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
