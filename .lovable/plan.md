

## Diagnóstico confirmado

- O HTML servido por `piggybud.lovable.app` JÁ contém o novo AuthPage (Google, "Criar conta com email", "Já tenho conta"). O publish funcionou.
- O que está "preso" é o **service worker antigo** instalado no seu navegador/PWA, que serve o build antigo do cache antes de pedir a versão nova.
- O `PWAUpdatePrompt` que adicionei só ajuda em **futuras** atualizações; não desfaz o SW velho que já está rodando no seu dispositivo agora.

## Plano: priorizar "sempre atualizado" (remover SW de cache)

Você escolheu manter o app **sempre atualizado** em vez de offline real. Solução: remover o `vite-plugin-pwa` com Workbox e deixar só um **manifest.json simples** para continuar instalável (Add to Home Screen funciona normalmente, sem cache offline). Além disso, o app passa a **desregistrar automaticamente** qualquer SW antigo no primeiro carregamento — isso conserta o problema atual sem você precisar reinstalar nada.

### Mudanças

| Arquivo | Mudança |
|---|---|
| `vite.config.ts` | Remover `VitePWA(...)` e `import { VitePWA }`. Sem service worker em produção. |
| `src/main.tsx` | Remover o guard de iframe/preview. Em vez disso, **sempre** desregistrar SWs existentes e limpar `caches`. Isso "destrava" todo dispositivo que tem o SW antigo na próxima vez que abrir o site. |
| `src/components/PWAUpdatePrompt.tsx` | Deletar (não há mais SW para escutar). |
| `src/App.tsx` | Remover import e uso de `<PWAUpdatePrompt />`. |
| `src/vite-env.d.ts` | Remover types do `vite-plugin-pwa`. |
| `index.html` | Garantir `<link rel="manifest" href="/manifest.webmanifest">` e meta tags (`theme-color`, `apple-mobile-web-app-capable`). |
| `public/manifest.webmanifest` (novo) | Manifest estático com nome, ícones, `display: standalone`, `start_url: /`, theme/background colors atuais. Mantém instalabilidade no Android/iOS. |
| `package.json` | Remover dependência `vite-plugin-pwa` e `workbox-*`. |

### Resultado para você

- **No navegador comum**: ao abrir `piggybud.lovable.app` depois do deploy, o `main.tsx` desregistra o SW antigo + limpa caches e força um reload limpo. Você passa a ver a versão atual sempre.
- **No PWA já instalado**: na próxima abertura, o mesmo script roda dentro do app instalado, desinstala o SW antigo e o app passa a buscar tudo da rede sempre. Não precisa desinstalar.
- **Instalabilidade**: continua funcionando via `manifest.webmanifest` — botão "Adicionar à tela inicial" continua aparecendo.
- **Offline**: deixa de funcionar (era o trade-off que você escolheu). Se um dia quiser de volta, dá pra reativar com cuidado.

### Observação importante

Mesmo com essa mudança, **na primeira vez** que você abrir o site/PWA depois do deploy, o SW antigo ainda vai servir o cache **uma vez** — só no segundo refresh é que a versão nova aparece. Isso é inevitável (é o SW velho que decide o que servir). Depois disso, nunca mais trava.

### Após a aprovação

Implemento as mudanças acima, você clica em **Publish → Update** uma última vez, e em até 2 aberturas o app vai estar 100% atualizado em todos os dispositivos.

