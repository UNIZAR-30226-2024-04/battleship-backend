const mongoose = require('mongoose');
const { crearPartida } = require('../../controllers/partidaController');

// Conexión a la base de datos
mongoose.connect('mongodb://localhost/BattleshipDB')
  .then(async () => {
    console.log('Conectado a MongoDB...');
    try {
      // Lista de partidas a crear
      const partidas = [
        //{nombreId1: 'usuario1', nombreId2: 'usuario2', bioma: 'Norte'}, // contra jugador
        {nombreId1: 'usuario1', bioma: 'Norte'}, // contra IA
        // {nombreId1: 'usuario1', nombreId2: 'usuario2', bioma: 'Norte', extra: 1},  // Sobran campos
        // {nombreId1: 'usuario1', bioma: 'Norte'}, // Jugador ya en partida
        // {nombreId1: 'usuario1', nombreId2: 'usuario2', bioma: 'Murcia'},  // Bioma no disponible
        // {nombreId1: 'usuario1', nombreId2: 'usuario5', bioma: 'Norte'} // No existe un jugador
      ];
      // Itera sobre la lista de partidas y crea cada una
      for (const partida of partidas) {
        const req = { body: partida };
        let res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
          this.statusCode = s; return this; }, send: () => {} };
        await crearPartida(req, res); // Espera a que se complete la creación del partida
        console.log('Partida creada:', res._json);
      }
    } catch (error) {
      console.error('Error en el test de crear partida:', error);
    } finally {
      // Cierra la conexión a la base de datos al finalizar
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('No se pudo conectar a MongoDB...', err));





