import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { Flame, Trophy, Zap, Target, Crown } from 'lucide-react';
import { PremiumGate } from '@/components/PremiumGate';

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetDays: number;
  checkProgress: (transactions: any[]) => number;
  reward: string;
  isPremium?: boolean;
}

const challenges: Challenge[] = [
  {
    id: 'no-delivery',
    title: 'Semana sem Delivery',
    description: 'Evite gastos com alimentação por 7 dias',
    icon: <Flame className="w-4 h-4" />,
    targetDays: 7,
    checkProgress: (transactions) => {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const deliverySpending = transactions.filter(
        (t) =>
          t.category === 'alimentacao' &&
          t.type === 'expense' &&
          new Date(t.date) >= weekAgo
      );
      if (deliverySpending.length === 0) return 100;
      if (deliverySpending.length <= 2) return 70;
      if (deliverySpending.length <= 5) return 40;
      return 20;
    },
    reward: '🏆 Mestre da Cozinha',
  },
  {
    id: 'daily-tracker',
    title: 'Registrador Diário',
    description: 'Registre pelo menos 1 transação por 5 dias',
    icon: <Zap className="w-4 h-4" />,
    targetDays: 5,
    checkProgress: (transactions) => {
      const uniqueDays = new Set(
        transactions.map((t) => new Date(t.date).toDateString())
      );
      const progress = (uniqueDays.size / 5) * 100;
      return Math.min(progress, 100);
    },
    reward: '📊 Controlador Nato',
  },
  {
    id: 'budget-master',
    title: 'Abaixo da Meta',
    description: 'Termine a semana gastando menos de 50% da meta',
    icon: <Target className="w-4 h-4" />,
    targetDays: 7,
    checkProgress: () => {
      return 45;
    },
    reward: '💰 Guardião do Bolso',
    isPremium: true,
  },
];

interface ChallengesCardProps {
  onNavigateToPremium?: () => void;
}

export function ChallengesCard({ onNavigateToPremium }: ChallengesCardProps) {
  const { transactions } = useTransactionStore();

  const challengeProgress = useMemo(() => {
    return challenges.map((challenge) => ({
      ...challenge,
      progress: challenge.checkProgress(transactions),
    }));
  }, [transactions]);

  const completedCount = challengeProgress.filter((c) => c.progress >= 100).length;

  const renderChallenge = (challenge: typeof challengeProgress[0]) => {
    const isCompleted = challenge.progress >= 100;
    
    return (
      <div
        key={challenge.id}
        className={`p-3 rounded-xl transition-all ${
          isCompleted
            ? 'bg-success/10 border border-success/20'
            : 'bg-muted/30'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg ${
              isCompleted ? 'bg-success/20 text-success' : 'bg-primary/10 text-primary'
            }`}
          >
            {challenge.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <p className="font-medium text-sm">{challenge.title}</p>
                {challenge.isPremium && (
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                )}
              </div>
              {isCompleted && (
                <span className="text-xs text-success font-medium">
                  Completo! ✓
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2 break-words">
              {challenge.description}
            </p>
            <div className="space-y-1">
              <Progress
                value={challenge.progress}
                className="h-1.5"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{challenge.progress.toFixed(0)}% completo</span>
                <span className="text-warning break-words">{challenge.reward}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-warning" />
            <CardTitle className="text-base">Desafios do Mês</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {completedCount}/{challenges.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Complete desafios para ganhar conquistas especiais! 🎯
        </p>

        {challengeProgress.map((challenge) => {
          if (challenge.isPremium) {
            return (
              <PremiumGate
                key={challenge.id}
                feature="exclusive-challenges"
                fallbackMessage="Desafio exclusivo para assinantes Premium"
                onUpgrade={onNavigateToPremium}
              >
                {renderChallenge(challenge)}
              </PremiumGate>
            );
          }
          return renderChallenge(challenge);
        })}
      </CardContent>
    </Card>
  );
}
