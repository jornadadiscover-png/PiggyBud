

# 💰 FinMood - App de Controle Financeiro com Personalidade

## Visão Geral
Um aplicativo de controle financeiro completo que combina automação inteligente com humor e motivação. O app lê notificações bancárias, reage com mensagens engraçadas baseadas nos gastos, e oferece uma planilha completa para gestão financeira manual.

---

## 🎨 Design & Identidade Visual
- **Estilo moderno e colorido** inspirado em fintechs brasileiras (Nubank, PicPay)
- Gradientes vibrantes em roxo e verde
- Cards com sombras suaves e cantos arredondados
- Ícones animados para reações do app
- Emojis nas mensagens de personalidade

---

## 📱 Estrutura de Navegação (5 Abas)

### 1. **Feed (Início)**
- Timeline de transações com as reações do app
- Cards coloridos mostrando gasto + mensagem engraçada
- Resumo do dia no topo (total gasto, saldo)
- Botão "Simular Notificação" para testes

### 2. **Planilha**
- Tabela editável estilo Excel
- Células clicáveis para edição inline
- Filtros por período, categoria, tipo
- Botão flutuante (+) para adicionar transações manuais
- Separação entre Receitas e Despesas

### 3. **Relatórios**
- Gráficos de gastos por categoria (pizza/barras)
- Evolução mensal (linha do tempo)
- Comparativo mês atual vs anterior
- Top 5 maiores gastos do mês

### 4. **Configurações**
- Gerenciar bancos monitorados (Nubank, Itaú, Bradesco, C6, Mercado Pago, PagBank, Inter, etc.)
- Configurar horários de lembretes
- Personalizar categorias
- Ajustar sensibilidade das reações (mais ou menos engraçadas)
- Alterar PIN de acesso

### 5. **Perfil**
- Dados pessoais do usuário
- Metas financeiras mensais
- Conquistas/badges (gamificação leve)
- Backup/exportar dados

---

## 🎭 Motor de Personalidade

### Reações por Faixa de Valor:
- **Até R$ 20**: Mensagens de incentivo ("Isso aí! Cada centavo conta!")
- **R$ 20-50**: Reações neutras com piadas leves
- **R$ 50-100**: Alertas humorísticos ("Opa, tá gastando hein!")
- **R$ 100-200**: Reações dramáticas ("Socorro! Chamem meu gerente!")
- **Acima de R$ 200**: Mensagens épicas ("Dois dias de trabalho nesse jantar? Corajoso!")

### Reações por Categoria:
- **Alimentação**: Piadas com comida
- **Entretenimento**: Referências pop
- **Transporte**: Memes de Uber/99

---

## 🔔 Sistema de Notificações e Lembretes

- **Lembrete diário às 20h**: "Vamos fechar o caixa do dia?"
- **Domingo à noite**: Resumo semanal
- **Início do mês**: Meta do mês anterior atingida?
- **Alertas de meta**: Quando ultrapassar 80% do limite

---

## 🔐 Segurança

- **Tela de bloqueio com PIN** (4-6 dígitos)
- Opção de bloqueio automático ao sair do app
- Dados armazenados localmente de forma criptografada
- Sem envio de dados para servidores externos

---

## 🏦 Bancos Suportados (Simulação/Mock)
- Nubank, Itaú, Bradesco, Banco do Brasil
- C6 Bank, Inter, Next
- Mercado Pago, PagBank, PicPay
- Caixa, Santander

---

## 📦 Estrutura de Dados

### Transações
- Valor, Estabelecimento, Categoria
- Data/Hora, Fonte (auto/manual)
- Reação do app (mood)
- Banco de origem

### Categorias Padrão
- Alimentação, Transporte, Moradia
- Saúde, Educação, Lazer
- Compras, Investimentos, Outros

---

## 🚀 Entrega

O app será construído em React + Vite, pronto para conversão em app nativo via Capacitor. Incluirá:

1. Interface completa com todas as 5 abas funcionais
2. Sistema de PIN para proteção
3. Banco de dados local (localStorage/IndexedDB)
4. Botão de simulação para testar as reações
5. Planilha editável com todas as funcionalidades
6. Gráficos interativos de relatórios
7. Sistema de lembretes configurável
8. Instruções para configurar como app nativo Android/iOS

