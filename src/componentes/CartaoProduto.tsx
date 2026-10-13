
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Produto } from "../types/produto";
import { cores, espacos, raio } from "../tema/tema";

interface CartaoProdutoProps {
  produto: Produto;
  aoVerDetalhes: (id: number) => void;
}

export function CartaoProduto({
  produto,
  aoVerDetalhes,
}: CartaoProdutoProps) {
  return (
    <View style={styles.cartao}>
      <View style={styles.conteudo}>
        <Text style={styles.nome}>
          {produto.nome}
        </Text>

        <Pressable
          style={styles.botao}
          onPress={() => aoVerDetalhes(produto.id)}
        >
          <Text style={styles.textoBotao}>
            Ver detalhes
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    flex: 1,
    backgroundColor: cores.superficie,
    padding: espacos.md,
    marginBottom: espacos.md,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.borda,
  },

  conteudo: {
    flex: 1,
    flexDirection: "column",
    gap: espacos.sm,
  },

  nome: {
    fontSize: 18,
    fontWeight: "bold",
    color: cores.texto,
  },

  botao: {
    backgroundColor: cores.primaria,
    paddingVertical: espacos.sm,
    paddingHorizontal: espacos.md,
    borderRadius: raio,
    alignSelf: "flex-start",
  },

  textoBotao: {
    color: cores.textoClaro,
    fontWeight: "bold",
  },
});
