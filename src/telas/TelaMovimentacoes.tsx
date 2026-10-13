
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Movimentacao } from "../types/movimentacao";
import { carregarMovimentacoes } from "../servicos/movimentacao";

export function TelaMovimentacoes() {
  const [movimentacoes, setMovimentacoes] =
    useState<Movimentacao[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function buscarHistorico() {
      try {
        setCarregando(true);
        setErro(null);

        const dados = await carregarMovimentacoes();

        setMovimentacoes(dados);
      } catch (erroRecebido: unknown) {
        setErro(
          erroRecebido instanceof Error
            ? erroRecebido.message
            : "Não foi possível carregar as movimentações."
        );
      } finally {
        setCarregando(false);
      }
    }

    void buscarHistorico();
  }, []);

  function formatarData(data: Date): string {
    return data.toLocaleString("pt-BR");
  }

  return (
    <SafeAreaView style={styles.areaSegura}>
      <View style={styles.container}>
        <Text style={styles.titulo}>
          Movimentações
        </Text>

        <Text style={styles.subtitulo}>
          Acompanhe as entradas e saídas do estoque.
        </Text>

        <View style={styles.card}>
          <Text style={styles.tituloCard}>
            Histórico de movimentações
          </Text>

          {carregando ? (
            <View style={styles.estado}>
              <ActivityIndicator
                size="large"
                color="#2563eb"
              />

              <Text style={styles.mensagem}>
                Carregando histórico...
              </Text>
            </View>
          ) : erro !== null ? (
            <Text style={styles.erro}>
              {erro}
            </Text>
          ) : movimentacoes.length === 0 ? (
            <Text style={styles.vazio}>
              Nenhuma movimentação disponível.
            </Text>
          ) : (
            <FlatList
              data={movimentacoes}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <Text style={styles.tipo}>
                    {item.tipo === "entrada"
                      ? "Entrada de estoque"
                      : "Saída de estoque"}
                  </Text>

                  <Text style={styles.detalhe}>
                    Produto ID: {item.id_produto}
                  </Text>

                  <Text style={styles.detalhe}>
                    Quantidade: {item.quantidade}
                  </Text>

                  <Text style={styles.data}>
                    {formatarData(item.data)}
                  </Text>
                </View>
              )}
            />
          )}
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
  },
  subtitulo: {
    color: "#555",
    fontSize: 15,
    marginTop: 5,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 12,
  },
  tituloCard: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f1a2e",
    marginBottom: 14,
  },
  estado: {
    alignItems: "center",
    padding: 20,
  },
  mensagem: {
    color: "#555",
    marginTop: 10,
  },
  vazio: {
    fontSize: 15,
    color: "#666",
    marginBottom: 12,
  },
  erro: {
    fontSize: 14,
    color: "#b91c1c",
    lineHeight: 21,
  },
  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tipo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f1a2e",
    marginBottom: 6,
  },
  detalhe: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },
  data: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
});
