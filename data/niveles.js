// Lista de puntos de experiencia a obtener por nivel

/**
 * @memberof module:data
 * @const {number[]} niveles
 * @description Lista de puntos de experiencia a obtener por nivel
 * @default [10, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 100000]
 */
const niveles = [10, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 100000];

/** 
 * @memberof module:data
 * @function calcularNivel
 * @description Calcula el nivel de un usuario a partir de sus puntos de experiencia
 * @param {number} puntos - Puntos de experiencia del usuario
 * @returns {number[]} - Nivel del usuario, puntos restantes para el siguiente nivel, puntos necesarios para el siguiente nivel
*/
function calcularNivel(puntos) {
    let nivel = 1;
    let restantes = puntos;
    for (let i = 0; i < niveles.length; i++) {
        if (restantes >= niveles[i]) {
            nivel++;
            restantes -= niveles[i];
        } else break;
    }
    let necesarios = (nivel <= niveles.length) ? niveles[nivel - 1] : 0;
    return [nivel, restantes, necesarios];
};

module.exports = { calcularNivel, niveles };