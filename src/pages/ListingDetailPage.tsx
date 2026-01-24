import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlatformBadge } from '@/components/PlatformBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Users, MapPin, Calendar, Star, ArrowLeft, ShoppingCart } from 'lucide-react';
import type { Listing } from '@/types/database';
import { useState } from 'react';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOrdering, setIsOrdering] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .eq('status', 'available')
        .single();

      if (error) throw error;
      return data as Listing;
    },
    enabled: !!id,
  });

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const generateOrderCode = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SMA-${dateStr}-${random}`;
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to purchase this account.',
        variant: 'destructive',
      });
      navigate('/auth/login', { state: { from: { pathname: `/listing/${id}` } } });
      return;
    }

    if (!listing) return;

    setIsOrdering(true);

    try {
      const orderCode = generateOrderCode();

      const { data: orderData, error } = await supabase
        .from('orders')
        .insert({
          order_code: orderCode,
          user_id: user.id,
          listing_id: listing.id,
          amount: listing.price,
          status: 'pending_payment' as const,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Order Created!',
        description: 'Please complete your payment to proceed.',
      });

      navigate(`/dashboard/orders/${orderData.id}`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsOrdering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-[4/3] rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Listing Not Found</h1>
        <p className="text-muted-foreground mb-6">
          This listing may have been sold or removed.
        </p>
        <Button onClick={() => navigate('/marketplace')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const images = listing.images?.length > 0 ? listing.images : [
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=600&fit=crop'
  ];

  return (
    <div className="container py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
            <img
              src={images[selectedImage]}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <PlatformBadge platform={listing.platform} />
              {listing.featured && (
                <Badge className="bg-yellow-500 text-white border-0">
                  <Star size={12} className="mr-1 fill-current" />
                  Featured
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{listing.title}</h1>
            <p className="text-3xl font-bold text-primary">{formatPrice(listing.price)}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{formatFollowers(listing.followers_count)} followers</span>
            </div>
            {listing.country && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{listing.country}</span>
              </div>
            )}
            {listing.account_age && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{listing.account_age} old</span>
              </div>
            )}
          </div>

          {listing.niche && (
            <div>
              <span className="text-sm font-medium text-foreground">Niche:</span>
              <Badge variant="secondary" className="ml-2">{listing.niche}</Badge>
            </div>
          )}

          {listing.description && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {listing.description}
                </p>
              </CardContent>
            </Card>
          )}

          <Button
            size="lg"
            className="w-full text-lg"
            onClick={handleBuyNow}
            disabled={isOrdering}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {isOrdering ? 'Creating Order...' : 'Buy Now'}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Secure payment via bank transfer. Account delivered after payment verification.
          </p>
        </div>
      </div>
    </div>
  );
}
