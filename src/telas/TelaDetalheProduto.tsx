import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { carregarProdutoPorId } from "../servicos/produto";
import type { Produto } from "../types/produto";
import type { RotasDaPilha } from "../navegacao/tipos";

type TelaDetalheProdutoProps = NativeStackScreenProps<
  RotasDaPilha,
  "DetalheProduto"
>;

export function TelaDetalheProduto({ route }: TelaDetalheProdutoProps) {
  const { id } = route.params;

  const [produto, setProduto] = useState<Produto | null>(null);

  const [carregando, setCarregando] = useState(true);

  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarProdutoPorId(id)
      .then((produtoCarregado) => {
        setProduto(produtoCarregado);
      })
      .catch((erro) => {
        console.error(erro);
        setErro("Não foi possível carregar os dados do produto.");
      })
      .finally(() => {
        setCarregando(false);
      });
  }, [id]);

  if (carregando) {
    return (
      <SafeAreaView style={styles.areaSegura}>
        <View style={styles.centralizado}>
          <ActivityIndicator size="large" />

          <Text style={styles.carregando}>Carregando produto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (erro !== "") {
    return (
      <SafeAreaView style={styles.areaSegura}>
        <View style={styles.centralizado}>
          <Text style={styles.erro}>{erro}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!produto) {
    return (
      <SafeAreaView style={styles.areaSegura}>
        <View style={styles.centralizado}>
          <Text style={styles.erro}>Produto não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.areaSegura}>
      <View style={styles.container}>
        <Text style={styles.titulo}>{produto.nome}</Text>

        <View style={styles.card}>
          <Text style={styles.rotulo}>Código de barras</Text>

          <Text style={styles.valor}>{produto.codigo_barras}</Text>

          <Text style={styles.rotulo}>Preço de venda</Text>

          <Text style={styles.preco}>R$ {produto.preco_venda.toFixed(2)}</Text>

          <Text style={styles.rotulo}>Categoria</Text>

          <Text style={styles.valor}>{produto.id_categoria}</Text>

          <Text style={styles.rotulo}>Situação</Text>

          <Text
            style={[
              styles.status,
              produto.ativo ? styles.ativo : styles.inativo,
            ]}
          >
            {produto.ativo ? "Produto ativo" : "Produto inativo"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: "#eef1f6",
  },

  container: {
    flex: 1,
    padding: 20,
  },

  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0f1a2e",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
  },

  rotulo: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
    marginBottom: 4,
  },

  valor: {
    fontSize: 17,
    color: "#222",
  },

  preco: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2563eb",
  },

  status: {
    fontSize: 16,
    fontWeight: "bold",
  },

  ativo: {
    color: "#15803d",
  },

  inativo: {
    color: "#b91c1c",
  },

  centralizado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  carregando: {
    marginTop: 12,
    color: "#555",
  },

  erro: {
    color: "#b91c1c",
    textAlign: "center",
    fontSize: 16,
  },
});
