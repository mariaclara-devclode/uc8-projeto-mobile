import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";

import FormularioProduto from "../componentes/FormularioProduto";
import { cadastrarProduto } from "../servicos/produto";
import type { Produto } from "../types/produto";

export function TelaCadastroProduto() {
  const [salvando, setSalvando] = useState(false);

  async function salvarProduto(produto: Produto) {
    if (salvando) {
      return;
    }

    setSalvando(true);

    try {
      await cadastrarProduto(produto);

      Alert.alert(
        "Cadastro realizado",
        "O produto foi cadastrado com sucesso."
      );
    } catch (erro: unknown) {
      console.error(erro);

      Alert.alert(
        "Erro",
        "Não foi possível cadastrar o produto. Verifique a API e tente novamente."
      );
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

        {salvando && (
          <Text style={styles.aviso}>
            Salvando produto...
          </Text>
        )}

        <FormularioProduto
          aoCriarProduto={salvarProduto}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: "#eef1f6",
  },
  container: {
    padding: 20,
    paddingBottom: 32,
  },
  titulo: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#0f1a2e",
  },
  subtitulo: {
    fontSize: 15,
    color: "#555",
    marginTop: 5,
    marginBottom: 20,
  },
  aviso: {
    color: "#2563eb",
    marginBottom: 12,
  },
});