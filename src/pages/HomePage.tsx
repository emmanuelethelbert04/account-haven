import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ListingCard } from '@/components/ListingCard';
import { PlatformBadge } from '@/components/PlatformBadge';
import { ArrowRight, Shield, Zap, Headphones, Facebook, Instagram, Music2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Listing, Platform } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
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

  const platforms: { platform: Platform; icon: typeof Facebook; count: string; description: string }[] = [
    { platform: 'facebook', icon: Facebook, count: '500+', description: 'Verified Facebook accounts with real followers' },
    { platform: 'tiktok', icon: Music2, count: '300+', description: 'TikTok accounts ready for viral content' },
    { platform: 'instagram', icon: Instagram, count: '400+', description: 'Instagram profiles with engaged audiences' },
  ];

  const features = [
    { icon: Shield, title: 'Secure Transactions', description: 'All payments verified before account transfer' },
    { icon: Zap, title: 'Fast Delivery', description: 'Get your account within 24 hours of approval' },
    { icon: Headphones, title: '24/7 Support', description: 'Dedicated support for any issues' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10 py-20 lg:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground mb-6">
              Buy Verified{' '}
              <span className="bg-gradient-to-r from-facebook via-instagram to-tiktok bg-clip-text text-transparent">
                Social Accounts
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              The trusted marketplace for buying premium social media accounts. 
              Verified sellers, secure payments, and instant delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base">
                <Link to="/marketplace">
                  Browse Marketplace
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-base">
                <Link to="/auth/register">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Categories */}
      <section className="py-16 bg-card">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-10 text-foreground">
            Browse by Platform
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platforms.map(({ platform, icon: Icon, count, description }) => (
              <Link
                key={platform}
                to={`/marketplace?platform=${platform}`}
                className="group p-6 rounded-xl border border-border bg-background hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${
                    platform === 'facebook' ? 'bg-facebook/10' :
                    platform === 'tiktok' ? 'bg-tiktok/10' : 'bg-instagram/10'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      platform === 'facebook' ? 'text-facebook' :
                      platform === 'tiktok' ? 'text-tiktok' : 'text-instagram'
                    }`} />
                  </div>
                  <div>
                    <PlatformBadge platform={platform} size="sm" />
                    <p className="text-sm text-muted-foreground mt-1">{count} listings</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Featured Accounts</h2>
            <Button variant="ghost" asChild>
              <Link to="/marketplace">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[350px] rounded-lg" />
              ))}
            </div>
          ) : featuredListings && featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No featured listings available. Check back soon!</p>
              <Button asChild className="mt-4">
                <Link to="/marketplace">Browse All Listings</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-card">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-10 text-foreground">
            Why Choose SocialMarket?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center">
                <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of satisfied customers who have purchased verified social media accounts.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/marketplace">
              Browse Marketplace
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
