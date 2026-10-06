import type { Produto } from "../types/produto";

const URL_API = "http://10.130.7.54:3000";

export async function carregarProdutos(): Promise<Produto[]> {
  const resposta = await fetch(
    `${URL_API}/produtos`
  );

  if (!resposta.ok) {
    const mensagem = await resposta.text();

    throw new Error(
      mensagem ||
        "Não foi possível carregar os produtos."
    );
  }

  const produtos: Produto[] =
    await resposta.json();

  return produtos;
}

export async function carregarProdutoPorId(
  id: number
): Promise<Produto> {
  const resposta = await fetch(
    `${URL_API}/produtos/${id}`
  );

  if (!resposta.ok) {
    const mensagem = await resposta.text();

    throw new Error(
      mensagem ||
        "Não foi possível carregar o produto."
    );
  }

  const produto: Produto =
    await resposta.json();

  return produto;
}

export async function cadastrarProduto(
  produto: Produto
): Promise<Produto> {
  const resposta = await fetch(
    `${URL_API}/produtos`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        nome: produto.nome,
        codigo_barras:
          produto.codigo_barras,
        preco_venda:
          produto.preco_venda,
        id_categoria:
          produto.id_categoria,
        ativo: produto.ativo,
      }),
    }
  );

  if (!resposta.ok) {
    const mensagem = await resposta.text();

    throw new Error(
      mensagem ||
        "Não foi possível cadastrar o produto."
    );
  }

  const novoProduto: Produto =
    await resposta.json();

  return novoProduto;
}