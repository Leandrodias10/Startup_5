import { useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { FlatList, Image, Pressable, StyleSheet, TextInput, View, ScrollView } from 'react-native';
import { Card, Paragraph, Text, Title, useTheme, Chip, IconButton, Badge, ActivityIndicator } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import MovieService from '../services/MovieService';
import HomeEntity from '../entities/HomeEntity';
import FilterModal from '../components/FilterModal';

export default function MovieListView() {
  const router = useRouter();
  const theme = useTheme();
  
  const [homeState, setHomeState] = useState(new HomeEntity());
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Refs para controlar debounce e evitar chamadas duplicadas
  const searchTimeoutRef = useRef(null);
  const isLoadingRef = useRef(false);
  
  const categories = [
    { key: 'popular', label: 'Populares' },
    { key: 'now_playing', label: 'Em Cartaz' },
    { key: 'top_rated', label: 'Avaliados' },
    { key: 'upcoming', label: 'Em Breve' },
  ];

  // Função para carregar filmes
  async function loadMovies(reset = false) {
    if (isLoadingRef.current) {
      console.log('⏸️ Já está carregando, aguardando...');
      return;
    }
    
    try {
      isLoadingRef.current = true;
      let newState = reset ? homeState.resetPagination() : homeState;
      
      setHomeState(newState.with({ loading: true }));
      
      console.log('📥 Carregando filmes:', {
        searchText: newState.searchText,
        category: newState.selectedCategory,
        page: newState.currentPage,
        hasFilters: newState.hasActiveFilters,
        filters: newState.filters
      });
      
      let result;
      
      if (newState.searchText.trim()) {
        // Busca por termo
        result = await MovieService.buscarPorTermo(
          newState.searchText, 
          newState.currentPage
        );
      } else {
        // Lista por categoria ou com filtros
        const filters = newState.hasActiveFilters ? newState.filters : null;
        result = await MovieService.listar(
          newState.selectedCategory, 
          newState.currentPage,
          filters
        );
      }

      console.log('✅ Filmes carregados:', result.movies.length);

      // Adiciona ou substitui os filmes
      if (reset || newState.currentPage === 1) {
        newState = newState.setMovies(result.movies);
      } else {
        newState = newState.addMovies(result.movies);
      }

      newState = newState.with({
        hasMorePages: result.hasMore,
        loading: false
      });

      setHomeState(newState);
    } catch (e) {
      console.error('❌ Erro ao carregar filmes:', e);
      Toast.show({ 
        type: 'error', 
        text1: 'Erro ao carregar filmes', 
        text2: String(e.message) 
      });
      setHomeState(homeState.with({ loading: false }));
    } finally {
      isLoadingRef.current = false;
    }
  }

  // Carrega mais filmes (paginação infinita)
  async function loadMoreMovies() {
    if (loadingMore || !homeState.hasMorePages || homeState.loading || isLoadingRef.current) return;
    
    try {
      setLoadingMore(true);
      
      const nextState = homeState.nextPage();
      setHomeState(nextState);

      let result;
      if (nextState.searchText.trim()) {
        result = await MovieService.buscarPorTermo(
          nextState.searchText, 
          nextState.currentPage
        );
      } else {
        const filters = nextState.hasActiveFilters ? nextState.filters : null;
        result = await MovieService.listar(
          nextState.selectedCategory, 
          nextState.currentPage,
          filters
        );
      }

      const finalState = nextState
        .addMovies(result.movies)
        .with({ hasMorePages: result.hasMore });

      setHomeState(finalState);
    } catch (e) {
      Toast.show({ 
        type: 'error', 
        text1: 'Erro ao carregar mais filmes', 
        text2: String(e.message) 
      });
    } finally {
      setLoadingMore(false);
    }
  }

  // Atualiza a busca
  const handleSearchChange = (text) => {
    setHomeState(
      homeState
        .with({ searchText: text })
        .resetPagination()
    );
  };

  // Muda a categoria
  const handleCategoryChange = (category) => {
    console.log('🏷️ Mudando categoria:', category);
    setHomeState(
      homeState
        .with({ selectedCategory: category })
        .resetPagination()
    );
  };

  // Aplica filtros
  const handleApplyFilters = (filters) => {
    console.log('🔧 Aplicando filtros:', filters);
    const newState = homeState
      .updateFilters(filters)
      .resetPagination();
    
    setHomeState(newState);
    
    // Força o carregamento imediatamente
    setTimeout(() => {
      loadMovies(true);
    }, 100);
  };

  // Limpa filtros
  const handleClearFilters = () => {
    console.log('🧹 Limpando filtros');
    const newState = homeState
      .clearFilters()
      .resetPagination();
    
    setHomeState(newState);
    
    // Força o carregamento imediatamente
    setTimeout(() => {
      loadMovies(true);
    }, 100);
  };

  // Carrega os filmes na montagem inicial
  useEffect(() => {
    console.log('🎬 Componente montado');
    loadMovies(true);
  }, []);

  // Carrega os filmes quando a categoria muda
  useEffect(() => {
    if (homeState.selectedCategory && !homeState.searchText.trim()) {
      console.log('🔄 Categoria mudou, recarregando...');
      loadMovies(true);
    }
  }, [homeState.selectedCategory]);

  // Busca com debounce quando o texto muda
  useEffect(() => {
    if (!homeState.searchText.trim()) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      console.log('🔍 Buscando:', homeState.searchText);
      loadMovies(true);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [homeState.searchText]);

  // Renderiza cada filme
  function renderItem({ item }) {
    const isTmdb = MovieService.isTmdbMovie(item.id);
    
    return (
      <Pressable onPress={() => {
        router.push({ 
          pathname: '/view/movieDetailsView', 
          params: item.toParams() 
        });
      }}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.row}>
            <Image
              source={{ uri: item.safeImageURL }}
              style={styles.image}
              resizeMode="cover"
            />
            <Card.Content style={styles.content}>
              <View style={styles.titleRow}>
                <Title 
                  numberOfLines={2} 
                  ellipsizeMode="tail" 
                  style={[styles.title, { color: theme.colors.onSurface }]}
                >
                  {item.title}
                </Title>
                {isTmdb && (
                  <Chip 
                    mode="outlined" 
                    compact 
                    style={styles.tmdbChip}
                    textStyle={styles.tmdbChipText}
                  >
                    TMDB
                  </Chip>
                )}
              </View>

              <Paragraph 
                numberOfLines={3} 
                ellipsizeMode="tail" 
                style={[styles.synopsis, { color: theme.colors.onSurfaceVariant }]}
              >
                {item.synopsis}
              </Paragraph>

              <View style={styles.metaContainer}>
                {item.releaseYear && (
                  <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
                    📅 {item.releaseYear}
                  </Text>
                )}
                
                {item.voteAverage > 0 && (
                  <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
                    ⭐ {item.formattedRating}
                  </Text>
                )}
              </View>

              <Text 
                numberOfLines={1} 
                ellipsizeMode="tail" 
                style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}
              >
                🎭 {item.genreText}
              </Text>

              {item.whereToWatch && (
                <Text 
                  numberOfLines={1} 
                  ellipsizeMode="tail" 
                  style={[styles.meta, { color: theme.colors.primary }]}
                >
                  📺 {item.whereToWatch}
                </Text>
              )}
            </Card.Content>
          </View>
        </Card>
      </Pressable>
    );
  }

  // Renderiza o footer da lista
  function renderFooter() {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
          Carregando mais filmes...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Barra de busca e botões */}
      <View style={styles.header}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: theme.colors.surface,
            color: theme.colors.onSurface,
            borderColor: theme.colors.outline,
          }]}
          placeholder="Buscar filmes..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={homeState.searchText}
          onChangeText={handleSearchChange}
          editable={!homeState.loading}
        />
        
        <View style={styles.headerButtons}>
          {/* Botão de Filtro */}
          <View>
            <IconButton
              icon="filter-variant"
              size={24}
              onPress={() => setFilterModalVisible(true)}
              disabled={homeState.loading}
              style={styles.iconButton}
            />
            {homeState.activeFiltersCount > 0 && (
              <Badge 
                style={[styles.filterBadge, { backgroundColor: theme.colors.error }]}
                size={16}
              >
                {homeState.activeFiltersCount}
              </Badge>
            )}
          </View>

          {/* Botão de Refresh */}
          <IconButton
            icon="refresh"
            size={24}
            onPress={() => loadMovies(true)}
            disabled={homeState.loading}
            style={styles.iconButton}
          />
        </View>
      </View>

      {/* Chips de categoria com scroll horizontal */}
      {!homeState.searchText.trim() && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
          style={styles.categoryScroll}
        >
          {categories.map(cat => (
            <Chip
              key={cat.key}
              selected={homeState.selectedCategory === cat.key}
              onPress={() => handleCategoryChange(cat.key)}
              style={styles.categoryChip}
              mode={homeState.selectedCategory === cat.key ? 'flat' : 'outlined'}
            >
              {cat.label}
            </Chip>
          ))}
        </ScrollView>
      )}

      {/* Indicador de filtros ativos */}
      {homeState.hasActiveFilters && (
        <View style={[styles.activeFiltersContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={[styles.activeFiltersText, { color: theme.colors.onSurfaceVariant }]}>
            {homeState.activeFiltersCount} filtro(s) • {homeState.movies.length} filme(s)
          </Text>
          <Pressable onPress={handleClearFilters}>
            <Text style={[styles.clearButton, { color: theme.colors.primary }]}>
              Limpar
            </Text>
          </Pressable>
        </View>
      )}

      {/* Lista de filmes */}
      <FlatList
        data={homeState.movies}
        keyExtractor={(i) => i.key}
        renderItem={renderItem}
        refreshing={homeState.loading && homeState.currentPage === 1}
        onRefresh={() => loadMovies(true)}
        onEndReached={loadMoreMovies}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !homeState.loading ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                {homeState.searchText.trim() 
                  ? 'Nenhum filme encontrado' 
                  : homeState.hasActiveFilters
                    ? 'Nenhum filme corresponde aos filtros'
                    : 'Nenhum filme disponível'}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Modal de Filtros */}
      <FilterModal
        visible={filterModalVisible}
        onDismiss={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        currentFilters={homeState.filters}
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
    flex: 1,
    padding: 10,
    borderRadius: 8,
    height: 48,
    borderWidth: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    margin: 0,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  categoryScroll: {
    maxHeight: 50,
    marginBottom: 16,
    flexGrow: 0,
    flexShrink: 0,
  },
  categoryScrollContent: {
    paddingRight: 12,
    gap: 8,
    alignItems: 'center',
  },
  categoryChip: {
    minWidth: 90,
    height: 36,
    justifyContent: 'center',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeFiltersText: {
    fontSize: 13,
    flex: 1,
  },
  clearButton: {
    fontSize: 13,
    fontWeight: '600',
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
    justifyContent: 'center',
    paddingVertical: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: { 
    fontSize: 16, 
    fontWeight: 'bold',
    flex: 1,
  },
  tmdbChip: {
    height: 20,
  },
  tmdbChipText: {
    fontSize: 10,
    marginVertical: 0,
  },
  synopsis: { 
    fontSize: 13, 
    marginTop: 4, 
    lineHeight: 18 
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  meta: { 
    fontSize: 12, 
    marginTop: 4 
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});