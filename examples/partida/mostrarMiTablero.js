const mongoose = require('mongoose');
const { mostrarMiTablero } = require('../../controllers/partidaController');
const {mongoURI} = require('../../uri');
// Conexión a la base de datos
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Conectado a MongoDB...');
    try {
      // Lista de partidas a crear
      codigo = 983509919397;  // (Escribir el código de una partida existente)
      const partidas = [
        {codigo: codigo, nombreId: 'usuario1'}, 
        // {codigo: codigo, nombreId: 'usuario1', extra: 1},  // Sobran campos
        // {codigo: codigo, nombreId: 'aaaaa'}, // Jugador inválido
        // {codigo: 1, nombreId: 'usuario1'} // No existe la partida
      ];
      // Itera sobre la lista de partidas y crea cada una
      for (const partida of partidas) {
        const req = { body: partida };
        // const res = { json: function(_json) {this._json = _json; return this;}, status: function(s) { 
        //   this.statusCode = s; return this; }, send: () => {} };
        const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
        await mostrarMiTablero(req, res);
        //console.log(res.statusCode);
      }
    } catch (error) {
      console.error('Error en el test de mostrar+ mi Tablero:', error);
    } finally {
      // Cierra la conexión a la base de datos al finalizar
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('No se pudo conectar a MongoDB...', err));





