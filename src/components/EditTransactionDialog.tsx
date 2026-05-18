import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { Category, categoryLabels, Transaction, TransactionType } from '@/types';
import { Check, Trash2, TrendingDown, TrendingUp, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const incomeCategories: Category[] = ['salario', 'freelance', 'investimentos', 'outros'];
const expenseCategories: Category[] = ['alimentacao', 'transporte', 'moradia', 'saude', 'educacao', 'lazer', 'compras', 'outros'];

export function EditTransactionDialog({ transaction, open, onOpenChange }: EditTransactionDialogProps) {
  const { updateTransaction, deleteTransaction } = useTransactionStore();
  const { toast } = useToast();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<Category>('outros');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString().replace('.', ','));
      setMerchant(transaction.merchant);
      setCategory(transaction.category);
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleSave = () => {
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({ title: 'Valor inválido', description: 'Digite um valor válido.', variant: 'destructive' });
      return;
    }
    if (!merchant.trim()) {
      toast({ title: 'Descrição obrigatória', description: 'Digite uma descrição.', variant: 'destructive' });
      return;
    }

    const validCategories = type === 'income' ? incomeCategories : expenseCategories;
    const finalCategory = validCategories.includes(category) ? category : 'outros';

    updateTransaction(transaction.id, {
      amount: parsedAmount,
      merchant: merchant.trim(),
      category: finalCategory,
      type,
    });

    toast({ title: '✏️ Transação atualizada!', description: 'Suas alterações foram salvas.' });
    onOpenChange(false);
  };

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    toast({ title: '🗑️ Transação excluída', description: 'A transação foi removida.' });
    setConfirmDelete(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm mx-4 rounded-3xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl gradient-primary">
                <Pencil className="w-6 h-6 text-primary-foreground" />
              </div>
              <DialogTitle className="text-xl">Editar Transação</DialogTitle>
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

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="rounded-xl"
                />
              </div>

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

              <div className="flex gap-2 pt-2">
                <Button
                  variant="destructive"
                  className="rounded-2xl h-12 flex-1"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Excluir
                </Button>
                <Button
                  className={`h-12 rounded-2xl flex-1 ${
                    type === 'income' ? 'bg-success hover:bg-success/90' : 'gradient-primary'
                  } text-primary-foreground`}
                  onClick={handleSave}
                >
                  <Check className="w-5 h-5 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
