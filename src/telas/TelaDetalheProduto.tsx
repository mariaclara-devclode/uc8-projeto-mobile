import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { carregarProdutos } from "../servicos/produto";
import type { Produto } from "../types/produto";
import type { RotasDaPilha } from "../navegacao/tipos";

type Props = NativeStackScreenProps<
  RotasDaPilha,
  "DetalheProduto"
>;

export function TelaDetalheProduto({ route }: Props) {
  const { id } = route.params;

  const [produto, setProduto] = useState<Produto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarProdutos()
      .then((produtos) => {
        const encontrado = produtos.find(
          (item) => item.id === id
        );

        if (encontrado) {
          setProduto(encontrado);
        } else {
          setErro("Produto não encontrado.");
        }
      })
      .catch((erroDesconhecido: unknown) => {
        console.error(erroDesconhecido);
        setErro("Não foi possível carregar o produto.");
      })
      .finally(() => setCarregando(false));
  }, [id]);

  return (
    <SafeAreaView style={styles.areaSegura}>
      <View style={styles.container}>
        {carregando ? (
          <View style={styles.centralizado}>
            <ActivityIndicator size="large" />
            <Text style={styles.textoEstado}>
              Carregando detalhes...
            </Text>
          </View>
        ) : erro !== "" ? (
          <Text style={styles.erro}>{erro}</Text>
        ) : produto ? (
          <>
            <Text style={styles.titulo}>
              {produto.nome}
            </Text>

            <View style={styles.card}>
              <Text style={styles.rotulo}>
                Código de barras
              </Text>
              <Text style={styles.valor}>
                {produto.codigo_barras}
              </Text>

              <Text style={styles.rotulo}>
                Preço de venda
              </Text>
              <Text style={styles.preco}>
                R$ {produto.preco_venda.toFixed(2)}
              </Text>

              <Text style={styles.rotulo}>
                Categoria
              </Text>
              <Text style={styles.valor}>
                {produto.id_categoria}
              </Text>

              <Text style={styles.rotulo}>
                Situação
              </Text>
              <Text
                style={[
                  styles.valor,
                  produto.ativo
                    ? styles.ativo
                    : styles.inativo,
                ]}
              >
                {produto.ativo
                  ? "Produto ativo"
                  : "Produto inativo"}
              </Text>
            </View>
          </>
        ) : null}
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
    color: "#666",
    fontSize: 14,
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
  ativo: {
    color: "#15803d",
    fontWeight: "bold",
  },
  inativo: {
    color: "#b91c1c",
    fontWeight: "bold",
  },
  centralizado: {
    alignItems: "center",
    marginTop: 30,
  },
  textoEstado: {
    color: "#555",
    marginTop: 12,
  },
  erro: {
    color: "#b91c1c",
    fontSize: 16,
  },
});