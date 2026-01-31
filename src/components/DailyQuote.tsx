import { useMemo } from 'react';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Sparkles } from 'lucide-react';

interface DailyQuoteProps {
  className?: string;
}

// Get quote based on user behavior
function getQuote(
  dayOfWeek: number,
  goalProgress: number,
  hasTransactionsToday: boolean,
  dayOfMonth: number
): { quote: string; emoji: string } {
  // Monday motivation
  if (dayOfWeek === 1) {
    return {
      quote: 'Segunda-feira! Semana nova, orçamento renovado! 💪',
      emoji: '🚀',
    };
  }

  // Friday vibes
  if (dayOfWeek === 5) {
    return {
      quote: 'Sextou! Mas o cartão não precisa saber... 😏',
      emoji: '🎉',
    };
  }

  // Weekend warning
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      quote: 'Fim de semana é pra relaxar, não pra falir! 😄',
      emoji: '🌴',
    };
  }

  // End of month
  if (dayOfMonth >= 25) {
    if (goalProgress < 80) {
      return {
        quote: 'Reta final do mês e você tá voando! 🏆',
        emoji: '⭐',
      };
    }
    return {
      quote: 'Fim do mês chegando... Modo econômico ON! 💡',
      emoji: '⚠️',
    };
  }

  // Based on spending
  if (goalProgress > 100) {
    return {
      quote: 'Dia novo, página em branco! Bora economizar!',
      emoji: '📖',
    };
  }

  if (goalProgress > 80) {
    return {
      quote: 'Quase lá na meta! Respira e segura a carteira! 🧘',
      emoji: '🎯',
    };
  }

  if (goalProgress < 30) {
    if (!hasTransactionsToday) {
      return {
        quote: 'Nenhum gasto hoje ainda! Dia perfeito! ✨',
        emoji: '🌟',
      };
    }
    return {
      quote: 'Mandando super bem! Continue assim! 🔥',
      emoji: '💪',
    };
  }

  // Default quotes
  const defaultQuotes = [
    { quote: 'Cada centavo conta! Você tá no caminho certo!', emoji: '🪙' },
    { quote: 'Hoje é dia de fazer escolhas inteligentes! 🧠', emoji: '💡' },
    { quote: 'Lembre-se: rico é quem gasta menos do que ganha!', emoji: '📈' },
    { quote: 'O futuro você vai agradecer! Continue firme!', emoji: '🙌' },
  ];

  // Pick based on day to seem random but consistent
  return defaultQuotes[dayOfMonth % defaultQuotes.length];
}

export function DailyQuote({ className = '' }: DailyQuoteProps) {
  const { transactions, getTotalByType } = useTransactionStore();
  const { profile } = useSettingsStore();

  const today = new Date();
  const dayOfWeek = today.getDay();
  const dayOfMonth = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const monthlyExpenses = getTotalByType('expense', currentMonth, currentYear);
  const goalProgress = (monthlyExpenses / profile.monthlyGoal) * 100;

  const todayStr = today.toDateString();
  const hasTransactionsToday = transactions.some(
    (t) => new Date(t.date).toDateString() === todayStr
  );

  const { quote, emoji } = useMemo(
    () => getQuote(dayOfWeek, goalProgress, hasTransactionsToday, dayOfMonth),
    [dayOfWeek, goalProgress, hasTransactionsToday, dayOfMonth]
  );

  return (
    <div
      className={`flex items-start gap-2 p-3 rounded-2xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 ${className}`}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-accent mb-0.5">Frase do Dia</p>
        <p className="text-sm text-foreground">
          {emoji} {quote}
        </p>
      </div>
    </div>
  );
}
