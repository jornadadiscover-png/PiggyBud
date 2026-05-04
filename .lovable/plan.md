Adicionar meta tag de verificação do Google Search Console ao `index.html` para confirmar propriedade do site.

### O que será feito
- Inserir no `<head>` do `index.html` a tag:
```html
<meta name="google-site-verification" content="p4YqEUKnUFkc7WoyftN6niUACDcQj4U719o236_4aE4" />
```

### Arquivo afetado
- `index.html`

### Não será alterado
- `public/robots.txt` já permite Googlebot e demais crawlers.
- Nenhuma outra funcionalidade do app será impactada.