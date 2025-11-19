function normalizeId(raw) {
  if (raw === null || raw === undefined) return null;
  return String(raw);
}

function newId() {
  return `u${Date.now()}`;
}

export default class UserEntity {
  constructor({
    id = null,
    name = '',
    email = '',
    password = '',
    avatar = null,
    createdAt = new Date().toISOString(),
  } = {}) {
    this.id = normalizeId(id) ?? newId();
    this.name = name;
    this.email = email;
    this.password = password; // Em produção, nunca armazene senha em texto puro!
    this.avatar = avatar;
    this.createdAt = createdAt;
  }

  static fromDto(d) {
    return d ? new UserEntity(d) : null;
  }

  /**
   * Cria uma instância de UserEntity a partir de uma string JSON
   */
  static fromJson(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data) return null;
      return UserEntity.fromDto(data);
    } catch (error) {
      console.error("Falha ao parsear JSON para UserEntity:", error);
      return null;
    }
  }

  /**
   * Retorna uma versão segura do usuário (sem senha)
   */
  get safeUser() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      createdAt: this.createdAt,
    };
  }

  /**
   * Retorna as iniciais do nome
   */
  get initials() {
    if (!this.name) return 'U';
    const names = this.name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  /**
   * Valida email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida senha (mínimo 6 caracteres)
   */
  static isValidPassword(password) {
    return password && password.length >= 6;
  }

  /**
   * Converte para JSON
   */
  toJson() {
    return JSON.stringify({
      id: this.id,
      name: this.name,
      email: this.email,
      password: this.password,
      avatar: this.avatar,
      createdAt: this.createdAt,
    });
  }

  /**
   * Cria uma cópia com propriedades atualizadas
   */
  with(updates) {
    return new UserEntity({ ...this, ...updates });
  }
}