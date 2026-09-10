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
