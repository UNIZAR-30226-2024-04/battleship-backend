const mongoose = require('mongoose');
const { crearPublicacion } = require('../../controllers/publicacionController');
const {mongoURI} = require('../../uri');
// Conexión a la base de datos
mongoose.connect(mongoURI)
    .then(async () => {
        console.log('Conectado a MongoDB...');
        try {
            // Lista de publicaciones a crear
            const publicaciones = [
                {usuario: 'usuario1', tipoPublicacion: 0},              // Tipos de publicaciones predeterminadas
                {usuario: 'usuario1', tipoPublicacion: 1},
                {usuario: 'usuario1', tipoPublicacion: 2},
                {usuario: 'usuario1', tipoPublicacion: 3},
                {usuario: 'usuario1', tipoPublicacion: 4},
                {usuario: 'NOEXISTE', tipoPublicacion: 0},              // Usuario no existe
                {usuario: 'usuario1', tipoPublicacion: 333},            // Tipo de publicación no existe
                {usuario: 'usuario1', tipoPublicacion: 4, extra: 1},    // Sobran campos
                {usuario: 'usuario1'},                                  // Falta campo tipoPublicacion
                {tipoPublicacion: 0}                                    // Falta campo usuario

            ];
            // Itera sobre la lista de publicaciones y crea cada una
            for (const publicacion of publicaciones) {
                const req = { body: publicacion };
                const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
                await crearPublicacion(req, res); // Espera a que se complete la creación del publicacion
            }
        } catch (error) {
            console.error('Error en el test de crear publicacion:', error);
        } finally {
            // Cierra la conexión a la base de datos al finalizar
            mongoose.disconnect();
        }
    })
    .catch(err => console.error('No se pudo conectar a MongoDB...', err));