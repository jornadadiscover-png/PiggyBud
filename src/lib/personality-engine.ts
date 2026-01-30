import { Category } from '@/types';

// Reaction phrases by amount range
const reactionsByAmount: Record<string, string[]> = {
  tiny: [
    "Isso aí! Cada centavo conta! 🪙",
    "Gastinho básico, tá suave! 😎",
    "Controlado! Gostei! 💪",
    "Nem senti no bolso! 👌",
    "Economia é isso aí! ⭐",
  ],
  small: [
    "Tranquilo, tá no controle! 😊",
    "Gastinho de boa, pode seguir! 🚶",
    "Normal, vida que segue! 💫",
    "Tá dentro do orçamento! ✅",
    "Esse dá pra relevar! 😄",
  ],
  medium: [
    "Opa, tá gastando hein! 👀",
    "Cuidado, tá animado hoje! 🎢",
    "O dinheiro tá escorrendo... 💸",
    "Calma lá, cowboy! 🤠",
    "Pisou no freio ou acelerou? 🚗",
  ],
  high: [
    "Socorro! Chamem meu gerente! 😱",
    "ALERTA VERMELHO! 🚨",
    "Quem precisa de economia, né? 💀",
    "O cartão tá pegando fogo! 🔥",
    "RIP orçamento do mês! ⚰️",
  ],
  epic: [
    "Dois dias de trabalho nesse jantar? Corajoso! 🦁",
    "Alerta de Burguês Safado! 🎩",
    "Uau, virou milionário e não me contou? 💎",
    "O banco acabou de abrir champanhe! 🍾",
    "Você tá sabendo que isso é dinheiro de verdade, né? 🤑",
    "Calma, Bill Gates! 💰",
  ],
};

// Reactions by category
const reactionsByCategory: Partial<Record<Category, string[]>> = {
  alimentacao: [
    "Comida é vida, mas o bolso chora! 🍕",
    "Barriga cheia, carteira vazia! 🍔",
    "Que fome cara, hein! 😋",
    "Masterchef do delivery! 🍜",
  ],
  lazer: [
    "Diversão não tem preço... ou tem? 🎬",
    "Netflix e boletos! 📺",
    "Vida de influencer! ✨",
    "All work no play é ruim mesmo! 🎮",
  ],
  transporte: [
    "Uber eats... do seu dinheiro! 🚕",
    "99 motivos pra andar a pé! 🚶",
    "Gasolina tá mais cara que perfume! ⛽",
    "Bora de busão semana que vem! 🚌",
  ],
  compras: [
    "Shopaholics anônimos te espera! 🛒",
    "Amazon Prime da vida! 📦",
    "A Shopee agradece! 🛍️",
    "Precisava MESMO disso? 🤔",
  ],
  saude: [
    "Saúde em primeiro lugar! 💊",
    "Investindo no bem-estar! 🏥",
    "Melhor prevenir que remediar... ops! 💉",
  ],
};

// Get amount range key
function getAmountRange(amount: number): string {
  if (amount <= 20) return 'tiny';
  if (amount <= 50) return 'small';
  if (amount <= 100) return 'medium';
  if (amount <= 200) return 'high';
  return 'epic';
}

// Get random item from array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Main personality engine function
export function generateReaction(amount: number, category: Category): string {
  const amountRange = getAmountRange(amount);
  
  // 30% chance to use category-specific reaction if available
  const categoryReactions = reactionsByCategory[category];
  if (categoryReactions && Math.random() < 0.3) {
    return getRandomItem(categoryReactions);
  }
  
  // Default to amount-based reaction
  const amountReactions = reactionsByAmount[amountRange];
  return getRandomItem(amountReactions);
}

// Generate mood emoji based on amount
export function getMoodEmoji(amount: number): string {
  if (amount <= 20) return '😊';
  if (amount <= 50) return '🙂';
  if (amount <= 100) return '😅';
  if (amount <= 200) return '😰';
  return '🤯';
}

// Generate summary reaction for daily totals
export function generateDailySummary(totalSpent: number, budget: number): string {
  const percentage = (totalSpent / budget) * 100;
  
  if (percentage <= 50) {
    return `Muito bem! Gastou só ${percentage.toFixed(0)}% do orçamento hoje! 🌟`;
  }
  if (percentage <= 80) {
    return `Tá indo bem, mas fica de olho! ${percentage.toFixed(0)}% do orçamento usado. 👀`;
  }
  if (percentage <= 100) {
    return `Cuidado! Já usou ${percentage.toFixed(0)}% do orçamento! 🚨`;
  }
  return `Estourou o orçamento em ${(percentage - 100).toFixed(0)}%! Amanhã é outro dia... 💸`;
}

// Income reactions (positive)
export function generateIncomeReaction(amount: number): string {
  const reactions = [
    `Ka-ching! +R$ ${amount.toFixed(2)} na conta! 💰`,
    `O dinheiro tá entrando! 🤑`,
    `Trabalho valeu a pena! 💪`,
    `Mais um pro cofrinho! 🐷`,
    `Isso sim é notícia boa! 🎉`,
    `Conta engordando! 📈`,
  ];
  return getRandomItem(reactions);
}
