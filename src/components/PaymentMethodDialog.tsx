import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingPrice: number;
  onConfirm: (method: 'wallet' | 'bank_transfer') => Promise<void> | void;
}

export function PaymentMethodDialog({
  open,
  onOpenChange,
  listingPrice,
  onConfirm,
}: PaymentMethodDialogProps) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<'wallet' | 'bank_transfer' | ''>('');
  const [working, setWorking] = useState(false);

//   const { data: wallet, isLoading: walletLoading } = useQuery(
//     ['wallet', user?.id],
//     async () => {
//       if (!user) return null;
//       const { data, error } = await supabase
//         .from('user_wallets')
//         .select('balance')
//         .eq('user_id', user.id)
//         .single();
//       if (error) throw error;
//       return data;
//     },
//     {
//       enabled: !!user,
//       staleTime: 1000 * 60 * 2,
//     }
//   );

    const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', user?.id],

    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
      .from('user_wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

      if (error) throw error;

      return data;
    },

    enabled: !!user,

    staleTime: 1000 * 60 * 2,
    });


  const balance = wallet?.balance ?? 0;
  const walletDisabled = balance < listingPrice;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value);

  const handleConfirm = async () => {
    if (!selected) return;
    setWorking(true);

    // close dialog immediately so we don't try to update state after navigation
    onOpenChange(false);

    try {
      await onConfirm(selected);
    } finally {
      setWorking(false);
      setSelected('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Payment Method</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <RadioGroup
            value={selected}
            onValueChange={(v) => setSelected(v as any)}
            className="space-y-4"
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="wallet" disabled={walletDisabled || walletLoading} />
              <div>
                <span className="font-medium">Wallet Balance</span>
                <div className="text-sm text-muted-foreground">
                  {walletLoading
                    ? 'Loading balance...'
                    : `Balance: ${formatPrice(balance)}`}
                </div>
                {walletDisabled && !walletLoading && (
                  <div className="text-xs text-destructive">Insufficient balance</div>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <RadioGroupItem value="bank_transfer" />
              <div>
                <span className="font-medium">Bank Transfer</span>
                <div className="text-sm text-muted-foreground">
                  Pay via bank transfer and complete payment manually
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={working}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selected || (selected === 'wallet' && walletDisabled) || working}
          >
            {working ? 'Processing...' : 'Confirm'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
