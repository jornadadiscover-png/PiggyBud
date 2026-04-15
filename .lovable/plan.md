

# Plano: Limpeza Final + Offline + Melhorias de Produção

## 1. Remover toda a funcionalidade de "Leitura Automática de Notificações"

Esta funcionalidade só funcionaria num app Android nativo com Capacitor + NotificationListenerService, que não é o caso atual (é uma PWA web). Vamos remover completamente:

| Arquivo | Ação |
|---------|------|
| `src/lib/notification-service.ts` | Deletar arquivo |
| `src/lib/notification-parser.ts` | Manter (usado pelo "Colar Notificação") |
| `src/hooks/useNotificationListener.ts` | Deletar arquivo |
| `src/pages/ConfigPage.tsx` | Remover seção "Leitura Automática" inteira (linhas 126-187), remover import do `useNotificationListener`, `BellRing`, `AlertCircle` |
| `src/pages/PremiumPage.tsx` | Remover o item "Leitura Automática" da lista de features Premium (linha 17) e import `BellRing` |
| `src/stores/useSettingsStore.ts` | Remover campos `autoReadEnabled`, `autoAddTransactions`, `lastAutoReadAt` do `defaultSettings` e do tipo `AppSettings` |
| `src/types/index.ts` | Remover `autoReadEnabled`, `autoAddTransactions`, `lastAutoReadAt` de `AppSettings`; remover `'auto-read'` de `PremiumFeature` |
| `capacitor.config.json` | Manter por enquanto (pode ser útil futuramente) |

## 2. Garantir funcionamento offline (PWA)

O PWA já está configurado com `vite-plugin-pwa` e Workbox, mas falta a **guarda de segurança** para não registrar o service worker no preview/iframe do Lovable (causa problemas de cache). Isso é obrigatório.

**Arquivo: `src/main.tsx`** — Adicionar guarda antes do render:
```text
1. Detectar se está em iframe ou em domínio de preview
2. Se sim, desregistrar service workers existentes
3. Se não, permitir registro normal do PWA
```

**Arquivo: `vite.config.ts`** — Adicionar `devOptions: { enabled: false }` e `navigateFallbackDenylist: [/^\/~oauth/]` para evitar problemas no dev.

Os dados já funcionam offline porque estão em `localStorage` via Zustand persist. As transações, configurações e perfil do usuário já estão disponíveis offline.

## 3. Melhorias de robustez e profissionalismo

### 3a. Remover `TransactionSource: 'auto'` que não tem mais uso
- `src/types/index.ts` — Remover `'auto'` de `TransactionSource` (ficará apenas `'manual'`)

### 3b. Atualizar o og:image para usar imagem própria
- `index.html` — Trocar a imagem OG padrão do Lovable por `/piggy-bud-logo.png`

### 3c. Remover import não utilizado
- `src/pages/ConfigPage.tsx` — Limpar imports que ficarem órfãos após remoção da seção de leitura automática

## Resumo

| Categoria | Mudança |
|-----------|---------|
| Remoção | Toda funcionalidade de leitura automática de notificações (2 arquivos deletados, 5 editados) |
| Offline | Adicionar guarda de service worker no `main.tsx`, ajustar config PWA |
| Qualidade | Limpar tipos órfãos, corrigir og:image |

