import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/database';
import { Clock, Upload, CheckCircle, XCircle, Package } from 'lucide-react';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending_payment: {
    label: 'Pending Payment',
    icon: Clock,
    className: 'bg-status-pending text-white border-0',
  },
  payment_submitted: {
    label: 'Payment Submitted',
    icon: Upload,
    className: 'bg-status-submitted text-white border-0',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    className: 'bg-status-approved text-white border-0',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-status-rejected text-white border-0',
  },
  delivered: {
    label: 'Delivered',
    icon: Package,
    className: 'bg-status-delivered text-white border-0',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={cn('font-medium', config.className, className)}>
      <Icon size={14} className="mr-1" />
      {config.label}
    </Badge>
  );
}
