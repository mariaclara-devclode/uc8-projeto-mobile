import { noBanco } from "./bancoLocal";

export interface OperacaoPendente {
  id: number;
  operacao: string;
  entidade: string;
  registro_local_id: number | null;
  dados: string;
  criado_em: string;
  tentativas: number;
}

export function adicionarNaFila(
  operacao: string,
  entidade: string,
  registroLocalId: number | null,
  dados: object,
): Promise<void> {
  return noBanco(async (banco) => {
    await banco.runAsync(
      `INSERT INTO fila_sincronizacao (
        operacao,
        entidade,
        registro_local_id,
        dados,
        criado_em
      )
      VALUES (?, ?, ?, ?, ?)`,
      operacao,
      entidade,
      registroLocalId,
      JSON.stringify(dados),
      new Date().toISOString(),
    );
  });
}

export function listarPendencias(): Promise<OperacaoPendente[]> {
  return noBanco((banco) =>
    banco.getAllAsync<OperacaoPendente>(`
      SELECT *
      FROM fila_sincronizacao
      ORDER BY id ASC
    `),
  );
}

export function removerDaFila(id: number): Promise<void> {
  return noBanco(async (banco) => {
    await banco.runAsync("DELETE FROM fila_sincronizacao WHERE id = ?", id);
  });
}

export function registrarFalha(id: number): Promise<void> {
  return noBanco(async (banco) => {
    await banco.runAsync(
      `UPDATE fila_sincronizacao
       SET tentativas = tentativas + 1
       WHERE id = ?`,
      id,
    );
  });
}