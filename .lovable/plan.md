

# Plano: Calculadora Especial + Tutor Diário de Investimentos

## Visão Geral

Adicionar duas novas seções ao app:
1. **Calculadora Financeira** — gratuita, com cálculos comuns e especiais (juros compostos, financiamento, meta de economia, etc.)
2. **Tutor de Investimentos** — Premium, com post diário gerado por IA às 7h (Brasília) com resumo de notícias + dicas educativas

---

## 1. Calculadora Financeira (gratuita)

Nova página `src/pages/CalculadoraPage.tsx` com abas:

| Aba | Funções |
|-----|---------|
| **Comum** | Calculadora simples (+, −, ×, ÷, %) |
| **Juros Compostos** | Valor inicial + aporte mensal + taxa + tempo → montante final + gráfico |
| **Financiamento** | Valor + entrada + taxa + parcelas → valor da parcela (Tabela Price) |
| **Meta de Economia** | Quanto guardar/mês para atingir um valor em X meses |
| **Conversor** | Quanto rende R$X no CDI/Poupança/Tesouro Selic (taxas fixas embutidas) |

Tudo client-side, sem precisar de IA. Adicionar entrada no `BottomNav` substituindo ou adicionando ao lado dos itens atuais.

## 2. Tutor de Investimentos (Premium)

Nova página `src/pages/TutorPage.tsx` com:
- **Post do dia** (card grande no topo): resumo de notícias + 1 dica prática
- **Histórico** dos últimos 7 posts
- **Biblioteca de explicações** por tipo de investimento (Tesouro, CDB, Ações, FIIs, Cripto, Fundos) — cards expansíveis com linguagem leiga e exemplos numéricos

### Arquitetura técnica

```text
Cron pg_cron (todo dia 10:00 UTC = 07:00 Brasília)
       │
       └──→ Edge Function: generate-daily-tutor
              │
              ├── Busca notícias de 3 fontes gratuitas:
              │     • InfoMoney RSS
              │     • Valor Investe RSS
              │     • UOL Economia RSS
              │
              ├── Envia conteúdo + prompt para Lovable AI (Gemini 2.5 Flash)
              │     "Resuma em linguagem simples para iniciante,
              │      com 1 dica prática e 1 conceito explicado"
              │
              └── Salva post na tabela `daily_tutor_posts`

Frontend: TutorPage lê posts via supabase.from('daily_tutor_posts')
```

### Banco de dados (nova tabela)

```text
daily_tutor_posts
  id, post_date (unique), title, summary,
  tip, concept_title, concept_explanation,
  sources (jsonb), created_at
```

RLS: leitura pública (todos podem ver), insert apenas via service role (edge function).

### Edge Functions (criar)

| Função | Propósito |
|--------|-----------|
| `generate-daily-tutor` | Busca RSS, chama IA, insere post. Acionada por pg_cron diário |
| Trigger manual | Mesma função pode ser chamada manualmente para teste/backfill |

### Cron (pg_cron + pg_net)

Agendamento: `0 10 * * *` (10h UTC = 7h Brasília, considerando horário padrão).

### PremiumGate

A `TutorPage` inteira fica protegida com `PremiumGate` (feature: novo `'daily-tutor'` em `PremiumFeature`). Usuários free veem preview borrado + CTA para Premium.

## 3. Atualizações de UI

- **`BottomNav.tsx`**: reorganizar para incluir nova aba (sugiro substituir "Config" por menu "Mais" ou adicionar "Tutor" no lugar de uma das abas menos usadas — perguntar ao usuário)
- **`PremiumPage.tsx`**: adicionar "Tutor Diário de Investimentos" e "Calculadora Financeira" (a calculadora é grátis mas vale destacar como benefício do app) na lista de features
- **`Index.tsx`**: registrar rotas `calculadora` e `tutor` no switch de tabs
- **`src/types/index.ts`**: adicionar `'daily-tutor'` em `PremiumFeature`
- **`usePremiumStore.ts`**: incluir `'daily-tutor'` na lista de features Premium

---

## Resumo de Arquivos

| Arquivo | Ação |
|---------|------|
| `src/pages/CalculadoraPage.tsx` | Criar — calculadora com 5 abas |
| `src/pages/TutorPage.tsx` | Criar — tutor diário Premium |
| `src/components/BottomNav.tsx` | Editar — adicionar abas novas |
| `src/components/Index.tsx` | Editar — registrar novas rotas |
| `src/pages/PremiumPage.tsx` | Editar — listar nova feature |
| `src/types/index.ts` | Editar — adicionar `daily-tutor` |
| `src/stores/usePremiumStore.ts` | Editar — incluir feature |
| Tabela `daily_tutor_posts` | Criar via migration |
| `supabase/functions/generate-daily-tutor/index.ts` | Criar — RSS + IA |
| pg_cron + pg_net | Agendar 10h UTC diário |

## Pergunta antes de implementar

Como o `BottomNav` só comporta 5 abas e já está cheio (Feed, Planilha, Premium, Config, Perfil), preciso decidir como acomodar **Calculadora** e **Tutor**:

1. **Substituir 2 abas existentes** por Calculadora e Tutor (mover Config e Perfil para um menu hambúrguer ou para dentro do Perfil)
2. **Criar uma aba "Mais"** que abre um menu com Calculadora, Tutor, Config e Perfil
3. **Deixar como sub-páginas** acessíveis a partir do Feed (cards de atalho na home)

Recomendo a opção **2** (menu "Mais") por ser a mais escalável e padrão em apps móveis. Confirma?

