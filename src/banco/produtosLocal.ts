import { abrirBancoLocal } from "./bancoLocal";
import type { Produto } from "../types/produto";

interface ProdutoArmazenado {
  id: number;
  nome: string;
  codigo_barras: string;
  preco_venda: number;
  id_categoria: number;
  ativo: number;
}

export async function listarProdutosLocais(): Promise<Produto[]> {
  const banco = await abrirBancoLocal();

  const registros = await banco.getAllAsync<ProdutoArmazenado>(`
    SELECT
      id,
      nome,
      codigo_barras,
      preco_venda,
      id_categoria,
      ativo
    FROM produtos_cache
    ORDER BY nome COLLATE NOCASE
  `);

  return registros.map((registro) => ({
    id: registro.id,
    nome: registro.nome,
    codigo_barras: registro.codigo_barras,
    preco_venda: registro.preco_venda,
    id_categoria: registro.id_categoria,
    ativo: registro.ativo === 1,
  }));
}

export async function salvarProdutosLocais(
  produtos: Produto[],
): Promise<void> {
  const banco = await abrirBancoLocal();

  await banco.withTransactionAsync(async () => {
    for (const produto of produtos) {
      await banco.runAsync(
        `INSERT INTO produtos_cache (
          id,
          nome,
          codigo_barras,
          preco_venda,
          id_categoria,
          ativo,
          atualizado_em
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          nome = excluded.nome,
          codigo_barras = excluded.codigo_barras,
          preco_venda = excluded.preco_venda,
          id_categoria = excluded.id_categoria,
          ativo = excluded.ativo,
          atualizado_em = excluded.atualizado_em`,
        produto.id,
        produto.nome,
        produto.codigo_barras,
        produto.preco_venda,
        produto.id_categoria,
        produto.ativo ? 1 : 0,
        new Date().toISOString(),
      );
    }
  });
}

export async function salvarProdutoLocal(
  produto: Produto,
): Promise<void> {
  await salvarProdutosLocais([produto]);
}

export async function gerarIdLocalNegativo(): Promise<number> {
  const banco = await abrirBancoLocal();

  const resultado = await banco.getFirstAsync<{ proximo_id: number }>(`
    SELECT COALESCE(MIN(id), 0) - 1 AS proximo_id
    FROM produtos_cache
    WHERE id < 0
  `);

  return resultado?.proximo_id ?? -1;
}

export async function removerProdutoLocal(id: number): Promise<void> {
  const banco = await abrirBancoLocal();

  await banco.runAsync(
    "DELETE FROM produtos_cache WHERE id = ?",
    id,
  );
}
