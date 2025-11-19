import React, { createContext, useContext, useEffect, useState } from 'react';
import AuthService from '../services/AuthService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se há usuário logado ao iniciar
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    try {
      console.log('🔐 Tentando login...');
      const result = await AuthService.login({ email, password });
      const currentUser = await AuthService.getCurrentUser();
      console.log('✅ Login bem-sucedido:', currentUser?.name);
      setUser(currentUser);
      return result;
    } catch (error) {
      console.error('❌ Erro no login:', error.message);
      throw error;
    }
  };

  const register = async ({ name, email, password }) => {
    try {
      console.log('📝 Tentando cadastro...');
      const result = await AuthService.register({ name, email, password });
      const currentUser = await AuthService.getCurrentUser();
      console.log('✅ Cadastro bem-sucedido:', currentUser?.name);
      setUser(currentUser);
      return result;
    } catch (error) {
      console.error('❌ Erro no cadastro:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('👋 Fazendo logout...');
      await AuthService.logout();
      console.log('✅ Logout bem-sucedido');
      setUser(null);
    } catch (error) {
      console.error('❌ Erro no logout:', error.message);
      throw error;
    }
  };

  const updateUser = async (updates) => {
    try {
      if (!user) throw new Error('Nenhum usuário logado');
      
      const result = await AuthService.updateUser(user.id, updates);
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      return result;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}