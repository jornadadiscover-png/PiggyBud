import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, Home, Target, Coins, Delete } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const fmt = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });

function CommonCalc() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);

  const inputDigit = (d: string) => {
    if (waiting) {
      setDisplay(d);
      setWaiting(false);
    } else {
      setDisplay(display === '0' ? d : display + d);
    }
  };

  const inputDot = () => {
    if (waiting) {
      setDisplay('0.');
      setWaiting(false);
      return;
    }
    if (!display.includes('.')) setDisplay(display + '.');
  };

  const clear = () => {
    setDisplay('0');
    setPrev(null);
    setOp(null);
    setWaiting(false);
  };

  const back = () => setDisplay(display.length > 1 ? display.slice(0, -1) : '0');

  const performOp = (nextOp: string) => {
    const val = parseFloat(display);
    if (prev === null) {
      setPrev(val);
    } else if (op) {
      const result = compute(prev, val, op);
      setDisplay(String(result));
      setPrev(result);
    }
    setOp(nextOp);
    setWaiting(true);
  };

  const compute = (a: number, b: number, o: string) => {
    switch (o) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? 0 : a / b;
      case '%': return (a * b) / 100;
      default: return b;
    }
  };

  const equals = () => {
    if (op && prev !== null) {
      const val = parseFloat(display);
      setDisplay(String(compute(prev, val, op)));
      setPrev(null);
      setOp(null);
      setWaiting(true);
    }
  };

  const btn = (label: string, onClick: () => void, variant: 'default' | 'op' | 'eq' | 'clear' = 'default') => {
    const styles = {
      default: 'bg-secondary hover:bg-secondary/80 text-foreground',
      op: 'bg-primary/10 hover:bg-primary/20 text-primary font-bold',
      eq: 'bg-primary hover:bg-primary/90 text-primary-foreground font-bold',
      clear: 'bg-destructive/10 hover:bg-destructive/20 text-destructive font-bold',
    };
    return (
      <button
        onClick={onClick}
        className={`h-14 rounded-xl text-lg font-medium transition-colors ${styles[variant]}`}
      >
        {label}
      </button>
    );
  };

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-4">
        <div className="bg-muted rounded-xl p-4 mb-3 text-right">
          <p className="text-3xl font-bold break-all">{display}</p>
          {op && prev !== null && (
            <p className="text-xs text-muted-foreground mt-1">{prev} {op}</p>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {btn('C', clear, 'clear')}
          {btn('⌫', back, 'clear')}
          {btn('%', () => performOp('%'), 'op')}
          {btn('÷', () => performOp('÷'), 'op')}
          {btn('7', () => inputDigit('7'))}
          {btn('8', () => inputDigit('8'))}
          {btn('9', () => inputDigit('9'))}
          {btn('×', () => performOp('×'), 'op')}
          {btn('4', () => inputDigit('4'))}
          {btn('5', () => inputDigit('5'))}
          {btn('6', () => inputDigit('6'))}
          {btn('-', () => performOp('-'), 'op')}
          {btn('1', () => inputDigit('1'))}
          {btn('2', () => inputDigit('2'))}
          {btn('3', () => inputDigit('3'))}
          {btn('+', () => performOp('+'), 'op')}
          {btn('0', () => inputDigit('0'))}
          {btn('.', inputDot)}
          <button
            onClick={equals}
            className="h-14 rounded-xl text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground col-span-2"
          >
            =
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function CompoundInterestCalc() {
  const [initial, setInitial] = useState('1000');
  const [monthly, setMonthly] = useState('200');
  const [rate, setRate] = useState('1');
  const [months, setMonths] = useState('12');

  const data = useMemo(() => {
    const p = parseFloat(initial) || 0;
    const pm = parseFloat(monthly) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const n = Math.max(1, Math.min(600, parseInt(months) || 1));
    const arr: { mes: number; total: number; investido: number }[] = [];
    let total = p;
    let invested = p;
    arr.push({ mes: 0, total, investido: invested });
    for (let i = 1; i <= n; i++) {
      total = total * (1 + r) + pm;
      invested += pm;
      arr.push({ mes: i, total: Math.round(total * 100) / 100, investido: invested });
    }
    return arr;
  }, [initial, monthly, rate, months]);

  const final = data[data.length - 1];
  const yield_ = final.total - final.investido;

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Valor inicial (R$)</Label>
            <Input value={initial} onChange={(e) => setInitial(e.target.value)} type="number" />
          </div>
          <div>
            <Label>Aporte mensal (R$)</Label>
            <Input value={monthly} onChange={(e) => setMonthly(e.target.value)} type="number" />
          </div>
          <div>
            <Label>Taxa ao mês (%)</Label>
            <Input value={rate} onChange={(e) => setRate(e.target.value)} type="number" step="0.1" />
          </div>
          <div>
            <Label>Tempo (meses)</Label>
            <Input value={months} onChange={(e) => setMonths(e.target.value)} type="number" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total investido:</span>
            <span className="font-semibold">{fmt(final.investido)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rendimento:</span>
            <span className="font-semibold text-success">{fmt(yield_)}</span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t border-border">
            <span className="font-bold">Montante final:</span>
            <span className="font-bold text-primary">{fmt(final.total)}</span>
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => fmt(v)} labelFormatter={(l) => `Mês ${l}`} />
              <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="investido" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="3 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function FinancingCalc() {
  const [value, setValue] = useState('200000');
  const [down, setDown] = useState('40000');
  const [rate, setRate] = useState('1');
  const [installments, setInstallments] = useState('360');

  const result = useMemo(() => {
    const v = parseFloat(value) || 0;
    const d = parseFloat(down) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const n = Math.max(1, parseInt(installments) || 1);
    const pv = v - d;
    if (pv <= 0) return { parcela: 0, total: 0, juros: 0, financiado: 0 };
    // Tabela Price
    const parcela = r === 0 ? pv / n : (pv * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = parcela * n;
    return { parcela, total, juros: total - pv, financiado: pv };
  }, [value, down, rate, installments]);

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Valor do bem (R$)</Label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} type="number" />
          </div>
          <div>
            <Label>Entrada (R$)</Label>
            <Input value={down} onChange={(e) => setDown(e.target.value)} type="number" />
          </div>
          <div>
            <Label>Juros ao mês (%)</Label>
            <Input value={rate} onChange={(e) => setRate(e.target.value)} type="number" step="0.1" />
          </div>
          <div>
            <Label>Parcelas</Label>
            <Input value={installments} onChange={(e) => setInstallments(e.target.value)} type="number" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Valor financiado:</span>
            <span className="font-semibold">{fmt(result.financiado)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total pago:</span>
            <span className="font-semibold">{fmt(result.total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Juros totais:</span>
            <span className="font-semibold text-destructive">{fmt(result.juros)}</span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t border-border">
            <span className="font-bold">Parcela mensal:</span>
            <span className="font-bold text-primary">{fmt(result.parcela)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SavingsGoalCalc() {
  const [goal, setGoal] = useState('10000');
  const [months, setMonths] = useState('12');
  const [rate, setRate] = useState('0.8');
  const [initial, setInitial] = useState('0');

  const result = useMemo(() => {
    const fv = parseFloat(goal) || 0;
    const n = Math.max(1, parseInt(months) || 1);
    const r = (parseFloat(rate) || 0) / 100;
    const p = parseFloat(initial) || 0;
    // FV = P*(1+r)^n + PMT * ((1+r)^n - 1)/r  → resolve PMT
    const fvFromInitial = p * Math.pow(1 + r, n);
    const remaining = Math.max(0, fv - fvFromInitial);
    const pmt = r === 0 ? remaining / n : (remaining * r) / (Math.pow(1 + r, n) - 1);
    return { pmt, totalInvested: p + pmt * n };
  }, [goal, months, rate, initial]);

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Meta (R$)</Label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} type="number" />
          </div>
          <div>
            <Label>Prazo (meses)</Label>
            <Input value={months} onChange={(e) => setMonths(e.target.value)} type="number" />
          </div>
          <div>
            <Label>Rendimento ao mês (%)</Label>
            <Input value={rate} onChange={(e) => setRate(e.target.value)} type="number" step="0.1" />
          </div>
          <div>
            <Label>Valor inicial (R$)</Label>
            <Input value={initial} onChange={(e) => setInitial(e.target.value)} type="number" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-base">
            <span className="font-bold">Você precisa guardar:</span>
            <span className="font-bold text-success">{fmt(result.pmt)}/mês</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <span>Total investido até a meta:</span>
            <span>{fmt(result.totalInvested)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function YieldComparator() {
  const [amount, setAmount] = useState('10000');
  const [months, setMonths] = useState('12');

  const results = useMemo(() => {
    const p = parseFloat(amount) || 0;
    const n = Math.max(1, parseInt(months) || 1);
    // Taxas aproximadas (ao mês)
    const rates = [
      { name: 'Poupança', rateMonth: 0.005, color: 'hsl(var(--muted-foreground))' },
      { name: 'Tesouro Selic', rateMonth: 0.0090, color: 'hsl(var(--primary))' },
      { name: 'CDB 100% CDI', rateMonth: 0.0089, color: 'hsl(var(--success))' },
      { name: 'CDB 110% CDI', rateMonth: 0.0098, color: 'hsl(var(--accent-foreground))' },
    ];
    return rates.map((r) => {
      const final = p * Math.pow(1 + r.rateMonth, n);
      return { ...r, final, yield: final - p };
    });
  }, [amount, months]);

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Valor (R$)</Label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" />
          </div>
          <div>
            <Label>Tempo (meses)</Label>
            <Input value={months} onChange={(e) => setMonths(e.target.value)} type="number" />
          </div>
        </div>

        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.name} className="bg-muted/50 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{r.name}</p>
                <p className="text-xs text-muted-foreground">+{fmt(r.yield)}</p>
              </div>
              <p className="font-bold text-primary">{fmt(r.final)}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          * Taxas aproximadas (Selic ~10,75% a.a., CDI ~10,65% a.a.). Consulte valores atuais.
        </p>
      </CardContent>
    </Card>
  );
}

export function CalculadoraPage() {
  return (
    <div className="flex flex-col min-h-screen pb-20 p-4">
      <header className="mb-4 pt-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="w-6 h-6 text-primary" />
          Calculadora
        </h1>
        <p className="text-muted-foreground text-sm">Cálculos comuns e financeiros</p>
      </header>

      <Tabs defaultValue="comum" className="w-full">
        <TabsList className="grid grid-cols-5 w-full h-auto p-1 mb-4">
          <TabsTrigger value="comum" className="flex flex-col gap-0.5 py-2 px-1 text-[10px]">
            <Calculator className="w-4 h-4" /> Comum
          </TabsTrigger>
          <TabsTrigger value="juros" className="flex flex-col gap-0.5 py-2 px-1 text-[10px]">
            <TrendingUp className="w-4 h-4" /> Juros
          </TabsTrigger>
          <TabsTrigger value="financ" className="flex flex-col gap-0.5 py-2 px-1 text-[10px]">
            <Home className="w-4 h-4" /> Financ.
          </TabsTrigger>
          <TabsTrigger value="meta" className="flex flex-col gap-0.5 py-2 px-1 text-[10px]">
            <Target className="w-4 h-4" /> Meta
          </TabsTrigger>
          <TabsTrigger value="rende" className="flex flex-col gap-0.5 py-2 px-1 text-[10px]">
            <Coins className="w-4 h-4" /> Render.
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comum"><CommonCalc /></TabsContent>
        <TabsContent value="juros"><CompoundInterestCalc /></TabsContent>
        <TabsContent value="financ"><FinancingCalc /></TabsContent>
        <TabsContent value="meta"><SavingsGoalCalc /></TabsContent>
        <TabsContent value="rende"><YieldComparator /></TabsContent>
      </Tabs>
    </div>
  );
}
