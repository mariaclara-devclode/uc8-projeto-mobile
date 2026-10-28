# uc8-projeto-mobile

Aplicativo mobile da UC8, por Maria Clara. Recorte do sistema Estok, da UC5.

## ESTOK — Gerenciador de Estoque Comercial

### Sistema de origem

O aplicativo mobile é um recorte do sistema **ESTOK — Gerenciador de Estoque Comercial**, desenvolvido na UC5. O sistema de origem permite o gerenciamento de produtos, categorias e movimentações de estoque.

### Recorte do aplicativo

O aplicativo tem como entidade central **Produto**, que é a principal informação consultada e cadastrada pelo usuário. As entidades do recorte são:

#### Produto

- `id`: identificador do produto.
- `nome`: nome do produto.
- `codigo_barras`: código de barras do produto.
- `preco_venda`: preço de venda do produto.
- `id_categoria`: identificador da categoria do produto.
- `ativo`: indica se o produto está ativo.

#### Categoria

- `id`: identificador da categoria.
- `nome`: nome da categoria.
- `descricao`: descrição da categoria.

#### Movimentacao

- `id`: identificador da movimentação.
- `id_produto`: identificador do produto movimentado.
- `quantidade`: quantidade movimentada.
- `tipo`: tipo da movimentação, `entrada` ou `saida`.
- `data`: data e hora da movimentação.

### Telas

O aplicativo tem cinco telas do recorte, mais uma tela de apoio:

1. **Início** — acesso às principais funções e resumo do estoque (total de produtos, ativos e aguardando sincronização).
2. **Produtos** — lista de produtos disponíveis para consulta.
3. **Detalhes do Produto** — dados de um produto selecionado e o estoque atual (entradas menos saídas).
4. **Cadastro de Produto** — cadastro de um novo produto.
5. **Movimentações** — registro de novas entradas e saídas e histórico do estoque.
6. **Sobre** — tela de apoio com informações do aplicativo, do que está guardado no aparelho (com a opção de apagar a cópia local) e da tela do aparelho.

### Regras do aplicativo

- **Cadastro de produto:** nome, código de barras, preço e categoria são obrigatórios. O código de barras aceita só números, de 8 a 14 dígitos. O preço deve ser maior que zero e a categoria, um número inteiro maior que zero.
- **Movimentações:** a quantidade é um número inteiro maior que zero. Uma saída não pode passar do estoque atual (entradas menos saídas, incluindo o que ainda espera sincronização).
- **Sem internet:** produtos e movimentações são guardados no aparelho e enviados ao Supabase quando a conexão volta.

### O que fica de fora

Ficam de fora do aplicativo mobile o gerenciamento completo de categorias, a alteração e a exclusão de produtos e de movimentações e as demais funcionalidades administrativas do sistema da UC5.

### Tecnologias

- Expo
- React Native
- TypeScript
- React Navigation (pilha e abas)
- `expo-sqlite` (banco local)
- Supabase (banco na nuvem, acessado pela API de dados com `fetch`)
- `expo-network` — biblioteca fora da lista do enunciado. Justificativa: detecta quando o aparelho fica sem internet e quando a conexão volta, para exibir o aviso offline e disparar a sincronização da fila. Funciona no Expo Go.

## Configuração

Para executar o aplicativo é necessário ter o Node.js instalado, o aplicativo **Expo Go** no celular e um projeto no Supabase.

### Instalação

Na pasta raiz do projeto:

```bash
npm install
```

### Dados de acesso do projeto Supabase

Para quem for executar este aplicativo, os dados do projeto são:

- URL do projeto: `https://SEU-PROJETO.supabase.co`
- Chave publicável: `sb_publishable_SUA-CHAVE-PUBLICAVEL`

A chave publicável é pública por desenho: o que ela pode fazer é limitado pelas políticas de RLS. A chave secreta e a senha do banco nunca saem do painel do Supabase.

### Variáveis de ambiente

1. Copie o arquivo `.env.example` para `.env.local` na raiz do projeto.
2. Preencha os valores, com os nomes exatos abaixo:

```
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA-CHAVE-PUBLICAVEL
```

O arquivo `.env.example` traz os nomes das variáveis, sem valores. O `.env.local` não vai para o repositório. Depois de alterar o `.env.local`, reinicie o Expo com `npx expo start -c`.

### Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com/dashboard).
2. No SQL Editor, cole e execute o arquivo `supabase/esquema.sql`. Ele cria a tabela `produtos` (colunas `id`, `nome`, `codigo_barras`, `preco_venda`, `id_categoria` e `ativo`) e a tabela `movimentacoes` (colunas `id`, `id_produto`, `quantidade`, `tipo` e `data`), liga o RLS nas duas e cria as políticas de leitura e de inclusão para o papel `anon`.
3. O mesmo script tira do papel `anon` a permissão de alterar e de apagar: a chave publicável só lê e inclui. Para conferir: `select has_table_privilege('anon', 'public.produtos', 'DELETE');` deve retornar `false`.
4. Copie a URL do projeto e a chave publicável para o `.env.local`.

O aplicativo fala com o banco pela API de dados do Supabase, por HTTPS, usando `fetch`. Não há conexão direta ao banco. Toda resposta é tratada como `unknown` e validada antes do uso.

### Executar o aplicativo

```bash
npx expo start
```

Abra o Expo Go no celular, com o aparelho na mesma rede Wi-Fi do computador, e escaneie o QR code exibido no terminal. O aplicativo é para celular: o banco local (`expo-sqlite`) não funciona na versão web.

Se o celular não conseguir conectar pelo Wi-Fi, há duas alternativas:

- Túnel: `npx expo start -c --tunnel`.
- Cabo USB (Android, com a Depuração USB ligada): `adb reverse tcp:8081 tcp:8081`, depois `export REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1` e `npx expo start -c`; no Expo Go, use "Enter URL" com `exp://127.0.0.1:8081`.

### Verificação do TypeScript

```bash
npx tsc --noEmit
```

## Navegação

O aplicativo usa **abas** para as seções principais e **pilha** para o que se abre a partir de outra tela e volta.

- **Início** — aba `AbaInicio`, a aba inicial. É aberta pela navegação inferior. Não recebe parâmetros; lê o resumo do estoque do contexto do aplicativo. Tem atalhos para Produtos, Cadastro e Movimentações.
- **Produtos** — aba `AbaProdutos`, que contém a pilha `Produtos` → `DetalheProduto`. É aberta pela aba inferior ou pelo atalho da tela Início. Não recebe parâmetros; lê a lista do contexto.
- **Detalhes do Produto** — rota `DetalheProduto`, na pilha da aba Produtos. É aberta pelo botão "Ver detalhes" de um produto da lista e volta para a lista. Recebe o parâmetro tipado `{ id: number }`, o identificador do produto, e não o objeto inteiro.
- **Cadastro de Produto** — aba `AbaCadastro`. É aberta pela aba inferior, pelo atalho da tela Início ou pelo botão "Cadastrar produto" da lista. Não recebe parâmetros.
- **Movimentações** — aba `AbaMovimentacoes`. É aberta pela aba inferior ou pelo atalho da tela Início. Não recebe parâmetros.
- **Sobre** — aba `AbaSobre`. É aberta pela aba inferior. Não recebe parâmetros.

Os tipos das rotas ficam em `src/navegacao/tipos.ts`.

## Estado compartilhado

O contexto `EstadoAppContext` guarda o estado da conexão, a lista de produtos e a lista de movimentações (cada uma com os estados `carregando`, `erro` e `pronto`). As telas Início, Produtos, Cadastro, Movimentações e Detalhes leem e atualizam essas mesmas listas. O contexto também acompanha a rede e dispara a sincronização da fila quando a conexão volta: primeiro os produtos, depois as movimentações.

## Banco local e funcionamento offline

O aplicativo usa SQLite, por meio do pacote `expo-sqlite`, com acesso tipado. O banco local guarda:

- **Cache de produtos e de movimentações**: o que veio do Supabase fica no aparelho e continua visível sem internet.
- **Fila de sincronização**: um produto ou uma movimentação registrados sem conexão são salvos no aparelho, com identificador local negativo, e entram na fila.

Quando a conexão volta, ou quando o aplicativo abre com internet, a fila é enviada ao Supabase, com os produtos antes das movimentações. O registro local é trocado pelo registro da nuvem, e a operação sai da fila. As operações no banco local acontecem uma de cada vez, para as gravações não se atropelarem. Se o envio falha por falta de rede, a operação continua na fila sem perder dados. Uma operação que recusa o envio várias vezes deixa de ser reenviada, sem apagar o registro pendente.

## Tratamento de erros e dados no aparelho

Todo erro passa por `src/erros/erros.ts`, que o classifica em rede, servidor (`ErroDaApi`, com o status), banco local (`ErroDoBanco`), validação (`ErroDeValidacao`) ou desconhecido. Cada tipo tem uma mensagem para quem usa o aplicativo; o detalhe técnico vai só para o console, com a origem, e o que a pessoa digitou não entra no registro. Se o banco local falhar, a lista que veio da nuvem continua aparecendo.

O que o aplicativo guarda no aparelho são os produtos e as movimentações do estoque e a fila de envio. Nenhum dado pessoal de terceiros é guardado ou enviado: os dados são fictícios. O banco local fica no armazenamento interno do aplicativo. Na aba Sobre é possível ver quanto está guardado e apagar a cópia local; o que ainda não foi enviado ao Supabase é mantido, para não perder cadastros feitos sem conexão.

A chave publicável só lê e inclui: o papel `anon` não tem permissão de alterar nem de apagar (`supabase/esquema.sql`).

## Geração do APK

O projeto usa o EAS Build para gerar um APK para Android, com o perfil `preview` do arquivo `eas.json`:

```bash
npx eas-cli build -p android --profile preview
```

Link do build: SERÁ PREENCHIDO NO MARCO 4.

## Testes

O roteiro de teste, com os casos, os resultados observados no aparelho e o registro das correções, está em [`docs/roteiro_de_teste.md`](docs/roteiro_de_teste.md).