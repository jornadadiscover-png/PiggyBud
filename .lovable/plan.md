

O usuário relata que mudanças aparecem no preview do editor mas NÃO aparecem ao acessar o link publicado ou pelo app PWA instalado.

**Diagnóstico:**

Dois problemas distintos, mas relacionados:

1. **Link publicado (piggybud.lovable.app) desatualizado:** Frontend só vai pro ar depois de clicar em "Publish → Update". As mudanças recentes (Tutor no BottomNav, nova AuthPage, gate de auth, etc.) ainda estão só no preview.

2. **PWA mostrando versão antiga:** O app já foi instalado antes com um service worker que está cacheando a versão antiga. Mesmo depois de republicar, o SW serve o cache até detectar atualização — e às vezes nem assim atualiza sozinho.

Olhando o `vite.config.ts`, a config PWA usa `registerType: 'autoUpdate'` — isso DEVERIA atualizar automaticamente, mas:
- O `main.tsx` desregistra SW só em preview/iframe (correto)
- Em produção (piggybud.lovable.app) o SW fica ativo e cacheado
- O `globPatterns` precachea `js/css/html` — o cache antigo persiste até o novo SW assumir, o que requer fechar TODAS as abas do app

**Solução em duas partes:**

### Parte 1 — Republicar (ação do usuário)

O usuário precisa clicar em **Publish → Update** no canto superior direito do editor para enviar as mudanças ao ar. Sem isso, nada do que foi feito recentemente vai aparecer no `piggybud.lovable.app` nem no PWA.

### Parte 2 — Forçar atualização do PWA (mudança de código)

Adicionar lógica para:
- Detectar quando há nova versão disponível
- Mostrar um toast "Nova versão disponível! Atualizar agora" 
- Ao clicar, chamar `skipWaiting()` + recarregar a página

Isso resolve o problema do PWA "preso" na versão antiga, agora e no futuro.

**Mudanças:**

| Arquivo | Mudança |
|---------|---------|
| `vite.config.ts` | Trocar `registerType: 'autoUpdate'` por `'prompt'` para controlar o update via UI |
| `src/main.tsx` | Adicionar listener `useRegisterSW` que mostra toast de atualização quando nova versão chega |
| (opcional) `src/components/PWAUpdatePrompt.tsx` | Componente novo que escuta o SW e mostra prompt |

**O que vou fazer no modo de implementação:**

1. Configurar `registerType: 'prompt'` no `vite.config.ts`
2. Criar componente `PWAUpdatePrompt` que usa `useRegisterSW` do `virtual:pwa-register/react` para detectar updates e mostrar um toast Sonner com botão "Atualizar"
3. Montar esse componente no `App.tsx`

**Importante explicar ao usuário:**

- Mudanças de **frontend** (UI, telas, navegação) só aparecem no link publicado depois de clicar em **Publish → Update**
- Mudanças de **backend** (edge functions, banco) já vão automaticamente
- Para o **PWA já instalado**, depois de republicar o usuário precisa: fechar todas as abas/janelas do app e reabrir — ou aguardar o novo prompt de atualização que vou implementar
- Em último caso, desinstalar e reinstalar o PWA

