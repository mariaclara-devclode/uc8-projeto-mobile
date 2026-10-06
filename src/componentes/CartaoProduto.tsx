import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Produto } from "../types/produto";

interface CartaoProdutoProps {
  produto: Produto;
  aoVerDetalhes: (id: number) => void;
}

export function CartaoProduto({
  produto,
  aoVerDetalhes,
}: CartaoProdutoProps) {
  return (
    <View style={styles.cartao}>
      <Text style={styles.nome}>
        {produto.nome}
      </Text>

      <Pressable
        style={styles.botao}
        onPress={() => aoVerDetalhes(produto.id)}
      >
        <Text style={styles.textoBotao}>
          Ver detalhes
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: "#ffffff",
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d9d9d9",
  },

  nome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f1a2e",
    marginBottom: 12,
  },

  botao: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: "flex-start",
  },

  textoBotao: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});