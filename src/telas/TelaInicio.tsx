import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface TelaInicioProps {
  aoAbrirProdutos: () => void;
  aoAbrirCadastro: () => void;
  aoAbrirMovimentacoes: () => void;
}

export function TelaInicio({
  aoAbrirProdutos,
  aoAbrirCadastro,
  aoAbrirMovimentacoes,
}: TelaInicioProps) {
  return (
    <SafeAreaView style={styles.areaSegura}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Estok</Text>

        <Text style={styles.subtitulo}>
          Gerenciador de Estoque Comercial
        </Text>

        <View style={styles.card}>
          <Text style={styles.tituloCard}>
            Bem-vindo ao Estok!
          </Text>

          <Text style={styles.texto}>
            Gerencie seus produtos agrícolas e acompanhe
            as informações do seu estoque.
          </Text>
        </View>

        <Text style={styles.tituloSecao}>
          Acesso rápido
        </Text>

        <Pressable
          style={styles.botao}
          onPress={aoAbrirProdutos}
        >
          <Text style={styles.textoBotao}>
            Consultar produtos
          </Text>
        </Pressable>

        <Pressable
          style={styles.botaoSecundario}
          onPress={aoAbrirCadastro}
        >
          <Text style={styles.textoBotaoSecundario}>
            Cadastrar produto
          </Text>
        </Pressable>

        <Pressable
          style={styles.botaoSecundario}
          onPress={aoAbrirMovimentacoes}
        >
          <Text style={styles.textoBotaoSecundario}>
            Movimentações do estoque
          </Text>
        </Pressable>
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
    fontSize: 30,
    fontWeight: "bold",
    color: "#0f1a2e",
  },
  subtitulo: {
    fontSize: 15,
    color: "#555",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  tituloCard: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f1a2e",
    marginBottom: 10,
  },
  texto: {
    fontSize: 16,
    lineHeight: 23,
    color: "#555",
  },
  tituloSecao: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#0f1a2e",
    marginBottom: 12,
  },
  botao: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  textoBotao: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  botaoSecundario: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2563eb",
    marginBottom: 12,
  },
  textoBotaoSecundario: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "bold",
  },
});