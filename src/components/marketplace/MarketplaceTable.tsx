import React from 'react';
import MarketplaceRow from './MarketplaceRow';
import type { Listing } from '@/types/database';
import { Button } from '@/components/ui/button';

type Props = {
  listings: Listing[];
  isLoading: boolean;
  onClearFilters: () => void;
};

export default function MarketplaceTable({ listings, isLoading, onClearFilters }: Props) {
  return (
    <div>
      <div className="hidden sm:block">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50 text-left text-sm text-muted-foreground">
            <tr>
              <th className="px-4 py-3 w-[14%]">Platform</th>
              <th className="px-4 py-3 w-[28%]">Account</th>
              <th className="px-4 py-3 w-[12%]">Followers</th>
              {/* <th className="px-4 py-3 w-[12%]">Niche</th> */}
              <th className="px-4 py-3 w-[12%]">Country</th>
              <th className="px-4 py-3 w-[12%] text-right">Price</th>
              <th className="px-4 py-3 w-[10%]" />
            </tr>
          </thead>

          <tbody className="text-sm">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td colSpan={7} className="px-4 py-6">
                    <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                  </td>
                </tr>
              ))
            ) : listings.length > 0 ? (
              listings.map((l) => <MarketplaceRow key={l.id} listing={l} />)
            ) : (
              <tr className="border-b border-gray-100">
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No listings found.
                  <div className="mt-3 flex justify-center">
                    <Button variant="ghost" onClick={onClearFilters}>Clear filters</Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked list */}
      <div className="sm:hidden">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="border-b border-gray-100 py-4">
              <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
            </div>
          ))
        ) : listings.length > 0 ? (
          listings.map((l) => <MarketplaceRow key={l.id} listing={l} />)
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No listings found.
            <div className="mt-3">
              <Button variant="ghost" onClick={onClearFilters}>Clear filters</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}