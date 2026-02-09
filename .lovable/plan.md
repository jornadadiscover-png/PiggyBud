
# Ajuste da Imagem do Porquinho nos Formatos Redondos

## Problema
A imagem do porquinho, quando aplicada com `rounded-full` e `object-cover`, tem partes cortadas (orelhas, patas) porque o crop circular remove as bordas da imagem.

## Solucao
Trocar `object-cover` por `object-contain` e reduzir levemente o tamanho da imagem (usando `scale-90` ou padding interno) para que ela caiba inteira dentro do circulo, centralizada.

## Arquivos a Modificar

### 1. `src/components/MascotAvatar.tsx` (linha 77)
- Trocar `object-cover` por `object-contain`
- Reduzir os tamanhos da imagem para caber com margem dentro do container circular
- Tamanhos atualizados: `sm: w-7 h-7`, `md: w-10 h-10`, `lg: w-14 h-14` (reduzidos de w-8/w-11/w-16)

### 2. `src/pages/FeedPage.tsx` (linha 48)
- Header logo: trocar `w-10 h-10` para container com padding e `object-contain`
- Exemplo: `w-10 h-10 rounded-full ... p-0.5 object-contain`

### 3. `src/pages/AuthPage.tsx` (linha 69)
- Trocar `object-cover` implicitamente por `object-contain` e adicionar `p-1` para margem interna

### 4. `src/pages/PremiumPage.tsx` (linha 165)
- Trocar `object-cover` por `object-contain` e adicionar `p-1`

### 5. `src/components/PinLockScreen.tsx` (linha 76)
- Trocar `object-cover` por `object-contain` (ja tem `p-1` no container)

## Resumo
Em todos os lugares onde a imagem aparece em circulo, a mudanca sera:
- `object-cover` -> `object-contain` (evita corte)
- Adicionar pequeno padding onde necessario para dar respiro visual
