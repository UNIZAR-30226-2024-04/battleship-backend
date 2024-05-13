const mongoose = require('mongoose');
const { actualizarEstadisticas } = require('../../controllers/perfilController');

// Conexión a la base de datos
mongoose.connect('mongodb://localhost/BattleshipDB')
  .then(async () => {
    console.log('Conectado a MongoDB...');
    try {
      const perfiles = [
        { nombreId: 'usuario1', victoria: 1, nuevosBarcosHundidos: 1, nuevosBarcosPerdidos:1, 
            nuevosDisparosAcertados: 1, nuevosDisparosFallados: 1 },   // Victoria no competitiva
        { nombreId: 'usuario1', victoria: 0, nuevosBarcosHundidos: 1, nuevosBarcosPerdidos:1, 
            nuevosDisparosAcertados: 1, nuevosDisparosFallados: 1 },   // Derrota no competitiva
        { nombreId: 'usuario1', victoria: 1, nuevosBarcosHundidos: 1, nuevosBarcosPerdidos:1, 
            nuevosDisparosAcertados: 1, nuevosDisparosFallados: 1, nuevosTrofeos: 30},   // Victoria competitiva
        { nombreId: 'usuario1', victoria: 0, nuevosBarcosHundidos: 1, nuevosBarcosPerdidos:1, 
            nuevosDisparosAcertados: 1, nuevosDisparosFallados: 1, nuevosTrofeos: 20},   // Derrota competitiva
        { nombreId: 'usuario3', victoria: 1, nuevosBarcosHundidos: 1, nuevosBarcosPerdidos:1, 
            nuevosDisparosAcertados: 1, nuevosDisparosFallados: 1, extra: 1}, // Sobran campos
        { nombreId: 'usuario1', victoria: 1, nuevosBarcosHundidos: 1, nuevosBarcosPerdidos:1, 
            nuevosDisparosAcertados: 1, nuevosDisparosFallados: 'a' }, // Campos no numéricos
        { nombreId: 'usuario3', victoria: 1, nuevosBarcosHundidos: 1, nuevosBarcosPerdidos:1, 
            nuevosDisparosAcertados: 1, nuevosDisparosFallados: 1 },  // No existente
        { victoria: 1, nuevosBarcosHundidos: 1, nuevosBarcosPerdidos:1, 
            nuevosDisparosAcertados: 1, nuevosDisparosFallados: 1 }, // Falta nombreId

      ];

      for (const perfil of perfiles) {
        const req = { body: perfil };
        const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
        await actualizarEstadisticas(req, res);
      }
    } catch (error) {
      console.error('Error en el test de crear perfil:', error);
    } finally {
      // Cierra la conexión a la base de datos al finalizar
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('No se pudo conectar a MongoDB...', err));





