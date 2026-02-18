import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Filters = {
  minPrice?: string;
  maxPrice?: string;
  minFollowers?: string;
  maxFollowers?: string;
  country?: string;
  niche?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  current: Filters;
  onApply: (vals: Filters) => void;
  onClear: () => void;
};

export default function MarketplaceFilters({ open, onClose, current, onApply, onClear }: Props) {
  const [local, setLocal] = useState<Filters>(current);

  useEffect(() => setLocal(current), [current, open]);

  if (!open) return null;

  return (
    // Desktop: right-aligned floating panel; Mobile: fixed bottom sheet
    <div className="fixed inset-0 z-40 flex items-end sm:items-start sm:justify-end">
      <div
        className="absolute inset-0 bg-black/20 sm:hidden"
        onClick={onClose}
        aria-hidden
      />
      <div className="w-full sm:w-[360px] bg-white border-t border-gray-200 sm:rounded-l-lg sm:rounded-tr-lg sm:border sm:border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Filters</h3>
          <button className="text-sm text-muted-foreground" onClick={onClose}>Close</button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Price (USD)</label>
            <div className="flex gap-2 mt-1">
              <Input
                type="number"
                placeholder="Min"
                value={local.minPrice || ''}
                onChange={(e) => setLocal((s) => ({ ...s, minPrice: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Max"
                value={local.maxPrice || ''}
                onChange={(e) => setLocal((s) => ({ ...s, maxPrice: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Followers</label>
            <div className="flex gap-2 mt-1">
              <Input
                type="number"
                placeholder="Min"
                value={local.minFollowers || ''}
                onChange={(e) => setLocal((s) => ({ ...s, minFollowers: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Max"
                value={local.maxFollowers || ''}
                onChange={(e) => setLocal((s) => ({ ...s, maxFollowers: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Country</label>
            <Input
              placeholder="e.g. United States"
              value={local.country || ''}
              onChange={(e) => setLocal((s) => ({ ...s, country: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Niche</label>
            <Input
              placeholder="e.g. Fitness"
              value={local.niche || ''}
              onChange={(e) => setLocal((s) => ({ ...s, niche: e.target.value }))}
            />
          </div>

          <div className="flex justify-between gap-2 mt-2">
            <Button variant="ghost" onClick={() => { setLocal({}); onClear(); }}>
              Clear
            </Button>
            <Button onClick={() => onApply(local)}>
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}