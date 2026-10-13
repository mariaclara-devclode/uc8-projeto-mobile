
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { CartaoProduto } from "../componentes/CartaoProduto";
import { carregarProdutos } from "../servicos/produto";
import type { Produto } from "../types/produto";
import type { RotasDaPilha } from "../navegacao/tipos";
import { cores, espacos, larguraLarga } from "../tema/tema";

type Props = NativeStackScreenProps<
  RotasDaPilha,
  "Produtos"
>;

export function TelaProdutos({ navigation }: Props) {
  const { width } = useWindowDimensions();

  const duasColunas = width >= larguraLarga;

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarProdutos()
      .then(setProdutos)
      .catch((erroDesconhecido: unknown) => {
        console.error(erroDesconhecido);
        setErro("Não foi possível carregar os produtos.");
      })
      .finally(() => setCarregando(false));
  }, []);

  return (
    <SafeAreaView style={styles.areaSegura}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Produtos</Text>

        <Text style={styles.subtitulo}>
          Consulte os produtos cadastrados no Estok.
        </Text>

        {carregando ? (
          <View style={styles.estado}>
            <ActivityIndicator
              size="large"
              color={cores.primaria}
            />

            <Text style={styles.textoEstado}>
              Carregando produtos...
            </Text>
          </View>
        ) : erro !== "" ? (
          <Text style={styles.erro}>{erro}</Text>
        ) : (
          <FlatList
            key={duasColunas ? "duas-colunas" : "uma-coluna"}
            data={produtos}
            keyExtractor={(item) => String(item.id)}
            numColumns={duasColunas ? 2 : 1}
            columnWrapperStyle={
              duasColunas ? styles.linhaDeColunas : undefined
            }
            contentContainerStyle={styles.lista}
            ListEmptyComponent={
              <Text style={styles.vazio}>
                Nenhum produto cadastrado.
              </Text>
            }
            renderItem={({ item }) => (
              <View
                style={
                  duasColunas
                    ? styles.itemDuasColunas
                    : styles.itemUmaColuna
                }
              >
                <CartaoProduto
                  produto={item}
                  aoVerDetalhes={(id) =>
                    navigation.navigate("DetalheProduto", { id })
                  }
                />
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: cores.fundo,
  },

  container: {
    flex: 1,
    padding: espacos.md,
  },

  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: cores.texto,
  },

  subtitulo: {
    fontSize: 15,
    color: cores.textoSecundario,
    marginTop: espacos.xs,
    marginBottom: espacos.md,
  },

  lista: {
    paddingBottom: espacos.lg,
  },

  linhaDeColunas: {
    gap: espacos.md,
  },

  itemUmaColuna: {
    width: "100%",
  },

  itemDuasColunas: {
    flex: 1,
    minWidth: 0,
  },

  estado: {
    paddingTop: 30,
    alignItems: "center",
  },

  textoEstado: {
    marginTop: espacos.sm,
    color: cores.textoSecundario,
  },

  vazio: {
    textAlign: "center",
    color: cores.textoSecundario,
    marginTop: 30,
  },

  erro: {
    color: cores.erro,
    padding: espacos.md,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
  },
});
