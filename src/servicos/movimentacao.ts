
import type { Movimentacao } from "../types/movimentacao";

const URL_SUPABASE = process.env.EXPO_PUBLIC_SUPABASE_URL;
const CHAVE_SUPABASE =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const COLUNAS_MOVIMENTACAO =
  "id,id_produto,quantidade,tipo,data";

function obterConfiguracao(): {
  url: string;
  chave: string;
} {
  if (!URL_SUPABASE || !CHAVE_SUPABASE) {
    throw new Error(
      "Configure a URL e a chave publicável do Supabase no .env.local."
    );
  }

  return {
    url: URL_SUPABASE.replace(/\/$/, ""),
    chave: CHAVE_SUPABASE,
  };
}

function validarMovimentacao(
  dado: unknown
): Movimentacao {
  if (
    typeof dado !== "object" ||
    dado === null
  ) {
    throw new Error(
      "A API retornou uma movimentação inválida."
    );
  }

  const registro = dado as Record<string, unknown>;

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
      "A API retornou dados de movimentação inválidos."
    );
  }

  return {
    id,
    id_produto: idProduto,
    quantidade,
    tipo,
    data: new Date(data),
  };
}

export async function carregarMovimentacoes():
Promise<Movimentacao[]> {
  const { url, chave } = obterConfiguracao();

  const resposta = await fetch(
    `${url}/rest/v1/movimentacoes?select=${COLUNAS_MOVIMENTACAO}&order=data.desc`,
    {
      method: "GET",
      headers: {
        apikey: chave,
        Authorization: `Bearer ${chave}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!resposta.ok) {
    const mensagem = await resposta.text();

    throw new Error(
      mensagem ||
        "Não foi possível carregar o histórico de movimentações."
    );
  }

  const dados: unknown = await resposta.json();

  if (!Array.isArray(dados)) {
    throw new Error(
      "A API retornou um histórico inválido."
    );
  }

  return dados.map((dado: unknown) =>
    validarMovimentacao(dado)
  );
}
