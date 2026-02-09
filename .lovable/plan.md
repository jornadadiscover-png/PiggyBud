
# Corrigir Fundo Branco ao Redor da Imagem do Porquinho

## Problema
Com `object-contain`, a imagem e redimensionada para caber no circulo, mas o espaco vazio ao redor fica branco (cor padrao do elemento `<img>`). O usuario quer que esse espaco tenha a mesma cor verde do fundo da imagem do porquinho.

## Solucao
Adicionar `bg-[#2E7D32]` (verde escuro que combina com o fundo da imagem) em todos os elementos `<img>` do porquinho que usam `rounded-full`. Isso faz com que qualquer espaco vazio ao redor da imagem se misture com o verde da propria imagem.

## Arquivos a Modificar

| Arquivo | Linha | Mudanca |
|---------|-------|---------|
| `src/components/MascotAvatar.tsx` | 77 | Adicionar `bg-[#2E7D32]` na classe da imagem |
| `src/pages/FeedPage.tsx` | 48 | Adicionar `bg-[#2E7D32]` na classe da imagem |
| `src/pages/AuthPage.tsx` | 69 | Adicionar `bg-[#2E7D32]` na classe da imagem |
| `src/pages/PremiumPage.tsx` | 165 | Adicionar `bg-[#2E7D32]` na classe da imagem |
| `src/components/PinLockScreen.tsx` | 76 | Adicionar `bg-[#2E7D32]` na classe da imagem |

Todas as mudancas sao simples: adicionar uma classe de cor de fundo verde ao elemento `<img>` para que o espaco vazio ao redor da imagem combine com o verde do porquinho.
