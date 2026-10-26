export type TipoDeErro =
  | "rede"
  | "api"
  | "banco"
  | "validacao"
  | "desconhecido";

export interface ErroClassificado {
  tipo: TipoDeErro;
  // Texto para quem usa o aplicativo.
  mensagem: string;
  // Texto técnico para quem desenvolve (vai para o console, nunca para a tela).
  detalhe: string;
}

// Entrada inválida: a mensagem é escrita para a pessoa e pode ir para a tela.
export class ErroDeValidacao extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroDeValidacao";
  }
}

// Falha ao ler ou gravar no SQLite do aparelho.
export class ErroDoBanco extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroDoBanco";
  }
}

// O servidor respondeu, mas recusou a operação (status HTTP de erro).
export class ErroDaApi extends Error {
  readonly status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.name = "ErroDaApi";
    this.status = status;
  }
}

function mensagemParaStatus(status: number): string {
  if (status === 400) {
    return "O servidor recusou os dados enviados. Confira os campos.";
  }

  if (status === 401 || status === 403) {
    return "Acesso negado pelo servidor. Verifique a chave e as permissões do projeto.";
  }

  if (status === 404) {
    return "O recurso não foi encontrado no servidor.";
  }

  if (status >= 500) {
    return "O servidor está com problemas. Tente de novo mais tarde.";
  }

  return `O servidor recusou a operação (${status}).`;
}

export function classificarErro(erro: unknown): ErroClassificado {
  if (erro instanceof ErroDeValidacao) {
    return {
      tipo: "validacao",
      mensagem: erro.message,
      detalhe: `${erro.name}: ${erro.message}`,
    };
  }

  if (erro instanceof ErroDaApi) {
    return {
      tipo: "api",
      mensagem: mensagemParaStatus(erro.status),
      detalhe: `${erro.name} ${erro.status}: ${erro.message}`,
    };
  }

  if (erro instanceof ErroDoBanco) {
    return {
      tipo: "banco",
      mensagem: "Não foi possível ler ou guardar os dados no aparelho.",
      detalhe: `${erro.name}: ${erro.message}`,
    };
  }

  if (erro instanceof TypeError && erro.message === "Network request failed") {
    return {
      tipo: "rede",
      mensagem: "Sem conexão com o servidor. Verifique a rede e tente de novo.",
      detalhe: `${erro.name}: ${erro.message}`,
    };
  }

  if (erro instanceof Error) {
    return {
      tipo: "desconhecido",
      mensagem: "Algo deu errado. Tente de novo.",
      detalhe: `${erro.name}: ${erro.message}`,
    };
  }

  return {
    tipo: "desconhecido",
    mensagem: "Algo deu errado. Tente de novo.",
    detalhe: String(erro),
  };
}

// Registro para o desenvolvedor: uma linha no console com a origem. Grava o tipo
// e o detalhe técnico; o que a pessoa digitou nos campos não entra no registro.
export function registrarErro(origem: string, erro: unknown): ErroClassificado {
  const classificado = classificarErro(erro);

  console.error(`[${origem}] ${classificado.tipo}: ${classificado.detalhe}`);

  return classificado;
}