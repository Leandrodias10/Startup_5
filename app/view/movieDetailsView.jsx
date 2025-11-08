import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, Paragraph, Text, Title, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MovieDetailView() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  
  // Parsing mais seguro do watchLinks
  let watchLinks = {};
  try {
    watchLinks = params.watchLinks ? JSON.parse(params.watchLinks) : {};
  } catch (error) {
    console.error('Erro ao fazer parse de watchLinks:', error);
  }

  const movie = {
    ...params,
    watchLinks
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Image
            source={{ uri: movie.imageURL }}
            style={styles.image}
          />

          <Title style={[styles.title, { color: theme.colors.onSurface }]}>{movie.title}</Title>
          <View style={styles.synopsisContainer}>
            <Paragraph style={[styles.synopsis, { color: theme.colors.onSurfaceVariant }]}>{movie.synopsis}</Paragraph>
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={[styles.bold, { color: theme.colors.onSurface }]}>📂 Categoria:</Text>
              <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>{Array.isArray(movie.category) ? movie.category.join(', ') : movie.category}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.bold, { color: theme.colors.onSurface }]}>🎭 Gênero:</Text>
              <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>{Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.bold, { color: theme.colors.onSurface }]}>🎬 Elenco:</Text>
              <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>{movie.staff}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.bold, { color: theme.colors.onSurface }]}>📅 Lançamento:</Text>
              <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>{movie.releaseDate}</Text>
            </View>
          </View>

          {Object.keys(movie.watchLinks || {}).length > 0 && (
            <View style={styles.watchLinksContainer}>
              <Text style={[styles.info, styles.bold, styles.watchLinksTitle, { color: theme.colors.onSurface }]}>📺 Onde assistir:</Text>
              <View style={styles.watchLinksGrid}>
                {Object.entries(movie.watchLinks).map(([platform, url]) => (
                  <Button
                    key={platform}
                    mode="outlined"
                    icon="play-circle"
                    style={styles.watchLinkButton}
                    textColor={theme.colors.primary}
                    onPress={() => Linking.openURL(url)}
                  >
                    {platform}
                  </Button>
                ))}
              </View>
            </View>
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
    padding: 20,
    paddingBottom: 80, // Espaço extra para a barra de navegação
  },
  card: {
    width: '100%',
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
    textAlign: 'left',
    marginBottom: 10,
  },
  synopsisContainer: {
    marginBottom: 16,
  },
  synopsis: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  infoContainer: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    marginLeft: 8,
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
  watchLinksContainer: {
    marginTop: 16,
    width: '100%',
  },
  watchLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  watchLinkButton: {
    flex: 1,
    minWidth: 140,
    marginVertical: 4,
    borderRadius: 8,
  },
  watchLinksTitle: {
    marginTop: 16,
    marginBottom: 8,
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
    backdropFilter: 'blur(10px)',
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
