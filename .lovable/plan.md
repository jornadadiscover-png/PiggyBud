

## Diagnóstico real

Confirmei direto no servidor de produção (`https://piggybud.lovable.app`):

1. **O código publicado JÁ está correto e atualizado.**
   - O bundle principal (`assets/index-BHUlJdvT.js`) contém `Tutor`, `Calculadora`, `GraduationCap` (ícone do Tutor) e a BottomNav nova.
   - O HTML servido tem o `BUILD_ID 2026-04-20T00-00-00Z-001`, headers `cache-control: no-cache`, e o script de handshake.
   - Os "kill-switch" service workers (`/sw.js` e `/service-worker.js`) estão deployados e respondem 200.

2. **O problema é exclusivamente no DISPOSITIVO do usuário.** Há um Service Worker antigo (de uma versão PWA anterior, `vite-plugin-pwa`) que está interceptando as requisições e servindo o `index.html` antigo do cache. Como esse HTML antigo não tem o script de handshake, ele nunca dispara o reload — chicken-and-egg.

3. **PIN inicial e dados de bancos antigos** = isso vive no `localStorage` do dispositivo, não no código. Precisa de uma ação manual de reset dentro do app ou no navegador.

Reverter não resolveria — o código já está bom. O que falta é uma forma de **furar** o SW velho preso no aparelho.

## Plano de correção

### 1. Rota de "escape" sem cache — `/reset`
Criar página nova `src/pages/ResetPage.tsx` em rota `/reset` que:
- Roda imediatamente no mount: `unregister()` em todos SWs, `caches.delete()` em tudo, opção de limpar `localStorage` (com aviso: apaga PIN, dados de bancos antigos).
- Mostra status visual ("Limpando…" → "Pronto, abrindo app novo").
- Após limpar, redireciona para `/?_v=<timestamp>` para garantir HTML novo.
- Como é rota nova que o SW antigo nunca cacheou, ele tende a deixar passar — e mesmo se interceptar, o `?_v=` garante miss.

Wireear em `App.tsx` adicionando `<Route path="/reset" element={<ResetPage />} />`.

### 2. Bumpar `BUILD_ID`
Atualizar `BUILD_ID` em `index.html`, `main.tsx` e `manifest.webmanifest` para `2026-04-20T02-30-00Z-002` para que dispositivos que JÁ conseguem carregar o HTML novo disparem o handshake mais uma vez.

### 3. Botão "Forçar atualização" dentro do app
Em `src/pages/ConfigPage.tsx` (ou `MaisPage.tsx`), adicionar um botão "Forçar atualização agora" que executa o mesmo cleanup e recarrega. Útil para usuários que conseguem abrir o app mas suspeitam de versão antiga.

### 4. Comunicar a solução ao usuário
Após publicar, o usuário precisa, **uma vez**, em cada dispositivo afetado (web e PWA instalado):
- Abrir `https://piggybud.lovable.app/reset` no navegador.
- A partir daí, todas as próximas aberturas mostrarão a versão correta com Calculadora, Tutor, etc.
- Se o PIN antigo / dados de bancos antigos estiverem incomodando, marcar a opção "Limpar dados locais" na tela de reset.

### 5. NÃO mexer em
- Lógica de SW já existente (`public/sw.js`, `public/service-worker.js`) — está correta.
- `capacitor.config.json` — já aponta para a URL publicada.
- Estrutura de rotas/features — está tudo certo.

## Arquivos afetados
- `src/pages/ResetPage.tsx` (novo)
- `src/App.tsx` (adicionar rota)
- `src/pages/ConfigPage.tsx` (botão forçar atualização)
- `index.html` (bump BUILD_ID)
- `src/main.tsx` (bump BUILD_ID)
- `public/manifest.webmanifest` (bump versão)

