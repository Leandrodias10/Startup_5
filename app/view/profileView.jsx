import { StyleSheet, View } from 'react-native';
import { Avatar, List, Switch, Text, useTheme as usePaperTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

export default function ProfileView() {
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = usePaperTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Avatar.Icon size={80} icon="account" style={styles.avatar} />
        <Text style={[styles.username, { color: theme.colors.onBackground }]}>
          Usuário
        </Text>
      </View>

      <List.Section style={styles.section}>
        <List.Subheader style={{ color: theme.colors.onBackground }}>Configurações</List.Subheader>
        
        <List.Item
          title="Modo Escuro"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              color={theme.colors.primary}
            />
          )}
          titleStyle={{ color: theme.colors.onBackground }}
        />

        <List.Item
          title="Versão do App"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="information" />}
          titleStyle={{ color: theme.colors.onBackground }}
          descriptionStyle={{ color: theme.colors.onBackground }}
        />
      </List.Section>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  avatar: {
    marginBottom: 12,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
  },
});