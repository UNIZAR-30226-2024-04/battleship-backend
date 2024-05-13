const Perfil = require('../models/perfilModel');
const bcrypt = require('bcrypt'); // Para hash de constraseña
const jwt = require('jsonwebtoken'); // Para generar tokens JWT
const crypto = require('crypto'); // Para generar claves secretas
const habilidadesDisponibles = require('../data/habilidades')
const paisesDisponibles = require('../data/paises')
const Coordenada = require('../data/coordenada');
const config = require('../config/auth.config');
const {barcosDisponibles} = require('../data/barco');
const { calcularNivel } = require('../data/niveles');
/**
 * @module perfil
 * @description Funciones para el manejo de perfiles de usuario.
 * @requires bcrypt
 * @requires jsonwebtoken
 * @requires config
 * 
 */
const tableroDim = Coordenada.i.max;  // Dimensiones del tablero

/*--------------------------------------------------------------------------------------------------------------------*/
/*-------------------------------------------- FUNCIONES AUXILIARES  -------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------*/

// Funcion para comprobar que un parametro es un correo electronico
function verificarCorreo(correo) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(correo);
}

// Funcion para verificar que la contraseña cumple con los requisitos: 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 caracter especial
function verificarContraseña(contraseña) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return regex.test(contraseña);
}

// Funcion para comprobar que un dato es un numero
function esNumero(numero) {
  return !isNaN(numero);
}

// Funcion para crear un token de sesión
function crearToken(perfil) {
  // Si el nombre de usuario y la contraseña son válidos, generar un token JWT
  const token = jwt.sign({id: perfil.nombreId}, config.secret, 
    { algorithm: 'HS256', expiresIn: 86400 }); // Expira en 24 horas
  return token;
}

// Función para verificar si un barco es horizontal
function esBarcoHorizontal(barco) {
  return barco[0].i == barco[1].i;
}

/*--------------------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------ PERFIL BÁSICO  ----------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------*/

// /**
//  * @memberof module:perfilController
//  * @description Crea un nuevo perfil con el nombre, la contraseña hasheada y el correo.
//  * @param {Object} req - El objeto de solicitud HTTP.
//  * @param {string} req.body.nombreId - El nombre debe ser nuevo en la base de datos.
//  * @param {string} req.body.contraseña - La contraseña debe tener al menos 8 caracteres, 1 minúsucla, 1 mayúscula, 1 dígito y un caracter especial.
//  * @param {string} req.body.correo - El correo debe tener un formato válido.
//  * @param {Object} res - El objeto de respuesta HTTP.
//  * @example
//  * perfil = { nombreId: 'usuario1', contraseña: 'Passwd1.', correo: 'usuario1@example.com' };
//  * const req = { body: perfil };
//  * const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
//  * await crearPerfil(req, res);
//  */
crearPerfil = async (req, res) => {
  try {
    // Extracción de parámetros del cuerpo de la solicitud
    const { nombreId, contraseña, correo, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera nombreId, contraseña y correo');
      console.error("Sobran parámetros, se espera nombreId, contraseña y correo");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!nombreId || !contraseña || !correo) {
      res.status(400).send('Falta el nombreId, la contraseña y/o el correo');
      console.error("Falta el nombreId, la contraseña y/o el correo");
      return;
    }
    // Comprobar que la contraseña cumple con los requisitos
    if (!verificarContraseña(contraseña)) {
      res.status(400).send('La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 caracter especial');
      console.error("La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 caracter especial");
      return;
    }
    // Comprobar que el correo es válido
    if (!verificarCorreo(correo)) {
      res.status(400).send('El correo no es válido: ');
      console.error("El correo no es válido");
      return;
    }
    // Generar hash de la contraseña
    const hashContraseña = await bcrypt.hash(contraseña, 10); // 10 es el número de saltos de hashing

    // Comprobar que no existe perfil con ese nombre
    const doc = await Perfil.findOne({ nombreId: nombreId });
    if (doc) {
      res.status(400).send('Ya existe un perfil con ese nombre de usuario');
      console.error("Ya existe un perfil con ese nombre de usuario");
      return;
    }

    // Crear un tablero aleatorio con un barco de 5 casillas de largo. Coordenadas de izda a derecha o de arriba a abajo.
    // Notación matricial
    const tableroInicial = [
      {coordenadas: [{ i: 1, j: 1 }, { i: 1, j: 2 }],
       tipo: barcosDisponibles[0]},
      {coordenadas: [{ i: 7, j: 1 }, { i: 8, j: 1 }, { i: 9, j: 1 }],
       tipo: barcosDisponibles[1]},
      {coordenadas: [{ i: 3, j: 10 }, { i: 4, j: 10 }, { i: 5, j: 10 }], 
       tipo: barcosDisponibles[2]},
      {coordenadas: [{ i: 3, j: 6 }, { i: 4, j: 6 }, { i: 5, j: 6 }, { i: 6, j: 6 }],
       tipo: barcosDisponibles[3]},
      {coordenadas: [{ i: 10, j: 6 }, { i: 10, j: 7 }, { i: 10, j: 8 }, { i: 10, j: 9 }, { i: 10, j: 10 }], 
       tipo: barcosDisponibles[4]}
    ];
    
    // Creación del perfil en la base de datos
    const nuevoPerfil = new Perfil({
      nombreId,
      contraseña: hashContraseña,
      correo,
      tableroInicial
    });

    // Guardar el perfil en la base de datos
    const perfilGuardado = await nuevoPerfil.save();
    return perfilGuardado;
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al crear el perfil", error);
  }
};


/**
 * @memberof module:perfil
 * @function obtenerUsuario
 * @description Obtiene un perfil identificado por _id o nombreId.
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {string} req.body.nombreId - El perfil debe existir en la base de datos.
 * @param {Object} res - El objeto de respuesta HTTP.
 * @example
 * perfil = { nombreId: 'usuario1'};
 * const req = { body: perfil };
 * const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
 * await obtenerUsuario(req, res);
 */
exports.obtenerUsuario = async (req, res) => {
  try {
    // Extraer el nombreId del parámetro de la solicitud
    const { nombreId, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera nombreId');
      console.error("Sobran parámetros, se espera nombreId");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!nombreId) {
      res.status(400).send('Falta el nombreId en la solicitud');
      console.error("Falta el nombreId en la solicitud");
      return;
    }
    // Buscar el perfil en la base de datos
    const filtro = { nombreId: nombreId };
    const perfil = await Perfil.findOne(filtro);
    // Verificar si el perfil existe y enviar la respuesta al cliente
    if (perfil) {
      let perfilDevuelto = perfil;
      perfilDevuelto.contraseña = undefined; // No enviar la contraseña en la respuesta
      perfilDevuelto.listaAmigos = undefined; // No enviar la lista de amigos en la respuesta
      perfilDevuelto.listaSolicitudes = undefined; // No enviar la lista de solicitudes en la respuesta
      perfilDevuelto.tableroInicial = undefined; // No enviar el tablero inicial en la respuesta
      perfilDevuelto.mazoHabilidades = undefined; // No enviar el mazo de habilidades en la respuesta
      perfilDevuelto.correo = undefined; // No enviar el correo en la respuesta
      perfilDevuelto._id = undefined; // No enviar el _id en la respuesta
      let nivel, restantes, puntosNivel;
      [nivel, restantes, puntosNivel] = calcularNivel(perfil.puntosExperiencia);
      perfilDevuelto.nivel = nivel;
      perfilDevuelto.puntosExperienciaRestantes = restantes;
      perfilDevuelto.puntosExperienciaSiguienteNivel = puntosNivel;
      res.json(perfilDevuelto);
      console.log("Perfil obtenido con éxito");
    } else {
      res.status(404).send('No se ha encontrado el perfil a obtener');
      console.error("No se ha encontrado el perfil a obtener");
    }

  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al obtener el perfil", error);
  }
};

/**
 * @memberof module:perfil
 * @function obtenerDatosPersonales
 * @description Obtiene los datos personales de un perfil identificado por _id o nombreId.
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {string} req.body.nombreId - El perfil debe existir en la base de datos.
 * @param {Object} res - El objeto de respuesta HTTP.
 * @example
 * perfil = { nombreId: 'usuario1'};
 * const req = { body: perfil };
 * const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
 * await obtenerDatosPersonales(req, res);
 */
exports.obtenerDatosPersonales = async (req, res) => {
  try {
    // Extraer el nombreId del parámetro de la solicitud
    const { nombreId, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera nombreId');
      console.error("Sobran parámetros, se espera nombreId");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!nombreId) {
      res.status(400).send('Falta el nombreId en la solicitud');
      console.error("Falta el nombreId en la solicitud");
      return;
    }
    // Buscar el perfil en la base de datos
    const filtro = { nombreId: nombreId };
    const perfil = await Perfil.findOne(filtro);
    // Verificar si el perfil existe y enviar la respuesta al cliente
    if (perfil) {
      let perfilDevuelto = perfil;
      perfilDevuelto.contraseña = undefined; // No enviar la contraseña en la respuesta
      perfilDevuelto._id = undefined; // No enviar el _id en la respuesta
      // Para cada habilidad en el mazo, eliminar el _id
      if (perfilDevuelto.mazoHabilidades) {
        perfilDevuelto.mazoHabilidades.forEach(habilidad => {
          habilidad._id = undefined;
        });
      }
      // Para cada barco en el tablero, eliminar el _id y dentro de cada coordenada, eliminar el _id
      if (perfilDevuelto.tableroInicial) {
        perfilDevuelto.tableroInicial.forEach(barco => {
          barco._id = undefined;
          barco.coordenadas.forEach(coordenada => {
            coordenada._id = undefined;
          });
        });
      }
      let nivel, restantes, puntosNivel;
      [nivel, restantes, puntosNivel] = calcularNivel(perfil.puntosExperiencia);
      perfilDevuelto.nivel = nivel;
      perfilDevuelto.puntosExperienciaRestantes = restantes;
      perfilDevuelto.puntosExperienciaSiguienteNivel = puntosNivel;
      res.json(perfilDevuelto);
      console.log("Datos personales obtenidos con éxito");
    } else {
      res.status(404).send('No se ha encontrado el perfil a obtener');
      console.error("No se ha encontrado el perfil a obtener");
    }

  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al obtener el perfil", error);
  }
}


/**
 * @memberof module:perfil
 * @function modificarDatosPersonales
 * @description Modifica la contraseña y/o el correo de un perfil identificado por _id o nombreId.
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {string} req.body.nombreId - El perfil debe existir en la base de datos.
 * @param {string} [req.body.contraseña] - La contraseña debe tener al menos 8 caracteres, 1 minúsucla, 1 mayúscula, 1 dígito y un caracter especial.
 * @param {string} [req.body.correo] - El correo debe tener un formato válido.
 * @param {string} [req.body.pais] - El pais debe estar en la lista de paises disponibles.
 * @param {Object} res - El objeto de respuesta HTTP.
 * @example
 * perfil = { nombreId: 'usuario1', correo: 'MODIFICADOusuario1@example.com' };
 * const req = { body: perfil };
 * const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
 * await modificarDatosPersonales(req, res);
 */
exports.modificarDatosPersonales = async (req, res) => {
  try {
    // Extracción de parámetros del cuerpo de la solicitud
    const { nombreId, contraseña, correo, pais, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera nombreId, contraseña y/o correo');
      console.error("Sobran parámetros, se espera nombreId, contraseña y/o correo");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!nombreId) {
      res.status(400).send('Falta el nombreId en la solicitud');
      console.error("Falta el nombreId en la solicitud");
      return;
    }
    // Comprobar que la contraseña cumple con los requisitos
    if (contraseña && !verificarContraseña(contraseña)) {
      res.status(400).send('La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 caracter especial');
      console.error("La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 caracter especial");
      return;
    }
    // Comprobar que el correo es válido
    if (correo && !verificarCorreo(correo)) {
      res.status(400).send('El correo no es válido');
      console.error("El correo no es válido");
      return;
    }
    if (pais && !paisesDisponibles.includes(pais)) {
      res.status(400).send('El país no es válido');
      console.error("El país no es válido");
      return;
    }
    // Generar hash de la contraseña si se proporciona
    let hashContraseña; // valor undefined (si no se le da valor, no se tendrá en cuenta en el $set)
    if (contraseña) {
      hashContraseña = await bcrypt.hash(contraseña, 10); // 10 es el número de saltos de hashing
    }
    // Buscar y actualizar el perfil en la base de datos
    const filtro = { nombreId: nombreId };
    const perfilModificado = await Perfil.findOneAndUpdate(
      filtro, // Filtro para encontrar el perfil a modificar
      {
        $set: {
          contraseña: hashContraseña,
          correo: correo,
          pais: pais
        }
      },
      { new: true } // Para devolver el documento actualizado
    );

    // Verificar si el perfil existe y enviar la respuesta al cliente
    if (perfilModificado) {
      let perfilDevuelto = perfilModificado;
      perfilDevuelto.contraseña = undefined; // No enviar la contraseña en la respuesta
      perfilDevuelto._id = undefined; // No enviar el _id en la respuesta
      // Para cada habilidad en el mazo, eliminar el _id
      if (perfilDevuelto.mazoHabilidades) {
        perfilDevuelto.mazoHabilidades.forEach(habilidad => {
          habilidad._id = undefined;
        });
      }
      // Para cada barco en el tablero, eliminar el _id y dentro de cada coordenada, eliminar el _id
      if (perfilDevuelto.tableroInicial) {
        perfilDevuelto.tableroInicial.forEach(barco => {
          barco._id = undefined;
          barco.coordenadas.forEach(coordenada => {
            coordenada._id = undefined;
          });
        });
      }
      res.json(perfilDevuelto);
      console.log("Perfil modificado con éxito");
    } else {
      res.status(404).send('No se ha encontrado el perfil a modificar');
      console.error("No se ha encontrado el perfil a modificar");
    }

  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al modificar el perfil", error);
  }
};


/**
 * @memberof module:perfil
 * @function eliminarUsuario
 * @description Elimina un perfil de usuario identificado por _id o nombreId.
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {string} req.body.nombreId - El perfil debe existir en la base de datos.
 * @param {Object} res - El objeto de respuesta HTTP.
 * @example
 * perfil = { nombreId: 'usuario1'};
 * const req = { body: perfil };
 * const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
 * await eliminarUsuario(req, res);
 */
exports.eliminarUsuario = async (req, res) => {
  try {
    // Extraer el nombreId del parámetro de la solicitud
    const { nombreId, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera nombreId');
      console.error("Sobran parámetros, se espera nombreId");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!nombreId) {
      res.status(400).send('Falta el nombreId en la solicitud');
      console.error("Falta el nombreId en la solicitud");
      return;
    }
    // Buscar y eliminar el perfil de la base de datos
    const filtro = { nombreId: nombreId };
    const resultado = await Perfil.deleteOne(filtro);
    // Verificar si se eliminó el perfil y enviar la respuesta al cliente
    if (resultado.deletedCount > 0) {
      res.json({ mensaje: 'Perfil eliminado correctamente' });
      console.log("Perfil eliminado correctamente");
    } else {
      res.status(404).send('No se ha encontrado el perfil a eliminar');
      console.error("No se ha encontrado el perfil a eliminar");
    }
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al eliminar el perfil", error);
  }
};


/*--------------------------------------------------------------------------------------------------------------------*/
/*----------------------------------------- REGISTRO E INICIO DE SESIÓN  ---------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------*/

/**
 * @memberof module:perfil
 * @function registrarUsuario
 * @description Devuelve un token de sesión del perfil identificado por _id o nombreId si es creado con éxito.
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {string} req.body.nombreId - El perfil debe existir en la base de datos.
 * @param {string} req.body.contraseña - La contraseña debe tener al menos 8 caracteres, 1 minúsucla, 1 mayúscula, 1 dígito y un caracter especial.
 * @param {string} req.body.correo - El correo debe tener un formato válido.
 * @param {Object} res - El objeto de respuesta HTTP.
 * @param {Object} res.perfilDevuelto - perfil correspondiente al nombre y contraseña, sin la contraseña por seguridad.
 * @param {string} res.token - El token de sesión del perfil.
 * @example
 * perfil = { nombreId: 'usuario4', contraseña: 'Passwd4.', correo: 'usuario4@example.com' };
 * const req = { body: perfil };
 * const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
 * await registrarUsuario(req, res);
 */
exports.registrarUsuario = async (req, res) => {  // Requiere nombreId (o _id), contraseña y correo
  try {
    // Crear el perfil
    const perfil = await crearPerfil(req, res);
    if (perfil) {
      const token = crearToken(perfil);
      // Enviar el token como respuesta al cliente
      let perfilDevuelto = perfil;
      perfilDevuelto.contraseña = undefined; // No enviar la contraseña en la respuesta
      perfilDevuelto._id = undefined; // No enviar el _id en la respuesta
      // Para cada habilidad en el mazo, eliminar el _id
      if (perfilDevuelto.mazoHabilidades) {
        perfilDevuelto.mazoHabilidades.forEach(habilidad => {
          habilidad._id = undefined;
        });
      }
      // Para cada barco en el tablero, eliminar el _id y dentro de cada coordenada, eliminar el _id
      if (perfilDevuelto.tableroInicial) {
        perfilDevuelto.tableroInicial.forEach(barco => {
          barco._id = undefined;
          barco.coordenadas.forEach(coordenada => {
            coordenada._id = undefined;
          });
        });
      }
      [nivel, restantes, puntosNivel] = calcularNivel(perfil.puntosExperiencia);
      perfilDevuelto.nivel = nivel;
      perfilDevuelto.puntosExperienciaRestantes = restantes;
      perfilDevuelto.puntosExperienciaSiguienteNivel = puntosNivel;
      const data = {
        perfilDevuelto,
        token
      }
      res.json(data);
      console.log("Usuario registrado con éxito");
    }
  } catch (error) {
    // console.log("Ya se envió un mensaje de error en crearPerfil");
  }
};


/**
 * @memberof module:perfil
 * @function iniciarSesion
 * @description Devuelve un token de sesión del perfil identificado por _id o nombreId si la contraseña es correcta.
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {string} req.body.nombreId - El perfil debe existir en la base de datos.
 * @param {string} req.body.contraseña
 * @param {Object} res - El objeto de respuesta HTTP.
 * @param {Object} res.perfilDevuelto - perfil correspondiente al nombre y contraseña, sin la contraseña por seguridad.
 * @param {string} res.token - El token de sesión del perfil.
 * @example
 * perfil = { nombreId: 'usuario1', contraseña: 'Passwd1.'};
 * const req = { body: perfil };
 * const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
 * await iniciarSesion(req, res);
 */
exports.iniciarSesion = async (req, res) => { // Requiere nombreId (o _id) y contraseña
  try {
    // Buscar el perfil en la base de datos
    const perfil = await exports.autenticarUsuario(req, res);
    if (perfil) {
      const token = crearToken(perfil);
      // Enviar el token como respuesta al cliente
      perfilDevuelto = perfil;
      perfilDevuelto.contraseña = undefined; // No enviar la contraseña en la respuesta
      perfilDevuelto._id = undefined; // No enviar el _id en la respuesta
      // Para cada habilidad en el mazo, eliminar el _id
      if (perfilDevuelto.mazoHabilidades) {
        perfilDevuelto.mazoHabilidades.forEach(habilidad => {
          habilidad._id = undefined;
        });
      }
      // Para cada barco en el tablero, eliminar el _id y dentro de cada coordenada, eliminar el _id
      if (perfilDevuelto.tableroInicial) {
        perfilDevuelto.tableroInicial.forEach(barco => {
          barco._id = undefined;
          barco.coordenadas.forEach(coordenada => {
            coordenada._id = undefined;
          });
        });
      }
      [nivel, restantes, puntosNivel] = calcularNivel(perfil.puntosExperiencia);
      perfilDevuelto.nivel = nivel;
      perfilDevuelto.puntosExperienciaRestantes = restantes;
      perfilDevuelto.puntosExperienciaSiguienteNivel = puntosNivel;
      const data = {
        perfilDevuelto,
        token
      }
      res.json(data);
      console.log("Sesión iniciada con éxito");
    }  else { 
      // console.log("Ya se envió 404 en autenticarUsuario");
    }
    
  } catch (error) {
    // console.log("Ya se envió un mensaje de error en autenticarUsuario");
  }
};


// /**
//  * @memberof module:perfil
//  * @function autenticarUsuario
//  * @description Devuelve un perfil identificado por _id o nombreId si la contraseña es correcta. Devuelve null en caso contrario.
//  * @param {Object} req - El objeto de solicitud HTTP.
//  * @param {string} req.body.nombreId - El perfil debe existir en la base de datos.
//  * @param {string} req.body.contraseña
//  * @param {Object} res - El objeto de respuesta HTTP.
//  * @example
//  * perfil = { nombreId: 'usuario1', contraseña: 'Passwd1.'};
//  * const req = { body: perfil };
//  * const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
//  * await autenticarUsuario(req, res);
//  */
exports.autenticarUsuario = async (req, res) => { // Requiere nombreId y contraseña
  try {
    // Extraer los parámetros del cuerpo de la solicitud
    const { nombreId, contraseña, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera nombreId y contraseña');
      console.error("Sobran parámetros, se espera nombreId y contraseña");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!nombreId || !contraseña) {
      res.status(400).send('Falta el nombreId o la contraseña en la solicitud');
      console.error("Falta el nombreId y la contraseña en la solicitud");
      return;
    }
    // Buscar el perfil en la base de datos
    const filtro = { nombreId: nombreId };
    const perfil = await Perfil.findOne(filtro);
    if (perfil) {
      // Verificar la contraseña
      const contraseñaValida = await bcrypt.compare(contraseña, perfil.contraseña);
      if (!contraseñaValida) {
        res.status(404).send('La contraseña no es válida');
        console.error("La contraseña no es válida");
        return;
      }
      return perfil
    } else {
      res.status(404).send('No se ha encontrado el perfil a autenticar');
      console.error("No se ha encontrado el perfil a autenticar");
      return;
    }
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al autenticar al usuario", error);
    return;
  }
};

/*--------------------------------------------------------------------------------------------------------------------*/
/*------------------------------------------- ASPECTOS PARA PARTIDAS  ------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------*/

/**
 * @memberof module:perfil
 * @function modificarMazo
 * @description Modifica el mazo de un perfil identificado por _id o nombreId.
 * @param {Object} req - El objeto de solicitud HTTP con body.
 * @param {string} req.body.nombreId - El perfil debe existir en la base de datos.
 * @param {habilidadesDisponibles[]} [req.body.mazoHabilidades = []] - El mazo debe contener a lo sumo 3 habilidades de las disponibles ['Rafaga', 'Recargado', 'Sonar', 'Mina', 'Teledirigido'].
 * @param {Object} res - El objeto de respuesta HTTP.
 * @param {habilidadesDisponibles[]} res - El mazo de habilidades modificado.
 * @example
 * perfil = { nombreId: 'usuario1', mazoHabilidades: ['Rafaga', 'Mina', 'Sonar']};
 * const req = { body: perfil };
 * const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
 * await modificarMazo(req, res);
 */
exports.modificarMazo = async (req, res) => {
  try {
    // Extracción de parámetros del cuerpo de la solicitud
    const { nombreId, mazoHabilidades = [], ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera nombreId y mazoHabilidades');
      console.error("Sobran parámetros, se espera nombreId y mazoHabilidades");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!nombreId) {
      res.status(400).send('Falta el nombreId en la solicitud');
      console.error("Falta el nombreId en la solicitud");
      return;
    }
    // Verificar si mazoHabilidades es un array y tiene como máximo 3 elementos
    if (!Array.isArray(mazoHabilidades) || mazoHabilidades.length > 3) {
      res.status(400).send('El mazo debe tener como máximo 3 habilidades');
      console.error("El mazo debe tener como máximo 3 habilidades");
      return;
    }
    // Verificar si todas las habilidades elegidas están en la lista de habilidades disponibles
    const habilidadesNoDisponibles = mazoHabilidades.filter(habilidad => !habilidadesDisponibles.includes(habilidad));
    if (habilidadesNoDisponibles.length > 0) {
      const habilidadesMensaje = habilidadesDisponibles.join(', '); // Convierte la lista de habilidades en un string separado por comas
      res.status(400).send('Las habilidades deben estar entre:', habilidadesMensaje);
      console.error('Las habilidades deben estar entre:', habilidadesMensaje);
      return;
    }
    // Verificar que no haya habilidades repetidas en el mazo
    const habilidadesRepetidas = mazoHabilidades.filter((habilidad, index) => mazoHabilidades.indexOf(habilidad) !== index);
    if (habilidadesRepetidas.length > 0) {
      res.status(400).send('No puede haber habilidades repetidas en el mazo');
      console.error("No puede haber habilidades repetidas en el mazo");
      return;
    }
    // Buscar y actualizar el perfil en la base de datos
    const filtro = { nombreId: nombreId };
    const perfilModificado = await Perfil.findOneAndUpdate(
      filtro, // Filtro para encontrar el perfil a modificar
      {
        $set: {
          mazoHabilidades: mazoHabilidades
        }
      },
      { new: true } // Para devolver el documento actualizado
    );

    // Verificar si el perfil existe y enviar la respuesta al cliente
    if (perfilModificado) {
      let mazoDevuelto = perfilModificado.mazoHabilidades;
      mazoDevuelto.forEach(habilidad => {
        habilidad._id = undefined;
      });
      res.json(mazoDevuelto);
      console.log("Mazo modificado con éxito");
    } else {
      res.status(404).send('No se ha encontrado el perfil a modificar');
      console.error("No se ha encontrado el perfil a modificar");
    }
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al modificar el mazo", error);
  }
};

// Función para trasladar y/o rotar un barco dentro del tablero
function moverBarco(barco, iProaNueva, jProaNueva, rotar) {
  // Definir traslación y mover proa
  if (iProaNueva) {
    var difX = iProaNueva - barco[0].i;
    barco[0].i = iProaNueva;
  } else var difX = 0;
  if (jProaNueva) {
    var difY = jProaNueva - barco[0].j;
    barco[0].j = jProaNueva;
  } else var difY = 0;
  // Mover resto del barco
  if (rotar) {  // Rotar y trasladar
    if (esBarcoHorizontal(barco)) {
      for (let i = 1; i < barco.length; i++) {
        var nuevaX = barco[i].i + i + difX;
        if (1 <= nuevaX && nuevaX <= tableroDim) barco[i].i = nuevaX;
        else return false;
        var nuevaY = barco[i].j - i + difY;
        if (1 <= nuevaY && nuevaY <= tableroDim) barco[i].j = nuevaY;
        else return false;
      }
    } else {  // Barco vertical
      for (let i = 1; i < barco.length; i++) {
        var nuevaX = barco[i].i - i + difX;
        if (1 <= nuevaX && nuevaX <= tableroDim) barco[i].i = nuevaX;
        else return false;
        var nuevaY = barco[i].j + i + difY;
        if (1 <= nuevaY && nuevaY <= tableroDim) barco[i].j = nuevaY;
        else return false;
      }
    }
  } else {  // Solo trasladar
    for (let i = 1; i < barco.length; i++) {
      var nuevaX = barco[i].i + difX;
      if (1 <= nuevaX && nuevaX <= tableroDim) barco[i].i = nuevaX;
      else return false;
      var nuevaY = barco[i].j + difY;
      if (1 <= nuevaY && nuevaY <= tableroDim) barco[i].j = nuevaY;
      else return false;
    }
  }
  return true;
}

// Función para verificar si el barco que irá en la posición barcoId colisiona con otros barcos
function barcoColisiona(tablero, barco, barcoId) {
  for (let i = 0; i < barcoId; i++) { // Recorrer los otros barcos
    for (const coordenada of tablero[i].coordenadas) {
      for (const nuevaCoordenada of barco) {
        if (coordenada.i === nuevaCoordenada.i && coordenada.j === nuevaCoordenada.j) {
          return true; // Hay colisión
        }
      }
    }
  }
  for (let i = barcoId + 1; i < tablero.length; i++) {
    for (const coordenada of tablero[i].coordenadas) { // Recorrer los otros barcos
      for (const nuevaCoordenada of barco) {
        if (coordenada.i === nuevaCoordenada.i && coordenada.j === nuevaCoordenada.j) {
          return true; // Hay colisión
        }
      }
    }
  }
  return false; // No hay colisión
}

/**
 * @memberof module:perfil
 * @function moverBarcoInicial
 * @description Mueve y/o rota el barco indicado por barcoId en el tablero inicial de un perfil identificado por _id o nombreId.
 * Para trasladar el barco se indica la nueva posición de la proa (parte izquierda si el barco es horizontal o parte superior si es 
 * vertical) con iProaNueva, jProaNueva. Para rotar el barco se escribe 1 en rotar.
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {string} req.body.nombreId - El perfil debe existir en la base de datos.
 * @param {number} [req.body.barcoId = 0] - Debe estar entre 0 y el número de barcos - 1 (entre 0 y 4 en el juego base).
 * @param {number} [req.body.iProaNueva] - Debe estar entre 1 y 10.
 * @param {number} [req.body.jProaNueva] - Debe estar entre 1 y 10.
 * @param {number} [req.body.rotar] - Debe ser 0 (equivalente a omitirlo) o 1.
 * @param {Object} res - El objeto de respuesta HTTP, devuelto como JSON.
 * @param {Tablero} res.tableroDevuelto - Tablero inicial modificado.
 * @param {boolean} res.tableroDevuelto.fueraTablero - Indica si el barco se sale del tablero.
 * @param {boolean} res.tableroDevuelto.colisiona - Indica si el barco colisiona con otros barcos.
 * @example
 * perfil = { nombreId: 'usuario1', barcoId: 3, iProaNueva: 1, jProaNueva: 6, rotar: 1 };
 * const req = { body: perfil };
 * const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
 * await moverBarcoInicial(req, res);
 */
exports.moverBarcoInicial = async (req, res) => {
  try {
    // Extracción de parámetros del cuerpo de la solicitud
    const { nombreId, barcoId = 0, iProaNueva, jProaNueva, rotar, ...extraParam } = req.body;  // Consideramos proa la coordenada más izda/arriba si barco horizontal/vertical
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera nombreId, barcoId, iProaNueva, jProaNueva y/o rotar');
      console.error("Sobran parámetros, se espera nombreId, barcoId, iProaNueva, jProaNueva y/o rotar");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!nombreId ) {
      res.status(400).send('Falta el nombreId en la solicitud');
      console.error("Falta el nombreId en la solicitud");
      return;
    }
    // Verificar que los parámetros del movimiento son numéricos
    if (!esNumero(barcoId) || (iProaNueva && !esNumero(iProaNueva)) || (jProaNueva && !esNumero(jProaNueva)) 
      || (rotar && !esNumero(rotar))) {
      res.status(400).send('Los parámetros del movimiento deben ser numéricos');
      console.error("Los parámetros del movimiento deben ser numéricos");
      return;
    }
    // Verificar que la nueva coordenada de proa está en el rango correcto
    if (iProaNueva < 1 || iProaNueva > tableroDim || jProaNueva < 1 || jProaNueva > tableroDim) {
      res.status(400).send("Las coordenadas de la nueva proa deben estar entre 1 y " + (tableroDim));
      console.error("Las coordenadas de la nueva proa deben estar entre 1 y " + (tableroDim));
      return;
    }
    // Buscar el perfil en la base de datos y obtener su tableroInicial
    const filtro = { nombreId: nombreId };
    const perfil = await Perfil.findOne(filtro);
    if (!perfil) {
      res.status(404).send('No se ha encontrado el perfil a modificar');
      console.error("No se ha encontrado el perfil a modificar");
      return;
    } 
    tableroInicial = perfil.tableroInicial; // No es una copia, es otro puntero
    // Verificar que barcoId es un índice válido de tableroInicial
    if (barcoId < 0 || barcoId >= tableroInicial.length) {
      res.status(400).send("barcoId debe estar entre 0 y "+(tableroInicial.length - 1));
      console.error("barcoId debe estar entre 0 y "+(tableroInicial.length - 1));
      return;
    }
    barco = tableroInicial[barcoId];
    // Verificar que la nueva posición del barco está en el rango correcto
    if (moverBarco(barco.coordenadas, iProaNueva, jProaNueva, rotar)) {
      // Verificar que la nueva posición del barco no colisiona con otros barcos
      if (barcoColisiona(tableroInicial, barco.coordenadas, barcoId)) {
        res.json({ tableroDevuelto: undefined, fueraTablero: false, colisiona: true });
        console.log("El movimiento del barco colisiona con otros barcos");
        return;
      }
    } else {
      res.json({ tableroDevuelto: undefined, fueraTablero: true, colisiona: false });
      console.log("El movimiento del barco se sale del tablero");
      return;
    }
    // Buscar y actualizar el perfil en la base de datos
    const perfilModificado = await Perfil.findOneAndUpdate(
      filtro, // Filtro para encontrar el perfil a modificar
      {
        $set: {
          tableroInicial: tableroInicial
        }
      },
      { new: true } // Para devolver el documento actualizado
    );
    // Verificar si el perfil existe y enviar la respuesta al cliente
    if (perfilModificado) {
      let tableroDevuelto = perfilModificado.tableroInicial;
      tableroDevuelto.forEach(barco => {
        barco._id = undefined;
        barco.coordenadas.forEach(coordenada => {
          coordenada._id = undefined;
        });
      });
      res.json( { tableroDevuelto, fueraTablero: false, colisiona: false } );
      console.log("Tablero inicial modificado con éxito");
    } else {
      res.status(404).send('No se ha encontrado el perfil a modificar');
      console.error("No se ha encontrado el perfil a modificar");
    }
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al modificar el tablero inicial", error);
  }
};

/*--------------------------------------------------------------------------------------------------------------------*/
/*--------------------------------------------- PERFIL POST PARTIDA  -------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------*/

// /**
//  * @memberof module:perfil
//  * @function actualizarEstadisticas
//  * @description Actualiza las estadísticas de un perfil identificado por _id o nombreId. Las nuevas estadísticas indicadas 
//  * incrementan a las existentes en la base de datos. Los nuevos trofeos se suman si victoria es 1 y se restan si victoria es 0.
//  * Normalmente, se llama con una funcion similar que pertenece al modulo de partida.
//  * @param {Object} req - El objeto de solicitud HTTP.
//  * @param {string} req.body.nombreId - El perfil debe existir en la base de datos.
//  * @param {number} req.body.victoria - Debe ser 0 o 1.
//  * @param {number} req.body.nuevosBarcosHundidos
//  * @param {number} req.body.nuevosBarcosPerdidos
//  * @param {number} req.body.nuevosDisparosAcertados
//  * @param {number} req.body.nuevosDisparosFallados
//  * @param {number} [req.body.nuevosTrofeos = 0]
//  * @param {Object} res - El objeto de respuesta HTTP.
//  * @example
//  * perfil = { nombreId: 'usuario1', victoria: 1, nuevosBarcosHundidos: 1, nuevosBarcosPerdidos:1, 
//             nuevosDisparosAcertados: 1, nuevosDisparosFallados: 1, nuevosTrofeos: 30};
//  * const req = { body: perfil };
//  * const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
//  * await actualizarEstadisticas(req, res);
//  */
exports.actualizarEstadisticas = async (req, res) => {
  try {
    // Extracción de parámetros del cuerpo de la solicitud
    const {nombreId, victoria, nuevosBarcosHundidos, nuevosBarcosPerdidos, nuevosDisparosAcertados, 
      nuevosDisparosFallados, nuevosTrofeos = 0, ...extraParam} = req.body; // Por defecto, no hay trofeos en juego
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera nombreId, victoria, nuevosBarcosHundidos, nuevosBarcosPerdidos, nuevosDisparosAcertados, nuevosDisparosFallados y nuevosTrofeos');
      console.error("Sobran parámetros, se espera nombreId, victoria, nuevosBarcosHundidos, nuevosBarcosPerdidos, nuevosDisparosAcertados, nuevosDisparosFallados y nuevosTrofeos");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!nombreId ) {
      res.status(400).send('Falta el nombreId en la solicitud');
      console.error("Falta el nombreId en la solicitud");
      return;
    }
    if (victoria !== undefined) {
      if (!esNumero(victoria) || (victoria !== 0 && victoria !== 1)) {
        res.status(400).send('La victoria debe ser 0 o 1');
        console.error("La victoria debe ser 0 o 1");
        return;
      }
    }
    // Verificar que las estadísticas son numéricas
    if (!esNumero(nuevosBarcosHundidos) || !esNumero(nuevosBarcosPerdidos) || 
      !esNumero(nuevosDisparosAcertados) || !esNumero(nuevosDisparosFallados) || !esNumero(nuevosTrofeos)) {
        res.status(400).send('Las estadísticas deben ser numéricas');
        console.error("Las estadísticas deben ser numéricas");
        return;
    }
    // Buscar y actualizar el perfil en la base de datos
    const filtro = { nombreId: nombreId };
    const perfilModificado = await Perfil.findOneAndUpdate(
      filtro, // Filtro para encontrar el perfil a modificar
      {
        $inc: {
          partidasJugadas: (victoria === undefined) ? 0 : 1,
          partidasGanadas: (victoria === 1) ? 1 : 0,
          barcosHundidos: nuevosBarcosHundidos,
          barcosPerdidos: nuevosBarcosPerdidos,
          disparosAcertados: nuevosDisparosAcertados,
          disparosFallados: nuevosDisparosFallados,
          trofeos: nuevosTrofeos
        }
      },
      { new: true } // Para devolver el documento actualizado
    );
    // Verificar si el perfil existe y enviar la respuesta al cliente
    if (perfilModificado) {
      let perfilDevuelto = { nombreId: perfilModificado.nombreId,
        partidasJugadas: perfilModificado.partidasJugadas,
        partidasGanadas: perfilModificado.partidasGanadas,
        barcosHundidos: perfilModificado.barcosHundidos,
        barcosPerdidos: perfilModificado.barcosPerdidos,
        disparosAcertados: perfilModificado.disparosAcertados,
        disparosFallados: perfilModificado.disparosFallados,
        trofeos: perfilModificado.trofeos
      };
      res.json(perfilDevuelto);
      console.log("Perfil modificado con éxito");
    } else {
      res.status(404).send('No se ha encontrado el perfil a actualizar');
      console.error("No se ha encontrado el perfil a actualizar");
    }

  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al actualizar el perfil", error);
    console.log("Error al actualizar el perfil", error);
  }
};

// /**
//  * @memberof module:perfil
//  * @function actualizarPuntosExperiencia
//  * @description Actualiza los puntos de experiencia de un perfil identificado por _id o nombreId. Los nuevos puntos de experiencia 
//  * indicados incrementan a los existentes en la base de datos.
//  * @param {Object} req - El objeto de solicitud HTTP.
//  * @param {string} req.body.nombreId - El perfil debe existir en la base de datos.
//  * @param {number} req.body.nuevosPuntosExperiencia
//  * @param {Object} res - El objeto de respuesta HTTP.
//  * @example
//  * perfil = { nombreId: 'usuario1', nuevosPuntosExperiencia: 10};
//  * const req = { body: perfil };
//  * const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
//  * await actualizarPuntosExperiencia(req, res);
//  */
exports.actualizarPuntosExperiencia = async (req, res) => {
  try {
    // Extracción de parámetros del cuerpo de la solicitud
    const { nombreId, nuevosPuntosExperiencia, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera nombreId y nuevosPuntosExperiencia');
      console.error("Sobran parámetros, se espera nombreId y nuevosPuntosExperiencia");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!nombreId) {
      res.status(400).send('Falta el nombreId en la solicitud');
      console.error("Falta el nombreId en la solicitud");
      return;
    }
    // Verificar que la experiencia es numérica
    if (!esNumero(nuevosPuntosExperiencia)) {
        res.status(400).send('Los puntos de experiencia deben ser numéricos');
        console.error("Los puntos de experiencia deben ser numéricos");
        return;
    }
    // Buscar y actualizar el perfil en la base de datos
    const filtro = { nombreId: nombreId };
    const perfilModificado = await Perfil.findOneAndUpdate(
      filtro, // Filtro para encontrar el perfil a modificar
      {
        $inc: {
          puntosExperiencia: nuevosPuntosExperiencia
        }
      },
      { new: true } // Para devolver el documento actualizado
    );
    // Verificar si el perfil existe y enviar la respuesta al cliente
    if (perfilModificado) {
      let perfilDevuelto = { nombreId: perfilModificado.nombreId,
        puntosExperiencia: perfilModificado.puntosExperiencia };
      res.json(perfilDevuelto);
      console.log("Perfil modificado con éxito");
    } else {
      res.status(404).send('No se ha encontrado el perfil a actualizar');
      console.error("No se ha encontrado el perfil a actualizar");
    }

  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al actualizar el perfil", error);
  }
};

/*--------------------------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------- RED SOCIAL  ----------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------*/

/**
 * @memberof module:perfil
 * @function agnadirAmigos
 * @description Acepta una solicitud de amistad de un perfil identificado por nombreIdAmigo en el perfil identificado por _id o nombreId.
 * Añade el nombreIdAmigo a la lista de amigos del perfil y viceversa.
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {string} req.body.nombreId - El perfil debe existir en la base de datos.
 * @param {string} req.body.nombreIdAmigo - El amigo debe existir en la base de datos.
 * @param {String[]} res - El objeto de respuesta HTTP, formado por la lista de amigos (nombreId) actualizada.
 * @example
 * perfil = { nombreId: 'usuario1', nombreIdAmigo: 'usuario2'};
 * const req = { body: perfil };
 * const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
 * await agnadirAmigo(req, res);
 */
exports.agnadirAmigo = async (req, res) => {
  try {
    // Extraer los parámetros del cuerpo de la solicitud
    const {nombreId, nombreIdAmigo, ...extraParam} = req.body;
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera nombreId y nombreIdAmigo');
      console.error("Sobran parámetros, se espera nombreId y nombreIdAmigo");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!nombreId || !nombreIdAmigo) {
      res.status(400).send('Falta el nombreId o el nombreIdAmigo en la solicitud');
      console.error("Falta el nombreId o el nombreIdAmigo en la solicitud");
      return;
    }
    // Buscar el perfil en la base de datos
    const filtro = { nombreId: nombreId };
    const perfil = await Perfil.findOne(filtro);
    if (!perfil) {
      res.status(404).send('No se ha encontrado el perfil a modificar');
      console.error("No se ha encontrado el perfil a modificar");
      return;
    }
    if (!nombreId) { // Si no se proporciona nombreId, lo cargamos del perfil
      nombreId = perfil.nombreId;
    }
    // Buscar el amigo en la base de datos
    const amigo = await Perfil.findOne({ nombreId: nombreIdAmigo });
    if (!amigo) {
      res.status(404).send('No se ha encontrado el amigo a añadir');
      console.error("No se ha encontrado el amigo a añadir");
      return;
    }
    // Verificar si el amigo ya está en la lista de amigos
    if (perfil.listaAmigos.includes(nombreIdAmigo)) {
      res.status(404).send('El amigo ya estaba en la lista de amigos');
      console.error("El amigo ya estaba en la lista de amigos");
      return;
    }
    if (amigo.listaAmigos.includes(nombreId)) {
      res.status(404).send('El amigo ya estaba en la lista de amigos');
      console.error("El amigo ya estaba en la lista de amigos");
      return;
    }
    // Verificar si el amigo está en la lista de solicitudes
    if (!perfil.listaSolicitudes.includes(nombreIdAmigo)) {
      res.status(404).send('El amigo no estaba en la lista de solicitudes');
      console.error("El amigo no estaba en la lista de solicitudes");
      return;
    }
    // Añadir el amigo a la lista de amigos
    perfil.listaAmigos.push(nombreIdAmigo);
    amigo.listaAmigos.push(nombreId);
    // Eliminar la solicitud de amistad
    perfil.listaSolicitudes.pull(nombreIdAmigo);
    // Guardar el perfil modificado en la base de datos
    const perfilModificado = await perfil.save();
    const amigoModificado = await amigo.save();
    // Verificar si el perfil existe y enviar la respuesta al cliente
    if (perfilModificado && amigoModificado) {
      let listaAmigosDevuelta = perfilModificado.listaAmigos;
      listaAmigosDevuelta._id = undefined;
      res.json(listaAmigosDevuelta);
      console.log("Amigo añadido con éxito");
    } else {
      res.status(404).send('No se ha podido añaadir el amigo');
      console.error("No se ha podido añadir el amigo");
    }
  }
  catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al añadir amigo", error);
  }
};

/**
 * 
 * @memberof module:perfil
 * @function obtenerAmigos
 * @description Obtiene la lista de amigos de un perfil identificado por _id o nombreId.
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {string} req.body.nombreId - El perfil debe existir en la base de datos.
 * @param {String[]} res - El objeto de respuesta HTTP, formado por la lista de amigos (nombreId).
 * @example
 * perfil = { nombreId: 'usuario1'};
 * const req = { body: perfil };
 * const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
 * await obtenerAmigos(req, res);
 */
exports.obtenerAmigos = async (req, res) => {
  try {
    // Extraer los parámetros del cuerpo de la solicitud
    const { nombreId, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera nombreId');
      console.error("Sobran parámetros, se espera nombreId");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!nombreId) {
      res.status(400).send('Falta el nombreId  en la solicitud');
      console.error("Falta el nombreId en la solicitud");
      return;
    }
    // Buscar el perfil en la base de datos
    const filtro = { nombreId: nombreId };
    const perfil = await Perfil.findOne(filtro);
    if (!perfil) {
      res.status(404).send('No se ha encontrado el perfil');
      console.error("No se ha encontrado el perfil");
      return;
    }
    // Verificar si el perfil existe y enviar la respuesta al cliente
    let listaAmigosDevuelta = perfil.listaAmigos;
    listaAmigosDevuelta._id = undefined;
    res.json(listaAmigosDevuelta);
    console.log("Amigos obtenidos con éxito");
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al obtener amigos", error);
  }
};


/**
 * @memberof module:perfil
 * @function eliminarAmigo
 * @description Elimina un amigo del perfil identificado por _id o nombreId.
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {string} req.body.nombreId - El perfil debe existir en la base de datos.
 * @param {string} req.body.nombreIdAmigo - El amigo debe existir en la base de datos.
 * @param {String[]} res - El objeto de respuesta HTTP, formado por la lista de amigos (nombreId) actualizada.
 * @example
 * perfil = { nombreId: 'usuario1', nombreIdAmigo: 'usuario2'};
 * const req = { body: perfil };
 * const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
 * await eliminarAmigo(req, res);
 */
exports.eliminarAmigo = async (req, res) => {
  try {
    // Extraer los parámetros del cuerpo de la solicitud
    const { nombreId, nombreIdAmigo, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera o nombreId y nombreIdAmigo');
      console.error("Sobran parámetros, se espera nombreId y nombreIdAmigo");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!nombreId || !nombreIdAmigo) {
      res.status(400).send('Falta el nombreId o el nombreIdAmigo en la solicitud');
      console.error("Falta el nombreId o el nombreIdAmigo en la solicitud");
      return;
    }
    // Buscar el perfil en la base de datos
    const filtro = { nombreId: nombreId };

    const perfil = await Perfil.findOne(filtro);
    if (!perfil) {
      res.status(404).send('No se ha encontrado el perfil a modificar');
      console.error("No se ha encontrado el perfil a modificar");
      return;
    }
    if (!nombreId) { // Si no se proporciona nombreId, lo cargamos del perfil
      nombreId = perfil.nombreId;
    }
    // Buscar el amigo en la base de datos
    const amigo = await Perfil.findOne({ nombreId: nombreIdAmigo });
    if (!amigo) {
      res.status(404).send('No se ha encontrado el amigo a eliminar');
      console.error("No se ha encontrado el amigo a eliminar");
      return;
    }
    // Verificar si el amigo está en la lista de amigos
    if (!perfil.listaAmigos.includes(nombreIdAmigo) || !amigo.listaAmigos.includes(nombreId)) {
      res.status(404).send('El amigo no estaba en la lista de amigos');
      console.error("El amigo no estaba en la lista de amigos");
      return;
    }
    // Eliminar el amigo de la lista de amigos
    perfil.listaAmigos.pull(nombreIdAmigo);
    amigo.listaAmigos.pull(nombreId);
    // Guardar el perfil modificado en la base de datos
    const perfilModificado = await perfil.save();
    const amigoModificado = await amigo.save();
    // Verificar si el perfil existe y enviar la respuesta al cliente
    if (perfilModificado && amigoModificado) {
      let listaAmigosDevuelta = perfilModificado.listaAmigos;
      listaAmigosDevuelta._id = undefined;
      res.json(listaAmigosDevuelta);
      console.log("Amigo eliminado con éxito");
    } else {
      res.status(404).send('No se ha encontrado el perfil a modificar');
      console.error("No se ha encontrado el perfil a modificar");
    }
  }
  catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al eliminar amigo", error);
  }
}

/**
 * @memberof module:perfil
 * @function enviarSolicitudAmistad
 * @description Envia una solicitud de amistad a un perfil identificado por nombreIdAmigo desde el perfil identificado por _id o nombreId.
 * Añade el nombreId a la lista de solicitudes del perfil.
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {string} req.body.nombreId - El perfil debe existir en la base de datos.
 * @param {string} req.body.nombreIdAmigo - El amigo debe existir en la base de datos.
 * @param {Object} res - El objeto de respuesta HTTP
 * @example
 * perfil = { nombreId: 'usuario1', nombreIdAmigo: 'usuario2'};
 * const req = { body: perfil };
 * const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
 * await enviarSolicitudAmistad(req, res);
 */
exports.enviarSolicitudAmistad = async (req, res) => {
  try {
    // Extraer los parámetros del cuerpo de la solicitud
    const { nombreId, nombreIdAmigo, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera nombreId y nombreIdAmigo');
      console.error("Sobran parámetros, se espera nombreId y nombreIdAmigo");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!nombreId || !nombreIdAmigo) {
      res.status(400).send('Falta el nombreId  o el nombreIdAmigo en la solicitud');
      console.error("Falta el nombreId o el nombreIdAmigo en la solicitud");
      return;
    }
    // Verificar si el perfil y el amigo son el mismo
    if (nombreId === nombreIdAmigo) {
      res.status(404).send('No puedes añadirte a ti mismo como amigo');
      console.error("No puedes añadirte a ti mismo como amigo");
      return;
    }
    // Buscar el perfil en la base de datos
    const filtro = { nombreId: nombreId };
    const perfil = await Perfil.findOne(filtro);
    if (!perfil) {
      res.status(404).send('No se ha encontrado el perfil a modificar');
      console.error("No se ha encontrado el perfil a modificar");
      return;
    }
    if (!nombreId) { // Si no se proporciona nombreId, lo cargamos del perfil
      nombreId = perfil.nombreId;
    }
    // Buscar el amigo en la base de datos
    const amigo = await Perfil.findOne({ nombreId: nombreIdAmigo });
    if (!amigo) {
      res.status(404).send('No se ha encontrado el amigo');
      console.error("No se ha encontrado el amigo");
      return;
    }
    // Verificar si ya se ha enviado una solicitud de amistad
    if (amigo.listaSolicitudes.includes(nombreId)) {
      res.json({ exito: false, mensaje: "Ya se ha enviado una solicitud de amistad a este usuario"});
      console.error("Ya se ha enviado una solicitud de amistad a este usuario");
      return;
    }
    // Verificar si el otro usuario ya ha enviado una solicitud de amistad
    if (perfil.listaSolicitudes.includes(nombreIdAmigo)) {
      res.json({ exito: false, mensaje: "Ya se ha recibido una solicitud de amistad de este usuario"});
      console.error("Ya se ha recibido una solicitud de amistad de este usuario");
      return;
    }
    // Verificar si ya son amigos
    if (perfil.listaAmigos.includes(nombreIdAmigo) || amigo.listaAmigos.includes(nombreId)) {
      res.json({ exito: false, mensaje: "El usuario ya está en la lista de amigos"});
      console.error("El usuario ya está en la lista de amigos");
      return;
    }
    // Enviar solicitud de amistad
    amigo.listaSolicitudes.push(nombreId);
    // Guardar el perfil modificado en la base de datos
    const perfilModificado = await amigo.save();
    // Verificar si el perfil existe y enviar la respuesta al cliente
    if (perfilModificado) {
      res.json({ exito: true, mensaje: "Solicitud de amistad enviada con éxito"});
      console.log("Solicitud de amistad enviada con éxito");
    } else {
      res.status(404).send('No se ha podido enviar la solicitud de amistad');
      console.error("No se ha podido enviar la solicitud de amistad");
    }
  }
  catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al enviar solicitud de amistad", error);
  }
}

/**
 * @memberof module:perfil
 * @function obtenerSolicitudesAmistad
 * @description Obtiene la lista de solicitudes de amistad de un perfil identificado por _id o nombreId.
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {string} req.body.nombreId - El perfil debe existir en la base de datos.
 * @param {String[]} res - El objeto de respuesta HTTP, formado por la lista de solicitudes (nombreId).
 * @example
 * perfil = { nombreId: 'usuario1'};
 * const req = { body: perfil };
 * const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
 * await obtenerSolicitudesAmistad(req, res);
 */
exports.obtenerSolicitudesAmistad = async (req, res) => {
  try {
    // Extraer los parámetros del cuerpo de la solicitud
    const { nombreId, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera nombreId');
      console.error("Sobran parámetros, se espera nombreId");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!nombreId) {
      res.status(400).send('Falta el nombreId en la solicitud');
      console.error("Falta el nombreId en la solicitud");
      return;
    }
    // Buscar el perfil en la base de datos
    const filtro = { nombreId: nombreId };
    const perfil = await Perfil.findOne(filtro);
    if (!perfil) {
      res.status(404).send('No se ha encontrado el perfil');
      console.error("No se ha encontrado el perfil");
      return;
    }
    // Verificar si el perfil existe y enviar la respuesta al cliente
    let listaSolicitudes = perfil.listaSolicitudes;
    listaSolicitudes._id = undefined;
    res.json(listaSolicitudes);
    console.log("Solicitudes de amistad obtenidas con éxito");
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al obtener solicitudes de amistad", error);
  }
}

/**
 * @memberof module:perfil
 * @function eliminarSolicitudAmistad
 * @description Elimina una solicitud de amistad de un perfil identificado por nombreIdAmigo en el perfil identificado por _id o nombreId.
 * Elimina el nombreIdAmigo de la lista de solicitudes del perfil.
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {string} req.body.nombreId - El perfil debe existir en la base de datos.
 * @param {string} req.body.nombreIdAmigo - El amigo debe existir en la base de datos.
 * @param {String[]} res - El objeto de respuesta HTTP, formado por la lista de solicitudes (nombreId) actualizada.
 * @example
 * perfil = { nombreId: 'usuario1', nombreIdAmigo: 'usuario2'};
 * const req = { body: perfil };
 * const res = { json: () => {}, status: () => ({ send: () => {} }) }; // No hace nada
 * await eliminarSolicitudAmistad(req, res);
 */
exports.eliminarSolicitudAmistad = async (req, res) => {
  try {
    // Extraer los parámetros del cuerpo de la solicitud
    const { nombreId, nombreIdAmigo, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera o nombreId y nombreIdAmigo');
      console.error("Sobran parámetros, se espera nombreId y nombreIdAmigo");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!nombreId || !nombreIdAmigo) {
      res.status(400).send('Falta el nombreId o el nombreIdAmigo en la solicitud');
      console.error("Falta el nombreId o el nombreIdAmigo en la solicitud");
      return;
    }
    // Buscar el perfil en la base de datos
    const filtro = { nombreId: nombreId };

    const perfil = await Perfil.findOne(filtro);
    if (!perfil) {
      res.status(404).send('No se ha encontrado el perfil a modificar');
      console.error("No se ha encontrado el perfil a modificar");
      return;
    }
    // Buscar el amigo en la base de datos
    const amigo = await Perfil.findOne({ nombreId: nombreIdAmigo });
    if (!amigo) {
      res.status(404).send('No se ha encontrado el amigo a eliminar');
      console.error("No se ha encontrado el amigo a eliminar");
      return;
    }
    // Verificar si el amigo está en la lista de solicitudes
    if (!perfil.listaSolicitudes.includes(nombreIdAmigo)) {
      res.status(404).send('No se ha encontrado la solicitud de amistad');
      console.error("No se ha encontrado la solicitud de amistad");
      return;
    }
    // Eliminar el amigo de la lista de solicitudes
    perfil.listaSolicitudes.pull(nombreIdAmigo);
    // Guardar el perfil modificado en la base de datos
    const perfilModificado = await perfil.save();
    // Verificar si el perfil existe y enviar la respuesta al cliente
    if (perfilModificado) {
      res.json(perfilModificado);
      let listaSolicitudes = perfilModificado.listaSolicitudes;
      listaSolicitudes._id = undefined;
      console.log("Solicitud de amistad eliminada con éxito");
    } else {
      res.status(404).send('No se ha podido eliminar la solicitud de amistad');
      console.error("No se ha podido eliminar la solicitud de amistad");
    }
  }
  catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Error al eliminar solicitud de amistad", error);
  }
}
