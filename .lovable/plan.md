# Comandos interativos do bot do Telegram (Piggy Bud)

Hoje o `telegram-webhook` só responde a `/start <code>` (vinculação do dispositivo) e `/stop` (desativa lembretes). Vamos ampliar o webhook para que o bot responda a comandos de ajuda em Português do Brasil, com link do app e e-mail de suporte.

## Lista de comandos (no formato do BotFather)

Esta é a lista que você vai colar no BotFather quando ele pedir:

```
start - Conectar este Telegram ao app Piggy Bud
ajuda - Mostrar todos os comandos disponíveis
sobre - O que é o Piggy Bud
comecar - Como começar a usar o app
registrar - Como registrar uma despesa ou receita
mascote - Entenda as reações do porquinho
relatorios - Como funcionam os relatórios e o resumo com IA
premium - Vantagens do plano Premium
lembretes - Como configurar lembretes diários e semanais
seguranca - Proteção por PIN e privacidade dos dados
planilha - Como usar a planilha estilo Excel
tutor - O tutor financeiro com IA
suporte - Falar com o suporte por e-mail
app - Abrir o Piggy Bud no navegador
stop - Desativar lembretes neste Telegram
```

> Observação: o BotFather não aceita acentos nos nomes de comando, então usamos `ajuda`, `comecar`, `relatorios`, `seguranca` (sem acento). Os textos das respostas continuam com acentuação normal em PT-BR.

## O que muda no código

Apenas um arquivo é editado: **`supabase/functions/telegram-webhook/index.ts`**.

1. Adicionar duas constantes no topo:
   - `APP_URL = "https://piggybud.lovable.app"`
   - `SUPPORT_EMAIL = "jornadadiscover@gmail.com"`
2. Criar um mapa `COMMAND_RESPONSES` com o texto de cada comando acima (HTML simples: `<b>`, `<a href="...">`, emojis). Cada resposta termina com a linha "Use /ajuda para ver todos os comandos.".
3. No handler de mensagens, depois do tratamento atual de `/start <code>` e `/stop`:
   - Normalizar o comando: pegar o primeiro token, remover `/`, remover `@PiggyBudBot` (se vier em grupo), aplicar `toLowerCase()`.
   - Se o comando estiver no mapa, enviar a resposta com `tg('sendMessage', { chat_id, text, parse_mode: 'HTML', disable_web_page_preview: false })`.
   - Se for `/start` sem código (já tratado hoje), trocar a mensagem genérica para usar a mesma resposta de boas-vindas + chamada para `/ajuda`.
   - Se a mensagem começar com `/` mas não bater com nenhum comando conhecido, responder com a mensagem de `/ajuda`.
   - Se não começar com `/`, ignorar (comportamento atual).

## Conteúdo das respostas (resumo do que cada comando retorna)

- **/ajuda**: lista todos os comandos com descrição curta + link do app + e-mail de suporte.
- **/sobre**: explica que o Piggy Bud é um app de finanças pessoais com mascote 3D que reage aos seus gastos, 100% local e privado.
- **/comecar**: passo a passo (instalar/abrir o app pelo link, criar PIN opcional, lançar primeira transação).
- **/registrar**: como adicionar receita/despesa pelo botão central, escolher categoria, e a opção de colar notificação bancária.
- **/mascote**: explica os limites de reação (feliz <R$20, dramático >R$200) e a sensibilidade configurável.
- **/relatorios**: explica que Relatórios é Premium, com gráficos, evolução mensal, top categorias e resumo com IA.
- **/premium**: lista benefícios (relatórios avançados, resumo IA, planilha avançada, tutor IA) + onde assinar dentro do app.
- **/lembretes**: explica lembrete diário, resumo semanal e que dá pra receber tudo aqui no Telegram via Configurações → Telegram.
- **/seguranca**: PIN local de 4-6 dígitos, dados ficam no dispositivo.
- **/planilha**: visão geral da planilha estilo Excel (Premium).
- **/tutor**: dica financeira diária com IA (Premium).
- **/suporte**: "Fale com a gente por e-mail: <a href=\"mailto:jornadadiscover@gmail.com\">jornadadiscover@gmail.com</a>".
- **/app**: "Abrir o Piggy Bud: <a href=\"https://piggybud.lovable.app\">piggybud.lovable.app</a>".
- **/stop**: mantém o comportamento atual (desativa lembretes).

## Fora de escopo

- Não mexe em vinculação de dispositivo, lembretes agendados, edge functions de Stripe ou frontend.
- Não cria novas tabelas. Não há config nova no `supabase/config.toml`.
- Atualizar a lista no BotFather é manual — passo do usuário, fora do código.

## Passos depois da implementação

1. Eu edito o arquivo e faço o deploy de `telegram-webhook`.
2. Você abre o **@BotFather**, escolhe o bot do Piggy Bud, vai em **Edit Bot → Edit Commands** e cola o bloco de comandos acima.
3. Testa qualquer comando no chat com o bot (ex: `/ajuda`, `/sobre`, `/suporte`).
