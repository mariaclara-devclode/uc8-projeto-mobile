import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export function TelaSobre() {
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: "#eef1f6",
  },

  container: {
    flex: 1,
    padding: 20,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f1a2e",
  },

  subtitulo: {
    fontSize: 15,
    color: "#555",
    marginTop: 2,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
  },

  tituloCard: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f1a2e",
    marginBottom: 14,
  },

  texto: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    marginBottom: 12,
  },
});