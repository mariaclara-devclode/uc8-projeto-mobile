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

import type { EstadoTela } from "../types/estadoTela";
import type { Produto } from "../types/produto";

interface EstadoApp {
  conectado: boolean;
  atualizarConexao: (conectado: boolean) => void;
  produtos: EstadoTela<Produto[]>;
  recarregarProdutos: () => Promise<void>;
  incluirProduto: (produto: Produto) => Promise<ResultadoCadastro>;
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
        console.error(erro);

        setProdutos({
          status: "erro",
          mensagem: "Não foi possível carregar os produtos.",
        });
      }
    },
    [],
  );

  const recarregarProdutos = useCallback(
    () => buscarProdutos(true),
    [buscarProdutos],
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

  const sincronizar = useCallback(async (): Promise<void> => {
    if (sincronizando.current) {
      return;
    }

    sincronizando.current = true;

    try {
      const enviadas = await sincronizarPendencias();

      if (enviadas > 0) {
        await buscarProdutos(false);
      }
    } catch (erro: unknown) {
      // As operações pendentes continuam na fila.
      console.error(erro);
    } finally {
      sincronizando.current = false;
    }
  }, [buscarProdutos]);

  // Carga inicial da lista.
  useEffect(() => {
    void buscarProdutos(true);
  }, [buscarProdutos]);

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
