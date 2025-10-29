import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, Paragraph, Text, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MovieDetailView() {
  const router = useRouter();
  const movie = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
            <Image
              source= {require('../../assets/images/capa_filme.jpg')}
              style={styles.image}
            />

          <Title style={styles.title}>{movie.title}</Title>
          <Paragraph style={styles.synopsis}>{movie.synopsis}</Paragraph>

          <Divider style={styles.divider} />

          <Text style={styles.info}><Text style={styles.bold}>📂 Categoria:</Text> {movie.category}</Text>
          <Text style={styles.info}><Text style={styles.bold}>🎭 Gênero:</Text> {movie.genre}</Text>
          <Text style={styles.info}><Text style={styles.bold}>🎬 Elenco:</Text> {movie.staff}</Text>
          <Text style={styles.info}><Text style={styles.bold}>📅 Lançamento:</Text> {movie.releaseDate}</Text>
          <Text style={styles.info}><Text style={styles.bold}>📺 Onde assistir:</Text> {movie.whereToWatch}</Text>

          <Button
            mode="contained"
            style={styles.button}
            onPress={() => router.back()}
          >
            Voltar
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f5',
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 420,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#222',
    marginBottom: 10,
  },
  synopsis: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'justify',
  },
  divider: {
    marginVertical: 12,
  },
  info: {
    fontSize: 15,
    marginVertical: 4,
    color: '#444',
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
    color: '#111',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#0066cc',
    borderRadius: 10,
    paddingVertical: 6,
  },
});
