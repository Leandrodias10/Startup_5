import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Button, Card, Paragraph, Text, Title } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import MovieService from '../services/MovieService';


export default function MovieListView() {
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  

  const filterMovies = (text) => {
    const search = text.toLowerCase();
    const filtered = movies.filter(movie => 
      (movie.title?.toLowerCase() || '').includes(search) ||
      (movie.genre?.some(g => g.toLowerCase().includes(search)) || false) ||
      (movie.category?.some(c => c.toLowerCase().includes(search)) || false)
    );
    setFilteredMovies(filtered);
  };

  async function load() {
    try {
      setLoading(true);
      const res = await MovieService.listar();
      setMovies(res);
      // Aplica o filtro atual aos novos dados
      const search = searchText.toLowerCase();
      const filtered = res.filter(movie => 
        (movie.title?.toLowerCase() || '').includes(search) ||
        (movie.genre?.some(g => g.toLowerCase().includes(search)) || false) ||
        (movie.category?.some(c => c.toLowerCase().includes(search)) || false)
      );
      setFilteredMovies(filtered);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Erro ao carregar filmes', text2: String(e.message) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function renderItem({ item }) {
    return (
      <Pressable onPress={() => router.push({ pathname: '/view/movieDetailsView', params: { ...item } })}>
        <Card style={styles.card}>
          <View style={styles.row}>
            <Image
              source={item.imageURL.startsWith('http') ? { uri: item.imageURL } : { uri: item.imageURL.replace(/^\.\.\//, '') }}
              style={styles.image}
            />
            <Card.Content style={styles.content}>
              <Title style={styles.title}>{item.title}</Title>
              <Paragraph numberOfLines={3} style={styles.synopsis}>{item.synopsis}</Paragraph>
              <Text style={styles.meta}>🎭 {item.genre} • 📂 {item.category}</Text>
              <Text style={styles.meta}>📺 Onde assistir: {item.whereToWatch}</Text>
            </Card.Content>
          </View>
        </Card>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button mode="contained" onPress={() => router.push('/view/movieFormView')}>Novo Filme</Button>
        <Button onPress={load} style={{ marginLeft: 8 }}>Atualizar</Button>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por título, gênero ou categoria..."
        value={searchText}
        onChangeText={(text) => {
          setSearchText(text);
          filterMovies(text);
        }}
      />

      <FlatList
        data={filteredMovies}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#eaeaea' },
  header: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  searchInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  card: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
  },
  row: { flexDirection: 'row' },
  image: {
    width: 100,
    height: 150,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: '#ccc',
  },
  content: { flex: 1, marginLeft: 10, justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  synopsis: { fontSize: 14, color: '#333', marginTop: 4, lineHeight: 20 },
  meta: { fontSize: 13, color: '#444', marginTop: 6 },
});
