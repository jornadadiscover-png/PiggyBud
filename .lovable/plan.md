## Objetivo
Adicionar botões de compartilhamento (1) em cada post do Tutor de Investimentos e (2) para compartilhar o app PiggyBud em si.

## Estratégia de compartilhamento
Usar **Web Share API** (`navigator.share`) quando disponível — funciona nativamente em mobile (Android/iOS) e abre o menu nativo de compartilhamento (WhatsApp, Telegram, e-mail, etc.). Fallback para **copiar link/texto para a área de transferência** com toast de confirmação quando a API não estiver disponível (desktop).

Criar helper `src/lib/share.ts` com função `shareContent({ title, text, url })` que encapsula a lógica.

## Mudanças

### 1. `src/lib/share.ts` (novo)
- `shareContent()` — tenta `navigator.share`, fallback para `navigator.clipboard.writeText` + toast.
- Constante `APP_SHARE_URL = "https://piggybud.lovable.app"` e `APP_SHARE_TEXT` com mensagem amigável em PT-BR convidando o amigo a baixar/usar.

### 2. `src/pages/TutorPage.tsx` — botão em cada post
- Dentro de `PostCard`, adicionar botão "Compartilhar" (ícone `Share2`, variante `ghost` ou `outline` pequeno) no header do card ou no rodapé.
- Compartilha: título do post + resumo curto + link do app.
- Aplica tanto no post de hoje quanto nos posts anteriores (mesmo componente `PostCard`).

### 3. Botão "Compartilhar o app PiggyBud"
Localização: **`src/pages/MaisPage.tsx`** (página "Mais" — local natural para utilitários do app).
- Adicionar item de menu/botão com ícone `Share2` "Compartilhar PiggyBud" que chama `shareContent` com título "PiggyBud", texto convite em PT-BR e URL do app.
- Texto: algo como "Acabei de descobrir o PiggyBud, um app que me ajuda a controlar gastos com um mascote divertido! 🐽 Baixe: https://piggybud.lovable.app"

## Fora de escopo
- Sem mudanças de backend, edge functions, Supabase, Stripe, premium gating.
- Sem nova rota.
- Não mexer em outros cards/páginas.
