import { Home, FileSpreadsheet, Crown, Calculator, MoreHorizontal, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePremiumStore } from '@/stores/usePremiumStore';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'feed', label: 'Feed', icon: Home },
  { id: 'tutor', label: 'Tutor', icon: GraduationCap },
  { id: 'planilha', label: 'Planilha', icon: FileSpreadsheet },
  { id: 'calculadora', label: 'Calc', icon: Calculator },
  { id: 'premium', label: 'Premium', icon: Crown },
  { id: 'mais', label: 'Mais', icon: MoreHorizontal },
];

// Tabs that should highlight the "Mais" entry as active
const maisChildren = ['mais', 'config', 'perfil', 'relatorios', 'auth'];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { isPremium } = usePremiumStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === 'mais'
            ? maisChildren.includes(activeTab)
            : activeTab === tab.id;
          const isPremiumTab = tab.id === 'premium';

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-all duration-200 min-w-0",
                isActive
                  ? isPremiumTab ? "text-amber-500" : "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-all duration-200",
                isActive && (isPremiumTab ? "bg-amber-500/10" : "bg-primary/10")
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive && "scale-110"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200 truncate max-w-full",
                isActive && "font-semibold"
              )}>
                {isPremiumTab && isPremium ? 'PRO' : tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
