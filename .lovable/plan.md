
# Plano: Integracao Completa do Premium com Stripe

## Situacao Atual

O app tem a **interface do Premium pronta** (pagina, badges, gate component) mas **nada esta funcional**:
- O botao "Assinar Premium" nao faz nada
- O `PremiumGate` existe mas nao e usado em nenhum lugar
- Nao existe backend (sem Supabase/Cloud, sem edge functions)
- Nao existe sistema de autenticacao (necessario para assinaturas)

**Precos no Stripe confirmados** (ja criados e corretos):
- Mensal: R$ 9,90/mes (`price_1SxT363XMRup5szXx8FiZXjM`)
- Anual: R$ 70,80/ano (`price_1SyYGd3XMRup5szX9pqKXTKM`)

Os valores na tela ja estao corretos e batem com o Stripe.

---

## O que sera implementado

### 1. Configurar Lovable Cloud (Supabase)

Ativar o backend Cloud para ter acesso a edge functions e autenticacao.

### 2. Autenticacao Simples

Criar um fluxo de login/cadastro com email para que o Stripe possa identificar o assinante. Sera adicionada uma tela de auth acessivel pela pagina Premium.

- Criar `src/integrations/supabase/client.ts` (cliente Supabase)
- Criar `src/pages/AuthPage.tsx` (login/cadastro por email)
- Atualizar `src/App.tsx` com rota `/auth`

### 3. Edge Functions do Stripe

Criar 3 edge functions:

| Funcao | Descricao |
|--------|-----------|
| `create-checkout` | Cria sessao de checkout do Stripe para mensal ou anual |
| `check-subscription` | Verifica se o usuario tem assinatura ativa |
| `customer-portal` | Abre o portal do Stripe para gerenciar assinatura |

### 4. Fluxo de Checkout na PremiumPage

- Usuario seleciona plano (mensal ou anual)
- Se nao estiver logado, redireciona para login
- Se logado, chama `create-checkout` e abre o Stripe Checkout
- Apos pagamento, retorna e verifica assinatura automaticamente

### 5. Verificacao Automatica de Assinatura

- Ao carregar o app, verificar status da assinatura via `check-subscription`
- Atualizar o `usePremiumStore` com o resultado
- Re-verificar periodicamente (a cada 60 segundos)

### 6. Aplicar PremiumGate nas Funcionalidades

| Funcionalidade | Onde aplicar | Feature ID |
|----------------|--------------|------------|
| Exportar PDF | `PerfilPage.tsx` (botao Exportar) | `export-pdf` |
| Leitura Automatica | `ConfigPage.tsx` (secao auto-read) | `auto-read` |
| Relatorios Avancados | `RelatoriosPage.tsx` (evolucao mensal + top 5) | `advanced-reports` |
| Desafios Exclusivos | `ChallengesCard.tsx` (desafio "Abaixo da Meta") | `exclusive-challenges` |

### 7. Pagina de Sucesso pos-pagamento

Criar pagina `/payment-success` que verifica a assinatura e redireciona ao app.

---

## Detalhes Tecnicos

### Edge Function: create-checkout

Recebe `{ priceId: string }` do frontend. Usa o email do usuario autenticado para criar ou encontrar o cliente no Stripe. Cria sessao de checkout com `mode: "subscription"`.

Os price IDs serao hardcoded no frontend:

```text
MONTHLY_PRICE_ID = "price_1SxT363XMRup5szXx8FiZXjM"  (R$ 9,90)
ANNUAL_PRICE_ID  = "price_1SyYGd3XMRup5szX9pqKXTKM"   (R$ 70,80)
```

### Edge Function: check-subscription

Busca o cliente no Stripe pelo email, verifica se tem assinatura ativa, retorna `{ subscribed: boolean, subscription_end: string | null }`.

### Edge Function: customer-portal

Cria sessao do portal de gerenciamento para o cliente cancelar ou trocar plano.

### Atualizacao do PremiumStore

Adicionar:
- `checkSubscription()`: chama edge function e atualiza estado
- `productId`: para rastrear qual produto esta assinado

### Fluxo do Usuario

```text
1. Usuario abre aba Premium
2. Ve beneficios e precos (R$ 9,90/mes ou R$ 5,90/mes anual)
3. Seleciona plano e clica "Assinar"
4. Se nao logado -> tela de login/cadastro
5. Se logado -> abre Stripe Checkout (nova aba)
6. Paga no Stripe -> retorna ao app
7. App verifica assinatura -> desbloqueia recursos
8. PremiumGates somem e conteudo premium fica acessivel
```

### Gerenciamento de Assinatura

Na PremiumPage quando usuario ja e premium:
- Mostrar data de vencimento da assinatura
- Botao "Gerenciar Assinatura" que abre o Stripe Customer Portal
- Botao "Atualizar Status" para re-verificar

---

## Arquivos a Criar

| Arquivo | Descricao |
|--------|-----------|
| `src/integrations/supabase/client.ts` | Cliente Supabase |
| `src/pages/AuthPage.tsx` | Pagina de login/cadastro |
| `supabase/functions/create-checkout/index.ts` | Edge function checkout |
| `supabase/functions/check-subscription/index.ts` | Edge function verificacao |
| `supabase/functions/customer-portal/index.ts` | Edge function portal |

## Arquivos a Modificar

| Arquivo | Mudanca |
|--------|---------|
| `src/App.tsx` | Adicionar rotas /auth e /payment-success |
| `src/stores/usePremiumStore.ts` | Adicionar checkSubscription, integracao Supabase |
| `src/pages/PremiumPage.tsx` | Selecao de plano, botao checkout funcional, gerenciamento |
| `src/pages/RelatoriosPage.tsx` | Aplicar PremiumGate em relatorios avancados |
| `src/pages/ConfigPage.tsx` | Aplicar PremiumGate na leitura automatica |
| `src/pages/PerfilPage.tsx` | Aplicar PremiumGate na exportacao, badge premium |
| `src/components/ChallengesCard.tsx` | Marcar desafio exclusivo como premium |
| `src/components/PremiumGate.tsx` | Melhorar com navegacao para /premium |
