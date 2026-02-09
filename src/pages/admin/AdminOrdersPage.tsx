import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/StatusBadge';
import { PlatformBadge } from '@/components/PlatformBadge';
import { Eye, CheckCircle, XCircle, Package } from 'lucide-react';
import type { Order, Listing, OrderStatus } from '@/types/database';

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<(Order & { listing: Listing }) | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'deliver' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`*, listing:listings(*)`)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        // Special case: show submitted bank transfers for easier admin handling
        if (statusFilter === 'payment_submitted') {
          query = query.eq('status', statusFilter).eq('payment_method', 'bank_transfer').eq('payment_status', 'submitted');
        } else {
          query = query.eq('status', statusFilter);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Order & { listing: Listing })[];
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAction = async () => {
    if (!selectedOrder || !actionType) return;

    setIsSubmitting(true);

    try {
      let updateData: Record<string, unknown> = {};

      switch (actionType) {
        case 'approve':
          updateData = { status: 'approved' as OrderStatus, payment_status: 'paid' };
          break;
        case 'reject':
          updateData = { status: 'rejected' as OrderStatus, payment_status: 'rejected', rejection_reason: actionNote };
          break;
        case 'deliver':
          updateData = { status: 'delivered' as OrderStatus, admin_note: actionNote, delivery_status: 'delivered', delivered_at: new Date().toISOString(), delivery_note: actionNote };
          // Also mark listing as sold
          await supabase
            .from('listings')
            .update({ status: 'sold' } as Record<string, unknown>)
            .eq('id', selectedOrder.listing_id);
          break;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', selectedOrder.id);

      if (error) throw error;

      toast({ title: `Order ${actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'delivered'}` });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedOrder(null);
      setActionType(null);
      setActionNote('');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update order',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending_payment">Pending Payment</SelectItem>
            <SelectItem value="payment_submitted">Payment Submitted</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <code className="text-sm font-mono text-muted-foreground">{order.order_code}</code>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      {order.listing && <PlatformBadge platform={order.listing.platform} size="sm" />}
                      <span className="text-foreground font-medium">{order.listing?.title}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatDate(order.created_at)} • {formatPrice(order.amount)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setActionType(null);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    {order.status === 'payment_submitted' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setSelectedOrder(order);
                            setActionType('approve');
                          }}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedOrder(order);
                            setActionType('reject');
                          }}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}
                    {order.status === 'approved' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setActionType('deliver');
                        }}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Deliver
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No orders found.
          </CardContent>
        </Card>
      )}

      {/* View Order Dialog */}
      <Dialog open={!!selectedOrder && !actionType} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Order Code</span>
                <code className="font-mono">{selectedOrder.order_code}</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">{formatPrice(selectedOrder.amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Date</span>
                <span>{formatDate(selectedOrder.created_at)}</span>
              </div>
              {selectedOrder.note && (
                <div>
                  <span className="text-muted-foreground block mb-1">Customer Note</span>
                  <p className="text-sm">{selectedOrder.note}</p>
                </div>
              )}
              {selectedOrder.proof_url && (
                <div>
                  <span className="text-muted-foreground block mb-2">Payment Proof</span>
                  <img
                    src={selectedOrder.proof_url}
                    alt="Payment proof"
                    className="max-h-64 rounded-md border"
                  />
                </div>
              )}
              {selectedOrder.rejection_reason && (
                <div className="bg-destructive/10 p-3 rounded-md">
                  <span className="text-destructive font-medium block mb-1">Rejection Reason</span>
                  <p className="text-sm">{selectedOrder.rejection_reason}</p>
                </div>
              )}
              {selectedOrder.admin_note && (
                <div className="bg-status-delivered/10 p-3 rounded-md">
                  <span className="text-status-delivered font-medium block mb-1">Delivery Note</span>
                  <p className="text-sm whitespace-pre-wrap">{selectedOrder.admin_note}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={!!selectedOrder && !!actionType} onOpenChange={() => { setSelectedOrder(null); setActionType(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Payment'}
              {actionType === 'reject' && 'Reject Payment'}
              {actionType === 'deliver' && 'Mark as Delivered'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {actionType === 'reject' && (
              <div>
                <Label>Rejection Reason</Label>
                <Textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
            )}
            {actionType === 'deliver' && (
              <div>
                <Label>Delivery Note (Account credentials, etc.)</Label>
                <Textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Enter delivery details, login info, etc..."
                  rows={6}
                  required
                />
              </div>
            )}
            {actionType === 'approve' && (
              <p className="text-muted-foreground">
                Confirm that you have verified the payment and want to approve this order?
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setSelectedOrder(null); setActionType(null); }}>
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                disabled={isSubmitting || (actionType === 'reject' && !actionNote) || (actionType === 'deliver' && !actionNote)}
                variant={actionType === 'reject' ? 'destructive' : 'default'}
              >
                {isSubmitting ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
