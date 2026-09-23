import { StyleSheet, Text, View } from "react-native";
import type { Produto } from "../types/produto";

interface CartaoProdutoProps {
  produto: Produto;
}

export default function CartaoProduto({ produto }: CartaoProdutoProps) {
  return (
    <View style={styles.cartao}>
      <Text style={styles.nome}>{produto.nome}</Text>

      <Text style={styles.informacao}>
        Código de barras: {produto.codigo_barras}
      </Text>

      <Text style={styles.preco}>R$ {produto.preco_venda.toFixed(2)}</Text>

      <Text style={styles.informacao}>Categoria: {produto.id_categoria}</Text>

      <Text style={styles.status}>
        {produto.ativo ? "Produto ativo" : "Produto inativo"}
      </Text>
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },

  informacao: {
    fontSize: 15,
    marginBottom: 6,
  },

  preco: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },

  status: {
    fontSize: 15,
    marginTop: 4,
  },
});
