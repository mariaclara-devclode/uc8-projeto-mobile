import type { NavigatorScreenParams } from "@react-navigation/native";

export type RotasDaPilha = {
  Produtos: undefined;
  DetalheProduto: {
    id: number;
  };
};

export type RotasDasAbas = {
  AbaInicio: undefined;
  AbaProdutos: NavigatorScreenParams<RotasDaPilha>;
  AbaCadastro: undefined;
  AbaMovimentacoes: undefined;
};