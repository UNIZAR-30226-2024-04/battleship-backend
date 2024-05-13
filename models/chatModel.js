const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @module chat
 * @description Chat individual entre dos jugadores
 */

/**
 * @typedef {Object} Chat
 * @memberof module:chat
 * @property {String} nombreId1 - Perfil del jugador 1
 * @property {String} nombreId2 - Perfil del jugador 2
 * @property {MensajeChat[]} chat - Lista de mensajes del chat
 * @description Tipo de dato Chat
 * @example { nombreId1: 'pepe', nombreId2: 'juan', chat: [{ mensaje: 'Hola', nombreId: 'pepe', timestamp: '2021-05-02T00:00:00.000Z' }] }
 */
const chatSchema = new Schema({
  nombreId1: { // Perfil del jugador 1
    type: String, // NombreId del jugador
    required: true 
  },
  nombreId2: { // Perfil del jugador 2
    type: String, // NombreId del jugador
  },
  chat: {
    type: [{ mensaje: String, nombreId: String, timestamp: Date }],
    default: []
  }
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
