import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PlatformBadge } from '@/components/PlatformBadge';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import type { Listing, Platform, ListingStatus } from '@/types/database';

export default function AdminListingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: listings, isLoading } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Listing[];
    },
  });

  const [form, setForm] = useState({
    platform: 'facebook' as Platform,
    title: '',
    price: '',
    followers_count: '',
    country: '',
    niche: '',
    account_age: '',
    description: '',
    status: 'available' as ListingStatus,
    featured: false,
  });

  const resetForm = () => {
    setForm({
      platform: 'facebook',
      title: '',
      price: '',
      followers_count: '',
      country: '',
      niche: '',
      account_age: '',
      description: '',
      status: 'available',
      featured: false,
    });
    setEditingListing(null);
  };

  const openEditDialog = (listing: Listing) => {
    setEditingListing(listing);
    setForm({
      platform: listing.platform,
      title: listing.title,
      price: listing.price.toString(),
      followers_count: listing.followers_count.toString(),
      country: listing.country || '',
      niche: listing.niche || '',
      account_age: listing.account_age || '',
      description: listing.description || '',
      status: listing.status,
      featured: listing.featured,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const listingData = {
        platform: form.platform,
        title: form.title,
        price: parseFloat(form.price),
        followers_count: parseInt(form.followers_count) || 0,
        country: form.country || null,
        niche: form.niche || null,
        account_age: form.account_age || null,
        description: form.description || null,
        status: form.status,
        featured: form.featured,
        images: [] as string[],
      };

      if (editingListing) {
        const { error } = await supabase
          .from('listings')
          .update(listingData as Record<string, unknown>)
          .eq('id', editingListing.id);

        if (error) throw error;
        toast({ title: 'Listing updated successfully' });
      } else {
        const { error } = await supabase
          .from('listings')
          .insert([listingData]);

        if (error) throw error;
        toast({ title: 'Listing created successfully' });
      }

      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      setIsDialogOpen(false);
      resetForm();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save listing',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleDelete = async (id: string) => {
  //   if (!confirm('Are you sure you want to delete this listing?')) return;

  //   try {
  //     const { error } = await supabase.from('listings').delete().eq('id', id);
  //     if (error) throw error;
      
  //     toast({ title: 'Listing deleted' });
  //     queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
  //   } catch (err: any) {
  //     toast({
  //       title: 'Error',
  //       description: err.message || 'Failed to delete listing',
  //       variant: 'destructive',
  //     });
  //   }
  // };


  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    const { data, error } = await supabase
      .from('listings')
      // .delete()
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      // .select(); // helps return details

    if (error) {
      console.log('DELETE ERROR:', error); // <-- check console
      toast({
        title: 'Error deleting listing',
        description: `${error.code || ''} ${error.message} ${error.details || ''}`.trim(),
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Listing deleted' });
    queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Listings</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingListing ? 'Edit Listing' : 'Add New Listing'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Platform</Label>
                  <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v as Platform })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ListingStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Premium Fashion Account"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (USD)</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <Label>Followers Count</Label>
                  <Input
                    type="number"
                    value={form.followers_count}
                    onChange={(e) => setForm({ ...form, followers_count: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Country</Label>
                  <Input
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="e.g., United States"
                  />
                </div>
                <div>
                  <Label>Account Age</Label>
                  <Input
                    value={form.account_age}
                    onChange={(e) => setForm({ ...form, account_age: e.target.value })}
                    placeholder="e.g., 2 years"
                  />
                </div>
              </div>

              <div>
                <Label>Niche</Label>
                <Input
                  value={form.niche}
                  onChange={(e) => setForm({ ...form, niche: e.target.value })}
                  placeholder="e.g., Fashion, Gaming, Tech"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the account..."
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={form.featured}
                  onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
                />
                <Label>Featured listing</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingListing ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : listings && listings.length > 0 ? (
        <div className="space-y-3">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <PlatformBadge platform={listing.platform} size="sm" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-foreground truncate">{listing.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatPrice(listing.price)}</span>
                        <span>•</span>
                        <span>{listing.followers_count.toLocaleString()} followers</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={listing.status === 'available' ? 'default' : 'secondary'}>
                        {listing.status}
                      </Badge>
                      {listing.featured && (
                        <Badge className="bg-yellow-500 text-white">Featured</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(listing)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(listing.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No listings yet. Click "Add Listing" to create your first one.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
