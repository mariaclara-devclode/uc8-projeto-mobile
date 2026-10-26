import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as Network from "expo-network";

import {
  cadastrarProduto,
  carregarProdutos,
  sincronizarPendencias,
  type ResultadoCadastro,
} from "../servicos/produto";

import {
  calcularSaldo,
  carregarMovimentacoes,
  registrarMovimentacao as registrarMovimentacaoNoServico,
  sincronizarMovimentacoesPendentes,
  type NovaMovimentacao,
  type ResultadoRegistro,
} from "../servicos/movimentacao";

import { ErroDeValidacao, registrarErro } from "../erros/erros";

import type { EstadoTela } from "../types/estadoTela";
import type { Movimentacao } from "../types/movimentacao";
import type { Produto } from "../types/produto";

interface EstadoApp {
  conectado: boolean;
  atualizarConexao: (conectado: boolean) => void;
  produtos: EstadoTela<Produto[]>;
  recarregarProdutos: () => Promise<void>;
  incluirProduto: (produto: Produto) => Promise<ResultadoCadastro>;
  movimentacoes: EstadoTela<Movimentacao[]>;
  recarregarMovimentacoes: () => Promise<void>;
  registrarMovimentacao: (
    dados: NovaMovimentacao,
  ) => Promise<ResultadoRegistro>;
}

const ContextoEstadoApp = createContext<EstadoApp | null>(null);

interface ProvedorEstadoAppProps {
  children: ReactNode;
}

export function ProvedorEstadoApp({ children }: ProvedorEstadoAppProps) {
  // null = ainda não sei. Evita mostrar "sem conexão" por um instante na abertura.
  const [conexao, setConexao] = useState<boolean | null>(null);

  const [produtos, setProdutos] = useState<EstadoTela<Produto[]>>({
    status: "carregando",
  });

  const [movimentacoes, setMovimentacoes] = useState<
    EstadoTela<Movimentacao[]>
  >({
    status: "carregando",
  });

  const sincronizando = useRef(false);

  const buscarProdutos = useCallback(
    async (mostrarCarregando: boolean): Promise<void> => {
      if (mostrarCarregando) {
        setProdutos({ status: "carregando" });
      }

      try {
        const lista = await carregarProdutos();

        setProdutos({ status: "pronto", dados: lista });
      } catch (erro: unknown) {
        const classificado = registrarErro("lista de produtos", erro);

        setProdutos({
          status: "erro",
          mensagem: classificado.mensagem,
        });
      }
    },
    [],
  );

  const buscarMovimentacoes = useCallback(
    async (mostrarCarregando: boolean): Promise<void> => {
      if (mostrarCarregando) {
        setMovimentacoes({ status: "carregando" });
      }

      try {
        const lista = await carregarMovimentacoes();

        setMovimentacoes({ status: "pronto", dados: lista });
      } catch (erro: unknown) {
        const classificado = registrarErro("lista de movimentações", erro);

        setMovimentacoes({
          status: "erro",
          mensagem: classificado.mensagem,
        });
      }
    },
    [],
  );

  const recarregarProdutos = useCallback(
    () => buscarProdutos(true),
    [buscarProdutos],
  );

  const recarregarMovimentacoes = useCallback(
    () => buscarMovimentacoes(true),
    [buscarMovimentacoes],
  );

  const incluirProduto = useCallback(
    async (produto: Produto): Promise<ResultadoCadastro> => {
      const resultado = await cadastrarProduto(produto);

      // Atualiza a lista sem mostrar o carregamento de novo.
      await buscarProdutos(false);

      return resultado;
    },
    [buscarProdutos],
  );

  const registrarMovimentacao = useCallback(
    async (dados: NovaMovimentacao): Promise<ResultadoRegistro> => {
      // A saída nunca pode passar do estoque atual. O saldo já considera as
      // movimentações que ainda esperam sincronização.
      if (dados.tipo === "saida") {
        if (movimentacoes.status !== "pronto") {
          throw new ErroDeValidacao(
            "O estoque ainda não foi carregado. Aguarde e tente de novo.",
          );
        }

        const saldo = calcularSaldo(movimentacoes.dados, dados.id_produto);

        if (dados.quantidade > saldo) {
          throw new ErroDeValidacao(
            `Estoque insuficiente. Saldo atual: ${saldo} unidades.`,
          );
        }
      }

      const resultado = await registrarMovimentacaoNoServico(dados);

      await buscarMovimentacoes(false);

      return resultado;
    },
    [movimentacoes, buscarMovimentacoes],
  );

  const sincronizar = useCallback(async (): Promise<void> => {
    if (sincronizando.current) {
      return;
    }

    sincronizando.current = true;

    try {
      // Produtos primeiro; as movimentações só usam produtos já enviados.
      try {
        const produtosEnviados = await sincronizarPendencias();

        if (produtosEnviados > 0) {
          await buscarProdutos(false);
        }
      } catch (erro: unknown) {
        registrarErro("sincronização de produtos", erro);
      }

      try {
        const movimentacoesEnviadas = await sincronizarMovimentacoesPendentes();

        if (movimentacoesEnviadas > 0) {
          await buscarMovimentacoes(false);
        }
      } catch (erro: unknown) {
        registrarErro("sincronização de movimentações", erro);
      }
    } finally {
      sincronizando.current = false;
    }
  }, [buscarProdutos, buscarMovimentacoes]);

  // Carga inicial das listas.
  useEffect(() => {
    void buscarProdutos(true);
    void buscarMovimentacoes(true);
  }, [buscarProdutos, buscarMovimentacoes]);

  // Acompanha a rede e envia a fila quando a conexão está disponível.
  useEffect(() => {
    let ativo = true;

    function aplicar(estado: Network.NetworkState) {
      const online =
        estado.isConnected === true && estado.isInternetReachable !== false;

      setConexao(online);

      if (online) {
        void sincronizar();
      }
    }

    async function verificarConexao() {
      try {
        const estado = await Network.getNetworkStateAsync();

        if (ativo) {
          aplicar(estado);
        }
      } catch {
        if (ativo) {
          setConexao(false);
        }
      }
    }

    void verificarConexao();

    const assinatura = Network.addNetworkStateListener((estado) => {
      if (ativo) {
        aplicar(estado);
      }
    });

    return () => {
      ativo = false;
      assinatura.remove();
    };
  }, [sincronizar]);

  return (
    <ContextoEstadoApp.Provider
      value={{
        conectado: conexao !== false,
        atualizarConexao: setConexao,
        produtos,
        recarregarProdutos,
        incluirProduto,
        movimentacoes,
        recarregarMovimentacoes,
        registrarMovimentacao,
      }}
    >
      {children}
    </ContextoEstadoApp.Provider>
  );
}

export function useEstadoApp(): EstadoApp {
  const contexto = useContext(ContextoEstadoApp);

  if (contexto === null) {
    throw new Error("useEstadoApp precisa estar dentro de ProvedorEstadoApp.");
  }

  return contexto;
}