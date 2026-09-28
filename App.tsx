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

import CartaoProduto from "./src/componentes/CartaoProduto";
import FormularioProduto from "./src/componentes/FormularioProduto";
import { carregarProdutos } from "./src/servicos/produto";
import type { Produto } from "./src/types/produto";

export default function App() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    carregarProdutos()
      .then((dados) => {
        setProdutos(dados);
      })
      .finally(() => {
        setCarregando(false);
      });
  }, []);

  function adicionarProduto(novoProduto: Produto) {
    setProdutos((produtosAtuais) => [...produtosAtuais, novoProduto]);

    setMostrarFormulario(false);
  }

  function obterProximoId(): number {
    if (produtos.length === 0) {
      return 1;
    }

    const maiorId = Math.max(...produtos.map((produto) => produto.id));

    return maiorId + 1;
  }

  const produtosAtivos = produtos.filter((produto) => produto.ativo).length;

  return (
    <SafeAreaView style={styles.tela}>
      <FlatList
        data={carregando ? [] : produtos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CartaoProduto produto={item} />}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <>
            {/* CABEÇALHO */}
            <View style={styles.cabecalho}>
              <Text style={styles.logo}>ESTOK</Text>

              <Text style={styles.slogan}>
                Gerenciador de Estoque Comercial
              </Text>
            </View>

            {/* APRESENTAÇÃO */}
            <View style={styles.apresentacao}>
              <Text style={styles.titulo}>Bem-vindo ao Estok!</Text>

              <Text style={styles.descricao}>
                Acompanhe e organize seus produtos em um só lugar.
              </Text>
            </View>

            {/* CAMUFLAGEM DO ESTOQUE PARA RESUMIR ATIVIDADE */}
            <View style={styles.resumo}>
              <View style={styles.cartaoResumo}>
                <Text style={styles.numero}>{produtos.length}</Text>

                <Text style={styles.label}>Produtos</Text>
              </View>

              <View style={styles.cartaoResumo}>
                <Text style={styles.numero}>{produtosAtivos}</Text>

                <Text style={styles.label}>Produtos ativos</Text>
              </View>
            </View>

            {/* BOTÃO DE CADASTRO */}
            <Pressable
              style={({ pressed }) => [
                styles.botaoCadastrar,
                pressed && styles.botaoPressionado,
              ]}
              onPress={() => setMostrarFormulario(!mostrarFormulario)}
            >
              <Text style={styles.iconeBotao}>
                {mostrarFormulario ? "×" : "+"}
              </Text>

              <Text style={styles.textoBotao}>
                {mostrarFormulario ? "Fechar cadastro" : "Cadastrar produto"}
              </Text>
            </Pressable>

            {/* FORMULÁRIO */}
            {mostrarFormulario && (
              <FormularioProduto
                aoCriarProduto={adicionarProduto}
                proximoId={obterProximoId()}
              />
            )}

            {/* TÍTULO DA LISTA */}
            <View style={styles.tituloLista}>
              <Text style={styles.tituloProdutos}>Produtos cadastrados</Text>

              <View style={styles.contador}>
                <Text style={styles.textoContador}>{produtos.length}</Text>
              </View>
            </View>

            {/* CARREGAMENTO */}
            {carregando && (
              <View style={styles.carregando}>
                <ActivityIndicator size="large" />

                <Text style={styles.textoCarregando}>
                  Carregando produtos...
                </Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !carregando ? (
            <Text style={styles.listaVazia}>Nenhum produto cadastrado.</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#f3f5f7",
  },

  lista: {
    padding: 16,
    paddingBottom: 30,
  },

  /* CABEÇALHO */

  cabecalho: {
    marginBottom: 18,
  },

  logo: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f1a2e",
    letterSpacing: 1,
  },

  slogan: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  /* APRESENTAÇÃO */

  apresentacao: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e5e9",
  },

  titulo: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0f1a2e",
    marginBottom: 5,
  },

  descricao: {
    fontSize: 12,
    lineHeight: 17,
    color: "#6b7280",
  },

  /* CAMUFLAGEM DO ESTOQUE PARA RESUMIR ATIVIDADE */

  resumo: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },

  cartaoResumo: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e5e9",
  },

  numero: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2563eb",
  },

  label: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  /* BOTÃO */

  botaoCadastrar: {
    height: 46,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  botaoPressionado: {
    opacity: 0.8,
  },

  iconeBotao: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "400",
    marginRight: 7,
  },

  textoBotao: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },

  /* LISTA */

  tituloLista: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  tituloProdutos: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  contador: {
    minWidth: 28,
    height: 26,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },

  textoContador: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563eb",
  },

  /* CARREGAMENTO */

  carregando: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },

  textoCarregando: {
    marginTop: 10,
    fontSize: 14,
    color: "#6b7280",
  },

  listaVazia: {
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
    paddingVertical: 30,
  },
});
