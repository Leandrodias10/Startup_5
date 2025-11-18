// ============= CONFIG =============
const USE_TMDB = true;
const API_KEY = "dcab344e2dbd84f9a3a95619168d25ba";
const API_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";
const DEFAULT_LANG = "pt-BR";
const DEFAULT_REGION = "BR";

// ============= TMDB API CLASS =============
export default class TmdbApi {
  /**
   * Constrói a URL completa para uma imagem do TMDB
   */
  static getImageUrl(path, size = "w500") {
    if (!path) return "";
    return `${IMG_BASE}/${size}${path}`;
  }

  /**
   * Faz uma requisição genérica para a API do TMDB
   */
  static async request(endpoint, params = {}) {
    const url = new URL(`${API_BASE}${endpoint}`);
    url.searchParams.append("api_key", API_KEY);
    url.searchParams.append("language", DEFAULT_LANG);
    url.searchParams.append("region", DEFAULT_REGION);

    // Adiciona parâmetros extras
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value);
      }
    });

    console.log('🌐 TMDB Request:', url.toString());

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Lista filmes populares
   */
  static async getPopularMovies(page = 1) {
    return await this.request("/movie/popular", { page });
  }

  /**
   * Lista filmes em cartaz
   */
  static async getNowPlayingMovies(page = 1) {
    return await this.request("/movie/now_playing", { page });
  }

  /**
   * Lista filmes mais bem avaliados
   */
  static async getTopRatedMovies(page = 1) {
    return await this.request("/movie/top_rated", { page });
  }

  /**
   * Lista filmes em breve
   */
  static async getUpcomingMovies(page = 1) {
    return await this.request("/movie/upcoming", { page });
  }

  /**
   * Busca filmes por título
   */
  static async searchMovies(query, page = 1) {
    return await this.request("/search/movie", { query, page });
  }

  /**
   * Descobre filmes com filtros avançados
   * @param {Object} filters - Filtros: { yearFrom, yearTo, genreIds, minRating }
   * @param {number} page - Número da página
   */
  static async discoverMovies(filters = {}, page = 1) {
    const params = { 
      page,
      sort_by: 'popularity.desc',
      include_adult: false,
      include_video: false
    };

    // Filtro de ano
    if (filters.yearFrom) {
      params['primary_release_date.gte'] = `${filters.yearFrom}-01-01`;
    }
    if (filters.yearTo) {
      params['primary_release_date.lte'] = `${filters.yearTo}-12-31`;
    }

    // Filtro de gêneros (usa vírgula para AND - filme precisa ter TODOS os gêneros)
    // Usa | para OR - filme precisa ter PELO MENOS UM dos gêneros
    if (filters.genreIds && filters.genreIds.length > 0) {
      params.with_genres = filters.genreIds.join(','); // Mudei de | para , (AND)
    }

    // Filtro de avaliação mínima
    if (filters.minRating && filters.minRating > 0) {
      params['vote_average.gte'] = filters.minRating;
      params['vote_count.gte'] = 100; // Garante que tem votos suficientes
    }

    console.log('🔍 Filtros aplicados:', filters);
    console.log('📋 Parâmetros da API:', params);

    return await this.request("/discover/movie", params);
  }

  /**
   * Obtém detalhes de um filme específico
   */
  static async getMovieDetails(movieId) {
    return await this.request(`/movie/${movieId}`, { 
      append_to_response: "credits,watch/providers" 
    });
  }

  /**
   * Obtém os gêneros disponíveis
   */
  static async getGenres() {
    return await this.request("/genre/movie/list");
  }

  /**
   * Mapeia um filme da API do TMDB para o formato da aplicação
   */
  static mapToAppFormat(tmdbMovie, details = null) {
    const movie = details || tmdbMovie;
    
    // Extrai gêneros (sempre retorna array de nomes em português)
    let genre = [];
    let genreIds = movie.genre_ids || [];
    
    if (movie.genres) {
      // Detalhes completos do filme
      genre = movie.genres.map(g => g.name);
      genreIds = movie.genres.map(g => g.id);
    } else if (movie.genre_ids && this.genreCache) {
      // Lista de filmes - converte IDs para nomes
      genre = movie.genre_ids
        .map(id => {
          const g = this.genreCache.genres.find(genre => genre.id === id);
          return g ? g.name : null;
        })
        .filter(Boolean);
    }

    // Extrai diretor
    let staff = "";
    if (details && details.credits) {
      const director = details.credits.crew.find(c => c.job === "Director");
      if (director) {
        staff = `Diretor: ${director.name}`;
      }
    }

    // Extrai onde assistir
    let whereToWatch = "";
    let watchLinks = {};
    if (details && details["watch/providers"] && details["watch/providers"].results) {
      const brProviders = details["watch/providers"].results.BR;
      if (brProviders && brProviders.flatrate) {
        const providers = brProviders.flatrate.map(p => p.provider_name);
        whereToWatch = providers.join(", ");
        
        brProviders.flatrate.forEach(p => {
          watchLinks[p.provider_name.toLowerCase()] = p.provider_id;
        });
      }
    }

    return {
      id: `tmdb_${movie.id}`,
      tmdbId: movie.id,
      title: movie.title,
      synopsis: movie.overview || "Sinopse não disponível",
      genre: genre,
      genreIds: genreIds,
      staff: staff,
      whereToWatch: whereToWatch,
      releaseDate: movie.release_date || "",
      imageURL: this.getImageUrl(movie.poster_path),
      backdropURL: this.getImageUrl(movie.backdrop_path, "w780"),
      watchLinks: watchLinks,
      voteAverage: movie.vote_average || 0,
      voteCount: movie.vote_count || 0,
      popularity: movie.popularity || 0,
    };
  }

  /**
   * Cache de gêneros
   */
  static genreCache = null;

  /**
   * Inicializa o cache de gêneros
   */
  static async initGenreCache() {
    try {
      this.genreCache = await this.getGenres();
      console.log('✅ Cache de gêneros inicializado:', this.genreCache.genres.length, 'gêneros');
    } catch (error) {
      console.error("Erro ao carregar gêneros:", error);
      // Fallback com gêneros padrão em português
      this.genreCache = {
        genres: [
          { id: 28, name: "Ação" },
          { id: 12, name: "Aventura" },
          { id: 16, name: "Animação" },
          { id: 35, name: "Comédia" },
          { id: 80, name: "Crime" },
          { id: 99, name: "Documentário" },
          { id: 18, name: "Drama" },
          { id: 10751, name: "Família" },
          { id: 14, name: "Fantasia" },
          { id: 36, name: "História" },
          { id: 27, name: "Terror" },
          { id: 10402, name: "Música" },
          { id: 9648, name: "Mistério" },
          { id: 10749, name: "Romance" },
          { id: 878, name: "Ficção Científica" },
          { id: 10770, name: "Cinema TV" },
          { id: 53, name: "Suspense" },
          { id: 10752, name: "Guerra" },
          { id: 37, name: "Faroeste" }
        ]
      };
    }
  }

  /**
   * Verifica se deve usar TMDB ou modo local
   */
  static isUsingTmdb() {
    return USE_TMDB;
  }

  /**
   * Retorna a lista de gêneros em português com seus IDs
   */
  static getGenreList() {
    if (!this.genreCache) return [];
    return this.genreCache.genres;
  }
}

// Inicializa o cache de gêneros ao importar o módulo
TmdbApi.initGenreCache();