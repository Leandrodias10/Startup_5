import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAuth } from './contexts/AuthContext';

export default function Index() {
  const router = useRouter();
  const theme = useTheme();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Pequeno delay para evitar race conditions
    const timeout = setTimeout(() => {
      if (user) {
        // Se está autenticado, vai para a lista de filmes
        router.replace('/view/movieListView');
      } else {
        // Se não está autenticado, vai para login
        router.replace('/view/loginView');
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [user, loading]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});