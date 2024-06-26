const got = require('got');
// definir las URI a testear
const {baseURI, mongoURI} = require('../uri');
const registrarUsuarioURI = baseURI + '/perfil/registrarUsuario';
const iniciarSesionURI = baseURI + '/perfil/iniciarSesion';
const obtenerUsuarioURI = baseURI + '/perfil/obtenerUsuario';
const obtenerDatosPersonalesURI = baseURI + '/perfil/obtenerDatosPersonales';

// definir las credenciales de prueba
const credenciales = {
    nombreId: 'usuario',
    correo: 'usuario@example.com',
    contraseña: 'Passwd1.'
};

const mongoose = require('mongoose');

// Limpiamos la base de datos
mongoose.connect(mongoURI);
mongoose.connection.dropDatabase();
mongoose.disconnect();


async function registrarUsuario() {
    await got.post(registrarUsuarioURI, {
        json: credenciales
    })
        .then(response => {
            response.body = JSON.parse(response.body);
            token = response.body.token;
            console.log(response.body);
            return token;
        })
        .catch(error => {
            console.error(error.response.body);
        });
}

async function iniciarSesion() {
    await got.post(iniciarSesionURI, {
        json: {
            nombreId: 'usuario',
            contraseña: 'Passwd1.'
        }
    })
        .then(response => {
            response.body = JSON.parse(response.body);
            token = response.body.token;
            console.log(response.body);
        })
        .catch(error => {
            console.error(error.response.body);
        });
}

async function obtenerUsuario() {
    await got.post(obtenerUsuarioURI, {
        json: {
            nombreId: 'usuario'
        }
    })
        .then(response => {
            response.body = JSON.parse(response.body);
            console.log(response.body);
        })
        .catch(error => {
            console.error(error.response.body);
        });
}

function obtenerDatosPersonales(token) {
    got.post(obtenerDatosPersonalesURI, {
        json: {
            nombreId: 'usuario'
        },
        headers: {
            Authorization: token
        }
    })
        .then(response => {
            response.body = JSON.parse(response.body);
            console.log(response.body);
        })
        .catch(error => {
            console.error(error.response);
        });
}
const token = registrarUsuario();

obtenerDatosPersonales(token);
