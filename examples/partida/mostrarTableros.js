const mongoose = require('mongoose');
const { mostrarTableros } = require('../../controllers/partidaController');
const {mongoURI} = require('../../uri');
// Conexión a la base de datos
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Conectado a MongoDB...');
    try {
      // Lista de partidas a crear
      const partidas = [
        {codigo: 591028408640},             // (Escribir el código de una partida existente)
        {codigo: 591028408640, extra: 1},   // Sobran campos
        {codigo: 1}                         // No existe la partida
      ];
      // Itera sobre la lista de partidas y crea cada una
      for (const partida of partidas) {
        const req = { body: partida };
        const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
        await mostrarTableros(req, res);
      }
    } catch (error) {
      console.error('Error en el test de mostrar Tableros:', error);
    } finally {
      // Cierra la conexión a la base de datos al finalizar
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('No se pudo conectar a MongoDB...', err));





