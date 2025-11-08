import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Button, Card, Paragraph, Text, Title, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import MovieService from '../services/MovieService';


export default function MovieListView() {
  const router = useRouter();
  const theme = useTheme();
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const filterMovies = (text, movieList = movies) => {
    const search = text.toLowerCase();
    const filtered = movieList.filter(movie => 
      (movie.title?.toLowerCase() || '').includes(search) ||
      (movie.genre?.some(g => g.toLowerCase().includes(search)) || false) ||
      (movie.category?.some(c => c.toLowerCase().includes(search)) || false)
    );
    setFilteredMovies(filtered);
  };

  async function load() {
    if (loading) return; // Previne múltiplas chamadas simultâneas
    
    try {
      setLoading(true);
      const res = await MovieService.listar();
      // Limpa as listas antes de adicionar os novos dados
      setMovies([]);
      setFilteredMovies([]);
      
      // Pequeno delay para garantir que as listas foram limpas
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Adiciona os novos dados
      setMovies(res);
      filterMovies(searchText, res);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Erro ao carregar filmes', text2: String(e.message) });
    } finally {
      setLoading(false);
    }
  }

  // Carrega os filmes apenas uma vez quando o componente é montado
  useEffect(() => { 
    load(); 
  }, []);

  function renderItem({ item }) {
    return (
      <Pressable onPress={() => {
        // Preparar os parâmetros, removendo watchLinks do spread
        const { watchLinks, ...otherParams } = item;
        const params = {
          ...otherParams,
          // Adicionar watchLinks separadamente como string JSON
          watchLinks: watchLinks ? JSON.stringify(watchLinks) : '{}'
        };
        router.push({ pathname: '/view/movieDetailsView', params });
      }}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.row}>
            <Image
              source={item.imageURL.startsWith('http') ? { uri: item.imageURL } : { uri: item.imageURL.replace(/^\.\.\//, '') }}
              style={styles.image}
            />
            <Card.Content style={styles.content}>
              <Title numberOfLines={1} ellipsizeMode="tail" style={[styles.title, { color: theme.colors.onSurface }]}>{item.title}</Title>
              <Paragraph numberOfLines={3} ellipsizeMode="tail" style={[styles.synopsis, { color: theme.colors.onSurfaceVariant }]}>{item.synopsis}</Paragraph>
              <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
                🎭 {Array.isArray(item.genre) ? item.genre.join(', ') : item.genre} • 📂 {Array.isArray(item.category) ? item.category.join(', ') : item.category}
              </Text>
              {item.watchLinks && Object.keys(item.watchLinks).length > 0 && (
                <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
                  📺 Disponível em: {Object.keys(item.watchLinks).join(', ')}
                </Text>
              )}
            </Card.Content>
          </View>
        </Card>
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: theme.colors.surface,
            color: theme.colors.onSurface,
            borderColor: theme.colors.outline,
            borderWidth: 1,
            flex: 1,
          }]}
          placeholder="Buscar por título, gênero ou categoria..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            filterMovies(text);
          }}
          editable={!loading} // Desabilita durante o carregamento
        />
        <Button 
          mode="contained-tonal" 
          onPress={load}
          style={styles.refreshButton}
          icon="refresh"
          loading={loading}
          disabled={loading} // Desabilita durante o carregamento
        >
          {loading ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </View>
      
      <Button 
        mode="contained"
        icon="plus"
        onPress={() => router.push('/view/movieFormView')}
        style={[styles.fabButton, { backgroundColor: theme.colors.primary }]}
        contentStyle={styles.fabContent}
      >
        Novo Filme
      </Button>

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
  container: { 
    flex: 1, 
    padding: 12,
  },
  header: { 
    flexDirection: 'row', 
    marginBottom: 12, 
    gap: 8,
    alignItems: 'center',
  },
  searchInput: {
    padding: 10,
    borderRadius: 8,
    height: 40,
  },
  refreshButton: {
    borderRadius: 8,
    marginLeft: 8,
  },
  fabButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 28,
    elevation: 4,
    zIndex: 1,
  },
  fabContent: {
    height: 56,
    width: 'auto',
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  row: { 
    flexDirection: 'row' 
  },
  image: {
    width: 100,
    height: 150,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  content: { 
    flex: 1, 
    marginLeft: 10, 
    justifyContent: 'center' 
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold',
  },
  synopsis: { 
    fontSize: 14, 
    marginTop: 4, 
    lineHeight: 20 
  },
  meta: { 
    fontSize: 13, 
    marginTop: 6 
  },
});
