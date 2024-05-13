const mongoose = require('mongoose');
const { modificarMazo } = require('../../controllers/perfilController');
const {mongoURI} = require('../../uri');
// Conexión a la base de datos
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Conectado a MongoDB...');
    try {
      const perfiles = [
        { nombreId: 'usuario1', mazoHabilidades: ['Rafaga']},
        { nombreId: 'usuario1', mazoHabilidades: ['Rafaga', 'Mina']},
        { nombreId: 'usuario1', mazoHabilidades: ['Rafaga', 'Mina', 'Sonar']}, 
        { nombreId: 'usuario1', mazoHabilidades: ['Rafaga', 'Mina', 'Sonar'], extra: 1},  // Sobran campos
        { nombreId: 'usuario3', mazoHabilidades: ['Rafaga', 'Mina', 'Sonar'] },  // No existente
        { mazoHabilidades: ['Rafaga', 'Mina', 'Sonar'] },                        // Falta un campo
        { nombreId: 'usuario1', mazoHabilidades: ['Rafaga', 'Mina', 'Sonar', 'Teledirigido']},  // Demasiadas habilidades
        { nombreId: 'usuario1', mazoHabilidades: ['Rafaga', 'Mina', 'Bomba']} // Habilidad no disponible
      ];

      for (const perfil of perfiles) {
        const req = { body: perfil };
        const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
        await modificarMazo(req, res);
      }
    } catch (error) {
      console.error('Error en el test de crear perfil:', error);
    } finally {
      // Cierra la conexión a la base de datos al finalizar
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('No se pudo conectar a MongoDB...', err));





