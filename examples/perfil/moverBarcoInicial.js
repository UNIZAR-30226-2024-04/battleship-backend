const mongoose = require('mongoose');
const { moverBarcoInicial  } = require('../../controllers/perfilController');
const {mongoURI} = require('../../uri');
// Conexión a la base de datos
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Conectado a MongoDB...');
    try {
      const perfiles = [
        { nombreId: 'usuario1', barcoId: 0, iProaNueva: 3, jProaNueva: 3 },  // Trasladar
        { nombreId: 'usuario1', barcoId: 1, rotar: 1 },  // Rotar
        { nombreId: 'usuario1', barcoId: 3, iProaNueva: 1, jProaNueva: 6, rotar: 1 },  // Trasladar y rotar
        { nombreId: 'usuario1', barcoId: 0, iProaNueva: 3, jProaNueva: 3, extra: 1 },  // Sobran campos
        { barcoId: 0, iProaNueva: 3, jProaNueva: 3 },  // Falta nombreId
        { nombreId: 'usuario1', barcoId: 0, iProaNueva: 'a', jProaNueva: 3 },  // Campo no numérico
        { nombreId: 'usuario1', barcoId: 8, iProaNueva: 3, jProaNueva: 3 },  // barcoId no válido
        { nombreId: 'usuario1', barcoId: 0, iProaNueva: -1, jProaNueva: 3 },  // Coordenada fuera de rango
        { nombreId: 'usuario5', barcoId: 0, iProaNueva: 3, jProaNueva: 3 },  // Usuario no existente
        { nombreId: 'usuario1', barcoId: 0, iProaNueva: 2, jProaNueva: 10 },  // Fuera de rango al trasladar
        { nombreId: 'usuario1', barcoId: 4, rotar: 1 },  // Fuera de rango al rotar
        { nombreId: 'usuario1', barcoId: 0, iProaNueva: 1, jProaNueva: 6 },  // Colisión de barcos
      ];

      for (const perfil of perfiles) {
        const req = { body: perfil };
        const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
        await moverBarcoInicial(req, res);
      }
    } catch (error) {
      console.error('Error en el test de crear perfil:', error);
    } finally {
      // Cierra la conexión a la base de datos al finalizar
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('No se pudo conectar a MongoDB...', err));





