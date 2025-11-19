import { StyleSheet, View } from 'react-native';
import { Avatar, List, Switch, Text, useTheme as usePaperTheme, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileView() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const theme = usePaperTheme();

  const handleLogout = async () => {
    try {
      await logout();
      
      Toast.show({
        type: 'success',
        text1: 'Logout realizado',
        text2: 'Até logo!',
      });

      // O _layout.jsx vai redirecionar automaticamente após o logout
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao sair',
        text2: error.message,
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={user?.initials || 'U'} 
          style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
        />
        <Text style={[styles.username, { color: theme.colors.onBackground }]}>
          {user?.name || 'Usuário'}
        </Text>
        <Text style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>
          {user?.email || 'email@exemplo.com'}
        </Text>
      </View>

      <List.Section style={styles.section}>
        <List.Subheader style={{ color: theme.colors.onBackground }}>
          Configurações
        </List.Subheader>
        
        <List.Item
          title="Modo Escuro"
          description="Alterne entre tema claro e escuro"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              color={theme.colors.primary}
            />
          )}
          titleStyle={{ color: theme.colors.onBackground }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
        />

        <Divider style={{ marginVertical: 8 }} />

        <List.Item
          title="Editar Perfil"
          description="Altere suas informações pessoais"
          left={props => <List.Icon {...props} icon="account-edit" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {
            Toast.show({
              type: 'info',
              text1: 'Em desenvolvimento',
              text2: 'Essa funcionalidade será adicionada em breve',
            });
          }}
          titleStyle={{ color: theme.colors.onBackground }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
        />

        <List.Item
          title="Notificações"
          description="Gerencie suas notificações"
          left={props => <List.Icon {...props} icon="bell" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {
            Toast.show({
              type: 'info',
              text1: 'Em desenvolvimento',
              text2: 'Essa funcionalidade será adicionada em breve',
            });
          }}
          titleStyle={{ color: theme.colors.onBackground }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
        />

        <Divider style={{ marginVertical: 8 }} />

        <List.Item
          title="Versão do App"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="information" />}
          titleStyle={{ color: theme.colors.onBackground }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
        />
      </List.Section>

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          icon="logout"
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
          textColor={theme.colors.error}
          buttonColor="transparent"
        >
          Sair da conta
        </Button>
      </View>
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
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  section: {
    marginTop: 20,
    flex: 1,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    borderColor: 'transparent',
  },
  logoutButtonContent: {
    height: 48,
  },
});