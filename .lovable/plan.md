

# Plano: Rebranding para Piggy Bud + Plano Premium com Stripe

## Visao Geral

Este plano abrange tres grandes areas:
1. **Rebranding completo** de "FinFunny" para "Piggy Bud"
2. **Uso da imagem do porquinho como logo/mascote/favicon**
3. **Melhores praticas de controle financeiro + Plano Premium com Stripe**

---

## PARTE 1: Rebranding "FinFunny" para "Piggy Bud"

### 1.1 Arquivos com texto "FinFunny" a substituir

| Arquivo | Mudanca |
|---------|---------|
| `index.html` | title, meta tags (description, author, og:title, og:description, twitter:site) |
| `vite.config.ts` | manifest name, short_name, description |
| `capacitor.config.json` | appName |
| `src/index.css` | Comentario do design system |
| `src/pages/InstallPage.tsx` | 4 referencias textuais |
| `src/components/ExportReportDialog.tsx` | titulo do relatorio, header, footer (5 referencias) |
| `src/stores/useTransactionStore.ts` | nome do persist storage ("finfunny-transactions" -> "piggy-bud-transactions") |
| `src/stores/useSettingsStore.ts` | nome do persist storage ("finfunny-settings" -> "piggy-bud-settings") |

### 1.2 Adicionar nome "Piggy Bud" na pagina inicial (FeedPage)

Adicionar o logo + nome na header da FeedPage, criando uma identidade visual forte ao abrir o app.

---

## PARTE 2: Logo, Favicon e Mascote

### 2.1 Copiar imagem do porquinho

- Copiar `user-uploads://20260204_102159_0000.png` para `public/piggy-bud-logo.png`
- Copiar para `src/assets/piggy-bud-logo.png` (para importacao em componentes React)

### 2.2 Gerar favicon e icones PWA

- Usar a imagem como base para `public/favicon.ico` (referencia no index.html)
- Substituir `public/pwa-192x192.png` e `public/pwa-512x512.png` com a nova imagem
- Substituir `public/apple-touch-icon.png` com a nova imagem

### 2.3 Atualizar o MascotAvatar

Atualmente o mascote usa emojis. Vamos atualizar para usar a imagem do porquinho como avatar principal, mantendo os emojis como expressoes sobrepostas.

### 2.4 Atualizar PinLockScreen

Substituir o icone de cadeado pela imagem do porquinho na tela de PIN.

---

## PARTE 3: Melhores Praticas de Controle Financeiro

### 3.1 Funcionalidades a adicionar (Gratuitas)

| Funcionalidade | Descricao |
|----------------|-----------|
| **Orcamento por categoria** | Definir limites de gasto por categoria (alimentacao, transporte, etc.) |
| **Indicador de saude financeira** | Score visual baseado em receitas vs despesas, habitos e metas |
| **Transacoes recorrentes** | Marcar despesas fixas (aluguel, Netflix, etc.) que se repetem todo mes |

### 3.2 Funcionalidades Premium (Stripe)

| Funcionalidade | Descricao |
|----------------|-----------|
| **Relatorios avancados com IA** | Insights personalizados usando Lovable AI (ex: "Voce gasta 40% mais em alimentacao nas sextas") |
| **Exportar PDF/Excel** | Exportacao de relatorios em formatos profissionais |
| **Metas ilimitadas** | No free: 1 meta mensal. Premium: metas por categoria, metas de economia, metas de investimento |
| **Leitura automatica de notificacoes** | A leitura automatica (Android) sera Premium |
| **Categorias personalizadas** | Criar categorias proprias alem das padrao |
| **Historico completo** | Free: 3 meses. Premium: historico ilimitado |
| **Desafios exclusivos** | Desafios Premium com recompensas especiais |
| **Sem anuncios** | Remover banners promocionais (futuro) |

---

## PARTE 4: Implementacao do Stripe Premium

### 4.1 Habilitar Stripe

Usar a ferramenta de integracao Stripe do Lovable para configurar a conexao.

### 4.2 Criar sistema de assinatura

- Criar produto "Piggy Bud Premium" no Stripe
- Plano mensal e anual
- Pagina de upgrade dentro do app
- Gate de funcionalidades premium

### 4.3 Criar Premium Store

Novo store `src/stores/usePremiumStore.ts`:

```text
PremiumStore {
  isPremium: boolean
  subscriptionId: string | null
  expiresAt: Date | null
  checkPremiumStatus(): void
  upgrade(): void
}
```

### 4.4 UI de Premium

- Pagina `/premium` com beneficios e botao de assinatura
- Badge "PRO" nos recursos premium
- Lock overlay nas funcionalidades premium com CTA de upgrade

---

## PARTE 5: Arquitetura dos Arquivos

### Arquivos a CRIAR

| Arquivo | Descricao |
|---------|-----------|
| `public/piggy-bud-logo.png` | Logo principal (copia da imagem uploaded) |
| `src/assets/piggy-bud-logo.png` | Logo para import em componentes |
| `src/stores/usePremiumStore.ts` | Store de estado premium |
| `src/components/PremiumBadge.tsx` | Badge "PRO" para marcar recursos premium |
| `src/components/PremiumGate.tsx` | Wrapper que bloqueia conteudo para usuarios free |
| `src/pages/PremiumPage.tsx` | Pagina de upgrade com beneficios e checkout |
| `src/components/BudgetByCategoryCard.tsx` | Card de orcamento por categoria |
| `src/components/FinancialHealthScore.tsx` | Score de saude financeira |

### Arquivos a MODIFICAR

| Arquivo | Mudanca |
|---------|---------|
| `index.html` | Rebranding + novo favicon |
| `vite.config.ts` | Rebranding manifest |
| `capacitor.config.json` | Rebranding appName |
| `src/index.css` | Comentario rebranding |
| `src/App.tsx` | Adicionar rota /premium |
| `src/pages/Index.tsx` | Adicionar tab premium ou integracao |
| `src/pages/FeedPage.tsx` | Logo + nome no header, indicador de saude financeira |
| `src/pages/InstallPage.tsx` | Rebranding textos + logo |
| `src/pages/ConfigPage.tsx` | Leitura automatica como premium |
| `src/pages/PerfilPage.tsx` | Badge premium, botao upgrade |
| `src/pages/RelatoriosPage.tsx` | Gate premium em relatorios avancados |
| `src/components/MascotAvatar.tsx` | Usar imagem do porquinho |
| `src/components/PinLockScreen.tsx` | Logo do porquinho |
| `src/components/ExportReportDialog.tsx` | Rebranding + gate premium |
| `src/components/ChallengesCard.tsx` | Desafios premium |
| `src/components/BottomNav.tsx` | Possivel icone premium |
| `src/stores/useTransactionStore.ts` | Rebranding persist name |
| `src/stores/useSettingsStore.ts` | Rebranding persist name + configs de orcamento |
| `src/types/index.ts` | Tipos de orcamento por categoria e premium |

---

## Ordem de Implementacao

1. **Copiar imagem e atualizar favicons/icones PWA**
2. **Rebranding de texto em todos os arquivos** (FinFunny -> Piggy Bud)
3. **Atualizar MascotAvatar e PinLockScreen** com a imagem do porquinho
4. **Adicionar logo + nome na FeedPage**
5. **Habilitar Stripe** via ferramenta Lovable
6. **Criar PremiumStore e componentes de gate**
7. **Criar pagina Premium** com beneficios e checkout
8. **Adicionar orcamento por categoria** (feature gratuita)
9. **Adicionar indicador de saude financeira** (feature gratuita)
10. **Aplicar gates premium** nos recursos corretos
11. **Testar fluxo completo**

---

## Detalhes Tecnicos

### Premium Gate Pattern

```text
<PremiumGate feature="advanced-reports">
  {/* Conteudo premium fica aqui */}
  <AdvancedReportsSection />
</PremiumGate>

// Se usuario nao for premium:
// Mostra preview embaçado + botao "Desbloquear com Premium"
```

### Score de Saude Financeira

```text
Calculo:
- Receitas > Despesas: +30 pontos
- Dentro da meta mensal: +25 pontos
- Registra transacoes regularmente: +15 pontos
- Tem fundo de emergencia (meta de economia): +15 pontos
- Diversificacao de receitas: +15 pontos

Score: 0-100
- 80-100: Excelente (verde)
- 60-79: Bom (azul)
- 40-59: Atencao (amarelo)
- 0-39: Critico (vermelho)
```

### Orcamento por Categoria

```text
Novo tipo no types/index.ts:

interface CategoryBudget {
  category: Category
  limit: number    // R$ limite mensal
  spent: number    // R$ gasto atual
}
```

### Migracao de Dados

**Importante**: Ao mudar os nomes do localStorage de `finfunny-transactions` para `piggy-bud-transactions`, sera necessario criar uma funcao de migracao que copia os dados antigos para as novas chaves, para que usuarios existentes nao percam seus dados.

