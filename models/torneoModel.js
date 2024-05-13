const mongoose = require('mongoose');
// MongoDB no ofrece funcionalidad de campos publicos o privados
// La privacidad de los datos la manejamos en el servidor/API



/**
 * 
 * 
 * 
 * 
 * 
 */

// Torneo Schema
const torneoSchema = new mongoose.Schema({
  codigo: { // Identificador del torneo
    type: String,
    required: true,
    unique: true
  },
  participantes: { // Lista de participantes
    type: [{nombreId: String, victorias: Number, derrotas: Number}],
    default: []
  },
  ganadores: { // Ganadores del torneo
    type: [{nombreId: String}],
    default: []
  },
  numeroVictorias: { // Número de victorias para ganar el torneo
    type: Number,
    required: true
  },
  numeroMaxDerrotas: { // Número máximo de derrotas permitidas
    type: Number,
    required: true
  }
});

const Torneo = mongoose.model('Torneo', torneoSchema, 'Torneos');
module.exports = Torneo;