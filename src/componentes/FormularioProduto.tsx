import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { Produto } from "../types/produto";

interface FormularioProdutoProps {
  aoCriarProduto: (produto: Produto) => void;
  proximoId: number;
}

export default function FormularioProduto({
  aoCriarProduto,
  proximoId,
}: FormularioProdutoProps) {
  const [nome, setNome] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [categoria, setCategoria] = useState("");

  function criarProduto() {
    if (
      nome.trim() === "" ||
      codigoBarras.trim() === "" ||
      precoVenda.trim() === "" ||
      categoria.trim() === ""
    ) {
      return;
    }

    const novoProduto: Produto = {
      id: proximoId,
      nome: nome.trim(),
      codigo_barras: codigoBarras.trim(),
      preco_venda: Number(precoVenda.replace(",", ".")),
      id_categoria: Number(categoria),
      ativo: true,
    };

    aoCriarProduto(novoProduto);

    setNome("");
    setCodigoBarras("");
    setPrecoVenda("");
    setCategoria("");
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
