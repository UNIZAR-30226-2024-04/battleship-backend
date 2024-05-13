const mongoose = require('mongoose');
const { iniciarSesion } = require('../../controllers/perfilController');
const {mongoURI} = require('../../uri');
// Conexión a la base de datos
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Conectado a MongoDB...');
    try {

      const perfiles = [
        { nombreId: 'usuario1', contraseña: 'Passwd1.'},
        { nombreId: 'usuario1', contraseña: 'Passwd1.', extra: 1},  // Sobran campos
        { nombreId: 'usuario3'},    // No existente
        { nombreId: 'usuario1', contraseña: 'Passwd2.'},    // Contraseña inválida
      ];

      for (const perfil of perfiles) {
        const req = { body: perfil };
        const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
        await iniciarSesion(req, res);
      }
    } catch (error) {
      console.error('Error en el test de crear perfil:', error);
    } finally {
      // Cierra la conexión a la base de datos al finalizar
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('No se pudo conectar a MongoDB...', err));





