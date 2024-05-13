const Perfil = require('../models/perfilModel');

const verificarRegistro = async (req, res, next) => {
    const { nombreId, correo } = req.body;
    const perfil = await Perfil.findOne({ $or: [{ nombreId }, { correo }] });
    if (perfil) {
        return res.status(400).send('Nombre de usuario o correo ya en uso');
    }
    next();
}

module.exports = verificarRegistro;