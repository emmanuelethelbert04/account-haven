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
  AlertCircle,
  MessageSquare,
  Search,
  Filter,
  User,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import type { SupportTicket } from '@/types/database';

export default function AdminSupportTicketsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [newStatus, setNewStatus] = useState<SupportTicket['status']>('open');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch all support tickets
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['admin-support-tickets', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tickets:', error);
        throw error;
      }

      return (data || []) as SupportTicket[];
    },
  });

  // Fetch ticket stats
  const { data: stats } = useQuery({
    queryKey: ['support-tickets-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('status');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
      };

      data?.forEach((ticket) => {
        switch (ticket.status) {
          case 'open':
            stats.open++;
            break;
          case 'in_progress':
            stats.inProgress++;
            break;
          case 'resolved':
            stats.resolved++;
            break;
          case 'closed':
            stats.closed++;
            break;
        }
      });

      return stats;
    },
  });

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
      case 'open':
        return (
          <Badge className="bg-red-500/20 text-red-700 border-red-500">
            <AlertCircle className="h-3 w-3 mr-1" /> Open
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500">
            <Clock className="h-3 w-3 mr-1" /> In Progress
          </Badge>
        );
      case 'resolved':
        return (
          <Badge className="bg-blue-500/20 text-blue-700 border-blue-500">
            <CheckCircle className="h-3 w-3 mr-1" /> Resolved
          </Badge>
        );
      case 'closed':
        return (
          <Badge className="bg-gray-500/20 text-gray-700 border-gray-500">
            <CheckCircle className="h-3 w-3 mr-1" /> Closed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityColor = (subject: string) => {
    const lowerSubject = subject.toLowerCase();
    if (lowerSubject.includes('urgent') || lowerSubject.includes('critical') || lowerSubject.includes('important')) {
      return 'text-red-500';
    }
    if (lowerSubject.includes('payment') || lowerSubject.includes('order') || lowerSubject.includes('account')) {
      return 'text-orange-500';
    }
    return 'text-blue-500';
  };

  const handleUpdateTicket = async (status: SupportTicket['status'], response?: string) => {
    if (!selectedTicket) return;

    setProcessingId(selectedTicket.id);

    try {
      const updateData: any = { status };
      if (response) {
        updateData.admin_response = response;
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', selectedTicket.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Ticket updated successfully.',
      });

      setDetailsDialogOpen(false);
      setResponseDialogOpen(false);
      setSelectedTicket(null);
      setResponseText('');
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets-stats'] });
    } catch (err: any) {
      console.error('Error updating ticket:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update ticket.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTickets = tickets?.filter((ticket) => {
    const matchesSearch =
      ticket.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const created = new Date(dateStr);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return formatDate(dateStr);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Support Tickets</h1>
        <p className="text-muted-foreground">Manage and respond to user support requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm text-muted-foreground">Total Tickets</p>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="text-2xl font-bold text-red-600">{stats?.open || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{stats?.inProgress || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.resolved || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-gray-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm text-muted-foreground">Closed</p>
              <p className="text-2xl font-bold text-gray-600">{stats?.closed || 0}</p>
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
                  placeholder="Search by email, name, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className="text-xs sm:text-sm"
              >
                <Filter className="h-4 w-4 mr-1" />
                All
              </Button>
              <Button
                variant={filterStatus === 'open' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('open')}
                className="text-xs sm:text-sm"
              >
                Open
              </Button>
              <Button
                variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('in_progress')}
                className="text-xs sm:text-sm"
              >
                In Progress
              </Button>
              <Button
                variant={filterStatus === 'resolved' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('resolved')}
                className="text-xs sm:text-sm"
              >
                Resolved
              </Button>
              <Button
                variant={filterStatus === 'closed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('closed')}
                className="text-xs sm:text-sm"
              >
                Closed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>View and manage all support tickets</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : filteredTickets && filteredTickets.length > 0 ? (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition cursor-pointer"
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setNewStatus(ticket.status);
                    setResponseText(ticket.admin_response || '');
                    setDetailsDialogOpen(true);
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className={`font-semibold text-base truncate ${getPriorityColor(ticket.subject)}`}>
                          {ticket.subject}
                        </h4>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{ticket.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{ticket.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {getTimeAgo(ticket.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No support tickets found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try adjusting your search filters' : 'All tickets have been resolved'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-2xl mx-4 sm:mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogDescription>{selectedTicket?.id}</DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              {/* Header Info */}
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Subject</p>
                    <p className="font-semibold text-foreground">{selectedTicket.subject}</p>
                  </div>
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">User Name</p>
                  <p className="font-medium text-foreground">{selectedTicket.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium text-foreground break-all">{selectedTicket.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <p className="text-sm text-foreground">{formatDate(selectedTicket.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Updated</p>
                  <p className="text-sm text-foreground">{formatDate(selectedTicket.updated_at)}</p>
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Message</p>
                <div className="bg-background border border-border rounded-lg p-4 text-foreground whitespace-pre-wrap break-words">
                  {selectedTicket.message}
                </div>
              </div>

              {/* Admin Response */}
              {selectedTicket.admin_response && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Admin Response</p>
                  <div className="bg-background border border-border rounded-lg p-4 text-foreground whitespace-pre-wrap break-words">
                    {selectedTicket.admin_response}
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div>
                <Label htmlFor="status" className="mb-2 block">
                  Update Status
                </Label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as SupportTicket['status'])}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Response */}
              <div>
                <Label htmlFor="response" className="mb-2 block">
                  Admin Response (Optional)
                </Label>
                <textarea
                  id="response"
                  placeholder="Type your response here..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (responseText) {
                  handleUpdateTicket(newStatus, responseText);
                } else {
                  handleUpdateTicket(newStatus);
                }
              }}
              disabled={processingId !== null}
              className="w-full sm:w-auto"
            >
              {processingId ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
