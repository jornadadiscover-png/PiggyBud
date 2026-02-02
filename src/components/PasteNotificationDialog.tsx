import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseNotification, formatCurrency } from '@/lib/notification-parser';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { Category, categoryLabels, Bank, bankLabels } from '@/types';
import { ClipboardPaste, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PasteNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PasteNotificationDialog({ open, onOpenChange }: PasteNotificationDialogProps) {
  const [text, setText] = useState('');
  const [editedAmount, setEditedAmount] = useState<string>('');
  const [editedMerchant, setEditedMerchant] = useState<string>('');
  const [editedCategory, setEditedCategory] = useState<Category | ''>('');
  const [editedBank, setEditedBank] = useState<Bank | ''>('');
  
  const { addTransaction } = useTransactionStore();
  const { toast } = useToast();
  
  // Parse em tempo real
  const parsed = useMemo(() => {
    if (!text.trim()) return null;
    return parseNotification(text);
  }, [text]);
  
  // Valores finais (editados ou parseados)
  const finalAmount = editedAmount ? parseFloat(editedAmount) : parsed?.amount;
  const finalMerchant = editedMerchant || parsed?.merchant;
  const finalCategory = editedCategory || parsed?.category || 'outros';
  const finalBank = editedBank || parsed?.bank;
  const finalType = parsed?.type || 'expense';
  
  const canSubmit = finalAmount && finalAmount > 0 && finalMerchant;
  
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível acessar a área de transferência',
        variant: 'destructive',
      });
    }
  };
  
  const handleSubmit = () => {
    if (!canSubmit || !finalAmount || !finalMerchant) return;
    
    addTransaction({
      amount: finalAmount,
      merchant: finalMerchant,
      category: finalCategory as Category,
      type: finalType,
      source: 'auto',
      bank: finalBank || undefined,
      date: new Date(),
    });
    
    toast({
      title: '✅ Transação adicionada!',
      description: `${formatCurrency(finalAmount)} em ${finalMerchant}`,
    });
    
    // Reset e fecha
    setText('');
    setEditedAmount('');
    setEditedMerchant('');
    setEditedCategory('');
    setEditedBank('');
    onOpenChange(false);
  };
  
  const getConfidenceColor = () => {
    if (!parsed) return 'text-muted-foreground';
    switch (parsed.confidence) {
      case 'high': return 'text-success';
      case 'medium': return 'text-warning';
      case 'low': return 'text-destructive';
    }
  };
  
  const getConfidenceLabel = () => {
    if (!parsed) return '';
    switch (parsed.confidence) {
      case 'high': return '✓ Alta confiança';
      case 'medium': return '⚠ Média confiança';
      case 'low': return '✗ Baixa confiança';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardPaste className="w-5 h-5 text-primary" />
            Colar Notificação
          </DialogTitle>
          <DialogDescription>
            Cole o texto da notificação bancária e o app extrairá os dados automaticamente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Input de texto */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Texto da notificação</Label>
              <Button variant="ghost" size="sm" onClick={handlePaste}>
                <ClipboardPaste className="w-4 h-4 mr-1" />
                Colar
              </Button>
            </div>
            <Textarea
              placeholder='Ex: "Compra aprovada R$ 50,00 em IFOOD"'
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[100px] resize-none rounded-xl"
            />
          </div>
          
          {/* Preview do parsing */}
          {parsed && (
            <div className="p-4 rounded-xl bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Dados extraídos
                </span>
                <span className={`text-xs ${getConfidenceColor()}`}>
                  {getConfidenceLabel()}
                </span>
              </div>
              
              {/* Valor */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Valor</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={parsed.amount ? formatCurrency(parsed.amount) : 'Não detectado'}
                  value={editedAmount}
                  onChange={(e) => setEditedAmount(e.target.value)}
                  className="rounded-xl"
                />
                {parsed.amount && !editedAmount && (
                  <p className="text-xs text-muted-foreground">
                    Detectado: {formatCurrency(parsed.amount)}
                  </p>
                )}
              </div>
              
              {/* Estabelecimento */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Estabelecimento</Label>
                <Input
                  placeholder={parsed.merchant || 'Não detectado'}
                  value={editedMerchant}
                  onChange={(e) => setEditedMerchant(e.target.value)}
                  className="rounded-xl"
                />
                {parsed.merchant && !editedMerchant && (
                  <p className="text-xs text-muted-foreground">
                    Detectado: {parsed.merchant}
                  </p>
                )}
              </div>
              
              {/* Categoria */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Categoria</Label>
                <Select 
                  value={editedCategory || parsed.category} 
                  onValueChange={(v) => setEditedCategory(v as Category)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Banco */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Banco</Label>
                <Select 
                  value={editedBank || parsed.bank || ''} 
                  onValueChange={(v) => setEditedBank(v as Bank)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Não detectado" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(bankLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Tipo */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Tipo:</span>
                <span className={parsed.type === 'income' ? 'text-success' : 'text-destructive'}>
                  {parsed.type === 'income' ? '💰 Receita' : '💸 Despesa'}
                </span>
              </div>
            </div>
          )}
          
          {/* Aviso se parsing falhou */}
          {text && !parsed?.amount && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/10 text-warning">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Não consegui detectar o valor</p>
                <p className="text-xs opacity-80">
                  Preencha manualmente os campos acima.
                </p>
              </div>
            </div>
          )}
          
          {/* Botão de adicionar */}
          <Button
            className="w-full rounded-xl h-12"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            <Check className="w-5 h-5 mr-2" />
            Adicionar Transação
          </Button>
          
          {/* Exemplos */}
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Exemplos de notificações suportadas:</p>
            <ul className="space-y-0.5 opacity-70">
              <li>• "Compra aprovada R$ 50,00 em IFOOD"</li>
              <li>• "Você pagou R$ 35,90 para UBER"</li>
              <li>• "Pix recebido de R$ 1.500,00"</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
