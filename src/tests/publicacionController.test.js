const mongoose = require('mongoose');
const {registrarUsuario} = require('../controllers/perfilController');
const Perfil = require('../models/perfilModel');
const Publicacion = require('../models/publicacionModel');
const {crearPublicacion, obtenerPublicaciones, 
    reaccionarPublicacion, eliminarPublicacion} = require('../controllers/publicacionController');
const e = require('express');

const mongoURI = 'mongodb://localhost/BattleshipDB';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, 
  useCreateIndex: true, useFindAndModify: false});

// redirect console.log and console.error to /dev/null
console.error = function() {};
console.log = function() {};

// Test for crearPublicacion
describe('Crear publicacion', () => {
    beforeAll(async () => {
        const connection = mongoose.connection;
        await connection.dropDatabase();
        
        const req = { body: { nombreId: 'usuario1', contraseña: 'Passwd1.',
        correo: 'usuario1@example.com' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await registrarUsuario(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);

        // Aumentar el nivel del usuario
        await Perfil.updateOne({nombreId: 'usuario1'}, {puntosExperiencia: 20});
    });
    it('Debería crear una publicación correctamente con nivel 1', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 0, nivel : 1 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);

        const publicaciones = await Publicacion.find({usuario: 'usuario1'});
        expect(publicaciones.length).toBe(1);
    });
    it('Debería crear una publicación correctamente con 0 trofeos', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 1, trofeos : 0 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);

        const publicaciones = await Publicacion.find({usuario: 'usuario1'});
        expect(publicaciones.length).toBe(2);
    });
    it('Debería crear una publicación correctamente con 0 partidas ganadas', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 2, partidasGanadas : 0 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);

        const publicaciones = await Publicacion.find({usuario: 'usuario1'});
        expect(publicaciones.length).toBe(3);
    });
    it('Debería crear una publicación correctamente con 0 partidas jugadas', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 3, partidasJugadas : 0 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);

        const publicaciones = await Publicacion.find({usuario: 'usuario1'});
        expect(publicaciones.length).toBe(4);
    });
    it('Debería crear una publicación correctamente con un torneo ganado', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 4, torneo : 'Inaugural' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);

        const publicaciones = await Publicacion.find({usuario: 'usuario1'});
        expect(publicaciones.length).toBe(5);
    });
    it('Debería fallar al crear una publicación con demasiado campos', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 4, torneo : 'Inaugural' , nivel : 1} };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al crear una publicación sin usuario', async () => {
        const req = { body: { tipoPublicacion: 0, nivel : 1 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al crear una publicación sin tipo de publicación', async () => {
        const req = { body: { nombreId: 'usuario1', nivel : 1 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al crear una publicación con tipo de publicación inválido', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 'a', nivel : 1 } };
        const res = { json: () => {}, status: function(s) { 
            this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
        });
    it('Debería fallar al crear una publicación sin nivel', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 0} };
        const res = { json: () => {}, status: function(s) { 
            this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
        });
    it('Debería fallar al crear una publicación con nivel inválido', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 0, nivel : 'a' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al crear una publicación con un nivel superior al permitido', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 0, nivel : 6 } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al crear una publicación sin trofeos', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 1} };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al crear una publicación con trofeos inválidos', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 1, trofeos : 'a' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al crear una publicación con demasiados trofeos', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 1, trofeos : 1001 } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al crear una publicación sin partidas ganadas', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 2} };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al crear una publicación con partidas ganadas inválidas', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 2, partidasGanadas : 'a' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al crear una publicación con demasiadas partidas ganadas', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 2, partidasGanadas : 1001 } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al crear una publicación sin partidas jugadas', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 3} };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al crear una publicación con partidas jugadas inválidas', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 3, partidasJugadas : 'a' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al crear una publicación con demasiadas partidas jugadas', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 3, partidasJugadas : 1001 } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al crear una publicación sin torneo', async () => {
        const req = { body: { nombreId: 'usuario1', tipoPublicacion: 4 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
});

// Test for obtenerPublicaciones
describe('Obtener publicaciones', () => {
    beforeAll(async () => {
        const connection = mongoose.connection;
        await connection.dropDatabase();
        const req = { body: { nombreId: 'usuario1', contraseña: 'Passwd1.',
        correo: 'usuario1@example.com' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await registrarUsuario(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);

        // Crear publicación
        const req2 = { body: { nombreId: 'usuario1', tipoPublicacion: 0, nivel : 1 } };
        const res2 = { json: function(_json) { this._json = _json; return this;},
            status: function(s) { this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPublicacion(req2, res2);
        } catch (error) {}
        publicacionId = res2._json.publicacionId;
        expect(res2.statusCode).toBe(undefined);
    });
    it('Debería obtener las publicaciones de un usuario correctamente', async () => {
        const req = { body: { nombreId: 'usuario1' } };
        const res = { json: function(_json) { this._json = _json; return this;},
            status: function(s) { this.statusCode = s; return this; }, send: () => {} };
        try {
            await obtenerPublicaciones(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);
        expect(res._json.length).toBe(1);
        expect(res._json[0].publicacionId).toBe(publicacionId);
    });
    it('Debería fallar al obtener las publicaciones de un usuario inexistente', async () => {
        const req = { body: { nombreId: 'usuario2' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await obtenerPublicaciones(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
    it('Debería fallar al obtener las publicaciones de un usuario sin nombre', async () => {
        const req = { body: { } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await obtenerPublicaciones(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
});

// Test for reaccionarPublicacion
let publicacionId;
describe('Reaccionar a publicación', () => {
    beforeAll(async () => {
        const connection = mongoose.connection;
        await connection.dropDatabase();
        const req = { body: { nombreId: 'usuario1', contraseña: 'Passwd1.',
        correo: 'usuario1@example.com' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await registrarUsuario(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);
        const req2 = { body: { nombreId: 'usuario2', contraseña: 'Passwd2.',
        correo: 'usuario2@example.com' } };
        const res2 = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await registrarUsuario(req2, res2);
        } catch (error) {}
        expect(res2.statusCode).toBe(undefined);
        const req3 = { body: { nombreId: 'usuario1', tipoPublicacion: 0, nivel : 1 } };
        const res3 = { json: function(_json) { this._json = _json; return this;},
            status: function(s) { this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPublicacion(req3, res3);
        } catch (error) {}
        publicacionId = res3._json.publicacionId;
        expect(res3.statusCode).toBe(undefined);
        expect(res3._json.publicacionId).not.toBe(undefined);
        console.log(res3._json);
    });
    it('Debería reaccionar a una publicación correctamente', async () => {
        const req = { body: { nombreId: 'usuario2', publicacionId: publicacionId, 
            reaccionId: 0 } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await reaccionarPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);

        const publicacion = await Publicacion.findOne({publicacionId: publicacionId});
        expect(publicacion.reacciones.length).toBe(1);
    });
    it('Debería fallar al reaccionar a una publicación con demasiados campos', async () => {
        const req = { body: { nombreId: 'usuario2', publicacionId: publicacionId,
            reaccionId: 0, nivel : 1 } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await reaccionarPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al reaccionar a una publicación inexistente', async () => {
        const req = { body: { nombreId: 'usuario2', publicacionId: 1,
            reaccionId: 0 } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await reaccionarPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
    it('Debería fallar al reaccionar a una publicación sin usuario', async () => {
        const req = { body: { publicacionId: publicacionId, reaccionId: 0 } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
            , send: () => {} };
            try {
                await reaccionarPublicacion(req, res);
            } catch (error) {}
            expect(res.statusCode).toBe(400);
        });
    it('Debería fallar al reaccionar a una publicación con un usuario inexistente', async () => {
        const req = { body: { nombreId: 'usuario3', publicacionId: publicacionId,
            reaccionId: 0 } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
            , send: () => {} };
        try {
            await reaccionarPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
    it('Debería fallar al reaccionar a una publicación sin publicación', async () => {
        const req = { body: { nombreId: 'usuario2', reaccionId: 0 } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await reaccionarPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al reaccionar a una publicación sin reacción', async () => {
        const req = { body: { nombreId: 'usuario2', publicacionId: publicacionId } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await reaccionarPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al reaccionar a una publicación con reacción inválida', async () => {
        const req = { body: { nombreId: 'usuario2', publicacionId: publicacionId, 
            reaccionId: -1 } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await reaccionarPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al reaccionar a una publicación con reacción no numérica', async () => {
        const req = { body: { nombreId: 'usuario2', publicacionId: publicacionId, 
            reaccionId: 'LIKE' } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await reaccionarPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
});

// Test for eliminarPublicacion
describe('Eliminar publicación', () => {
    beforeAll(async () => {
        const connection = mongoose.connection;
        await connection.dropDatabase();
        const req = { body: { nombreId: 'usuario1', contraseña: 'Passwd1.',
        correo: 'usuario1@example.com' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await registrarUsuario(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);
        const req2 = { body: { nombreId: 'usuario2', contraseña: 'Passwd2.',
        correo: 'usuario2@example.com' } };
        const res2 = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await registrarUsuario(req2, res2);
        } catch (error) {}
        expect(res2.statusCode).toBe(undefined);
        const req3 = { body: { nombreId: 'usuario1', tipoPublicacion: 0, nivel : 1 } };
        const res3 = { json: function(_json) { this._json = _json; return this;},
            status: function(s) { this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPublicacion(req3, res3);
        } catch (error) {}
        publicacionId = res3._json.publicacionId;
        expect(res3.statusCode).toBe(undefined);
        expect(res3._json.publicacionId).not.toBe(undefined);
        console.log(res3._json);
    });
    it('Debería fallar al no ser el dueño de la publicación', async () => {
        const req = { body: { nombreId: 'usuario2', publicacionId: publicacionId } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await eliminarPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(403);
    });
    it('Debería eliminar una publicación correctamente', async () => {
        const req = { body: { nombreId: 'usuario1', publicacionId: publicacionId } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await eliminarPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);

        const publicacion = await Publicacion.findOne({publicacionId: publicacionId});
        expect(publicacion).toBe(null);
    });
    it('Debería fallar al eliminar una publicación con demasiados campos', async () => {
        const req = { body: { nombreId: 'usuario1', publicacionId: publicacionId, nivel : 1 } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await eliminarPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al eliminar una publicación inexistente', async () => {
        const req = { body: { nombreId: 'usuario1', publicacionId: 1 } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await eliminarPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
    it('Debería fallar al eliminar una publicación sin usuario', async () => {
        const req = { body: { publicacionId: publicacionId } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
            , send: () => {} };
            try {
                await eliminarPublicacion(req, res);
            } catch (error) {}
            expect(res.statusCode).toBe(400);
        });
    it('Debería fallar al eliminar una publicación con un usuario inexistente', async () => {
        const req = { body: { nombreId: 'usuario3', publicacionId: publicacionId } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
            , send: () => {} };
        try {
            await eliminarPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
    it('Debería fallar al eliminar una publicación sin publicación', async () => {
        const req = { body: { nombreId: 'usuario1' } };
        const res = { json: () => {}, status: function(s) {
            this.statusCode = s; return this; }
        , send: () => {} };
        try {
            await eliminarPublicacion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    afterAll(async () => {
      mongoose.disconnect();
    });
});