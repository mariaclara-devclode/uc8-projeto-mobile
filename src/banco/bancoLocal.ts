import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

import { ErroDoBanco } from "../erros/erros";

// Tempo máximo para abrir e preparar o banco. Sem limite, uma abertura que
// nunca termina deixaria a tela esperando para sempre.
const LIMITE_ABERTURA_MS = 10000;

let bancoCompartilhado: Promise<SQLite.SQLiteDatabase> | null = null;

function comLimiteDeTempo<T>(
  promessa: Promise<T>,
  limiteMs: number,
  mensagem: string,
): Promise<T> {
  return new Promise<T>((resolver, rejeitar) => {
    const relogio = setTimeout(() => rejeitar(new Error(mensagem)), limiteMs);

    promessa.then(
      (valor) => {
        clearTimeout(relogio);
        resolver(valor);
      },
      (erro: unknown) => {
        clearTimeout(relogio);
        rejeitar(erro);
      },
    );
  });
}

export function abrirBancoLocal(): Promise<SQLite.SQLiteDatabase> {
  if (bancoCompartilhado === null) {
    bancoCompartilhado = comLimiteDeTempo(
      inicializarBanco(),
      LIMITE_ABERTURA_MS,
      "O banco local demorou demais para abrir.",
    ).catch((erro: unknown) => {
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

// Fila das operações no banco. O SQLite do aparelho tem uma única conexão, e
// duas transações ao mesmo tempo nela se atropelam ("cannot start a transaction
// within a transaction"). As listas de produtos e de movimentações carregam
// juntas na abertura do app, então cada operação espera a anterior terminar.
let filaDeOperacoes: Promise<void> = Promise.resolve();

function emSerie<T>(operacao: () => Promise<T>): Promise<T> {
  const execucao = filaDeOperacoes.then(operacao);

  // A fila segue mesmo que esta operação falhe; o erro volta só para quem pediu.
  filaDeOperacoes = execucao.then(
    () => undefined,
    () => undefined,
  );

  return execucao;
}

// Toda operação no SQLite passa por aqui: uma de cada vez, e qualquer falha
// vira ErroDoBanco, com a mensagem original no detalhe.
// Não chame noBanco de dentro de uma operação: ela esperaria a si mesma.
export async function noBanco<T>(
  operacao: (banco: SQLite.SQLiteDatabase) => Promise<T>,
): Promise<T> {
  // O SQLite do aparelho não existe na Web: falha na hora, em vez de tentar
  // abrir o banco e ficar esperando. Quem chama já trata ErroDoBanco.
  if (Platform.OS === "web") {
    throw new ErroDoBanco(
      "O armazenamento local só existe no aplicativo para celular.",
    );
  }

  try {
    return await emSerie(async () => {
      const banco = await abrirBancoLocal();

      return operacao(banco);
    });
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