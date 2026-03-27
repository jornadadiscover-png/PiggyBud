import { parseNotification, ParsedNotification, bankPackages } from './notification-parser';

export interface NotificationData {
  packageName: string;
  title: string;
  text: string;
  timestamp: number;
}

type NotificationCallback = (parsed: ParsedNotification, raw: NotificationData) => void;

/**
 * Serviço de leitura de notificações
 * Na web: apenas simulação
 * No Android nativo: integra com NotificationListenerService
 */
class NotificationService {
  private listeners: NotificationCallback[] = [];
  private isListening = false;
  
  /**
   * Verifica se o serviço está disponível na plataforma
   * True apenas em Android nativo com o plugin configurado
   */
  isAvailable(): boolean {
    // Verifica se está rodando no Capacitor nativo
    return typeof (window as any).Capacitor !== 'undefined' &&
           (window as any).Capacitor.isNativePlatform?.() === true &&
           (window as any).Capacitor.getPlatform?.() === 'android';
  }
  
  /**
   * Verifica se está rodando em plataforma web/PWA
   */
  isWeb(): boolean {
    return !this.isAvailable();
  }
  
  /**
   * Verifica se tem permissão para ler notificações
   */
  async hasPermission(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }
    
    try {
      // Chama o plugin nativo (precisa ser implementado no Android)
      const result = await (window as any).NotificationListener?.hasPermission?.();
      return result?.granted === true;
    } catch {
      return false;
    }
  }
  
  /**
   * Solicita permissão para ler notificações
   * Abre as configurações do Android para o usuário habilitar
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('NotificationService: Não disponível nesta plataforma');
      return false;
    }
    
    try {
      // Abre tela de configurações de NotificationListener
      await (window as any).NotificationListener?.requestPermission?.();
      
      // Aguarda um pouco e verifica se foi concedida
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await this.hasPermission();
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  }
  
  /**
   * Inicia o monitoramento de notificações
   */
  startListening(): void {
    if (this.isListening) return;
    
    this.isListening = true;
    
    if (this.isAvailable()) {
      // Registra callback no plugin nativo
      (window as any).NotificationListener?.addListener?.(
        'notificationReceived',
        (notification: NotificationData) => {
          this.handleNotification(notification);
        }
      );
    }
    
    console.log('NotificationService: Monitoramento iniciado');
  }
  
  /**
   * Para o monitoramento de notificações
   */
  stopListening(): void {
    this.isListening = false;
    
    if (this.isAvailable()) {
      (window as any).NotificationListener?.removeAllListeners?.();
    }
    
    console.log('NotificationService: Monitoramento parado');
  }
  
  /**
   * Registra um callback para receber notificações parseadas
   */
  onNotification(callback: NotificationCallback): () => void {
    this.listeners.push(callback);
    
    // Retorna função para remover o listener
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Processa uma notificação recebida
   */
  private handleNotification(notification: NotificationData): void {
    // Verifica se é de um banco monitorado
    if (!bankPackages[notification.packageName]) {
      return;
    }
    
    // Combina título e texto para parsing
    const fullText = `${notification.title} ${notification.text}`;
    
    // Faz o parsing
    const parsed = parseNotification(fullText, notification.packageName);
    
    // Notifica todos os listeners
    for (const listener of this.listeners) {
      try {
        listener(parsed, notification);
      } catch (error) {
        console.error('Erro no listener de notificação:', error);
      }
    }
  }
  
}

// Singleton
export const notificationService = new NotificationService();
