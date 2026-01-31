

# Plano de Melhorias - FinFunny

## 1. Mudanca de Nome: FinMood para FinFunny

Atualizar o nome do app em todos os arquivos onde aparece:

| Arquivo | Mudanca |
|---------|---------|
| `index.html` | Titulo, meta tags (og:title, twitter:site, description) |
| `capacitor.config.json` | Campo `appName` |
| `src/index.css` | Comentario do design system |
| `src/components/ExportReportDialog.tsx` | Titulo do relatorio, footer, preview |
| `src/stores/useTransactionStore.ts` | Nome do storage |
| `src/stores/useSettingsStore.ts` | Nome do storage |

---

## 2. Remover Botao CSV

O botao "CSV" sera removido do `ExportReportDialog.tsx`, deixando apenas o botao "Imprimir / PDF" que funciona corretamente. A funcao `handleDownloadCSV` tambem sera removida.

---

## 3. Diferenciais Propostos para o FinFunny

Analisei o mercado de apps financeiros e proponho **4 diferenciais unicos** que vao alem da leitura automatica de notificacoes:

### 3.1 Mascote Animado com Expressoes

Um personagem animado (tipo Clippy, mas moderno) que aparece na tela com diferentes expressoes baseadas nos gastos:

```text
+------------------------------------------+
|                                          |
|     😊 -> 😅 -> 😰 -> 🤯 -> 💀          |
|                                          |
|  O mascote muda de expressao conforme    |
|  o usuario gasta mais durante o dia      |
+------------------------------------------+
```

**Implementacao:**
- Componente `MascotAvatar` com SVG animado
- 5 estados de humor: feliz, normal, preocupado, assustado, dramatico
- Animacoes CSS suaves de transicao
- Aparece no header do Feed e nas notificacoes

### 3.2 Modo Desafio Mensal

Sistema de desafios que engaja o usuario a economizar:

- "Semana sem iFood" - Evite delivery por 7 dias
- "Modo Economico" - Gaste menos que X por dia
- "Transporte Alternativo" - Use apps de transporte menos vezes
- Recompensas: badges especiais, frases de elogio exclusivas

### 3.3 Comparacao Social Anonima

Mostrar ao usuario como ele se compara com outros usuarios (dados agregados e anonimos):

- "Voce gasta 20% menos em alimentacao que a media"
- "Seu controle de gastos esta no top 30%"

*Nota: Como nao temos backend, isso sera simulado com dados ficticios para demonstracao*

### 3.4 Frases do Dia Personalizadas

Uma frase motivacional/engraçada diferente a cada dia, baseada no comportamento do usuario:

- Se economizou ontem: "Ontem voce arrasou! Bora manter o ritmo?"
- Se gastou muito: "Dia novo, cartao zerado. Vamos la!"
- Fim do mes: "Reta final! Aguenta firme!"

---

## 4. Plano de Implementacao

### Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/components/MascotAvatar.tsx` | Mascote animado com expressoes |
| `src/components/DailyQuote.tsx` | Frase do dia personalizada |
| `src/components/ChallengesCard.tsx` | Card de desafios mensais |

### Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `index.html` | Nome FinFunny |
| `capacitor.config.json` | appName: FinFunny |
| `src/index.css` | Comentario atualizado |
| `src/components/ExportReportDialog.tsx` | Remover CSV, atualizar nome |
| `src/stores/*.ts` | Atualizar nomes dos storages |
| `src/pages/FeedPage.tsx` | Adicionar mascote e frase do dia |
| `src/pages/PerfilPage.tsx` | Adicionar secao de desafios |
| `src/lib/personality-engine.ts` | Adicionar funcoes para desafios e frases |

---

## 5. Detalhes Tecnicos

### Mascote Animado

```text
Estado         | Gasto Diario    | Expressao
---------------|-----------------|----------
Feliz          | 0-30% meta      | Sorriso grande
Normal         | 30-60% meta     | Sorriso leve
Preocupado     | 60-80% meta     | Cara de duvida
Assustado      | 80-100% meta    | Olhos arregalados
Dramatico      | 100%+ meta      | Chorando/desesperado
```

### Sistema de Desafios

Novos campos no `useSettingsStore`:

```text
challenges: [
  {
    id: string,
    title: string,
    description: string,
    category: string,
    targetDays: number,
    currentStreak: number,
    completed: boolean
  }
]
```

### Frases do Dia

Funcao `getDailyQuote(userStats)` que retorna uma frase baseada em:
- Dia da semana
- Gastos do dia anterior
- Tendencia do mes
- Proximidade da meta

---

## 6. Resultado Esperado

1. Nome do app atualizado para FinFunny em todos os lugares
2. Botao CSV removido do relatorio
3. Mascote animado no Feed que reage aos gastos
4. Sistema de desafios mensais para engajamento
5. Frase do dia personalizada no topo do Feed
6. App mais divertido e diferenciado da concorrencia

