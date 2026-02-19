
# Trocar Todas as Imagens do Porquinho

## O que sera feito
Substituir a imagem atual do porquinho (`piggy-bud-logo.png`) pela nova imagem 3D do porquinho segurando o cartao em todos os lugares do app.

## Mudancas

### 1. Copiar a nova imagem
- Copiar `user-uploads://20260219_125454.png` para `src/assets/piggy-bud-logo.png` (substituindo a atual)

### 2. Ajustar estilos nos componentes
A nova imagem tem fundo verde-menta com cantos arredondados (nao circular), entao os estilos precisam ser ajustados:

| Arquivo | Ajuste |
|---------|--------|
| `src/components/MascotAvatar.tsx` | Remover `bg-[#2E7D32]`, trocar `rounded-full` por `rounded-xl` na img |
| `src/pages/FeedPage.tsx` | Remover `bg-[#2E7D32]`, `object-contain`, `p-0.5`, trocar `rounded-full` por `rounded-xl` na img do header |
| `src/pages/AuthPage.tsx` | Remover `bg-[#2E7D32]`, `object-contain`, `p-1`, trocar `rounded-full` por `rounded-2xl` |
| `src/pages/PremiumPage.tsx` | Remover `bg-[#2E7D32]`, `object-contain`, `p-1`, trocar `rounded-full` por `rounded-2xl` |
| `src/components/PinLockScreen.tsx` | Remover `bg-[#2E7D32]`, `object-contain`, trocar `rounded-full` por `rounded-2xl` |
| `src/pages/InstallPage.tsx` | Nenhuma mudanca necessaria (ja usa `rounded-2xl`) |

### 3. Atualizar icones PWA (public/)
- Copiar a nova imagem tambem para `public/piggy-bud-logo.png`

Em resumo: a imagem antiga sera substituida pela nova em todos os locais, e os estilos serao ajustados para combinar com o formato da nova imagem (cantos arredondados ao inves de circular, sem fundo verde forcado).
