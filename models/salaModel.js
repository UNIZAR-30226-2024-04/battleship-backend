const mongoose = require('mongoose');
// MongoDB no ofrece funcionalidad de campos publicos o privados
// La privacidad de los datos la manejamos en el servidor/API

const Schema = mongoose.Schema;
const biomasDisponibles = require('../data/biomas')
const climasDisponibles = require('../data/climas');
const Tablero = require('../data/tablero');
const Coordenada = require('../data/coordenada');



/**
 * @memberof module:sala
 * @typedef {Object} Sala
 * @property {Number} codigo - Identificador de la sala
 */

// Sala Schema
const salaSchema = new Schema({
  codigo: { // Identificador de la sala
    type: Number,
    required: true,
    unique: true
  },
  nombreId1: { // Perfil del jugador 1
    type: String, // NombreId del jugador
    required: true 
  },
  nombreId2: { // Perfil del jugador 2
    type: String, // NombreId del jugador
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
  torneo: { // Indica si la partida es parte de un torneo
    type: Boolean,
    default: false
  },
}, { timestamps: true }); // timestamps añade automáticamente campos para 'createdAt' y 'updatedAt'

const Sala = mongoose.model('Sala', salaSchema, 'Salas');
module.exports = Sala;


