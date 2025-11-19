/**
 * HomeEntity - Gerencia o estado da página inicial de filmes
 */
export default class HomeEntity {
  constructor({
    movies = [],
    loading = false,
    searchText = '',
    selectedCategory = 'popular',
    currentPage = 1,
    hasMorePages = true,
    filters = {
      yearFrom: '',
      yearTo: '',
      genreIds: [], // Array de IDs de gêneros
      minRating: 0,
    },
    usingFilters = false, // Flag para saber se está usando filtros
  } = {}) {
    this.movies = movies;
    this.loading = loading;
    this.searchText = searchText;
    this.selectedCategory = selectedCategory;
    this.currentPage = currentPage;
    this.hasMorePages = hasMorePages;
    this.filters = filters;
    this.usingFilters = usingFilters;
  }

  /**
   * Cria uma cópia com propriedades atualizadas
   */
  with(updates) {
    return new HomeEntity({ ...this, ...updates });
  }

  /**
   * Reseta a paginação
   */
  resetPagination() {
    return this.with({
      currentPage: 1,
      hasMorePages: true,
      movies: []
    });
  }

  /**
   * Incrementa a página
   */
  nextPage() {
    return this.with({
      currentPage: this.currentPage + 1
    });
  }

  /**
   * Adiciona novos filmes à lista
   */
  addMovies(newMovies) {
    const updatedMovies = [...this.movies, ...newMovies];
    return this.with({
      movies: updatedMovies,
    });
  }

  /**
   * Substitui todos os filmes
   */
  setMovies(movies) {
    return this.with({
      movies
    });
  }

  /**
   * Verifica se há filtros ativos
   */
  get hasActiveFilters() {
    return this.filters.yearFrom !== '' ||
           this.filters.yearTo !== '' ||
           (this.filters.genreIds && this.filters.genreIds.length > 0) ||
           this.filters.minRating > 0;
  }

  /**
   * Conta quantos filtros estão ativos
   * IMPORTANTE: Conta cada gênero individualmente
   */
  get activeFiltersCount() {
    let count = 0;
    if (this.filters.yearFrom !== '' || this.filters.yearTo !== '') count++;
    if (this.filters.genreIds && this.filters.genreIds.length > 0) count += this.filters.genreIds.length; // Conta cada gênero
    if (this.filters.minRating > 0) count++;
    return count;
  }

  /**
   * Atualiza os filtros e marca que está usando filtros
   */
  updateFilters(newFilters) {
    return this.with({
      filters: { ...this.filters, ...newFilters },
      usingFilters: true
    });
  }

  /**
   * Limpa todos os filtros
   */
  clearFilters() {
    const cleanFilters = {
      yearFrom: '',
      yearTo: '',
      genreIds: [],
      minRating: 0,
    };
    
    console.log('🧹 Limpando filtros. Antes:', this.filters, 'Depois:', cleanFilters);
    
    return this.with({
      filters: cleanFilters,
      usingFilters: false
    });
  }

  /**
   * Serializa para armazenamento
   */
  toJson() {
    return JSON.stringify({
      searchText: this.searchText,
      selectedCategory: this.selectedCategory,
      currentPage: this.currentPage,
      hasMorePages: this.hasMorePages,
      filters: this.filters,
      usingFilters: this.usingFilters,
    });
  }

  /**
   * Desserializa do armazenamento
   */
  static fromJson(json) {
    try {
      const data = JSON.parse(json);
      return new HomeEntity(data);
    } catch (error) {
      console.error('Erro ao parsear HomeEntity:', error);
      return new HomeEntity();
    }
  }
}