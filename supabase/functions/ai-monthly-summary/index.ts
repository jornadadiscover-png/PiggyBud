import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { transactions, monthLabel } = await req.json();
    if (!transactions || !Array.isArray(transactions)) {
      return new Response(JSON.stringify({ error: "transactions array is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const totalExpenses = transactions.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0);
    const totalIncome = transactions.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0);

    const categoryBreakdown = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((acc: Record<string, number>, t: any) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    const prompt = `Você é o Piggy Bud, um assistente financeiro brasileiro divertido e encorajador (mascote porquinho).

Analise os dados financeiros do mês de ${monthLabel || 'este mês'}:

- Total de receitas: R$ ${totalIncome.toFixed(2)}
- Total de despesas: R$ ${totalExpenses.toFixed(2)}
- Saldo: R$ ${(totalIncome - totalExpenses).toFixed(2)}
- Gastos por categoria: ${JSON.stringify(categoryBreakdown)}
- Total de transações: ${transactions.length}

Forneça um resumo curto e amigável (máximo 200 palavras) com:
1. Uma visão geral do mês (com emoji)
2. A maior categoria de gasto e se é preocupante
3. Uma dica prática para o próximo mês
4. Uma frase motivacional no estilo do Piggy Bud

Use linguagem informal brasileira, emojis e seja encorajador mesmo se os gastos foram altos.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é o Piggy Bud, assistente financeiro divertido. Responda sempre em português brasileiro." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-monthly-summary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
