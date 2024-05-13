const got = require('got');
const mongoose = require('mongoose');
const { base } = require('../models/partidaModel');
const paisesDisponibles = require('../data/paises');
const habilidadesDisponibles = require('../data/habilidades');

// definir las URI a testear
const baseURI = 'http://localhost:8080';
const basePerfilURI = baseURI + '/perfil';
const registrarUsuarioURI = basePerfilURI + '/registrarUsuario';
const iniciarSesionURI = basePerfilURI + '/iniciarSesion';
const obtenerUsuarioURI = basePerfilURI + '/obtenerUsuario';
const obtenerDatosPersonalesURI = basePerfilURI + '/obtenerDatosPersonales';
const modificarDatosPersonalesURI = basePerfilURI + '/modificarDatosPersonales';
const modificarMazoURI = basePerfilURI + '/modificarMazo';
const moverBarcoInicialURI = basePerfilURI + '/moverBarcoInicial';
const eliminarUsuarioURI = basePerfilURI + '/eliminarUsuario';

// definir las credenciales de prueba
const credenciales = {
    nombreId: 'usuario',
    correo: 'usuario@example.com',
    contraseña: 'Passwd1.'
};

// Conexión a la base de datos para borrarla
const mongoURI = 'mongodb://localhost/BattleshipDB';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, 
  useCreateIndex: true, useFindAndModify: false});

// redirect console.log and console.error to /dev/null
console.error = function() {};
console.log = function() {};

var token = '';
// Test de integración
describe('Pruebas de integración', function() {
    beforeAll(async () => {
        const connection = mongoose.connection;
        await connection.dropDatabase();
    });
    it('Registrar usuario mediante la ruta', async () => {
        token = await got.post(registrarUsuarioURI, {
            json: credenciales
        })
        .then(response => {
            response.body = JSON.parse(response.body);
            token = response.body.token;
            expect(response.statusCode).toBe(200);
            return token;
        });
    });
    it('Iniciar sesión mediante la ruta', async () => {
        token = await got.post(iniciarSesionURI, {
            json: {
                nombreId: credenciales.nombreId,
                contraseña: credenciales.contraseña
            }
        })
        .then(response => {
            response.body = JSON.parse(response.body);
            token = response.body.token;
            expect(response.statusCode).toBe(200);
            return token;
        });
    });
    it('Obtener usuario mediante la ruta', async () => {
        await got.post(obtenerUsuarioURI, {
            json: {
                nombreId: credenciales.nombreId
            }
        })
        .then(response => {
            response.body = JSON.parse(response.body);
            expect(response.statusCode).toBe(200);
            expect(response.body.nombreId).toBe(credenciales.nombreId);
            expect(response.body.correo).toBe(undefined);
        });
    });
    it('Obtener datos personales mediante la ruta', async () => {
        await got.post(obtenerDatosPersonalesURI, {
            json: {
                nombreId: credenciales.nombreId
            }, headers: { "Authorization": `Bearer ${token}` }
        })
        .then(response => {
            response.body = JSON.parse(response.body);
            expect(response.statusCode).toBe(200);
            expect(response.body.nombreId).toBe(credenciales.nombreId);
            expect(response.body.correo).toBe(credenciales.correo);
        });
    });
    it('Modificar datos personales mediante la ruta', async () => {
        await got.post(modificarDatosPersonalesURI, {
            json: {
                nombreId: credenciales.nombreId,
                correo: "temp" + credenciales.correo,
                pais: paisesDisponibles[1]
            }, headers: { "Authorization": `Bearer ${token}` }
        })
        .then(response => {
            response.body = JSON.parse(response.body);
            expect(response.statusCode).toBe(200);
            expect(response.body.nombreId).toBe(credenciales.nombreId);
            expect(response.body.correo).toBe("temp" + credenciales.correo);
            expect(response.body.pais).toBe(paisesDisponibles[1]);
        });
    });
    it('Modificar mazo mediante la ruta', async () => {
        await got.post(modificarMazoURI, {
            json: {
                nombreId: credenciales.nombreId,
                mazoHabilidades: [habilidadesDisponibles[0]]
            }, headers: { "Authorization": `Bearer ${token}` }
        })
        .then(response => {
            response.body = JSON.parse(response.body);
            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0]).toStrictEqual(habilidadesDisponibles[0]);
        });
    });
    it('Mover barco inicial mediante la ruta', async () => {
        await got.post(moverBarcoInicialURI, {
            json: {
                nombreId: credenciales.nombreId,
                iProaNueva: 9,
                jProaNueva: 9,
                rotar: 0
            }, headers: { "Authorization": `Bearer ${token}` }
        })
        .then(response => {
            response.body = JSON.parse(response.body);
            expect(response.statusCode).toBe(200);
            expect(response.body.tableroDevuelto.length).toBe(5);
            expect(response.body.tableroDevuelto[0].coordenadas[0].i).toBe(9);
            expect(response.body.tableroDevuelto[0].coordenadas[0].j).toBe(9);
        });
    });
    it('Eliminar usuario mediante la ruta', async () => {
        await got.post(eliminarUsuarioURI, {
            json: {
                nombreId: credenciales.nombreId
            }, headers: { "Authorization": `Bearer ${token}` }
        })
        .then(response => {
            response.body = JSON.parse(response.body);
            expect(response.statusCode).toBe(200);
            expect(response.body.mensaje).toBe('Perfil eliminado correctamente');
        });
    });
    afterAll(() => {
        mongoose.disconnect();
    });
});