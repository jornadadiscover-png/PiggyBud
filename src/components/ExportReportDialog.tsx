import { useState, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { categoryLabels } from '@/types';
import { FileText, Printer } from 'lucide-react';

interface ExportReportDialogProps {
  trigger: React.ReactNode;
}

export function ExportReportDialog({ trigger }: ExportReportDialogProps) {
  const [open, setOpen] = useState(false);
  const { transactions } = useTransactionStore();
  const { profile } = useSettingsStore();
  const reportRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const reportData = useMemo(() => {
    const monthTransactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryTotals: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([category, total]) => ({
        category,
        label: categoryLabels[category as keyof typeof categoryLabels] || category,
        total,
        percentage: expenses > 0 ? (total / expenses) * 100 : 0,
      }));

    const sortedTransactions = [...monthTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      income,
      expenses,
      balance: income - expenses,
      categories: sortedCategories,
      transactions: sortedTransactions,
    };
  }, [transactions, currentMonth, currentYear]);

  const escHtml = (s: string) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const handlePrint = () => {
    const printContent = reportRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Piggy Bud - ${monthName}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #333; }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #8B5CF6; margin-bottom: 20px; }
            .header h1 { color: #8B5CF6; font-size: 24px; }
            .header p { color: #666; margin-top: 5px; }
            .summary { display: flex; gap: 20px; margin-bottom: 30px; }
            .summary-card { flex: 1; padding: 15px; border-radius: 12px; text-align: center; }
            .summary-card.income { background: #D1FAE5; }
            .summary-card.expense { background: #FEE2E2; }
            .summary-card.balance { background: #E0E7FF; }
            .summary-card .label { font-size: 12px; color: #666; }
            .summary-card .value { font-size: 20px; font-weight: bold; margin-top: 5px; }
            .summary-card.income .value { color: #059669; }
            .summary-card.expense .value { color: #DC2626; }
            .summary-card.balance .value { color: #4F46E5; }
            .section { margin-bottom: 30px; }
            .section h2 { font-size: 16px; margin-bottom: 15px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .category-bar { margin-bottom: 10px; }
            .category-bar .name { font-size: 13px; margin-bottom: 4px; display: flex; justify-content: space-between; }
            .category-bar .bar { height: 20px; background: #E5E7EB; border-radius: 10px; overflow: hidden; }
            .category-bar .fill { height: 100%; background: linear-gradient(to right, #8B5CF6, #A78BFA); border-radius: 10px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
            th { background: #F9FAFB; font-weight: 600; }
            .positive { color: #059669; }
            .negative { color: #DC2626; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #999; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Piggy Bud - Relatório Financeiro</h1>
            <p>${profile.name ? `${profile.name} • ` : ''}${monthName.charAt(0).toUpperCase() + monthName.slice(1)}</p>
          </div>
          
          <div class="summary">
            <div class="summary-card income">
              <div class="label">Receitas</div>
              <div class="value">R$ ${reportData.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card expense">
              <div class="label">Despesas</div>
              <div class="value">R$ ${reportData.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card balance">
              <div class="label">Saldo</div>
              <div class="value">R$ ${reportData.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <div class="section">
            <h2>📊 Gastos por Categoria</h2>
            ${reportData.categories.length === 0 
              ? '<p style="color: #999; text-align: center; padding: 20px;">Nenhuma despesa registrada</p>'
              : reportData.categories.map(cat => `
                <div class="category-bar">
                  <div class="name">
                    <span>${cat.label}</span>
                    <span>R$ ${cat.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${cat.percentage.toFixed(0)}%)</span>
                  </div>
                  <div class="bar"><div class="fill" style="width: ${cat.percentage}%"></div></div>
                </div>
              `).join('')}
          </div>

          <div class="section">
            <h2>📋 Transações do Mês</h2>
            ${reportData.transactions.length === 0 
              ? '<p style="color: #999; text-align: center; padding: 20px;">Nenhuma transação registrada</p>'
              : `
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Descrição</th>
                      <th>Categoria</th>
                      <th style="text-align: right;">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${reportData.transactions.map(t => `
                      <tr>
                        <td>${new Date(t.date).toLocaleDateString('pt-BR')}</td>
                        <td>${t.merchant}</td>
                        <td>${categoryLabels[t.category] || t.category}</td>
                        <td style="text-align: right;" class="${t.type === 'income' ? 'positive' : 'negative'}">
                          ${t.type === 'income' ? '+' : '-'} R$ ${t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              `}
          </div>

          <div class="footer">
            Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • Piggy Bud App
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Relatório Financeiro
          </DialogTitle>
        </DialogHeader>

        <div ref={reportRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
          <div className="text-center pb-3 border-b">
            <h2 className="text-lg font-bold text-primary">💰 Piggy Bud</h2>
            <p className="text-sm text-muted-foreground capitalize">
              {profile.name ? `${profile.name} • ` : ''}{monthName}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-success/10 text-center">
              <p className="text-xs text-muted-foreground">Receitas</p>
              <p className="text-sm font-bold text-success">
                R$ {reportData.income.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-destructive/10 text-center">
              <p className="text-xs text-muted-foreground">Despesas</p>
              <p className="text-sm font-bold text-destructive">
                R$ {reportData.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 text-center">
              <p className="text-xs text-muted-foreground">Saldo</p>
              <p className={`text-sm font-bold ${reportData.balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                R$ {reportData.balance.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h3 className="text-sm font-semibold mb-2">📊 Gastos por Categoria</h3>
            {reportData.categories.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhuma despesa registrada</p>
            ) : (
              <div className="space-y-2">
                {reportData.categories.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{cat.label}</span>
                      <span className="text-muted-foreground">
                        R$ {cat.total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} ({cat.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div>
            <h3 className="text-sm font-semibold mb-2">📋 Últimas Transações</h3>
            {reportData.transactions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhuma transação registrada</p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {reportData.transactions.slice(0, 10).map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-muted/50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{t.merchant}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(t.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                      {t.type === 'income' ? '+' : '-'}R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
                {reportData.transactions.length > 10 && (
                  <p className="text-[10px] text-muted-foreground text-center pt-2">
                    + {reportData.transactions.length - 10} transações...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button className="w-full" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir / Salvar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
