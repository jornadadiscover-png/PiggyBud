import { useState, useEffect } from "react";
import { ArrowLeft, Download, Share, MoreVertical, Plus, Check, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import piggyLogo from "@/assets/piggy-bud-logo.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPage = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="max-w-md mx-auto pt-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold mb-3">App Instalado! 🎉</h1>
            <p className="text-muted-foreground">
              O Piggy Bud já está na sua tela inicial. Aproveite!
            </p>
            <Button onClick={() => navigate("/")} className="mt-8 bg-primary hover:bg-primary/90">
              Voltar ao App
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-md mx-auto pt-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="text-center mb-8">
          <img src={piggyLogo} alt="Piggy Bud" className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-soft" />
          <h1 className="text-2xl font-bold mb-2">Instalar Piggy Bud</h1>
          <p className="text-muted-foreground">
            Adicione o app à sua tela inicial para acesso rápido!
          </p>
        </div>

        {deferredPrompt && (
          <Button onClick={handleInstall} className="w-full mb-8 h-14 text-lg bg-primary hover:bg-primary/90">
            <Download className="h-5 w-5 mr-2" />
            Instalar Agora
          </Button>
        )}

        {isIOS && (
          <Card className="mb-6 border-primary/20 bg-card/50">
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">🍎</span> No iPhone/iPad
              </h2>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <p className="font-medium">Toque em Compartilhar</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Share className="h-4 w-4" /> na barra do Safari</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <p className="font-medium">Adicionar à Tela de Início</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Plus className="h-4 w-4" /> Role e toque nesta opção</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <p className="font-medium">Confirme tocando em Adicionar</p>
                    <p className="text-sm text-muted-foreground">O Piggy Bud aparecerá na sua tela inicial!</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        {!isIOS && (
          <Card className="mb-6 border-primary/20 bg-card/50">
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">🤖</span> No Android
              </h2>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <p className="font-medium">Toque no menu</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><MoreVertical className="h-4 w-4" /> (3 pontinhos) no canto superior</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <p className="font-medium">Instalar app</p>
                    <p className="text-sm text-muted-foreground">ou "Adicionar à tela inicial"</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <p className="font-medium">Confirme a instalação</p>
                    <p className="text-sm text-muted-foreground">Pronto! O Piggy Bud estará no seu celular!</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 space-y-3">
          <h3 className="font-semibold text-center mb-4">Por que instalar?</h3>
          <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
            <span className="text-xl">⚡</span>
            <span className="text-sm">Acesso rápido pela tela inicial</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
            <span className="text-xl">📱</span>
            <span className="text-sm">Funciona como app nativo</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
            <span className="text-xl">🌙</span>
            <span className="text-sm">Tela cheia sem barra do navegador</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
            <span className="text-xl">📶</span>
            <span className="text-sm">Funciona offline</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPage;
