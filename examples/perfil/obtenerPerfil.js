const mongoose = require('mongoose');
const { obtenerPerfil } = require('../../controllers/perfilController');
const {mongoURI} = require('../../uri');
// Conexión a la base de datos
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Conectado a MongoDB...');
    try {

      const perfiles = [
        { nombreId: 'usuario1'},
        { nombreId: 'usuario1', extra: 1},  // Sobran campos
        { nombreId: 'usuario3'},    // No existente
        { },  // Falta nombreId
      ];

      for (const perfil of perfiles) {
        const req = { body: perfil };
        const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
        await obtenerPerfil(req, res);
      }
    } catch (error) {
      console.error('Error en el test de crear perfil:', error);
    } finally {
      // Cierra la conexión a la base de datos al finalizar
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('No se pudo conectar a MongoDB...', err));





