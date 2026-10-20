import type { Produto } from "../types/produto";

import {
  gerarIdLocalNegativo,
  listarProdutosLocais,
  removerProdutoLocal,
  salvarProdutoLocal,
  salvarProdutosLocais,
} from "../banco/produtosLocal";

import {
  adicionarNaFila,
  listarPendencias,
  registrarFalha,
  removerDaFila,
} from "../banco/filaSincronizacao";

const URL_SUPABASE = process.env.EXPO_PUBLIC_SUPABASE_URL;
const CHAVE_SUPABASE = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const COLUNAS_PRODUTO = "id,nome,codigo_barras,preco_venda,id_categoria,ativo";

type DadosNovoProduto = Omit<Produto, "id">;

export type ResultadoCadastro = Produto | "offline";

function obterConfiguracao(): {
  url: string;
  chave: string;
} {
  if (!URL_SUPABASE || !CHAVE_SUPABASE) {
    throw new Error(
      "Configure a URL e a chave publicável do Supabase no .env.local.",
    );
  }

  return {
    url: URL_SUPABASE.replace(/\/$/, ""),
    chave: CHAVE_SUPABASE,
  };
}

function validarProduto(dado: unknown): Produto {
  if (typeof dado !== "object" || dado === null) {
    throw new Error("O Supabase retornou um produto inválido.");
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
      : typeof precoVenda === "string" && precoVenda.trim() !== ""
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
      "O Supabase retornou dados de produto em formato inválido.",
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
  mensagemPadrao: string,
): Promise<void> {
  if (!resposta.ok) {
    const mensagem = await resposta.text();

    throw new Error(
      mensagem ? `${mensagemPadrao} ${mensagem}` : mensagemPadrao,
    );
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

function obterUrlProdutos(): string {
  const { url } = obterConfiguracao();

  return `${url}/rest/v1/produtos`;
}

function prepararDadosProduto(produto: DadosNovoProduto): DadosNovoProduto {
  return {
    nome: produto.nome.trim(),
    codigo_barras: produto.codigo_barras.trim(),
    preco_venda: produto.preco_venda,
    id_categoria: produto.id_categoria,
    ativo: produto.ativo,
  };
}

function validarDadosNovoProduto(produto: DadosNovoProduto): void {
  if (!produto.nome.trim()) {
    throw new Error("Informe o nome do produto.");
  }

  if (!produto.codigo_barras.trim()) {
    throw new Error("Informe o código de barras.");
  }

  if (!Number.isFinite(produto.preco_venda) || produto.preco_venda < 0) {
    throw new Error("Informe um preço de venda válido.");
  }

  if (!Number.isInteger(produto.id_categoria) || produto.id_categoria <= 0) {
    throw new Error("Selecione uma categoria válida.");
  }
}

async function carregarProdutosLocaisOffline(): Promise<Produto[]> {
  const produtosLocais = await listarProdutosLocais();

  if (produtosLocais.length === 0) {
    throw new Error(
      "Não foi possível conectar ao Supabase e não há produtos salvos no aparelho.",
    );
  }

  return produtosLocais;
}

export async function carregarProdutos(): Promise<Produto[]> {
  const url = `${obterUrlProdutos()}?select=${COLUNAS_PRODUTO}&order=id.asc`;
  const headers = obterCabecalhos();

  let resposta: Response;

  try {
    resposta = await fetch(url, {
      method: "GET",
      headers,
    });
  } catch {
    return carregarProdutosLocaisOffline();
  }

  if (resposta.status >= 500) {
    return carregarProdutosLocaisOffline();
  }

  await verificarResposta(resposta, "Não foi possível carregar os produtos.");

  const dados: unknown = await resposta.json();

  if (!Array.isArray(dados)) {
    throw new Error("O Supabase retornou uma lista inválida.");
  }

  const produtosNuvem = dados.map((dado: unknown) => validarProduto(dado));

  await salvarProdutosLocais(produtosNuvem);

  const produtosLocais = await listarProdutosLocais();

  const produtosOffline = produtosLocais.filter((produto) => produto.id < 0);

  return [...produtosNuvem, ...produtosOffline];
}

export async function carregarProdutoPorId(id: number): Promise<Produto> {
  if (!Number.isInteger(id) || id === 0) {
    throw new Error("O ID do produto é inválido.");
  }

  if (id < 0) {
    const produtosLocais = await listarProdutosLocais();

    const produtoLocal = produtosLocais.find((produto) => produto.id === id);

    if (!produtoLocal) {
      throw new Error("Produto local não encontrado.");
    }

    return produtoLocal;
  }

  const url =
    `${obterUrlProdutos()}?select=${COLUNAS_PRODUTO}` + `&id=eq.${id}&limit=1`;
  const headers = obterCabecalhos();

  let resposta: Response;

  try {
    resposta = await fetch(url, {
      method: "GET",
      headers,
    });
  } catch {
    const produtosLocais = await listarProdutosLocais();

    const produtoLocal = produtosLocais.find((produto) => produto.id === id);

    if (produtoLocal) {
      return produtoLocal;
    }

    throw new Error("Não foi possível carregar o produto sem conexão.");
  }

  if (resposta.status >= 500) {
    const produtosLocais = await listarProdutosLocais();

    const produtoLocal = produtosLocais.find((produto) => produto.id === id);

    if (produtoLocal) {
      return produtoLocal;
    }

    throw new Error(
      "O Supabase está indisponível e o produto não está salvo localmente.",
    );
  }

  await verificarResposta(resposta, "Não foi possível carregar o produto.");

  const dados: unknown = await resposta.json();

  if (!Array.isArray(dados) || dados.length === 0) {
    throw new Error("Produto não encontrado.");
  }

  const produto = validarProduto(dados[0]);

  await salvarProdutoLocal(produto);

  return produto;
}

export async function cadastrarProduto(
  produto: Produto,
): Promise<ResultadoCadastro> {
  const dados = prepararDadosProduto(produto);

  validarDadosNovoProduto(dados);

  // Validar a configuração antes de tentar cadastrar.
  // Erros de configuração não devem ser tratados como modo offline.
  const url = `${obterUrlProdutos()}?select=${COLUNAS_PRODUTO}`;
  const headers = obterCabecalhos();

  let resposta: Response;

  try {
    resposta = await fetch(url, {
      method: "POST",
      headers: {
        ...headers,
        Prefer: "return=representation",
      },
      body: JSON.stringify(dados),
    });
  } catch {
    // A requisição falhou antes de receber uma resposta.
    const idLocal = await gerarIdLocalNegativo();

    const produtoLocal: Produto = {
      ...dados,
      id: idLocal,
    };

    await salvarProdutoLocal(produtoLocal);

    try {
      await adicionarNaFila("INSERT", "produtos", idLocal, dados);
    } catch (erro: unknown) {
      await removerProdutoLocal(idLocal);
      throw erro;
    }

    return "offline";
  }

  // Erros HTTP, como RLS, dados inválidos ou autenticação,
  // não devem gerar um segundo cadastro automático.
  await verificarResposta(resposta, "Não foi possível cadastrar o produto.");

  const retorno: unknown = await resposta.json();

  if (!Array.isArray(retorno) || retorno.length === 0) {
    throw new Error("O Supabase não retornou o produto cadastrado.");
  }

  const produtoSalvo = validarProduto(retorno[0]);

  await salvarProdutoLocal(produtoSalvo);

  return produtoSalvo;
}

const MAXIMO_TENTATIVAS = 5;

export async function sincronizarPendencias(): Promise<number> {
  const pendencias = await listarPendencias();

  const url = `${obterUrlProdutos()}?select=${COLUNAS_PRODUTO}`;
  const headers = obterCabecalhos();

  let sincronizadas = 0;

  for (const pendencia of pendencias) {
    if (pendencia.entidade !== "produtos" || pendencia.operacao !== "INSERT") {
      continue;
    }

    // Operação que já falhou várias vezes: não insiste mais.
    if (pendencia.tentativas >= MAXIMO_TENTATIVAS) {
      continue;
    }

    let dados: unknown;

    try {
      dados = JSON.parse(pendencia.dados);
    } catch {
      await registrarFalha(pendencia.id);
      continue;
    }

    if (typeof dados !== "object" || dados === null || Array.isArray(dados)) {
      await registrarFalha(pendencia.id);
      continue;
    }

    let resposta: Response;

    try {
      resposta = await fetch(url, {
        method: "POST",
        headers: {
          ...headers,
          Prefer: "return=representation",
        },
        body: JSON.stringify(dados),
      });
    } catch {
      // Sem rede: a operação não tem defeito. Não conta falha e para o envio.
      break;
    }

    if (!resposta.ok) {
      await registrarFalha(pendencia.id);
      continue;
    }

    try {
      const retorno: unknown = await resposta.json();

      if (!Array.isArray(retorno) || retorno.length === 0) {
        await registrarFalha(pendencia.id);
        continue;
      }

      const produtoNuvem = validarProduto(retorno[0]);

      if (pendencia.registro_local_id !== null) {
        await removerProdutoLocal(pendencia.registro_local_id);
      }

      await salvarProdutoLocal(produtoNuvem);
      await removerDaFila(pendencia.id);

      sincronizadas += 1;
    } catch {
      await registrarFalha(pendencia.id);
    }
  }

  return sincronizadas;
}
