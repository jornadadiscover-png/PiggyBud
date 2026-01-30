import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Bank, bankLabels } from '@/types';
import { Bell, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimulateNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockMerchants = [
  'iFood',
  'Uber',
  '99',
  'Amazon',
  'Shopee',
  'Netflix',
  'Spotify',
  'Farmácia',
  'Supermercado',
  'Restaurante',
  'Posto de Gasolina',
  'Padaria',
];

export function SimulateNotificationDialog({ open, onOpenChange }: SimulateNotificationDialogProps) {
  const [bank, setBank] = useState<Bank>('nubank');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const { simulateBankNotification } = useTransactionStore();
  const { settings } = useSettingsStore();
  const { toast } = useToast();

  const handleSimulate = () => {
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'Digite um valor válido para simular.',
        variant: 'destructive',
      });
      return;
    }

    const merchantName = merchant || mockMerchants[Math.floor(Math.random() * mockMerchants.length)];
    const transaction = simulateBankNotification(bank, parsedAmount, merchantName);

    toast({
      title: `📱 ${bankLabels[bank]}`,
      description: transaction.mood,
      duration: 5000,
    });

    setAmount('');
    setMerchant('');
    onOpenChange(false);
  };

  const handleQuickSimulate = (value: number) => {
    const randomMerchant = mockMerchants[Math.floor(Math.random() * mockMerchants.length)];
    const randomBank = settings.enabledBanks[Math.floor(Math.random() * settings.enabledBanks.length)] || 'nubank';
    const transaction = simulateBankNotification(randomBank, value, randomMerchant);

    toast({
      title: `📱 ${bankLabels[randomBank]}`,
      description: transaction.mood,
      duration: 5000,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4 rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl gradient-primary">
              <Smartphone className="w-6 h-6 text-primary-foreground" />
            </div>
            <DialogTitle className="text-xl">Simular Notificação</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Quick Simulate */}
          <div>
            <Label className="text-muted-foreground text-sm">Simulação rápida</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[15, 50, 120, 300].map((value) => (
                <Button
                  key={value}
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => handleQuickSimulate(value)}
                >
                  R${value}
                </Button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou personalize</span>
            </div>
          </div>

          {/* Bank Select */}
          <div className="space-y-2">
            <Label>Banco</Label>
            <Select value={bank} onValueChange={(v) => setBank(v as Bank)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {settings.enabledBanks.map((b) => (
                  <SelectItem key={b} value={b}>
                    {bankLabels[b]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-xl text-lg"
            />
          </div>

          {/* Merchant */}
          <div className="space-y-2">
            <Label>Estabelecimento (opcional)</Label>
            <Input
              type="text"
              placeholder="Ex: iFood, Uber, Amazon..."
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <Button
            className="w-full h-12 rounded-2xl gradient-primary text-primary-foreground"
            onClick={handleSimulate}
          >
            <Bell className="w-5 h-5 mr-2" />
            Simular Notificação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
