import MovieEntity from "../entities/MovieEntity";
// 1. Importe os dados do seu arquivo JSON
// (Ajuste o caminho se o 'MovieService.js' não estiver um nível acima de 'assets')
import filmesData from "../../assets/filmes.json";

// 2. Use 'let' para tornar o array 'mem' modificável.
// Inicialize 'mem' com uma cópia dos dados importados do JSON.
let mem = [...filmesData];

export default class MovieService {
  static toEntity(d) {
    return MovieEntity.fromDto(d);
  }

  // 3. O 'listar' agora lê do 'mem', que foi populado pelo JSON.
  // Mantemos 'async' para simular uma chamada de API real.
  static async listar() {
    return mem.map(this.toEntity);
  }

  // 4. Todos os outros métodos (buscar, criar, atualizar, remover)
  // já funcionam com a variável 'mem', então nenhum outro
  // código precisa ser alterado.
  static async buscarPorId(id) {
    const d = mem.find(x => String(x.id) === String(id));
    return d ? this.toEntity(d) : null;
  }

  static validar(dto) {
    const erros = [];
    if (!dto.title || !String(dto.title).trim()) erros.push('Título é obrigatório');
    if (dto.releaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(dto.releaseDate)) erros.push('Data deve estar no formato YYYY-MM-DD');
    if (erros.length) throw new Error(erros.join('\n'));
  }

  static async criarMovie(dto) {
    this.validar(dto);
    const novo = { ...dto, id: dto.id ?? `m${Date.now()}` };
    // Adiciona o novo filme à cópia em memória
    mem.push(novo);
    return { ok: true, movie: this.toEntity(novo) };
  }

  static async atualizarMovie(dto) {
    this.validar(dto);
    const idx = mem.findIndex(x => String(x.id) === String(dto.id));
    if (idx === -1) throw new Error('Filme não encontrado');
    // Atualiza o filme na cópia em memória
    mem[idx] = { ...mem[idx], ...dto };
    return { ok: true, movie: this.toEntity(mem[idx]) };
  }

  static async removerMovie(id) {
    const idx = mem.findIndex(x => String(x.id) === String(id));
    if (idx === -1) return false;
    // Remove o filme da cópia em memória
    mem.splice(idx, 1);
    return true;
  }
}