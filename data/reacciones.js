/**
 * @memberof module:data
 * @const reaccionesDisponibles
 * @description Lista de reacciones disponibles para las publicaciones
 * @default ['LIKE', 'DISLIKE', 'XD', ':)', ':(', 'OK!', 'LOL', 'OMG', 'WOW']
 */
// Lista de reacciones disponibles
const reaccionesDisponibles = [ 'LIKE', 'DISLIKE', 'XD', ':)', ':(', 'OK!', 'LOL', 'OMG', 'WOW'];

/**
 * @memberof module:data
 * @typedef {Object} Reaccion
 * @property {String} nombreId
 * @property {reaccionesDisponibles} estado - Estado de la reacción
 * @description Tipo de dato Reaccion, formado por un nombre de usuario y un estado de reacción
 * @example { nombreId: '1', estado: 'LIKE' }
 */
const Reaccion = {
    nombreId: { type: String, required: true },
    estado: { type: String, enum: reaccionesDisponibles, required: true, default: 'LIKE'}
};

module.exports.Reaccion = Reaccion;
module.exports.reaccionesDisponibles = reaccionesDisponibles;