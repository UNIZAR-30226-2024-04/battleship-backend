
/**
 * @typedef {Object} MensajeChat
 * @memberof module:chat
 * @property {String} mensaje - Mensaje del chat
 * @property {String} autor - Autor del mensaje
 * @property {Date} timestamp - Fecha y hora del mensaje
 */
const MensajeChat = {
    mensaje: { type: String, required: true },
    autor: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
};

module.exports = MensajeChat;