const express = require('express');
const router = express.Router();
const publicacionController = require('../controllers/publicacionController');
const verificarToken = require('../middlewares/authjwt');

// Ruta para crear publicacion
router.post('/crearPublicacion', verificarToken, publicacionController.crearPublicacion);

// Ruta para obtener publicaciones de un usuario
router.post('/obtenerPublicaciones', publicacionController.obtenerPublicaciones);

// Ruta para reaccionar a una publicacion
router.post('/reaccionarPublicacion', verificarToken, publicacionController.reaccionarPublicacion);

// Ruta para eliminar una publicacion
router.post('/eliminarPublicacion', verificarToken, publicacionController.eliminarPublicacion);