import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme as usePaperTheme } from 'react-native-paper';

export default function ButtomMenu() {
  const isHomeScreen = router.canGoBack();

  if (!isHomeScreen) return null;

  const theme = usePaperTheme();

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.colors.surface,
      borderTopColor: theme.colors.outline
    }]}>
      <View style={styles.buttonContainer}>
        <Pressable 
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/')} 
          accessibilityLabel="Início"
        >
          <Text style={[styles.text, { color: theme.colors.onPrimary }]}>🏠 Início</Text>
        </Pressable>
        <Pressable 
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/view/profileView')} 
          accessibilityLabel="Perfil"
        >
          <Text style={[styles.text, { color: theme.colors.onPrimary }]}>👤 Perfil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    borderTopWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
  },
  text: {
    fontWeight: '600',
  },
});