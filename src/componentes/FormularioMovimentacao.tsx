import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Botao } from "./Botao";
import { Campo } from "./Campo";

import { registrarErro } from "../erros/erros";
import type { NovaMovimentacao } from "../servicos/movimentacao";
import type { Produto } from "../types/produto";

import { cores, espacos, raio } from "../tema/tema";

interface FormularioMovimentacaoProps {
  produtos: Produto[];
  saldoDoProduto: (idProduto: number) => number | null;
  aoRegistrar: (dados: NovaMovimentacao) => Promise<void>;
}

export function FormularioMovimentacao({
  produtos,
  saldoDoProduto,
  aoRegistrar,
}: FormularioMovimentacaoProps) {
  const [produtoSelecionado, setProdutoSelecionado] =
    useState<Produto | null>(null);
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");
  const [quantidade, setQuantidade] = useState("");
  const [seletorAberto, setSeletorAberto] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const saldo =
    produtoSelecionado !== null ? saldoDoProduto(produtoSelecionado.id) : null;

  async function registrar() {
    setErro("");

    if (produtoSelecionado === null) {
      setErro("Selecione um produto.");
      return;
    }

    const quantidadeNumero = Number(quantidade.trim());

    if (
      quantidade.trim() === "" ||
      !Number.isInteger(quantidadeNumero) ||
      quantidadeNumero <= 0
    ) {
      setErro("Informe uma quantidade inteira maior que zero.");
      return;
    }

    setSalvando(true);

    try {
      await aoRegistrar({
        id_produto: produtoSelecionado.id,
        quantidade: quantidadeNumero,
        tipo,
      });

      setQuantidade("");
    } catch (erroRecebido: unknown) {
      // Validação mostra a própria mensagem; rede e servidor mostram a
      // mensagem do tipo de erro. O detalhe técnico vai só para o console.
      setErro(registrarErro("movimentação", erroRecebido).mensagem);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={estilos.formulario}>
      <Text style={estilos.titulo}>Registrar movimentação</Text>

      <Text style={estilos.rotulo}>Produto</Text>

      <Pressable
        accessibilityRole="button"
        style={estilos.seletor}
        onPress={() => setSeletorAberto(true)}
      >
        <Text
          style={
            produtoSelecionado !== null
              ? estilos.seletorTexto
              : estilos.seletorPlaceholder
          }
        >
          {produtoSelecionado !== null
            ? produtoSelecionado.nome
            : "Toque para escolher um produto"}
        </Text>
      </Pressable>

      {produtoSelecionado !== null && (
        <Text style={estilos.saldo}>
          Estoque atual:{" "}
          {saldo !== null ? `${saldo} unidades` : "carregando..."}
        </Text>
      )}

      <Text style={estilos.rotulo}>Tipo</Text>

      <View style={estilos.linhaTipos}>
        <Pressable
          accessibilityRole="button"
          style={[
            estilos.tipo,
            tipo === "entrada" && estilos.tipoSelecionado,
          ]}
          onPress={() => setTipo("entrada")}
        >
          <Text
            style={[
              estilos.tipoTexto,
              tipo === "entrada" && estilos.tipoTextoSelecionado,
            ]}
          >
            Entrada
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={[estilos.tipo, tipo === "saida" && estilos.tipoSelecionado]}
          onPress={() => setTipo("saida")}
        >
          <Text
            style={[
              estilos.tipoTexto,
              tipo === "saida" && estilos.tipoTextoSelecionado,
            ]}
          >
            Saída
          </Text>
        </Pressable>
      </View>

      <Campo
        rotulo="Quantidade"
        valor={quantidade}
        aoMudar={setQuantidade}
        tipoDeTeclado="numeric"
      />

      {erro !== "" && <Text style={estilos.erro}>{erro}</Text>}

      <View style={estilos.linhaBotao}>
        <Botao
          titulo={salvando ? "Salvando..." : "Registrar"}
          onPress={() => void registrar()}
          desabilitado={salvando}
        />
      </View>

      <Modal
        visible={seletorAberto}
        animationType="slide"
        transparent
        onRequestClose={() => setSeletorAberto(false)}
      >
        <View style={estilos.fundoModal}>
          <View style={estilos.folhaModal}>
            <Text style={estilos.tituloModal}>Escolha o produto</Text>

            <FlatList
              data={produtos}
              keyExtractor={(item) => String(item.id)}
              ListEmptyComponent={
                <Text style={estilos.vazio}>
                  Nenhum produto disponível. Só produtos já enviados à nuvem
                  recebem movimentação.
                </Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  style={estilos.itemProduto}
                  onPress={() => {
                    setProdutoSelecionado(item);
                    setSeletorAberto(false);
                  }}
                >
                  <Text style={estilos.itemProdutoTexto}>{item.nome}</Text>
                </Pressable>
              )}
            />

            <Pressable
              accessibilityRole="button"
              style={estilos.fechar}
              onPress={() => setSeletorAberto(false)}
            >
              <Text style={estilos.fecharTexto}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  formulario: {
    backgroundColor: cores.superficie,
    padding: espacos.md,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.borda,
    marginBottom: espacos.md,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: cores.texto,
    marginBottom: espacos.sm,
  },
  rotulo: {
    color: cores.textoSecundario,
    marginBottom: espacos.xs,
  },
  seletor: {
    backgroundColor: cores.superficie,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.sm + espacos.xs,
    marginBottom: espacos.sm,
  },
  seletorTexto: {
    color: cores.texto,
  },
  seletorPlaceholder: {
    color: cores.textoSecundario,
  },
  saldo: {
    color: cores.primaria,
    fontWeight: "bold",
    marginBottom: espacos.sm,
  },
  linhaTipos: {
    flexDirection: "row",
    gap: espacos.sm,
    marginBottom: espacos.sm,
  },
  tipo: {
    flex: 1,
    alignItems: "center",
    padding: espacos.sm + espacos.xs,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.primaria,
    backgroundColor: cores.superficie,
  },
  tipoSelecionado: {
    backgroundColor: cores.primaria,
  },
  tipoTexto: {
    color: cores.primaria,
    fontWeight: "bold",
  },
  tipoTextoSelecionado: {
    color: cores.textoClaro,
  },
  erro: {
    color: cores.erro,
    backgroundColor: "#FEE2E2",
    borderRadius: raio,
    padding: espacos.sm,
    marginBottom: espacos.sm,
  },
  linhaBotao: {
    flexDirection: "row",
  },
  fundoModal: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  folhaModal: {
    maxHeight: "70%",
    backgroundColor: cores.superficie,
    padding: espacos.md,
    borderTopLeftRadius: raio,
    borderTopRightRadius: raio,
  },
  tituloModal: {
    fontSize: 18,
    fontWeight: "bold",
    color: cores.texto,
    marginBottom: espacos.sm,
  },
  itemProduto: {
    paddingVertical: espacos.sm + espacos.xs,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  itemProdutoTexto: {
    fontSize: 16,
    color: cores.texto,
  },
  vazio: {
    color: cores.textoSecundario,
    paddingVertical: espacos.md,
  },
  fechar: {
    alignItems: "center",
    padding: espacos.md,
  },
  fecharTexto: {
    color: cores.primaria,
    fontWeight: "bold",
  },
});