import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ListingCard } from '@/components/ListingCard';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import type { Listing } from '@/types/database';

export function FeaturedListingsSection() {
  const { data: featuredListings, isLoading } = useQuery({
    queryKey: ['featured-listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'available')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as Listing[];
    },
  });

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary/60 mb-2">Marketplace</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Featured Accounts</h2>
          </div>
          <Button variant="outline" asChild className="rounded-full">
            <Link to="/marketplace">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[350px] rounded-2xl" />
            ))}
          </div>
        ) : featuredListings && featuredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-border bg-card">
            <p className="text-muted-foreground mb-4">No featured listings available yet. Check back soon!</p>
            <Button asChild>
              <Link to="/marketplace">Browse All Listings</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
