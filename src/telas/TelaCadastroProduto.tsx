import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";

import FormularioProduto from "../componentes/FormularioProduto";
import { useEstadoApp } from "../contexto/EstadoAppContext";
import type { Produto } from "../types/produto";

import { cores, espacos } from "../tema/tema";

export function TelaCadastroProduto() {
  const { incluirProduto } = useEstadoApp();

  const [salvando, setSalvando] = useState(false);

  async function salvarProduto(produto: Produto): Promise<void> {
    if (salvando) {
      return;
    }

    setSalvando(true);

    try {
      const resultado = await incluirProduto(produto);

      if (resultado === "offline") {
        Alert.alert(
          "Produto salvo no aparelho",
          "O produto foi salvo localmente e ficará aguardando a sincronização quando a conexão voltar.",
        );
      } else {
        Alert.alert(
          "Cadastro realizado",
          "O produto foi cadastrado no Supabase com sucesso.",
        );
      }
    } catch (erro: unknown) {
      console.error(erro);

      // Relança para o formulário saber que falhou e NÃO apagar o que a
      // pessoa digitou. O formulário mostra a mensagem de erro na tela.
      throw erro;
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.areaSegura}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Cadastrar produto</Text>

        <Text style={styles.subtitulo}>
          Preencha os dados do produto agrícola.
        </Text>

        {salvando && <Text style={styles.aviso}>Salvando produto...</Text>}

        <FormularioProduto aoCriarProduto={salvarProduto} />
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
    paddingBottom: espacos.lg,
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
  aviso: {
    color: cores.primaria,
    marginBottom: espacos.sm,
  },
});