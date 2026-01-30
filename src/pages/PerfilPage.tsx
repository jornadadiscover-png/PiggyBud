import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { User, Target, Trophy, Download, Trash2, Edit2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock achievements
const achievements = [
  { id: '1', title: 'Primeira Transação', description: 'Registrou sua primeira transação', icon: '🎉', unlocked: true },
  { id: '2', title: 'Economista', description: 'Ficou abaixo da meta por 1 mês', icon: '💰', unlocked: false },
  { id: '3', title: 'Disciplinado', description: 'Registrou gastos por 7 dias seguidos', icon: '📅', unlocked: false },
  { id: '4', title: 'Investidor', description: 'Registrou uma receita de investimento', icon: '📈', unlocked: false },
  { id: '5', title: 'Controlador', description: '30 dias usando o app', icon: '🏆', unlocked: false },
];

export function PerfilPage() {
  const { profile, updateProfile } = useSettingsStore();
  const { transactions } = useTransactionStore();
  const [editingName, setEditingName] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [name, setName] = useState(profile.name);
  const [goal, setGoal] = useState(profile.monthlyGoal.toString());
  const { toast } = useToast();

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

  const handleExport = () => {
    const data = {
      profile,
      transactions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finmood-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: '📦 Dados exportados!', description: 'Arquivo baixado com sucesso.' });
  };

  const unlockedCount = achievements.filter((a) => a.unlocked || transactions.length > 0).length;

  return (
    <div className="flex flex-col min-h-screen pb-20 p-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">👤 Perfil</h1>
        <p className="text-muted-foreground">Suas informações e conquistas</p>
      </header>

      {/* Profile Card */}
      <Card className="mb-4 border-0 shadow-soft overflow-hidden">
        <div className="h-20 gradient-primary" />
        <CardContent className="relative pt-0">
          <div className="w-20 h-20 rounded-full bg-card border-4 border-card flex items-center justify-center -mt-10 mb-4 shadow-soft">
            <User className="w-10 h-10 text-primary" />
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
              <p className="text-2xl font-bold text-primary">{unlockedCount}</p>
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

      {/* Achievements */}
      <Card className="mb-4 border-0 shadow-soft">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-warning" />
            <CardTitle className="text-base">Conquistas</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {achievements.map((achievement) => {
              const isUnlocked = achievement.unlocked || (achievement.id === '1' && transactions.length > 0);
              return (
                <div
                  key={achievement.id}
                  className={`aspect-square rounded-xl flex items-center justify-center text-2xl ${
                    isUnlocked 
                      ? 'bg-warning/10' 
                      : 'bg-muted/50 grayscale opacity-50'
                  }`}
                  title={`${achievement.title}: ${achievement.description}`}
                >
                  {achievement.icon}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="border-0 shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start rounded-xl"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar dados (JSON)
          </Button>
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
