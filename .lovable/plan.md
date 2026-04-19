
O usuário publicou mas ainda vê a versão antiga. Causa: o `main.tsx` já tem cleanup de service worker, mas só roda **uma vez por sessão** (guard `__sw_cleanup_reloaded__`). Se o SW antigo ainda servir o `index.html` cacheado, o novo `main.tsx` nem chega a rodar.

Plano: forçar invalidação agressiva no HTML e no bootstrap.

## Mudanças

**1. `index.html`** — adicionar meta tags anti-cache no `<head>`:
- `<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">`
- `<meta http-equiv="Pragma" content="no-cache">`
- `<meta http-equiv="Expires" content="0">`

E um pequeno script inline **antes** de qualquer outro, que desregistra SW e limpa caches sincronamente antes do bundle carregar:
```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
  }
  if ('caches' in window) {
    caches.keys().then(ks => ks.forEach(k => caches.delete(k)));
  }
</script>
```

**2. `src/main.tsx`** — remover o guard `__sw_cleanup_reloaded__` (que impedia segundo reload) e sempre forçar reload se encontrou SW antigo. Também limpar `localStorage` de chaves de versão se existirem (mantendo dados do app intactos — só limpa flags de cache).

**3. Bumpar versão visível** — adicionar comentário com timestamp no `index.html` para garantir que o HTML em si tenha hash diferente quando publicado (alguns CDNs cacheiam por conteúdo).

## Resultado

Na próxima abertura após publicar:
1. HTML chega com headers no-cache → browser não usa versão cacheada
2. Script inline desregistra SW antes do bundle
3. `main.tsx` faz reload uma vez para garantir assets frescos
4. Usuário vê a versão nova

Dados do usuário (transações, PIN, settings) ficam preservados — só limpamos service workers e Cache Storage, não localStorage.
