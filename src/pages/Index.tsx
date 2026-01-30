import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { PinLockScreen } from '@/components/PinLockScreen';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { FeedPage } from '@/pages/FeedPage';
import { PlanilhaPage } from '@/pages/PlanilhaPage';
import { RelatoriosPage } from '@/pages/RelatoriosPage';
import { ConfigPage } from '@/pages/ConfigPage';
import { PerfilPage } from '@/pages/PerfilPage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const { isLocked, hasSetupPin, settings, unlock } = useSettingsStore();
  const [showSetupPin, setShowSetupPin] = useState(false);

  // Check if first time user
  useEffect(() => {
    if (!hasSetupPin && settings.pinEnabled === false) {
      // First time - prompt for PIN setup after a delay
      const timer = setTimeout(() => {
        setShowSetupPin(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasSetupPin, settings.pinEnabled]);

  // Handle PIN verification
  if (isLocked && settings.pinEnabled) {
    return <PinLockScreen mode="verify" onSuccess={unlock} />;
  }

  // Handle first time PIN setup
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
        return <RelatoriosPage />;
      case 'config':
        return <ConfigPage />;
      case 'perfil':
        return <PerfilPage />;
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
