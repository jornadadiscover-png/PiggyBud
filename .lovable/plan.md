

# Plano: Remover Teste/Simulação e Preparar para Produção

## O que será removido

### 1. Botão e Dialog "Simular Notificação"
- **`src/components/SimulateNotificationDialog.tsx`** — deletar arquivo inteiro
- **`src/pages/FeedPage.tsx`** — remover import, estado `showSimulate`, botão "Simular" (linhas 56-63 no header e linhas 155-161), e o dialog (linha 208)
- **`src/stores/useTransactionStore.ts`** — remover função `simulateBankNotification` e seu tipo na interface
- **`src/lib/notification-service.ts`** — remover método `simulateNotification` (apenas para testes)
- **`src/hooks/useNotificationListener.ts`** — remover export de `simulateNotification`

### 2. Texto "(simulação)" nas Configurações
- **`src/pages/ConfigPage.tsx`** linha 96 — trocar "Selecione os bancos que deseja monitorar (simulação)" por "Selecione os bancos que deseja monitorar"

### 3. Texto de empty state no Feed
- **`src/pages/FeedPage.tsx`** linha 181 — trocar "Clique no botão acima para simular uma notificação bancária!" por "Adicione sua primeira transação com o botão +"

---

## O que falta para funcionar completamente

### Funcional hoje:
- ✅ Adicionar transações manualmente (botão +)
- ✅ Colar notificações bancárias (parsing automático)
- ✅ Planilha com filtros e edição
- ✅ Relatórios com gráficos
- ✅ Desafios e conquistas
- ✅ PIN de segurança
- ✅ Autenticação (login/signup)
- ✅ Premium com Stripe (checkout e verificação)
- ✅ Exportação de relatório

### Dados apenas em localStorage (não perde ao trocar de dispositivo, mas perde ao limpar dados do navegador):
- As transações, configurações e perfil ficam em `localStorage` via Zustand persist
- Para produção real, seria ideal migrar para o banco de dados (Lovable Cloud) para que os dados fiquem vinculados à conta do usuário e não se percam

### Não implementar agora (requer app nativo Android):
- Leitura automática de notificações (NotificationListenerService) — funcionalidade corretamente bloqueada para web

---

## Resumo de Mudanças

| Arquivo | Ação |
|---------|------|
| `src/components/SimulateNotificationDialog.tsx` | Deletar |
| `src/pages/FeedPage.tsx` | Remover botão simular, import e dialog |
| `src/stores/useTransactionStore.ts` | Remover `simulateBankNotification` |
| `src/lib/notification-service.ts` | Remover `simulateNotification` |
| `src/hooks/useNotificationListener.ts` | Remover export `simulateNotification` |
| `src/pages/ConfigPage.tsx` | Remover "(simulação)" do texto |

