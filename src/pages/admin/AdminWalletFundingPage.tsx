import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  DollarSign,
  Search,
  Filter,
} from 'lucide-react';
import type { WalletTransaction, UserWallet } from '@/types/database';

interface TransactionWithProfile extends WalletTransaction {
  profile?: {
    email: string;
  };
  wallet?: UserWallet;
}

export default function AdminWalletFundingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithProfile | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch all wallet transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['admin-wallet-transactions', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('wallet_transactions')
        .select(`
          *,
          profile:profiles!wallet_transactions_user_id_profiles_fkey ( email ),
          wallet:user_wallets!wallet_transactions_wallet_id_fkey ( * )
        `)

        .eq('type', 'deposit')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
     
      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      console.log("first row sample:", data?.[0]);

      return (data || []) as TransactionWithProfile[];
    },
  });

  // Fetch wallet stats
  const { data: stats } = useQuery({
    queryKey: ['wallet-funding-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('status, amount')
        .eq('type', 'deposit');

      if (error) throw error;

      const stats = {
        totalPending: 0,
        totalApproved: 0,
        pendingAmount: 0,
        approvedAmount: 0,
        totalRequests: data?.length || 0,
      };

      data?.forEach((tx) => {
        if (tx.status === 'pending') {
          stats.totalPending++;
          stats.pendingAmount += tx.amount;
        } else if (tx.status === 'approved') {
          stats.totalApproved++;
          stats.approvedAmount += tx.amount;
        }
      });

      return stats;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500/20 text-green-700 border-green-500">
            <CheckCircle className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-700 border-red-500">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  const handleApproveTransaction = async () => {
    if (!selectedTransaction) return;

    setProcessingId(selectedTransaction.id);

    try {
      // Update transaction status
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .update({ status: 'approved' })
        .eq('id', selectedTransaction.id);

      if (txError) throw txError;

      // Update wallet balance
      const { error: walletError } = await supabase
        .from('user_wallets')
        .update({
          balance: (selectedTransaction.wallet?.balance || 0) + selectedTransaction.amount,
        })
        .eq('id', selectedTransaction.wallet_id);

      if (walletError) throw walletError;

      toast({
        title: 'Success',
        description: `Deposit of ${formatCurrency(selectedTransaction.amount)} approved!`,
      });

      setApprovalDialogOpen(false);
      setSelectedTransaction(null);
      queryClient.invalidateQueries({ queryKey: ['admin-wallet-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-funding-stats'] });
    } catch (err: any) {
      console.error('Error approving transaction:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to approve transaction.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectTransaction = async () => {
    if (!selectedTransaction) return;

    setProcessingId(selectedTransaction.id);

    try {
      const { error } = await supabase
        .from('wallet_transactions')
        .update({
          status: 'rejected',
          description: rejectionReason ? `Rejected: ${rejectionReason}` : selectedTransaction.description,
        })
        .eq('id', selectedTransaction.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Deposit request rejected.',
      });

      setRejectionDialogOpen(false);
      setSelectedTransaction(null);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-wallet-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-funding-stats'] });
    } catch (err: any) {
      console.error('Error rejecting transaction:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to reject transaction.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTransactions = transactions?.filter((tx) => {
    const matchesSearch =
      tx.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Wallet Funding Approvals</h1>
        <p className="text-muted-foreground">Manage and approve user wallet funding requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500 opacity-80" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{stats?.totalPending || 0}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(stats?.pendingAmount || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500 opacity-80" />
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats?.totalApproved || 0}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(stats?.approvedAmount || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-blue-500 opacity-80" />
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{stats?.totalRequests || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-purple-500 opacity-80" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency((stats?.pendingAmount || 0) + (stats?.approvedAmount || 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className="text-xs sm:text-sm"
              >
                <Filter className="h-4 w-4 mr-1" />
                All
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                className="text-xs sm:text-sm"
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('approved')}
                className="text-xs sm:text-sm"
              >
                Approved
              </Button>
              <Button
                variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('rejected')}
                className="text-xs sm:text-sm"
              >
                Rejected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Funding Requests</CardTitle>
          <CardDescription>Review and manage wallet funding requests</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">User Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-muted/50 transition">
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{tx.profile?.email || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">{tx.id.substring(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">{formatCurrency(tx.amount)}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{formatDate(tx.created_at)}</td>
                      <td className="py-3 px-4">{getStatusBadge(tx.status)}</td>
                      <td className="py-3 px-4 text-right">
                        {tx.status === 'pending' ? (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTransaction(tx);
                                setApprovalDialogOpen(true);
                              }}
                              disabled={processingId === tx.id}
                              className="text-xs"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedTransaction(tx);
                                setRejectionDialogOpen(true);
                              }}
                              disabled={processingId === tx.id}
                              className="text-xs"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedTransaction(tx);
                            }}
                            className="text-xs"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No funding requests found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try adjusting your search filters' : 'All requests have been processed'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="sm:max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Approve Deposit Request</DialogTitle>
            <DialogDescription>
              Review and approve this wallet funding request
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">User Email:</span>
                  <span className="font-medium text-foreground">{selectedTransaction.profile?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(selectedTransaction.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date Requested:</span>
                  <span className="text-sm text-foreground">{formatDate(selectedTransaction.created_at)}</span>
                </div>
                {selectedTransaction.proof_url && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Proof:</span>
                    <a
                      href={selectedTransaction.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      View Image
                    </a>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                This will add {formatCurrency(selectedTransaction.amount)} to the user's wallet balance.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovalDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproveTransaction}
              disabled={processingId !== null}
              className="w-full sm:w-auto"
            >
              {processingId ? 'Processing...' : 'Approve Deposit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <AlertDialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <AlertDialogContent className="sm:max-w-md mx-4 sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Deposit Request</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a reason for rejecting this request (optional)
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Amount:</p>
                <p className="text-xl font-bold">{formatCurrency(selectedTransaction.amount)}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason (Optional)</Label>
                <textarea
                  id="reason"
                  placeholder="Enter reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                  rows={3}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="sm:w-auto w-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectTransaction}
              disabled={processingId !== null}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground sm:w-auto w-full"
            >
              {processingId ? 'Processing...' : 'Reject Request'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
