

# Plano: Foto de Perfil Personalizada

## Objetivo
Permitir que o usuário adicione uma foto de perfil personalizada, tornando o app mais pessoal e engajador.

## Implementacao

### 1. Atualizar o Tipo UserProfile

Adicionar campo `avatarUrl` opcional ao tipo `UserProfile` em `src/types/index.ts`:

```text
UserProfile {
  name: string
  email?: string
  monthlyGoal: number
  createdAt: Date
  avatarUrl?: string  // NOVO - URL da imagem em base64
}
```

### 2. Atualizar o Store de Configuracoes

Atualizar `defaultProfile` em `src/stores/useSettingsStore.ts` para incluir o novo campo:

```text
defaultProfile = {
  ...
  avatarUrl: undefined
}
```

### 3. Modificar a Pagina de Perfil

Atualizar `src/pages/PerfilPage.tsx` para:

**UI do Avatar:**
- Substituir o icone estatico `<User>` por um componente clicavel
- Mostrar a imagem do usuario se existir, ou o icone padrao
- Adicionar um botao de camera/editar sobreposto ao avatar
- Animacao suave ao passar o mouse

**Funcionalidade:**
- Input hidden do tipo `file` para selecionar imagem
- Aceitar apenas imagens (jpg, png, webp)
- Converter a imagem para base64 para armazenar no localStorage
- Limitar tamanho da imagem (redimensionar se necessario)
- Opcao de remover a foto atual

**Layout proposto:**
```text
+------------------------------------------+
|  [========= GRADIENT HEADER =========]   |
|                                          |
|      +----------------+                  |
|      |                |                  |
|      |   [FOTO OU     |   <- Clicavel    |
|      |    ICONE]      |                  |
|      |      📷        |   <- Botao edit  |
|      +----------------+                  |
|                                          |
|  Nome: Joao Silva  [editar]              |
+------------------------------------------+
```

### 4. Funcao de Processamento de Imagem

Criar funcao utilitaria para:
- Ler arquivo de imagem
- Redimensionar para max 200x200px (economia de espaco no localStorage)
- Converter para base64
- Comprimir qualidade para ~80%

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/types/index.ts` | Adicionar campo `avatarUrl` ao `UserProfile` |
| `src/stores/useSettingsStore.ts` | Atualizar `defaultProfile` |
| `src/pages/PerfilPage.tsx` | Adicionar UI e logica do avatar |

## Detalhes Tecnicos

### Processamento da Imagem

```text
1. Usuario clica no avatar
2. Abre seletor de arquivos (accept="image/*")
3. Arquivo selecionado -> FileReader
4. Cria Canvas para redimensionar (max 200x200)
5. Exporta como base64 JPEG 80% qualidade
6. Salva no profile.avatarUrl via updateProfile()
7. Zustand persiste no localStorage
```

### Limite de Tamanho

- Max 200x200 pixels
- Qualidade JPEG: 80%
- Resultado: ~20-50KB por imagem (seguro para localStorage)

### UI Components Utilizados

- Avatar (Radix) para exibicao circular
- Input hidden para upload
- Button com icone Camera para overlay
- Toast para feedback

## Resultado Esperado

1. Usuario pode clicar no avatar e selecionar uma foto
2. Foto e automaticamente redimensionada e comprimida
3. Avatar mostra a foto do usuario ou icone padrao
4. Botao para remover a foto se desejar
5. Foto persiste entre sessoes via localStorage

