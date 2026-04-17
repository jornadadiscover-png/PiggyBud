import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RSS_FEEDS = [
  { name: "InfoMoney", url: "https://www.infomoney.com.br/feed/" },
  { name: "Valor Investe", url: "https://valorinveste.globo.com/rss/valorinveste/" },
  { name: "UOL Economia", url: "https://rss.uol.com.br/feed/economia.xml" },
];

async function fetchRSS(url: string, name: string): Promise<{ source: string; items: { title: string; description: string }[] }> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 PiggyBudTutor/1.0" } });
    if (!res.ok) return { source: name, items: [] };
    const xml = await res.text();
    const items: { title: string; description: string }[] = [];
    const itemMatches = xml.matchAll(/<item[\s\S]*?<\/item>/g);
    let count = 0;
    for (const m of itemMatches) {
      if (count >= 5) break;
      const block = m[0];
      const title = (block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1] || "").trim();
      const desc = (block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1] || "")
        .replace(/<[^>]+>/g, "")
        .trim()
        .slice(0, 400);
      if (title) {
        items.push({ title, description: desc });
        count++;
      }
    }
    return { source: name, items };
  } catch (e) {
    console.error(`RSS fetch failed for ${name}:`, e);
    return { source: name, items: [] };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not set");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Brasília date (UTC-3)
    const now = new Date();
    const brasiliaOffset = -3 * 60;
    const brasiliaDate = new Date(now.getTime() + (brasiliaOffset - now.getTimezoneOffset()) * 60000);
    const postDate = brasiliaDate.toISOString().slice(0, 10);

    // Skip if already exists today
    const { data: existing } = await supabase
      .from("daily_tutor_posts")
      .select("id")
      .eq("post_date", postDate)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ ok: true, skipped: true, message: "Post de hoje já existe" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch RSS feeds in parallel
    const feeds = await Promise.all(RSS_FEEDS.map((f) => fetchRSS(f.url, f.name)));
    const newsContext = feeds
      .filter((f) => f.items.length > 0)
      .map((f) => `Fonte: ${f.source}\n${f.items.map((i, idx) => `${idx + 1}. ${i.title}\n   ${i.description}`).join("\n")}`)
      .join("\n\n");

    const sources = feeds.flatMap((f) => f.items.slice(0, 3).map((i) => ({ source: f.source, title: i.title })));

    const systemPrompt = `Você é um tutor amigável de investimentos para iniciantes brasileiros. Use linguagem simples, sem jargões. Seja encorajador. Sempre em português do Brasil.`;
    const userPrompt = `Com base nas notícias econômicas abaixo de hoje, crie um post diário educativo para iniciantes em investimentos.

NOTÍCIAS DE HOJE:
${newsContext || "(Nenhuma notícia obtida — gere conteúdo educativo geral sobre investimentos)"}

Retorne via tool call os seguintes campos:
- title: título curto e atraente do post (máx 60 chars)
- summary: resumo das principais notícias e o que isso significa para um iniciante (3-5 parágrafos curtos, linguagem MUITO simples)
- tip: 1 dica prática e acionável de investimento para hoje (2-3 frases)
- concept_title: nome de UM conceito de investimento para explicar hoje (ex: "O que é CDI?", "Renda fixa vs variável")
- concept_explanation: explicação do conceito com exemplo numérico real em reais (3-4 parágrafos curtos)`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_tutor_post",
              description: "Cria o post diário educativo",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  summary: { type: "string" },
                  tip: { type: "string" },
                  concept_title: { type: "string" },
                  concept_explanation: { type: "string" },
                },
                required: ["title", "summary", "tip", "concept_title", "concept_explanation"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_tutor_post" } },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, t);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit atingido" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI gateway: ${aiRes.status}`);
    }

    const aiJson = await aiRes.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("Sem resposta da IA");
    const post = JSON.parse(toolCall.function.arguments);

    const { error: insertError } = await supabase.from("daily_tutor_posts").insert({
      post_date: postDate,
      title: post.title,
      summary: post.summary,
      tip: post.tip,
      concept_title: post.concept_title,
      concept_explanation: post.concept_explanation,
      sources,
    });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ ok: true, post_date: postDate }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-daily-tutor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
