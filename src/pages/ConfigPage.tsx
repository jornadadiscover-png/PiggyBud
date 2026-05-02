import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Bell, Sliders, Lock, Palette, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PinLockScreen } from '@/components/PinLockScreen';
import { applyReminderSettings, requestNotificationPermission } from '@/lib/reminders';
import type { ThemeId } from '@/types';


interface ConfigPageProps {
  onNavigateToPremium?: () => void;
}

const themes: { id: ThemeId; name: string; colors: [string, string] }[] = [
  { id: 'default', name: 'Padrão', colors: ['hsl(270 70% 50%)', 'hsl(320 80% 55%)'] },
  { id: 'dark', name: 'Escuro', colors: ['hsl(270 30% 12%)', 'hsl(270 70% 60%)'] },
  { id: 'ocean', name: 'Oceano', colors: ['hsl(200 80% 45%)', 'hsl(175 75% 40%)'] },
  { id: 'sunset', name: 'Pôr do Sol', colors: ['hsl(25 90% 55%)', 'hsl(350 80% 55%)'] },
];

export function ConfigPage({ onNavigateToPremium: _onNavigateToPremium }: ConfigPageProps) {
  const { settings, updateSettings, resetPin } = useSettingsStore();
  const [showPinSetup, setShowPinSetup] = useState(false);
  const { toast } = useToast();

  const handlePinSetupSuccess = () => {
    setShowPinSetup(false);
    toast({
      title: '🔐 PIN configurado!',
      description: 'Seu app agora está protegido.',
    });
  };

  const handleResetPin = () => {
    resetPin();
    toast({
      title: 'PIN removido',
      description: 'A proteção por PIN foi desativada.',
    });
  };

  const handleToggleDaily = async (checked: boolean) => {
    if (checked) {
      const ok = await requestNotificationPermission();
      if (!ok) {
        toast({
          title: 'Permissão necessária',
          description: 'Permita notificações no navegador para receber lembretes.',
          variant: 'destructive',
        });
        return;
      }
    }
    updateSettings({ dailyReminderEnabled: checked });
    await applyReminderSettings();
  };

  const handleToggleWeekly = async (checked: boolean) => {
    if (checked) {
      const ok = await requestNotificationPermission();
      if (!ok) {
        toast({
          title: 'Permissão necessária',
          description: 'Permita notificações no navegador para receber o resumo semanal.',
          variant: 'destructive',
        });
        return;
      }
    }
    updateSettings({ weeklyReportEnabled: checked });
    await applyReminderSettings();
  };

  const handleReminderTimeChange = async (time: string) => {
    updateSettings({ reminderTime: time });
    await applyReminderSettings();
  };

  const handleThemeChange = (id: ThemeId, name: string) => {
    updateSettings({ theme: id });
    document.documentElement.dataset.theme = id;
    toast({ title: `Tema "${name}" aplicado!` });
  };

  if (showPinSetup) {
    return <PinLockScreen mode="setup" onSuccess={handlePinSetupSuccess} />;
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 p-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">⚙️ Configurações</h1>
        <p className="text-muted-foreground">Personalize seu app</p>
      </header>

      {/* Notifications Section */}
      <Card className="mb-4 border-0 shadow-soft">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Lembretes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Lembrete diário</Label>
              <p className="text-xs text-muted-foreground">
                "Vamos fechar o caixa do dia?"
              </p>
            </div>
            <Switch
              checked={settings.dailyReminderEnabled}
              onCheckedChange={handleToggleDaily}
            />
          </div>

          {settings.dailyReminderEnabled && (
            <div className="flex items-center gap-4">
              <Label className="text-sm">Horário</Label>
              <Input
                type="time"
                value={settings.reminderTime}
                onChange={(e) => handleReminderTimeChange(e.target.value)}
                className="w-28 rounded-xl"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label>Resumo semanal</Label>
              <p className="text-xs text-muted-foreground">
                Domingo à noite
              </p>
            </div>
            <Switch
              checked={settings.weeklyReportEnabled}
              onCheckedChange={handleToggleWeekly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Personality Section */}
      <Card className="mb-4 border-0 shadow-soft">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Personalidade</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Label className="text-sm mb-2 block">Sensibilidade das reações</Label>
          <Select 
            value={settings.reactionSensitivity} 
            onValueChange={(v) => updateSettings({ reactionSensitivity: v as any })}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">😌 Mais suave</SelectItem>
              <SelectItem value="medium">😄 Equilibrado</SelectItem>
              <SelectItem value="high">🤪 Mais engraçado</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Premium Themes Section */}
      <PremiumGate feature="premium-themes" onUpgrade={onNavigateToPremium}>
        <Card className="mb-4 border-0 shadow-soft">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Temas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setSelectedTheme(theme.id);
                    toast({ title: `Tema "${theme.name}" aplicado!` });
                  }}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    selectedTheme === theme.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex gap-1">
                    {theme.colors.map((color, i) => (
                      <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{theme.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </PremiumGate>

      {/* Security Section */}
      <Card className="border-0 shadow-soft">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Segurança</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Proteção por PIN</Label>
              <p className="text-xs text-muted-foreground">
                {settings.pinEnabled ? 'PIN configurado' : 'Proteja seus dados'}
              </p>
            </div>
            {settings.pinEnabled ? (
              <Button variant="outline" size="sm" onClick={handleResetPin}>
                Remover
              </Button>
            ) : (
              <Button size="sm" onClick={() => setShowPinSetup(true)}>
                Configurar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Force update */}
      <Card className="mt-4 border-0 shadow-soft">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Atualização do app</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Não está vendo as funções mais recentes? Force a limpeza do cache.
          </p>
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => {
              window.location.href = '/reset';
            }}
          >
            Forçar atualização agora
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
