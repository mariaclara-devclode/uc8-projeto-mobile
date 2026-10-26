import { noBanco } from "./bancoLocal";
import type { Movimentacao } from "../types/movimentacao";

interface MovimentacaoLocal {
  id: number;
  id_produto: number;
  quantidade: number;
  tipo: "entrada" | "saida";
  data: string;
}

export function listarMovimentacoesLocais(): Promise<Movimentacao[]> {
  return noBanco(async (banco) => {
    const registros = await banco.getAllAsync<MovimentacaoLocal>(
      `SELECT id, id_produto, quantidade, tipo, data
       FROM movimentacoes_cache
       ORDER BY data DESC`,
    );

    return registros.map((registro) => ({
      ...registro,
      data: new Date(registro.data),
    }));
  });
}

export function salvarMovimentacoesLocais(
  movimentacoes: Movimentacao[],
): Promise<void> {
  return noBanco((banco) =>
    banco.withTransactionAsync(async () => {
      for (const movimentacao of movimentacoes) {
        await banco.runAsync(
          `INSERT INTO movimentacoes_cache (
            id,
            id_produto,
            quantidade,
            tipo,
            data
          )
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            id_produto = excluded.id_produto,
            quantidade = excluded.quantidade,
            tipo = excluded.tipo,
            data = excluded.data`,
          movimentacao.id,
          movimentacao.id_produto,
          movimentacao.quantidade,
          movimentacao.tipo,
          movimentacao.data.toISOString(),
        );
      }
    }),
  );
}

export function salvarMovimentacaoLocal(
  movimentacao: Movimentacao,
): Promise<void> {
  return salvarMovimentacoesLocais([movimentacao]);
}

// Movimentação criada sem rede recebe um id local negativo, para nunca
// colidir com os ids positivos que vêm do Supabase.
export function gerarIdLocalNegativoMovimentacao(): Promise<number> {
  return noBanco(async (banco) => {
    const resultado = await banco.getFirstAsync<{ proximo_id: number }>(`
      SELECT COALESCE(MIN(id), 0) - 1 AS proximo_id
      FROM movimentacoes_cache
      WHERE id < 0
    `);

    return resultado?.proximo_id ?? -1;
  });
}

export function removerMovimentacaoLocal(id: number): Promise<void> {
  return noBanco(async (banco) => {
    await banco.runAsync("DELETE FROM movimentacoes_cache WHERE id = ?", id);
  });
}