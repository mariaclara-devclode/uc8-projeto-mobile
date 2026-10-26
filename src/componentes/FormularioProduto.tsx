import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Botao } from "./Botao";
import { Campo } from "./Campo";
import { registrarErro } from "../erros/erros";
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
  const [nomeTocado, setNomeTocado] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const erroNome =
    nomeTocado && nome.trim() === ""
      ? "O nome do produto é obrigatório."
      : undefined;

  async function criarProduto() {
    setNomeTocado(true);
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

    setSalvando(true);

    try {
      await aoCriarProduto(novoProduto);

      setNome("");
      setCodigoBarras("");
      setPrecoVenda("");
      setCategoria("");
      setNomeTocado(false);
    } catch (erroRecebido: unknown) {
      // Validação mostra a própria mensagem; rede e servidor mostram a
      // mensagem do tipo de erro. O detalhe técnico vai só para o console.
      setErro(registrarErro("cadastro de produto", erroRecebido).mensagem);
    } finally {
      setSalvando(false);
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
          <Campo
            rotulo="Nome"
            valor={nome}
            aoMudar={setNome}
            aoPerderFoco={() => setNomeTocado(true)}
            erro={erroNome}
          />
        </View>

        <View style={styles.campo}>
          <Campo
            rotulo="Código"
            valor={codigoBarras}
            aoMudar={setCodigoBarras}
            tipoDeTeclado="numeric"
          />
        </View>
      </View>

      <View style={styles.linha}>
        <View style={styles.campo}>
          <Campo
            rotulo="Preço"
            valor={precoVenda}
            aoMudar={setPrecoVenda}
            tipoDeTeclado="decimal-pad"
          />
        </View>

        <View style={styles.campo}>
          <Campo
            rotulo="Categoria"
            valor={categoria}
            aoMudar={setCategoria}
            tipoDeTeclado="numeric"
          />
        </View>
      </View>

      {erro !== "" && (
        <Text style={styles.erro}>{erro}</Text>
      )}

      <View style={styles.linhaBotoes}>
        <Botao
          titulo={salvando ? "Salvando..." : "Adicionar produto"}
          onPress={criarProduto}
          desabilitado={nome.trim() === "" || salvando}
        />
      </View>
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
  linhaBotoes: {
    flexDirection: "row",
    marginTop: 2,
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
});