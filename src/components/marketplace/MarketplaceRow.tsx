import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Star, Globe } from 'lucide-react';
import TikTokIcon from '@/components/icon/TikTokIcon';
import type { Listing } from '@/types/database';

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'facebook':
      return <Facebook className="h-6 w-6 text-blue-600" />;
    case 'instagram':
      return <Instagram className="h-6 w-6 text-pink-500" />;
    case 'tiktok':
      return <TikTokIcon className="h-6 w-6 text-gray-800 dark:text-gray-200" />;
    default:
      // fallback icon for unknown platforms
      return <Globe className="h-6 w-6 text-gray-400" />;
  }
}

type Props = {
  listing: Listing;
};

export default function MarketplaceRow({ listing }: Props) {
  const price = listing.price_per_unit ?? listing.price ?? 0;

  // badges
  const badges = [];
  if (listing.delivery_time) badges.push(listing.delivery_time);
  if (listing.rating != null) badges.push(`${listing.rating.toFixed(1)} ⭐`);
  if (listing.success_rate != null) badges.push(`${listing.success_rate}% success`);
  if (listing.orders_count != null) badges.push(`${listing.orders_count} orders`);

  return (
    <>
      {/* Desktop horizontal row */}
      <tr className="hidden sm:table-row border-b border-border hover:bg-muted/50">
        <td className="px-4 py-4 align-top">
          <div className="flex items-start gap-3">
            <PlatformIcon platform={listing.platform} />
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">
                {listing.title}
              </div>
              {listing.description && (
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {listing.description}
                </div>
              )}
              {badges.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1 text-xs text-muted-foreground">
                  {badges.map((b, i) => (
                    <span key={i} className="px-2 py-1 bg-muted rounded">
                      {b}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </td>

        {/* <td className="px-4 py-4 align-top text-center">
          <div className="text-sm font-medium">
            {listing.stock_quantity ?? 0} pcs.
          </div>
        </td> */}

        <td className="px-4 py-4 align-top text-right">
          <div className="text-sm font-semibold">
            #{price.toFixed(2)}
          </div>
          {listing.minimum_price != null && (
            <div className="text-xs text-muted-foreground">
              from #{listing.minimum_price.toFixed(2)}
            </div>
          )}
          <div className="mt-2">
            <Link to={`/listing/${listing.id}`}>
              <button className="text-sm bg-emerald-500 text-white px-4 py-1 rounded hover:bg-emerald-600">
                Buy
              </button>
            </Link>
          </div>
        </td>
      </tr>

      {/* Mobile stacked card-like row */}
      {/* <div className="sm:hidden border-b border-gray-200 py-4 hover:bg-gray-50">
        <div className="flex items-center gap-3">
          <PlatformIcon platform={listing.platform} />
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">
              {listing.title}
            </div>
            {listing.description && (
              <div className="text-xs text-muted-foreground mt-1">
                {listing.description}
              </div>
            )}
          </div>
        </div>
        {badges.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 text-xs text-muted-foreground">
            {badges.map((b, i) => (
              <span key={i} className="px-2 py-1 bg-gray-100 rounded">
                {b}
              </span>
            ))}
          </div>
        )}
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span>{listing.stock_quantity ?? 0} pcs.</span>
            <span>${price.toFixed(2)}</span>
          </div>
          {listing.minimum_price != null && (
            <div className="text-xs text-muted-foreground">
              from ${listing.minimum_price.toFixed(2)}
            </div>
          )}
          <Link to={`/listing/${listing.id}`}> 
            <button className="w-full text-sm bg-emerald-500 text-white py-2 rounded hover:bg-emerald-600">
              Buy
            </button>
          </Link>
        </div>
      </div> */}

    {/* Mobile card layout - similar to screenshot */}
    <div className="sm:hidden border border-border rounded-lg p-4 mb-4 hover:shadow-md transition-shadow w-full bg-card">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
      <PlatformIcon platform={listing.platform} />
        </div>
        <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-sm text-foreground">
        {listing.title}
      </h3>
      {listing.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {listing.description}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {badges.map((b, i) => (
          <span key={i} className="inline-flex items-center gap-1">
        {b}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">
        #{price.toFixed(2)}
          </div>
          {/* <div className="text-xs text-muted-foreground">
        {listing.stock_quantity ?? 0} pcs.
          </div> */}
        </div>
        <Link to={`/listing/${listing.id}`}>
          <button className="bg-emerald-500 text-white text-sm px-6 py-2 rounded hover:bg-emerald-600">
        Buy
          </button>
        </Link>
      </div>
        </div>
      </div>
    </div>
    </>
  );
}
