import React from 'react';
import type { Platform } from '@/types/database';

const tabs: { key: Platform | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'facebook', label: 'FB' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'instagram', label: 'IG' },
];

type Props = {
  value: Platform | 'all';
  onChange: (v: Platform | 'all') => void;
};

export default function MarketplaceTabs({ value, onChange }: Props) {
  return (
    <div className="border-b border-gray-100">
      <nav className="flex gap-4 px-1">
        {tabs.map((t) => {
          const active = t.key === value;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`py-3 px-3 text-sm font-medium ${
                active
                  ? 'text-foreground border-b-2 border-emerald-500'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}