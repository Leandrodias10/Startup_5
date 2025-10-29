import MovieEntity from "../entities/MovieEntity";


const mem = [
{
id: 'm1',
title: 'Exemplo: O Filme',
synopsis: 'Uma sinopse de exemplo.',
category: 'Destaque',
genre: 'Ficcao',
staff: 'Diretor: Fulano',
whereToWatch: 'Serviço X',
releaseDate: '2020-01-01',
imageURL: './assets/images/capa_filme.jpg'
},
];


export default class MovieService {
static toEntity(d) {
return MovieEntity.fromDto(d);
}


static async listar() {
return mem.map(this.toEntity);
}


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
mem.push(novo);
return { ok: true, movie: this.toEntity(novo) };
}


static async atualizarMovie(dto) {
this.validar(dto);
const idx = mem.findIndex(x => String(x.id) === String(dto.id));
if (idx === -1) throw new Error('Filme não encontrado');
mem[idx] = { ...mem[idx], ...dto };
return { ok: true, movie: this.toEntity(mem[idx]) };
}


static async removerMovie(id) {
const idx = mem.findIndex(x => String(x.id) === String(id));
if (idx === -1) return false;
mem.splice(idx, 1);
return true;
}
}