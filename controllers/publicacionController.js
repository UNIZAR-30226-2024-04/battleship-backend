const Publicacion = require('../models/publicacionModel');
const Perfil = require('../models/perfilModel');
const publicacionesPredeterminadas = require('../data/publicaciones');
const { calcularNivel } = require('../data/niveles');
const {reaccionesDisponibles} = require('../data/reacciones');

/**
 * @module publicacion
 * @description Controlador para la gestión de publicaciones.
 */

// ------------------------------------------ //
// ----------- FUNCIONES INTERNAS ----------- //
// ------------------------------------------ //

// Función para generar un id de publicación único
function generarCodigo() {
  const timestamp = new Date().getTime(); // Obtiene el timestamp actual
  const hash = require('crypto').createHash('sha1'); // Selecciona el algoritmo hash
  hash.update(timestamp.toString()); // Actualiza el hash con el timestamp convertido a cadena
  const codigo = hash.digest('hex'); // Obtiene el hash en formato hexadecimal
  return parseInt(codigo.substring(0, 10), 16); // Convierte los primeros 10 caracteres del hash en un número
}


/**
 * @memberof module:publicacion
 * @function crearPublicacion
 * @description Crea una nueva publicación en el perfil del usuario especificado.
 * @param {Request} req - El objeto de solicitud HTTP.
 * @param {String} req.body.nombreId - El perfil debe existir en la base de datos.
 * @param {Number} req.body.tipoPublicacion - El tipo de publicación debe ser un número entero.
 * @param {Number} [req.body.nivel] - El nivel debe ser un número entero.
 * @param {Number} [req.body.trofeos] - Los trofeos deben ser un número entero.
 * @param {Number} [req.body.partidasGanadas] - Las partidas ganadas deben ser un número entero.
 * @param {Number} [req.body.partidasJugadas] - Las partidas jugadas deben ser un número entero.
 * @param {String} [req.body.torneo] - El torneo debe ser una cadena de texto.
 * @param {Publicacion} res - La publicación creada.
 * @param {String} res.publicacionId - Identificador de la publicación.
 * @example
 * perfil = { nombreId: 'usuario1', tipoPublicacion: 0, nivel: 10 };
 * const req = { body: perfil };
 * const res = { json: (publicacion) => { return publicacion; } };
 * await crearPublicacion(req, res);
 */
exports.crearPublicacion = async (req, res) => {
  try {
    const { nombreId, tipoPublicacion, ...extraParam } = req.body;
    if (Object.keys(extraParam).length > 1) {
      res.status(400).send({message: "Sobran parámetros, se esperan 3 como máximo"});
      console.error("Sobran parámetros, se esperan 3 como máximo");
      return;
    }
    if (!nombreId) {
      res.status(400).send({message: "Falta parámetro nombreId"});
      console.error("Falta parámetro nombreId");
      return;
    }
    if (tipoPublicacion === undefined) {
      res.status(400).send({message: "Falta parámetro tipoPublicacion"});
      console.error("Falta parámetro tipoPublicacion");
      return;
    }
    // El tipo de publicación debe ser un número entero
    if (!Number.isInteger(tipoPublicacion)) {
      res.status(400).send({message: "El tipo de publicación debe ser un número entero"});
      console.error("El tipo de publicación debe ser un número entero");
      return;
    }

    // El tipo de publicación debe estar en el rango de publicaciones predeterminadas
    if (tipoPublicacion < 0 || tipoPublicacion >= Object.keys(publicacionesPredeterminadas).length) {
      res.status(400).send({message: "El tipo de publicación no es válido"});
      console.error("El tipo de publicación no es válido");
      return;
    }
    const perfil = await Perfil.findOne({nombreId: req.body.nombreId});
    // Si el usuario no existe, devolvemos un error
    if (!perfil) {
      return res.status(404).send({message: "Usuario no encontrado"});
    }
    texto = "";
    switch (tipoPublicacion) {
      case 0:
        const nivel = req.body.nivel;
        if (nivel === undefined) {
          res.status(400).send({message: "Falta parámetro nivel"});
          console.error("Falta parámetro nivel");
          return;
        }
        if (!Number.isInteger(nivel)) {
          res.status(400).send({message: "El nivel debe ser un número entero"});
          console.error("El nivel debe ser un número entero");
          return;
        }
        // Comprobamos que el nivel del usuario sea al menos el nivel de la publicación
        [nivelReal, restantes, puntos] = calcularNivel(perfil.puntosExperiencia);
        if (nivelReal < nivel || nivel < 0) {
          res.status(400).send({message: "El nivel de la publicación es superior al nivel del usuario"});
          console.error("El nivel de la publicación es superior al nivel del usuario");
          return;
        }
        texto = publicacionesPredeterminadas[tipoPublicacion].texto_inicial + 
          nivel + publicacionesPredeterminadas[tipoPublicacion].texto_final;
        break;
      case 1:
        const trofeos = req.body.trofeos;
        if (trofeos === undefined) {
          res.status(400).send({message: "Falta parámetro trofeos"});
          console.error("Falta parámetro trofeos");
          return;
        }
        if (!Number.isInteger(trofeos)) {
          res.status(400).send({message: "Los trofeos deben ser un número entero"});
          console.error("Los trofeos deben ser un número entero");
          return;
        }
        // Comprobamos que los trofeos del usuario sean al menos los trofeos de la publicación
        if (perfil.trofeos < trofeos || trofeos < 0) {
          res.status(400).send({message: "Los trofeos de la publicación son superiores a los trofeos del usuario"});
          console.error("Los trofeos de la publicación son superiores a los trofeos del usuario");
          return;
        }
        texto = publicacionesPredeterminadas[tipoPublicacion].texto_inicial + 
          trofeos + publicacionesPredeterminadas[tipoPublicacion].texto_final;
        break;
      case 2:
        const partidasGanadas = req.body.partidasGanadas;
        if (partidasGanadas === undefined) {
          res.status(400).send({message: "Falta parámetro partidasGanadas"});
          console.error("Falta parámetro partidasGanadas");
          return;
        }
        if (!Number.isInteger(partidasGanadas)) {
          res.status(400).send({message: "Las partidas ganadas deben ser un número entero"});
          console.error("Las partidas ganadas deben ser un número entero");
          return;
        }
        // Comprobamos que las partidas ganadas del usuario sean al menos las partidas ganadas de la publicación
        if (perfil.partidasGanadas < partidasGanadas || partidasGanadas < 0) {
          res.status(400).send({message: "Las partidas ganadas de la publicación son superiores a las partidas ganadas del usuario"});
          console.error("Las partidas ganadas de la publicación son superiores a las partidas ganadas del usuario");
          return;
        }
        texto = publicacionesPredeterminadas[tipoPublicacion].texto_inicial + 
          partidasGanadas + publicacionesPredeterminadas[tipoPublicacion].texto_final;
        break;
      case 3:
        const partidasJugadas = req.body.partidasJugadas;
        if (partidasJugadas === undefined) {
          res.status(400).send({message: "Falta parámetro partidasJugadas"});
          console.error("Falta parámetro partidasJugadas");
          return;
        }
        if (!Number.isInteger(partidasJugadas)) {
          res.status(400).send({message: "Las partidas jugadas deben ser un número entero"});
          console.error("Las partidas jugadas deben ser un número entero");
          return;
        }
        // Comprobamos que las partidas jugadas del usuario sean al menos las partidas jugadas de la publicación
        if (perfil.partidasJugadas < partidasJugadas || partidasJugadas < 0) {
          res.status(400).send({message: "Las partidas jugadas de la publicación son superiores a las partidas jugadas del usuario"});
          console.error("Las partidas jugadas de la publicación son superiores a las partidas jugadas del usuario");
          return;
        }
        texto = publicacionesPredeterminadas[tipoPublicacion].texto_inicial + 
          partidasJugadas + publicacionesPredeterminadas[tipoPublicacion].texto_final;
        break;
      case 4:
        const torneo = req.body.torneo;
        if (!torneo) {
          res.status(400).send({message: "Falta parámetro torneo"});
          console.error("Falta parámetro torneo");
          return;
        }
        texto = publicacionesPredeterminadas[tipoPublicacion].texto_inicial + 
          torneo + publicacionesPredeterminadas[tipoPublicacion].texto_final;
        break;
      default:
        res.status(400).send({message: "Tipo de publicación no válido"});
        console.error("Tipo de publicación no válido");
        return;
    }
    const publicacion = new Publicacion({
      publicacionId: generarCodigo(),
      usuario: nombreId,
      texto: texto,
      reacciones: []
    });
    const savedPublicacion = await publicacion.save();
    res.json(savedPublicacion);
  }
  catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al crear la publicación");
  }
};

/**
 * @memberof module:publicacion
 * @function obtenerPublicaciones
 * @description Devuelve todas las publicaciones del perfil del usuario.
 * @param {Request} req - El objeto de solicitud HTTP.
 * @param {String} req.body.nombreId - El perfil debe existir en la base de datos.
 * @param {Publicacion[]} res - Lista de publicaciones del perfil.
 * @example
 * perfil = { nombreId: 'usuario1' };
 * const req = { body: perfil };
 * const res = { json: (perfil) => { return perfil; } };
 * await getPublicacionesPerfil(req, res);
 */
exports.obtenerPublicaciones  = async (req, res) => { 
  try {
    const { nombreId, ...extraParam } = req.body;
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send({message: "Sobran parámetros, se espera nombreId"});
      console.error("Sobran parámetros, se espera nombreId");
      return;
    }
    if (!nombreId) {
      res.status(400).send({message: "Falta parámetro nombreId"});
      console.error("Falta parámetro nombreId");
      return;
    }
    const perfil = await Perfil.findOne({nombreId: nombreId});
    // Si el usuario no existe, devolvemos un error
    if (!perfil) {
      res.status(404).send({message: "Usuario no encontrado"});
      console.error("Usuario no encontrado");
      return;
    }
    const publicaciones = await Publicacion.find({usuario: nombreId});
    res.json(publicaciones);
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al obtener las publicaciones del usuario");
  }
};

/**
 * @memberof module:publicacion
 * @function reaccionarPublicacion
 * @description Añade una reacción a una publicación identificada por su id, dado un usuario y una reacción predefinida.
 * @param {Request} req - El objeto de solicitud HTTP.
 * @param {String} req.body.publicacionId - La publicación debe existir en la base de datos.
 * @param {String} req.body.nombreId - El perfil debe existir en la base de datos.
 * @param {Number} req.body.reaccionId - La reacción debe ser un número entero.
 * @param {Publicacion} res - La publicación con la reacción añadida.
 * @example
 * reaccion = { publicacionId: '123', nombreId: 'usuario1', reaccionId: 0 };
 * const req = { body: reaccion };
 * const res = { json: (reaccion) => { return reaccion; } };
 * await reaccionarPublicacion(req, res);
 */
exports.reaccionarPublicacion = async (req, res) => {
  try {
    const { publicacionId, nombreId, reaccionId, ...extraParam } = req.body;
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send({message: "Sobran parámetros, se espera publicacionId"});
      console.error("Sobran parámetros, se espera publicacionId");
      return;
    }
    if (!publicacionId) {
      res.status(400).send({message: "Falta parámetro publicacionId"});
      console.error("Falta parámetro publicacionId");
      return;
    }
    if (!nombreId) {
      res.status(400).send({message: "Falta parámetro nombreId"});
      console.error("Falta parámetro nombreId");
      return;
    }
    if (reaccionId === undefined) {
      res.status(400).send({message: "Falta parámetro reaccionId"});
      console.error("Falta parámetro reaccionId");
      return;
    }
    // La reacción debe ser un número entero
    if (!Number.isInteger(reaccionId)) {
      res.status(400).send({message: "La reacción debe ser un número entero"});
      console.error("La reacción debe ser un número entero");
      return;
    }
    // La reacción debe estar en el rango de reacciones disponibles
    if (reaccionId < 0 || reaccionId >= reaccionesDisponibles.length) {
      res.status(400).send({message: "La reacción no es válida"});
      console.error("La reacción no es válida");
      return;
    }

    const publicacion = await Publicacion.findOne({publicacionId: publicacionId});
    if (!publicacion) {
      res.status(404).send({message: "Publicación no encontrada"});
      console.error("Publicación no encontrada");
      return;
    }
    const perfil = await Perfil.findOne({nombreId: nombreId});
    if (!perfil) {
      res.status(404).send({message: "Usuario no encontrado"});
      console.error("Usuario no encontrado");
      return;
    }
    
    const reaccionIndex = publicacion.reacciones.findIndex(r => r.nombreId === nombreId);
    // Si no existe reaccion por parte del usuario, la añadimos
    const estado = reaccionesDisponibles[reaccionId];
    if (reaccionIndex === -1) {
      publicacion.reacciones[publicacion.reacciones.length] = { nombreId: nombreId, estado: estado };
    } else {
      publicacion.reacciones[reaccionIndex].reaccion = { nombreId: nombreId, estado: estado };
    }

    const savedPublicacion = await Publicacion.findOneAndUpdate(
      {publicacionId: publicacionId}, 
      publicacion, 
      {new: true});
    res.json(savedPublicacion);
  }
  catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al obtener las publicaciones del usuario");
  }
};


/**
 * @memberof module:publicacion
 * @function eliminarPublicacion
 * @description Elimina una publicación de un usuario identificada por su id.
 * @param {Request} req - El objeto de solicitud HTTP.
 * @param {String} req.body.publicacionId - La publicación debe existir en la base de datos.
 * @param {String} req.body.nombreId - El perfil debe existir en la base de datos.
 * @param {Response} res - El objeto de respuesta HTTP.
 * @param {String} res.message - Mensaje de confirmación.
 * @example
 * publicacion = { publicacionId: '123', nombreId: 'usuario1' };
 * const req = { body: publicacion };
 * const res = { json: (publicacion) => { return publicacion; } };
 * await eliminarPublicacion(req, res);
 */
exports.eliminarPublicacion = async (req, res) => {
  try { 
    const { publicacionId, nombreId, ...extraParam } = req.body;
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send({message: "Sobran parámetros, se espera publicacionId"});
      console.error("Sobran parámetros, se espera publicacionId");
      return;
    }
    if (!publicacionId) {
      res.status(400).send({message: "Falta parámetro publicacionId"});
      console.error("Falta parámetro publicacionId");
      return;
    }
    if (!nombreId) {
      res.status(400).send({message: "Falta parámetro nombreId"});
      console.error("Falta parámetro nombreId");
      return;
    }

    const publicacion = await Publicacion.findOne({publicacionId: publicacionId});
    // Si la publicación no existe, devolvemos un error
    if (!publicacion) {
      res.status(404).send({message: "Publicación no encontrada"});
      console.error("Publicación no encontrada");
      return;
    }
    // Comprobamos que el usuario sea el autor de la publicación
    if (publicacion.usuario !== nombreId) {
      res.status(403).send({message: "No tienes permisos para eliminar esta publicación"});
      console.error("No tienes permisos para eliminar esta publicación");
      return;
    }
    await publicacion.remove();
    res.send({message: "Publicación eliminada"});
  }
  catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al eliminar la publicación");
  }
};
