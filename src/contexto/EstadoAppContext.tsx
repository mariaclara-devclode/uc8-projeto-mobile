
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as Network from "expo-network";

interface EstadoApp {
  conectado: boolean;
  atualizarConexao: (conectado: boolean) => void;
}

const ContextoEstadoApp = createContext<EstadoApp | null>(null);

interface ProvedorEstadoAppProps {
  children: ReactNode;
}

export function ProvedorEstadoApp({
  children,
}: ProvedorEstadoAppProps) {
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function verificarConexao() {
      try {
        const estado = await Network.getNetworkStateAsync();

        if (ativo) {
          setConectado(estado.isConnected === true);
        }
      } catch {
        if (ativo) {
          setConectado(false);
        }
      }
    }

    void verificarConexao();

    const assinatura = Network.addNetworkStateListener((estado) => {
      if (ativo) {
        setConectado(estado.isConnected === true);
      }
    });

    return () => {
      ativo = false;
      assinatura.remove();
    };
  }, []);

  return (
    <ContextoEstadoApp.Provider
      value={{
        conectado,
        atualizarConexao: setConectado,
      }}
    >
      {children}
    </ContextoEstadoApp.Provider>
  );
}

export function useEstadoApp(): EstadoApp {
  const contexto = useContext(ContextoEstadoApp);

  if (contexto === null) {
    throw new Error(
      "useEstadoApp precisa estar dentro de ProvedorEstadoApp.",
    );
  }

  return contexto;
}
