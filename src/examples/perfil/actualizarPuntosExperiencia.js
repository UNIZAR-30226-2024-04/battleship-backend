const mongoose = require('mongoose');
const { actualizarPuntosExperiencia } = require('../../controllers/perfilController');

// Conexión a la base de datos
mongoose.connect('mongodb://localhost/BattleshipDB')
  .then(async () => {
    console.log('Conectado a MongoDB...');
    try {
      const perfiles = [
        { nombreId: 'usuario1', nuevosPuntosExperiencia: 10},
        { nombreId: 'usuario3', nuevosPuntosExperiencia: 10, extra: 1}, // Sobran campos
        { nombreId: 'usuario1', nuevosPuntosExperiencia: 'a' }, // Campos no numéricos
        { nombreId: 'usuario3', nuevosPuntosExperiencia: 10 },  // No existente
        { nuevosPuntosExperiencia: 10 }, // Falta nombreId

      ];

      for (const perfil of perfiles) {
        const req = { body: perfil };
        const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
        await actualizarPuntosExperiencia(req, res);
      }
    } catch (error) {
      console.error('Error en el test de crear perfil:', error);
    } finally {
      // Cierra la conexión a la base de datos al finalizar
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('No se pudo conectar a MongoDB...', err));





