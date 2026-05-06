## Criar sitemap.xml

Adicionar um `sitemap.xml` em `public/` para enviar ao Google Search Console.

### Conteúdo do sitemap

URL base: `https://piggybud.lovable.app`

Como o app é uma SPA com rotas client-side, vou incluir as rotas públicas principais que fazem sentido indexar:

- `/` (home)
- `/auth` (login/cadastro)
- `/install` (página de instalação do PWA)
- `/premium` (página do plano Premium)

Rotas que NÃO entram no sitemap (são internas/autenticadas e não úteis para SEO público): `/feed`, `/calculadora`, `/planilha`, `/relatorios`, `/tutor`, `/perfil`, `/config`, `/mais`, `/reset`.

### Arquivos

**Criar `public/sitemap.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://piggybud.lovable.app/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://piggybud.lovable.app/auth</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://piggybud.lovable.app/install</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://piggybud.lovable.app/premium</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Atualizar `public/robots.txt`** para apontar para o sitemap:
```
Sitemap: https://piggybud.lovable.app/sitemap.xml
```
(adicionado ao final do arquivo existente)

### Próximos passos (após aprovar e publicar)

1. Publicar o app para que `https://piggybud.lovable.app/sitemap.xml` fique acessível.
2. No Search Console → **Sitemaps** → enviar `sitemap.xml`.

### Dúvida rápida

Quer que eu inclua também `/auth`, `/install` e `/premium`, ou prefere apenas `/` (home)? Se não responder, sigo com as 4 URLs acima.
