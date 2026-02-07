import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { TransactionCard } from '@/components/TransactionCard';
import { SimulateNotificationDialog } from '@/components/SimulateNotificationDialog';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { PasteNotificationDialog } from '@/components/PasteNotificationDialog';
import { MascotAvatar } from '@/components/MascotAvatar';
import { DailyQuote } from '@/components/DailyQuote';
import { FinancialHealthScore } from '@/components/FinancialHealthScore';
import { TrendingUp, TrendingDown, Wallet, Bell, Plus, ClipboardPaste } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import piggyLogo from '@/assets/piggy-bud-logo.png';

export function FeedPage() {
  const [showSimulate, setShowSimulate] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const { transactions, getTotalByType } = useTransactionStore();
  const { profile } = useSettingsStore();

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const monthlyIncome = getTotalByType('income', currentMonth, currentYear);
  const monthlyExpenses = getTotalByType('expense', currentMonth, currentYear);
  const balance = monthlyIncome - monthlyExpenses;
  const goalProgress = (monthlyExpenses / profile.monthlyGoal) * 100;

  const recentTransactions = useMemo(() => {
    return transactions
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);
  }, [transactions]);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <header className="gradient-primary text-primary-foreground p-6 pt-8 rounded-b-3xl shadow-glow">
        {/* Logo + Brand */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <img src={piggyLogo} alt="Piggy Bud" className="w-10 h-10 rounded-full shadow-md border-2 border-primary-foreground/30" />
            <div>
              <h1 className="text-xl font-bold leading-tight">Piggy Bud</h1>
              <p className="text-primary-foreground/70 text-xs">
                {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setShowSimulate(true)}
          >
            <Bell className="w-5 h-5" />
          </Button>
        </div>

        {/* Greeting */}
        <p className="text-primary-foreground/90 text-sm mb-3">
          Olá{profile.name ? `, ${profile.name.split(' ')[0]}` : ''}! 👋
        </p>

        {/* Mascot */}
        <div className="mb-4 p-3 rounded-2xl bg-card/10 backdrop-blur-sm">
          <MascotAvatar size="md" showMessage={true} />
        </div>

        {/* Balance Card */}
        <Card className="bg-card/95 backdrop-blur border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground text-sm">Saldo do mês</span>
              </div>
              <span className={`text-xl font-bold ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-success/10">
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Receitas</p>
                  <p className="font-semibold text-success">
                    R$ {monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-destructive/10">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Despesas</p>
                  <p className="font-semibold text-destructive">
                    R$ {monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Goal Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Meta mensal</span>
                <span className={goalProgress > 100 ? 'text-destructive' : 'text-foreground'}>
                  {goalProgress.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    goalProgress > 100 ? 'bg-destructive' : goalProgress > 80 ? 'bg-warning' : 'bg-success'
                  }`}
                  style={{ width: `${Math.min(goalProgress, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </header>

      {/* Daily Quote */}
      <div className="px-4 pt-4">
        <DailyQuote />
      </div>

      {/* Financial Health Score */}
      <div className="px-4 pt-3">
        <FinancialHealthScore />
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-4 flex gap-3">
        <Button
          onClick={() => setShowPaste(true)}
          variant="outline"
          className="flex-1 rounded-2xl h-12"
        >
          <ClipboardPaste className="w-5 h-5 mr-2" />
          Colar Notificação
        </Button>
        <Button
          onClick={() => setShowSimulate(true)}
          className="flex-1 gradient-primary text-primary-foreground rounded-2xl h-12 shadow-soft"
        >
          <Bell className="w-5 h-5 mr-2" />
          Simular
        </Button>
      </div>

      {/* Transactions Feed */}
      <div className="flex-1 px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Transações Recentes</h2>
          <span className="text-sm text-muted-foreground">
            {transactions.length} total
          </span>
        </div>

        {recentTransactions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Nenhuma transação ainda</h3>
              <p className="text-muted-foreground text-center text-sm mb-4">
                Clique no botão acima para simular uma notificação bancária!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction, index) => (
              <TransactionCard 
                key={transaction.id} 
                transaction={transaction}
                style={{ animationDelay: `${index * 50}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <Button
        size="icon"
        className="fixed bottom-20 right-4 w-14 h-14 rounded-2xl gradient-primary shadow-glow z-30"
        onClick={() => setShowAdd(true)}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Dialogs */}
      <SimulateNotificationDialog open={showSimulate} onOpenChange={setShowSimulate} />
      <AddTransactionDialog open={showAdd} onOpenChange={setShowAdd} />
      <PasteNotificationDialog open={showPaste} onOpenChange={setShowPaste} />
    </div>
  );
}
