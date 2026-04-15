

# Plano: Aceitar Imagens e Documentos no Dialog de Notificação

## Visão Geral

Adicionar um botão de upload de arquivo ao dialog "Colar Notificação" que aceita imagens (screenshots de notificações bancárias) e documentos (PDF, Excel, Word). O conteúdo será extraído usando IA (Lovable AI com modelo Gemini) para imagens, e bibliotecas de parsing para documentos de texto.

## Arquitetura

```text
Usuário envia arquivo
       │
       ├── Imagem (jpg/png/webp) ──→ Edge Function (extract-text)
       │                              └── Gemini 2.5 Flash (OCR + extração)
       │                                   └── Retorna texto extraído
       │
       ├── PDF/Word/Excel ──────────→ Edge Function (extract-text)
       │                              └── Gemini (leitura do documento)
       │                                   └── Retorna texto extraído
       │
       └── Texto extraído ──────────→ parseNotification() (já existente)
                                       └── Preenche campos automaticamente
```

## Mudanças

### 1. Nova Edge Function: `supabase/functions/extract-text/index.ts`
- Recebe arquivo como base64 + tipo MIME
- Usa Lovable AI (Gemini 2.5 Flash) para extrair texto de imagens e documentos
- Prompt: "Extraia todo o texto visível desta imagem/documento, especialmente valores em R$, nomes de estabelecimentos e bancos"
- Retorna o texto extraído para o frontend fazer o parsing com a lógica já existente

### 2. Atualizar `src/components/PasteNotificationDialog.tsx`
- Adicionar input de arquivo (hidden) com accept para imagem, PDF, Excel, Word
- Adicionar botão "Enviar Arquivo" com ícone de upload ao lado do botão "Colar"
- Estado `isProcessing` para mostrar loading durante extração
- Ao selecionar arquivo: converter para base64, enviar à edge function, receber texto, colocar no campo de texto (que dispara o parsing automático existente)
- Atualizar descrição do dialog para mencionar arquivos

### 3. Atualizar textos e exemplos
- Título: "Importar Notificação"
- Descrição: "Cole o texto, envie uma imagem ou documento e o app extrairá os dados automaticamente."
- Exemplos: adicionar "📸 Screenshot de notificação bancária" e "📄 Extrato em PDF, Excel ou Word"

## Detalhes Técnicos

| Item | Detalhe |
|------|---------|
| Edge Function | `extract-text` — usa `LOVABLE_API_KEY` para chamar Gemini 2.5 Flash |
| Tipos aceitos | `image/*`, `.pdf`, `.xlsx`, `.xls`, `.docx`, `.doc`, `.csv`, `.txt` |
| Tamanho máximo | 10MB (validação no frontend) |
| Modelo IA | `google/gemini-2.5-flash` (rápido, bom com imagens e texto) |
| Parsing | Texto extraído passa pelo `parseNotification()` existente |

## Resumo de Arquivos

| Arquivo | Ação |
|---------|------|
| `supabase/functions/extract-text/index.ts` | Criar — edge function para extração com IA |
| `src/components/PasteNotificationDialog.tsx` | Editar — adicionar upload de arquivo + loading state |

