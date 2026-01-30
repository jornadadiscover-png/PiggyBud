import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { Category, categoryLabels, TransactionType } from '@/types';
import { Plus, Filter, Trash2, Edit2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function PlanilhaPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | Category>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const { transactions, updateTransaction, deleteTransaction } = useTransactionStore();

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => filterType === 'all' || t.type === filterType)
      .filter((t) => filterCategory === 'all' || t.category === filterCategory)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, filterCategory]);

  const handleEdit = (id: string, currentValue: number) => {
    setEditingId(id);
    setEditValue(currentValue.toString());
  };

  const handleSave = (id: string) => {
    const newAmount = parseFloat(editValue.replace(',', '.'));
    if (!isNaN(newAmount) && newAmount > 0) {
      updateTransaction(id, { amount: newAmount });
    }
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex flex-col min-h-screen pb-20 p-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">📊 Planilha</h1>
        <p className="text-muted-foreground">Gerencie suas transações manualmente</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="border-0 shadow-soft bg-success/5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Receitas</p>
            <p className="text-lg font-bold text-success">
              R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Despesas</p>
            <p className="text-lg font-bold text-destructive">
              R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4 border-0 shadow-soft">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as any)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="flex-1 border-0 shadow-soft overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {filteredTransactions.length} transações
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhuma transação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(t.date), 'dd/MM', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium truncate max-w-32">
                        {t.merchant}
                      </TableCell>
                      <TableCell className="text-xs">
                        {categoryLabels[t.category]?.split(' ')[0]}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === t.id ? (
                          <Input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-24 h-8 text-right"
                            autoFocus
                          />
                        ) : (
                          <span className={t.type === 'income' ? 'text-success' : 'text-destructive'}>
                            {t.type === 'income' ? '+' : '-'}R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {editingId === t.id ? (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => handleSave(t.id)}
                              >
                                <Check className="w-4 h-4 text-success" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={handleCancel}
                              >
                                <X className="w-4 h-4 text-destructive" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => handleEdit(t.id, t.amount)}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => deleteTransaction(t.id)}
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* FAB */}
      <Button
        size="icon"
        className="fixed bottom-20 right-4 w-14 h-14 rounded-2xl gradient-primary shadow-glow z-30"
        onClick={() => setShowAdd(true)}
      >
        <Plus className="w-6 h-6" />
      </Button>

      <AddTransactionDialog open={showAdd} onOpenChange={setShowAdd} />
    </div>
  );
}
