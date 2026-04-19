import { useMemo } from 'react';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import piggyLogo from '@/assets/piggy-bud-logo.webp';

type MascotMood = 'happy' | 'normal' | 'worried' | 'scared' | 'dramatic';

interface MascotAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
}

const moodConfig: Record<MascotMood, { emoji: string; color: string; message: string }> = {
  happy: {
    emoji: '😊',
    color: 'from-success/20 to-success/10',
    message: 'Tudo sob controle! Continue assim! 💪',
  },
  normal: {
    emoji: '🙂',
    color: 'from-primary/20 to-primary/10',
    message: 'Indo bem! Fica de olho nos gastos!',
  },
  worried: {
    emoji: '😅',
    color: 'from-warning/20 to-warning/10',
    message: 'Opa, tá gastando hein...',
  },
  scared: {
    emoji: '😰',
    color: 'from-destructive/20 to-destructive/10',
    message: 'Cuidado! Meta quase estourando! 🚨',
  },
  dramatic: {
    emoji: '🤯',
    color: 'from-destructive/30 to-destructive/20',
    message: 'SOCORRO! O orçamento chorou! 💸',
  },
};

const sizeClasses = {
  sm: { container: 'w-10 h-10', emoji: 'text-[10px]', img: 'w-7 h-7' },
  md: { container: 'w-14 h-14', emoji: 'text-xs', img: 'w-10 h-10' },
  lg: { container: 'w-20 h-20', emoji: 'text-base', img: 'w-14 h-14' },
};

export function MascotAvatar({ size = 'md', showMessage = true }: MascotAvatarProps) {
  const { getTotalByType } = useTransactionStore();
  const { profile } = useSettingsStore();

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const monthlyExpenses = getTotalByType('expense', currentMonth, currentYear);
  const goalProgress = (monthlyExpenses / profile.monthlyGoal) * 100;

  const mood: MascotMood = useMemo(() => {
    if (goalProgress <= 30) return 'happy';
    if (goalProgress <= 60) return 'normal';
    if (goalProgress <= 80) return 'worried';
    if (goalProgress <= 100) return 'scared';
    return 'dramatic';
  }, [goalProgress]);

  const config = moodConfig[mood];
  const sizes = sizeClasses[size];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${sizes.container} rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shadow-soft transition-all duration-500 animate-scale-in relative`}
      >
        <img 
          src={piggyLogo} 
          alt="Piggy Bud" 
          className={`${sizes.img} rounded-xl object-cover`}
        />
        {/* Mood emoji overlay */}
        <span className={`absolute -bottom-1 -right-1 ${sizes.emoji} bg-card rounded-full p-0.5 shadow-sm`}>
          {config.emoji}
        </span>
      </div>
      {showMessage && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {config.message}
          </p>
          <p className="text-xs text-muted-foreground">
            {goalProgress.toFixed(0)}% da meta usada
          </p>
        </div>
      )}
    </div>
  );
}
