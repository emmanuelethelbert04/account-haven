import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlatformBadge } from '@/components/PlatformBadge';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Calendar, Star } from 'lucide-react';
import type { Listing } from '@/types/database';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
  className?: string;
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const placeholderImage = `https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=300&fit=crop`;

  return (
    <Card className={cn(
      'group overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1',
      className
    )}>
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={listing.images?.[0] || placeholderImage}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <PlatformBadge platform={listing.platform} size="sm" />
          {listing.featured && (
            <Badge className="bg-yellow-500 text-white border-0">
              <Star size={12} className="mr-1 fill-current" />
              Featured
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1 mb-2">
          {listing.title}
        </h3>
        
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{formatFollowers(listing.followers_count)} followers</span>
          </div>
          {listing.country && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{listing.country}</span>
            </div>
          )}
          {listing.account_age && (
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{listing.account_age}</span>
            </div>
          )}
        </div>

        {listing.niche && (
          <Badge variant="secondary" className="mb-3 text-xs">
            {listing.niche}
          </Badge>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
          <span className="text-xl font-bold text-foreground">
            {formatPrice(listing.price)}
          </span>
          <Button asChild size="sm">
            <Link to={`/listing/${listing.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
