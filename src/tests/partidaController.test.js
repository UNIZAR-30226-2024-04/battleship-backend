const mongoose = require('mongoose');
const {crearPartida, mostrarMiTablero, mostrarTableroEnemigo,
    mostrarTableros, realizarDisparo, enviarMensaje, obtenerChat,
    realizarDisparoMisilRafaga, realizarDisparoTorpedoRecargado,
    realizarDisparoMisilTeledirigido, colocarMina, usarSonar} = require('../controllers/partidaController');
const {registrarUsuario} = require('../controllers/perfilController');
const Partida = require('../models/partidaModel');

const mongoURI = 'mongodb://localhost/BattleshipDB';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, 
  useCreateIndex: true, useFindAndModify: false});
const Coordenada = require('../data/coordenada');
const tableroDim = Coordenada.i.max;  // Dimensiones del tablero
// redirect console.log and console.error to /dev/null
console.error = function() {};
console.log = function() {};

// Test for crearPartida
describe("Crear partida", () => {
    beforeAll( async () => {
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
    });
    it("Debería crear una partida correctamente contra la IA", async () => {
        const req = { body: { nombreId1: 'usuario3', bioma: 'Norte' } };
        const res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
            this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPartida(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);
    });
    it("Debería fallar al crear una partida con demasiados campos", async () => {
        const req = { body: { nombreId1: 'usuario1', nombreId2: 'usuario2', bioma: 'Norte', extra: 1 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPartida(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar al crear una partida sin jugador 1", async () => {
        const req = { body: { nombreId2: 'usuario1', bioma: 'Norte' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPartida(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar al crear una partida con un bioma no disponible", async () => {
        const req = { body: { nombreId1: 'usuario1', nombreId2: 'usuario2', bioma: 'Murcia' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPartida(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar al crear una partida con un jugador 1 inexistente", async () => {
        const req = { body: { nombreId1: 'usuario5', nombreId2: 'usuario1', bioma: 'Norte' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPartida(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
    it("Debería fallar al crear una partida con un jugador 2 inexistente", async () => {
        const req = { body: { nombreId1: 'usuario1', nombreId2: 'usuario5', bioma: 'Norte' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPartida(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
    it("Debería fallar al crear una partida con jugadores iguales", async () => {
        const req = { body: { nombreId1: 'usuario1', nombreId2: 'usuario1', bioma: 'Norte' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPartida(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it("Debería crear una partida correctamente", async () => {
      const req = { body: { nombreId1: 'usuario1', nombreId2: 'usuario2', bioma: 'Norte' } };
      const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
      try {
          await crearPartida(req, res);
          }
      catch (error) {}
      expect(res.statusCode).toBe(undefined);
    });
});

var _codigo = 0;
// Test for mostrarMiTablero
describe("Mostrar mi tablero", () => {
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
        const req3 = { body: { nombreId1: 'usuario1', nombreId2: 'usuario2', bioma: 'Norte' } };
        const res3 = { json: function(_json) {this._json = _json; return this;}, status: function(s) { 
            this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPartida(req3, res3);
        } catch (error) {}
        expect(res3.statusCode).toBe(undefined);
        _codigo = res3._json.codigo;
    });
    it("Debería mostrar mi tablero correctamente", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario1' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await mostrarMiTablero(req, res);
            }
        catch (error) {}
        expect(res.statusCode).toBe(undefined);
    });
    it("Debería fallar al mostrar mi tablero con demasiados campos", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario1' , extra: 1 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await mostrarMiTablero(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar al mostrar mi tablero sin jugador", async () => {
        const req = { body: { codigo: _codigo } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await mostrarMiTablero(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar al mostrar mi tablero con un jugador inválido", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario3'  } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await mostrarMiTablero(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
    it("Debería fallar al mostrar mi tablero con un código de partida inexistente", async () => {
        const req = { body: { codigo: 1, nombreId: 'usuario1' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await mostrarMiTablero(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
});

_codigo = 1;
// Test for mostrarTableroEnemigo
describe("Mostrar tablero enemigo", () => {
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
        const req3 = { body: { nombreId1: 'usuario1', nombreId2: 'usuario2', bioma: 'Norte' } };
        const res3 = { json: function(_json) {this._json = _json; return this;}, status: function(s) { 
            this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPartida(req3, res3);
        } catch (error) {}
        expect(res3.statusCode).toBe(undefined);
        _codigo = res3._json.codigo;
    });
    it("Debería mostrar el tablero enemigo correctamente", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario1' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await mostrarTableroEnemigo(req, res);
            }
        catch (error) {}
        expect(res.statusCode).toBe(undefined);
    });
    it("Debería fallar al mostrar el tablero enemigo con demasiados campos", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario1' , extra: 1 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await mostrarTableroEnemigo(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar al mostrar el tablero enemigo sin jugador", async () => {
        const req = { body: { codigo: _codigo } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await mostrarTableroEnemigo(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar al mostrar el tablero enemigo con un jugador inválido", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario3' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await mostrarTableroEnemigo(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
    it("Debería fallar al mostrar el tablero enemigo con un código de partida inexistente", async () => {
        const req = { body: { codigo: 1, nombreId: 'usuario1' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await mostrarTableroEnemigo(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
});

// Test for mostrarTableros
describe("Mostrar tableros", () => {
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
        const req3 = { body: { nombreId1: 'usuario1', nombreId2: 'usuario2', bioma: 'Norte' } };
        const res3 = { json: function(_json) {this._json = _json; return this;}, status: function(s) { 
            this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPartida(req3, res3);
        } catch (error) {}
        expect(res3.statusCode).toBe(undefined);
        // guardar el código de la partida
        _codigo = res3._json.codigo;
        console.log(_codigo);
    });
    it("Debería mostrar los tableros correctamente", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario1' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await mostrarTableros(req, res);
            }
        catch (error) {}
        expect(res.statusCode).toBe(undefined);
    });
    it("Debería fallar al mostrar los tableros con demasiados campos", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario1' , extra: 1 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await mostrarTableros(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar al mostrar los tableros sin código de partida", async () => {
        const req = { body: {nombreId: 'usuario1' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await mostrarTableros(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar al mostrar los tableros sin usuario", async () => {
        const req = { body: {codigo: _codigo} };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await mostrarTableros(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar al mostrar los tableros con un código de partida inexistente", async () => {
        const req = { body: { codigo: 1, nombreId: 'usuario1'  } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await mostrarTableros(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
});

// Test for realizarDisparo
describe("Realizar disparo", () => {
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
        const req3 = { body: { nombreId1: 'usuario1', nombreId2: 'usuario2', bioma: 'Norte' } };
        const res3 = { json: function(_json) {this._json = _json; return this;}, status: function(s) { 
            this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPartida(req3, res3);
        } catch (error) {}
        expect(res3.statusCode).toBe(undefined);
        _codigo = res3._json.codigo;
    });
    it("Debería realizar un disparo correctamente", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario1', i: 1, j: 1 } };
        const res = { json: function(_json) {this._json = _json; return this;}, status: function(s) { 
            this.statusCode = s; return this; }, send: () => {} };
        try {
            await realizarDisparo(req, res);
            }
        catch (error) {}
        expect(res.statusCode).toBe(undefined);
        // Reestablecer el clima a 'Calma'
        await Partida.updateOne({codigo: _codigo}, {clima: 'Calma'});
    });
    it("Debería fallar al realizar un disparo con demasiados campos", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario1', i: 1, j: 1, extra: 1 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await realizarDisparo(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
        await Partida.updateOne({codigo: _codigo}, {clima: 'Calma'});
    });
    it("Debería fallar al realizar un disparo sin jugador", async () => {
        const req = { body: { codigo: _codigo, i: 1, j: 1 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await realizarDisparo(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
        await Partida.updateOne({codigo: _codigo}, {clima: 'Calma'});
    });
    it("Debería fallar al realizar un disparo sin coordenadas", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario1'} };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await realizarDisparo(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
        await Partida.updateOne({codigo: _codigo}, {clima: 'Calma'});
    });
    it("Debería fallar al realizar un disparo con un jugador inválido", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario3', i: 1, j: 1 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await realizarDisparo(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
        await Partida.updateOne({codigo: _codigo}, {clima: 'Calma'});
    });
    it("Debería fallar al realizar un disparo con coordenadas inválidas", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario1', i: -1, j: 1 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await realizarDisparo(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
        await Partida.updateOne({codigo: _codigo}, {clima: 'Calma'});
    });
    it("Debería fallar al realizar un disparo con un código de partida inexistente", async () => {
        const req = { body: { codigo: 1, nombreId: 'usuario1', i: 1, j: 1 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await realizarDisparo(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
        await Partida.updateOne({codigo: _codigo}, {clima: 'Calma'});
    });
    it("Debería fallar al no ser el turno del jugador", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario2', i: 1, j: 2 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await realizarDisparo(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
        await Partida.updateOne({codigo: _codigo}, {clima: 'Calma'});
    });
    it("Debería hundir el barco", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario1', i: 1, j: 2 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await realizarDisparo(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);
        await Partida.updateOne({codigo: _codigo}, {clima: 'Calma'});
    });
    it("Debería disparar al agua", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario1', i: 1, j: 3 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await realizarDisparo(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);
        await Partida.updateOne({codigo: _codigo}, {clima: 'Calma'});
    });
});

// Funcion que devuelve:
// - El barco (si existe) disparado en la coordenada (i, j), tocándolo.
// - La mina (si existe) disparada en la coordenada (i, j), hundiéndola.
function dispararCoordenada(tablero, minas, i, j) {
  for (let barco of tablero) {
    for (let coordenada of barco.coordenadas) {
      if (coordenada.i === i && coordenada.j === j) {
        if (coordenada.estado === 'Agua') {
          coordenada.estado = 'Tocado';
          return {barcoDisparado: barco, minaDisparada: undefined};
        } else return {barcoDisparado: undefined, minaDisparada: undefined};
      }
    }
  }
  for (let mina of minas) {
    if (mina.i === i && mina.j === j) {
      if (mina.estado === 'Agua') {
        mina.estado = 'Hundido';
        return {barcoDisparado: undefined, minaDisparada: mina};
      } else return {barcoDisparado: undefined, minaDisparada: undefined};
    }
  }
  return {barcoDisparado: undefined, minaDisparada: undefined};
}

// Test for realizarDisparo
describe("Realizar disparo contra la IA", () => {
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

      const req3 = { body: { nombreId1: 'usuario1', bioma: 'Norte' } };
      const res3 = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
          this.statusCode = s; return this; }, send: () => {} };
      try {
          await crearPartida(req3, res3);
      } catch (error) {}
      expect(res3.statusCode).toBe(undefined);
      _codigo = res3._json.codigo;
  });
  it("Debería realizar un disparo y responder la IA correctamente", async () => {
      // Tomamos la partida
      const partida = await Partida.findOne({codigo: _codigo});
      // Buscamos una casilla sin barco de la IA
      let i = 0;
      let j = 0;
      let encontrado = false;
      while (!encontrado) {
          i = Math.floor(Math.random() * tableroDim) + 1;
          j = Math.floor(Math.random() * tableroDim) + 1;
          let {barcoDisparado: barco} = dispararCoordenada(partida.tableroBarcos2, partida.minas2, i, j);
          if (!barco) break;
      }

      const req = { body: { codigo: _codigo, nombreId: 'usuario1', i: i, j: j } };
      const res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
          this.statusCode = s; return this; }, send: () => {} };
      try {
          await realizarDisparo(req, res);
      } catch (error) {}
      await Partida.updateOne({codigo: _codigo}, {clima: 'Calma'});
      expect(res.statusCode).toBe(undefined);
      expect(res._json.disparoRealizado.estado).toBe('Agua');
      expect(res._json.turnosIA.length).toBeGreaterThan(0);
  });
  it("Debería disparar hasta acabar la partida ganando o perder contra la IA", async () => {
      let coord_x = 1;
      let coord_y = 1;
      let fin = false;
      // Disparamos a todas las casillas de la IA
      while (!fin) {
          let req = { body: { codigo: _codigo, nombreId: 'usuario1', i: coord_x, j: coord_y } };
          let res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
              this.statusCode = s; return this; }, send: () => {} };
          try {
              await realizarDisparo(req, res);
          } catch (error) {}
          await Partida.updateOne({codigo: _codigo}, {clima: 'Calma'});
          expect(res.statusCode).toBe(undefined);
          if (res._json.finPartida) {
              fin = true;
          } else {
            // Comprobamos que la IA no ha ganado
            for (let turnoIA of res._json.turnosIA) {
              if (turnoIA.finPartida) {
                fin = true;
                break;
              }
            }

            // Buscamos la siguiente casilla a disparar
            if (coord_x < tableroDim) {
              coord_x++;
            } else {
              coord_x = 1;
              coord_y++;
            }

            // Comprobamos que no se ha acabado la partida
            if (coord_y > tableroDim) {
              expect(true).toBe(false);
            }
      }
    }
  }, 10000);
});

// Test for realizarDisparoMisilRafaga
describe("Realizar ráfaga de misiles contra la IA", () => {
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

    const req3 = { body: { nombreId1: 'usuario1', bioma: 'Norte' } };
    const res3 = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
        await crearPartida(req3, res3);
    } catch (error) {}
    expect(res3.statusCode).toBe(undefined);
    _codigo = res3._json.codigo;
  });
it("Debería realizar una ráfaga de misiles y responder la IA correctamente", async () => {
    // Tomamos la partida
    const partida = await Partida.findOne({codigo: _codigo});
    // Buscamos una casilla sin barco de la IA
    let i = 0;
    let j = 0;
    let encontrado = false;
    while (!encontrado) {
        i = Math.floor(Math.random() * tableroDim) + 1;
        j = Math.floor(Math.random() * tableroDim) + 1;
        let {barcoDisparado: barco} = dispararCoordenada(partida.tableroBarcos2, partida.minas2, i, j);
        if (!barco) break;
    }
    // Primer misil: agua
    let req = { body: { codigo: _codigo, nombreId: 'usuario1', i: i, j: j, misilesRafagaRestantes: 3} };
    let res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
        await realizarDisparoMisilRafaga(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);
    expect(res._json.disparoRealizado.estado).toBe('Agua');
    expect(res._json.usosHab).toBe(3);
    expect(res._json.turnosIA.length).toBe(0);
    // Segundo misil: tocado
    i = 0;
    j = 0;
    encontrado = false;
    while (!encontrado) {
        i = Math.floor(Math.random() * tableroDim) + 1;
        j = Math.floor(Math.random() * tableroDim) + 1;
        let {barcoDisparado: barco} = dispararCoordenada(partida.tableroBarcos2, partida.minas2, i, j);
        if (barco) break;
    }
    req = { body: { codigo: _codigo, nombreId: 'usuario1', i: i, j: j, misilesRafagaRestantes: 2} };
    res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
        await realizarDisparoMisilRafaga(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);
    expect(res._json.disparoRealizado.estado).toBe('Tocado');
    expect(res._json.usosHab).toBe(3);
    expect(res._json.turnosIA.length).toBe(0);
    // Último misil: agua
    req = { body: { codigo: _codigo, nombreId: 'usuario1', i: i, j: j, misilesRafagaRestantes: 1} };
    res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
        await realizarDisparoMisilRafaga(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);
    expect(res._json.disparoRealizado.estado).toBe('Agua');
    expect(res._json.usosHab).toBe(2);
    expect(res._json.turnosIA.length).toBeGreaterThan(0);
});
});

// Test for realizarDisparoTorpedoRecargado
describe("Realizar torpedo recargado contra la IA", () => {
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

    const req3 = { body: { nombreId1: 'usuario1', bioma: 'Norte' } };
    const res3 = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
        await crearPartida(req3, res3);
    } catch (error) {}
    expect(res3.statusCode).toBe(undefined);
    _codigo = res3._json.codigo;
});
it("Debería recargar un torpedo y responder la IA correctamente", async () => {
    // Tomamos la partida
    const partida = await Partida.findOne({codigo: _codigo});
    let req = { body: { codigo: _codigo, nombreId: 'usuario1', turnoRecarga: true} };
    let res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
        await realizarDisparoTorpedoRecargado(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);
    expect(res._json.disparosRealizados).toBe(undefined);
    expect(res._json.usosHab).toBe(3);
    expect(res._json.turnosIA.length).toBeGreaterThan(0);
});
it("Debería disparar un torpedo recargado y responder la IA correctamente", async () => {
    // Torpedo en esquina
    let req = { body: { codigo: _codigo, nombreId: 'usuario1', i: 1, j: 1} };
    let res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
        await realizarDisparoTorpedoRecargado(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);
    expect(res._json.disparosRealizados.length).toBe(4);
    expect(res._json.usosHab).toBe(2);
    if (res._json.algunoTocado) {
      expect(res._json.turnosIA.length).toBe(0);
    } else expect(res._json.turnosIA.length).toBeGreaterThan(0);
    // Torpedo en borde
    req = { body: { codigo: _codigo, nombreId: 'usuario1', i: 5, j: 1} };
    res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
        await realizarDisparoTorpedoRecargado(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);
    expect(res._json.disparosRealizados.length).toBe(6);
    expect(res._json.usosHab).toBe(1);
    if (res._json.algunoTocado) {
      expect(res._json.turnosIA.length).toBe(0);
    } else expect(res._json.turnosIA.length).toBeGreaterThan(0);
    // Torpedo en centro
    req = { body: { codigo: _codigo, nombreId: 'usuario1', i: 5, j: 5} };
    res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
        await realizarDisparoTorpedoRecargado(req, res);
    } catch (error) {}
    expect(res.statusCode).toBe(undefined);
    expect(res._json.disparosRealizados.length).toBe(9);
    expect(res._json.usosHab).toBe(0);
    if (res._json.algunoTocado) {
      expect(res._json.turnosIA.length).toBe(0);
    } else expect(res._json.turnosIA.length).toBeGreaterThan(0);
});
});

// Test for realizarDisparoMisilTeledirigido
describe("Realizar disparo de misil teledirigido contra la IA", () => {
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

    const req3 = { body: { nombreId1: 'usuario1', bioma: 'Norte' } };
    const res3 = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
        await crearPartida(req3, res3);
    } catch (error) {}
    expect(res3.statusCode).toBe(undefined);
    _codigo = res3._json.codigo;
});
it("Debería disparar misiles teledirigidos sin error", async () => {

    let req = { body: { codigo: _codigo, nombreId: 'usuario1'} };
    let res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    for (let i = 0; i < 3; i++) {
      try {
          await realizarDisparoMisilTeledirigido(req, res);
      } catch (error) {}
      expect(res.statusCode).toBe(undefined);
      expect(res._json.disparoRealizado.estado).toMatch(/Tocado|Hundido/);
      expect(res._json.usosHab).toBe(3 - i - 1);
      expect(res._json.turnosIA.length).toBe(0);
    }
});
});

// Test for colocarMina
describe("Colocar mina", () => {
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

    const req3 = { body: { nombreId1: 'usuario1', bioma: 'Norte' } };
    const res3 = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
        await crearPartida(req3, res3);
    } catch (error) {}
    expect(res3.statusCode).toBe(undefined);
    _codigo = res3._json.codigo;
  });
  it("Debería colocar una mina en una casilla no ocupada correctamente", async () => {
    // Buscamos una casilla sin barco ni mina
    let partidaActual = await Partida.findOne({codigo: _codigo});
    let i = 0;
    let j = 0;
    let miTablero = partidaActual.tableroBarcos1;
    let misMinas = partidaActual.minas1;
    while (true) {
        i = Math.floor(Math.random() * tableroDim) + 1;
        j = Math.floor(Math.random() * tableroDim) + 1;
        ocupadaPorBarco = miTablero.some(barco => barco.coordenadas.some(coordenada => coordenada.i === i && coordenada.j === j && coordenada.estado === 'Agua'));
        if (!ocupadaPorBarco) {
          ocupadaPorMina = misMinas.some(mina => mina.i === i && mina.j === j && mina.estado === 'Agua');
          if (!ocupadaPorMina) break;
        }
    }
    let req = { body: { codigo: _codigo, nombreId: 'usuario1', i: i, j: j} };
    let res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
      await colocarMina(req, res);
    } catch (error) {}    
    expect(res.statusCode).toBe(undefined);
    partidaActual = await Partida.findOne({codigo: _codigo});
    misMinas = partidaActual.minas1;
    ocupadaPorMina = misMinas.some(mina => mina.i === i && mina.j === j && mina.estado === 'Agua');
    expect(ocupadaPorMina).toBe(true);
    expect(res._json.finPartida).toBe(false);
    expect(res._json.usosHab).toBe(2);
    expect(res._json.turnosIA.length).toBeGreaterThan(0);
  });
  it("Debería fallar al colocar una mina en una casilla ocupada por barco", async () => {
    const partidaActual = await Partida.findOne({codigo: _codigo});
    let miTablero = partidaActual.tableroBarcos1;
    let {i, j} = miTablero[0].coordenadas[0];
    let req = { body: { codigo: _codigo, nombreId: 'usuario1', i: i, j: j} };
    let res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
      await colocarMina(req, res);
    } catch (error) {}    
    expect(res.statusCode).toBe(404);
  });
  it("Debería fallar al colocar una mina en una casilla ocupada por otra mina", async () => {
    const partidaActual = await Partida.findOne({codigo: _codigo});
    let misMinas = partidaActual.minas1;
    let {i, j} = misMinas[0];
    let req = { body: { codigo: _codigo, nombreId: 'usuario1', i: i, j: j} };
    let res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
      await colocarMina(req, res);
    } catch (error) {}    
    expect(res.statusCode).toBe(404);
  });
});

describe("Respuesta de mi mina a un disparo básico de la IA", () => {
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

    const req3 = { body: { nombreId1: 'usuario1', bioma: 'Norte' } };
    const res3 = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
        await crearPartida(req3, res3);
    } catch (error) {}
    expect(res3.statusCode).toBe(undefined);
    _codigo = res3._json.codigo;
  });
  it("Debería responder con 5 disparos contra la IA correctamente", async () => {
    let partidaActual = await Partida.findOne({codigo: _codigo});
    // Quitar todos mis barcos
    partidaActual.tableroBarcos1 = [];
    // Colocar minas en todo mi tablero
    for (let i = 1; i <= tableroDim; i++) {
      for (let j = 1; j <= tableroDim; j++) {
        partidaActual.minas1.push({i: i, j: j});
      }
    }
    partidaActual.minas1.pop(); // Quitar la última para colocarla en mi turno
    // Actualizar la partida
    await Partida.findOneAndUpdate(
      {codigo: _codigo}, // Filtrar
      partidaActual, // Actualizar (partida contiene los cambios)
      { new: true } // Para devolver el documento actualizado
    );
    // Colocar la mina que me falta en mi turno
    let req = { body: { codigo: _codigo, nombreId: 'usuario1', i: tableroDim, j: tableroDim} };
    let res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
      await colocarMina(req, res);
    } catch (error) {}    
    expect(res.statusCode).toBe(undefined);
    expect(res._json.finPartida).toBe(false);
    expect(res._json.usosHab).toBe(2);
    expect(res._json.turnosIA.length).toBe(1);
    expect(res._json.turnosIA[0].minaDisparada).toBeDefined();  // Ha explotado una mina
    expect(res._json.turnosIA[0].disparosRespuestaMina.length).toBe(5);  // La mina ha respondido con 5 disparos
    partidaActual = await Partida.findOne({codigo: _codigo});
    let iMinaExplotada = res._json.turnosIA[0].disparoRealizado.i;
    let jMinaExplotada = res._json.turnosIA[0].disparoRealizado.j;
    let minaExplotada = partidaActual.minas1.find(mina => mina.i === iMinaExplotada && mina.j === jMinaExplotada 
      && mina.estado === "Hundido");
    expect(minaExplotada).toBeDefined();  // La mina disparada está hundida
    expect(partidaActual.contadorTurno).toBe(3);
  });
});

describe("Respuesta de mina de la IA a un disparo básico mío", () => {
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

    const req3 = { body: { nombreId1: 'usuario1', bioma: 'Norte' } };
    const res3 = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
        await crearPartida(req3, res3);
    } catch (error) {}
    expect(res3.statusCode).toBe(undefined);
    _codigo = res3._json.codigo;
  });
  it("Debería responder la IA con 5 disparos", async () => {
    let partidaActual = await Partida.findOne({codigo: _codigo});
    // Quitar todos los barcos de la IA
    partidaActual.tableroBarcos2 = [];
    // Colocar mina en tablero de la IA
    partidaActual.minas2.push({i: 1, j: 1});
    // Actualizar la partida
    await Partida.findOneAndUpdate(
      {codigo: _codigo}, // Filtrar
      partidaActual, // Actualizar (partida contiene los cambios)
      { new: true } // Para devolver el documento actualizado
    );
    // Disparar a una mina de la IA
    let req = { body: { codigo: _codigo, nombreId: 'usuario1', i: 1, j: 1} };
    let res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
      await realizarDisparo(req, res);
    } catch (error) {}    
    expect(res.statusCode).toBe(undefined);
    expect(res._json.turnosIA.length).toBeGreaterThan(0);
    expect(res._json.minaDisparada).toBeDefined();  // He explotado una mina
    expect(res._json.disparosRespuestaMina.length).toBe(5);  // La mina ha respondido con 5 disparos
    partidaActual = await Partida.findOne({codigo: _codigo});
    let iMinaExplotada = res._json.disparoRealizado.i;
    let jMinaExplotada = res._json.disparoRealizado.j;
    let minaExplotada = partidaActual.minas2.find(mina => mina.i === iMinaExplotada && mina.j === jMinaExplotada 
      && mina.estado === "Hundido");
    expect(minaExplotada).toBeDefined();  // La mina disparada está hundida
    expect(partidaActual.contadorTurno).toBe(3);
  });
});

describe("Respuesta de mina de la IA a un disparo de ráfaga mío", () => {
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

    const req3 = { body: { nombreId1: 'usuario1', bioma: 'Norte' } };
    const res3 = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
        await crearPartida(req3, res3);
    } catch (error) {}
    expect(res3.statusCode).toBe(undefined);
    _codigo = res3._json.codigo;
  });
  it("Debería responder la IA con 5 disparos", async () => {
    let partidaActual = await Partida.findOne({codigo: _codigo});
    // Quitar todos los barcos de la IA
    partidaActual.tableroBarcos2 = [];
    // Colocar mina en tablero de la IA
    partidaActual.minas2.push({i: 1, j: 1});
    // Actualizar la partida
    await Partida.findOneAndUpdate(
      {codigo: _codigo}, // Filtrar
      partidaActual, // Actualizar (partida contiene los cambios)
      { new: true } // Para devolver el documento actualizado
    );
    // Disparar a la minas de la IA
    let req = { body: { codigo: _codigo, nombreId: 'usuario1', i: 1, j: 1, misilesRafagaRestantes: 1} };
    let res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
      await realizarDisparoMisilRafaga(req, res);
    } catch (error) {}    
    expect(res.statusCode).toBe(undefined);
    expect(res._json.turnosIA.length).toBeGreaterThan(0);
    expect(res._json.usosHab).toBe(2);
    expect(res._json.minaDisparada).toBeDefined();  // He explotado una mina
    expect(res._json.disparosRespuestaMina.length).toBe(5);  // La mina ha respondido con 5 disparos
    partidaActual = await Partida.findOne({codigo: _codigo});
    let iMinaExplotada = res._json.disparoRealizado.i;
    let jMinaExplotada = res._json.disparoRealizado.j;
    let minaExplotada = partidaActual.minas2.find(mina => mina.i === iMinaExplotada && mina.j === jMinaExplotada 
      && mina.estado === "Hundido");
    expect(minaExplotada).toBeDefined();  // La mina disparada está hundida
    expect(partidaActual.contadorTurno).toBe(3);
  });
});

describe("Respuesta de mina de la IA a un disparo de torpedo recargado mío", () => {
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

    const req3 = { body: { nombreId1: 'usuario1', bioma: 'Norte' } };
    const res3 = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
        await crearPartida(req3, res3);
    } catch (error) {}
    expect(res3.statusCode).toBe(undefined);
    _codigo = res3._json.codigo;
  });
  it("Debería responder la IA con 5 disparos", async () => {
    let partidaActual = await Partida.findOne({codigo: _codigo});
    // Quitar todos los barcos de la IA
    partidaActual.tableroBarcos2 = [];
    // Colocar minas en tablero de la IA
    for (let i = 1; i <= 3; i++) {
      for (let j = 1; j <= 3; j++) {
        partidaActual.minas2.push({i: i, j: j});
      }
    }
    // Actualizar la partida
    await Partida.findOneAndUpdate(
      {codigo: _codigo}, // Filtrar
      partidaActual, // Actualizar (partida contiene los cambios)
      { new: true } // Para devolver el documento actualizado
    );
    // Disparar a la minas de la IA
    let req = { body: { codigo: _codigo, nombreId: 'usuario1', i: 2, j: 2} };
    let res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
      await realizarDisparoTorpedoRecargado(req, res);
    } catch (error) {}    
    expect(res.statusCode).toBe(undefined);
    expect(res._json.turnosIA.length).toBeGreaterThan(0);
    expect(res._json.usosHab).toBe(2);
    expect(res._json.minasDisparadas.length).toBe(9);  // He explotado 9 minas
    expect(res._json.disparosRespuestasMinas.length).toBe(45);  // Las minas ha respondido con 5 disparos cada una
    partidaActual = await Partida.findOne({codigo: _codigo});
    let disparosRealizados = res._json.disparosRealizados;
    for (let disparo of disparosRealizados) {
      let iMinaExplotada = disparo.i;
      let jMinaExplotada = disparo.j;
      let minaExplotada = partidaActual.minas2.find(mina => mina.i === iMinaExplotada && mina.j === jMinaExplotada 
        && mina.estado === "Hundido");
      expect(minaExplotada).toBeDefined();  // La mina disparada está hundida
    }
    expect(partidaActual.contadorTurno).toBe(3);
  });
});

describe("Pierdo la partida por explotar minas", () => {
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

    const req3 = { body: { nombreId1: 'usuario1', bioma: 'Norte' } };
    const res3 = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
        await crearPartida(req3, res3);
    } catch (error) {}
    expect(res3.statusCode).toBe(undefined);
    _codigo = res3._json.codigo;
  });
  it("Debería responder la IA con 5 disparos", async () => {
    let partidaActual = await Partida.findOne({codigo: _codigo});
    // Quitar todos los barcos de la IA
    partidaActual.tableroBarcos2 = [];
    // Dejarme sólo un barco
    partidaActual.tableroBarcos1 = [partidaActual.tableroBarcos1[0]];
    // Colocar minas en tablero de la IA
    for (let i = 1; i <= 3; i++) {
      for (let j = 1; j <= 3; j++) {
        partidaActual.minas2.push({i: i, j: j});
      }
    }
    // Actualizar la partida
    await Partida.findOneAndUpdate(
      {codigo: _codigo}, // Filtrar
      partidaActual, // Actualizar (partida contiene los cambios)
      { new: true } // Para devolver el documento actualizado
    );
    // Disparar a minas hasta perder la partida
    while (true) {
      // Disparar a la minas de la IA
      let req = { body: { codigo: _codigo, nombreId: 'usuario1', i: 2, j: 2} };
      let res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
          this.statusCode = s; return this; }, send: () => {} };
      try {
        await realizarDisparoTorpedoRecargado(req, res);
      } catch (error) {}    
      expect(res.statusCode).toBe(undefined);
      // Verificar si he perdido
      if (res._json.finPartida) {
        partidaActual = await Partida.findOne({codigo: _codigo});
        expect(partidaActual.ganador).toBe('IA');
        break;
      }
      // Restaurar minas y uso de habilidad
      await Partida.findOneAndUpdate(
        {codigo: _codigo}, // Filtrar
        partidaActual, // Actualizar (partida contiene los cambios)
        { new: true } // Para devolver el documento actualizado
      );
    }
  }, 10000);
});

// Test for usarSonar
describe("Usar sónar", () => {
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

    const req3 = { body: { nombreId1: 'usuario1', bioma: 'Norte' } };
    const res3 = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
        await crearPartida(req3, res3);
    } catch (error) {}
    expect(res3.statusCode).toBe(undefined);
    _codigo = res3._json.codigo;
  });
  it("Debería usar el sónar correctamente en malla 3x3", async () => {
    let partidaActual = await Partida.findOne({codigo: _codigo});
    // Quitar mis barcos para no perder
    partidaActual.tableroBarcos1 = [];
    // Recolocar los barcos de la IA
    partidaActual.tableroBarcos2 = [partidaActual.tableroBarcos2[1]];
    partidaActual.tableroBarcos2[0].coordenadas = [{i: 1, j: 1}, {i: 1, j: 2}, {i: 1, j: 3}];
    // Colocar minas en tablero de la IA
    partidaActual.minas2.push({i: 2, j: 2});
    partidaActual.minas2.push({i: 3, j: 3});
    // Actualizar la partida
    await Partida.findOneAndUpdate(
      {codigo: _codigo}, // Filtrar
      partidaActual, // Actualizar (partida contiene los cambios)
      { new: true } // Para devolver el documento actualizado
    );
    // La esquina superior izquierda de la IA es
    // Barco Barco Barco
    // Agua  Mina  Agua
    // Agua  Agua  Mina
    let req = { body: { codigo: _codigo, nombreId: 'usuario1', i: 2, j: 2} };
    let res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
      await usarSonar(req, res);
    } catch (error) {}    
    expect(res.statusCode).toBe(undefined);
    expect(res._json.usosHab).toBe(2);
    expect(res._json.turnosIA.length).toBe(1);
    expect(res._json.sonar).toEqual([ // toEqual verifica recursivamente cada campo o componente
      ['Barco', 'Barco', 'Barco'],
      ['Agua', 'Mina', 'Agua'],
      ['Agua', 'Agua', 'Mina']
    ]);
  });
  it("Debería usar el sónar correctamente en malla 2x2", async () => {
    // La esquina superior izquierda de la IA es
    // Barco Barco Barco
    // Agua  Mina  Agua
    // Agua  Agua  Mina
    let req = { body: { codigo: _codigo, nombreId: 'usuario1', i: 1, j: 1} };
    let res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
      await usarSonar(req, res);
    } catch (error) {}    
    expect(res.statusCode).toBe(undefined);
    expect(res._json.usosHab).toBe(1);
    expect(res._json.turnosIA.length).toBe(1);
    expect(res._json.sonar).toEqual([ // toEqual verifica recursivamente cada campo o componente
      [null, null, null],
      [null, 'Barco', 'Barco'],
      [null, 'Agua', 'Mina']
    ]);
  });
  it("Debería usar el sónar correctamente en malla 2x3", async () => {
    // La esquina superior izquierda de la IA es
    // Barco Barco Barco
    // Agua  Mina  Agua
    // Agua  Agua  Mina
    let req = { body: { codigo: _codigo, nombreId: 'usuario1', i: 2, j: 1} };
    let res = { json: function(_json) {this._json = _json; return this;}, status: function(s) {
        this.statusCode = s; return this; }, send: () => {} };
    try {
      await usarSonar(req, res);
    } catch (error) {}    
    expect(res.statusCode).toBe(undefined);
    expect(res._json.usosHab).toBe(0);
    expect(res._json.turnosIA.length).toBe(1);
    expect(res._json.sonar).toEqual([ // toEqual verifica recursivamente cada campo o componente
      [null, 'Barco', 'Barco'],
      [null, 'Agua', 'Mina'],
      [null, 'Agua', 'Agua']
    ]);
  });
});

// Test de climas


// Test for enviarMensaje
describe("Enviar mensaje", () => {
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
        const req3 = { body: { nombreId1: 'usuario1', nombreId2: 'usuario2', bioma: 'Norte' } };
        const res3 = { json: function(_json) {this._json = _json; return this;}, status: function(s) { 
            this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPartida(req3, res3);
        } catch (error) {}
        expect(res3.statusCode).toBe(undefined);
        _codigo = res3._json.codigo;
    });
    it("Debería enviar un mensaje correctamente", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario1', mensaje: "Esto es una prueba" } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await enviarMensaje(req, res);
            }
        catch (error) {}
        expect(res.statusCode).toBe(undefined);
    });
    it("Debería fallar al enviar un mensaje con demasiados campos", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario1', mensaje: "Esto es una prueba", extra: 1 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await enviarMensaje(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar al enviar un mensaje sin autor", async () => {
        const req = { body: { codigo: _codigo, mensaje: "Esto es una prueba" } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await enviarMensaje(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar al enviar un mensaje sin mensaje", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario1' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await enviarMensaje(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar al enviar un mensaje con un autor inválido", async () => {
        const req = { body: { codigo: _codigo,nombreId: 'usuario3', mensaje: "Esto es una prueba" } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await enviarMensaje(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
    it("Debería fallar al enviar un mensaje con un código de partida inexistente", async () => {
        const req = { body: { codigo: 1, nombreId: 'usuario1', mensaje: "Esto es una prueba" } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await enviarMensaje(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
});

// Test for obtenerChat
describe("Obtener chat", () => {
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
        const req3 = { body: { nombreId1: 'usuario1', nombreId2: 'usuario2', bioma: 'Norte' } };
        const res3 = { json: function(_json) {this._json = _json; return this;}, status: function(s) { 
            this.statusCode = s; return this; }, send: () => {} };
        try {
            await crearPartida(req3, res3);
        } catch (error) {}
        expect(res3.statusCode).toBe(undefined);
        _codigo = res3._json.codigo;
        const req4 = { body: { codigo: _codigo, nombreId: 'usuario1', mensaje: "Esto es una prueba" } };
        const res4 = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await enviarMensaje(req4, res4);
        } catch (error) {}
        expect(res4.statusCode).toBe(undefined);
    });
    it("Debería obtener el chat correctamente", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario1' } };
        const res = { json: function(_json) {this._json = _json; return this;}, status: function(s) { 
            this.statusCode = s; return this; }, send: () => {} };
        try {
            await obtenerChat(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(undefined);
        expect(res._json[0].mensaje).toBe("Esto es una prueba");
    });
    it("Debería fallar al obtener el chat con demasiados campos", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario1', extra: 1 } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await obtenerChat(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar al obtener el chat sin código de partida", async () => {
        const req = { body: {nombreId: 'usuario1'} };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await obtenerChat(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar al obtener el chat sin usuario", async () => {
        const req = { body: {codigo: _codigo} };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await obtenerChat(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar al obtener el chat con un usuario inválido", async () => {
        const req = { body: { codigo: _codigo, nombreId: 'usuario3'} };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await obtenerChat(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
    it("Debería fallar al obtener el chat con un código de partida inexistente", async () => {
        const req = { body: { codigo: 1, nombreId: 'usuario1'} };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        try {
            await obtenerChat(req, res);
        } catch (error) {}
        expect(res.statusCode).toBe(404);
    });
    afterAll(() => {
      mongoose.disconnect();
    });
});
