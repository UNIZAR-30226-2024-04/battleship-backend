const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');
const verificarToken = require('../middlewares/authjwt');
const verificarRegistro = require('../middlewares/verificarRegistro');

/*--------------------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------ PERFIL BÁSICO  ----------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------*/

// Ruta para obtener perfil
router.post('/obtenerUsuario', perfilController.obtenerUsuario);
// Ruta para obtener datos personales del perfil
router.post('/obtenerDatosPersonales', verificarToken, perfilController.obtenerDatosPersonales);
// Ruta para modificar datos personales del perfil
router.post('/modificarDatosPersonales', verificarToken, perfilController.modificarDatosPersonales);
// Ruta para eliminar usuario
router.post('/eliminarUsuario', perfilController.eliminarUsuario);

/*--------------------------------------------------------------------------------------------------------------------*/
/*----------------------------------------- REGISTRO E INICIO DE SESIÓN  ---------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------*/

// Ruta para registrar usuario
router.post('/registrarUsuario', verificarRegistro, perfilController.registrarUsuario);
// Ruta para iniciar sesión
router.post('/iniciarSesion', perfilController.iniciarSesion);

/*--------------------------------------------------------------------------------------------------------------------*/
/*------------------------------------------- ASPECTOS PARA PARTIDAS  ------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------*/

// Ruta para modificar mazo
router.post('/modificarMazo', verificarToken, perfilController.modificarMazo);
// Ruta para modificar tablero
router.post('/moverBarcoInicial', verificarToken, perfilController.moverBarcoInicial);

/*--------------------------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------- RED SOCIAL  ----------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------*/

// Ruta para obtener amigos
router.post('/obtenerAmigos', perfilController.obtenerAmigos);
// Ruta para añadir amigos
router.post('/agnadirAmigo', verificarToken, perfilController.agnadirAmigo);
// Ruta para eliminar amigos
router.post('/eliminarAmigo', verificarToken, perfilController.eliminarAmigo);
// Ruta para obtener solicitudes de amistad
router.post('/obtenerSolicitudesAmistad', verificarToken, perfilController.obtenerSolicitudesAmistad);
// Ruta para enviar solicitudes de amistad
router.post('/enviarSolicitudAmistad', verificarToken, perfilController.enviarSolicitudAmistad);
// Ruta para eliminar solicitudes de amistad
router.post('/eliminarSolicitudAmistad', verificarToken, perfilController.eliminarSolicitudAmistad);

module.exports = router;