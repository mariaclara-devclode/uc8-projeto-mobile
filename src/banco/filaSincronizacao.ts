import { abrirBancoLocal } from "./bancoLocal";

export interface OperacaoPendente {
  id: number;
  operacao: string;
  entidade: string;
  registro_local_id: number | null;
  dados: string;
  criado_em: string;
  tentativas: number;
}

export async function adicionarNaFila(
  operacao: string,
  entidade: string,
  registroLocalId: number | null,
  dados: object,
): Promise<void> {
  const banco = await abrirBancoLocal();

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
}

export async function listarPendencias(): Promise<OperacaoPendente[]> {
  const banco = await abrirBancoLocal();

  return banco.getAllAsync<OperacaoPendente>(`
    SELECT *
    FROM fila_sincronizacao
    ORDER BY id ASC
  `);
}

export async function removerDaFila(id: number): Promise<void> {
  const banco = await abrirBancoLocal();

  await banco.runAsync(
    "DELETE FROM fila_sincronizacao WHERE id = ?",
    id,
  );
}

export async function registrarFalha(id: number): Promise<void> {
  const banco = await abrirBancoLocal();

  await banco.runAsync(
    `UPDATE fila_sincronizacao
     SET tentativas = tentativas + 1
     WHERE id = ?`,
    id,
  );
}
