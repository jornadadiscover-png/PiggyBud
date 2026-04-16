import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePremiumStore } from '@/stores/usePremiumStore';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Check, BarChart3, FileText, Trophy, Upload, Brain, Palette, Loader2, RefreshCw, Settings, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import piggyLogo from '@/assets/piggy-bud-logo.png';

const MONTHLY_PRICE_ID = "price_1SxT363XMRup5szXx8FiZXjM";
const ANNUAL_PRICE_ID = "price_1SyYGd3XMRup5szX9pqKXTKM";

const premiumFeatures = [
  { icon: <BarChart3 className="w-5 h-5" />, title: 'Relatórios com IA', description: 'Gráficos avançados e análise de tendências' },
  { icon: <FileText className="w-5 h-5" />, title: 'Exportar PDF/Excel', description: 'Relatórios profissionais em qualquer formato' },
  { icon: <Trophy className="w-5 h-5" />, title: 'Desafios Exclusivos', description: 'Desafios Premium com recompensas especiais' },
  { icon: <Upload className="w-5 h-5" />, title: 'Importação com IA', description: 'Extraia transações de screenshots e documentos' },
  { icon: <Brain className="w-5 h-5" />, title: 'Resumo Mensal com IA', description: 'Análise inteligente dos seus gastos com dicas' },
  { icon: <Palette className="w-5 h-5" />, title: 'Temas Premium', description: 'Personalize as cores e visual do app' },
];

interface PremiumPageProps {
  onBack?: () => void;
  onNavigateToAuth?: () => void;
}

export function PremiumPage({ onBack, onNavigateToAuth }: PremiumPageProps) {
  const { isPremium, isAuthenticated, expiresAt, isLoading, checkSubscription, signOut, userEmail } = usePremiumStore();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { toast } = useToast();

  // Check subscription on mount and after checkout
  useEffect(() => {
    if (isAuthenticated) {
      checkSubscription();
    }
  }, [isAuthenticated]);

  // Check for checkout result in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      toast({ title: '🎉 Pagamento realizado!' });
      checkSubscription();
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('checkout') === 'cancel') {
      toast({ title: 'Checkout cancelado', variant: 'destructive' });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      onNavigateToAuth?.();
      return;
    }

    setCheckoutLoading(true);
    try {
      // Verify active session before checkout
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        onNavigateToAuth?.();
        setCheckoutLoading(false);
        return;
      }

      // Force token refresh to ensure valid auth header
      await supabase.auth.refreshSession();

      const priceId = selectedPlan === 'monthly' ? MONTHLY_PRICE_ID : ANNUAL_PRICE_ID;
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (error) throw error;
      if (!data?.url) {
        throw new Error('Não foi possível gerar o link de pagamento. Tente novamente.');
      }
      // Try window.open first, fallback to redirect if blocked by popup blocker
      const newWindow = window.open(data.url, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao iniciar checkout',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Premium active view
  if (isPremium) {
    return (
      <div className="flex flex-col min-h-screen pb-20 p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-2">👑 Premium Ativo</h1>
          <p className="text-muted-foreground">Você tem acesso a todos os recursos!</p>
        </header>

        <Card className="border-0 shadow-soft bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 mb-4">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg">
              <Crown className="w-10 h-10 text-amber-950" />
            </div>
            <h2 className="text-xl font-bold mb-2">Piggy Bud Premium</h2>
            <p className="text-muted-foreground mb-2">
              Obrigado por apoiar o Piggy Bud! Todos os recursos estão desbloqueados.
            </p>
            {userEmail && (
              <p className="text-xs text-muted-foreground">Conta: {userEmail}</p>
            )}
            {expiresAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Renovação: {new Date(expiresAt).toLocaleDateString('pt-BR')}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={handleManageSubscription}
          >
            <Settings className="w-4 h-4 mr-2" />
            Gerenciar Assinatura
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => checkSubscription()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar Status
          </Button>
          <Button
            variant="ghost"
            className="w-full rounded-xl text-muted-foreground"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da conta
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 p-4">
      {/* Header */}
      <header className="text-center mb-6 pt-4">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <img src={piggyLogo} alt="Piggy Bud" className="w-full h-full rounded-2xl object-cover shadow-lg" />
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md">
            <Crown className="w-4 h-4 text-amber-950" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-1">Piggy Bud Premium</h1>
        <p className="text-muted-foreground">
          Desbloqueie todo o potencial do seu controle financeiro
        </p>
        {isAuthenticated && userEmail && (
          <p className="text-xs text-muted-foreground mt-2">
            Logado como: {userEmail}
          </p>
        )}
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
        <button className="w-full text-left" onClick={() => setSelectedPlan('monthly')}>
          <Card className={`border-2 shadow-soft transition-all ${
            selectedPlan === 'monthly' ? 'border-primary' : 'border-border'
          }`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'monthly' ? 'border-primary' : 'border-muted-foreground'
                }`}>
                  {selectedPlan === 'monthly' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
                <div>
                  <p className="font-bold">Mensal</p>
                  <p className="text-xs text-muted-foreground">Cancele quando quiser</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">R$ 9,90</p>
                <p className="text-xs text-muted-foreground">/mês</p>
              </div>
            </CardContent>
          </Card>
        </button>

        {/* Annual */}
        <button className="w-full text-left" onClick={() => setSelectedPlan('annual')}>
          <Card className={`border-2 shadow-soft relative overflow-hidden transition-all ${
            selectedPlan === 'annual' ? 'border-amber-400' : 'border-border'
          }`}>
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-500 text-amber-950 text-[10px] font-bold px-3 py-0.5 rounded-bl-xl">
              MAIS POPULAR
            </div>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'annual' ? 'border-amber-400' : 'border-muted-foreground'
                }`}>
                  {selectedPlan === 'annual' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  )}
                </div>
                <div>
                  <p className="font-bold">Anual</p>
                  <p className="text-xs text-muted-foreground">Economize 40%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-amber-500">R$ 5,90</p>
                <p className="text-xs text-muted-foreground">/mês (R$ 70,80/ano)</p>
              </div>
            </CardContent>
          </Card>
        </button>
      </div>

      {/* CTA */}
      <Button
        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 rounded-2xl shadow-lg"
        onClick={handleCheckout}
        disabled={checkoutLoading}
      >
        {checkoutLoading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Crown className="w-5 h-5 mr-2" />
        )}
        {!isAuthenticated ? 'Entrar para Assinar' : 'Assinar Premium'}
      </Button>

      {isAuthenticated && (
        <Button
          variant="ghost"
          className="w-full mt-2 text-muted-foreground"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da conta
        </Button>
      )}

      <p className="text-xs text-muted-foreground text-center mt-3">
        Cancele a qualquer momento. Sem taxas de cancelamento.
      </p>
    </div>
  );
}
