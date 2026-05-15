## Objetivo
Expandir a Biblioteca de Investimentos da página Tutor com mais exemplos didáticos em PT-BR, mantendo o mesmo padrão visual (ícone + título + frase curta + explicação completa com exemplo numérico).

## Arquivo a editar
- `src/pages/TutorPage.tsx` — array `investmentLibrary`

## Novos itens a adicionar (8 novos, totalizando 14)
1. **LCI e LCA** — Renda fixa isenta de IR, lastreada em crédito imobiliário/agro, com FGC.
2. **Poupança** — Tradicional, isenta de IR, mas com baixo rendimento (comparar com Tesouro Selic).
3. **Tesouro IPCA+** — Protege da inflação, ideal para longo prazo/aposentadoria.
4. **Debêntures** — Empréstimo a empresas; debêntures incentivadas são isentas de IR.
5. **ETFs** — Fundos de índice negociados em bolsa (ex: BOVA11, IVVB11).
6. **BDRs** — Investir em ações estrangeiras (Apple, Google) pela B3.
7. **Previdência Privada (PGBL/VGBL)** — Aposentadoria complementar e benefícios fiscais.
8. **Ouro** — Reserva de valor e proteção contra crises.

Cada item segue o formato existente: `{ icon, title, short, full }`, com exemplo numérico em reais quando aplicável. Ícones do `lucide-react` (importar os novos: `Landmark`, `Shield`, `LineChart`, `Globe`, `Briefcase`, `Gem`, etc.).

## Fora de escopo
- Não mexer em PremiumGate, posts diários, layout ou outras seções.
- Sem mudanças de backend ou tipos.
