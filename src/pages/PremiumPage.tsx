import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePremiumStore } from '@/stores/usePremiumStore';
import { Crown, Check, Sparkles, BarChart3, FileText, BellRing, Tags, Clock, Trophy, Ban } from 'lucide-react';
import piggyLogo from '@/assets/piggy-bud-logo.png';

const premiumFeatures = [
  { icon: <BarChart3 className="w-5 h-5" />, title: 'Relatórios com IA', description: 'Insights personalizados sobre seus gastos' },
  { icon: <FileText className="w-5 h-5" />, title: 'Exportar PDF/Excel', description: 'Relatórios profissionais em qualquer formato' },
  { icon: <Sparkles className="w-5 h-5" />, title: 'Metas Ilimitadas', description: 'Metas por categoria, economia e investimento' },
  { icon: <BellRing className="w-5 h-5" />, title: 'Leitura Automática', description: 'Transações registradas por notificações' },
  { icon: <Tags className="w-5 h-5" />, title: 'Categorias Personalizadas', description: 'Crie categorias além das padrão' },
  { icon: <Clock className="w-5 h-5" />, title: 'Histórico Completo', description: 'Acesso ilimitado a todo seu histórico' },
  { icon: <Trophy className="w-5 h-5" />, title: 'Desafios Exclusivos', description: 'Desafios Premium com recompensas especiais' },
  { icon: <Ban className="w-5 h-5" />, title: 'Sem Anúncios', description: 'Experiência limpa e sem distrações' },
];

interface PremiumPageProps {
  onBack?: () => void;
}

export function PremiumPage({ onBack }: PremiumPageProps) {
  const { isPremium } = usePremiumStore();

  if (isPremium) {
    return (
      <div className="flex flex-col min-h-screen pb-20 p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-2">👑 Premium Ativo</h1>
          <p className="text-muted-foreground">Você tem acesso a todos os recursos!</p>
        </header>

        <Card className="border-0 shadow-soft bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg">
              <Crown className="w-10 h-10 text-amber-950" />
            </div>
            <h2 className="text-xl font-bold mb-2">Piggy Bud Premium</h2>
            <p className="text-muted-foreground">
              Obrigado por apoiar o Piggy Bud! Todos os recursos estão desbloqueados.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 p-4">
      {/* Header */}
      <header className="text-center mb-6 pt-4">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <img src={piggyLogo} alt="Piggy Bud" className="w-full h-full rounded-full object-cover shadow-lg" />
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md">
            <Crown className="w-4 h-4 text-amber-950" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-1">Piggy Bud Premium</h1>
        <p className="text-muted-foreground">
          Desbloqueie todo o potencial do seu controle financeiro
        </p>
      </header>

      {/* Features */}
      <div className="space-y-3 mb-8">
        {premiumFeatures.map((feature, index) => (
          <Card key={index} className="border-0 shadow-soft">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 text-amber-600 dark:text-amber-400">
                {feature.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
              <Check className="w-4 h-4 text-success shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pricing Cards */}
      <div className="space-y-3 mb-6">
        {/* Monthly */}
        <Card className="border-2 border-border shadow-soft">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-bold">Mensal</p>
              <p className="text-xs text-muted-foreground">Cancele quando quiser</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary">R$ 9,90</p>
              <p className="text-xs text-muted-foreground">/mês</p>
            </div>
          </CardContent>
        </Card>

        {/* Annual */}
        <Card className="border-2 border-amber-400 shadow-soft relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-500 text-amber-950 text-[10px] font-bold px-3 py-0.5 rounded-bl-xl">
            MAIS POPULAR
          </div>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-bold">Anual</p>
              <p className="text-xs text-muted-foreground">Economize 40%</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-amber-500">R$ 5,90</p>
              <p className="text-xs text-muted-foreground">/mês (R$ 70,80/ano)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Button className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 rounded-2xl shadow-lg">
        <Crown className="w-5 h-5 mr-2" />
        Assinar Premium
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-3">
        Cancele a qualquer momento. Sem taxas de cancelamento.
      </p>
    </div>
  );
}
