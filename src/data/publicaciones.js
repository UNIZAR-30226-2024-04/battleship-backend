/**
 * @memberof module:data
 * @const {Object} publicacionesPredeterminadas
 * @description Lista de publicaciones predeterminadas
 * @default { 0: {texto_inicial: "¡He alcanzado el nivel ", texto_final: "!"}, 1: {texto_inicial: "¡He superado los ", texto_final: " trofeos!"}, 2: {texto_inicial: "¡He ganado ", texto_final: " partidas!"}, 3: {texto_inicial: "¡He jugado ", texto_final: " partidas!"}, 4: {texto_inicial: "¡He ganado el torneo ", texto_final: "!"}}
 */

// Una publicación es un objeto con un identificador, un usuario, un texto y una lista de reacciones.
// El texto es predeterminado

// Lista de publicaciones predeterminadas
const publicacionesPredeterminadas = {
    0: {texto_inicial: "¡He alcanzado el nivel ", texto_final: "!"},
    1: {texto_inicial: "¡He superado los ", texto_final: " trofeos!"},
    2: {texto_inicial: "¡He ganado ", texto_final: " partidas!"},
    3: {texto_inicial: "¡He jugado ", texto_final: " partidas!"},
    4: {texto_inicial: "¡He ganado el torneo ", texto_final: "!"}
};

module.exports = publicacionesPredeterminadas;