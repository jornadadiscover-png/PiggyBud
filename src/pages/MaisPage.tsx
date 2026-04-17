import { Card, CardContent } from '@/components/ui/card';
import { Calculator, GraduationCap, Settings, User, ChevronRight, BarChart3 } from 'lucide-react';

interface MaisPageProps {
  onNavigate: (tab: string) => void;
}

const items = [
  { id: 'calculadora', label: 'Calculadora', desc: 'Cálculos comuns e financeiros', icon: Calculator, color: 'text-primary bg-primary/10' },
  { id: 'tutor', label: 'Tutor de Investimentos', desc: 'Post diário com IA (Premium)', icon: GraduationCap, color: 'text-amber-600 bg-amber-500/10' },
  { id: 'relatorios', label: 'Relatórios', desc: 'Gráficos e análises dos seus gastos', icon: BarChart3, color: 'text-success bg-success/10' },
  { id: 'config', label: 'Configurações', desc: 'PIN, temas, lembretes', icon: Settings, color: 'text-muted-foreground bg-muted' },
  { id: 'perfil', label: 'Perfil', desc: 'Sua conta e dados', icon: User, color: 'text-primary bg-primary/10' },
];

export function MaisPage({ onNavigate }: MaisPageProps) {
  return (
    <div className="flex flex-col min-h-screen pb-20 p-4">
      <header className="mb-4 pt-2">
        <h1 className="text-2xl font-bold">Mais</h1>
        <p className="text-muted-foreground text-sm">Recursos extras e configurações</p>
      </header>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} className="w-full text-left">
              <Card className="border-0 shadow-soft hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold break-words">{item.label}</p>
                    <p className="text-xs text-muted-foreground break-words">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
