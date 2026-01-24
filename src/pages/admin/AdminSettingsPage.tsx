import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import type { BankSettings } from '@/types/database';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    bank_name: '',
    account_number: '',
    account_name: '',
    instructions: '',
  });

  const { data: settings, isLoading } = useQuery({
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

  useEffect(() => {
    if (settings) {
      setForm({
        bank_name: settings.bank_name,
        account_number: settings.account_number,
        account_name: settings.account_name,
        instructions: settings.instructions,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (settings) {
        // Update existing
        const { error } = await supabase
          .from('bank_settings')
          .update({
            bank_name: form.bank_name,
            account_number: form.account_number,
            account_name: form.account_name,
            instructions: form.instructions,
          } as Record<string, unknown>)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('bank_settings')
          .insert([{
            bank_name: form.bank_name,
            account_number: form.account_number,
            account_name: form.account_name,
            instructions: form.instructions,
          }]);

        if (error) throw error;
      }

      toast({ title: 'Bank settings saved successfully' });
      queryClient.invalidateQueries({ queryKey: ['bank-settings'] });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Bank Transfer Settings</CardTitle>
          <CardDescription>
            Configure the bank account details shown to customers for payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input
                id="bank_name"
                value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                placeholder="e.g., Bank of America"
                required
              />
            </div>

            <div>
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                value={form.account_number}
                onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                placeholder="e.g., 1234567890"
                required
              />
            </div>

            <div>
              <Label htmlFor="account_name">Account Name</Label>
              <Input
                id="account_name"
                value={form.account_name}
                onChange={(e) => setForm({ ...form, account_name: e.target.value })}
                placeholder="e.g., SocialMarket LLC"
                required
              />
            </div>

            <div>
              <Label htmlFor="instructions">Payment Instructions</Label>
              <Textarea
                id="instructions"
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                placeholder="Additional instructions for customers when making payment..."
                rows={4}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Customers will be asked to use their order code as the payment reference.
              </p>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
