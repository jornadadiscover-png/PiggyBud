# Restringir Relatórios ao Plano Premium

Hoje a página de Relatórios tem partes livres (Receitas/Despesas do mês, Gastos por Categoria) e partes já com `PremiumGate` (Evolução Mensal, Top 5, Resumo IA). Mas o `canAccess` em `usePremiumStore` está retornando `true` para tudo — então na prática nada está bloqueado. O objetivo é deixar **toda** a Área de Relatórios disponível somente para assinantes Premium.

## O que muda

1. **`src/stores/usePremiumStore.ts`** — `canAccess` volta a respeitar `isPremium`. Features `'advanced-reports'` e `'ai-summary'` (usadas em Relatórios) passam a exigir plano pago. Demais features continuam livres para não afetar o resto do app.

2. **`src/pages/RelatoriosPage.tsx`** — envolver também os blocos hoje livres (cards de resumo Receitas/Despesas e card "Gastos por Categoria") em `PremiumGate feature="advanced-reports"`, para que a página inteira fique bloqueada para usuário free, mostrando o overlay com botão "Ver Premium".

## Comportamento resultante

- Usuário **free**: ao abrir a aba "Relatórios", vê o cabeçalho normal e todos os cards aparecem desfocados com o cadeado e CTA para Premium (que leva à página Premium pelo `onNavigateToPremium` já existente).
- Usuário **Premium**: vê tudo normalmente, incluindo Resumo com IA.

## Fora de escopo

- Não muda Stripe, planos, preços, ou outras áreas do app (Planilha, Tutor, Calculadora, etc.).
- Não remove nem renomeia nenhuma feature existente.
