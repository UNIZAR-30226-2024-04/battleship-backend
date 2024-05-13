const mongoose = require('mongoose');
const { getPublicacionesPerfil } = require('../../controllers/publicacionController');
const {mongoURI} = require('../../uri');
// Conexión a la base de datos
mongoose.connect(mongoURI)
    .then(async () => {
        console.log('Conectado a MongoDB...');
        try {
            // Lista de publicaciones a obtener
            const publicaciones = [
                {nombreId: 'usuario1'},             // Publicaciones existentes
                {nombreId: 'NOEXISTE'},             // Usuario no existe
                {},                                 // Falta nombreId
                {nombreId: 'usuario1', extra: 1},   // Sobran campos

            ];
            // Itera sobre la lista de publicaciones y crea cada una
            for (const publicacion of publicaciones) {
                const req = { body: publicacion };
                const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
                await getPublicacionesPerfil(req, res); // Espera a que se complete la obtencion del publicacion
            }
        } catch (error) {
            console.error('Error en el test de obtener publicacion:', error);
        } finally {
            // Cierra la conexión a la base de datos al finalizar
            mongoose.disconnect();
        }
    })
    .catch(err => console.error('No se pudo conectar a MongoDB...', err));