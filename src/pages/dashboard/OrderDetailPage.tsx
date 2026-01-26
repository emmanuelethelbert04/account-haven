import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { PlatformBadge } from '@/components/PlatformBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, Copy, CheckCircle, AlertCircle, Package, Wallet } from 'lucide-react';
import type { Order, Listing, BankSettings, UserWallet } from '@/types/database';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [note, setNote] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, listing:listings(*)`)
        .eq('id', id)
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      return data as Order & { listing: Listing };
    },
    enabled: !!id && !!user,
  });

  const { data: wallet } = useQuery({
    queryKey: ['user-wallet', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserWallet | null;
    },
    enabled: !!user,
  });

  const { data: bankSettings } = useQuery({
    queryKey: ['bank-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return data as BankSettings;
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  const handleSubmitPayment = async () => {
    if (!proofFile || !order) return;

    setIsUploading(true);

    try {
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${user!.id}/${order.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, proofFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          proof_url: urlData.publicUrl,
          note: note || null,
          status: 'payment_submitted',
        } as Record<string, unknown>)
        .eq('id', order.id);

      if (updateError) throw updateError;

      toast({
        title: 'Payment Proof Submitted!',
        description: 'Your payment is now pending admin review.',
      });

      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to submit payment proof.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (orderLoading) {
    return (
      <div className="container py-6 sm:py-8 max-w-3xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="space-y-4 sm:space-y-6">
          <Skeleton className="h-40 sm:h-48 rounded-lg" />
          <Skeleton className="h-56 sm:h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-12 sm:py-16 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Order Not Found</h1>
        <Button onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const showPaymentForm = order.status === 'pending_payment' || order.status === 'payment_submitted';

  return (
    <div className="container py-6 sm:py-8 max-w-3xl">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4 sm:mb-6 -ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>

      {/* Order Header */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Order Code</p>
              <div className="flex items-center gap-2">
                <code className="text-base sm:text-lg font-mono font-semibold text-foreground">
                  {order.order_code}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onClick={() => copyToClipboard(order.order_code, 'Order code')}
                >
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {order.listing && <PlatformBadge platform={order.listing.platform} />}
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-foreground text-sm sm:text-base truncate">{order.listing?.title}</h2>
                <p className="text-xl sm:text-2xl font-bold text-primary">{formatPrice(order.amount)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Balance Info */}
      {wallet && showPaymentForm && (
        <Card className="mb-4 sm:mb-6 bg-muted/50">
          <CardContent className="py-3 sm:py-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="text-xs sm:text-sm text-muted-foreground">Wallet Balance:</span>
                <span className="font-semibold text-sm sm:text-base">{formatPrice(wallet.balance)}</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/wallet">Add Funds</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Timeline */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            <StatusStep
              completed={true}
              active={order.status === 'pending_payment'}
              icon={<CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
              title="Order Created"
              description="Your order has been placed"
            />
            <StatusStep
              completed={order.status !== 'pending_payment'}
              active={order.status === 'payment_submitted'}
              icon={<Upload className="h-4 w-4 sm:h-5 sm:w-5" />}
              title="Payment Submitted"
              description="Payment proof uploaded for review"
            />
            <StatusStep
              completed={order.status === 'approved' || order.status === 'delivered'}
              active={order.status === 'approved'}
              icon={<CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
              title="Payment Approved"
              description="Admin has verified your payment"
              error={order.status === 'rejected'}
              errorMessage={order.rejection_reason}
            />
            <StatusStep
              completed={order.status === 'delivered'}
              active={order.status === 'delivered'}
              icon={<Package className="h-4 w-4 sm:h-5 sm:w-5" />}
              title="Account Delivered"
              description="Your account has been delivered"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      {showPaymentForm && bankSettings && (
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Payment Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="bg-muted rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-xs sm:text-sm text-muted-foreground">Bank Name</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm sm:text-base">{bankSettings.bank_name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(bankSettings.bank_name, 'Bank name')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-xs sm:text-sm text-muted-foreground">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-sm sm:text-base">{bankSettings.account_number}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(bankSettings.account_number, 'Account number')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-xs sm:text-sm text-muted-foreground">Account Name</span>
                <span className="font-medium text-sm sm:text-base">{bankSettings.account_name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-xs sm:text-sm text-muted-foreground">Amount</span>
                <span className="font-bold text-base sm:text-lg text-primary">{formatPrice(order.amount)}</span>
              </div>
              <div className="border-t border-border pt-2 sm:pt-3">
                <span className="text-xs sm:text-sm text-muted-foreground block mb-1">Reference/Narration</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-primary font-semibold text-sm sm:text-base">{order.order_code}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(order.order_code, 'Reference')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {bankSettings.instructions && (
              <p className="text-xs sm:text-sm text-muted-foreground">{bankSettings.instructions}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Payment Proof */}
      {showPaymentForm && (
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">
              {order.status === 'payment_submitted' ? 'Update Payment Proof' : 'Upload Payment Proof'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {order.proof_url && (
              <div className="bg-muted rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Current proof:</p>
                <img
                  src={order.proof_url}
                  alt="Payment proof"
                  className="max-h-40 sm:max-h-48 rounded-md"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="proof" className="text-sm">Payment Screenshot</Label>
              <Input
                id="proof"
                type="file"
                accept="image/*"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="note" className="text-sm">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Any additional information..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleSubmitPayment}
              disabled={!proofFile || isUploading}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 'Submit Payment Proof'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Rejection Message */}
      {order.status === 'rejected' && order.rejection_reason && (
        <Card className="mb-4 sm:mb-6 border-destructive">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Payment Rejected</h3>
                <p className="text-muted-foreground text-sm">{order.rejection_reason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Note */}
      {order.status === 'delivered' && order.admin_note && (
        <Card className="mb-4 sm:mb-6 border-status-delivered">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-start gap-3">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-status-delivered flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Delivery Details</h3>
                <p className="text-muted-foreground whitespace-pre-wrap text-sm">{order.admin_note}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusStep({
  completed,
  active,
  icon,
  title,
  description,
  error,
  errorMessage,
}: {
  completed: boolean;
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  error?: boolean;
  errorMessage?: string | null;
}) {
  return (
    <div className="flex items-start gap-2 sm:gap-3">
      <div
        className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
          error
            ? 'bg-destructive text-destructive-foreground'
            : completed
            ? 'bg-status-approved text-white'
            : active
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`font-medium text-sm sm:text-base ${completed || active ? 'text-foreground' : 'text-muted-foreground'}`}>
          {title}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
        {error && errorMessage && (
          <p className="text-xs sm:text-sm text-destructive mt-1">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
