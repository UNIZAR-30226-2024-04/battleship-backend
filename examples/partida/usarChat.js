const mongoose = require('mongoose');
const { obtenerChat, enviarMensaje } = require('../../controllers/partidaController');
const {mongoURI} = require('../../uri');
// Conexión a la base de datos
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Conectado a MongoDB...');
    try {
      const codigo = 978712539047;
      // Lista de disparos realizados a crear
      const mensajes = [
        {codigo: codigo, autor: 1, mensaje: "Esto es una prueba"},
        {codigo: codigo, autor: 1, mensaje: "Snati coordina un poco"}, 
        {codigo: codigo, autor: 2, mensaje: "Luis es un pillo"}, 
        {codigo: codigo, autor: 1, mensaje: "La pelea no fue como esperábamos"},
        {codigo: codigo, autor: 1, mensaje: "MATINF4LIFE", extra: 1}, // Sobran campos
        {autor: 1, mensaje: "viva el rubio de francia"}, // Faltan campos
        {codigo: codigo, autor: 3, mensaje: "Amigas Ángel"}, // autor inválido
        {codigo: codigo, autor: 1, mensaje: "Si, soy Carlista"}, // Disparo inválido
        {codigo: 1, autor: 1, mensaje: "vais a haceros orla?"}, // Partida no existente
      ];

      // Itera sobre la lista de mensajes y los genera
      for (const mensaje of mensajes) {
        // Mesaje por consola
         // console.log('Mensaje:', mensaje);
        const req = { body: mensaje };
        const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
        await enviarMensaje(req, res); // Espera 
      }
    } catch (error) {
      console.error('Error en el test de mensajes:', error);
    } finally {
      // Cierra la conexión a la base de datos al finalizar
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('No se pudo conectar a MongoDB...', err));