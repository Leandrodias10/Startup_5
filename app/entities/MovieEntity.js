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
category = '',
genre = '',
staff = '',
whereToWatch = '',
releaseDate = '', // YYYY-MM-DD
imageURL = '',
} = {}) {
this.id = normalizeId(id) ?? newId();
this.title = title;
this.synopsis = synopsis;
this.category = category;
this.genre = genre;
this.staff = staff;
this.whereToWatch = whereToWatch;
this.releaseDate = releaseDate;
this.imageURL = imageURL
}


static fromDto(d) {
return d ? new MovieEntity(d) : null;
}


get key() {
return String(this.id);
}
}