const Coordenada = require('./coordenada');

/**
 * @memberof module:data
 * @const {String} barcosDisponibles
 * @description Tipos de barco posibles, con sus respectivos nombres
 * @enum {String}
 * @readonly
 * @default ['Patrullero', 'Destructor', 'Submarino', 'Acorazado', 'Portaviones']
 */
const barcosDisponibles = ['Patrullero', 'Destructor', 'Submarino', 'Acorazado', 'Portaviones'];

/**
 * @memberof module:data
 * @typedef {Object} Barco
 * @property {Coordenada[]} coordenadas.required - Coordenadas del barco
 * @property {barcosDisponibles} tipo.required - Tipo de barco
 * @memberof module:data/barco
 * @description Tipo de dato Barco, formado por un array de coordenadas y un tipo de barco
 */

// Definir el tipo de datos Barco
const Barco = {
    coordenadas: { type: [Coordenada], required: true },
    tipo: { type: String, required: true, enum: barcosDisponibles }
};
  
module.exports.Barco = Barco;
module.exports.barcosDisponibles = barcosDisponibles;