import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { Category, categoryLabels, TransactionType } from '@/types';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionDialog({ open, onOpenChange }: AddTransactionDialogProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<Category>('outros');
  const { addTransaction } = useTransactionStore();
  const { toast } = useToast();

  const incomeCategories: Category[] = ['salario', 'freelance', 'investimentos', 'outros'];
  const expenseCategories: Category[] = ['alimentacao', 'transporte', 'moradia', 'saude', 'educacao', 'lazer', 'compras', 'outros'];

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'Digite um valor válido.',
        variant: 'destructive',
      });
      return;
    }

    if (!merchant.trim()) {
      toast({
        title: 'Descrição obrigatória',
        description: 'Digite uma descrição para a transação.',
        variant: 'destructive',
      });
      return;
    }

    const transaction = addTransaction({
      amount: parsedAmount,
      merchant: merchant.trim(),
      category,
      date: new Date(),
      source: 'manual',
      type,
    });

    toast({
      title: type === 'income' ? '💰 Receita adicionada!' : '📝 Despesa adicionada!',
      description: transaction.mood,
    });

    setAmount('');
    setMerchant('');
    setCategory('outros');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4 rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl gradient-primary">
              <Plus className="w-6 h-6 text-primary-foreground" />
            </div>
            <DialogTitle className="text-xl">Nova Transação</DialogTitle>
          </div>
        </DialogHeader>

        <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 rounded-xl">
            <TabsTrigger value="expense" className="rounded-lg gap-2">
              <TrendingDown className="w-4 h-4" />
              Despesa
            </TabsTrigger>
            <TabsTrigger value="income" className="rounded-lg gap-2">
              <TrendingUp className="w-4 h-4" />
              Receita
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4 mt-4">
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

            {/* Description */}
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                type="text"
                placeholder={type === 'income' ? 'Ex: Salário, Freelance...' : 'Ex: Almoço, Uber...'}
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="rounded-xl"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(type === 'income' ? incomeCategories : expenseCategories).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabels[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className={`w-full h-12 rounded-2xl ${
                type === 'income' 
                  ? 'bg-success hover:bg-success/90' 
                  : 'gradient-primary'
              } text-primary-foreground`}
              onClick={handleSubmit}
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar {type === 'income' ? 'Receita' : 'Despesa'}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
