import React from 'react';
import type { Platform } from '@/types/database';

type Props = {
  platform: Platform;
};

export default function MarketplaceHeader({ platform }: Props) {
  const label = platform[0].toUpperCase() + platform.slice(1);
  return (
    <div className="text-center">
      <h1 className="text-3xl font-semibold text-foreground">
        BUY {label.toUpperCase()} ACCOUNTS
      </h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
        Purchase verified {label} accounts for marketing, growth or management
        purposes. Listings are regularly refreshed and guaranteed to be
        available in stock.
      </p>
    </div>
  );
}
