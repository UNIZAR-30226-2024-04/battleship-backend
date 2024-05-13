const mongoose = require('mongoose');
// MongoDB no ofrece funcionalidad de campos publicos o privados
// La privacidad de los datos la manejamos en el servidor/API

const Schema = mongoose.Schema;
const biomasDisponibles = require('../data/biomas')
const climasDisponibles = require('../data/climas');
const Tablero = require('../data/tablero');
const Coordenada = require('../data/coordenada');



/**
 * @memberof module:partida
 * @typedef {Object} Partida
 * @property {Number} codigo - Identificador de la partida
 * @property {MensajeChat[]} chat - Lista de mensajes del chat
 * @property {Number} contadorTurno - Jugador 1 juga si es impar, jugador 2 si es par
 * @property {String} nombreId1 - Identificador del jugador 1
 * @property {String} nombreId2 - Identificador del jugador 2
 * @property {Tablero} tableroBarcos1 - Lista barcos del jugador 1
 * @property {Tablero} tableroBarcos2 - Lista barcos del jugador 2
 * @property {Coordenada[]} disparosRealizados1 - Lista con los disparos realizados por J1
 * @property {Coordenada[]} disparosRealizados2 - Lista con los disparos realizados por J2
 * @property {String} clima - Clima actual Calma/Viento/Tormenta/Niebla
 * @property {Number} usosHab1 - Total de usos restantes de habilidades del J1
 * @property {Number} usosHab2 - Total de usos restantes de habilidades del J2
 * @property {Coordenada[]} minas1 - Lista con las minas colocadas por J1
 * @property {Coordenada[]} minas2 - Lista con las minas colocadas por J2
 * @property {String} bioma - Bioma en el que se va a jugar la partida y que se caracteriza por una mayor probabilidad de clima
 * @property {Boolean} amistosa - Indica si la partida es amistosa o no
 * @property {String} ganador - NombreId del jugador ganador
 */

// Partida Schema
const partidaSchema = new Schema({
  codigo: { // Identificador de la partida
    type: Number,
    required: true,
    unique: true
  },
  chat: {
    type: [{ mensaje: String, nombreId: String, timestamp: Date }],
    default: []
  },
  contadorTurno: { type: Number, default: 1}, // Jugador 1 juga si es impar, jugador 2 si es par
  nombreId1: { // Perfil del jugador 1
    type: String, // NombreId del jugador
    required: true 
  },
  nombreId2: { // Perfil del jugador 2
    type: String, // NombreId del jugador
  },
  tableroBarcos1: { // Lista barcos del jugador 1
    type: Tablero,
    required: true
  },
  tableroBarcos2: { // Lista barcos del jugador 2
    type: Tablero,
    required: true
  },
  disparosRealizados1: {  // Lista con los disparos realizados por J1
    type: [Coordenada],
    default: [] // Valor predeterminado como un array vacío
  },
  disparosRealizados2: {  // Lista con los disparos realizados por J2
    type: [Coordenada],
    default: [] // Valor predeterminado como un array vacío
  },
  clima: {  // Clima actual Calma/Viento/Tormenta/Niebla
    type: String,
    enum: climasDisponibles,
    default: 'Calma'
  },
  usosHab1: { // Total de usos restantes de habilidades del J1
    type: Number, 
    default: 3
  },
  usosHab2: { // Total de usos restantes de habilidades del J2
    type: Number, 
    default: 3
  },
  minas1: {  // Lista con las minas colocadas por J1
    type: [Coordenada],
    default: [] // Valor predeterminado como un array vacío
  },
  minas2: {  // Lista con las minas colocadas por J2
    type: [Coordenada],
    default: [] // Valor predeterminado como un array vacío
  },
  bioma: {  // Bioma en el que se va a jugar la partida y que se caracteriza por una mayor probabilidad de clima
    type: String,
    enum: biomasDisponibles,
    required: true
  },
  amistosa: {  // Indica si la partida es amistosa o no
    type: Boolean,
    default: false
  },
  torneo: { // Indica si la partida es parte de un torneo y el código del torneo
    type: String,
    default: '-1'    // -1: No es parte de un torneo, cualquier otro valor: Código del torneo
  },
  ganador: {  // NombreId del jugador ganador
    type: 'String',
    default: ''
  }
}, { timestamps: true }); // timestamps añade automáticamente campos para 'createdAt' y 'updatedAt'

const Partida = mongoose.model('Partida', partidaSchema, 'Partidas');
module.exports = Partida;


