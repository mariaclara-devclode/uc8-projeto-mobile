import * as SQLite from "expo-sqlite";

let bancoCompartilhado: Promise<SQLite.SQLiteDatabase> | null = null;

export function abrirBancoLocal(): Promise<SQLite.SQLiteDatabase> {
  if (bancoCompartilhado === null) {
    bancoCompartilhado = inicializarBanco();
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
