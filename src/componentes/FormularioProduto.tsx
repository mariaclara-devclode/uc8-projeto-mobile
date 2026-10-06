import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { Produto } from "../types/produto";

interface FormularioProdutoProps {
  aoCriarProduto: (produto: Produto) => Promise<void>;
}

export default function FormularioProduto({
  aoCriarProduto,
}: FormularioProdutoProps) {
  const [nome, setNome] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [categoria, setCategoria] = useState("");

  const [erro, setErro] = useState("");

  async function criarProduto() {
    setErro("");

    if (
      nome.trim() === "" ||
      codigoBarras.trim() === "" ||
      precoVenda.trim() === "" ||
      categoria.trim() === ""
    ) {
      setErro("Preencha todos os campos do produto.");
      return;
    }

    const preco = Number(precoVenda.replace(",", "."));

    const idCategoria = Number(categoria);

    if (!Number.isFinite(preco) || preco <= 0) {
      setErro("Informe um preço válido.");
      return;
    }

    if (!Number.isInteger(idCategoria) || idCategoria <= 0) {
      setErro("Informe uma categoria válida.");
      return;
    }

    const novoProduto: Produto = {
      id: 0,
      nome: nome.trim(),
      codigo_barras: codigoBarras.trim(),
      preco_venda: preco,
      id_categoria: idCategoria,
      ativo: true,
    };

    try {
      await aoCriarProduto(novoProduto);

      setNome("");
      setCodigoBarras("");
      setPrecoVenda("");
      setCategoria("");
    } catch {
      setErro("Não foi possível cadastrar o produto.");
    }
  }

  return (
    <View style={styles.formulario}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Novo produto</Text>

        <Text style={styles.descricao}>
          Preencha os dados para adicionar ao estoque.
        </Text>
      </View>

      <View style={styles.linha}>
        <View style={styles.campo}>
          <Text style={styles.label}>Nome</Text>

          <TextInput
            style={styles.input}
            placeholder="Ex.: Semente de milho"
            placeholderTextColor="#9ca3af"
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={styles.campo}>
          <Text style={styles.label}>Código</Text>

          <TextInput
            style={styles.input}
            placeholder="Código de barras"
            placeholderTextColor="#9ca3af"
            value={codigoBarras}
            onChangeText={setCodigoBarras}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.linha}>
        <View style={styles.campo}>
          <Text style={styles.label}>Preço</Text>

          <TextInput
            style={styles.input}
            placeholder="R$ 0,00"
            placeholderTextColor="#9ca3af"
            value={precoVenda}
            onChangeText={setPrecoVenda}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.campo}>
          <Text style={styles.label}>Categoria</Text>

          <TextInput
            style={styles.input}
            placeholder="ID da categoria"
            placeholderTextColor="#9ca3af"
            value={categoria}
            onChangeText={setCategoria}
            keyboardType="numeric"
          />
        </View>
      </View>

      {erro !== "" && <Text style={styles.erro}>{erro}</Text>}

      <Pressable
        style={({ pressed }) => [
          styles.botao,
          pressed && styles.botaoPressionado,
        ]}
        onPress={criarProduto}
      >
        <Text style={styles.textoBotao}>Adicionar produto</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  formulario: {
    backgroundColor: "#ffffff",
    padding: 14,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  cabecalho: {
    marginBottom: 10,
  },

  titulo: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  descricao: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 3,
  },

  linha: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 8,
  },

  campo: {
    flex: 1,
    minWidth: 0,
  },

  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },

  input: {
    height: 38,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 7,
    paddingHorizontal: 8,
    fontSize: 11,
    color: "#111827",
    backgroundColor: "#f9fafb",
  },

  erro: {
    color: "#b91c1c",
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 7,
    padding: 8,
    marginBottom: 8,
    fontSize: 11,
  },

  botao: {
    height: 40,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  botaoPressionado: {
    opacity: 0.8,
  },

  textoBotao: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});
