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
title = '',
synopsis = '',
category = [],
genre = [],
staff = '',
whereToWatch = '',
releaseDate = '', // YYYY-MM-DD
imageURL = '',
watchLinks = {},  // Objeto para armazenar links (ex: { youtube: 'url', netflix: 'url' })
} = {}) {
this.id = normalizeId(id) ?? newId();
this.title = title;
this.synopsis = synopsis;
this.category = category;
this.genre = genre;
this.staff = staff;
this.whereToWatch = whereToWatch;
this.releaseDate = releaseDate;
this.imageURL = imageURL;
this.watchLinks = watchLinks
}




static fromDto(d) {
return d ? new MovieEntity(d) : null;
}

// --- NOVO MÉTODO FACTORY ADICIONADO ---
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

      // Verifica se o JSON parseado é um array
      if (Array.isArray(data)) {
        // Mapeia o array, convertendo cada item usando fromDto
        // O .filter(Boolean) remove quaisquer entradas nulas/inválidas
        return data.map(MovieEntity.fromDto).filter(Boolean);
      } else {
        // Converte o objeto único usando fromDto
        return MovieEntity.fromDto(data);
      }
    } catch (error) {
      console.error("Falha ao parsear JSON para MovieEntity:", error);
      // Retorna null se o JSON for inválido
      return null;
    }
  }

get key() {
return String(this.id);
}
}