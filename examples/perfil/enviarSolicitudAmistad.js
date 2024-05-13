const mongoose = require('mongoose');
const {añadirAmigo, enviarSolicitudAmistad, } = require('../../controllers/perfilController');
const {mongoURI} = require('../../uri');
// Conexión a la base de datos
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Conectado a MongoDB...');
    try {
      // Crear 5 usuarios
      const { crearPerfil } = require('../../controllers/perfilController');
      const usuarios = ['usuario1', 'usuario2', 'usuario4', 'usuario5'];
      for (const usuario of usuarios) {
        const reqU = { body: { nombreId: usuario, contraseña: 'Passwd.1', correo: `${ usuario }@example.com` } };
        const resU = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
        await crearPerfil(reqU, resU);
      }
      
      // Añadir al usuario4 como amigo
      const req1 = { body: { nombreId: 'usuario1', nombreIdAmigo: 'usuario4'} };
      const res1 = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
      await enviarSolicitudAmistad(req1, res1);
      const req2 = { body: { nombreId: 'usuario4', nombreIdAmigo: 'usuario1'} };
      const res2 = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
      await añadirAmigo(req2, res2);     

      const tests = [ 
        { perfil: { nombreId: 'usuario1', nombreIdAmigo: 'usuario2' }, 
        resultado: {id: 200, mensaje: ''} },
        { perfil: { nombreId: 'usuario1', nombreIdAmigo: 'usuario2', extra: 1},
        resultado: {id: 400, mensaje: 'Sobra'} },
        { perfil: { nombreId: 'usuario1'},
        resultado: {id: 400, mensaje: 'Falta'} },
        { perfil: { nombreId: 'usuario1', nombreIdAmigo: 'usuario1'},
        resultado: {id: 404, mensaje: 'No puedes'} },
        { perfil: { nombreId: 'usuario3', nombreIdAmigo: 'usuario2'},
        resultado: {id: 404, mensaje: 'No se ha encontrado el perfil'} },
        { perfil: { nombreId: 'usuario1', nombreIdAmigo: 'usuario3'},
        resultado: {id: 404, mensaje: 'No se ha encontrado el amigo'} },
        { perfil: { nombreId: 'usuario2', nombreIdAmigo: 'usuario1'},
        resultado: {id: 404, mensaje: 'Ya se ha enviado'} },
        { perfil: { nombreId: 'usuario1', nombreIdAmigo: 'usuario4'},
        resultado: {id: 404, mensaje: 'Ya sois amigos'} }
      ];

      const perfiles = [
        { nombreId: 'usuario1', nombreIdAmigo: 'usuario2'},
        { nombreId: 'usuario1', nombreIdAmigo: 'usuario2', extra: 1},  // Sobran campos
        { nombreId: 'usuario3', nombreIdAmigo: 'usuario2'},    // No existente
        { nombreId: 'usuario1', nombreIdAmigo: 'usuario3'},
        { nombreId: 'usuario2', nombreIdAmigo: 'usuario1'}, // Usuario 1 ya envió solicitud
        { nombreId: 'usuario1', nombreIdAmigo: 'usuario4'}  // Usuario 4 ya es amigo
      ];

      for (const test of tests) {
        const req = { body: perfiles.shift() };
        const res = { json: () => {}, status: () => ({ send: () => {} }) };
        await enviarSolicitudAmistad(req, res);
        // Comprobar que el resultado es el esperado
        expect(res.status).toHaveBeenCalledWith(test.resultado.id);
        expect(res.json).toHaveBeenCalledWith({ mensaje: test.resultado.mensaje });
      }

      // Eliminar los usuarios creados
      const { eliminarPerfil } = require('../../controllers/perfilController');
      for (const usuario of usuarios) {
        const reqU = { body: { nombreId: usuario } };
        const resU = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
        await eliminarPerfil(reqU, resU);
      }

    } catch (error) {
      console.error('Error en el test de crear perfil:', error);
    } finally {
      // Cierra la conexión a la base de datos al finalizar
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('No se pudo conectar a MongoDB...', err));





