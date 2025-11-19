import { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Text, TextInput, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import UserEntity from '../entities/UserEntity';
import AuthService from '../services/AuthService';

export default function RegisterView() {
  const theme = useTheme();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Nome obrigatório',
        text2: 'Por favor, informe seu nome',
      });
      return false;
    }

    if (!UserEntity.isValidEmail(email)) {
      Toast.show({
        type: 'error',
        text1: 'Email inválido',
        text2: 'Por favor, informe um email válido',
      });
      return false;
    }

    if (!UserEntity.isValidPassword(password)) {
      Toast.show({
        type: 'error',
        text1: 'Senha fraca',
        text2: 'A senha deve ter no mínimo 6 caracteres',
      });
      return false;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Senhas não conferem',
        text2: 'As senhas digitadas são diferentes',
      });
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Registra o usuário SEM fazer login automático
      const users = await AuthService.getAllUsers();
      const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (emailExists) {
        throw new Error('Email já está em uso');
      }

      // Cria novo usuário mas NÃO define como current
      const newUser = new UserEntity({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password,
      });

      // Salva apenas na lista de usuários
      users.push(newUser);
      await AsyncStorage.setItem('@movie_app:users', JSON.stringify(users));
      
      Toast.show({
        type: 'success',
        text1: 'Cadastro realizado!',
        text2: 'Agora faça login com suas credenciais',
      });

      // Volta para tela de login
      router.replace('/view/loginView');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro no cadastro',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.primary }]}>
                🎬
              </Text>
              <Text style={[styles.appName, { color: theme.colors.onBackground }]}>
                Criar Conta
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                Preencha os dados abaixo
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                label="Nome completo"
                value={name}
                onChangeText={setName}
                mode="outlined"
                autoCapitalize="words"
                autoComplete="name"
                left={<TextInput.Icon icon="account" />}
                style={styles.input}
                disabled={loading}
              />

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                left={<TextInput.Icon icon="email" />}
                style={styles.input}
                disabled={loading}
              />

              <TextInput
                label="Senha"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                disabled={loading}
              />

              <TextInput
                label="Confirmar senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                style={styles.input}
                disabled={loading}
              />

              <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.registerButton}
                contentStyle={styles.buttonContent}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.onPrimary} />
                ) : (
                  'Criar conta'
                )}
              </Button>

              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
                <Text style={[styles.dividerText, { color: theme.colors.onSurfaceVariant }]}>
                  ou
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
              </View>

              <Button
                mode="outlined"
                onPress={goToLogin}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
                disabled={loading}
              >
                Já tenho conta
              </Button>
            </View>

            {/* Footer */}
            <Text style={[styles.footer, { color: theme.colors.onSurfaceVariant }]}>
              Ao criar uma conta, você concorda com nossos{'\n'}
              Termos de Uso e Política de Privacidade
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 72,
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContent: {
    height: 48,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  loginButton: {
    marginBottom: 16,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
});