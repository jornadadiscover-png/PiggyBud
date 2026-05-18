## Editar/Excluir Transações Recentes

Tornar cada card do feed "Transações Recentes" interativo: ao tocar, o usuário pode editar (descrição, valor, categoria, tipo) ou excluir a transação.

### Mudanças

**1. `src/components/EditTransactionDialog.tsx` (novo)**
- Dialog reutilizando o mesmo layout do `AddTransactionDialog` (Tabs Despesa/Receita, Valor, Descrição, Categoria).
- Pré-preenche os campos com a transação selecionada.
- Botão "Salvar" chama `updateTransaction(id, {...})` do store.
- Botão "Excluir" (variant destructive) com `AlertDialog` de confirmação ("Tem certeza? Esta ação não pode ser desfeita.") → chama `deleteTransaction(id)`.
- Toasts de sucesso em PT-BR.

**2. `src/components/TransactionCard.tsx`**
- Tornar o card clicável (`onClick` → abre o dialog de edição) com `cursor-pointer` e leve `active:scale`.
- Adicionar prop opcional `onEdit?: (t: Transaction) => void`. Se ausente, card permanece não-interativo (mantém compatibilidade com outros usos).

**3. `src/pages/FeedPage.tsx`**
- Estado `editingTransaction` + handler que passa para `TransactionCard.onEdit`.
- Renderizar `<EditTransactionDialog transaction={editingTransaction} ... />`.

### Fora do escopo
- Edição de data (mantém a original).
- Mudanças no backend/Supabase — tudo é local (Zustand persist).
- Página Planilha já tem edição própria — não será alterada.
