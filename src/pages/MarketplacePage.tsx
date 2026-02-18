import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal } from 'lucide-react';
import MarketplaceTabs from '@/components/marketplace/MarketplaceTabs';
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters';
import MarketplaceTableHeader from '@/components/marketplace/MarketplaceTableHeader';
import MarketplaceRow from '@/components/marketplace/MarketplaceRow';
import MarketplaceTable from '@/components/marketplace/MarketplaceTable';
import type { Listing, Platform } from '@/types/database';

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const platform = (searchParams.get('platform') as Platform) || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minFollowers = searchParams.get('minFollowers') || '';
  const maxFollowers = searchParams.get('maxFollowers') || '';
  const country = searchParams.get('country') || '';
  const niche = searchParams.get('niche') || '';

  const [localSearch, setLocalSearch] = useState(search);
  const [filtersOpen, setFiltersOpen] = useState(false);

  
  const [sortBy, setSortBy] = useState<'stock' | 'price' | null>(null);
  const [sortAsc, setSortAsc] = useState(true);


  useEffect(() => setLocalSearch(search), [search]);

  const updateParams = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== '') next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearAll = () => {
    setSearchParams({});
  };

  const { data: listings, isLoading } = useQuery({
    queryKey: ['listings', platform, sort, search, minPrice, maxPrice, minFollowers, maxFollowers, country, niche],
    queryFn: async () => {
      let q = supabase.from('listings').select('*').eq('status', 'available');

      if (platform && platform !== 'all') q = q.eq('platform', platform);
      if (minPrice) q = q.gte('price', parseFloat(minPrice));
      if (maxPrice) q = q.lte('price', parseFloat(maxPrice));
      if (minFollowers) q = q.gte('followers_count', parseInt(minFollowers, 10));
      if (maxFollowers) q = q.lte('followers_count', parseInt(maxFollowers, 10));
      if (country) q = q.ilike('country', `%${country}%`);
      // if (niche) q = q.ilike('niche', `%${niche}%`);
      if (search) q = q.or(
        `title.ilike.%${search}%,niche.ilike.%${search}%,country.ilike.%${search}%`
      );

      switch (sort) {
        case 'price-asc':
          q = q.order('price', { ascending: true });
          break;
        case 'price-desc':
          q = q.order('price', { ascending: false });
          break;
        case 'followers':
          q = q.order('followers_count', { ascending: false });
          break;
        default:
          q = q.order('created_at', { ascending: false });
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as Listing[];
    },
  });

  // const results = useMemo(() => listings || [], [listings]);

  const sorted = useMemo(() => {
    if (!listings) return [];
    if (!sortBy) return listings;
    const arr = [...listings];
    arr.sort((a, b) => {
      const aVal =
        sortBy === 'stock' ? a.stock_quantity ?? 0 : a.price_per_unit ?? a.price ?? 0;
      const bVal =
        sortBy === 'stock' ? b.stock_quantity ?? 0 : b.price_per_unit ?? b.price ?? 0;
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
    return arr;
  }, [listings, sortBy, sortAsc]);

  const handleSort = (field: 'stock' | 'price') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse verified social media accounts available for purchase.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search title, niche, country..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                updateParams('search', e.target.value || null);
              }}
              className="pl-10 pr-3"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <MarketplaceTabs
        value={platform}
        onChange={(v) => updateParams('platform', v === 'all' ? null : v)}
      />

      {/* Main container */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-white">
        <MarketplaceFilters
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          current={{
            minPrice,
            maxPrice,
            minFollowers,
            maxFollowers,
            country,
            niche,
          }}
          onApply={(vals) => {
            Object.entries(vals).forEach(([k, v]) => updateParams(k, v || null));
            setFiltersOpen(false);
          }}
          onClear={() => {
            ['minPrice', 'maxPrice', 'minFollowers', 'maxFollowers', 'country', 'niche'].forEach((k) =>
              updateParams(k, null)
            );
            setFiltersOpen(false);
          }}
        />

        {/* <div className="p-4">
          <MarketplaceTable
            listings={results}
            isLoading={isLoading}
            onClearFilters={clearAll}
          />
        </div> */}


         <div className="mt-6 overflow-x-auto">
        <table className="w-full">
          <MarketplaceTableHeader
            sortBy={sortBy}
            sortAsc={sortAsc}
            onSort={handleSort}
          />
          <tbody>
            {isLoading ? (
              <tr className="border-b border-gray-200">
                <td colSpan={3} className="px-4 py-8 text-center">
                  Loading listings...
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr className="border-b border-gray-200">
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No listings found.
                </td>
              </tr>
            ) : (
              sorted.map((l) => <MarketplaceRow key={l.id} listing={l} />)
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
