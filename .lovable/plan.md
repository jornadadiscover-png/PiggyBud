
# Plano: Leitura Automatica de Notificacoes Bancarias

## Visao Geral

Este plano implementa **duas funcionalidades complementares**:

1. **Leitura Automatica (Android APK)**: Usando NotificationListenerService via Capacitor
2. **Parsing Manual (Fallback)**: Usuario cola o texto da notificacao e o app extrai os dados

---

## PARTE 1: Sistema de Parsing de Notificacoes Bancarias

### 1.1 Criar Engine de Parsing

Criar arquivo `src/lib/notification-parser.ts` com:

**Funcao principal**: `parseNotification(text: string)`

Retorna:
```text
{
  bank: Bank | null,
  amount: number | null,
  merchant: string | null,
  type: 'expense' | 'income',
  confidence: 'high' | 'medium' | 'low'
}
```

**Padroes de Regex por banco:**

| Banco | Padrao de Notificacao | Regex |
|-------|----------------------|-------|
| Nubank | "Compra aprovada R$ 50,00 em IFOOD" | `/compra.*?R\$\s*([\d.,]+).*?em\s+(.+)/i` |
| Itau | "Compra no debito R$ 35,90 UBER" | `/compra.*?R\$\s*([\d.,]+)\s+(.+)/i` |
| C6 | "Pagamento de R$ 120,00 para Mercado Livre" | `/pagamento.*?R\$\s*([\d.,]+).*?para\s+(.+)/i` |
| Inter | "Voce pagou R$ 45,00 em AMAZON" | `/pagou.*?R\$\s*([\d.,]+).*?em\s+(.+)/i` |
| Bradesco | "Compra aprovada R$80,00 PADARIA" | `/compra.*?R\$\s*([\d.,]+)\s*(.+)/i` |
| BB | "Debito autorizado R$ 25,00 - FARMACIA" | `/debito.*?R\$\s*([\d.,]+).*?-\s*(.+)/i` |
| Caixa | "Compra cartao R$ 100,00 SUPERMERCADO" | `/compra.*?R\$\s*([\d.,]+)\s+(.+)/i` |
| Santander | "Compra aprovada R$ 60,00 RESTAURANTE" | `/compra.*?R\$\s*([\d.,]+)\s+(.+)/i` |
| Mercado Pago | "Pagamento de R$ 30,00 para LOJA X" | `/pagamento.*?R\$\s*([\d.,]+).*?para\s+(.+)/i` |
| PagBank | "Pagamento R$ 55,00 enviado para LOJA" | `/pagamento.*?R\$\s*([\d.,]+).*?para\s+(.+)/i` |
| PicPay | "Voce pagou R$ 20,00 para @usuario" | `/pagou.*?R\$\s*([\d.,]+).*?para\s+(.+)/i` |

**Deteccao de banco por package name:**

```text
bankPackages = {
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
  'com.picpay': 'picpay'
}
```

**Categorizacao automatica por merchant:**

```text
categoryKeywords = {
  alimentacao: ['ifood', 'uber eats', 'rappi', 'restaurante', 'padaria', 'lanchonete', 'mcdonalds', 'burger', 'pizza'],
  transporte: ['uber', '99', 'cabify', 'posto', 'shell', 'ipiranga', 'gasolina'],
  compras: ['amazon', 'shopee', 'mercado livre', 'magazine', 'americanas', 'casas bahia'],
  lazer: ['netflix', 'spotify', 'steam', 'cinema', 'ingresso'],
  saude: ['farmacia', 'drogasil', 'drogaria', 'pague menos'],
  moradia: ['luz', 'agua', 'gas', 'aluguel', 'condominio']
}
```

### 1.2 Criar Componente de Parsing Manual

Criar `src/components/PasteNotificationDialog.tsx`:

**UI:**
```text
+------------------------------------------+
|  📋 Colar Notificacao                    |
+------------------------------------------+
|                                          |
|  Cole o texto da notificacao:            |
|  +------------------------------------+  |
|  |                                    |  |
|  |  [Textarea grande]                 |  |
|  |                                    |  |
|  +------------------------------------+  |
|                                          |
|  Exemplo: "Compra aprovada R$ 50,00      |
|  em IFOOD"                               |
|                                          |
|  --- Preview do Parsing ---              |
|  Banco: Nubank                           |
|  Valor: R$ 50,00                         |
|  Local: iFood                            |
|  Categoria: Alimentacao                  |
|                                          |
|  [  Adicionar Transacao  ]               |
+------------------------------------------+
```

**Funcionalidades:**
- Textarea para colar texto
- Preview em tempo real do parsing
- Botao para confirmar e adicionar transacao
- Edicao manual se parsing nao for perfeito

---

## PARTE 2: Leitura Automatica via Capacitor (Android)

### 2.1 Arquitetura

```text
+-------------------+     +----------------------+
|  Android System   |     |   FinFunny App       |
|  Notifications    |---->|   (Capacitor)        |
+-------------------+     +----------------------+
         |                         |
         v                         v
+-------------------+     +----------------------+
| NotificationList- |     | notification-parser  |
| enerService       |---->| (regex engine)       |
+-------------------+     +----------------------+
                                   |
                                   v
                          +----------------------+
                          | useTransactionStore  |
                          | (auto add)           |
                          +----------------------+
```

### 2.2 Configuracao do Capacitor

**Nota importante**: O plugin `capacitor-notificationlistener` foi arquivado. Vamos criar uma implementacao customizada usando codigo nativo Android.

**Arquivos a criar:**

1. `src/lib/notification-service.ts` - Wrapper TypeScript
2. Instrucoes para o usuario configurar no Android Studio apos exportar

**Implementacao Web (para testes):**

Criar um servico que funciona na web para testes e no Android real:

```text
NotificationService {
  - isAvailable(): boolean  // true em Android, false em web
  - hasPermission(): Promise<boolean>
  - requestPermission(): Promise<boolean>
  - startListening(): void
  - stopListening(): void
  - onNotification(callback): void
}
```

### 2.3 UI de Configuracao

Adicionar em `ConfigPage.tsx`:

**Secao "Leitura Automatica":**
```text
+------------------------------------------+
|  🔔 Leitura Automatica de Notificacoes   |
+------------------------------------------+
|                                          |
|  Status: [🟢 Ativo / 🔴 Inativo]          |
|                                          |
|  [  Ativar Leitura Automatica  ]         |
|                                          |
|  ⚠️ Apenas disponivel no app Android     |
|                                          |
|  Bancos monitorados:                     |
|  [x] Nubank  [x] Itau  [x] C6            |
|  [x] Inter   [ ] BB    [ ] Bradesco      |
+------------------------------------------+
```

### 2.4 Configuracao no Settings Store

Adicionar ao `AppSettings`:

```text
autoReadEnabled: boolean           // Leitura automatica ativada
autoReadPermissionGranted: boolean // Permissao concedida
lastAutoReadAt?: Date              // Ultima leitura
autoAddTransactions: boolean       // Adicionar automaticamente ou pedir confirmacao
```

---

## PARTE 3: Fluxo do Usuario

### 3.1 Primeira Configuracao

```text
1. Usuario abre Configuracoes
2. Ve secao "Leitura Automatica"
3. Clica em "Ativar"
4. Sistema verifica se e Android nativo
   - Se sim: solicita permissao de NotificationListener
   - Se nao: mostra opcao de "Colar Notificacao"
5. Usuario concede permissao
6. Sistema comeca a monitorar notificacoes
```

### 3.2 Quando Chega Notificacao

```text
1. App recebe notificacao
2. Verifica se e de um banco monitorado
3. Passa texto pelo parser
4. Se parsing bem-sucedido:
   - autoAddTransactions=true: adiciona automaticamente
   - autoAddTransactions=false: mostra toast perguntando
5. Exibe reacao do mascote
6. Toast com resumo da transacao
```

### 3.3 Fallback Manual

Se leitura automatica nao disponivel ou nao ativada:

```text
1. Usuario recebe notificacao no celular
2. Copia o texto
3. Abre FinFunny
4. Clica no botao "Colar Notificacao"
5. Cola o texto
6. App faz o parsing
7. Usuario confirma e adiciona
```

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/lib/notification-parser.ts` | Engine de parsing com regex |
| `src/lib/notification-service.ts` | Servico de leitura de notificacoes |
| `src/components/PasteNotificationDialog.tsx` | Dialog para colar notificacao |
| `src/hooks/useNotificationListener.ts` | Hook para gerenciar listener |

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/types/index.ts` | Adicionar tipos de parsing e notificacao |
| `src/stores/useSettingsStore.ts` | Adicionar configs de leitura automatica |
| `src/pages/ConfigPage.tsx` | Adicionar secao de leitura automatica |
| `src/pages/FeedPage.tsx` | Adicionar botao "Colar Notificacao" |
| `capacitor.config.json` | Adicionar configs de plugins |

---

## Detalhes Tecnicos

### Regex de Parsing

```text
Padrao generico para valor:
/R\$\s*([\d.,]+)/

Padrao generico para estabelecimento:
/(?:em|para|no|na)\s+([A-Za-z0-9\s]+)/i

Normalizacao de valor:
"50,00" -> 50.00
"1.234,56" -> 1234.56
```

### Deteccao de Tipo (Despesa vs Receita)

```text
Palavras-chave de RECEITA:
- "recebeu"
- "pix recebido"
- "deposito"
- "transferencia recebida"
- "credito"

Palavras-chave de DESPESA:
- "compra"
- "pagamento"
- "pagou"
- "debito"
- "saque"
```

### Integracao com Android Nativo

Para funcionar no APK Android, o usuario precisara:

1. Exportar projeto para GitHub
2. Abrir no Android Studio
3. Adicionar permissoes no AndroidManifest.xml
4. Implementar NotificationListenerService
5. Compilar APK

Forneceremos um guia passo-a-passo detalhado.

---

## Resultado Esperado

1. **Parser funcional** para notificacoes dos 12 bancos suportados
2. **Dialog de colar notificacao** funcional em qualquer plataforma
3. **Servico de leitura** preparado para Android nativo
4. **Secao de configuracao** para gerenciar leitura automatica
5. **Integracao com mascote** - reacoes quando transacao e adicionada automaticamente
6. **Documentacao** de como ativar no APK Android
