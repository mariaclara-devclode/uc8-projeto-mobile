import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Botao } from "../componentes/Botao";
import { FormularioMovimentacao } from "../componentes/FormularioMovimentacao";
import { useEstadoApp } from "../contexto/EstadoAppContext";
import { calcularSaldo, type NovaMovimentacao } from "../servicos/movimentacao";

import { cores, espacos, raio } from "../tema/tema";

function formatarData(data: Date): string {
  return data.toLocaleString("pt-BR");
}

export function TelaMovimentacoes() {
  const { produtos, movimentacoes, recarregarMovimentacoes, registrarMovimentacao } =
    useEstadoApp();

  // Só produtos ativos e já enviados à nuvem (id positivo) recebem movimentação.
  const produtosDisponiveis =
    produtos.status === "pronto"
      ? produtos.dados.filter((produto) => produto.ativo && produto.id > 0)
      : [];

  function nomeDoProduto(idProduto: number): string {
    if (produtos.status === "pronto") {
      const encontrado = produtos.dados.find((produto) => produto.id === idProduto);

      if (encontrado) {
        return encontrado.nome;
      }
    }

    return `Produto ${idProduto}`;
  }

  function saldoDoProduto(idProduto: number): number | null {
    return movimentacoes.status === "pronto"
      ? calcularSaldo(movimentacoes.dados, idProduto)
      : null;
  }

  async function registrar(dados: NovaMovimentacao): Promise<void> {
    const resultado = await registrarMovimentacao(dados);

    if (resultado === "offline") {
      Alert.alert(
        "Movimentação salva no aparelho",
        "Ela ficará aguardando a sincronização quando a conexão voltar.",
      );
    } else {
      Alert.alert(
        "Movimentação registrada",
        "O registro foi salvo no Supabase com sucesso.",
      );
    }
  }

  const cabecalho = (
    <View>
      <Text style={styles.titulo}>Movimentações</Text>

      <Text style={styles.subtitulo}>
        Registre e acompanhe as entradas e saídas do estoque.
      </Text>

      <FormularioMovimentacao
        produtos={produtosDisponiveis}
        saldoDoProduto={saldoDoProduto}
        aoRegistrar={registrar}
      />

      <Text style={styles.tituloLista}>Histórico de movimentações</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.areaSegura}>
      <FlatList
        data={movimentacoes.status === "pronto" ? movimentacoes.dados : []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={cabecalho}
        ListEmptyComponent={
          movimentacoes.status === "carregando" ? (
            <View style={styles.estado}>
              <ActivityIndicator size="large" color={cores.primaria} />

              <Text style={styles.mensagem}>Carregando histórico...</Text>
            </View>
          ) : movimentacoes.status === "erro" ? (
            <View>
              <Text style={styles.erro}>{movimentacoes.mensagem}</Text>

              <View style={styles.botaoTentarNovamente}>
                <Botao
                  titulo="Tentar novamente"
                  onPress={() => void recarregarMovimentacoes()}
                />
              </View>
            </View>
          ) : (
            <Text style={styles.vazio}>Nenhuma movimentação disponível.</Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.tipo}>
              {item.tipo === "entrada"
                ? "Entrada de estoque"
                : "Saída de estoque"}
            </Text>

            <Text style={styles.detalhe}>
              Produto: {nomeDoProduto(item.id_produto)}
            </Text>

            <Text style={styles.detalhe}>Quantidade: {item.quantidade}</Text>

            <Text style={styles.data}>{formatarData(item.data)}</Text>

            {item.id < 0 && (
              <Text style={styles.pendente}>Aguardando sincronização</Text>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  container: {
    padding: espacos.md,
    paddingBottom: espacos.lg,
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
  tituloLista: {
    fontSize: 18,
    fontWeight: "bold",
    color: cores.texto,
    marginBottom: espacos.sm,
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
    backgroundColor: cores.superficie,
    padding: espacos.md,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.borda,
    marginBottom: espacos.sm,
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
  pendente: {
    fontSize: 13,
    color: "#92400E",
    marginTop: espacos.xs,
  },
});