import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import type { RotasDaPilha, RotasDasAbas } from "./src/navegacao/tipos";

import { TelaInicio } from "./src/telas/TelaInicio";
import { TelaProdutos } from "./src/telas/TelaProdutos";
import { TelaDetalheProduto } from "./src/telas/TelaDetalheProduto";
import { TelaCadastroProduto } from "./src/telas/TelaCadastroProduto";
import { TelaMovimentacoes } from "./src/telas/TelaMovimentacoes";
import { TelaSobre } from "./src/telas/TelaSobre";

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

      <Abas.Screen
        name="AbaSobre"
        component={TelaSobre}
        options={{ title: "Sobre" }}
      />
    </Abas.Navigator>
  );
}

export default function App() {
  return (
    <ProvedorEstadoApp>
      <NavigationContainer>
        <NavegacaoPrincipal />
      </NavigationContainer>
    </ProvedorEstadoApp>
  );
}