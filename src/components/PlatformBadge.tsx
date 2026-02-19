// import { Badge } from '@/components/ui/badge';
// import { cn } from '@/lib/utils';
// import type { Platform } from '@/types/database';
// import { Facebook, Music2, Instagram } from 'lucide-react';

// interface PlatformBadgeProps {
//   platform: Platform;
//   size?: 'sm' | 'md' | 'lg';
//   className?: string;
// }

// const platformConfig = {
//   facebook: {
//     label: 'Facebook',
//     icon: Facebook,
//     className: 'platform-facebook',
//   },
//   tiktok: {
//     label: 'TikTok',
//     icon: Music2,
//     className: 'platform-tiktok',
//   },
//   instagram: {
//     label: 'Instagram',
//     icon: Instagram,
//     className: 'platform-instagram',
//   },
// };

// export function PlatformBadge({ platform, size = 'md', className }: PlatformBadgeProps) {
//   const config = platformConfig[platform];
//   const Icon = config.icon;

//   const sizeClasses = {
//     sm: 'text-xs px-2 py-0.5',
//     md: 'text-sm px-2.5 py-1',
//     lg: 'text-base px-3 py-1.5',
//   };

//   const iconSizes = {
//     sm: 12,
//     md: 14,
//     lg: 16,
//   };

//   return (
//     <Badge
//       variant="default"
//       className={cn(
//         'border-0 font-medium',
//         config.className,
//         sizeClasses[size],
//         className
//       )}
//     >
//       <Icon size={iconSizes[size]} className="mr-1" />
//       {config.label}
//     </Badge>
//   );
// }


import { Badge } from "@/components/ui/badge";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Globe,
} from "lucide-react";

import TikTokIcon from "@/components/icon/TikTokIcon";

interface Props {
  platform?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export function PlatformBadge({ platform, size = 'md' }: Props) {
  const p = platform?.toLowerCase();

  let icon;
  let label;
  let color;

  switch (p) {
    case "facebook":
      icon = <Facebook className="w-4 h-4" />;
      label = "Facebook";
      color = "bg-blue-100 text-blue-700";
      break;

    case "instagram":
      icon = <Instagram className="w-4 h-4" />;
      label = "Instagram";
      color = "bg-pink-100 text-pink-700";
      break;

    case "tiktok":
      icon = <TikTokIcon className="w-4 h-4" />;
      label = "TikTok";
      color = "bg-gray-100 text-black";
      break;

    case "youtube":
      icon = <Youtube className="w-4 h-4" />;
      label = "YouTube";
      color = "bg-red-100 text-red-700";
      break;

    case "twitter":
    case "x":
      icon = <Twitter className="w-4 h-4" />;
      label = "X";
      color = "bg-gray-100 text-black";
      break;

    case "linkedin":
      icon = <Linkedin className="w-4 h-4" />;
      label = "LinkedIn";
      color = "bg-blue-100 text-blue-700";
      break;

    default:
      icon = <Globe className="w-4 h-4" />;
      label = platform || "Unknown";
      color = "bg-gray-100 text-gray-700";
  }

  return (
    <Badge className={`flex items-center gap-1 px-2 py-1 ${color}`}>
      {icon}
      {label}
    </Badge>
  );
}
