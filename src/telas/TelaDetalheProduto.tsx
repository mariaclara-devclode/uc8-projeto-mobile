import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { carregarProdutoPorId } from "../servicos/produto";
import { carregarMovimentacoes } from "../servicos/movimentacao";

import type { EstadoTela } from "../types/estadoTela";
import type { Produto } from "../types/produto";
import type { RotasDaPilha } from "../navegacao/tipos";

import { cores, espacos, raio } from "../tema/tema";

type Props = NativeStackScreenProps<RotasDaPilha, "DetalheProduto">;

interface DadosDetalhe {
  produto: Produto;
  // null = não foi possível calcular (sem dados de movimentação).
  saldo: number | null;
}

// Saldo = soma das entradas menos a soma das saídas do produto.
async function calcularSaldo(idProduto: number): Promise<number | null> {
  try {
    const movimentacoes = await carregarMovimentacoes();

    return movimentacoes
      .filter((movimentacao) => movimentacao.id_produto === idProduto)
      .reduce(
        (total, movimentacao) =>
          movimentacao.tipo === "entrada"
            ? total + movimentacao.quantidade
            : total - movimentacao.quantidade,
        0,
      );
  } catch {
    return null;
  }
}

export function TelaDetalheProduto({ route }: Props) {
  const { id } = route.params;

  const [estado, setEstado] = useState<EstadoTela<DadosDetalhe>>({
    status: "carregando",
  });

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setEstado({ status: "carregando" });

      try {
        const produto = await carregarProdutoPorId(id);

        // Produto criado sem rede (id negativo) ainda não tem movimentações.
        const saldo = id > 0 ? await calcularSaldo(id) : null;

        if (ativo) {
          setEstado({ status: "pronto", dados: { produto, saldo } });
        }
      } catch (erro: unknown) {
        console.error(erro);

        if (ativo) {
          setEstado({
            status: "erro",
            mensagem: "Não foi possível carregar o produto.",
          });
        }
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [id]);

  return (
    <SafeAreaView style={styles.areaSegura}>
      <View style={styles.container}>
        {estado.status === "carregando" ? (
          <View style={styles.centralizado}>
            <ActivityIndicator size="large" color={cores.primaria} />
            <Text style={styles.textoEstado}>Carregando detalhes...</Text>
          </View>
        ) : estado.status === "erro" ? (
          <Text style={styles.erro}>{estado.mensagem}</Text>
        ) : (
          <>
            <Text style={styles.titulo}>{estado.dados.produto.nome}</Text>

            <View style={styles.card}>
              <Text style={styles.rotulo}>Código de barras</Text>
              <Text style={styles.valor}>
                {estado.dados.produto.codigo_barras}
              </Text>

              <Text style={styles.rotulo}>Preço de venda</Text>
              <Text style={styles.preco}>
                R$ {estado.dados.produto.preco_venda.toFixed(2)}
              </Text>

              <Text style={styles.rotulo}>Categoria</Text>
              <Text style={styles.valor}>
                {estado.dados.produto.id_categoria}
              </Text>

              <Text style={styles.rotulo}>Situação</Text>
              <Text
                style={[
                  styles.valor,
                  estado.dados.produto.ativo ? styles.ativo : styles.inativo,
                ]}
              >
                {estado.dados.produto.ativo
                  ? "Produto ativo"
                  : "Produto inativo"}
              </Text>

              <Text style={styles.rotulo}>Estoque atual</Text>
              <Text style={styles.valor}>
                {estado.dados.saldo !== null
                  ? `${estado.dados.saldo} unidades`
                  : id < 0
                    ? "Aguardando sincronização"
                    : "Indisponível"}
              </Text>
            </View>
          </>
        )}
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
    fontSize: 26,
    fontWeight: "bold",
    color: cores.texto,
    marginBottom: espacos.md,
  },
  card: {
    backgroundColor: cores.superficie,
    padding: espacos.md,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  rotulo: {
    color: cores.textoSecundario,
    fontSize: 14,
    marginTop: espacos.md,
    marginBottom: espacos.xs,
  },
  valor: {
    fontSize: 17,
    color: cores.texto,
  },
  preco: {
    fontSize: 22,
    fontWeight: "bold",
    color: cores.primaria,
  },
  ativo: {
    color: cores.sucesso,
    fontWeight: "bold",
  },
  inativo: {
    color: cores.erro,
    fontWeight: "bold",
  },
  centralizado: {
    alignItems: "center",
    marginTop: 30,
  },
  textoEstado: {
    color: cores.textoSecundario,
    marginTop: espacos.sm,
  },
  erro: {
    color: cores.erro,
    fontSize: 16,
  },
});