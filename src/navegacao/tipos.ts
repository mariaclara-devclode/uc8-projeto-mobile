import type { NavigatorScreenParams } from "@react-navigation/native";

export type RotasDaPilha = {
  Produtos: undefined;
  DetalheProduto: {
    id: number;
  };
};

export type RotasDasAbas = {
  AbaProdutos: NavigatorScreenParams<RotasDaPilha>;
  AbaSobre: undefined;
};
