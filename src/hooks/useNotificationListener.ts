import { useEffect, useCallback } from 'react';
import { notificationService, NotificationData } from '@/lib/notification-service';
import { ParsedNotification } from '@/lib/notification-parser';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useToast } from '@/hooks/use-toast';

interface UseNotificationListenerOptions {
  autoAdd?: boolean;
  onNotification?: (parsed: ParsedNotification, raw: NotificationData) => void;
}

/**
 * Hook para gerenciar o listener de notificações bancárias
 */
export function useNotificationListener(options: UseNotificationListenerOptions = {}) {
  const { addTransaction } = useTransactionStore();
  const { settings } = useSettingsStore();
  const { toast } = useToast();
  
  const handleNotification = useCallback((
    parsed: ParsedNotification,
    raw: NotificationData
  ) => {
    // Verifica se o banco está habilitado nas configurações
    if (parsed.bank && !settings.enabledBanks.includes(parsed.bank)) {
      return;
    }
    
    // Callback customizado
    options.onNotification?.(parsed, raw);
    
    // Auto-adicionar se configurado
    const shouldAutoAdd = options.autoAdd ?? settings.autoAddTransactions;
    
    if (shouldAutoAdd && parsed.amount && parsed.merchant) {
      const transaction = addTransaction({
        amount: parsed.amount,
        merchant: parsed.merchant,
        category: parsed.category,
        type: parsed.type,
        source: 'auto',
        bank: parsed.bank || undefined,
        date: new Date(),
      });
      
      // Toast com reação
      toast({
        title: transaction.mood,
        description: `${parsed.type === 'income' ? '+' : '-'} R$ ${parsed.amount.toFixed(2)} em ${parsed.merchant}`,
      });
    }
  }, [
    addTransaction,
    settings.enabledBanks,
    settings.autoAddTransactions,
    options,
    toast,
  ]);
  
  useEffect(() => {
    // Só inicia se leitura automática estiver habilitada
    if (!settings.autoReadEnabled) {
      return;
    }
    
    // Registra o listener
    const unsubscribe = notificationService.onNotification(handleNotification);
    
    // Inicia o monitoramento
    notificationService.startListening();
    
    return () => {
      unsubscribe();
    };
  }, [settings.autoReadEnabled, handleNotification]);
  
  return {
    isAvailable: notificationService.isAvailable(),
    isWeb: notificationService.isWeb(),
    hasPermission: notificationService.hasPermission,
    requestPermission: notificationService.requestPermission.bind(notificationService),
    startListening: notificationService.startListening.bind(notificationService),
    stopListening: notificationService.stopListening.bind(notificationService),
    simulateNotification: notificationService.simulateNotification.bind(notificationService),
  };
}
