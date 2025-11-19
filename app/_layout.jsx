import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import Toast from "react-native-toast-message";
import ButtomMenu from './components/ButtomMenu';
import TopDropDownMenu from './components/TopDropDownMenu';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#60a5fa',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    onBackground: '#ffffff',
    onSurface: '#ffffff',
  },
};

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0066cc',
    background: '#f5f5f5',
    surface: '#ffffff',
  },
};

export default function Layout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}

function ThemedLayout() {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <ProtectedLayout theme={theme} />
    </PaperProvider>
  );
}

function ProtectedLayout({ theme }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthScreen = segments.some(segment => 
      segment === 'loginView' || segment === 'registerView'
    );

    // Se não está autenticado e não está em tela de auth
    if (!user && !inAuthScreen) {
      router.replace('/view/loginView');
    }

    // Se está autenticado e está em tela de auth
    if (user && inAuthScreen) {
      router.replace('/view/movieListView');
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

  // Se não está autenticado e não está em tela de auth, não renderiza nada
  // (o useEffect vai redirecionar)
  const inAuthScreen = segments.some(segment => 
    segment === 'loginView' || segment === 'registerView'
  );
  
  if (!user && !inAuthScreen) {
    return null;
  }

  // Se está em tela de login/registro, não mostra menus
  if (inAuthScreen) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          <Slot />
        </View>
        <Toast />
      </View>
    );
  }

  // Layout normal com menus (para usuário autenticado)
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopDropDownMenu />
      <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
        <Slot />
      </View>
      <ButtomMenu />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});