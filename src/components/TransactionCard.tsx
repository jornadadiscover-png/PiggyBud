import { Card, CardContent } from '@/components/ui/card';
import { Transaction, categoryLabels, bankLabels } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionCardProps {
  transaction: Transaction;
  style?: React.CSSProperties;
}

export function TransactionCard({ transaction, style }: TransactionCardProps) {
  const isIncome = transaction.type === 'income';
  const categoryLabel = categoryLabels[transaction.category] || transaction.category;
  const bankLabel = transaction.bank ? bankLabels[transaction.bank] : null;

  return (
    <Card 
      className="animate-slide-up overflow-hidden border-0 shadow-soft hover:shadow-glow transition-all duration-300"
      style={style}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            "p-2.5 rounded-2xl flex-shrink-0",
            isIncome ? "bg-success/10" : "bg-destructive/10"
          )}>
            {isIncome ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-semibold truncate pr-2">{transaction.merchant}</h3>
              <span className={cn(
                "font-bold whitespace-nowrap",
                isIncome ? "text-success" : "text-destructive"
              )}>
                {isIncome ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span>{categoryLabel}</span>
              {bankLabel && (
                <>
                  <span>•</span>
                  <span>{bankLabel}</span>
                </>
              )}
              <span>•</span>
              <span>{format(new Date(transaction.date), "dd/MM HH:mm", { locale: ptBR })}</span>
            </div>

            {/* Mood/Reaction */}
            <div className={cn(
              "text-sm py-2 px-3 rounded-xl",
              isIncome ? "bg-success/5 text-success" : "bg-primary/5 text-primary"
            )}>
              {transaction.mood}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
