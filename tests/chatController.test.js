const mongoose = require('mongoose');
const {registrarUsuario} = require('../controllers/perfilController');
const Chat = require('../models/chatModel');
const {enviarMensaje, obtenerChat} = require('../controllers/chatController');

const { mongoURI } = require('../uri');
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, 
  useCreateIndex: true, useFindAndModify: false});

// redirect console.log and console.error to /dev/null
console.error = function() {};
console.log = function() {};

// Test for enviarMensaje
describe('Enviar mensaje', () => {
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
    });
    it('Envía un mensaje entre dos jugadores', async () => {
        const req = { body: { nombreId1: 'usuario1', nombreId2: 'usuario2',
        mensaje: 'Hola' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        await enviarMensaje(req, res);
        expect(res.statusCode).toBe(undefined);
        const chat = await Chat.findOne({ nombreId1: 'usuario1', nombreId2: 'usuario2' });
        expect(chat.chat.length).toBe(1);
        expect(chat.chat[0].mensaje).toBe('Hola');
    });
    it('Envía un mensaje entre dos jugadores (al revés)', async () => {
        const req = { body: { nombreId1: 'usuario2', nombreId2: 'usuario1',
        mensaje: 'Hola2' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        await enviarMensaje(req, res);
        expect(res.statusCode).toBe(undefined);
        const chat = await Chat.findOne({ nombreId1: 'usuario1', nombreId2: 'usuario2' });
        expect(chat.chat.length).toBe(2);
        expect(chat.chat[1].mensaje).toBe('Hola2');
    });
    it("Debería fallar si falta un parámetro", async () => {
        const req = { body: { nombreId1: 'usuario1', mensaje: 'Hola' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        await enviarMensaje(req, res);
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar si hay parámetros extra", async () => {
        const req = { body: { nombreId1: 'usuario1', nombreId2: 'usuario2',
        mensaje: 'Hola', extra: 'extra' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        await enviarMensaje(req, res);
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar si alguno de los usuarios no existe", async () => {
        const req = { body: { nombreId1: 'usuario1', nombreId2: 'usuario4',
        mensaje: 'Hola' } };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        await enviarMensaje(req, res);
        expect(res.statusCode).toBe(404);
    });
    it("Debería fallar si se enviara un mensaje vacío", async () => {
        const req = { body: { nombreId1: 'usuario1', nombreId2: 'usuario2'} };
        const res = { json: () => {}, status: function(s) { 
          this.statusCode = s; return this; }, send: () => {} };
        await enviarMensaje(req, res);
        expect(res.statusCode).toBe(400);
    });
});

// Test for obtenerChat
describe('Obtener chat', () => {
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
    });
    it('Obtiene un chat entre dos jugadores', async () => {
        const req = { body: { nombreId1: 'usuario1', nombreId2: 'usuario2' } };
        const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
        await obtenerChat(req, res);
        expect(res.statusCode).toBe(undefined);
    });
    it('Obtiene un chat entre dos jugadores (al revés)', async () => {
        const req = { body: { nombreId1: 'usuario2', nombreId2: 'usuario1' } };
        const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
        await obtenerChat(req, res);
        expect(res.statusCode).toBe(undefined);
    });
    it("Debería fallar si falta un parámetro", async () => {
        const req = { body: { nombreId1: 'usuario1' } };
        const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
        await obtenerChat(req, res);
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar si hay parámetros extra", async () => {
        const req = { body: { nombreId1: 'usuario1', nombreId2: 'usuario2',
        extra: 'extra' } };
        const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
        await obtenerChat(req, res);
        expect(res.statusCode).toBe(400);
    });
    it("Debería fallar si alguno de los usuarios no existe", async () => {
        const req = { body: { nombreId1: 'usuario1', nombreId2: 'usuario4' } };
        const res = { json: () => {}, status: function(s) { 
        this.statusCode = s; return this; }, send: () => {} };
        await obtenerChat(req, res);
        expect(res.statusCode).toBe(404);
    });
    afterAll(async () => {
        mongoose.disconnect();
    });
});