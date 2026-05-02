// Transaction Types
export type TransactionSource = 'manual';
export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  category: Category;
  date: Date;
  source: TransactionSource;
  type: TransactionType;
  mood: string;
  bank?: Bank;
  isRecurring?: boolean;
}

// Category Types
export type Category = 
  | 'alimentacao'
  | 'transporte'
  | 'moradia'
  | 'saude'
  | 'educacao'
  | 'lazer'
  | 'compras'
  | 'investimentos'
  | 'salario'
  | 'freelance'
  | 'outros';

export const categoryLabels: Record<Category, string> = {
  alimentacao: '🍔 Alimentação',
  transporte: '🚗 Transporte',
  moradia: '🏠 Moradia',
  saude: '💊 Saúde',
  educacao: '📚 Educação',
  lazer: '🎮 Lazer',
  compras: '🛍️ Compras',
  investimentos: '📈 Investimentos',
  salario: '💰 Salário',
  freelance: '💼 Freelance',
  outros: '📦 Outros',
};

export const categoryColors: Record<Category, string> = {
  alimentacao: 'hsl(25 90% 55%)',
  transporte: 'hsl(200 80% 50%)',
  moradia: 'hsl(145 60% 45%)',
  saude: 'hsl(0 70% 55%)',
  educacao: 'hsl(270 70% 55%)',
  lazer: 'hsl(320 80% 55%)',
  compras: 'hsl(45 90% 50%)',
  investimentos: 'hsl(170 60% 45%)',
  salario: 'hsl(145 70% 40%)',
  freelance: 'hsl(200 70% 50%)',
  outros: 'hsl(220 20% 60%)',
};

// Bank Types
export type Bank = 
  | 'nubank'
  | 'itau'
  | 'bradesco'
  | 'bb'
  | 'caixa'
  | 'santander'
  | 'c6'
  | 'inter'
  | 'next'
  | 'mercadopago'
  | 'pagbank'
  | 'picpay';

export const bankLabels: Record<Bank, string> = {
  nubank: 'Nubank',
  itau: 'Itaú',
  bradesco: 'Bradesco',
  bb: 'Banco do Brasil',
  caixa: 'Caixa',
  santander: 'Santander',
  c6: 'C6 Bank',
  inter: 'Inter',
  next: 'Next',
  mercadopago: 'Mercado Pago',
  pagbank: 'PagBank',
  picpay: 'PicPay',
};

export const bankColors: Record<Bank, string> = {
  nubank: 'hsl(280 80% 55%)',
  itau: 'hsl(25 90% 50%)',
  bradesco: 'hsl(0 80% 45%)',
  bb: 'hsl(45 90% 50%)',
  caixa: 'hsl(200 80% 45%)',
  santander: 'hsl(0 80% 50%)',
  c6: 'hsl(0 0% 15%)',
  inter: 'hsl(25 90% 55%)',
  next: 'hsl(145 70% 45%)',
  mercadopago: 'hsl(200 80% 50%)',
  pagbank: 'hsl(145 70% 45%)',
  picpay: 'hsl(145 80% 50%)',
};

// User Types
export interface UserProfile {
  name: string;
  email?: string;
  monthlyGoal: number;
  createdAt: Date;
  avatarUrl?: string;
}

// Settings Types
export type ThemeId = 'default' | 'dark' | 'ocean' | 'sunset';

export interface AppSettings {
  reminderTime: string;
  reactionSensitivity: 'low' | 'medium' | 'high';
  dailyReminderEnabled: boolean;
  weeklyReportEnabled: boolean;
  pinEnabled: boolean;
  pin?: string;
  theme: ThemeId;
  // Category budgets
  categoryBudgets: CategoryBudget[];
}

// Category Budget
export interface CategoryBudget {
  category: Category;
  limit: number;
}

// Achievement/Badge Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

// Premium Types
export type PremiumFeature = 
  | 'advanced-reports'
  | 'export-pdf'
  | 'exclusive-challenges'
  | 'ai-import'
  | 'ai-summary'
  | 'premium-themes'
  | 'daily-tutor';
