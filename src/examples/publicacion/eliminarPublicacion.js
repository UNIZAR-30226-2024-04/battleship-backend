const mongoose = require('mongoose');
const { eliminarPublicacion, getPublicacionesPerfil } = require('../../controllers/publicacionController');

// Conexión a la base de datos
mongoose.connect('mongodb://localhost/BattleshipDB')
    .then(async () => {
        console.log('Conectado a MongoDB...');
        try {
            // Obtiene las publicaciones de un usuario para las pruebas
            const publicacionUsuario = getPublicacionesPerfil('usuario1');
            const publicacionId0 = publicacionUsuario[0].publicacionId;
            const publicacionId1 = publicacionUsuario[1].publicacionId;
            // Lista de publicaciones a eliminar
            const publicaciones = [
                {publicacionId: publicacionId0, nombreId: 'usuario1'},              // Publicación existente
                {nombreId: 'usuario1'},                                             // Falta publicacionId
                {publicacionId: publicacionId1},                                    // Falta nombreId
                {publicacionId: publicacionId1, nombreId: 'usuario1', extra: 1},    // Sobran campos
                {publicacionId: 'NOEXISTE', nombreId: 'usuario1'},                  // Publicación no existe
                {publicacionId: publicacionId1, nombreId: 'usuario2'},              // Sin permisos

            ];
            // Itera sobre la lista de publicaciones y crea cada una
            for (const publicacion of publicaciones) {
                const req = { body: publicacion };
                const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
                await eliminarPublicacion(req, res); // Espera a que se complete la eliminación del publicacion
            }
        } catch (error) {
            console.error('Error en el test de eliminar publicacion:', error);
        } finally {
            // Cierra la conexión a la base de datos al finalizar
            mongoose.disconnect();
        }
    })
    .catch(err => console.error('No se pudo conectar a MongoDB...', err));