import type { Movimentacao } from "../types/movimentacao";

import {
  adicionarNaFila,
  listarPendencias,
  registrarFalha,
  removerDaFila,
} from "../banco/filaSincronizacao";

import {
  gerarIdLocalNegativoMovimentacao,
  listarMovimentacoesLocais,
  removerMovimentacaoLocal,
  salvarMovimentacaoLocal,
  salvarMovimentacoesLocais,
} from "../banco/movimentacoesLocal";

import { ErroDaApi, ErroDeValidacao, registrarErro } from "../erros/erros";

const URL_SUPABASE = process.env.EXPO_PUBLIC_SUPABASE_URL;

const CHAVE_SUPABASE = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const COLUNAS_MOVIMENTACAO = "id,id_produto,quantidade,tipo,data";

const MAXIMO_TENTATIVAS = 5;

export type NovaMovimentacao = Pick<
  Movimentacao,
  "id_produto" | "quantidade" | "tipo"
>;

export type ResultadoRegistro = Movimentacao | "offline";

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

function obterCabecalhos(chave: string): Record<string, string> {
  return {
    apikey: chave,
    Authorization: `Bearer ${chave}`,
    "Content-Type": "application/json",
    Accept: "application/json",
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

function ordenarPorDataDecrescente(lista: Movimentacao[]): Movimentacao[] {
  return [...lista].sort((a, b) => b.data.getTime() - a.data.getTime());
}

// Saldo de um produto = soma das entradas menos a soma das saídas.
export function calcularSaldo(
  movimentacoes: Movimentacao[],
  idProduto: number,
): number {
  return movimentacoes
    .filter((movimentacao) => movimentacao.id_produto === idProduto)
    .reduce(
      (total, movimentacao) =>
        movimentacao.tipo === "entrada"
          ? total + movimentacao.quantidade
          : total - movimentacao.quantidade,
      0,
    );
}

// Quando a nuvem não responde, usa o que está no aparelho. Sem nada guardado,
// relança o erro original (rede ou servidor), para a tela explicar o motivo.
async function carregarMovimentacoesLocaisOuFalhar(
  erroOriginal: unknown,
): Promise<Movimentacao[]> {
  const locais = await listarMovimentacoesLocais();

  if (locais.length === 0) {
    throw erroOriginal;
  }

  return locais;
}

export async function carregarMovimentacoes(): Promise<Movimentacao[]> {
  const { url, chave } = obterConfiguracao();

  let resposta: Response;

  try {
    resposta = await fetch(
      `${url}/rest/v1/movimentacoes?select=${COLUNAS_MOVIMENTACAO}&order=data.desc`,
      {
        method: "GET",
        headers: obterCabecalhos(chave),
      },
    );
  } catch (erro: unknown) {
    return carregarMovimentacoesLocaisOuFalhar(erro);
  }

  if (!resposta.ok) {
    const detalhe = await resposta.text();

    const erroDaApi = new ErroDaApi(
      resposta.status,
      detalhe || resposta.statusText,
    );

    if (resposta.status >= 500) {
      return carregarMovimentacoesLocaisOuFalhar(erroDaApi);
    }

    throw erroDaApi;
  }

  let dados: unknown;

  try {
    dados = await resposta.json();
  } catch {
    throw new Error("O Supabase retornou uma resposta que não é JSON válido.");
  }

  const movimentacoes = validarMovimentacoes(dados);

  // Guarda no aparelho o que veio da nuvem e acrescenta o que ainda está na
  // fila (id negativo). Se o banco local falhar, a lista da nuvem continua valendo.
  let pendentes: Movimentacao[] = [];

  try {
    await salvarMovimentacoesLocais(movimentacoes);

    const locais = await listarMovimentacoesLocais();

    pendentes = locais.filter((movimentacao) => movimentacao.id < 0);
  } catch (erro: unknown) {
    registrarErro("cache de movimentações", erro);
  }

  return ordenarPorDataDecrescente([...movimentacoes, ...pendentes]);
}

function validarNovaMovimentacao(dados: NovaMovimentacao): void {
  if (!Number.isInteger(dados.id_produto) || dados.id_produto <= 0) {
    throw new ErroDeValidacao(
      "Selecione um produto que já foi enviado à nuvem.",
    );
  }

  if (!Number.isInteger(dados.quantidade) || dados.quantidade <= 0) {
    throw new ErroDeValidacao(
      "Informe uma quantidade inteira maior que zero.",
    );
  }

  if (dados.tipo !== "entrada" && dados.tipo !== "saida") {
    throw new ErroDeValidacao("Escolha entrada ou saída.");
  }
}

export async function registrarMovimentacao(
  dados: NovaMovimentacao,
): Promise<ResultadoRegistro> {
  validarNovaMovimentacao(dados);

  // Configuração inválida é erro do app, não modo offline: valida antes.
  const { url, chave } = obterConfiguracao();

  const corpo = {
    id_produto: dados.id_produto,
    quantidade: dados.quantidade,
    tipo: dados.tipo,
    // A hora fica registrada no momento da operação, mesmo que o envio demore.
    data: new Date().toISOString(),
  };

  let resposta: Response;

  try {
    resposta = await fetch(
      `${url}/rest/v1/movimentacoes?select=${COLUNAS_MOVIMENTACAO}`,
      {
        method: "POST",
        headers: {
          ...obterCabecalhos(chave),
          Prefer: "return=representation",
        },
        body: JSON.stringify(corpo),
      },
    );
  } catch {
    // A requisição falhou antes de receber resposta: guarda no aparelho e na fila.
    const idLocal = await gerarIdLocalNegativoMovimentacao();

    const movimentacaoLocal: Movimentacao = {
      id: idLocal,
      id_produto: corpo.id_produto,
      quantidade: corpo.quantidade,
      tipo: corpo.tipo,
      data: new Date(corpo.data),
    };

    await salvarMovimentacaoLocal(movimentacaoLocal);

    try {
      await adicionarNaFila("INSERT", "movimentacoes", idLocal, corpo);
    } catch (erro: unknown) {
      await removerMovimentacaoLocal(idLocal);
      throw erro;
    }

    return "offline";
  }

  // Erros HTTP (RLS, dado inválido) não geram um segundo registro automático.
  if (!resposta.ok) {
    const detalhe = await resposta.text();

    throw new ErroDaApi(resposta.status, detalhe || resposta.statusText);
  }

  const retorno: unknown = await resposta.json();

  const salvas = validarMovimentacoes(retorno);

  if (salvas.length === 0) {
    throw new Error("O Supabase não retornou a movimentação registrada.");
  }

  const movimentacaoSalva = salvas[0];

  try {
    await salvarMovimentacaoLocal(movimentacaoSalva);
  } catch (erro: unknown) {
    // Já está na nuvem: falha no cache local não pode parecer falha do registro.
    registrarErro("cache de movimentações", erro);
  }

  return movimentacaoSalva;
}

export async function sincronizarMovimentacoesPendentes(): Promise<number> {
  const pendencias = (await listarPendencias()).filter(
    (pendencia) =>
      pendencia.entidade === "movimentacoes" && pendencia.operacao === "INSERT",
  );

  if (pendencias.length === 0) {
    return 0;
  }

  const { url, chave } = obterConfiguracao();

  const endereco = `${url}/rest/v1/movimentacoes?select=${COLUNAS_MOVIMENTACAO}`;

  let sincronizadas = 0;

  for (const pendencia of pendencias) {
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
      resposta = await fetch(endereco, {
        method: "POST",
        headers: {
          ...obterCabecalhos(chave),
          Prefer: "return=representation",
        },
        body: JSON.stringify(dados),
      });
    } catch {
      // Sem rede: não conta falha e para o envio.
      break;
    }

    if (!resposta.ok) {
      registrarErro(
        "sincronização de movimentação",
        new ErroDaApi(resposta.status, await resposta.text()),
      );

      await registrarFalha(pendencia.id);
      continue;
    }

    try {
      const retorno: unknown = await resposta.json();

      const salvas = validarMovimentacoes(retorno);

      if (salvas.length === 0) {
        await registrarFalha(pendencia.id);
        continue;
      }

      if (pendencia.registro_local_id !== null) {
        await removerMovimentacaoLocal(pendencia.registro_local_id);
      }

      await salvarMovimentacaoLocal(salvas[0]);
      await removerDaFila(pendencia.id);

      sincronizadas += 1;
    } catch {
      await registrarFalha(pendencia.id);
    }
  }

  return sincronizadas;
}