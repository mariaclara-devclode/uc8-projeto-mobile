import type { Movimentacao } from "../types/movimentacao";

import {
  listarMovimentacoesLocais,
  salvarMovimentacoesLocais,
} from "../banco/movimentacoesLocal";

const URL_SUPABASE = process.env.EXPO_PUBLIC_SUPABASE_URL;

const CHAVE_SUPABASE = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

interface MovimentacaoRecebida {
  id: number;
  id_produto: number;
  quantidade: number;
  tipo: "entrada" | "saida";
  data: string;
}

function obterConfiguracao(): {
  url: string;
  chave: string;
} {
  if (!URL_SUPABASE || !CHAVE_SUPABASE) {
    throw new Error(
      "Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY no .env.local.",
    );
  }

  return {
    url: URL_SUPABASE.replace(/\/+$/, ""),
    chave: CHAVE_SUPABASE,
  };
}

function validarMovimentacoes(dados: unknown): Movimentacao[] {
  if (!Array.isArray(dados)) {
    throw new Error(
      "A resposta do Supabase não contém uma lista de movimentações.",
    );
  }

  return dados.map((item: unknown) => {
    if (typeof item !== "object" || item === null) {
      throw new Error("Uma movimentação recebida é inválida.");
    }

    const registro = item as Record<string, unknown>;

    const id = registro.id;
    const idProduto = registro.id_produto;
    const quantidade = registro.quantidade;
    const tipo = registro.tipo;
    const data = registro.data;

    if (
      typeof id !== "number" ||
      !Number.isInteger(id) ||
      typeof idProduto !== "number" ||
      !Number.isInteger(idProduto) ||
      typeof quantidade !== "number" ||
      !Number.isInteger(quantidade) ||
      quantidade <= 0 ||
      (tipo !== "entrada" && tipo !== "saida") ||
      typeof data !== "string" ||
      Number.isNaN(Date.parse(data))
    ) {
      throw new Error(
        "Os dados de uma movimentação estão em formato inválido.",
      );
    }

    const recebida: MovimentacaoRecebida = {
      id,
      id_produto: idProduto,
      quantidade,
      tipo,
      data,
    };

    return {
      ...recebida,
      data: new Date(recebida.data),
    };
  });
}

async function carregarMovimentacoesLocaisOuFalhar(): Promise<Movimentacao[]> {
  try {
    return await listarMovimentacoesLocais();
  } catch {
    throw new Error(
      "Não foi possível acessar o Supabase nem recuperar as movimentações salvas no aparelho.",
    );
  }
}

export async function carregarMovimentacoes(): Promise<Movimentacao[]> {
  const { url, chave } = obterConfiguracao();

  let resposta: Response;

  try {
    resposta = await fetch(
      `${url}/rest/v1/movimentacoes?select=id,id_produto,quantidade,tipo,data&order=data.desc`,
      {
        method: "GET",
        headers: {
          apikey: chave,
          Authorization: `Bearer ${chave}`,
          Accept: "application/json",
        },
      },
    );
  } catch {
    return carregarMovimentacoesLocaisOuFalhar();
  }

  if (!resposta.ok) {
    if (resposta.status >= 500) {
      return carregarMovimentacoesLocaisOuFalhar();
    }

    const detalhe = await resposta.text();

    throw new Error(
      `Erro do Supabase (${resposta.status}): ${
        detalhe || resposta.statusText
      }`,
    );
  }

  let dados: unknown;

  try {
    dados = await resposta.json();
  } catch {
    throw new Error("O Supabase retornou uma resposta que não é JSON válido.");
  }

  const movimentacoes = validarMovimentacoes(dados);

  await salvarMovimentacoesLocais(movimentacoes);

  return movimentacoes;
}
