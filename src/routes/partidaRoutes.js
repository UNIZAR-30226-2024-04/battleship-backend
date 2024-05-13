const express = require('express');
const router = express.Router();
const partidaController = require('../controllers/partidaController');
const verificarToken = require('../middlewares/authjwt');


// -------------------------------------------- //
// -------------- PARTIDA BASICA -------------- //
// -------------------------------------------- //

// Ruta para crear partida
router.post('/crearPartida', verificarToken, partidaController.crearPartida);

// Ruta para realizar disparo
router.post('/realizarDisparo', verificarToken, partidaController.realizarDisparo);

// Ruta para mostrar mi tablero
router.post('/mostrarMiTablero', verificarToken, partidaController.mostrarMiTablero);

// Ruta para mostrar tablero enemigo
router.post('/mostrarTableroEnemigo', verificarToken, partidaController.mostrarTableroEnemigo);

// Ruta para mostrar ambos tableros
router.post('/mostrarTableros', verificarToken, partidaController.mostrarTableros);

// Ruta para abandonar partida
router.post('/abandonarPartida', verificarToken, partidaController.abandonarPartida);

// -------------------------------------------- //
// ---------------- HABILIDADES --------------- //
// -------------------------------------------- //

// Ruta para disparo de un misil de ráfaga
router.post('/realizarDisparoMisilRafaga', verificarToken, partidaController.realizarDisparoMisilRafaga);

// Ruta para un turno de disparo de torpedo recargado
router.post('/realizarDisparoTorpedoRecargado', verificarToken, partidaController.realizarDisparoTorpedoRecargado);

// Ruta para disparo de un misil teledirigido
router.post('/realizarDisparoMisilTeledirigido', verificarToken, partidaController.realizarDisparoMisilTeledirigido);

// Ruta para colocar mina
router.post('/colocarMina', verificarToken, partidaController.colocarMina);

// Ruta para usar sonar
router.post('/usarSonar', verificarToken, partidaController.usarSonar);

// --------------------------------------------- //
// -------------- CHAT DE PARTIDA -------------- //
// --------------------------------------------- //

// Ruta para obtener el chat
router.post('/obtenerChat', verificarToken, partidaController.obtenerChat);

// Ruta para enviar mensaje
router.post('/enviarMensaje', verificarToken, partidaController.enviarMensaje);


module.exports = router;