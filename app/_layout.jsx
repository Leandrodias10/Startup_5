import { Slot } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import Toast from "react-native-toast-message";
import ButtomMenu from './components/ButtomMenu';
import TopDropDownMenu from './components/TopDropDownMenu';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

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
      <ThemedLayout />
    </ThemeProvider>
  );
}

function ThemedLayout() {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <TopDropDownMenu />
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          <Slot />
        </View>
        <ButtomMenu />
        <Toast />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  }
});
