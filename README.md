# uc8-projeto-mobile

Aplicativo mobile da UC8, por Maria Clara. Recorte do sistema Estok, da UC5.
O recorte (entidades e telas) entra aqui no encontro 3.

## ESTOK — Gerenciador de Estoque Comercial

### Sistema de origem

O aplicativo mobile será um recorte do sistema **ESTOK — Gerenciador de Estoque Comercial**, desenvolvido na UC5. O sistema de origem permite o gerenciamento de produtos, categorias e movimentações de estoque.

### Recorte do aplicativo

O aplicativo terá como entidade central **Produto**, que será a principal informação consultada e utilizada pelo usuário.

As entidades utilizadas no recorte serão:

#### Produto

Campos utilizados pelo aplicativo:

- `id`: identificador do produto.
- `nome`: nome do produto.
- `codigo_barras`: código de barras do produto.
- `preco_venda`: preço de venda do produto.
- `id_categoria`: identificador da categoria do produto.
- `ativo`: indica se o produto está ativo.

#### Categoria

Campos utilizados pelo aplicativo:

- `id`: identificador da categoria.
- `nome`: nome da categoria.
- `descricao`: descrição da categoria.

#### Movimentacao

Campos utilizados pelo aplicativo:

- `id`: identificador da movimentação.
- `id_produto`: identificador do produto movimentado.
- `quantidade`: quantidade movimentada.
- `tipo`: tipo da movimentação, podendo ser `entrada` ou `saida`.
- `data`: data e hora da movimentação.

### Telas previstas

O aplicativo terá cinco telas:

1. **Início** — apresenta o acesso às principais funções do aplicativo e um resumo do estoque.

2. **Produtos** — apresenta a lista de produtos disponíveis para consulta.

3. **Detalhes do Produto** — apresenta os dados de um produto selecionado e suas informações de estoque.

4. **Cadastro de Produto** — permite cadastrar um novo produto e informar seus principais dados.

5. **Movimentações** — permite registrar entradas e saídas de produtos no estoque.

### O que fica de fora

Ficam de fora do aplicativo mobile o gerenciamento completo de categorias e as demais funcionalidades administrativas do sistema desenvolvido na UC5.

### Tecnologias

- Expo
- React Native
- TypeScript

### Objetivo do módulo

Este projeto corresponde ao recorte do sistema da UC5 para o desenvolvimento do aplicativo mobile na UC8.

### Configuração

Para executar o aplicativo, é necessário ter o Node.js instalado, configurar as dependências do projeto e criar um projeto no Supabase.

#### Instalação

Execute o comando abaixo na pasta raiz do projeto:

```bash
npm install
```

#### Configuração do Supabase

1. Crie ou acesse o projeto no [Supabase](https://supabase.com/dashboard).
2. Configure a tabela `produtos` no banco de dados.
3. Habilite a segurança em nível de linha (RLS) e configure as políticas de acesso necessárias para leitura e inclusão de produtos.
4. Copie a URL do projeto e a chave pública apropriada para uso no aplicativo.
5. Crie o arquivo `.env.local` na raiz do projeto e configure as variáveis de ambiente necessárias.

O arquivo `.env.example` contém um modelo das variáveis exigidas, sem valores reais de acesso.

**Importante:** não compartilhe nem envie o arquivo `.env.local` ao GitHub. Ele contém informações de configuração que devem permanecer fora do repositório.

#### Executar o aplicativo

Após configurar as variáveis de ambiente, execute:

```bash
npx expo start
```

Siga as instruções exibidas no terminal para abrir o aplicativo no Expo Go ou em um emulador compatível.

### Navegação

O aplicativo utiliza navegação por abas para acessar as principais áreas e navegação em pilha para abrir os detalhes de um produto selecionado.

- **Início:** aba inicial, aberta pela navegação inferior. Apresenta o acesso às principais funções do ESTOK.
- **Produtos:** acessada pela aba Produtos. Apresenta a lista de produtos cadastrados.
- **Detalhes do Produto:** aberta a partir da lista de produtos. Recebe o identificador numérico (`id`) do produto selecionado por meio de um parâmetro tipado da navegação.
- **Cadastro de Produto:** acessado pela aba de cadastro. Permite preencher os dados e cadastrar um novo produto.
- **Movimentações:** acessada pela aba Movimentações. Apresenta a área destinada às entradas e saídas do estoque.

A navegação em pilha permite abrir os detalhes de um produto e retornar à lista. As abas permitem alternar entre as áreas principais do aplicativo.

### Banco local e funcionamento offline

O aplicativo utiliza SQLite por meio do pacote `expo-sqlite` para armazenar localmente os dados necessários ao funcionamento offline.

O banco local é utilizado para:

- Manter um cache dos produtos carregados do Supabase.
- Permitir a consulta aos produtos já armazenados quando não houver conexão com a internet.
- Registrar operações pendentes de sincronização, conforme a implementação do aplicativo.

Quando a conexão estiver disponível, as operações pendentes deverão ser enviadas ao Supabase, com tratamento de falhas e confirmação da sincronização.

### Verificação do TypeScript

Para verificar os tipos do projeto, execute:

```bash
npx tsc --noEmit
```

### Geração do APK

O projeto utiliza o EAS Build para gerar um APK para Android. Com o perfil de compilação configurado no arquivo `eas.json`, execute:

```bash
npx eas-cli build -p android --profile preview
```

A geração do APK depende da configuração do aplicativo e da autenticação necessária no EAS.

### Testes

Os testes devem registrar os resultados reais de navegação, cadastro, consulta ao Supabase, funcionamento offline, sincronização e instalação do APK. Consulte `docs/roteiro_de_teste.md` para acompanhar os casos executados.
