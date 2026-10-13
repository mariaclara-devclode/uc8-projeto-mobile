
import {
  PixelRatio,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { cores, espacos, raio } from "../tema/tema";

export function TelaSobre() {
  const { width, height, fontScale } = useWindowDimensions();
  const densidade = PixelRatio.get();

  return (
    <SafeAreaView style={styles.areaSegura}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Estok</Text>

        <Text style={styles.subtitulo}>
          Gerenciador de Estoque Comercial
        </Text>

        <View style={styles.card}>
          <Text style={styles.tituloCard}>
            Sobre o aplicativo
          </Text>

          <Text style={styles.texto}>
            O Estok é um aplicativo mobile para
            gerenciamento de produtos e controle de
            estoque.
          </Text>

          <Text style={styles.texto}>
            Este aplicativo é um recorte do sistema
            desenvolvido no projeto da UC5.
          </Text>

          <Text style={styles.texto}>
            Desenvolvido como atividade do curso
            Técnico em Desenvolvimento de Sistemas
            do SENAC.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.tituloCard}>
            Informações da tela
          </Text>

          <Text style={styles.texto}>
            Largura da janela: {width.toFixed(0)} dp
          </Text>

          <Text style={styles.texto}>
            Altura da janela: {height.toFixed(0)} dp
          </Text>

          <Text style={styles.texto}>
            Densidade da tela: {densidade.toFixed(2)}
          </Text>

          <Text style={styles.texto}>
            Escala da fonte: {fontScale.toFixed(2)}
          </Text>
        </View>
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
});
