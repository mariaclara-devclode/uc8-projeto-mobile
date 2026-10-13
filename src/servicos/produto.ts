import type { Produto } from "../types/produto";

const URL_SUPABASE = process.env.EXPO_PUBLIC_SUPABASE_URL;
const CHAVE_SUPABASE =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const COLUNAS_PRODUTO =
  "id,nome,codigo_barras,preco_venda,id_categoria,ativo";

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

function validarProduto(dado: unknown): Produto {
  if (
    typeof dado !== "object" ||
    dado === null
  ) {
    throw new Error("A API retornou um produto inválido.");
  }

  const registro = dado as Record<string, unknown>;

  const id = registro.id;
  const nome = registro.nome;
  const codigoBarras = registro.codigo_barras;
  const precoVenda = registro.preco_venda;
  const idCategoria = registro.id_categoria;
  const ativo = registro.ativo;

  const preco =
    typeof precoVenda === "number"
      ? precoVenda
      : typeof precoVenda === "string" &&
          precoVenda.trim() !== ""
        ? Number(precoVenda)
        : NaN;

  if (
    typeof id !== "number" ||
    !Number.isInteger(id) ||
    typeof nome !== "string" ||
    typeof codigoBarras !== "string" ||
    !Number.isFinite(preco) ||
    typeof idCategoria !== "number" ||
    !Number.isInteger(idCategoria) ||
    typeof ativo !== "boolean"
  ) {
    throw new Error(
      "A API retornou dados de produto em formato inválido."
    );
  }

  return {
    id,
    nome,
    codigo_barras: codigoBarras,
    preco_venda: preco,
    id_categoria: idCategoria,
    ativo,
  };
}

async function verificarResposta(
  resposta: Response,
  mensagemPadrao: string
): Promise<void> {
  if (!resposta.ok) {
    const mensagem = await resposta.text();

    throw new Error(mensagem || mensagemPadrao);
  }
}

function obterCabecalhos(): HeadersInit {
  const { chave } = obterConfiguracao();

  return {
    apikey: chave,
    Authorization: `Bearer ${chave}`,
    "Content-Type": "application/json",
  };
}

export async function carregarProdutos(): Promise<Produto[]> {
  const { url } = obterConfiguracao();

  const resposta = await fetch(
    `${url}/rest/v1/produtos?select=${COLUNAS_PRODUTO}&order=id.asc`,
    {
      method: "GET",
      headers: obterCabecalhos(),
    }
  );

  await verificarResposta(
    resposta,
    "Não foi possível carregar os produtos."
  );

  const dados: unknown = await resposta.json();

  if (!Array.isArray(dados)) {
    throw new Error(
      "A API retornou uma lista de produtos inválida."
    );
  }

  return dados.map((dado: unknown) =>
    validarProduto(dado)
  );
}

export async function carregarProdutoPorId(
  id: number
): Promise<Produto> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("O ID do produto é inválido.");
  }

  const { url } = obterConfiguracao();

  const resposta = await fetch(
    `${url}/rest/v1/produtos?select=${COLUNAS_PRODUTO}&id=eq.${id}&limit=1`,
    {
      method: "GET",
      headers: obterCabecalhos(),
    }
  );

  await verificarResposta(
    resposta,
    "Não foi possível carregar o produto."
  );

  const dados: unknown = await resposta.json();

  if (!Array.isArray(dados) || dados.length === 0) {
    throw new Error("Produto não encontrado.");
  }

  return validarProduto(dados[0]);
}

export async function cadastrarProduto(
  produto: Produto
): Promise<Produto> {
  const { url } = obterConfiguracao();

  const resposta = await fetch(
    `${url}/rest/v1/produtos?select=${COLUNAS_PRODUTO}`,
    {
      method: "POST",
      headers: {
        ...obterCabecalhos(),
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        nome: produto.nome.trim(),
        codigo_barras: produto.codigo_barras.trim(),
        preco_venda: produto.preco_venda,
        id_categoria: produto.id_categoria,
        ativo: produto.ativo,
      }),
    }
  );

  await verificarResposta(
    resposta,
    "Não foi possível cadastrar o produto."
  );

  const dados: unknown = await resposta.json();

  if (!Array.isArray(dados) || dados.length === 0) {
    throw new Error(
      "O Supabase não retornou o produto cadastrado."
    );
  }

  return validarProduto(dados[0]);
}