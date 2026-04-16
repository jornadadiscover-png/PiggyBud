

# Plano: Limpar Premium + Remover Bancos + Novas Features Premium

## Analise do Estado Atual

### Features Premium listadas vs implementadas:
| Feature | Listada | Funciona | Status |
|---------|---------|----------|--------|
| Relatórios com IA | Sim | Sim (PremiumGate em RelatoriosPage) | OK |
| Exportar PDF/Excel | Sim | Sim (PremiumGate em PerfilPage) | OK |
| Metas Ilimitadas | Sim | NAO - nenhum gate implementado | Remover da lista |
| Categorias Personalizadas | Sim | NAO - nao existe funcionalidade | Remover da lista |
| Histórico Completo | Sim | NAO - nenhum gate implementado | Remover da lista |
| Desafios Exclusivos | Sim | Sim (PremiumGate em ChallengesCard) | OK |
| Sem Anúncios | Sim | NAO - nao ha anuncios | Remover |

### Bancos Monitorados (ConfigPage):
- A secao inteira so servia para a leitura automatica de notificacoes que foi removida
- `enabledBanks`, `toggleBank` no store e tipos `Bank` nao tem mais uso funcional

---

## Mudancas

### 1. Remover "Sem Anúncios" e features que nao funcionam
- **`src/pages/PremiumPage.tsx`**: Remover "Sem Anúncios", "Metas Ilimitadas", "Categorias Personalizadas", "Histórico Completo" da lista
- **`src/types/index.ts`**: Remover `'no-ads'`, `'unlimited-goals'`, `'custom-categories'`, `'full-history'` de `PremiumFeature`

### 2. Adicionar novas features Premium reais
Substituir os itens removidos por funcionalidades que REALMENTE funcionam ou serao implementadas agora:

| Nova Feature | Descricao | Implementacao |
|-------------|-----------|---------------|
| Importacao com IA | Extrair transacoes de imagens e documentos (ja funciona!) | Adicionar PremiumGate no PasteNotificationDialog para upload de arquivo |
| Temas Premium | Cores e temas visuais exclusivos (dark/light/custom) | Novo seletor de tema no Perfil com gate |
| Resumo Mensal com IA | Analise inteligente dos gastos do mes com dicas | Novo card no RelatoriosPage usando edge function com Gemini |

Lista Premium final:
1. Relatórios com IA (ja funciona)
2. Exportar PDF/Excel (ja funciona)
3. Desafios Exclusivos (ja funciona)
4. Importacao com IA (gate no upload de arquivo)
5. Resumo Mensal com IA (novo - edge function)
6. Temas Premium (novo - seletor de tema)

### 3. Remover secao de Bancos Monitorados
- **`src/pages/ConfigPage.tsx`**: Remover Card "Bancos Monitorados" inteiro (linhas 57-95), remover imports de `Bank, bankLabels, bankColors`, remover `allBanks` array, remover `Smartphone`
- **`src/stores/useSettingsStore.ts`**: Remover `enabledBanks` do defaultSettings e `toggleBank` do store
- **`src/types/index.ts`**: Remover `enabledBanks` de `AppSettings`; manter tipos `Bank`/`bankLabels`/`bankColors` pois sao usados em `Transaction.bank`

### 4. Implementar "Resumo Mensal com IA" (nova edge function)
- Criar `supabase/functions/ai-monthly-summary/index.ts` que recebe transacoes do mes e retorna analise com dicas usando Gemini 2.5 Flash
- Adicionar card no RelatoriosPage com PremiumGate que chama esta funcao

### 5. Implementar "Temas Premium"
- Adicionar opcoes de tema (padrao, escuro, amber/gold) no PerfilPage ou ConfigPage
- Gated por PremiumGate

### 6. Gate na importacao com IA
- **`src/components/PasteNotificationDialog.tsx`**: O botao de upload de arquivo so funciona para Premium (colar texto continua gratis)

---

## Resumo de Arquivos

| Arquivo | Acao |
|---------|------|
| `src/pages/PremiumPage.tsx` | Atualizar lista de features |
| `src/types/index.ts` | Limpar PremiumFeature, remover enabledBanks de AppSettings |
| `src/pages/ConfigPage.tsx` | Remover secao Bancos Monitorados |
| `src/stores/useSettingsStore.ts` | Remover enabledBanks e toggleBank |
| `src/components/PasteNotificationDialog.tsx` | Adicionar PremiumGate no upload |
| `supabase/functions/ai-monthly-summary/index.ts` | Criar - resumo mensal com IA |
| `src/pages/RelatoriosPage.tsx` | Adicionar card Resumo com IA |
| `src/pages/PerfilPage.tsx` ou `ConfigPage.tsx` | Adicionar seletor de temas Premium |

