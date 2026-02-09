
# Plano: Correcao de Textos, Nova Imagem e Emojis Contextuais

## 1. Corrigir textos cortados no Perfil

Na pagina `PerfilPage.tsx`, as descricoes das conquistas estao com `truncate` (linha 331), o que corta o texto. A correcao sera:

- **Conquistas**: Remover `truncate` da descricao das conquistas para que o texto apareca completo
- **Achievement cards**: Permitir que a descricao quebre em multiplas linhas com `text-wrap`

**Arquivo**: `src/pages/PerfilPage.tsx`
- Linha 331: trocar `truncate` por `break-words` ou simplesmente remover o truncate

---

## 2. Trocar a imagem do porquinho

A imagem atual esta em `src/assets/piggy-bud-logo.png`. Sera substituida pela nova imagem fornecida pelo usuario (o porquinho preocupado segurando um cartao).

**Acoes**:
- Copiar `user-uploads://20260208_111235.png` para `src/assets/piggy-bud-logo.png` (substituir)
- Nenhum outro arquivo precisa ser alterado pois todos ja importam de `@/assets/piggy-bud-logo.png`

**Arquivos afetados automaticamente** (sem mudanca de codigo):
- `MascotAvatar.tsx`, `FeedPage.tsx`, `PremiumPage.tsx`, `AuthPage.tsx`, `PinLockScreen.tsx`, `InstallPage.tsx`

---

## 3. Substituir emojis de porquinho por emojis contextuais

Remover todas as ocorrencias do emoji de porquinho e substituir por emojis que facam sentido com a mensagem.

### personality-engine.ts
| Linha | Atual | Novo |
|-------|-------|------|
| 136 | `Mais um pro cofrinho! ` | `Mais um pro cofrinho! ` |

### ExportReportDialog.tsx
| Local | Atual | Novo |
|-------|-------|------|
| HTML do relatorio | ` Piggy Bud - Relatorio Financeiro` | `Piggy Bud - Relatorio Financeiro` |
| Preview do relatorio | ` Piggy Bud` | `Piggy Bud` |

---

## Resumo de Arquivos

| Arquivo | Mudanca |
|---------|---------|
| `src/assets/piggy-bud-logo.png` | Substituir pela nova imagem |
| `src/pages/PerfilPage.tsx` | Remover `truncate` das descricoes de conquistas |
| `src/lib/personality-engine.ts` | Trocar emoji de porquinho por emoji de moeda |
| `src/components/ExportReportDialog.tsx` | Trocar emoji de porquinho por emoji de grafico/moeda |
