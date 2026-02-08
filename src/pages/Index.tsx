import { useState, useEffect, useCallback } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { PinLockScreen } from '@/components/PinLockScreen';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { usePremiumStore } from '@/stores/usePremiumStore';
import { FeedPage } from '@/pages/FeedPage';
import { PlanilhaPage } from '@/pages/PlanilhaPage';
import { RelatoriosPage } from '@/pages/RelatoriosPage';
import { ConfigPage } from '@/pages/ConfigPage';
import { PerfilPage } from '@/pages/PerfilPage';
import { PremiumPage } from '@/pages/PremiumPage';
import { AuthPage } from '@/pages/AuthPage';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const { isLocked, hasSetupPin, settings, unlock } = useSettingsStore();
  const [showSetupPin, setShowSetupPin] = useState(false);
  const { checkSubscription, checkAuth, isAuthenticated } = usePremiumStore();

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        usePremiumStore.setState({
          isAuthenticated: true,
          userEmail: session.user.email || null,
        });
        // Check subscription on login
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
    checkAuth().then((authenticated) => {
      if (authenticated) checkSubscription();
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

  useEffect(() => {
    if (!hasSetupPin && settings.pinEnabled === false) {
      const timer = setTimeout(() => {
        setShowSetupPin(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasSetupPin, settings.pinEnabled]);

  const handleNavigateToAuth = useCallback(() => {
    setActiveTab('auth');
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setActiveTab('premium');
  }, []);

  const handleNavigateToPremium = useCallback(() => {
    setActiveTab('premium');
  }, []);

  if (isLocked && settings.pinEnabled) {
    return <PinLockScreen mode="verify" onSuccess={unlock} />;
  }

  if (showSetupPin && !hasSetupPin) {
    return (
      <PinLockScreen 
        mode="setup" 
        onSuccess={() => setShowSetupPin(false)} 
      />
    );
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
        return <PremiumPage onNavigateToAuth={handleNavigateToAuth} />;
      case 'auth':
        return <AuthPage onBack={() => setActiveTab('premium')} onAuthSuccess={handleAuthSuccess} />;
      default:
        return <FeedPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background safe-top">
      {renderPage()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
