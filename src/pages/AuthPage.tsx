import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Mail, Lock, Loader2, Sparkles, Shield, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import piggyLogo from '@/assets/piggy-bud-logo.png';

interface AuthPageProps {
  onBack?: () => void;
  onAuthSuccess?: () => void;
}

type View = 'welcome' | 'login' | 'signup';

export function AuthPage({ onBack, onAuthSuccess }: AuthPageProps) {
  const [view, setView] = useState<View>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: '✅ Conta criada!', description: 'Bem-vindo ao Piggy Bud.' });
        onAuthSuccess?.();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: '✅ Login realizado!' });
        onAuthSuccess?.();
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos'
          : error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Welcome screen
  if (view === 'welcome') {
    return (
      <div className="flex flex-col min-h-screen p-6 safe-top safe-bottom">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-32 h-32 rounded-3xl gradient-primary flex items-center justify-center mb-6 shadow-glow p-1">
            <img src={piggyLogo} alt="Piggy Bud" className="w-full h-full rounded-3xl object-cover" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Piggy Bud</h1>
          <p className="text-muted-foreground mb-8 max-w-xs">
            Seu porquinho inteligente para controlar gastos e investir melhor
          </p>

          <div className="w-full max-w-sm space-y-3 mb-8">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-xl bg-primary/10"><Sparkles className="w-4 h-4 text-primary" /></div>
              <p className="text-sm text-muted-foreground">Mascote reativo aos seus gastos</p>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-xl bg-success/10"><TrendingUp className="w-4 h-4 text-success" /></div>
              <p className="text-sm text-muted-foreground">Tutor diário de investimentos</p>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-xl bg-amber-500/10"><Shield className="w-4 h-4 text-amber-600" /></div>
              <p className="text-sm text-muted-foreground">Seus dados protegidos por PIN</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto space-y-3">
          <Button
            className="w-full h-12 rounded-xl font-bold gradient-primary text-primary-foreground"
            onClick={() => setView('signup')}
          >
            Criar conta grátis
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl font-semibold"
            onClick={() => setView('login')}
          >
            Já tenho conta
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 p-4 safe-top">
      <header className="mb-6 pt-4">
        <Button variant="ghost" size="sm" onClick={() => setView('welcome')} className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div className="text-center">
          <img src={piggyLogo} alt="Piggy Bud" className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg object-cover" />
          <h1 className="text-2xl font-bold mb-1">
            {view === 'login' ? 'Entrar' : 'Criar Conta'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {view === 'login'
              ? 'Bem-vindo de volta!'
              : 'É rápido e gratuito'}
          </p>
        </div>
      </header>

      <Card className="border-0 shadow-soft">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="pl-10 rounded-xl"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-bold"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {view === 'login' ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => setView(view === 'login' ? 'signup' : 'login')}
            >
              {view === 'login'
                ? 'Não tem conta? Criar agora'
                : 'Já tem conta? Entrar'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
