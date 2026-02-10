
# Correcao: Texto Cortado nos Cards + Erro Checkout Mensal

## Problema 1: Texto cortado nos cards

O componente `PremiumGate` usa `overflow-hidden` (linha 22) no container principal para permitir o efeito blur. Isso corta o conteudo visualmente tanto no card de desafio Premium quanto na secao "Dados" do Perfil.

**Solucao**: Remover `overflow-hidden` do container externo do `PremiumGate` e aplicar o clip apenas no elemento com blur (o children blurred), usando `overflow-hidden` apenas na div interna do blur.

### Arquivo: `src/components/PremiumGate.tsx`
- Linha 22: Remover `overflow-hidden` do container externo (`div.relative`)
- Linha 24: Adicionar `overflow-hidden rounded-2xl` na div do blur para conter o efeito visual sem cortar o overlay

## Problema 2: Erro no checkout mensal

Os logs mostram `"No authorization header provided"` - o token de autenticacao nao esta sendo enviado. O erro "Failed to send a request to the Edge Function" pode ocorrer quando:
- A sessao do usuario expirou
- O `supabase.functions.invoke` falha silenciosamente

**Solucao**: Adicionar verificacao explicita de sessao antes do invoke e forcar refresh do token se necessario.

### Arquivo: `src/pages/PremiumPage.tsx`
- No `handleCheckout` (linhas 62-85): Antes de chamar `supabase.functions.invoke`, verificar se existe sessao ativa com `supabase.auth.getSession()`. Se nao houver sessao, redirecionar para auth. Se houver, forcar um `supabase.auth.refreshSession()` para garantir token valido antes do invoke.

```text
Fluxo atualizado:
1. Usuario clica "Assinar Premium"
2. Verifica sessao ativa (getSession)
3. Se nao ha sessao -> redireciona para auth
4. Se ha sessao -> refreshSession para renovar token
5. Chama create-checkout com token atualizado
6. Abre URL do Stripe (com fallback para redirect)
```

## Resumo

| Arquivo | Mudanca |
|---------|---------|
| `src/components/PremiumGate.tsx` | Mover `overflow-hidden` do container externo para a div interna do blur |
| `src/pages/PremiumPage.tsx` | Adicionar verificacao e refresh de sessao antes do checkout |
