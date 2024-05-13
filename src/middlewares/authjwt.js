const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const Perfil = require('../models/perfilModel');

const verificarToken = async (req, res, next) => {
    let token = req.headers['authorization'];
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }
    if (!token) {
        console.error('No se ha proporcionado un token');
        return res.status(403).send({ message: 'No se ha proporcionado un token' });
    }
    jwt.verify(token, config.secret, async (err, decoded) => {
        if (err) {
            console.error('No autorizado');
            return res.status(401).send({ message: 'No autorizado' });
        }
        const nombreId = (req.body.nombreId ? req.body.nombreId : req.body.nombreId1)
        if (decoded.id !== nombreId) {
            console.error('El token no corresponde al usuario');
            return res.status(401).send({ message: 'El token no corresponde al usuario' });
        }

        const perfil = await Perfil.findOne({ nombreId: decoded.id });
        if (!perfil) {
            console.error('Perfil no encontrado');
            return res.status(404).send({ message: 'Perfil no encontrado' });
        }
        next();
    });
};

module.exports = verificarToken;
