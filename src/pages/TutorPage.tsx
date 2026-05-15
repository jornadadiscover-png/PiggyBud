import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { GraduationCap, Newspaper, Lightbulb, BookOpen, Loader2, RefreshCw, TrendingUp, Building2, BarChart3, Coins, PiggyBank, Bitcoin, Landmark, Shield, LineChart, Globe, Briefcase, Gem, Wallet, Wheat, Share2 } from 'lucide-react';
import { PremiumGate } from '@/components/PremiumGate';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { shareContent, APP_SHARE_URL } from '@/lib/share';

interface TutorPost {
  id: string;
  post_date: string;
  title: string;
  summary: string;
  tip: string;
  concept_title: string;
  concept_explanation: string;
  sources: { source: string; title: string }[];
  created_at: string;
}

interface TutorPageProps {
  onNavigateToPremium?: () => void;
}

const investmentLibrary = [
  {
    icon: <PiggyBank className="w-5 h-5" />,
    title: 'Tesouro Direto',
    short: 'Empréstimo ao governo brasileiro',
    full: 'Você empresta dinheiro ao governo e recebe juros. É considerado o investimento mais seguro do Brasil. Exemplo: R$ 100 no Tesouro Selic rendem cerca de R$ 110,75 após 1 ano (Selic ~10,75% a.a.). Ideal para reserva de emergência.',
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    title: 'CDB (Certificado de Depósito Bancário)',
    short: 'Você empresta para o banco',
    full: 'Você empresta dinheiro a um banco e recebe juros. Tem proteção do FGC até R$ 250 mil. Bancos menores costumam pagar mais (110%-130% do CDI). Exemplo: R$ 1.000 em CDB 110% CDI por 1 ano rende ~R$ 117 (vs poupança ~R$ 60).',
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Ações',
    short: 'Você vira sócio de empresas',
    full: 'Comprar uma ação é virar dono de um pedacinho da empresa. Pode ganhar pela valorização (vender mais caro) ou por dividendos. Mais arriscado: o preço varia muito. Exemplo: comprar PETR4 a R$ 30 e vender a R$ 40 = lucro de R$ 10/ação.',
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    title: 'Fundos Imobiliários (FIIs)',
    short: 'Investir em imóveis sem comprar imóvel',
    full: 'Você compra cotas de um fundo que possui imóveis (shoppings, lajes, galpões) e recebe parte do aluguel todo mês, isento de imposto. Exemplo: R$ 10.000 em um FII que paga 0,7%/mês = R$ 70/mês de renda passiva.',
  },
  {
    icon: <Coins className="w-5 h-5" />,
    title: 'Fundos de Investimento',
    short: 'Um gestor investe por você',
    full: 'Você junta dinheiro com outros investidores e um gestor profissional decide onde aplicar. Cobra taxa de administração (1%-2% a.a.). Bom para iniciantes que não querem escolher ativos sozinhos.',
  },
  {
    icon: <Bitcoin className="w-5 h-5" />,
    title: 'Criptomoedas',
    short: 'Moedas digitais (Bitcoin, etc.)',
    full: 'Ativos digitais sem ligação a governos. Muito voláteis: podem subir 50% ou cair 50% em um mês. Recomenda-se no máximo 5%-10% do patrimônio. Exemplo: Bitcoin variou de R$ 80 mil a R$ 380 mil entre 2022-2024.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'LCI e LCA',
    short: 'Renda fixa isenta de Imposto de Renda',
    full: 'Letras de Crédito Imobiliário (LCI) e do Agronegócio (LCA) são empréstimos a bancos para financiar esses setores. São isentas de IR para pessoa física e protegidas pelo FGC até R$ 250 mil. Exemplo: R$ 10.000 em LCI a 95% do CDI por 1 ano rende ~R$ 1.020 líquidos (sem desconto de IR).',
  },
  {
    icon: <Wallet className="w-5 h-5" />,
    title: 'Poupança',
    short: 'A mais tradicional, mas rende pouco',
    full: 'Isenta de IR e com liquidez diária, mas rende apenas 70% da Selic + TR quando a Selic está abaixo de 8,5%. Exemplo: R$ 1.000 na poupança em 1 ano rende ~R$ 60-70, enquanto no Tesouro Selic renderia ~R$ 100. Bom só para reservas pequenas e curtas.',
  },
  {
    icon: <Landmark className="w-5 h-5" />,
    title: 'Tesouro IPCA+',
    short: 'Protege seu dinheiro da inflação',
    full: 'Título público que paga a inflação (IPCA) + uma taxa fixa (ex: IPCA + 6% a.a.). Garante poder de compra no longo prazo. Ideal para aposentadoria e objetivos de 5+ anos. Exemplo: R$ 10.000 em Tesouro IPCA+ 2035 a IPCA+6% pode virar mais de R$ 25.000 reais (corrigidos pela inflação).',
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    title: 'Debêntures',
    short: 'Você empresta para empresas',
    full: 'Títulos de dívida emitidos por empresas para captar recursos. Pagam juros maiores que CDBs, mas sem proteção do FGC (mais risco). Debêntures incentivadas (infraestrutura) são isentas de IR. Exemplo: debênture incentivada a IPCA+7% pode render bem mais que Tesouro com mesmo prazo.',
  },
  {
    icon: <LineChart className="w-5 h-5" />,
    title: 'ETFs',
    short: 'Fundos de índice na bolsa',
    full: 'ETFs (Exchange Traded Funds) replicam um índice (ex: BOVA11 segue o Ibovespa, IVVB11 segue o S&P 500 dos EUA). Diversificação instantânea com taxas baixas (~0,3% a.a.). Exemplo: comprar 1 cota de IVVB11 (~R$ 320) é como investir nas 500 maiores empresas americanas.',
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: 'BDRs',
    short: 'Ações estrangeiras pela B3',
    full: 'Brazilian Depositary Receipts permitem investir em empresas como Apple, Google, Tesla e Amazon direto pela bolsa brasileira, sem precisar abrir conta no exterior. Exemplo: AAPL34 representa ações da Apple — você se beneficia da valorização e dividendos sem o trabalho de remeter dinheiro.',
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    title: 'Previdência Privada (PGBL/VGBL)',
    short: 'Aposentadoria com benefício fiscal',
    full: 'Investimento de longo prazo para aposentadoria. PGBL: deduz até 12% da renda no IR (bom para quem declara completa). VGBL: melhor para quem declara simplificada. Exemplo: aporte de R$ 500/mês por 30 anos a 8% a.a. forma um patrimônio de ~R$ 745 mil.',
  },
  {
    icon: <Gem className="w-5 h-5" />,
    title: 'Ouro',
    short: 'Reserva de valor em tempos de crise',
    full: 'Ativo defensivo que tende a subir quando a economia vai mal ou em períodos de inflação alta. Pode ser comprado via fundos (ex: GOLD11) ou contratos na B3. Recomenda-se no máximo 5%-10% do patrimônio. Exemplo: o ouro subiu mais de 80% entre 2019 e 2024 em reais.',
  },
  {
    icon: <Wheat className="w-5 h-5" />,
    title: 'Fundos Multimercado',
    short: 'Diversificação em vários ativos',
    full: 'Combinam renda fixa, ações, câmbio e até derivativos numa só carteira, gerida por profissionais. Buscam retornos acima do CDI com risco controlado. Cobram taxa de administração (~2% a.a.) e às vezes de performance. Bom para quem quer diversificar sem montar a carteira sozinho.',
  },
];

function PostCard({ post }: { post: TutorPost }) {
  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-soft overflow-hidden">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-4">
          <p className="text-xs text-muted-foreground mb-1">
            {new Date(post.post_date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h2 className="text-xl font-bold break-words">{post.title}</h2>
        </div>
        <CardContent className="p-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Newspaper className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Resumo do dia</h3>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-line break-words">{post.summary}</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200/40 dark:border-amber-900/40">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <h3 className="font-semibold text-sm">Dica de hoje</h3>
            </div>
            <p className="text-sm break-words">{post.tip}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">{post.concept_title}</h3>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-line break-words">{post.concept_explanation}</p>
          </div>

          {post.sources?.length > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground mb-1">Fontes:</p>
              <div className="flex flex-wrap gap-1">
                {Array.from(new Set(post.sources.map((s) => s.source))).map((src) => (
                  <span key={src} className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{src}</span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TutorContent() {
  const [posts, setPosts] = useState<TutorPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('daily_tutor_posts')
      .select('*')
      .order('post_date', { ascending: false })
      .limit(8);
    if (!error && data) setPosts(data as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const generateNow = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-daily-tutor');
      if (error) throw error;
      if (data?.skipped) {
        toast({ title: 'Post de hoje já está disponível' });
      } else {
        toast({ title: '✨ Novo post gerado!' });
      }
      await load();
    } catch (e: any) {
      toast({ title: 'Erro ao gerar', description: e.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const today = posts[0];
  const history = posts.slice(1);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : today ? (
        <PostCard post={today} />
      ) : (
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6 text-center space-y-3">
            <GraduationCap className="w-12 h-12 text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">
              Nenhum post disponível ainda. Os posts são gerados todos os dias às 7h (Brasília).
            </p>
            <Button onClick={generateNow} disabled={generating} size="sm">
              {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Gerar primeiro post
            </Button>
          </CardContent>
        </Card>
      )}

      {today && (
        <Button variant="outline" size="sm" onClick={generateNow} disabled={generating} className="w-full">
          {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Atualizar post
        </Button>
      )}

      {history.length > 0 && (
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Posts anteriores</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <Accordion type="single" collapsible>
              {history.map((p) => (
                <AccordionItem key={p.id} value={p.id}>
                  <AccordionTrigger className="px-2 text-left hover:no-underline">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.post_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="font-semibold text-sm break-words">{p.title}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-2">
                    <PostCard post={p} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Biblioteca de Investimentos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <Accordion type="single" collapsible>
            {investmentLibrary.map((inv) => (
              <AccordionItem key={inv.title} value={inv.title}>
                <AccordionTrigger className="px-2 hover:no-underline">
                  <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">{inv.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm break-words">{inv.title}</p>
                      <p className="text-xs text-muted-foreground break-words">{inv.short}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2">
                  <p className="text-sm text-muted-foreground break-words">{inv.full}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

export function TutorPage({ onNavigateToPremium }: TutorPageProps) {
  return (
    <div className="flex flex-col min-h-screen pb-20 p-4">
      <header className="mb-4 pt-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" />
          Tutor de Investimentos
        </h1>
        <p className="text-muted-foreground text-sm">Aprenda todos os dias com a IA</p>
      </header>

      <PremiumGate
        feature="daily-tutor"
        fallbackMessage="Receba um post diário às 7h com resumo das notícias e dicas de investimento explicadas em linguagem simples."
        onUpgrade={onNavigateToPremium}
      >
        <TutorContent />
      </PremiumGate>
    </div>
  );
}
