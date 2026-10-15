import { useEffect } from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Network from "expo-network";

import type { RotasDaPilha, RotasDasAbas } from "./src/navegacao/tipos";

import { TelaInicio } from "./src/telas/TelaInicio";
import { TelaProdutos } from "./src/telas/TelaProdutos";
import { TelaDetalheProduto } from "./src/telas/TelaDetalheProduto";
import { TelaCadastroProduto } from "./src/telas/TelaCadastroProduto";
import { TelaMovimentacoes } from "./src/telas/TelaMovimentacoes";

import { sincronizarPendencias } from "./src/servicos/produto";
import { ProvedorEstadoApp } from "./src/contexto/EstadoAppContext";

const Pilha = createNativeStackNavigator<RotasDaPilha>();
const Abas = createBottomTabNavigator<RotasDasAbas>();

function PilhaProdutos() {
  return (
    <Pilha.Navigator>
      <Pilha.Screen
        name="Produtos"
        component={TelaProdutos}
        options={{ title: "Produtos" }}
      />

      <Pilha.Screen
        name="DetalheProduto"
        component={TelaDetalheProduto}
        options={{ title: "Detalhes do Produto" }}
      />
    </Pilha.Navigator>
  );
}

function NavegacaoPrincipal() {
  return (
    <Abas.Navigator>
      <Abas.Screen name="AbaInicio" options={{ title: "Início" }}>
        {({ navigation }) => (
          <TelaInicio
            aoAbrirProdutos={() =>
              navigation.navigate("AbaProdutos", {
                screen: "Produtos",
              })
            }
            aoAbrirCadastro={() => navigation.navigate("AbaCadastro")}
            aoAbrirMovimentacoes={() => navigation.navigate("AbaMovimentacoes")}
          />
        )}
      </Abas.Screen>

      <Abas.Screen
        name="AbaProdutos"
        component={PilhaProdutos}
        options={{
          title: "Produtos",
          headerShown: false,
        }}
      />

      <Abas.Screen
        name="AbaCadastro"
        component={TelaCadastroProduto}
        options={{ title: "Cadastro" }}
      />

      <Abas.Screen
        name="AbaMovimentacoes"
        component={TelaMovimentacoes}
        options={{ title: "Movimentações" }}
      />
    </Abas.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    let ativo = true;
    let sincronizando = false;

    async function tentarSincronizar() {
      if (sincronizando) {
        return;
      }

      try {
        const estado = await Network.getNetworkStateAsync();

        if (
          !ativo ||
          !estado.isConnected ||
          estado.isInternetReachable === false
        ) {
          return;
        }

        sincronizando = true;
        await sincronizarPendencias();
      } catch {
        // As operações pendentes permanecem na fila.
      } finally {
        sincronizando = false;
      }
    }

    void tentarSincronizar();

    const assinatura = Network.addNetworkStateListener((estado) => {
      if (estado.isConnected && estado.isInternetReachable !== false) {
        void tentarSincronizar();
      }
    });

    return () => {
      ativo = false;
      assinatura.remove();
    };
  }, []);

  return (
    <ProvedorEstadoApp>
      <NavigationContainer>
        <NavegacaoPrincipal />
      </NavigationContainer>
    </ProvedorEstadoApp>
  );
}
