import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, Category, Bank } from '@/types';
import { generateReaction, generateIncomeReaction } from '@/lib/personality-engine';

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'mood'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByDate: (date: Date) => Transaction[];
  getTransactionsByMonth: (year: number, month: number) => Transaction[];
  getTotalByType: (type: 'expense' | 'income', month?: number, year?: number) => number;
  getTotalByCategory: (category: Category, month?: number, year?: number) => number;
  simulateBankNotification: (bank: Bank, amount: number, merchant: string) => Transaction;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (transaction) => {
        const mood = transaction.type === 'income' 
          ? generateIncomeReaction(transaction.amount)
          : generateReaction(transaction.amount, transaction.category);
        
        const newTransaction: Transaction = {
          ...transaction,
          id: crypto.randomUUID(),
          mood,
          date: new Date(transaction.date),
        };

        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));

        return newTransaction;
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      getTransactionsByDate: (date) => {
        const dateStr = date.toDateString();
        return get().transactions.filter(
          (t) => new Date(t.date).toDateString() === dateStr
        );
      },

      getTransactionsByMonth: (year, month) => {
        return get().transactions.filter((t) => {
          const d = new Date(t.date);
          return d.getFullYear() === year && d.getMonth() === month;
        });
      },

      getTotalByType: (type, month, year) => {
        let transactions = get().transactions.filter((t) => t.type === type);
        
        if (month !== undefined && year !== undefined) {
          transactions = transactions.filter((t) => {
            const d = new Date(t.date);
            return d.getFullYear() === year && d.getMonth() === month;
          });
        }
        
        return transactions.reduce((sum, t) => sum + t.amount, 0);
      },

      getTotalByCategory: (category, month, year) => {
        let transactions = get().transactions.filter((t) => t.category === category);
        
        if (month !== undefined && year !== undefined) {
          transactions = transactions.filter((t) => {
            const d = new Date(t.date);
            return d.getFullYear() === year && d.getMonth() === month;
          });
        }
        
        return transactions.reduce((sum, t) => sum + t.amount, 0);
      },

      simulateBankNotification: (bank, amount, merchant) => {
        const categories: Category[] = ['alimentacao', 'transporte', 'lazer', 'compras', 'outros'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        return get().addTransaction({
          amount,
          merchant,
          category: randomCategory,
          date: new Date(),
          source: 'auto',
          type: 'expense',
          bank,
        });
      },
    }),
    {
      name: 'finmood-transactions',
      partialize: (state) => ({ transactions: state.transactions }),
    }
  )
);
