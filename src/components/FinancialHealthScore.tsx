import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Heart } from 'lucide-react';

interface ScoreConfig {
  label: string;
  color: string;
  bgColor: string;
  emoji: string;
}

const scoreConfigs: Record<string, ScoreConfig> = {
  excellent: { label: 'Excelente', color: 'text-success', bgColor: 'bg-success', emoji: '🌟' },
  good: { label: 'Bom', color: 'text-primary', bgColor: 'bg-primary', emoji: '👍' },
  attention: { label: 'Atenção', color: 'text-warning', bgColor: 'bg-warning', emoji: '⚠️' },
  critical: { label: 'Crítico', color: 'text-destructive', bgColor: 'bg-destructive', emoji: '🚨' },
};

export function FinancialHealthScore() {
  const { transactions, getTotalByType } = useTransactionStore();
  const { profile } = useSettingsStore();

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const score = useMemo(() => {
    let points = 0;

    const monthlyIncome = getTotalByType('income', currentMonth, currentYear);
    const monthlyExpenses = getTotalByType('expense', currentMonth, currentYear);

    // Receitas > Despesas: +30 pontos
    if (monthlyIncome > monthlyExpenses) {
      points += 30;
    } else if (monthlyIncome > 0 && monthlyExpenses > 0) {
      points += Math.floor((monthlyIncome / monthlyExpenses) * 15);
    }

    // Dentro da meta mensal: +25 pontos
    const goalProgress = (monthlyExpenses / profile.monthlyGoal) * 100;
    if (goalProgress <= 100) {
      points += 25;
    } else if (goalProgress <= 120) {
      points += 10;
    }

    // Registra transações regularmente: +15 pontos
    const monthTransactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const uniqueDays = new Set(monthTransactions.map((t) => new Date(t.date).toDateString()));
    const dayOfMonth = today.getDate();
    const registrationRate = dayOfMonth > 0 ? (uniqueDays.size / dayOfMonth) * 100 : 0;
    if (registrationRate >= 50) {
      points += 15;
    } else if (registrationRate >= 25) {
      points += 8;
    }

    // Tem receita registrada (proxy para fundo de emergência): +15 pontos
    if (monthlyIncome > 0) {
      points += 15;
    }

    // Diversificação (mais de 1 fonte de receita ou múltiplas categorias): +15 pontos
    const incomeCategories = new Set(
      monthTransactions.filter((t) => t.type === 'income').map((t) => t.category)
    );
    if (incomeCategories.size >= 2) {
      points += 15;
    } else if (incomeCategories.size >= 1) {
      points += 8;
    }

    return Math.min(points, 100);
  }, [transactions, getTotalByType, currentMonth, currentYear, profile.monthlyGoal, today]);

  const getScoreConfig = (score: number): ScoreConfig => {
    if (score >= 80) return scoreConfigs.excellent;
    if (score >= 60) return scoreConfigs.good;
    if (score >= 40) return scoreConfigs.attention;
    return scoreConfigs.critical;
  };

  const config = getScoreConfig(score);

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Score Circle */}
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-muted"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className={config.color}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${score}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-lg font-bold ${config.color}`}>{score}</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Heart className={`w-4 h-4 ${config.color}`} />
              <span className="text-sm font-semibold">Saúde Financeira</span>
            </div>
            <p className={`text-sm font-bold ${config.color}`}>
              {config.emoji} {config.label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {score >= 80 ? 'Continue assim! Suas finanças estão ótimas.' :
               score >= 60 ? 'Bom caminho! Pequenos ajustes podem melhorar.' :
               score >= 40 ? 'Fique atento aos gastos este mês.' :
               'Cuidado! Revise seus gastos urgentemente.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
