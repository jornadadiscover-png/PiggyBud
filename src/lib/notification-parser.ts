import { Bank, Category } from '@/types';

export interface ParsedNotification {
  bank: Bank | null;
  amount: number | null;
  merchant: string | null;
  category: Category;
  type: 'expense' | 'income';
  confidence: 'high' | 'medium' | 'low';
  rawText: string;
}

// Mapeamento de package names para bancos
export const bankPackages: Record<string, Bank> = {
  'com.nu.production': 'nubank',
  'com.itau': 'itau',
  'br.com.bradesco': 'bradesco',
  'br.com.bb.android': 'bb',
  'br.com.caixa': 'caixa',
  'com.santander': 'santander',
  'com.c6bank.app': 'c6',
  'br.com.intermedium': 'inter',
  'br.com.bradesco.next': 'next',
  'com.mercadopago.wallet': 'mercadopago',
  'br.com.uol.ps.myaccount': 'pagbank',
  'com.picpay': 'picpay',
};

// Palavras-chave para identificar o banco pelo texto
const bankKeywords: Record<Bank, string[]> = {
  nubank: ['nubank', 'nu'],
  itau: ['itaú', 'itau'],
  bradesco: ['bradesco'],
  bb: ['banco do brasil', 'bb'],
  caixa: ['caixa'],
  santander: ['santander'],
  c6: ['c6', 'c6 bank'],
  inter: ['inter', 'banco inter'],
  next: ['next'],
  mercadopago: ['mercado pago', 'mercadopago'],
  pagbank: ['pagbank', 'pagseguro'],
  picpay: ['picpay'],
};

// Palavras-chave para categorização automática
const categoryKeywords: Record<Category, string[]> = {
  alimentacao: [
    'ifood', 'uber eats', 'rappi', 'restaurante', 'padaria', 'lanchonete',
    'mcdonalds', 'burger', 'pizza', 'sushi', 'açai', 'acai', 'café', 'cafe',
    'lanche', 'comida', 'almoço', 'jantar', 'food', 'mercado', 'supermercado',
    'hortifruti', 'feira', 'pão', 'pao', 'carrefour', 'extra', 'dia', 'assai'
  ],
  transporte: [
    'uber', '99', 'cabify', 'posto', 'shell', 'ipiranga', 'gasolina',
    'combustivel', 'estacionamento', 'pedagio', 'onibus', 'metro', 'trem',
    'passagem', 'bike', 'patinete', 'taxi', 'carro', 'br distribuidora'
  ],
  compras: [
    'amazon', 'shopee', 'mercado livre', 'magazine', 'americanas', 'casas bahia',
    'submarino', 'aliexpress', 'shein', 'renner', 'riachuelo', 'c&a', 'zara',
    'nike', 'adidas', 'centauro', 'netshoes', 'loja', 'shopping'
  ],
  lazer: [
    'netflix', 'spotify', 'steam', 'cinema', 'ingresso', 'hbo', 'disney',
    'prime video', 'youtube', 'twitch', 'playstation', 'xbox', 'nintendo',
    'games', 'bar', 'balada', 'show', 'teatro', 'museu', 'parque'
  ],
  saude: [
    'farmacia', 'drogasil', 'drogaria', 'pague menos', 'raia', 'panvel',
    'droga', 'hospital', 'clinica', 'medico', 'dentista', 'exame', 'laboratorio',
    'consulta', 'fisioterapia', 'psicólogo', 'academia', 'gym', 'smart fit'
  ],
  moradia: [
    'luz', 'agua', 'gas', 'aluguel', 'condominio', 'iptu', 'energia',
    'eletricidade', 'enel', 'sabesp', 'copasa', 'cemig', 'celpe', 'internet',
    'telefone', 'vivo', 'claro', 'tim', 'oi', 'net'
  ],
  educacao: [
    'escola', 'faculdade', 'universidade', 'curso', 'livro', 'livraria',
    'udemy', 'coursera', 'alura', 'rocketseat', 'mensalidade', 'material'
  ],
  investimentos: [
    'investimento', 'ação', 'ações', 'fundo', 'tesouro', 'cdb', 'lci', 'lca',
    'cripto', 'bitcoin', 'corretora', 'xp', 'rico', 'clear', 'nuinvest'
  ],
  salario: [
    'salário', 'salario', 'pagamento', 'folha', 'holerite', 'vencimento'
  ],
  freelance: [
    'freelance', 'freela', 'projeto', 'consultoria', 'serviço prestado'
  ],
  outros: [],
};

// Palavras-chave para identificar receita
const incomeKeywords = [
  'recebeu', 'pix recebido', 'depósito', 'deposito', 'transferência recebida',
  'transferencia recebida', 'crédito', 'credito', 'você recebeu', 'voce recebeu',
  'recebido', 'entrada', 'pagamento recebido'
];

// Palavras-chave para identificar despesa
const expenseKeywords = [
  'compra', 'pagamento', 'pagou', 'débito', 'debito', 'saque', 'transferência enviada',
  'transferencia enviada', 'pix enviado', 'você pagou', 'voce pagou', 'saída', 'saida'
];

/**
 * Normaliza valor monetário de formato brasileiro para número
 * "50,00" -> 50.00
 * "1.234,56" -> 1234.56
 */
function normalizeAmount(value: string): number {
  // Remove espaços e R$
  let cleaned = value.replace(/[R$\s]/g, '').trim();
  
  // Se tem ponto e vírgula, formato brasileiro
  if (cleaned.includes('.') && cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    // Apenas vírgula = decimal
    cleaned = cleaned.replace(',', '.');
  }
  
  return parseFloat(cleaned) || 0;
}

/**
 * Detecta o banco pelo package name
 */
export function detectBankByPackage(packageName: string): Bank | null {
  return bankPackages[packageName] || null;
}

/**
 * Detecta o banco pelo texto da notificação
 */
function detectBankByText(text: string): Bank | null {
  const lowerText = text.toLowerCase();
  
  for (const [bank, keywords] of Object.entries(bankKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return bank as Bank;
      }
    }
  }
  
  return null;
}

/**
 * Extrai o valor monetário do texto
 */
function extractAmount(text: string): number | null {
  // Padrão para encontrar R$ seguido de valor
  const patterns = [
    /R\$\s*([\d.,]+)/i,
    /(?:valor|total)[:\s]+R?\$?\s*([\d.,]+)/i,
    /(?:de|por)\s+R?\$?\s*([\d.,]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amount = normalizeAmount(match[1]);
      if (amount > 0) {
        return amount;
      }
    }
  }
  
  return null;
}

/**
 * Extrai o nome do estabelecimento/merchant
 */
function extractMerchant(text: string): string | null {
  // Padrões comuns de notificações bancárias
  const patterns = [
    /(?:em|no|na|para)\s+([A-Za-zÀ-ÿ0-9\s\*]+?)(?:\.|,|$|\s+R\$|\s+no\s+valor)/i,
    /(?:compra|pagamento).*?(?:em|no|na|para)\s+([A-Za-zÀ-ÿ0-9\s\*]+?)(?:\.|,|$)/i,
    /(?:R\$[\d.,]+)\s+(?:em|no|na|para)?\s*([A-Za-zÀ-ÿ0-9\s\*]+?)(?:\.|,|$)/i,
    /-\s*([A-Za-zÀ-ÿ0-9\s\*]+?)(?:\.|,|$)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const merchant = match[1].trim();
      // Validar que não é muito curto ou muito longo
      if (merchant.length >= 2 && merchant.length <= 50) {
        // Limpar asteriscos e espaços extras
        return merchant.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
      }
    }
  }
  
  return null;
}

/**
 * Detecta a categoria com base no merchant
 */
function detectCategory(merchant: string | null, text: string): Category {
  const searchText = `${merchant || ''} ${text}`.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return category as Category;
      }
    }
  }
  
  return 'outros';
}

/**
 * Detecta se é receita ou despesa
 */
function detectTransactionType(text: string): 'expense' | 'income' {
  const lowerText = text.toLowerCase();
  
  for (const keyword of incomeKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return 'income';
    }
  }
  
  for (const keyword of expenseKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return 'expense';
    }
  }
  
  // Default: despesa (mais comum em notificações)
  return 'expense';
}

/**
 * Calcula o nível de confiança do parsing
 */
function calculateConfidence(
  amount: number | null,
  merchant: string | null,
  bank: Bank | null
): 'high' | 'medium' | 'low' {
  let score = 0;
  
  if (amount !== null && amount > 0) score += 2;
  if (merchant !== null && merchant.length > 2) score += 1;
  if (bank !== null) score += 1;
  
  if (score >= 3) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

/**
 * Função principal de parsing de notificação
 */
export function parseNotification(
  text: string,
  packageName?: string
): ParsedNotification {
  // Detectar banco
  let bank = packageName ? detectBankByPackage(packageName) : null;
  if (!bank) {
    bank = detectBankByText(text);
  }
  
  // Extrair dados
  const amount = extractAmount(text);
  const merchant = extractMerchant(text);
  const type = detectTransactionType(text);
  const category = detectCategory(merchant, text);
  const confidence = calculateConfidence(amount, merchant, bank);
  
  return {
    bank,
    amount,
    merchant,
    category,
    type,
    confidence,
    rawText: text,
  };
}

/**
 * Formata valor para exibição
 */
export function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}
