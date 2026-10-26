import { useCallback, useState } from "react";
import {
  Alert,
  PixelRatio,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { contarDadosLocais, limparCacheLocal } from "../banco/bancoLocal";
import { useEstadoApp } from "../contexto/EstadoAppContext";
import { registrarErro } from "../erros/erros";

import { cores, espacos, raio } from "../tema/tema";

export function TelaSobre() {
  const { width, height, fontScale } = useWindowDimensions();

  const { recarregarProdutos, recarregarMovimentacoes } = useEstadoApp();

  // "..." enquanto lê; "indisponível" se o banco falhar.
  const [produtosGuardados, setProdutosGuardados] = useState("...");
  const [movimentacoesGuardadas, setMovimentacoesGuardadas] = useState("...");
  const [pendentes, setPendentes] = useState("...");

  const atualizarContagens = useCallback(async () => {
    try {
      const resumo = await contarDadosLocais();

      setProdutosGuardados(String(resumo.produtos));
      setMovimentacoesGuardadas(String(resumo.movimentacoes));
      setPendentes(String(resumo.pendentes));
    } catch (erro: unknown) {
      registrarErro("contagem do aparelho", erro);

      setProdutosGuardados("indisponível");
      setMovimentacoesGuardadas("indisponível");
      setPendentes("indisponível");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void atualizarContagens();
    }, [atualizarContagens]),
  );

  function confirmarLimpeza() {
    Alert.alert(
      "Apagar dados do aparelho?",
      "Isso apaga a cópia de produtos e movimentações guardada neste aparelho. O que está no Supabase não é apagado. O que foi cadastrado sem conexão e ainda não foi enviado é mantido.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: () => void limpar(),
        },
      ],
    );
  }

  async function limpar() {
    try {
      await limparCacheLocal();
    } catch (erro: unknown) {
      Alert.alert(
        "Não foi possível apagar",
        registrarErro("limpeza do aparelho", erro).mensagem,
      );
      return;
    }

    await atualizarContagens();

    // Busca de novo na nuvem, se houver conexão.
    void recarregarProdutos();
    void recarregarMovimentacoes();
  }

  return (
    <SafeAreaView style={styles.areaSegura}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Estok</Text>

        <Text style={styles.subtitulo}>Gerenciador de Estoque Comercial</Text>

        <View style={styles.card}>
          <Text style={styles.tituloCard}>Sobre o aplicativo</Text>

          <Text style={styles.texto}>
            O Estok é um aplicativo mobile para gerenciamento de produtos e
            controle de estoque.
          </Text>

          <Text style={styles.texto}>
            Este aplicativo é um recorte do sistema desenvolvido no projeto da
            UC5.
          </Text>

          <Text style={styles.texto}>
            Desenvolvido como atividade do curso Técnico em Desenvolvimento de
            Sistemas do SENAC.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.tituloCard}>Dados neste aparelho</Text>

          <Text style={styles.texto}>
            Produtos guardados: {produtosGuardados}
          </Text>

          <Text style={styles.texto}>
            Movimentações guardadas: {movimentacoesGuardadas}
          </Text>

          <Text style={styles.texto}>
            Aguardando envio ao Supabase: {pendentes}
          </Text>

          <Pressable
            accessibilityRole="button"
            style={styles.botaoApagar}
            onPress={confirmarLimpeza}
          >
            <Text style={styles.textoBotaoApagar}>
              Apagar dados do aparelho
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.tituloCard}>Informações da tela</Text>

          <Text style={styles.texto}>
            Largura da janela: {width.toFixed(0)} dp
          </Text>

          <Text style={styles.texto}>
            Altura da janela: {height.toFixed(0)} dp
          </Text>

          <Text style={styles.texto}>
            Densidade da tela: {PixelRatio.get().toFixed(2)}
          </Text>

          <Text style={styles.texto}>
            Escala da fonte: {fontScale.toFixed(2)}
          </Text>
        </View>
      </ScrollView>
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
    gap: espacos.md,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: cores.texto,
  },

  subtitulo: {
    fontSize: 15,
    color: cores.textoSecundario,
    marginTop: -espacos.sm,
    marginBottom: espacos.xs,
  },

  card: {
    backgroundColor: cores.superficie,
    padding: espacos.md,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.borda,
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
    lineHeight: 24,
    color: cores.textoSecundario,
  },

  botaoApagar: {
    marginTop: espacos.sm,
    padding: espacos.sm + espacos.xs,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.erro,
    alignItems: "center",
  },

  textoBotaoApagar: {
    color: cores.erro,
    fontWeight: "bold",
  },
});