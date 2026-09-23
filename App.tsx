import { ScrollView, StyleSheet, Text, View } from "react-native";
import CartaoProduto from "./src/componentes/CartaoProduto";
import type { Produto } from "./src/types/produto";

const produto1: Produto = {
  id: 1,
  nome: "Semente de milho",
  codigo_barras: "7891234567890",
  preco_venda: 25.9,
  id_categoria: 1,
  ativo: true,
};

const produto2: Produto = {
  id: 2,
  nome: "Adubo NPK",
  codigo_barras: "7899876543210",
  preco_venda: 89.9,
  id_categoria: 2,
  ativo: true,
};

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Estok</Text>

      <ScrollView>
        <CartaoProduto produto={produto1} />
        <CartaoProduto produto={produto2} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f4f7",
    padding: 20,
    paddingTop: 50,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
});