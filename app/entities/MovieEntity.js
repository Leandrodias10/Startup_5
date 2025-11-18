function normalizeId(raw) {
  if (raw === null || raw === undefined) return null;
  return String(raw);
}

function newId() {
  return `m${Date.now()}`;
}

export default class MovieEntity {
  constructor({
    id = null,
    tmdbId = null, // ID original do TMDB
    title = '',
    synopsis = '',
    category = [],
    genre = [],
    staff = '',
    whereToWatch = '',
    releaseDate = '', // YYYY-MM-DD
    imageURL = '',
    backdropURL = '', // Imagem de fundo (backdrop)
    watchLinks = {}, // Objeto para armazenar links
    voteAverage = 0, // Avaliação média (TMDB)
    voteCount = 0, // Número de votos (TMDB)
    popularity = 0, // Popularidade (TMDB)
  } = {}) {
    this.id = normalizeId(id) ?? newId();
    this.tmdbId = tmdbId;
    this.title = title;
    this.synopsis = synopsis;
    this.category = Array.isArray(category) ? category : [category];
    this.genre = Array.isArray(genre) ? genre : [genre];
    this.staff = staff;
    this.whereToWatch = whereToWatch;
    this.releaseDate = releaseDate;
    this.imageURL = imageURL;
    this.backdropURL = backdropURL;
    this.watchLinks = watchLinks || {};
    this.voteAverage = voteAverage;
    this.voteCount = voteCount;
    this.popularity = popularity;
  }

  static fromDto(d) {
    return d ? new MovieEntity(d) : null;
  }

  /**
   * Cria uma ou mais instâncias de MovieEntity a partir de uma string JSON.
   * @param {string} jsonString - A string JSON contendo um objeto ou um array de objetos.
   * @returns {MovieEntity | MovieEntity[] | null}
   */
  static fromJson(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      if (!data) {
        return null;
      }

      if (Array.isArray(data)) {
        return data.map(MovieEntity.fromDto).filter(Boolean);
      } else {
        return MovieEntity.fromDto(data);
      }
    } catch (error) {
      console.error("Falha ao parsear JSON para MovieEntity:", error);
      return null;
    }
  }

  get key() {
    return String(this.id);
  }

  /**
   * Verifica se o filme é do TMDB
   */
  get isTmdbMovie() {
    return String(this.id).startsWith("tmdb_");
  }

  /**
   * Retorna uma URL da imagem com fallback
   */
  get safeImageURL() {
    if (this.imageURL && this.imageURL.startsWith('http')) {
      return this.imageURL;
    }
    // Fallback para imagem local ou placeholder
    return this.imageURL || './assets/images/placeholder.jpg';
  }

  /**
   * Formata a data de lançamento para exibição
   */
  get formattedReleaseDate() {
    if (!this.releaseDate) return 'Data não disponível';
    
    try {
      const date = new Date(this.releaseDate);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return this.releaseDate;
    }
  }

  /**
   * Retorna o ano de lançamento
   */
  get releaseYear() {
    if (!this.releaseDate) return '';
    return this.releaseDate.split('-')[0];
  }

  /**
   * Formata a avaliação para exibição (ex: 8.5/10)
   */
  get formattedRating() {
    if (!this.voteAverage || this.voteAverage === 0) return 'Sem avaliação';
    return `${this.voteAverage.toFixed(1)}/10`;
  }

  /**
   * Retorna uma descrição resumida dos gêneros
   */
  get genreText() {
    if (!this.genre || this.genre.length === 0) return 'Sem gênero';
    return Array.isArray(this.genre) ? this.genre.join(', ') : this.genre;
  }

  /**
   * Retorna uma descrição resumida das categorias
   */
  get categoryText() {
    if (!this.category || this.category.length === 0) return 'Sem categoria';
    return Array.isArray(this.category) ? this.category.join(', ') : this.category;
  }

  /**
   * Converte para objeto simples (útil para navegação/params)
   */
  toParams() {
    return {
      id: this.id,
      tmdbId: this.tmdbId,
      title: this.title,
      synopsis: this.synopsis,
      category: JSON.stringify(this.category),
      genre: JSON.stringify(this.genre),
      staff: this.staff,
      whereToWatch: this.whereToWatch,
      releaseDate: this.releaseDate,
      imageURL: this.imageURL,
      backdropURL: this.backdropURL,
      watchLinks: JSON.stringify(this.watchLinks),
      voteAverage: this.voteAverage,
      voteCount: this.voteCount,
      popularity: this.popularity,
    };
  }

  /**
   * Cria uma instância a partir de params de navegação
   */
  static fromParams(params) {
    return new MovieEntity({
      ...params,
      category: params.category ? JSON.parse(params.category) : [],
      genre: params.genre ? JSON.parse(params.genre) : [],
      watchLinks: params.watchLinks ? JSON.parse(params.watchLinks) : {},
      voteAverage: params.voteAverage ? parseFloat(params.voteAverage) : 0,
      voteCount: params.voteCount ? parseInt(params.voteCount) : 0,
      popularity: params.popularity ? parseFloat(params.popularity) : 0,
    });
  }
}