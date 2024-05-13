const mongoose = require('mongoose');
// MongoDB no ofrece funcionalidad de campos publicos o privados
// La privacidad de los datos la manejamos en el servidor/API

const Schema = mongoose.Schema;
const habilidadesDisponibles = require('../data/habilidades');
const paisesDisponibles = require('../data/paises');
const Tablero = require('../data/tablero');

/**
 * @typedef {Object} Perfil
 * @memberof module:perfil
 * @property {String} nombreId - Nombre de usuario
 * @property {String} contraseña - Contraseña usuario
 * @property {paisesDisponibles} pais - País de residencia del usuario
 * @property {String[]} listaAmigos - Lista de amigos del usuario
 * @property {String[]} listaSolicitudes - Lista de solicitudes de amistad
 * @property {Number} trofeos - Trofeos del usuario (ELO)
 * @property {Number} puntosExperiencia - Puntos que determinan el nivel del usuario
 * @property {Tablero} tableroInicial - Lista barcos del jugador
 * @property {habilidadesDisponibles[]} mazoHabilidades - Habilidades(enteros) elegidas de una lista fija
 * @property {String} correo - Correo electrónico del usuario
 * @property {Number} partidasJugadas - Total de partidas jugadas
 * @property {Number} partidasGanadas - Total de partidas ganadas
 * @property {Number} barcosHundidos - Total de barcos hundidos
 * @property {Number} barcosPerdidos - Total de barcos perdidos
 * @property {Number} disparosAcertados - Total de disparos acertados
 * @property {Number} disparosFallados - Total de disparos fallados
 * @property {Number} codigoPartidaActual - Código de la partida actual
 * @description Tipo de dato Perfil, formado por los datos de un usuario
 * @requires module:data~paisesDisponibles
 * @requires module:data~habilidadesDisponibles
 */

// Perfil Schema
const perfilSchema = new Schema({
  nombreId: {                     // IDENTIFICADOR OBLIGATORIO: Nombre de usuario
    type: String, 
    required: true,
    unique: true
  },
  contraseña: {              // OBLIGATORIA: Contraseña usuario
    type: String, 
    required: true 
  },
  pais: {                   // País de residencia del usuario
    type: String, 
    enum: paisesDisponibles,
    default: ''
  },
  listaAmigos: {             // Lista de amigos del usuario
    type: [String],          // Lista de nombreId
    default: [] 
  },
  listaSolicitudes: {        // Lista de solicitudes de amistad
    type: [String],          // Lista de nombreId
    default: []
  },
  trofeos: {                 // Trofeos del usuario (ELO)
    type: Number, 
    default: 0 
  },
  puntosExperiencia: {       // Puntos que determinan el nivel del usuario
    type: Number, 
    default: 0 
  },
  tableroInicial: {           // Lista barcos del jugador 
    type: Tablero,
    required: true
  },
  mazoHabilidades: {  // Habilidades(enteros) elegidas de una lista fija
    type: [{
      type: String,
      enum: habilidadesDisponibles}], 
    default: [] 
  },
  correo: {                  // OBLIGATORIO: Correo electrónico del usuario
    type: String, 
    required: true 
  },
  partidasJugadas: {         // Estadísticas de partidas: Jugadas, ganadas, etc
    type: Number,
     default: 0 
  },
  partidasGanadas: { 
    type: Number, 
    default: 0 
  },
  barcosHundidos: {   // Estadísticas de barcos hundidos y perdidos
    type: Number, 
    default: 0 
  },
  barcosPerdidos: { 
    type: Number, 
    default: 0 
  },
  disparosAcertados: {        // Estadísticas de disparos acertados y fallados
    type: Number, 
    default: 0 
  },
  disparosFallados: { 
    type: Number, 
    default: 0 
  },
  codigoPartidaActual: {      // Código de la partida actual
    type: Number,
    default: -1
  },
  torneosParticipados: {      // Lista de torneos en los que ha participado
    type: [String],           // Almacenamos el código de los torneos
    default: []
  },
  tornesGanados: {            // Lista de torneos ganados
    type: [String],
    default: []
  }
});

const Perfil = mongoose.model('Perfil', perfilSchema, 'Perfiles');  // Perfiles es la colección de perfiles de BattleshipDB

module.exports = Perfil;
