import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const theme = useTheme();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inLoginScreen = segments.includes('loginView') || segments.includes('registerView');

    // Se não está autenticado e tentando acessar área protegida
    if (!user && inAuthGroup) {
      router.replace('/view/loginView');
    }

    // Se está autenticado e ainda está na tela de login
    if (user && inLoginScreen) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});