import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { categoryLabels, CategoryBudget, Category } from '@/types';
import { PiggyBank } from 'lucide-react';

export function BudgetByCategoryCard() {
  const { transactions } = useTransactionStore();
  const { settings } = useSettingsStore();

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const budgetData = useMemo(() => {
    if (!settings.categoryBudgets || settings.categoryBudgets.length === 0) return [];

    return settings.categoryBudgets.map((budget: CategoryBudget) => {
      const spent = transactions
        .filter((t) => {
          const d = new Date(t.date);
          return (
            t.type === 'expense' &&
            t.category === budget.category &&
            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

      return {
        ...budget,
        spent,
        percentage,
        label: categoryLabels[budget.category] || budget.category,
      };
    });
  }, [transactions, settings.categoryBudgets, currentMonth, currentYear]);

  if (budgetData.length === 0) return null;

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <PiggyBank className="w-4 h-4 text-primary" />
          <CardTitle className="text-base">Orçamento por Categoria</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {budgetData.map((item) => (
          <div key={item.category}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">{item.label}</span>
              <span className={item.percentage > 100 ? 'text-destructive font-bold' : 'text-muted-foreground'}>
                R$ {item.spent.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} / R$ {item.limit.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  item.percentage > 100
                    ? 'bg-destructive'
                    : item.percentage > 80
                    ? 'bg-warning'
                    : 'bg-success'
                }`}
                style={{ width: `${Math.min(item.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
