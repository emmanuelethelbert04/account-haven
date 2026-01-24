import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Platform } from '@/types/database';
import { Facebook, Music2, Instagram } from 'lucide-react';

interface PlatformBadgeProps {
  platform: Platform;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const platformConfig = {
  facebook: {
    label: 'Facebook',
    icon: Facebook,
    className: 'platform-facebook',
  },
  tiktok: {
    label: 'TikTok',
    icon: Music2,
    className: 'platform-tiktok',
  },
  instagram: {
    label: 'Instagram',
    icon: Instagram,
    className: 'platform-instagram',
  },
};

export function PlatformBadge({ platform, size = 'md', className }: PlatformBadgeProps) {
  const config = platformConfig[platform];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <Badge
      variant="default"
      className={cn(
        'border-0 font-medium',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      <Icon size={iconSizes[size]} className="mr-1" />
      {config.label}
    </Badge>
  );
}
