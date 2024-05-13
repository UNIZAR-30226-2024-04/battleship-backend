const mongoose = require('mongoose');
const { reaccionarPublicacion, getPublicacionesPerfil } = require('../../controllers/publicacionController');
const {mongoURI} = require('../../uri');
// Conexión a la base de datos
mongoose.connect(mongoURI)
    .then(async () => {
        console.log('Conectado a MongoDB...');
        try {
            // Obtiene las publicaciones de un usuario para las pruebas
            const publicacionUsuario = getPublicacionesPerfil('usuario1');
            const publicacionId0 = publicacionUsuario[0].publicacionId;
            const publicacionId1 = publicacionUsuario[1].publicacionId;
            // Lista de publicaciones y reacciones a crear
            const reacciones = [
                {publicacionId: publicacionId0, nombreId: 'usuario1', reaccionId: 0}, // Publicación existente
                {publicacionId: publicacionId0, nombreId: 'usuario1', reaccionId: 1}, // Publicación reaccionada
                {publicacionId: publicacionId0, nombreId: 'usuario2', reaccionId: 1}, // Segundo usuario reacciona
                {nombreId: 'usuario1', reaccionId: 0},                                // Falta publicacionId
                {publicacionId: publicacionId0, reaccionId: 0},                       // Falta nombreId
                {publicacionId: publicacionId0, nombreId: 'usuario1'},                // Falta reaccionId
                {publicacionId: publicacionId0, nombreId: 'usuario1', reaccionId: 0, extra: 1}, // Sobran campos
                {publicacionId: 'NOEXISTE', nombreId: 'usuario1'},                  // Publicación no existe
                {publicacionId: publicacionId1, nombreId: 'NOEXISTE'},              // Usuario no existe

            ];
            // Itera sobre la lista de publicaciones y crea cada una
            for (const reaccion of reacciones) {
                const req = { body: reaccion };
                const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
                await reaccionarPublicacion(req, res); // Espera a que se complete la reaccion
            }
        } catch (error) {
            console.error('Error en el test de reaccionar publicacion', error);
        } finally {
            // Cierra la conexión a la base de datos al finalizar
            mongoose.disconnect();
        }
    })
    .catch(err => console.error('No se pudo conectar a MongoDB...', err));