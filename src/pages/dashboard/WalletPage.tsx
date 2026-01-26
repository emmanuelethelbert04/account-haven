import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShoppingBag, 
  RefreshCw,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import type { UserWallet, WalletTransaction, BankSettings } from '@/types/database';

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showFundDialog, setShowFundDialog] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['user-wallet', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no wallet exists, create one
      if (!data) {
        const { data: newWallet, error: createError } = await supabase
          .from('user_wallets')
          .insert([{ user_id: user!.id, balance: 0, order_limit: 5, orders_used: 0 }])
          .select()
          .single();
        
        if (createError) throw createError;
        return newWallet as UserWallet;
      }
      
      return data as UserWallet;
    },
    enabled: !!user,
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['wallet-transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as WalletTransaction[];
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
        .maybeSingle();

      if (error) throw error;
      return data as BankSettings | null;
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-status-approved" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-destructive" />;
      case 'purchase':
        return <ShoppingBag className="h-4 w-4 text-primary" />;
      case 'refund':
        return <RefreshCw className="h-4 w-4 text-status-submitted" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-status-approved text-white"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  const handleFundWallet = async () => {
    if (!fundAmount || !wallet || !proofFile) {
      toast({
        title: 'Missing information',
        description: 'Please enter an amount and upload payment proof.',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload proof
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `wallet-${user!.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, proofFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // Create transaction
      const { error } = await supabase
        .from('wallet_transactions')
        .insert([{
          wallet_id: wallet.id,
          user_id: user!.id,
          amount,
          type: 'deposit',
          description: 'Wallet funding request',
          proof_url: urlData.publicUrl,
          status: 'pending',
        }]);

      if (error) throw error;

      toast({
        title: 'Request Submitted!',
        description: 'Your funding request is pending admin approval.',
      });

      setShowFundDialog(false);
      setFundAmount('');
      setProofFile(null);
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to submit funding request.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (walletLoading) {
    return (
      <div className="container py-6 sm:py-8 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-4 sm:gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 sm:py-8 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">My Wallet</h1>
      <p className="text-muted-foreground mb-6 sm:mb-8">Manage your funds and view transactions</p>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => setShowFundDialog(true)}
                className="text-xs sm:text-sm"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden xs:inline">Add</span> Funds
              </Button>
            </div>
            <p className="text-xs sm:text-sm opacity-80">Available Balance</p>
            <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(wallet?.balance || 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Order Limit</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {wallet?.orders_used || 0} / {wallet?.order_limit || 5}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Orders used this month</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-status-pending" />
              <span className="text-sm text-muted-foreground">Pending Deposits</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {transactions?.filter(t => t.type === 'deposit' && t.status === 'pending').length || 0}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Transaction History</CardTitle>
          <CardDescription>Your recent wallet activities</CardDescription>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border border-border bg-background"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-muted">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground capitalize text-sm sm:text-base truncate">
                        {tx.type}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {tx.description || formatDate(tx.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                    {getStatusBadge(tx.status)}
                    <span className={`font-semibold text-sm sm:text-base whitespace-nowrap ${
                      tx.type === 'deposit' || tx.type === 'refund' 
                        ? 'text-status-approved' 
                        : 'text-foreground'
                    }`}>
                      {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <Wallet className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Transactions Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Fund your wallet to start making purchases
              </p>
              <Button onClick={() => setShowFundDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Funds
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fund Wallet Dialog */}
      <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
        <DialogContent className="sm:max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Fund Your Wallet</DialogTitle>
            <DialogDescription>
              Transfer funds to the bank account below and upload your payment proof.
            </DialogDescription>
          </DialogHeader>
          
          {bankSettings && (
            <div className="bg-muted rounded-lg p-3 sm:p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank:</span>
                <span className="font-medium">{bankSettings.bank_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account:</span>
                <span className="font-mono font-medium text-xs sm:text-sm">{bankSettings.account_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-xs sm:text-sm">{bankSettings.account_name}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proof">Payment Proof</Label>
              <Input
                id="proof"
                type="file"
                accept="image/*"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                Upload a screenshot of your payment confirmation
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowFundDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleFundWallet} 
              disabled={!fundAmount || !proofFile || isSubmitting}
              className="w-full sm:w-auto"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
