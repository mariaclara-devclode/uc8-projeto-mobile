import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { CartaoProduto } from "../componentes/CartaoProduto";
import FormularioProduto from "../componentes/FormularioProduto";
import {
  carregarProdutos,
  cadastrarProduto,
} from "../servicos/produto";
import type { Produto } from "../types/produto";
import type { RotasDaPilha } from "../navegacao/tipos";

type TelaProdutosProps = NativeStackScreenProps<
  RotasDaPilha,
  "Produtos"
>;

export function TelaProdutos({
  navigation,
}: TelaProdutosProps) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarProdutos()
      .then((produtosCarregados) => {
        setProdutos(produtosCarregados);
      })
      .catch((erro) => {
        console.error(erro);
        setErro("Não foi possível carregar os produtos.");
      })
      .finally(() => {
        setCarregando(false);
      });
  }, []);

  async function adicionarProduto(produto: Produto) {
    try {
      setErro("");

      const novoProduto = await cadastrarProduto(produto);

      setProdutos((produtosAtuais) => [
        ...produtosAtuais,
        novoProduto,
      ]);

      setMostrarFormulario(false);
    } catch (erro) {
      console.error(erro);
      setErro("Não foi possível cadastrar o produto.");
    }
  }

  return (
    <SafeAreaView style={styles.areaSegura}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Estok</Text>

        <Text style={styles.subtitulo}>
          Gerenciador de Estoque Comercial
        </Text>

        <View style={styles.resumo}>
          <Text style={styles.resumoTitulo}>
            Resumo do Estoque
          </Text>

          <Text style={styles.resumoTexto}>
            Produtos cadastrados: {produtos.length}
          </Text>
        </View>

        <Pressable
          style={styles.botaoFormulario}
          onPress={() =>
            setMostrarFormulario(!mostrarFormulario)
          }
        >
          <Text style={styles.textoBotao}>
            {mostrarFormulario
              ? "Fechar cadastro"
              : "Cadastrar produto"}
          </Text>
        </Pressable>

        {mostrarFormulario && (
          <FormularioProduto
            aoCriarProduto={adicionarProduto}
          />
        )}

        {erro !== "" && (
          <Text style={styles.erro}>{erro}</Text>
        )}

        {carregando ? (
          <ActivityIndicator
            size="large"
            style={styles.carregando}
          />
        ) : (
          <FlatList
            data={produtos}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.lista}
            ListEmptyComponent={
              <Text style={styles.vazio}>
                Nenhum produto cadastrado.
              </Text>
            }
            renderItem={({ item }) => (
              <CartaoProduto
                produto={item}
                aoVerDetalhes={(id) =>
                  navigation.navigate(
                    "DetalheProduto",
                    { id }
                  )
                }
              />
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
    backgroundColor: "#eef1f6",
  },

  container: {
    flex: 1,
    padding: 16,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f1a2e",
  },

  subtitulo: {
    fontSize: 15,
    color: "#555",
    marginTop: 2,
    marginBottom: 16,
  },

  resumo: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  resumoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f1a2e",
    marginBottom: 6,
  },

  resumoTexto: {
    fontSize: 15,
    color: "#555",
  },

  botaoFormulario: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },

  textoBotao: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  erro: {
    color: "#b91c1c",
    backgroundColor: "#fee2e2",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  carregando: {
    marginTop: 30,
  },

  lista: {
    paddingBottom: 20,
  },

  vazio: {
    textAlign: "center",
    color: "#666",
    marginTop: 30,
    fontSize: 16,
  },
});