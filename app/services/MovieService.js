import MovieEntity from "../entities/MovieEntity";
import TmdbApi from "../api/TmdbApi";

// ============= MEM (modo local) =============
const mem = [
  {
    id: "m1",
    title: "Exemplo: O Filme",
    synopsis: "Uma sinopse de exemplo.",
    category: ["Destaque"],
    genre: ["Ficção"],
    staff: "Diretor: Fulano",
    whereToWatch: "Serviço X",
    releaseDate: "2020-01-01",
    imageURL: "./assets/images/capa_filme.jpg",
    watchLinks: {},
  },
];

export default class MovieService {
  // Cache para evitar múltiplas requisições
  static cache = {
    movies: [],
    lastFetch: null,
    cacheDuration: 5 * 60 * 1000, // 5 minutos
  };

  static toEntity(d) {
    return MovieEntity.fromDto(d);
  }

  /**
   * Lista todos os filmes (TMDB ou local)
   * @param {string} category - Filtro de categoria: 'popular', 'now_playing', 'top_rated', 'upcoming'
   * @param {number} page - Número da página
   * @param {boolean} forceRefresh - Força atualização do cache
   */
  static async listar(category = "popular", page = 1, forceRefresh = false) {
    // Se não estiver usando TMDB, retorna dados locais
    if (!TmdbApi.isUsingTmdb()) {
      return mem.map(this.toEntity);
    }

    try {
      let response;
      
      // Escolhe o endpoint baseado na categoria
      switch (category) {
        case "now_playing":
          response = await TmdbApi.getNowPlayingMovies(page);
          break;
        case "top_rated":
          response = await TmdbApi.getTopRatedMovies(page);
          break;
        case "upcoming":
          response = await TmdbApi.getUpcomingMovies(page);
          break;
        default:
          response = await TmdbApi.getPopularMovies(page);
      }

      // Mapeia os resultados para o formato da aplicação
      const movies = response.results.map(movie => TmdbApi.mapToAppFormat(movie));

      return {
        movies: movies.map(this.toEntity),
        totalPages: response.total_pages,
        currentPage: response.page,
        hasMore: response.page < response.total_pages
      };
    } catch (error) {
      console.error("Erro ao listar filmes da API:", error);
      // Fallback para dados locais em caso de erro
      return {
        movies: mem.map(this.toEntity),
        totalPages: 1,
        currentPage: 1,
        hasMore: false
      };
    }
  }

  /**
   * Busca filme por ID
   * @param {string} id - ID do filme (pode ser local ou TMDB)
   */
  static async buscarPorId(id) {
    // Verifica se é um ID do TMDB
    if (String(id).startsWith("tmdb_")) {
      const tmdbId = String(id).replace("tmdb_", "");
      
      if (TmdbApi.isUsingTmdb()) {
        try {
          const details = await TmdbApi.getMovieDetails(tmdbId);
          const movie = TmdbApi.mapToAppFormat(details, details);
          return this.toEntity(movie);
        } catch (error) {
          console.error("Erro ao buscar detalhes do filme:", error);
          return null;
        }
      }
    }

    // Busca local
    const d = mem.find(x => String(x.id) === String(id));
    return d ? this.toEntity(d) : null;
  }

  /**
   * Busca filmes por termo
   * @param {string} query - Termo de busca
   * @param {number} page - Número da página
   */
  static async buscarPorTermo(query, page = 1) {
    if (!query || !query.trim()) {
      return await this.listar('popular', page);
    }

    // Se estiver usando TMDB, busca na API
    if (TmdbApi.isUsingTmdb()) {
      try {
        const response = await TmdbApi.searchMovies(query, page);
        const movies = response.results.map(movie => TmdbApi.mapToAppFormat(movie));
        
        return {
          movies: movies.map(this.toEntity),
          totalPages: response.total_pages,
          currentPage: response.page,
          hasMore: response.page < response.total_pages
        };
      } catch (error) {
        console.error("Erro ao buscar filmes:", error);
        // Fallback para busca local
      }
    }

    // Busca local
    const searchLower = query.toLowerCase();
    const filtered = mem.filter(movie => 
      (movie.title?.toLowerCase() || '').includes(searchLower) ||
      (movie.genre?.some(g => g.toLowerCase().includes(searchLower)) || false) ||
      (movie.category?.some(c => c.toLowerCase().includes(searchLower)) || false)
    );
    
    return {
      movies: filtered.map(this.toEntity),
      totalPages: 1,
      currentPage: 1,
      hasMore: false
    };
  }

  /**
   * Valida um DTO de filme
   */
  static validar(dto) {
    const erros = [];
    if (!dto.title || !String(dto.title).trim()) {
      erros.push('Título é obrigatório');
    }
    if (dto.releaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(dto.releaseDate)) {
      erros.push('Data deve estar no formato YYYY-MM-DD');
    }
    if (erros.length) {
      throw new Error(erros.join('\n'));
    }
  }

  /**
   * Cria um novo filme (apenas local)
   */
  static async criarMovie(dto) {
    this.validar(dto);
    const novo = { 
      ...dto, 
      id: dto.id ?? `m${Date.now()}`,
      category: Array.isArray(dto.category) ? dto.category : [dto.category],
      genre: Array.isArray(dto.genre) ? dto.genre : [dto.genre],
    };
    
    mem.push(novo);
    
    // Limpa cache para forçar atualização
    this.cache.lastFetch = null;
    
    return { ok: true, movie: this.toEntity(novo) };
  }

  /**
   * Atualiza um filme existente (apenas local)
   */
  static async atualizarMovie(dto) {
    this.validar(dto);
    
    // Não permite atualizar filmes do TMDB
    if (String(dto.id).startsWith("tmdb_")) {
      throw new Error("Não é possível editar filmes do TMDB");
    }
    
    const idx = mem.findIndex(x => String(x.id) === String(dto.id));
    if (idx === -1) {
      throw new Error('Filme não encontrado');
    }
    
    mem[idx] = { 
      ...mem[idx], 
      ...dto,
      category: Array.isArray(dto.category) ? dto.category : [dto.category],
      genre: Array.isArray(dto.genre) ? dto.genre : [dto.genre],
    };
    
    // Limpa cache
    this.cache.lastFetch = null;
    
    return { ok: true, movie: this.toEntity(mem[idx]) };
  }

  /**
   * Remove um filme (apenas local)
   */
  static async removerMovie(id) {
    // Não permite remover filmes do TMDB
    if (String(id).startsWith("tmdb_")) {
      throw new Error("Não é possível remover filmes do TMDB");
    }
    
    const idx = mem.findIndex(x => String(x.id) === String(id));
    if (idx === -1) {
      return false;
    }
    
    mem.splice(idx, 1);
    
    // Limpa cache
    this.cache.lastFetch = null;
    
    return true;
  }

  /**
   * Limpa o cache manualmente
   */
  static clearCache() {
    this.cache.movies = [];
    this.cache.lastFetch = null;
  }

  /**
   * Verifica se um filme é do TMDB
   */
  static isTmdbMovie(id) {
    return String(id).startsWith("tmdb_");
  }
}