import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
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
            variant="outline"
            className="w-full h-12 rounded-xl font-semibold bg-background"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continuar com Google
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <Button
            className="w-full h-12 rounded-xl font-bold gradient-primary text-primary-foreground"
            onClick={() => setView('signup')}
          >
            Criar conta com email
          </Button>
          <Button
            variant="ghost"
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
