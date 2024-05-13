const mongoose = require('mongoose');
const { realizarDisparo } = require('../../controllers/partidaController');

// Conexión a la base de datos
mongoose.connect('mongodb://localhost/BattleshipDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Conectado a MongoDB...');
    try {
      const codigo = 891471716883;
      // Lista de disparos realizados a crear
      const disparos = [
        // {codigo: codigo, nombreId: 1, i: 1, j: 1}, // Tocado
        // {codigo: codigo, nombreId: 1, i: 1, j: 2}, // No es el turno del jugador
        // {codigo: codigo, nombreId: 2, i: 1, j: 1}, 
        // {codigo: codigo, nombreId: 1, i: 1, j: 2}, // Hundido
        {codigo: codigo, nombreId: 'usuario1', i: 5, j: 9}, // Agua
        // {codigo: codigo, nombreId: 1, i: 1, j: 1}, // Repetido
        // {codigo: codigo, nombreId: 1, i: 1, j: 3, extra: 1}, // Sobran campos
        // {nombreId: 1, i: 1, j: 3}, // Faltan campos
        // {codigo: codigo, nombreId: 3, i: 1, j: 3}, // nombreId inválido
        // {codigo: codigo, nombreId: 1, i: -1, j: 11}, // Disparo inválido
        // {codigo: 1, nombreId: 1, i: 1, j: 3}, // Partida no existente
      ];

      // Itera sobre la lista de disparos y los genera
      for (const disparo of disparos) {
        const req = { body: disparo };
        let res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
          this.statusCode = s; return this; }, send: () => {} };
        await realizarDisparo(req, res); // Espera
        console.log('Disparo realizado:', res._json);
        if (res._json && res._json.turnosIA) {
          console.log('Turnos de la IA:', res._json.turnosIA);
        }
      }
    } catch (error) {
      console.error('Error en el test de disparos:', error);
    } finally {
      // Cierra la conexión a la base de datos al finalizar
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('No se pudo conectar a MongoDB...', err));





