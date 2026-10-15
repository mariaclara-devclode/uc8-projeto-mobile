import { abrirBancoLocal } from "./bancoLocal";
import type { Movimentacao } from "../types/movimentacao";

interface MovimentacaoLocal {
  id: number;
  id_produto: number;
  quantidade: number;
  tipo: "entrada" | "saida";
  data: string;
}

export async function listarMovimentacoesLocais(): Promise<Movimentacao[]> {
  const banco = await abrirBancoLocal();

  const registros = await banco.getAllAsync<MovimentacaoLocal>(
    `SELECT id, id_produto, quantidade, tipo, data
     FROM movimentacoes_cache
     ORDER BY data DESC`,
  );

  return registros.map((registro) => ({
    ...registro,
    data: new Date(registro.data),
  }));
}

export async function salvarMovimentacoesLocais(
  movimentacoes: Movimentacao[],
): Promise<void> {
  const banco = await abrirBancoLocal();

  await banco.withTransactionAsync(async () => {
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
  });
}
