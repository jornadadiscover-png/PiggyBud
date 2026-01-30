

# Plano de Correções - FinMood

## Problema 1: Gastos por Categoria somando Receitas + Despesas

### Situacao Atual
A funcao `getTotalByCategory` no store soma todas as transacoes de uma categoria, independente de ser receita ou despesa. No grafico de pizza "Gastos por Categoria", isso faz com que valores de receita (salario, freelance) sejam misturados com despesas.

### Solucao
Modificar a logica no `RelatoriosPage.tsx` para filtrar apenas transacoes do tipo `expense` antes de calcular os totais por categoria.

**Mudancas no arquivo `src/pages/RelatoriosPage.tsx`:**
- Atualizar o `useMemo` de `categoryData` para filtrar apenas despesas
- Excluir categorias de receita (salario, freelance, investimentos) da lista de categorias do grafico

---

## Problema 2: Conquistas sem explicacao

### Situacao Atual
Os icones de conquistas aparecem em uma grid 5x5 sem nenhuma explicacao visivel. O usuario precisa passar o mouse para ver o titulo (via `title`), o que nao funciona bem em mobile.

### Solucao
Redesenhar a secao de conquistas para mostrar:
- Cada conquista em um card individual
- Titulo e descricao visiveis
- Indicador claro de "desbloqueado" vs "bloqueado"
- Barra de progresso mostrando conquistas obtidas

**Mudancas no arquivo `src/pages/PerfilPage.tsx`:**
- Substituir a grid de icones por uma lista de cards detalhados
- Adicionar header explicativo "Desbloqueie conquistas usando o app"
- Mostrar status de cada conquista de forma clara

---

## Problema 3: Exportacao ruim (apenas JSON)

### Situacao Atual
A exportacao gera apenas um arquivo JSON bruto que nao e legivel para usuarios comuns.

### Solucao
Criar um relatorio visual completo em HTML/PDF com:
- Resumo financeiro do mes
- Graficos e estatisticas
- Lista de transacoes formatada
- Opcao de visualizar antes de baixar

**Novo componente `src/components/ExportReportDialog.tsx`:**
- Dialog com preview do relatorio
- Opcoes: visualizar, baixar PDF (via impressao), baixar CSV
- Design bonito e profissional

**Conteudo do Relatorio:**
- Cabecalho com nome do usuario e periodo
- Resumo: Total Receitas, Total Despesas, Saldo
- Grafico de categorias (representacao textual)
- Tabela de transacoes completa
- Rodape com data de geracao

---

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/stores/useTransactionStore.ts` | Adicionar funcao `getTotalByCategoryAndType` para filtrar por tipo |
| `src/pages/RelatoriosPage.tsx` | Usar apenas despesas no grafico de categorias |
| `src/pages/PerfilPage.tsx` | Redesenhar conquistas + integrar novo dialog de exportacao |
| `src/components/ExportReportDialog.tsx` | Novo componente para relatorio visual |

---

## Detalhes Tecnicos

### Nova funcao no Store
```text
getTotalByCategoryAndType: (category, type, month, year) => number
```
Filtra transacoes por categoria E tipo (expense/income).

### Estrutura do Relatorio de Exportacao
```text
+------------------------------------------+
|  FINMOOD - Relatorio Financeiro          |
|  Usuario: [Nome]                         |
|  Periodo: Janeiro 2026                   |
+------------------------------------------+
|                                          |
|  RESUMO DO MES                           |
|  +----------+  +----------+  +--------+  |
|  | Receitas |  | Despesas |  | Saldo  |  |
|  | R$ X,XX  |  | R$ X,XX  |  | R$ X,XX|  |
|  +----------+  +----------+  +--------+  |
|                                          |
|  GASTOS POR CATEGORIA                    |
|  Alimentacao ████████ R$ 500            |
|  Transporte  ████     R$ 250            |
|  Lazer       ██       R$ 125            |
|                                          |
|  TRANSACOES                              |
|  +------+--------+--------+--------+     |
|  | Data | Desc   | Categ  | Valor  |     |
|  +------+--------+--------+--------+     |
|  | 01/01| iFood  | Alim.  | -50,00 |     |
|  | 02/01| Uber   | Transp | -25,00 |     |
|  | 05/01| Salario| Salario| +5000  |     |
|  +------+--------+--------+--------+     |
|                                          |
|  Gerado em: 30/01/2026 as 14:30          |
+------------------------------------------+
```

### Redesign das Conquistas
Cada conquista sera exibida como:
```text
+------------------------------------------+
| [Icone] Titulo da Conquista              |
|         Descricao do que precisa fazer   |
|         [Desbloqueado] ou [Bloqueado]    |
+------------------------------------------+
```

---

## Resultado Esperado

1. O grafico de pizza mostrara apenas DESPESAS por categoria
2. As conquistas terao explicacoes claras e visiveis
3. A exportacao gerara um relatorio bonito e profissional que pode ser visualizado, impresso ou baixado

