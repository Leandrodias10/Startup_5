import AsyncStorage from '@react-native-async-storage/async-storage';
import UserEntity from '../entities/UserEntity';

const STORAGE_KEYS = {
  USERS: '@movie_app:users',
  CURRENT_USER: '@movie_app:current_user',
};

export default class AuthService {
  /**
   * Registra um novo usuário
   */
  static async register({ name, email, password }) {
    try {
      // Validações
      if (!name || !name.trim()) {
        throw new Error('Nome é obrigatório');
      }

      if (!UserEntity.isValidEmail(email)) {
        throw new Error('Email inválido');
      }

      if (!UserEntity.isValidPassword(password)) {
        throw new Error('Senha deve ter no mínimo 6 caracteres');
      }

      // Verifica se o email já está em uso
      const users = await this.getAllUsers();
      const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (emailExists) {
        throw new Error('Email já está em uso');
      }

      // Cria novo usuário
      const newUser = new UserEntity({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password, // Em produção, use hash!
      });

      // Salva no storage
      users.push(newUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Define como usuário atual
      await this.setCurrentUser(newUser);

      return { success: true, user: newUser.safeUser };
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }

  /**
   * Faz login do usuário
   */
  static async login({ email, password }) {
    try {
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }

      const users = await this.getAllUsers();
      const user = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!user) {
        throw new Error('Email ou senha incorretos');
      }

      // Define como usuário atual
      await this.setCurrentUser(user);

      return { success: true, user: user.safeUser };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  /**
   * Faz logout do usuário
   */
  static async logout() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  }

  /**
   * Obtém o usuário atual logado
   */
  static async getCurrentUser() {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!userJson) return null;

      const userData = JSON.parse(userJson);
      return new UserEntity(userData);
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }

  /**
   * Define o usuário atual
   */
  static async setCurrentUser(user) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, user.toJson());
    } catch (error) {
      console.error('Erro ao definir usuário atual:', error);
      throw error;
    }
  }

  /**
   * Obtém todos os usuários cadastrados
   */
  static async getAllUsers() {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      if (!usersJson) return [];

      const usersData = JSON.parse(usersJson);
      return usersData.map(u => new UserEntity(u));
    } catch (error) {
      console.error('Erro ao obter usuários:', error);
      return [];
    }
  }

  /**
   * Atualiza os dados do usuário
   */
  static async updateUser(userId, updates) {
    try {
      const users = await this.getAllUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        throw new Error('Usuário não encontrado');
      }

      // Atualiza o usuário
      const updatedUser = users[userIndex].with(updates);
      users[userIndex] = updatedUser;

      // Salva no storage
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Se for o usuário atual, atualiza também
      const currentUser = await this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        await this.setCurrentUser(updatedUser);
      }

      return { success: true, user: updatedUser.safeUser };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  /**
   * Verifica se há um usuário logado
   */
  static async isAuthenticated() {
    const user = await this.getCurrentUser();
    return !!user;
  }

  /**
   * Limpa todos os dados (para testes)
   */
  static async clearAllData() {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.USERS, STORAGE_KEYS.CURRENT_USER]);
      return { success: true };
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  }
}