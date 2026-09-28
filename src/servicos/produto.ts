import type { Produto } from "../types/produto";

const produtos: Produto[] = [
  {
    id: 1,
    nome: "Semente de milho",
    codigo_barras: "7891234567890",
    preco_venda: 25.9,
    id_categoria: 1,
    ativo: true,
  },
  {
    id: 2,
    nome: "Semente de feijão",
    codigo_barras: "7891234567891",
    preco_venda: 18.5,
    id_categoria: 1,
    ativo: true,
  },
  {
    id: 3,
    nome: "Adubo NPK",
    codigo_barras: "7899876543210",
    preco_venda: 89.9,
    id_categoria: 2,
    ativo: true,
  },
];

export function carregarProdutos(): Promise<Produto[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(produtos);
    }, 1000);
  });
}
