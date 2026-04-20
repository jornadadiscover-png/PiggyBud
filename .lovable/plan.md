
Objetivo: corrigir o problema de versão antiga aparecendo mesmo após publicar, atacando a causa mais provável: o app está entrando por um shell/entrypoint antigo, não apenas por cache de assets.

Diagnóstico do código atual:
- Já existe limpeza agressiva de Service Worker e Cache Storage em `index.html`, `src/main.tsx`, `public/sw.js` e `public/service-worker.js`.
- Não há `vite-plugin-pwa` ativo no build atual.
- O problema restante provavelmente está em um destes pontos:
  1. `index.html`/manifest ainda chegando velho para alguns usuários.
  2. App instalado usando manifest/home screen com entrypoint antigo.
  3. Build nativo via Capacitor apontando para outra URL: `capacitor.config.json` usa `https://f599e806-d657-46b5-8a95-510da50de4fe.lovableproject.com`, não a URL publicada.

Plano revisado:
1. Implementar um “build handshake” real no bootstrap
- Criar um identificador de build/versionamento explícito.
- Fazer o `index.html` checar esse build ID antes de iniciar o app.
- Se o build mudou: limpar SW/caches, gravar o novo build ID e forçar hard reload único.
- Isso resolve melhor do que depender só de `unregister()` depois que o bundle já carregou.

2. Versionar também os recursos de entrada
- Colocar versionamento explícito no `manifest.webmanifest` e nos links de manifest/icons.
- Ajustar `start_url` para carregar com marcador de versão quando apropriado.
- Isso ajuda principalmente instalações via “Adicionar à tela inicial”.

3. Corrigir o alvo do app nativo/webview
- Atualizar `capacitor.config.json` para usar a URL publicada correta, se a intenção é que builds móveis carreguem a versão live.
- Hoje um app Capacitor pode estar abrindo outra origem e por isso nunca refletir a publicação esperada.

4. Ajustar a comunicação/UX de instalação sem mudar visual
- Manter a experiência atual, mas remover qualquer dependência implícita de offline real.
- O app hoje promete comportamento de app instalado, mas sem PWA real ativa; isso precisa ficar consistente para não continuar gerando versões “presas”.

5. Adicionar diagnóstico leve para confirmar a correção
- Expor o build ID no console e/ou em um ponto discreto de debug.
- Assim dá para validar rapidamente se o usuário está vendo a build nova ou uma shell antiga.

Resultado esperado:
- Navegador web passa a buscar a versão correta ao detectar build nova.
- App instalado via home screen deixa de reaproveitar entrypoint antigo.
- Se o problema estiver no mobile wrapper, ele passa a apontar para a URL certa.
- As funções novas finalmente aparecem sem alterar layout nem fluxo principal.

Detalhes técnicos:
```text
Usuário abre app
  -> bootstrap lê build ID atual
  -> compara com último build salvo
  -> se mudou:
       limpar SW + caches
       salvar novo build
       hard reload 1x
  -> iniciar React
```

Arquivos que eu revisaria na implementação:
- `index.html`
- `src/main.tsx`
- `public/manifest.webmanifest`
- `src/pages/InstallPage.tsx`
- `capacitor.config.json`
