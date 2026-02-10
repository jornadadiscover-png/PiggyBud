

# Correcao de Textos Cortados no Perfil + Erro do Checkout Mensal

## 1. Textos cortados no Perfil

Encontrei os seguintes pontos que podem causar corte de texto:

### Profile Card (linha 166)
O card do perfil tem `overflow-hidden` que pode cortar conteudo que saia dos limites do card. Vou remover essa classe pois o `rounded-lg` do Card ja cuida do arredondamento visual.

### ChallengesCard - Reward text (linha 131)
O texto da recompensa nos desafios pode ser cortado em telas pequenas pois esta junto com a porcentagem na mesma linha. Vou garantir que o texto quebre adequadamente com `break-words`.

### ChallengesCard - Description (linha 121-122)
A descricao dos desafios nao tem `break-words`, pode cortar em telas estreitas. Vou adicionar `break-words`.

### PremiumGate (linha 26)
O `overflow-hidden` do componente `PremiumGate` pode cortar texto dos desafios premium. Este e necessario para o efeito blur, entao sera mantido.

**Arquivos a modificar:**
- `src/pages/PerfilPage.tsx` - Remover `overflow-hidden` do Profile Card (linha 166)
- `src/components/ChallengesCard.tsx` - Adicionar `break-words` nas descricoes (linha 121) e no texto da recompensa (linha 131)

---

## 2. Erro no checkout mensal

Investiguei os logs da funcao `create-checkout` e do Stripe:

- Os dois precos existem e estao ativos no Stripe (mensal `price_1SxT363XMRup5szXx8FiZXjM` = R$ 9,90/mes e anual `price_1SyYGd3XMRup5szX9pqKXTKM` = R$ 70,80/ano)
- A lista de precos permitidos no codigo inclui ambos
- Os logs nao mostram nenhuma tentativa com o preco mensal falhando
- O usuario nao tem assinatura ativa no Stripe

O problema mais provavel e que a funcao invoke retornou um erro de rede ou timeout que nao ficou registrado nos logs do servidor. Para melhorar a experiencia, vou:

1. Adicionar um fallback com `window.location.href` caso `window.open` seja bloqueado pelo navegador (popup blocker)
2. Adicionar tratamento para quando `data.url` vem vazio

**Arquivo a modificar:**
- `src/pages/PremiumPage.tsx` - Melhorar o tratamento de erro no `handleCheckout` (linhas 62-81)

---

## Resumo de Mudancas

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/PerfilPage.tsx` | Remover `overflow-hidden` do Profile Card |
| `src/components/ChallengesCard.tsx` | Adicionar `break-words` em descricoes e recompensas |
| `src/pages/PremiumPage.tsx` | Melhorar tratamento de erro/popup blocker no checkout |

