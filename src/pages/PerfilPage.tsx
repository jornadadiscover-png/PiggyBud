import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { User, Target, Trophy, Download, Trash2, Edit2, Check, Lock, Unlock, Camera, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ExportReportDialog } from '@/components/ExportReportDialog';
import { ChallengesCard } from '@/components/ChallengesCard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PremiumGate } from '@/components/PremiumGate';

// Achievements with clear descriptions
const achievements = [
  { 
    id: '1', 
    title: 'Primeira Transação', 
    description: 'Registre sua primeira transação no app', 
    icon: '🎉',
    checkFn: (transactionCount: number) => transactionCount > 0
  },
  { 
    id: '2', 
    title: 'Economista', 
    description: 'Fique abaixo da meta mensal por 1 mês', 
    icon: '💰',
    checkFn: () => false
  },
  { 
    id: '3', 
    title: 'Disciplinado', 
    description: 'Registre gastos por 7 dias seguidos', 
    icon: '📅',
    checkFn: () => false
  },
  { 
    id: '4', 
    title: 'Investidor', 
    description: 'Registre uma receita de investimento', 
    icon: '📈',
    checkFn: (_: number, transactions: any[]) => 
      transactions.some(t => t.category === 'investimentos' && t.type === 'income')
  },
  { 
    id: '5', 
    title: 'Controlador', 
    description: 'Use o app por 30 dias', 
    icon: '🏆',
    checkFn: () => false
  },
];

// Image processing utility
const processImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_SIZE) {
            height = (height * MAX_SIZE) / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = (width * MAX_SIZE) / height;
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface PerfilPageProps {
  onNavigateToPremium?: () => void;
}

export function PerfilPage({ onNavigateToPremium }: PerfilPageProps) {
  const { profile, updateProfile } = useSettingsStore();
  const { transactions } = useTransactionStore();
  const [editingName, setEditingName] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [name, setName] = useState(profile.name);
  const [goal, setGoal] = useState(profile.monthlyGoal.toString());
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Por favor, selecione uma imagem', variant: 'destructive' });
      return;
    }
    
    try {
      const base64 = await processImage(file);
      updateProfile({ avatarUrl: base64 });
      toast({ title: 'Foto atualizada!' });
    } catch {
      toast({ title: 'Erro ao processar imagem', variant: 'destructive' });
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = () => {
    updateProfile({ avatarUrl: undefined });
    toast({ title: 'Foto removida!' });
  };

  const handleSaveName = () => {
    updateProfile({ name: name.trim() });
    setEditingName(false);
    toast({ title: 'Nome atualizado!' });
  };

  const handleSaveGoal = () => {
    const newGoal = parseFloat(goal.replace(',', '.'));
    if (!isNaN(newGoal) && newGoal > 0) {
      updateProfile({ monthlyGoal: newGoal });
      toast({ title: 'Meta atualizada!' });
    }
    setEditingGoal(false);
  };

  // Calculate unlocked achievements
  const achievementStatus = achievements.map(achievement => ({
    ...achievement,
    unlocked: achievement.checkFn(transactions.length, transactions)
  }));
  
  const unlockedCount = achievementStatus.filter(a => a.unlocked).length;
  const progressPercentage = (unlockedCount / achievements.length) * 100;

  return (
    <div className="flex flex-col min-h-screen pb-20 p-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">👤 Perfil</h1>
        <p className="text-muted-foreground">Suas informações, conquistas e desafios</p>
      </header>

      {/* Profile Card */}
      <Card className="mb-4 border-0 shadow-soft overflow-hidden">
        <div className="h-20 gradient-primary" />
        <CardContent className="relative pt-0">
          {/* Avatar with upload */}
          <div className="relative w-20 h-20 -mt-10 mb-4 group">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Avatar 
              className="w-20 h-20 border-4 border-card shadow-soft cursor-pointer transition-transform group-hover:scale-105"
              onClick={() => fileInputRef.current?.click()}
            >
              <AvatarImage src={profile.avatarUrl} alt="Foto de perfil" />
              <AvatarFallback className="bg-card">
                <User className="w-10 h-10 text-primary" />
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full shadow-md"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-3.5 h-3.5" />
            </Button>
            {profile.avatarUrl && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-1 -right-1 h-6 w-6 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleRemoveImage}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Name */}
          <div className="mb-4">
            <Label className="text-xs text-muted-foreground">Nome</Label>
            {editingName ? (
              <div className="flex gap-2 mt-1">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl"
                  placeholder="Seu nome"
                />
                <Button size="icon" onClick={handleSaveName}>
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-semibold text-lg">
                  {profile.name || 'Clique para adicionar'}
                </p>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingName(true)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-2xl font-bold text-primary">{transactions.length}</p>
              <p className="text-xs text-muted-foreground">Transações</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-2xl font-bold text-primary">{unlockedCount}/{achievements.length}</p>
              <p className="text-xs text-muted-foreground">Conquistas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Goal */}
      <Card className="mb-4 border-0 shadow-soft">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Meta Mensal</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {editingGoal ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="rounded-xl pl-10"
                  inputMode="decimal"
                />
              </div>
              <Button size="icon" onClick={handleSaveGoal}>
                <Check className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  R$ {profile.monthlyGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">Limite de gastos por mês</p>
              </div>
              <Button size="icon" variant="outline" onClick={() => setEditingGoal(true)}>
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Challenges */}
      <div className="mb-4">
        <ChallengesCard onNavigateToPremium={onNavigateToPremium} />
      </div>

      {/* Achievements */}
      <Card className="mb-4 border-0 shadow-soft">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-warning" />
              <CardTitle className="text-base">Conquistas</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">{unlockedCount}/{achievements.length}</span>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress bar */}
          <div className="mb-4">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Desbloqueie conquistas usando o app!
            </p>
          </div>

          {/* Achievement cards */}
          <div className="space-y-2">
            {achievementStatus.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  achievement.unlocked 
                    ? 'bg-warning/10 border border-warning/20' 
                    : 'bg-muted/30 opacity-60'
                }`}
              >
                <div className={`text-2xl ${!achievement.unlocked && 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${!achievement.unlocked && 'text-muted-foreground'}`}>
                    {achievement.title}
                  </p>
                  <p className="text-xs text-muted-foreground break-words">
                    {achievement.description}
                  </p>
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  achievement.unlocked ? 'text-warning' : 'text-muted-foreground'
                }`}>
                  {achievement.unlocked ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Desbloqueado</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Bloqueado</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions - Export with PremiumGate */}
      <Card className="border-0 shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <PremiumGate feature="export-pdf" onUpgrade={onNavigateToPremium}>
            <ExportReportDialog
              trigger={
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Relatório
                </Button>
              }
            />
          </PremiumGate>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar todos os dados
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
