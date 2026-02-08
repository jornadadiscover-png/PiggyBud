import { ReactNode } from 'react';
import { usePremiumStore } from '@/stores/usePremiumStore';
import { PremiumFeature } from '@/types';
import { Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PremiumGateProps {
  feature: PremiumFeature;
  children: ReactNode;
  fallbackMessage?: string;
  onUpgrade?: () => void;
}

export function PremiumGate({ feature, children, fallbackMessage, onUpgrade }: PremiumGateProps) {
  const { canAccess } = usePremiumStore();

  if (canAccess(feature)) {
    return <>{children}</>;
  }

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Blurred preview */}
      <div className="blur-sm opacity-50 pointer-events-none select-none">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm rounded-2xl">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center mb-3 shadow-lg">
          <Crown className="w-7 h-7 text-amber-950" />
        </div>
        <h3 className="font-bold text-foreground mb-1">Recurso Premium</h3>
        <p className="text-sm text-muted-foreground text-center px-6 mb-4">
          {fallbackMessage || 'Desbloqueie com o Piggy Bud Premium'}
        </p>
        <Button 
          className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 hover:from-amber-500 hover:to-amber-600 font-bold rounded-2xl shadow-md"
          onClick={onUpgrade}
        >
          <Lock className="w-4 h-4 mr-2" />
          Ver Premium
        </Button>
      </div>
    </div>
  );
}
