import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import type {
  RotasDaPilha,
  RotasDasAbas,
} from "./src/navegacao/tipos";

import { TelaProdutos } from "./src/telas/TelaProdutos";

import { TelaDetalheProduto } from "./src/telas/TelaDetalheProduto";

import { TelaSobre } from "./src/telas/TelaSobre";

const Pilha =
  createNativeStackNavigator<RotasDaPilha>();

const Abas =
  createBottomTabNavigator<RotasDasAbas>();

function PilhaProdutos() {
  return (
    <Pilha.Navigator>
      <Pilha.Screen
        name="Produtos"
        component={TelaProdutos}
        options={{
          title: "Produtos",
        }}
      />

      <Pilha.Screen
        name="DetalheProduto"
        component={TelaDetalheProduto}
        options={{
          title: "Detalhes do Produto",
        }}
      />
    </Pilha.Navigator>
  );
}

function NavegacaoPrincipal() {
  return (
    <Abas.Navigator>
      <Abas.Screen
        name="AbaProdutos"
        component={PilhaProdutos}
        options={{
          title: "Produtos",
          headerShown: false,
        }}
      />

      <Abas.Screen
        name="AbaSobre"
        component={TelaSobre}
        options={{
          title: "Sobre",
        }}
      />
    </Abas.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <NavegacaoPrincipal />
    </NavigationContainer>
  );
}