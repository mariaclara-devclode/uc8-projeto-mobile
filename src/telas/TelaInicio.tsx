import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useEstadoApp } from "../contexto/EstadoAppContext";
import { cores, espacos, raio } from "../tema/tema";

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
  const { produtos } = useEstadoApp();

  return (
    <SafeAreaView style={styles.areaSegura}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Estok</Text>

        <Text style={styles.subtitulo}>Gerenciador de Estoque Comercial</Text>

        <View style={styles.card}>
          <Text style={styles.tituloCard}>Resumo do estoque</Text>

          {produtos.status === "carregando" ? (
            <Text style={styles.texto}>Carregando resumo...</Text>
          ) : produtos.status === "erro" ? (
            <Text style={styles.texto}>Resumo indisponível no momento.</Text>
          ) : (
            <>
              <Text style={styles.texto}>
                Produtos cadastrados: {produtos.dados.length}
              </Text>

              <Text style={styles.texto}>
                Produtos ativos:{" "}
                {produtos.dados.filter((produto) => produto.ativo).length}
              </Text>

              <Text style={styles.texto}>
                Aguardando sincronização:{" "}
                {produtos.dados.filter((produto) => produto.id < 0).length}
              </Text>
            </>
          )}
        </View>

        <Text style={styles.tituloSecao}>Acesso rápido</Text>

        <Pressable style={styles.botao} onPress={aoAbrirProdutos}>
          <Text style={styles.textoBotao}>Consultar produtos</Text>
        </Pressable>

        <Pressable style={styles.botaoSecundario} onPress={aoAbrirCadastro}>
          <Text style={styles.textoBotaoSecundario}>Cadastrar produto</Text>
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
    backgroundColor: cores.fundo,
  },
  container: {
    flex: 1,
    padding: espacos.md,
  },
  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    color: cores.texto,
  },
  subtitulo: {
    fontSize: 15,
    color: cores.textoSecundario,
    marginBottom: espacos.lg,
  },
  card: {
    backgroundColor: cores.superficie,
    padding: espacos.md,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.borda,
    marginBottom: espacos.lg,
    gap: espacos.xs,
  },
  tituloCard: {
    fontSize: 20,
    fontWeight: "bold",
    color: cores.texto,
    marginBottom: espacos.xs,
  },
  texto: {
    fontSize: 16,
    lineHeight: 23,
    color: cores.textoSecundario,
  },
  tituloSecao: {
    fontSize: 19,
    fontWeight: "bold",
    color: cores.texto,
    marginBottom: espacos.sm,
  },
  botao: {
    backgroundColor: cores.primaria,
    padding: espacos.md,
    borderRadius: raio,
    alignItems: "center",
    marginBottom: espacos.sm,
  },
  textoBotao: {
    color: cores.textoClaro,
    fontSize: 16,
    fontWeight: "bold",
  },
  botaoSecundario: {
    backgroundColor: cores.superficie,
    padding: espacos.md,
    borderRadius: raio,
    alignItems: "center",
    borderWidth: 1,
    borderColor: cores.primaria,
    marginBottom: espacos.sm,
  },
  textoBotaoSecundario: {
    color: cores.primaria,
    fontSize: 16,
    fontWeight: "bold",
  },
});