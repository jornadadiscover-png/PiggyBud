import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { Category, categoryLabels, categoryColors } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Trophy, Brain, Loader2 } from 'lucide-react';
import { PremiumGate } from '@/components/PremiumGate';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RelatoriosPageProps {
  onNavigateToPremium?: () => void;
}

export function RelatoriosPage({ onNavigateToPremium }: RelatoriosPageProps) {
  const { transactions, getTotalByCategory } = useTransactionStore();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const { toast } = useToast();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Category breakdown for current month - ONLY EXPENSES
  const categoryData = useMemo(() => {
    const expenseCategories: Category[] = ['alimentacao', 'transporte', 'moradia', 'saude', 'educacao', 'lazer', 'compras', 'outros'];
    
    const monthExpenses = transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    
    return expenseCategories
      .map((cat) => {
        const categoryTotal = monthExpenses
          .filter((t) => t.category === cat)
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          name: categoryLabels[cat].split(' ')[1] || categoryLabels[cat],
          value: categoryTotal,
          color: categoryColors[cat],
          fullName: categoryLabels[cat],
        };
      })
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [transactions, currentMonth, currentYear]);

  // Monthly comparison
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const monthTransactions = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });

      const income = monthTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = monthTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      months.push({
        name: date.toLocaleDateString('pt-BR', { month: 'short' }),
        receitas: income,
        despesas: expenses,
      });
    }
    return months;
  }, [transactions, currentMonth, currentYear]);

  // Top 5 expenses
  const topExpenses = useMemo(() => {
    return transactions
      .filter((t) => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions, currentMonth, currentYear]);

  // Current month totals
  const currentMonthIncome = monthlyData[5]?.receitas || 0;
  const currentMonthExpenses = monthlyData[5]?.despesas || 0;
  const lastMonthExpenses = monthlyData[4]?.despesas || 0;
  const expenseChange = lastMonthExpenses > 0 
    ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100)
    : 0;
  const handleAiSummary = async () => {
    const monthTransactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    if (monthTransactions.length === 0) {
      toast({ title: 'Sem dados', description: 'Adicione transações para gerar o resumo.', variant: 'destructive' });
      return;
    }
    setSummaryLoading(true);
    try {
      const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      const { data, error } = await supabase.functions.invoke('ai-monthly-summary', {
        body: { transactions: monthTransactions, monthLabel },
      });
      if (error) throw error;
      setAiSummary(data?.summary || 'Não foi possível gerar o resumo.');
    } catch (err: any) {
      toast({ title: 'Erro', description: err?.message || 'Tente novamente.', variant: 'destructive' });
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 p-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">📈 Relatórios</h1>
        <p className="text-muted-foreground">Visualize seus gastos e tendências</p>
      </header>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Receitas do mês</span>
            </div>
            <p className="text-xl font-bold text-success">
              R$ {currentMonthIncome.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Despesas do mês</span>
            </div>
            <p className="text-xl font-bold text-destructive">
              R$ {currentMonthExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </p>
            {lastMonthExpenses > 0 && (
              <p className={`text-xs mt-1 ${expenseChange > 0 ? 'text-destructive' : 'text-success'}`}>
                {expenseChange > 0 ? '↑' : '↓'} {Math.abs(expenseChange).toFixed(0)}% vs mês anterior
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Pie Chart - FREE */}
      <Card className="mb-4 border-0 shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              Nenhum gasto registrado este mês
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 ml-4 space-y-2">
                {categoryData.slice(0, 4).map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cat.color }} 
                    />
                    <span className="text-xs flex-1 truncate">{cat.fullName}</span>
                    <span className="text-xs font-medium">
                      R$ {cat.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Evolution - PREMIUM */}
      <PremiumGate feature="advanced-reports" onUpgrade={onNavigateToPremium}>
        <Card className="mb-4 border-0 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Bar dataKey="receitas" fill="hsl(145 70% 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-xs text-muted-foreground">Receitas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-xs text-muted-foreground">Despesas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </PremiumGate>

      {/* Top Expenses - PREMIUM */}
      <PremiumGate feature="advanced-reports" onUpgrade={onNavigateToPremium}>
        <Card className="border-0 shadow-soft">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-warning" />
              <CardTitle className="text-base">Top 5 Maiores Gastos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {topExpenses.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                Nenhum gasto registrado este mês
              </p>
            ) : (
              <div className="space-y-3">
                {topExpenses.map((t, index) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-warning text-warning-foreground' :
                      index === 1 ? 'bg-muted text-muted-foreground' :
                      'bg-muted/50 text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{t.merchant}</p>
                      <p className="text-xs text-muted-foreground">
                        {categoryLabels[t.category]}
                      </p>
                    </div>
                    <span className="font-bold text-destructive">
                      R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PremiumGate>

      {/* AI Monthly Summary - PREMIUM */}
      <PremiumGate feature="ai-summary" onUpgrade={onNavigateToPremium}>
        <Card className="mt-4 border-0 shadow-soft">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Resumo com IA</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {aiSummary ? (
              <div className="space-y-3">
                <p className="text-sm whitespace-pre-line break-words">{aiSummary}</p>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={handleAiSummary} disabled={summaryLoading}>
                  {summaryLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Brain className="w-4 h-4 mr-1" />}
                  Gerar novamente
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">
                  O Piggy Bud analisa seus gastos do mês e dá dicas personalizadas!
                </p>
                <Button className="rounded-xl" onClick={handleAiSummary} disabled={summaryLoading}>
                  {summaryLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
                  {summaryLoading ? 'Analisando...' : 'Gerar Resumo Mensal'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PremiumGate>
    </div>
  );
}
