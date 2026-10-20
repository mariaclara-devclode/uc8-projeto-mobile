import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Botao } from "../componentes/Botao";
import { carregarMovimentacoes } from "../servicos/movimentacao";

import type { EstadoTela } from "../types/estadoTela";
import type { Movimentacao } from "../types/movimentacao";

import { cores, espacos, raio } from "../tema/tema";

function formatarData(data: Date): string {
  return data.toLocaleString("pt-BR");
}

export function TelaMovimentacoes() {
  const [estado, setEstado] = useState<EstadoTela<Movimentacao[]>>({
    status: "carregando",
  });

  const buscarHistorico = useCallback(async () => {
    setEstado({ status: "carregando" });

    try {
      const dados = await carregarMovimentacoes();

      setEstado({ status: "pronto", dados });
    } catch (erro: unknown) {
      console.error(erro);

      setEstado({
        status: "erro",
        mensagem: "Não foi possível carregar as movimentações.",
      });
    }
  }, []);

  useEffect(() => {
    void buscarHistorico();
  }, [buscarHistorico]);

  return (
    <SafeAreaView style={styles.areaSegura}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Movimentações</Text>

        <Text style={styles.subtitulo}>
          Acompanhe as entradas e saídas do estoque.
        </Text>

        <View style={styles.card}>
          <Text style={styles.tituloCard}>Histórico de movimentações</Text>

          {estado.status === "carregando" ? (
            <View style={styles.estado}>
              <ActivityIndicator size="large" color={cores.primaria} />

              <Text style={styles.mensagem}>Carregando histórico...</Text>
            </View>
          ) : estado.status === "erro" ? (
            <View>
              <Text style={styles.erro}>{estado.mensagem}</Text>

              <View style={styles.botaoTentarNovamente}>
                <Botao
                  titulo="Tentar novamente"
                  onPress={() => void buscarHistorico()}
                />
              </View>
            </View>
          ) : (
            <FlatList
              data={estado.dados}
              keyExtractor={(item) => String(item.id)}
              ListEmptyComponent={
                <Text style={styles.vazio}>
                  Nenhuma movimentação disponível.
                </Text>
              }
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

                  <Text style={styles.data}>{formatarData(item.data)}</Text>
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
    color: cores.textoSecundario,
    fontSize: 15,
    marginTop: espacos.xs,
    marginBottom: espacos.md,
  },
  card: {
    flex: 1,
    backgroundColor: cores.superficie,
    padding: espacos.md,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  tituloCard: {
    fontSize: 18,
    fontWeight: "bold",
    color: cores.texto,
    marginBottom: espacos.md,
  },
  estado: {
    alignItems: "center",
    padding: espacos.lg,
  },
  mensagem: {
    color: cores.textoSecundario,
    marginTop: espacos.sm,
  },
  vazio: {
    fontSize: 15,
    color: cores.textoSecundario,
    textAlign: "center",
    marginTop: espacos.md,
  },
  erro: {
    fontSize: 14,
    color: cores.erro,
    lineHeight: 21,
  },
  botaoTentarNovamente: {
    flexDirection: "row",
    marginTop: espacos.md,
  },
  item: {
    paddingVertical: espacos.md,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  tipo: {
    fontSize: 16,
    fontWeight: "bold",
    color: cores.texto,
    marginBottom: 6,
  },
  detalhe: {
    fontSize: 14,
    color: cores.textoSecundario,
    marginBottom: espacos.xs,
  },
  data: {
    fontSize: 13,
    color: cores.textoSecundario,
    marginTop: espacos.xs,
  },
});