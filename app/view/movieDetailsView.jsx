import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Divider, Paragraph, Text, Title, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function MovieDetailView() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  
  // Parsing seguro dos dados
  let watchLinks = {};
  let category = [];
  let genre = [];
  
  try {
    watchLinks = params.watchLinks ? JSON.parse(params.watchLinks) : {};
  } catch (error) {
    console.error('Erro ao fazer parse de watchLinks:', error);
  }

  try {
    category = params.category ? JSON.parse(params.category) : [];
  } catch (error) {
    category = Array.isArray(params.category) ? params.category : [params.category];
  }

  try {
    genre = params.genre ? JSON.parse(params.genre) : [];
  } catch (error) {
    genre = Array.isArray(params.genre) ? params.genre : [params.genre];
  }

  const movie = {
    ...params,
    watchLinks,
    category,
    genre,
    voteAverage: parseFloat(params.voteAverage) || 0,
    voteCount: parseInt(params.voteCount) || 0,
    popularity: parseFloat(params.popularity) || 0,
  };

  const isTmdbMovie = String(movie.id).startsWith('tmdb_');

  // Formata a data
  const formatDate = (date) => {
    if (!date) return 'Data não disponível';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return date;
    }
  };

  // Formata a avaliação
  const formatRating = (rating) => {
    if (!rating || rating === 0) return null;
    return rating.toFixed(1);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Backdrop com gradiente */}
        {movie.backdropURL && (
          <View style={styles.backdropContainer}>
            <Image
              source={{ uri: movie.backdropURL }}
              style={styles.backdrop}
            />
            <LinearGradient
              colors={['transparent', theme.colors.background]}
              style={styles.gradient}
            />
          </View>
        )}

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {/* Header com poster e informações principais */}
          <View style={styles.header}>
            <Image
              source={{ uri: movie.imageURL }}
              style={styles.poster}
            />
            
            <View style={styles.headerInfo}>
              <View style={styles.titleRow}>
                <Title style={[styles.title, { color: theme.colors.onSurface }]}>
                  {movie.title}
                </Title>
                {isTmdbMovie && (
                  <Chip 
                    mode="flat" 
                    compact
                    icon="movie-open"
                    style={styles.tmdbBadge}
                    textStyle={styles.tmdbBadgeText}
                  >
                    TMDB
                  </Chip>
                )}
              </View>

              {/* Avaliação e ano */}
              <View style={styles.metaRow}>
                {movie.voteAverage > 0 && (
                  <View style={[styles.ratingBox, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Text style={[styles.ratingText, { color: theme.colors.onPrimaryContainer }]}>
                      ⭐ {formatRating(movie.voteAverage)}
                    </Text>
                    {movie.voteCount > 0 && (
                      <Text style={[styles.voteCount, { color: theme.colors.onPrimaryContainer }]}>
                        {movie.voteCount.toLocaleString('pt-BR')} votos
                      </Text>
                    )}
                  </View>
                )}
                
                {movie.releaseDate && (
                  <Chip 
                    mode="outlined" 
                    compact
                    icon="calendar"
                    style={styles.yearChip}
                  >
                    {movie.releaseDate.split('-')[0]}
                  </Chip>
                )}
              </View>

              {/* Gêneros */}
              {genre.length > 0 && (
                <View style={styles.genreContainer}>
                  {genre.map((g, index) => (
                    <Chip 
                      key={index}
                      mode="outlined"
                      compact
                      style={styles.genreChip}
                      textStyle={styles.genreChipText}
                    >
                      {g}
                    </Chip>
                  ))}
                </View>
              )}
            </View>
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

          {/* Sinopse */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              📖 Sinopse
            </Text>
            <Paragraph style={[styles.synopsis, { color: theme.colors.onSurfaceVariant }]}>
              {movie.synopsis}
            </Paragraph>
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

          {/* Informações adicionais */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              ℹ️ Informações
            </Text>
            
            {movie.releaseDate && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.onSurface }]}>
                  📅 Lançamento:
                </Text>
                <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                  {formatDate(movie.releaseDate)}
                </Text>
              </View>
            )}

            {category.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.onSurface }]}>
                  📂 Categorias:
                </Text>
                <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                  {category.join(', ')}
                </Text>
              </View>
            )}

            {movie.staff && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.onSurface }]}>
                  🎬 Equipe:
                </Text>
                <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                  {movie.staff}
                </Text>
              </View>
            )}

            {movie.popularity > 0 && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.onSurface }]}>
                  🔥 Popularidade:
                </Text>
                <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                  {movie.popularity.toFixed(0)}
                </Text>
              </View>
            )}
          </View>

          {/* Onde assistir */}
          {(movie.whereToWatch || Object.keys(watchLinks).length > 0) && (
            <>
              <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  📺 Onde Assistir
                </Text>
                
                {movie.whereToWatch && (
                  <Text style={[styles.providerText, { color: theme.colors.onSurfaceVariant }]}>
                    {movie.whereToWatch}
                  </Text>
                )}

                {Object.keys(watchLinks).length > 0 && (
                  <View style={styles.watchLinksGrid}>
                    {Object.entries(watchLinks).map(([platform, url]) => (
                      <Button
                        key={platform}
                        mode="contained-tonal"
                        icon="play-circle"
                        style={styles.watchLinkButton}
                        contentStyle={styles.watchLinkContent}
                        onPress={() => {
                          if (typeof url === 'string' && url.startsWith('http')) {
                            Linking.openURL(url);
                          }
                        }}
                      >
                        {platform}
                      </Button>
                    ))}
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Barra de navegação inferior */}
      <View style={[
        styles.bottomBar, 
        { 
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: theme.colors.elevation.level2,
          borderTopColor: theme.colors.outline,
        }
      ]}>
        <Button
          mode="contained"
          style={[styles.bottomBarButton, { backgroundColor: theme.colors.primary }]}
          icon="arrow-left"
          labelStyle={[styles.buttonLabel, { color: theme.colors.onPrimary }]}
          contentStyle={styles.buttonContent}
          onPress={() => router.back()}
        >
          Voltar
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingBottom: 80,
  },
  backdropContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  backdrop: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  card: {
    margin: 16,
    marginTop: movie => movie.backdropURL ? -50 : 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    lineHeight: 26,
  },
  tmdbBadge: {
    height: 24,
  },
  tmdbBadgeText: {
    fontSize: 10,
    marginVertical: 0,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  ratingBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  voteCount: {
    fontSize: 11,
    marginTop: 2,
  },
  yearChip: {
    height: 28,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  genreChip: {
    height: 28,
  },
  genreChipText: {
    fontSize: 12,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  synopsis: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'justify',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 120,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  providerText: {
    fontSize: 14,
    marginBottom: 12,
  },
  watchLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  watchLinkButton: {
    flex: 1,
    minWidth: 140,
    borderRadius: 8,
  },
  watchLinkContent: {
    height: 40,
  },
  divider: {
    marginVertical: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 12,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderTopWidth: 1,
  },
  bottomBarButton: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonContent: {
    height: 48,
    width: '100%',
  },
});