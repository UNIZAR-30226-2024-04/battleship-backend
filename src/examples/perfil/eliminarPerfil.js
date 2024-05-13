const mongoose = require('mongoose');
const { eliminarPerfil } = require('../../controllers/perfilController');

// Conexión a la base de datos
mongoose.connect('mongodb://localhost/BattleshipDB')
  .then(async () => {
    console.log('Conectado a MongoDB...');
    try {
      const perfiles = [
        { nombreId: 'usuario2'},
        { nombreId: 'usuario2', extra: 1},  // Sobran campos
        { nombreId: 'usuario2'},    // No existente
        { },  // Falta nombreId
      ];

      for (const perfil of perfiles) {
        const req = { body: perfil };
        const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
        await eliminarPerfil(req, res);
      }
    } catch (error) {
      console.error('Error en el test de crear perfil:', error);
    } finally {
      // Cierra la conexión a la base de datos al finalizar
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('No se pudo conectar a MongoDB...', err));





