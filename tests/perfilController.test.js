const mongoose = require('mongoose');
const {registrarUsuario, autenticarUsuario, eliminarUsuario, iniciarSesion, 
  obtenerDatosPersonales, modificarDatosPersonales, obtenerUsuario, actualizarEstadisticas,
  actualizarPuntosExperiencia, modificarMazo, moverBarcoInicial, 
  enviarSolicitudAmistad, eliminarSolicitudAmistad, agnadirAmigo, eliminarAmigo} = require('../controllers/perfilController');
  const { barcosDisponibles } = require('../data/barco');
const e = require('express');
const Perfil = require('../models/perfilModel');
const { mongoURI } = require('../uri');
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, 
  useCreateIndex: true, useFindAndModify: false});

// redirect console.log and console.error to /dev/null
console.error = function() {};
console.log = function() {};

// Test for registrarUsuario
describe('Registrar usuario', () => {
    beforeAll(async () => {
      const connection = mongoose.connection;
      await connection.dropDatabase();
    });
    it('Debería registrar correctamente un usuario', async () => {
        const req = { body: { nombreId: 'usuario', contraseña: 'Passwd1.',
        correo: 'usuario@example.com' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await registrarUsuario(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);

    });
    it('Debería fallar al registrar un usuario con un campo extra', async () => {
        const req = { body: { nombreId: 'usuario1', contraseña: 'Passwd1.',
        correo: 'usuario1@example.com', extra: 1 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await registrarUsuario(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al registrar un usuario sin un campo', async () => {
        const req = { body: { nombreId: 'usuario1', contraseña: 'Passwd1.' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await registrarUsuario(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al registrar un usuario con una contraseña inválida', async () => {
        const req = { body: { nombreId: 'usuario3', contraseña: 'passwd1.',
        correo: 'usuario1@example.com' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await registrarUsuario(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al registrar un usuario con un correo inválido', async () => {
        const req = { body: { nombreId: 'usuario3', contraseña: 'Passwd1.',
        correo: 'usuario1example.com' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await registrarUsuario(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al registrar un usuario con un nombreId ya existente', async () => {
        const req = { body: { nombreId: 'usuario', contraseña: 'Passwd3.',
        correo: 'usuario@example.com' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await registrarUsuario(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
        const reqE = { body: { nombreId: 'usuario'} };
        await eliminarUsuario(reqE, res);
    });
});

// Test for autenticarUsuario
describe('Autenticar usuario', () => {
  beforeAll(async () => {
    const connection = mongoose.connection;
    await connection.dropDatabase();
    const req = { body: { nombreId: 'usuario', contraseña: 'Passwd1.',
    correo: 'usuario@example.com' } };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await registrarUsuario(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);
  });
  it('Debería autenticar correctamente un usuario', async () => {
      const req = { body: { nombreId: 'usuario', contraseña: 'Passwd1.' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await autenticarUsuario(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(undefined);
  });
  it('Debería fallar al autenticar un usuario con un campo extra', async () => {
      const req = { body: { nombreId: 'usuario', contraseña: 'Passwd1.',
      extra: 1 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await autenticarUsuario(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al autenticar un usuario sin un campo', async () => {
      const req = { body: { nombreId: 'usuario' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await autenticarUsuario(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al autenticar un usuario con una contraseña inválida', async () => {
      const req = { body: { nombreId: 'usuario', contraseña: 'passwd1.' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await autenticarUsuario(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(404);
  });
  it('Debería fallar al autenticar un usuario con un nombreId no existente', async () => {
      const req = { body: { nombreId: 'usuario1', contraseña: 'Passwd1.' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await autenticarUsuario(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(404);
  });
});

// Test for eliminarUsuario
describe('Eliminar usuario', () => {
  beforeAll(async () => {
    const connection = mongoose.connection;
    await connection.dropDatabase();
    const req = { body: { nombreId: 'usuario', contraseña: 'Passwd1.',
    correo: 'usuario@example.com' } };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await registrarUsuario(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);
  });
  it('Debería fallar al eliminar un usuario con un campo extra', async () => {
    const req = { body: { nombreId: 'usuario', extra: 1 } };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await eliminarUsuario(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(400);
  });
  it('Debería eliminar correctamente un usuario', async () => {
      const req = { body: { nombreId: 'usuario'} };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await eliminarUsuario(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(undefined);
  });
  it('Debería fallar al eliminar un usuario sin un campo', async () => {
      const req = { body: {} };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await eliminarUsuario(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al eliminar un usuario con un nombreId no existente', async () => {
      const req = { body: { nombreId: 'usuario1' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await eliminarUsuario(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(404);
  });
});

// Test for iniciarSesion
describe('Iniciar sesión', () => {
    beforeAll(async () => {
      const connection = mongoose.connection;
      await connection.dropDatabase();
      const req = { body: { nombreId: 'usuario', contraseña: 'Passwd1.',
      correo: 'usuario@example.com' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await registrarUsuario(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(undefined);
    });
    it('Debería iniciar sesión correctamente', async () => {
        const req = { body: { nombreId: 'usuario', contraseña: 'Passwd1.' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await iniciarSesion(req, res);
        } catch (error) {}
        // show the status code
        console.log(res.statusCode);
        expect(res.statusCode).toBe(undefined);
    });
    it('Debería fallar al iniciar sesión con un campo extra', async () => {
        const req = { body: { nombreId: 'usuario', contraseña: 'Passwd1.',
        extra: 1 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await iniciarSesion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al iniciar sesión sin un campo', async () => {
        const req = { body: { nombreId: 'usuario' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await iniciarSesion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al iniciar sesión con una contraseña inválida', async () => {
        const req = { body: { nombreId: 'usuario', contraseña: 'passwd1.' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await iniciarSesion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
    it('Debería fallar al iniciar sesión con un nombreId no existente', async () => {
        const req = { body: { nombreId: 'usuario9', contraseña: 'Passwd1.' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await iniciarSesion(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
});

// Test for obtenerDatosPersonales
describe('Obtener datos personales', () => {
    beforeAll(async () => {
      const connection = mongoose.connection;
      await connection.dropDatabase();
      const req = { body: { nombreId: 'usuario', contraseña: 'Passwd1.',
      correo: 'usuario@example.com' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await registrarUsuario(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(undefined);
    });
    it('Debería obtener correctamente los datos personales de un usuario', async () => {
        const req = { body: { nombreId: 'usuario'} };
        const res = { json: () => {}, status: function(s) {
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await obtenerDatosPersonales(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);
    });
    it('Debería fallar al obtener los datos personales de un usuario con un campo extra', async () => {
        const req = { body: { nombreId: 'usuario', extra: 1 } };
        const res = { json: () => {}, status: function(s) {
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await obtenerDatosPersonales(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al obtener los datos personales de un usuario sin un campo', async () => {
        const req = { body: {} };
        const res = { json: () => {}, status: function(s) {
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await obtenerDatosPersonales(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al obtener los datos personales de un usuario con un nombreId no existente', async () => {
        const req = { body: { nombreId: 'usuario1' } };
        const res = { json: () => {}, status: function(s) {
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await obtenerDatosPersonales(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
});

// Test for modificarDatosPersonales
describe('Modificar datos personales', () => {
    beforeAll(async () => {
      const connection = mongoose.connection;
      await connection.dropDatabase();
      const req = { body: { nombreId: 'usuario', contraseña: 'Passwd1.',
      correo: 'usuario@example.com' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await registrarUsuario(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(undefined);
    });
    it('Debería modificar correctamente el correo de un usuario', async () => {
        const req = { body: { nombreId: 'usuario', correo: 'MODusuario@example.com' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await modificarDatosPersonales(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);
    });
    it('Debería modificar correctamente la contraseña de un usuario', async () => {
        const req = { body: { nombreId: 'usuario', contraseña: 'MODPasswd1.' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await modificarDatosPersonales(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);
    });
    it('Debería modificar correctamente el país de un usuario', async () => {
        const req = { body: { nombreId: 'usuario', pais: 'España' } };
        const res = { json: () => {}, status: function(s) {
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await modificarDatosPersonales(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);
    });
    it('Debería fallar al modificar los datos de un usuario con un campo extra', async () => {
        const req = { body: { nombreId: 'usuario', contraseña: 'Passwd1.',
        correo: 'MODusuario@example.com' , extra: 1} };
        const res = { json: () => {}, status: function(s) {
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await modificarDatosPersonales(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al modificar los datos de un usuario sin un campo', async () => {
        const req = { body: { contraseña: 'Passwd1.' } };
        const res = { json: () => {}, status: function(s) {
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await modificarDatosPersonales(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al modificar los datos de un usuario con un correo inválido', async () => {
        const req = { body: { nombreId: 'usuario', contraseña: 'Passwd1.',
        correo: 'MODusuarioexample.com' } };
        const res = { json: () => {}, status: function(s) {
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await modificarDatosPersonales(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al modificar los datos de un usuario con una contraseña inválida', async () => {
        const req = { body: { nombreId: 'usuario', contraseña: 'passwd1',
        correo: 'MODusuario@example.com' } };
        const res = { json: () => {}, status: function(s) {
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await modificarDatosPersonales(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al modificar los datos de un usuario con un nombreId no existente', async () => {
        const req = { body: { nombreId: 'usuario1', contraseña: 'Passwd1.'} };
        const res = { json: () => {}, status: function(s) {
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await modificarDatosPersonales(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
    it('Debería fallar al modificar los datos de un usuario con un país no existente', async () => {
        const req = { body: { nombreId: 'usuario', pais: 'Pais' } };
        const res = { json: () => {}, status: function(s) {
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await modificarDatosPersonales(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
});

// Test for obtenerUsuario
describe('Obtener usuario', () => {
    beforeAll(async () => {
      const connection = mongoose.connection;
      await connection.dropDatabase();
      const req = { body: { nombreId: 'usuario', contraseña: 'Passwd1.',
      correo: 'usuario@example.com' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await registrarUsuario(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(undefined);
    });
    it('Debería obtener correctamente un usuario', async () => {
        const req = { body: { nombreId: 'usuario'} };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await obtenerUsuario(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);
    });
    it('Debería fallar al obtener un usuario con un campo extra', async () => {
        const req = { body: { nombreId: 'usuario', extra: 1 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await obtenerUsuario(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al obtener un usuario sin un campo', async () => {
        const req = { body: {} };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await obtenerUsuario(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it('Debería fallar al obtener un usuario con un nombreId no existente', async () => {
        const req = { body: { nombreId: 'usuario1' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
          await obtenerUsuario(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
});

// Test for actualizarEstadisticas
describe('Actualizar estadísticas', () => {
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
  });
  it('Debería actualizar correctamente las estadísticas con victoria', async () => {
      const req = { body: { nombreId: 'usuario1', victoria: 1, nuevosBarcosHundidos: 1,
      nuevosBarcosPerdidos: 1, nuevosDisparosAcertados: 1, nuevosDisparosFallados: 1 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await actualizarEstadisticas(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(undefined);

      const req2 = { body: { nombreId: 'usuario1'} };
      const res2 = { json: function(_json) {this._json = _json; return this;}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await obtenerUsuario(req2, res2);
      } catch (error) {}
      expect(res2.statusCode).toBe(undefined);
      expect(res2._json.partidasGanadas).toBe(1);
      expect(res2._json.barcosHundidos).toBe(1);
      expect(res2._json.barcosPerdidos).toBe(1);
  });
  it('Debería actualizar correctamente las estadísticas con derrota', async () => {
    const req = { body: { nombreId: 'usuario1', victoria: 0, nuevosBarcosHundidos: 0,
    nuevosBarcosPerdidos: 1, nuevosDisparosAcertados: 1, nuevosDisparosFallados: 1 } };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await actualizarEstadisticas(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);

    const req2 = { body: { nombreId: 'usuario1'} };
    const res2 = { json: function(_json) {this._json = _json; return this;}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await obtenerUsuario(req2, res2);
    } catch (error) {}
    expect(res2.statusCode).toBe(undefined);
    expect(res2._json.partidasGanadas).toBe(1);
    expect(res2._json.barcosHundidos).toBe(1);
    expect(res2._json.barcosPerdidos).toBe(2);
  });
  it('Debería actualizar correctamente las estadísticas con victoria competitiva', async () => {
    const req = { body: { nombreId: 'usuario1', victoria: 1, nuevosBarcosHundidos: 1,
    nuevosBarcosPerdidos: 1, nuevosDisparosAcertados: 1, nuevosDisparosFallados: 1, nuevosTrofeos: 30 } };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await actualizarEstadisticas(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);

    const req2 = { body: { nombreId: 'usuario1'} };
    const res2 = { json: function(_json) {this._json = _json; return this;}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await obtenerUsuario(req2, res2);
    } catch (error) {}
    expect(res2.statusCode).toBe(undefined);
    expect(res2._json.partidasGanadas).toBe(2);
    expect(res2._json.barcosHundidos).toBe(2);
    expect(res2._json.barcosPerdidos).toBe(3);
    expect(res2._json.trofeos).toBeGreaterThan(1);
  });
  it('Debería actualizar correctamente las estadísticas con derrota competitiva', async () => {
    const req = { body: { nombreId: 'usuario1', victoria: 0, nuevosBarcosHundidos: 1,
    nuevosBarcosPerdidos: 1, nuevosDisparosAcertados: 1, nuevosDisparosFallados: 1, nuevosTrofeos: 20 } };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await actualizarEstadisticas(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);

    const req2 = { body: { nombreId: 'usuario1'} };
    const res2 = { json: function(_json) {this._json = _json; return this;}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await obtenerUsuario(req2, res2);
    } catch (error) {}
    expect(res2.statusCode).toBe(undefined);
    expect(res2._json.partidasGanadas).toBe(2);
    expect(res2._json.barcosHundidos).toBe(3);
    expect(res2._json.barcosPerdidos).toBe(4);
    expect(res2._json.trofeos).toBeGreaterThan(1);
  });
  it('Debería fallar al actualizar las estadísticas con un campo extra', async () => {
      const req = { body: { nombreId: 'usuario1', victoria: 1, nuevosBarcosHundidos: 1,
      nuevosBarcosPerdidos: 1, nuevosDisparosAcertados: 1, nuevosDisparosFallados: 1, extra: 1 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await actualizarEstadisticas(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al actualizar las estadísticas sin un campo', async () => {
      const req = { body: { nombreId: 'usuario1', victoria: 1, nuevosBarcosHundidos: 1,
      nuevosBarcosPerdidos: 1, nuevosDisparosAcertados: 1 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await actualizarEstadisticas(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al actualizar las estadísticas con campos no numéricos', async () => {
      const req = { body: { nombreId: 'usuario1', victoria: 1, nuevosBarcosHundidos: 1,
      nuevosBarcosPerdidos: 1, nuevosDisparosAcertados: 1, nuevosDisparosFallados: 'a' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await actualizarEstadisticas(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al actualizar las estadísticas con un nombreId no existente', async () => {
      const req = { body: { nombreId: 'usuario3', victoria: 1, nuevosBarcosHundidos: 1,
      nuevosBarcosPerdidos: 1, nuevosDisparosAcertados: 1, nuevosDisparosFallados: 1 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await actualizarEstadisticas(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(404);
  });
  it('Debería actualizar correctamente las estadísticas sin victoria', async () => {
    const req = { body: { nombreId: 'usuario1', nuevosBarcosHundidos: 1,
    nuevosBarcosPerdidos: 1, nuevosDisparosAcertados: 1, nuevosDisparosFallados: 1 } };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await actualizarEstadisticas(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);

    const req2 = { body: { nombreId: 'usuario1'} };
    const res2 = { json: function(_json) {this._json = _json; return this;}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await obtenerUsuario(req2, res2);
    } catch (error) {}
    expect(res2.statusCode).toBe(undefined);
    expect(res2._json.partidasJugadas).toBe(4);
    expect(res2._json.partidasGanadas).toBe(2);
    expect(res2._json.barcosHundidos).toBe(4);
    expect(res2._json.barcosPerdidos).toBe(5);
  });
});

// Test for actualizarPuntosExperiencia
describe('Actualizar puntos de experiencia', () => {
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
  });
  it('Debería actualizar correctamente los puntos de experiencia', async () => {
      const req = { body: { nombreId: 'usuario1', nuevosPuntosExperiencia: 1234567890 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await actualizarPuntosExperiencia(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(undefined);

      const req2 = { body: { nombreId: 'usuario1'} };
      const res2 = { json: function(_json) {this._json = _json; return this;}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await obtenerUsuario(req2, res2);
      } catch (error) {}
      expect(res2.statusCode).toBe(undefined);
      expect(res2._json.puntosExperiencia).toBe(1234567890);
  });
  it('Debería fallar al actualizar los puntos de experiencia con un campo extra', async () => {
      const req = { body: { nombreId: 'usuario1', nuevosPuntosExperiencia: 10, extra: 1 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await actualizarPuntosExperiencia(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al actualizar los puntos de experiencia sin un campo', async () => {
      const req = { body: { nuevosPuntosExperiencia: 10 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await actualizarPuntosExperiencia(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al actualizar los puntos de experiencia con campos no numéricos', async () => {
      const req = { body: { nombreId: 'usuario1', nuevosPuntosExperiencia: 'a' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await actualizarPuntosExperiencia(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al actualizar los puntos de experiencia con un nombreId no existente', async () => {
      const req = { body: { nombreId: 'usuario3', nuevosPuntosExperiencia: 10 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await actualizarPuntosExperiencia(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(404);
  });
});

// Test for modificarMazo
describe('Modificar mazo', () => {
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
  });
  it('Debería modificar correctamente el mazo de un usuario con una habilidad', async () => {
      const req = { body: { nombreId: 'usuario1', mazoHabilidades: ['Rafaga'] } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await modificarMazo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(undefined);

      const perfil = await Perfil.findOne({nombreId: 'usuario1'});
      expect(perfil.mazoHabilidades[0]).toBe('Rafaga');
      expect(perfil.mazoHabilidades.length).toBe(1);
  });
  it('Debería modificar correctamente el mazo de un usuario con dos habilidades', async () => {
    const req = { body: { nombreId: 'usuario1', mazoHabilidades: ['Rafaga', 'Mina'] } };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await modificarMazo(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);

    const perfil = await Perfil.findOne({nombreId: 'usuario1'});
    expect(perfil.mazoHabilidades[0]).toBe('Rafaga');
    expect(perfil.mazoHabilidades[1]).toBe('Mina');
    expect(perfil.mazoHabilidades.length).toBe(2);
  });
  it("Debería modificar correctamente el mazo de un usuario con tres habilidades", async () => {
    const req = { body: { nombreId: 'usuario1', mazoHabilidades: ['Rafaga', 'Mina', 'Sonar'] } };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await modificarMazo(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);

    const perfil = await Perfil.findOne({nombreId: 'usuario1'});
    expect(perfil.mazoHabilidades[0]).toBe('Rafaga');
    expect(perfil.mazoHabilidades[1]).toBe('Mina');
    expect(perfil.mazoHabilidades[2]).toBe('Sonar');
    expect(perfil.mazoHabilidades.length).toBe(3);
  });
  it('Debería fallar al modificar el mazo de un usuario con un campo extra', async () => {
      const req = { body: { nombreId: 'usuario1', mazoHabilidades: ['Rafaga'], extra: 1 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await modificarMazo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al modificar el mazo de un usuario sin un campo', async () => {
      const req = { body: { mazoHabilidades: ['Rafaga'] } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await modificarMazo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al modificar el mazo de un usuario con un nombreId no existente', async () => {
      const req = { body: { nombreId: 'usuario3', mazoHabilidades: ['Rafaga'] } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await modificarMazo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(404);
  });
  it('Debería fallar al modificar el mazo de un usuario con una habilidad no existente', async () => {
      const req = { body: { nombreId: 'usuario1', mazoHabilidades: ['Rafaga', 'HabilidadNoExistente'] } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await modificarMazo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al modificar el mazo de un usuario con una habilidad repetida', async () => {
      const req = { body: { nombreId: 'usuario1', mazoHabilidades: ['Rafaga', 'Rafaga'] } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await modificarMazo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al modificar el mazo de un usuario con más de tres habilidades', async () => {
      const req = { body: { nombreId: 'usuario1', mazoHabilidades: ['Rafaga', 'Mina', 'Sonar', 'Teledirigido'] } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await modificarMazo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
});

// Test for moverBarcoInicial
describe('Mover barco inicial', () => {
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
  });
  it('Debería trasladar correctamente un barco inicial', async () => {
      const req = { body: { nombreId: 'usuario1', barcoId: 0, iProaNueva: 3, jProaNueva: 3 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await moverBarcoInicial(req, res);
      }
      catch (error) {}
      expect(res.statusCode).toBe(undefined);

      const perfil = await Perfil.findOne({nombreId: 'usuario1'});
      expect(perfil.tableroInicial[0].coordenadas[0].i).toBe(3);
      expect(perfil.tableroInicial[0].coordenadas[0].j).toBe(3);
      expect(perfil.tableroInicial[0].coordenadas[1].i).toBe(3);
      expect(perfil.tableroInicial[0].coordenadas[1].j).toBe(4);
  });
  it("Derbería rotar correctamente un barco inicial", async () => {
    const req = { body: { nombreId: 'usuario1', barcoId: 1, rotar: 1} };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await moverBarcoInicial(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);

    const perfil = await Perfil.findOne({nombreId: 'usuario1'});
    expect(perfil.tableroInicial[1].coordenadas[0].i).toBe(7);
    expect(perfil.tableroInicial[1].coordenadas[0].j).toBe(1);
    expect(perfil.tableroInicial[1].coordenadas[1].i).toBe(7);
    expect(perfil.tableroInicial[1].coordenadas[1].j).toBe(2);
    expect(perfil.tableroInicial[1].coordenadas[2].i).toBe(7);
    expect(perfil.tableroInicial[1].coordenadas[2].j).toBe(3);
  });
  it("Debería rotar y trasladar correctamente un barco inicial", async () => {
    const req = { body: { nombreId: 'usuario1', barcoId: 3, iProaNueva: 1, jProaNueva: 6, rotar: 1} };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await moverBarcoInicial(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);

    const perfil = await Perfil.findOne({nombreId: 'usuario1'});
    expect(perfil.tableroInicial[3].coordenadas[0].i).toBe(1);
    expect(perfil.tableroInicial[3].coordenadas[0].j).toBe(6);
    expect(perfil.tableroInicial[3].coordenadas[1].i).toBe(1);
    expect(perfil.tableroInicial[3].coordenadas[1].j).toBe(7);
    expect(perfil.tableroInicial[3].coordenadas[2].i).toBe(1);
    expect(perfil.tableroInicial[3].coordenadas[2].j).toBe(8);
  });
  it('Debería fallar al trasladar un barco inicial con un campo extra', async () => {
      const req = { body: { nombreId: 'usuario1', barcoId: 0, iProaNueva: 3, jProaNueva: 3, extra: 1 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await moverBarcoInicial(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al trasladar un barco inicial sin un campo', async () => {
      const req = { body: { barcoId: 0, iProaNueva: 3, jProaNueva: 3 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await moverBarcoInicial(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al trasladar un barco inicial con un nombreId no existente', async () => {
      const req = { body: { nombreId: 'usuario3', barcoId: 0, iProaNueva: 3, jProaNueva: 3 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await moverBarcoInicial(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(404);
  });
  it('Debería fallar al trasladar un barco inicial con un barcoId no existente', async () => {
      const req = { body: { nombreId: 'usuario1', barcoId: 10, iProaNueva: 3, jProaNueva: 3 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await moverBarcoInicial(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al trasladar un barco a una fila no existente', async () => {
      const req = { body: { nombreId: 'usuario1', barcoId: 0, iProaNueva: 11, jProaNueva: 3 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await moverBarcoInicial(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al trasladar un barco a una columna no existente', async () => {
      const req = { body: { nombreId: 'usuario1', barcoId: 0, iProaNueva: 3, jProaNueva: 11 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await moverBarcoInicial(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al trasladar un barco a una fila no numérica', async () => {
      const req = { body: { nombreId: 'usuario1', barcoId: 0, iProaNueva: 'a', jProaNueva: 3 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await moverBarcoInicial(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al trasladar un barco a una columna no numérica', async () => {
      const req = { body: { nombreId: 'usuario1', barcoId: 0, iProaNueva: 3, jProaNueva: 'a' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await moverBarcoInicial(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al indicar un barco no numérico', async () => {
      const req = { body: { nombreId: 'usuario1', barcoId: 'a', iProaNueva: 3, jProaNueva: 3 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await moverBarcoInicial(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al indicar rotar no numérico', async () => {
    const req = { body: { nombreId: 'usuario1', barcoId: 1, rotar: 'a'} };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await moverBarcoInicial(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(400);
  });
  it('Debería no actualizar al trasladar un barco fuera del tablero', async () => {
    const req = { body: { nombreId: 'usuario1', barcoId: 0, iProaNueva: 2, jProaNueva: 10 } };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await moverBarcoInicial(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);

    const perfil = await Perfil.findOne({nombreId: 'usuario1'});
    expect(perfil.tableroInicial[0].coordenadas[0].i).toBe(3);
    expect(perfil.tableroInicial[0].coordenadas[0].j).toBe(3);
    expect(perfil.tableroInicial[0].coordenadas[1].i).toBe(3);
    expect(perfil.tableroInicial[0].coordenadas[1].j).toBe(4);
  });
  it('Debería no actualizar al rotar un barco fuera del tablero', async () => {
    const req = { body: { nombreId: 'usuario1', barcoId: 4, rotar: 1} };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await moverBarcoInicial(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);
    const perfil = await Perfil.findOne({nombreId: 'usuario1'});
    expect(perfil.tableroInicial[4].coordenadas[0].i).toBe(10);
    expect(perfil.tableroInicial[4].coordenadas[0].j).toBe(6);
    expect(perfil.tableroInicial[4].coordenadas[1].i).toBe(10);
    expect(perfil.tableroInicial[4].coordenadas[1].j).toBe(7);
    expect(perfil.tableroInicial[4].coordenadas[2].i).toBe(10);
    expect(perfil.tableroInicial[4].coordenadas[2].j).toBe(8);
    expect(perfil.tableroInicial[4].coordenadas[3].i).toBe(10);
    expect(perfil.tableroInicial[4].coordenadas[3].j).toBe(9);
    expect(perfil.tableroInicial[4].coordenadas[4].i).toBe(10);
    expect(perfil.tableroInicial[4].coordenadas[4].j).toBe(10);
  });
  it('Debería no actualizar al trasladar un barco a una posición ocupada', async () => {
    const req = { body: { nombreId: 'usuario1', barcoId: 0, iProaNueva: 1, jProaNueva: 6 } };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await moverBarcoInicial(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);
    const perfil = await Perfil.findOne({nombreId: 'usuario1'});
    expect(perfil.tableroInicial[0].coordenadas[0].i).toBe(3);
    expect(perfil.tableroInicial[0].coordenadas[0].j).toBe(3);
    expect(perfil.tableroInicial[0].coordenadas[1].i).toBe(3);
    expect(perfil.tableroInicial[0].coordenadas[1].j).toBe(4);
  });
  it('Debería fallar al indicar un usuario no existente', async () => {
    const req = { body: { nombreId: 'usuario3', barcoId: 0, iProaNueva: 3, jProaNueva: 3 } };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await moverBarcoInicial(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(404);
  });
});

// Test for enviarSolicitudAmistad
describe('Enviar solicitud de amistad', () => {
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
    const req3 = { body: { nombreId: 'usuario3', contraseña: 'Passwd3.',
    correo: 'usuario3@example.com' } };
    const res3 = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await registrarUsuario(req3, res3);
    } catch (error) {}
    expect(res3.statusCode).toBe(undefined);
    // usuario2 y usuario3 son amigos
    const req4 = { body: { nombreId: 'usuario2', nombreIdAmigo: 'usuario3' } };
    const res4 = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await enviarSolicitudAmistad(req4, res4);
    }
    catch (error) {}
    expect(res4.statusCode).toBe(undefined);

    const req5 = { body: { nombreId: 'usuario3', nombreIdAmigo: 'usuario2' } };
    const res5 = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await agnadirAmigo(req5, res5);
    } catch (error) {}
    expect(res5.statusCode).toBe(undefined);
  });
  it('Debería enviar correctamente una solicitud de amistad', async () => {
      const req = { body: { nombreId: 'usuario1', nombreIdAmigo: 'usuario2' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await enviarSolicitudAmistad(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(undefined);

      const perfil = await Perfil.findOne({nombreId: 'usuario2'});
      expect(perfil.listaSolicitudes.length).toBe(1);
      expect(perfil.listaSolicitudes[0]).toBe('usuario1');

  });
  it('Debería fallar al enviar una solicitud de amistad con un campo extra', async () => {
      const req = { body: { nombreId: 'usuario1', nombreIdAmigo: 'usuario3', extra: 1 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await enviarSolicitudAmistad(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al enviar una solicitud de amistad sin un campo', async () => {
      const req = { body: { nombreIdAmigo: 'usuario3' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await enviarSolicitudAmistad(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al enviar una solicitud de amistad con un nombreId no existente', async () => {
      const req = { body: { nombreId: 'usuario4', nombreIdAmigo: 'usuario3' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await enviarSolicitudAmistad(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(404);
  });
  it('Debería fallar al enviar una solicitud de amistad a un nombreId no existente', async () => {
      const req = { body: { nombreId: 'usuario1', nombreIdAmigo: 'usuario4' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await enviarSolicitudAmistad(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(404);
  });
  it('Debería fallar al enviar una solicitud de amistad a un nombreId ya amigo', async () => {
      const req = { body: { nombreId: 'usuario2', nombreIdAmigo: 'usuario3' } };
      const res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await enviarSolicitudAmistad(req, res);
      } catch (error) {}
      expect(res._json.exito).toBe(false);
  });
  it('Debería fallar al enviar una solicitud de amistad a un nombreId con solicitud previa', async () => {
      const req = { body: { nombreId: 'usuario1', nombreIdAmigo: 'usuario2' } };
      const res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await enviarSolicitudAmistad(req, res);
      } catch (error) {}
      expect(res._json.exito).toBe(false);
  });
  it('Debería fallar al enviar una solicitud de amistad a un nombreId que ya te la ha enviado', async () => {
    const req = { body: { nombreId: 'usuario2', nombreIdAmigo: 'usuario1' } };
    const res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await enviarSolicitudAmistad(req, res);
    } catch (error) {}
    expect(res._json.exito).toBe(false);
  });
});

// Test for eliminarSolicitudAmistad
describe('Eliminar solicitud de amistad', () => {
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
    const req3 = { body: { nombreId: 'usuario3', contraseña: 'Passwd3.',
    correo: 'usuario3@example.com' } };
    const res3 = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await registrarUsuario(req3, res3);
    } catch (error) {}
    expect(res3.statusCode).toBe(undefined);
    // usuario2 y usuario3 tienen una solicitud de amistad
    const req4 = { body: { nombreId: 'usuario2', nombreIdAmigo: 'usuario3' } };
    const res4 = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await enviarSolicitudAmistad(req4, res4);
    }
    catch (error) {}
    expect(res4.statusCode).toBe(undefined);
  });
  it('Debería eliminar correctamente una solicitud de amistad', async () => {
      const req = { body: { nombreId: 'usuario3', nombreIdAmigo: 'usuario2' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await eliminarSolicitudAmistad(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(undefined);

      const perfil = await Perfil.findOne({nombreId: 'usuario3'});
      expect(perfil.listaSolicitudes.length).toBe(0);
  });
  it('Debería fallar al eliminar una solicitud de amistad con un campo extra', async () => {
      const req = { body: { nombreId: 'usuario2', nombreIdAmigo: 'usuario3', extra: 1 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await eliminarSolicitudAmistad(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al eliminar una solicitud de amistad sin un campo', async () => {
      const req = { body: { nombreIdAmigo: 'usuario3' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await eliminarSolicitudAmistad(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al eliminar una solicitud de amistad sin un usuario', async () => {
    const req = { body: { nombreId: 'usuario3' } };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await eliminarSolicitudAmistad(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(400);
});
  it('Debería fallar al eliminar una solicitud de amistad con un nombreId no existente', async () => {
      const req = { body: { nombreId: 'usuario4', nombreIdAmigo: 'usuario3' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await eliminarSolicitudAmistad(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(404);
  });
  it('Debería fallar al eliminar una solicitud de amistad con un nombreIdAmigo no existente', async () => {
      const req = { body: { nombreId: 'usuario2', nombreIdAmigo: 'usuario4' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await eliminarSolicitudAmistad(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(404);
  });
  it('Debería fallar al eliminar una solicitud de amistad inexistente', async () => {
      const req = { body: { nombreId: 'usuario1', nombreIdAmigo: 'usuario2' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await eliminarSolicitudAmistad(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(404);
  });
});

// Test for agnadirAmigo
describe('Añadir amigo', () => {
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
    const req3 = { body: { nombreId: 'usuario3', contraseña: 'Passwd3.',
    correo: 'usuario3@example.com' } };
    const res3 = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await registrarUsuario(req3, res3);
    } catch (error) {}
    expect(res3.statusCode).toBe(undefined);
    // usuario2 y usuario3 tienen una solicitud de amistad
    const req4 = { body: { nombreId: 'usuario2', nombreIdAmigo: 'usuario3' } };
    const res4 = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await enviarSolicitudAmistad(req4, res4);
    }
    catch (error) {}
    expect(res4.statusCode).toBe(undefined);
  });
  it('Debería añadir correctamente un amigo', async () => {
      const req = { body: { nombreId: 'usuario3', nombreIdAmigo: 'usuario2' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await agnadirAmigo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(undefined);

      const perfil = await Perfil.findOne({nombreId: 'usuario3'});
      expect(perfil.listaAmigos.length).toBe(1);
      expect(perfil.listaAmigos[0]).toBe('usuario2');
      expect(perfil.listaSolicitudes.length).toBe(0);
  });
  it('Debería fallar al añadir un amigo con un campo extra', async () => {
      const req = { body: { nombreId: 'usuario2', nombreIdAmigo: 'usuario3', extra: 1 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await agnadirAmigo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al añadir un amigo sin un campo', async () => {
      const req = { body: { nombreIdAmigo: 'usuario3' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await agnadirAmigo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al añadir un amigo sin un usuario', async () => {
    const req = { body: { nombreId: 'usuario3' } };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await agnadirAmigo(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al añadir un amigo con un nombreId no existente', async () => {
      const req = { body: { nombreId: 'usuario4', nombreIdAmigo: 'usuario3' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await agnadirAmigo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(404);
  });
  it('Debería fallar al añadir un amigo con un nombreIdAmigo no existente', async () => {
      const req = { body: { nombreId: 'usuario2', nombreIdAmigo: 'usuario4' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await agnadirAmigo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(404);
  });
  it('Debería fallar al añadir un amigo sin solicitud previa', async () => {
      const req = { body: { nombreId: 'usuario1', nombreIdAmigo: 'usuario2' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await agnadirAmigo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(404);
  });
});

// Test for eliminarAmigo
describe('Eliminar amigo', () => {
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
    const req3 = { body: { nombreId: 'usuario3', contraseña: 'Passwd3.',
    correo: 'usuario3@example.com' } };
    const res3 = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await registrarUsuario(req3, res3);
    } catch (error) {}
    expect(res3.statusCode).toBe(undefined);
    // usuario2 y usuario3 son amigos
    const req4 = { body: { nombreId: 'usuario2', nombreIdAmigo: 'usuario3' } };
    const res4 = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await enviarSolicitudAmistad(req4, res4);
    }
    catch (error) {}
    expect(res4.statusCode).toBe(undefined);

    const req5 = { body: { nombreId: 'usuario3', nombreIdAmigo: 'usuario2' } };
    const res5 = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await agnadirAmigo(req5, res5);
    } catch (error) {}
    expect(res5.statusCode).toBe(undefined);
  });
  it('Debería eliminar correctamente un amigo', async () => {
      const req = { body: { nombreId: 'usuario3', nombreIdAmigo: 'usuario2' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await eliminarAmigo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(undefined);

      const perfil = await Perfil.findOne({nombreId: 'usuario3'});
      expect(perfil.listaAmigos.length).toBe(0);
  });
  it('Debería fallar al eliminar un amigo con un campo extra', async () => {
      const req = { body: { nombreId: 'usuario2', nombreIdAmigo: 'usuario3', extra: 1 } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await eliminarAmigo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al eliminar un amigo sin un campo', async () => {
      const req = { body: { nombreIdAmigo: 'usuario3' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await eliminarAmigo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al eliminar un amigo sin un usuario', async () => {
    const req = { body: { nombreId: 'usuario3' } };
    const res = { json: () => {}, status: function(s) { 
      this.statusCode = s; return this; }, send: () => {} };
    try {
      await eliminarAmigo(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(400);
  });
  it('Debería fallar al eliminar un amigo con un nombreId no existente', async () => {
      const req = { body: { nombreId: 'usuario4', nombreIdAmigo: 'usuario3' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await eliminarAmigo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(404);
  });
  it('Debería fallar al eliminar un amigo con un nombreIdAmigo no existente', async () => {
      const req = { body: { nombreId: 'usuario2', nombreIdAmigo: 'usuario4' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await eliminarAmigo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(404);
  });
  it('Debería fallar al eliminar un amigo que no está en la lista', async () => {
      const req = { body: { nombreId: 'usuario1', nombreIdAmigo: 'usuario2' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
        await eliminarAmigo(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(404);
  });
  afterAll(async () => {
    mongoose.disconnect();
  });
});
