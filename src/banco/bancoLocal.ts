import * as SQLite from "expo-sqlite";

import { ErroDoBanco } from "../erros/erros";

let bancoCompartilhado: Promise<SQLite.SQLiteDatabase> | null = null;

export function abrirBancoLocal(): Promise<SQLite.SQLiteDatabase> {
  if (bancoCompartilhado === null) {
    bancoCompartilhado = inicializarBanco().catch((erro: unknown) => {
      // Se a abertura falhar, a próxima chamada tenta de novo.
      bancoCompartilhado = null;
      throw erro;
    });
  }

  return bancoCompartilhado;
}

async function inicializarBanco(): Promise<SQLite.SQLiteDatabase> {
  const banco = await SQLite.openDatabaseAsync("estok.db");

  await banco.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS produtos_cache (
      id INTEGER PRIMARY KEY,
      nome TEXT NOT NULL,
      codigo_barras TEXT NOT NULL,
      preco_venda REAL NOT NULL,
      id_categoria INTEGER NOT NULL,
      ativo INTEGER NOT NULL,
      atualizado_em TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fila_sincronizacao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operacao TEXT NOT NULL,
      entidade TEXT NOT NULL,
      registro_local_id INTEGER,
      dados TEXT NOT NULL,
      criado_em TEXT NOT NULL,
      tentativas INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS movimentacoes_cache (
      id INTEGER PRIMARY KEY,
      id_produto INTEGER NOT NULL,
      quantidade INTEGER NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
      data TEXT NOT NULL
    );
  `);

  return banco;
}

// Toda operação no SQLite passa por aqui: qualquer falha vira ErroDoBanco,
// com a mensagem original no detalhe.
export async function noBanco<T>(
  operacao: (banco: SQLite.SQLiteDatabase) => Promise<T>,
): Promise<T> {
  try {
    const banco = await abrirBancoLocal();

    return await operacao(banco);
  } catch (erro: unknown) {
    throw new ErroDoBanco(erro instanceof Error ? erro.message : String(erro));
  }
}

export interface ResumoLocal {
  produtos: number;
  movimentacoes: number;
  pendentes: number;
}

// Quanto o aparelho guarda: cache de produtos, de movimentações e fila de envio.
export function contarDadosLocais(): Promise<ResumoLocal> {
  return noBanco(async (banco) => {
    const produtos = await banco.getFirstAsync<{ total: number }>(
      "SELECT COUNT(*) AS total FROM produtos_cache",
    );

    const movimentacoes = await banco.getFirstAsync<{ total: number }>(
      "SELECT COUNT(*) AS total FROM movimentacoes_cache",
    );

    const pendentes = await banco.getFirstAsync<{ total: number }>(
      "SELECT COUNT(*) AS total FROM fila_sincronizacao",
    );

    return {
      produtos: produtos?.total ?? 0,
      movimentacoes: movimentacoes?.total ?? 0,
      pendentes: pendentes?.total ?? 0,
    };
  });
}

// Apaga a cópia do que veio da nuvem (ids positivos). Os registros criados sem
// rede (ids negativos) e a fila de envio ficam: apagá-los perderia dados que
// ainda não chegaram ao Supabase.
export function limparCacheLocal(): Promise<void> {
  return noBanco((banco) =>
    banco.withTransactionAsync(async () => {
      await banco.runAsync("DELETE FROM produtos_cache WHERE id > 0");
      await banco.runAsync("DELETE FROM movimentacoes_cache WHERE id > 0");
    }),
  );
}