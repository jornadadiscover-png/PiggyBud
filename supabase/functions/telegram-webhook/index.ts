import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { tg, deriveTelegramWebhookSecret } from '../_shared/telegram.ts';

const APP_URL = 'https://piggybud.lovable.app';
const SUPPORT_EMAIL = 'jornadadiscover@gmail.com';

const FOOTER = `\n\n💡 Use /ajuda para ver todos os comandos.`;

const HELP_TEXT =
  `🐷 <b>Piggy Bud — Central de Ajuda</b>\n\n` +
  `Escolha um comando:\n\n` +
  `/sobre — O que é o Piggy Bud\n` +
  `/comecar — Como começar a usar\n` +
  `/registrar — Lançar receitas e despesas\n` +
  `/mascote — Como o porquinho reage\n` +
  `/relatorios — Relatórios e resumo com IA\n` +
  `/premium — Vantagens do plano Premium\n` +
  `/lembretes — Lembretes diários e semanais\n` +
  `/seguranca — Proteção por PIN\n` +
  `/planilha — Planilha estilo Excel\n` +
  `/tutor — Tutor financeiro com IA\n` +
  `/suporte — Falar com o suporte\n` +
  `/app — Abrir o Piggy Bud\n` +
  `/stop — Desativar lembretes\n\n` +
  `🌐 <a href="${APP_URL}">Abrir o app</a>  •  ✉️ <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`;

const COMMAND_RESPONSES: Record<string, string> = {
  ajuda: HELP_TEXT,
  help: HELP_TEXT,

  sobre:
    `🐷 <b>Sobre o Piggy Bud</b>\n\n` +
    `É um app de finanças pessoais com um mascote 3D que reage aos seus gastos: ` +
    `fica feliz quando você gasta pouco e dramático quando exagera 😅\n\n` +
    `Seus dados ficam <b>100% no seu dispositivo</b> — privacidade total.\n\n` +
    `🌐 <a href="${APP_URL}">Conheça o Piggy Bud</a>` + FOOTER,

  comecar:
    `🚀 <b>Como começar</b>\n\n` +
    `1️⃣ Abra o app: <a href="${APP_URL}">${APP_URL}</a>\n` +
    `2️⃣ (Opcional) Configure um PIN em Configurações → Segurança\n` +
    `3️⃣ Toque no botão central <b>+</b> e lance sua primeira transação\n` +
    `4️⃣ Veja o porquinho reagir aos seus gastos!` + FOOTER,

  registrar:
    `✏️ <b>Registrar receita ou despesa</b>\n\n` +
    `• Toque no botão <b>+</b> central na tela inicial\n` +
    `• Escolha <b>Receita</b> ou <b>Despesa</b>\n` +
    `• Informe valor, categoria e descrição\n` +
    `• Dica: você também pode <b>colar uma notificação bancária</b> ` +
    `e o app preenche automaticamente 💳` + FOOTER,

  mascote:
    `🐽 <b>Reações do porquinho</b>\n\n` +
    `O mascote reage com base no valor da despesa:\n` +
    `• 😄 Feliz: até R$ 20\n` +
    `• 😐 Neutro: entre R$ 20 e R$ 200\n` +
    `• 😱 Dramático: acima de R$ 200\n\n` +
    `Você pode ajustar a sensibilidade em <b>Configurações → Personalidade</b>.` + FOOTER,

  relatorios:
    `📊 <b>Relatórios (Premium)</b>\n\n` +
    `Na aba <b>Relatórios</b> você acompanha:\n` +
    `• Receitas e despesas do mês\n` +
    `• Gastos por categoria\n` +
    `• Evolução mensal\n` +
    `• Top 5 categorias\n` +
    `• Resumo inteligente com IA ✨\n\n` +
    `Recurso disponível no plano Premium. Use /premium para saber mais.` + FOOTER,

  premium:
    `⭐ <b>Plano Premium</b>\n\n` +
    `Desbloqueie:\n` +
    `• 📊 Relatórios avançados\n` +
    `• ✨ Resumo mensal com IA\n` +
    `• 📋 Planilha estilo Excel\n` +
    `• 🎓 Tutor financeiro com IA\n\n` +
    `Assine direto no app em <b>Mais → Premium</b>.\n` +
    `🌐 <a href="${APP_URL}">Abrir o Piggy Bud</a>` + FOOTER,

  lembretes:
    `⏰ <b>Lembretes</b>\n\n` +
    `Em <b>Configurações → Lembretes</b> você ativa:\n` +
    `• Lembrete diário (com horário escolhido)\n` +
    `• Resumo semanal (domingo à noite)\n\n` +
    `Conectando o Telegram, você recebe tudo aqui — mesmo com o app fechado 📩` + FOOTER,

  seguranca:
    `🔐 <b>Segurança e privacidade</b>\n\n` +
    `• Proteção por <b>PIN local de 4 a 6 dígitos</b>\n` +
    `• Seus dados financeiros ficam <b>somente no seu dispositivo</b>\n` +
    `• Nada de gastos é enviado para servidores\n\n` +
    `Configure em <b>Configurações → Segurança</b>.` + FOOTER,

  planilha:
    `📋 <b>Planilha (Premium)</b>\n\n` +
    `Uma grade estilo Excel para gerenciar suas transações de forma avançada: ` +
    `editar em massa, ordenar, filtrar e organizar tudo em um só lugar.\n\n` +
    `Disponível no plano Premium. Use /premium para saber mais.` + FOOTER,

  tutor:
    `🎓 <b>Tutor financeiro (Premium)</b>\n\n` +
    `Receba uma <b>dica financeira diária</b> personalizada, gerada por IA, ` +
    `com base no seu comportamento de gastos.\n\n` +
    `Disponível no plano Premium. Use /premium para saber mais.` + FOOTER,

  suporte:
    `🛟 <b>Suporte</b>\n\n` +
    `Fale com a gente por e-mail:\n` +
    `✉️ <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>\n\n` +
    `Respondemos o quanto antes 💜` + FOOTER,

  app:
    `🌐 <b>Abrir o Piggy Bud</b>\n\n` +
    `<a href="${APP_URL}">${APP_URL}</a>` + FOOTER,
};

function safeEqual(a: string | null, b: string): boolean {
  if (!a || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function normalizeCommand(token: string): string {
  // /ajuda or /ajuda@PiggyBudBot -> ajuda
  let t = token.trim().toLowerCase();
  if (t.startsWith('/')) t = t.slice(1);
  const at = t.indexOf('@');
  if (at >= 0) t = t.slice(0, at);
  return t;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const expectedSecret = await deriveTelegramWebhookSecret();
    const actualSecret = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (!safeEqual(actualSecret, expectedSecret)) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const update = await req.json();
    const message = update.message ?? update.edited_message;
    const chatId = message?.chat?.id as number | undefined;
    const text = (message?.text ?? '') as string;

    if (!chatId) return new Response(JSON.stringify({ ok: true }));

    const trimmed = text.trim();
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0]?.startsWith('/') ? normalizeCommand(parts[0]) : '';

    // Handle /start (with optional link code)
    if (cmd === 'start') {
      const code = parts[1];
      if (code) {
        const { data: link, error } = await supabase
          .from('telegram_links')
          .update({ chat_id: chatId })
          .eq('link_code', code)
          .is('chat_id', null)
          .select()
          .maybeSingle();

        if (!error && link) {
          await tg('sendMessage', {
            chat_id: chatId,
            text:
              '🐷 <b>Conectado ao Piggy Bud!</b>\n\n' +
              'Você receberá lembretes por aqui.' + FOOTER,
            parse_mode: 'HTML',
          });
        } else {
          const { data: existing } = await supabase
            .from('telegram_links')
            .select()
            .eq('link_code', code)
            .maybeSingle();
          if (existing) {
            await supabase.from('telegram_links').update({ chat_id: chatId }).eq('link_code', code);
            await tg('sendMessage', {
              chat_id: chatId,
              text: '🐷 <b>Conexão atualizada!</b>' + FOOTER,
              parse_mode: 'HTML',
            });
          } else {
            await tg('sendMessage', {
              chat_id: chatId,
              text: '⚠️ Código inválido. Abra o app e gere um novo link em Configurações → Telegram.',
            });
          }
        }
      } else {
        await tg('sendMessage', {
          chat_id: chatId,
          text:
            `👋 <b>Olá! Bem-vindo ao Piggy Bud</b>\n\n` +
            `Para conectar este Telegram à sua conta, abra o app em ` +
            `<b>Configurações → Telegram → Conectar</b>.\n\n` +
            `🌐 <a href="${APP_URL}">${APP_URL}</a>` + FOOTER,
          parse_mode: 'HTML',
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (cmd === 'stop') {
      await supabase
        .from('telegram_links')
        .update({ daily_enabled: false, weekly_enabled: false })
        .eq('chat_id', chatId);
      await tg('sendMessage', {
        chat_id: chatId,
        text: '🔕 Lembretes desativados. Reative no app quando quiser.' + FOOTER,
        parse_mode: 'HTML',
      });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (cmd && COMMAND_RESPONSES[cmd]) {
      await tg('sendMessage', {
        chat_id: chatId,
        text: COMMAND_RESPONSES[cmd],
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Unknown slash command -> show help
    if (cmd) {
      await tg('sendMessage', {
        chat_id: chatId,
        text: `❓ Não conheço esse comando.\n\n${HELP_TEXT}`,
        parse_mode: 'HTML',
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('webhook error:', e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 200 });
  }
});
