import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { PinLockScreen } from '@/components/PinLockScreen';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { usePremiumStore } from '@/stores/usePremiumStore';
import { AuthPage } from '@/pages/AuthPage';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const FeedPage = lazy(() => import('@/pages/FeedPage').then(m => ({ default: m.FeedPage })));
const PlanilhaPage = lazy(() => import('@/pages/PlanilhaPage').then(m => ({ default: m.PlanilhaPage })));
const RelatoriosPage = lazy(() => import('@/pages/RelatoriosPage').then(m => ({ default: m.RelatoriosPage })));
const ConfigPage = lazy(() => import('@/pages/ConfigPage').then(m => ({ default: m.ConfigPage })));
const PerfilPage = lazy(() => import('@/pages/PerfilPage').then(m => ({ default: m.PerfilPage })));
const PremiumPage = lazy(() => import('@/pages/PremiumPage').then(m => ({ default: m.PremiumPage })));
const CalculadoraPage = lazy(() => import('@/pages/CalculadoraPage').then(m => ({ default: m.CalculadoraPage })));
const TutorPage = lazy(() => import('@/pages/TutorPage').then(m => ({ default: m.TutorPage })));
const MaisPage = lazy(() => import('@/pages/MaisPage').then(m => ({ default: m.MaisPage })));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const Index = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const { isLocked, hasSetupPin, settings, unlock, bindPinToUser } = useSettingsStore();
  const { checkSubscription, checkAuth, isAuthenticated } = usePremiumStore();
  const [authChecked, setAuthChecked] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        usePremiumStore.setState({
          isAuthenticated: true,
          userEmail: session.user.email || null,
        });
        bindPinToUser(session.user.id);
        if (event === 'SIGNED_IN') {
          checkSubscription();
        }
      } else {
        usePremiumStore.setState({
          isAuthenticated: false,
          userEmail: null,
        });
      }
    });

    // Check auth on mount
    checkAuth().then(async (authenticated) => {
      if (authenticated) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) bindPinToUser(session.user.id);
        checkSubscription();
      }
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-refresh subscription every 60 seconds if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => checkSubscription(), 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Check for tab param in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, []);

  const handleNavigateToPremium = useCallback(() => {
    setActiveTab('premium');
  }, []);

  // Loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // GATE 1: Auth required
  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={() => setActiveTab('feed')} />;
  }

  // GATE 2: PIN lock (if user has PIN set)
  if (isLocked && settings.pinEnabled) {
    return <PinLockScreen mode="verify" onSuccess={unlock} />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedPage />;
      case 'planilha':
        return <PlanilhaPage />;
      case 'relatorios':
        return <RelatoriosPage onNavigateToPremium={handleNavigateToPremium} />;
      case 'config':
        return <ConfigPage onNavigateToPremium={handleNavigateToPremium} />;
      case 'perfil':
        return <PerfilPage onNavigateToPremium={handleNavigateToPremium} />;
      case 'premium':
        return <PremiumPage onNavigateToAuth={() => {}} />;
      case 'calculadora':
        return <CalculadoraPage />;
      case 'tutor':
        return <TutorPage onNavigateToPremium={handleNavigateToPremium} />;
      case 'mais':
        return <MaisPage onNavigate={setActiveTab} />;
      default:
        return <FeedPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background safe-top">
      <Suspense fallback={<PageLoader />}>{renderPage()}</Suspense>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
