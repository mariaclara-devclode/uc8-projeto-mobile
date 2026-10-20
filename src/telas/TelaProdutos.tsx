import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import { Botao } from "../componentes/Botao";
import { CartaoProduto } from "../componentes/CartaoProduto";

import { useEstadoApp } from "../contexto/EstadoAppContext";

import type { RotasDaPilha, RotasDasAbas } from "../navegacao/tipos";

import { cores, espacos, larguraLarga } from "../tema/tema";

type Props = NativeStackScreenProps<RotasDaPilha, "Produtos">;

type NavegacaoAbas = BottomTabNavigationProp<RotasDasAbas>;

export function TelaProdutos({ navigation }: Props) {
  const { width } = useWindowDimensions();

  const duasColunas = width >= larguraLarga;

  const navegacaoAbas = useNavigation<NavegacaoAbas>();

  // A lista agora vem do contexto: carrega uma vez, e o cadastro e a
  // sincronização atualizam a mesma lista para todas as telas.
  const { conectado, produtos, recarregarProdutos } = useEstadoApp();

  const offline = !conectado;

  return (
    <SafeAreaView style={styles.areaSegura}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Produtos</Text>

        <Text style={styles.subtitulo}>
          Consulte os produtos cadastrados no Estok.
        </Text>

        {offline && (
          <Text style={styles.avisoOffline}>
            Sem conexão com a internet. Os dados locais serão exibidos, se
            disponíveis.
          </Text>
        )}

        <View style={styles.botoes}>
          <Botao
            titulo="Recarregar"
            variante="secundario"
            onPress={() => void recarregarProdutos()}
            desabilitado={produtos.status === "carregando"}
          />

          <Botao
            titulo="Cadastrar produto"
            onPress={() => navegacaoAbas.navigate("AbaCadastro")}
          />
        </View>

        {produtos.status === "carregando" ? (
          <View style={styles.estado}>
            <ActivityIndicator size="large" color={cores.primaria} />

            <Text style={styles.textoEstado}>Carregando produtos...</Text>
          </View>
        ) : produtos.status === "erro" ? (
          <View style={styles.estado}>
            <Text style={styles.erro}>{produtos.mensagem}</Text>

            <View style={styles.botaoTentarNovamente}>
              <Botao
                titulo="Tentar novamente"
                onPress={() => void recarregarProdutos()}
              />
            </View>
          </View>
        ) : (
          <FlatList
            key={duasColunas ? "duas-colunas" : "uma-coluna"}
            data={produtos.dados}
            keyExtractor={(item) => String(item.id)}
            numColumns={duasColunas ? 2 : 1}
            columnWrapperStyle={duasColunas ? styles.linhaDeColunas : undefined}
            contentContainerStyle={styles.lista}
            ListEmptyComponent={
              <Text style={styles.vazio}>Nenhum produto cadastrado.</Text>
            }
            renderItem={({ item }) => (
              <View
                style={
                  duasColunas ? styles.itemDuasColunas : styles.itemUmaColuna
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

  avisoOffline: {
    color: "#92400E",
    backgroundColor: "#FEF3C7",
    padding: espacos.sm,
    borderRadius: 8,
    marginBottom: espacos.md,
  },

  botoes: {
    flexDirection: "row",
    gap: espacos.sm,
    marginBottom: espacos.md,
  },

  botaoTentarNovamente: {
    marginTop: espacos.md,
    width: "100%",
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
    textAlign: "center",
  },
});