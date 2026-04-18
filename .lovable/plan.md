

# Plano: Atalho do Tutor no BottomNav + Estratégia de Login

## Parte 1 — Ícone do Tutor ao lado do Feed

Adicionar nova aba **"Tutor"** no `BottomNav` logo após "Feed", usando o ícone `GraduationCap` (já usado no MaisPage para essa seção, mantendo consistência visual).

### Problema: 6 abas em 411px de largura
O nav atualmente tem 5 abas. Adicionar uma 6ª deixa cada botão com ~68px — ainda funcional, mas apertado. Solução: **encurtar labels** (`Calc`, `Tutor`, `Mais`) e remover o emoji `👑 PRO` (manter só "Premium" colorido em âmbar quando ativo).

### Mudanças
- **`src/components/BottomNav.tsx`**: adicionar `{ id: 'tutor', label: 'Tutor', icon: GraduationCap }` na posição 2 (entre Feed e Planilha); remover `'tutor'` do array `maisChildren` (passa a ser aba própria); reduzir padding horizontal para caber 6 itens
- **`src/pages/MaisPage.tsx`**: remover o item "Tutor de Investimentos" (já fica acessível direto pelo nav)

---

## Parte 2 — Análise: Como está o login hoje

Estado atual do app:
1. **PIN local de 4-6 dígitos** — protege o app, mas é o MESMO PIN para qualquer pessoa que abrir (não diferencia usuários)
2. **Email/senha (Supabase Auth)** — existe, mas só é usado para gerenciar assinatura Premium; o resto do app funciona 100% local
3. **Dados ficam no `localStorage`** do dispositivo — não sincronizam entre aparelhos nem distinguem usuários

**Problema real**: o PIN não diferencia usuários. Se duas pessoas usam o mesmo aparelho, veem as mesmas transações. E o login com email só serve pra Premium, o que confunde.

### Recomendação: **Email/senha como entrada principal + PIN opcional como atalho**

Esta é a abordagem padrão de apps financeiros (Nubank, C6, PicPay):

```text
Primeira vez: Cadastro com email/senha → cria conta
Próximas vezes: PIN rápido (atalho do mesmo usuário)
Trocar de usuário: Sair → entrar com outro email
```

**Vantagens**:
- Diferencia usuários de verdade (cada email = uma conta)
- PIN continua sendo o acesso rápido do dia a dia
- Permite no futuro sincronizar dados na nuvem (multi-dispositivo)
- Premium fica naturalmente ligado ao usuário logado
- Cadastro fácil: só email + senha (sem precisar verificar email se a gente desativar)

### Mudanças propostas (Parte 2)

1. **Login obrigatório no primeiro uso**
   - Tela de boas-vindas com botões "Criar conta" / "Entrar"
   - Sem login, app não abre (exceto talvez "modo convidado" — perguntar)
   
2. **PIN vira atalho do usuário logado**
   - Após login, usuário pode opcionalmente criar PIN
   - PIN só desbloqueia a sessão atual; logout limpa o PIN local
   
3. **Auto-confirmação de email ativada** (sem precisar verificar email para entrar) — facilita onboarding
   
4. **Botão "Sair" no Perfil** — limpa sessão e pede login de novo

### Arquivos afetados (Parte 2)
- **`src/pages/Index.tsx`**: gate de auth antes de qualquer tela; ordem: Auth → PIN (se ativado) → App
- **`src/pages/AuthPage.tsx`**: virar tela inicial com visual mais acolhedor (logo grande, mensagem de boas-vindas)
- **`src/stores/useSettingsStore.ts`**: vincular PIN ao usuário logado (chave do localStorage com `userId`)
- **`src/pages/PerfilPage.tsx`**: adicionar botão "Sair"
- **Configuração Supabase**: ativar auto-confirm de email

---

## Decisão necessária

Antes de implementar a Parte 2, preciso confirmar 2 pontos:

**Pergunta 1 — Modo convidado?**
- (A) **Login obrigatório** — todo usuário precisa criar conta para usar o app (recomendado, diferencia usuários de verdade)
- (B) **Modo convidado opcional** — usuário pode usar sem conta (dados só locais), mas pode criar conta depois

**Pergunta 2 — Sincronização de dados na nuvem?**
- (A) **Manter dados locais por enquanto** — login só identifica o usuário, transações continuam no `localStorage` do aparelho
- (B) **Sincronizar transações na nuvem** — requer criar tabelas, migrations, RLS, refatorar todos os stores (trabalho maior, fica para próxima iteração)

Recomendo **1A + 2A**: login obrigatório (resolve o problema de diferenciar usuários sem complicar) e dados continuam locais por enquanto (sincronização é uma feature grande e separada).

Confirma essas escolhas para eu prosseguir? Se preferir outra combinação, me diz qual.

