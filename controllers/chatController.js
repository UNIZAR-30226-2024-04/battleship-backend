const Chat = require('../models/chatModel');
const Perfil = require('../models/perfilModel');
/**
 * 
 * @memberof module:chat
 * @function obtenerChat
 * @description Obtiene un chat entre dos jugadores
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {String} req.body.nombreId1 - Perfil del jugador 1
 * @param {String} req.body.nombreId2 - Perfil del jugador 2
 * @param {Object} res - El objeto de respuesta HTTP, con el chatDevuelto en formato JSON
 * @example
 * peticion = { body: { nombreId1: 'pepe', nombreId2: 'juan' } }
 * respuesta = { json: { nombreId1: 'pepe', nombreId2: 'juan', chat: [{ mensaje: 'Hola', nombreId: 'pepe', timestamp: '2021-05-02T00:00:00.000Z' }] } }
 * await obtenerChat(peticion, respuesta)
 */
exports.obtenerChat = async (req, res) => {
    try {
        const { nombreId1, nombreId2, ...extraParams } = req.body;
        if (Object.keys(extraParams).length > 0) {
            res.status(400).send('Parámetros extra no permitidos');
            console.error('Parámetros extra no permitidos');
            return;
        }
        if (!nombreId1 || !nombreId2) {
            res.status(400).send('Faltan parámetros');
            console.error('Faltan parámetros');
            return;
        }
        let chat = await Chat.findOne({ nombreId1, nombreId2 });
        if (!chat) {
            chat = await Chat.findOne({ nombreId1: nombreId2, nombreId2: nombreId1 });
            if (!chat) {
                // Comprobar si los jugadores existen
                let perfil1 = await Perfil.findOne({ nombreId: nombreId1 });
                let perfil2 = await Perfil.findOne({ nombreId: nombreId2 });
                if (!perfil1 || !perfil2) {
                    res.status(404).send('Al menos uno de los jugadores no existe');
                    console.error('Al menos uno de los jugadores no existe');
                    return;
                }
            }
        }
        let chatDevuelto = {
            nombreId1: nombreId1,
            nombreId2: nombreId2,
            chat: chat ? chat.chat : []
        };
        for (let mensaje of chatDevuelto.chat) {
            mensaje._id = undefined;
        }
        res.json(chatDevuelto);
        console.log('Chat obtenido con éxito');
    } catch (error) {
        res.status(500).send('Hubo un error');
        console.error('Hubo un error');
    }
};

/**
 * @memberof module:chat
 * @function enviarMensaje
 * @description Envía un mensaje entre dos jugadores
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {String} req.body.nombreId1 - Perfil del jugador 1
 * @param {String} req.body.nombreId2 - Perfil del jugador 2
 * @param {String} req.body.mensaje - Mensaje a enviar
 * @param {Object} res - El objeto de respuesta HTTP, con el mensaje enviado en formato JSON
 * @example
 * peticion = { body: { nombreId1: 'pepe', nombreId2: 'juan', mensaje: 'Hola' }
 * respuesta = { json: { mensaje: 'Mensaje enviado con éxito' } }
 * await enviarMensaje(peticion, respuesta)
 */
exports.enviarMensaje = async (req, res) => {
    try {
        const { nombreId1, nombreId2, mensaje, ...extraParams } = req.body;
        if (Object.keys(extraParams).length > 0) {
            res.status(400).send('Parámetros extra no permitidos');
            console.error('Parámetros extra no permitidos');
            return;
        }
        if (!nombreId1 || !nombreId2 || !mensaje) {
            res.status(400).send('Faltan parámetros');
            console.error('Faltan parámetros');
            return;
        }
        let chat = await Chat.findOne({ nombreId1, nombreId2 });
        if (!chat) {
            chat = await Chat.findOne({ nombreId1: nombreId2, nombreId2: nombreId1 });
            if (!chat) {
                // Comprobar si los jugadores existen
                let perfil1 = await Perfil.findOne({ nombreId: nombreId1 });
                let perfil2 = await Perfil.findOne({ nombreId: nombreId2 });
                if (!perfil1 || !perfil2) {
                    res.status(404).send('Al menos uno de los jugadores no existe');
                    console.error('Al menos uno de los jugadores no existe');
                    return;
                }
                let mensajeChat = { mensaje, nombreId: nombreId1, timestamp: new Date() };
                chat = new Chat({ nombreId1, nombreId2, chat: [mensajeChat] });
                await chat.save();
                res.json({ mensaje, nombreId: nombreId1, timestamp: new Date() });
                console.log('Mensaje enviado con éxito (chat creado)');
                return;
            }
        }
        let mensajeChat = { mensaje, nombreId: nombreId1, timestamp: new Date() };
        await Chat.findOneAndUpdate(
            { nombreId1: chat.nombreId1, nombreId2: chat.nombreId2 }, 
            { $push: { chat:  mensajeChat } },
            { new: true });
        res.json(mensajeChat);
        console.log('Mensaje enviado con éxito');
    } catch (error) {
        res.status(500).send('Hubo un error');
        console.error('Hubo un error');
    }
};