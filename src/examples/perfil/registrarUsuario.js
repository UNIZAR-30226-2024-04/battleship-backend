const mongoose = require('mongoose');
const { registrarUsuario } = require('../../controllers/perfilController');

// Conexión a la base de datos
mongoose.connect('mongodb://localhost/BattleshipDB')
  .then(async () => {
    console.log('Conectado a MongoDB...');
    try {
      // Lista de perfiles a crear
      const perfiles = [
        { nombreId: 'usuario1', contraseña: 'Passwd1.', correo: 'usuario1@example.com' },
        { nombreId: 'usuario2', contraseña: 'Passwd2.', correo: 'usuario2@example.com' },
        { nombreId: 'usuario1', contraseña: 'Passwd1.', correo: 'usuario1@example.com', extra: 1 }, // Sobran campos
        { nombreId: 'usuario1', contraseña: 'Passwd3.', correo: 'usuario3@example.com' },  // Ya existente
        { contraseña: 'Passwd1.', correo: 'usuario1@example.com' },                        // Falta un campo
        { nombreId: 'usuario3', contraseña: 'passwd1.', correo: 'usuario1@example.com' }, // Contraseña inválida
        { nombreId: 'usuario3', contraseña: 'Passwd1.', correo: 'usuario1example.com' },  // Correo inválido
      ];

      // Itera sobre la lista de perfiles y crea cada uno
      for (const perfil of perfiles) {
        const req = { body: perfil };
        const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
        await registrarUsuario(req, res); // Espera a que se complete la creación del perfil
      }
      
    } catch (error) {
      console.error('Error en el test de crear perfil:', error);
    } finally {
      // Cierra la conexión a la base de datos al finalizar
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('No se pudo conectar a MongoDB...', err));





