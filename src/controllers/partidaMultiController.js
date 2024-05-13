const Partida = require('../models/partidaModel');
const Perfil = require('../models/perfilModel');
const Sala = require('../models/salaModel');
const Coordenada = require('../data/coordenada');
const Tablero = require('../data/tablero');
const {barcosDisponibles} = require('../data/barco');
const biomasDisponibles = require('../data/biomas');
const {actualizarEstadisticas, actualizarPuntosExperiencia} = require('./perfilController');
const PartidaController = require('./partidaController');
const socketIo = require('socket.io');
const { getIO, eventosSocket } = require('../socketManager');
const tableroDim = Coordenada.i.max;  // Dimensiones del tablero
/**
 * @module partidaMulti
 * @description Gestión de partidas multijugador
 * @requires module:perfil
 * @requires module:data~barcosDisponibles
 * @requires module:data~climasDisponibles
 * @requires module:data~biomasDisponibles
 * @requires module:data~Coordenada
 * @requires module:data~Tablero
 * @requires module:controllers~perfilController
 * @requires module:controllers~partidaController
 * @requires socketIo
 * 
 */

// ------------------------------------------ //
// ----------- FUNCIONES INTERNAS ----------- //
// ------------------------------------------ //



// -------------------------------------------- //
// -------------- PARTIDA BASICA -------------- //
// -------------------------------------------- //


/**
 * @function crearPartida
 * @description Crea una partida multijugador con dos jugadores y un bioma, la guarda en la base de datos y devuelve la partida creada
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {String} req.body.nombreId1 - El nombreId del jugador 1
 * @param {String} req.body.nombreId2 - El nombreId del jugador 2
 * @param {BiomasDisponibles} req.body.bioma - El bioma de la partida
 * @param {Boolean} [req.body.amistosa] - Indica si la partida es amistosa, por defecto es false
 * @param {Object} res - El objeto despuesta HTTP con el codigo de la partida creada TODO: CAMBIAR ESTO EN BACKEND
 * @param {Number} res.codigo - El código de la partida
 * @example 
 * peticion = { body: { nombreId1: 'jugador1', nombreId2: 'jugador2', bioma: 'Mediterraneo', amistosa: true }}
 * respuesta = { json: () => {} }
 * await crearPartida(peticion, respuesta)
 */
exports.crearPartida = async (req, res) => {
  await PartidaController.crearPartida(req, res);
};

/**
 * @function crearSala
 * @description Crea una sala de espera multijugador con un jugadores y un bioma, la guarda en la base de datos y devuelve la partida creada
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {String} req.body.nombreId - El nombreId del jugador 1
 * @param {BiomasDisponibles} req.body.bioma - El bioma de la partida
 * @param {Boolean} [req.body.amistosa] - Indica si la partida es amistosa, por defecto es false
 * @param {Object} res - El objeto despuesta HTTP con el codigo de la partida creada TODO: CAMBIAR ESTO EN BACKEND
 * @param {Number} res.codigo - El código de la partida
 */
exports.crearSala = async (req, res) => {
  try {
    const { nombreId, bioma = 'Mediterraneo', amistosa = true, ...extraParam } = req.body;
    // llamar a la funcion de partidaController para generar el codigo
    const codigo = await PartidaController.generarCodigo();
    // Crear la sala en la base de datos
    const sala = new Sala({ 
      codigo, 
      nombreId1: nombreId, 
      nombreId2: undefined,
      bioma,
      amistosa: amistosa,
    });
    const salaGuardada = await sala.save();
    // Verificar si los sockets están disponibles
    let socket = getIO();
    if (salaGuardada && !socket) {
      res.status(500).send('Los sockets no están disponibles');
      console.error('Los sockets no están disponibles');
      return;
    }
    res.json({ codigo: salaGuardada.codigo });
    console.log('Sala creada con éxito');
  } catch (error) {
    res.status(500).send('Hubo un error creando la sala'+ error.message);
    console.error('Hubo un error creando la sala', error);
  }
};


/**
 * @function buscarSala
 * @description Permite a un jugador unirse a una sala multijugador ya creada y empezar la partida
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {String} req.body.nombreId - El nombreId del jugador
 * @param {Object} res - El objeto de respuesta HTTP con el codigo de la partida creada
 * @param {Number} res.codigo - El código de la partida  (-1 si no se encuentra sala)
 */
exports.buscarSala = async (req, res) => {
  // Esta funcion no llama a ninguna funcion de partidaController
  try {
    const { nombreId, ...extraParam } = req.body;
    // Buscar sala en base de datos
    if (!nombreId) {
      res.status(400).send('Falta el nombreId');
      return;
    }
    if (!extraParam){
      res.status(400).send('Faltan parametros');
      return;
    }
    // Busca sala cualquiera en la base de datos que no tenga el nombreId2
    const sala = await Sala.findOne({ nombreId2: undefined });
    if (sala) {
      // Si se encuentra la sala, se actualiza el nombreId2
      sala.nombreId2 = nombreId;
      await sala.save();
      // Se llama a crear partida con los datos de la sala
      await PartidaController.crearPartida({ body: { codigo: sala.codigo, nombreId1: sala.nombreId1, nombreId2: sala.nombreId2, bioma: sala.bioma, amistosa: sala.amistosa } }, res);
      const io = getIO();
      io.to('/partida' + sala.codigo).emit(eventosSocket.partidaEncontrada, sala.codigo);
      console.log('Partida encontrada en backend:', sala.codigo);
    } else {
      res.json({ codigo: -1 });
    }
  }
  catch (error) {
    console.error('Hubo un error buscando la sala', error);
  }
};

/**
 * @function abandonarPartida
 * @description Modifica el valor de partida actual del usuario en base de datos a -1 y envia respuesta de finalizacion de partida
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {Number} req.body.codigo - El codigo de la partida
 * @param {String} req.body.nombreId - El nombreId del jugador
 * @param {Object} res - El tablero de barcos y los disparos realizados del jugador
 * @param {Tablero} res.finPartida - Booleano que es positivo si se ha terminado la partida
 */
exports.abandonarPartida = async (req, res) => {
  // Llamar a la funcion de partidaController para abandonar la partida
  const { codigo, nombreId, ...extraParam } = req.body;
  // Verificar si hay algún parámetro extra
  await PartidaController.abandonarPartida(req, res);
  const io = getIO();
  io.to('/partida' + codigo).emit(eventosSocket.abandono, codigo, nombreId);
  console.log('Partida encontrada en backend:', codigo);
};

/**
 * @function mostrarMiTablero
 * @description Devuelve el tablero de barcos y los disparos realizados del jugador en la partida
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {Number} req.body.codigo - El codigo de la partida
 * @param {String} req.body.nombreId - El nombreId del jugador
 * @param {Object} res - El tablero de barcos y los disparos realizados del jugador
 * @param {Tablero} res.tableroBarcos - El tablero de barcos del jugador y su estado actual
 * @param {Coordenada[]} res.disparosEnemigos - Los disparos realizados por el jugador enemigo
 * @param {Number} res.usosHabEnemigas - Los usos restantes de la habilidad del enemigo
 * @example
 * peticion = { body: { codigo: '1234567890', nombreId: 'jugador1' } }
 * respuesta = { json: () => {} }
 * await mostrarMiTablero(peticion, respuesta)
 */
exports.mostrarMiTablero = async (req, res) => {
  await PartidaController.mostrarMiTablero(req, res);
};

/**
 * @function mostrarTableroEnemigo
 * @description Devuelve el tablero de barcos del jugador enemigo en la partida
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {String} req.body.codigo - El codigo de la partida
 * @param {String} req.body.nombreId - El nombreId del jugador
 * @param {Object} res - El objeto de respuesta HTTP
 * @param {Coordenada[]} res.misDisparos - Los disparos realizados por mi
 * @param {Coordenada[]} res.barcosHundidos - Los barcos del enemigo hundidos por mi
 * @param {Number} res.misUsosHab - Los usos restantes de la habilidad del jugador
 * @example
 * peticion = { body: { codigo: '1234567890', nombreId: 'jugador1' } }
 * respuesta = { json: () => {} }
 * await mostrarTableroEnemigo(peticion, respuesta)
 */
exports.mostrarTableroEnemigo = async (req, res) => {
  await PartidaController.mostrarTableroEnemigo(req, res);
};

/**
 * @function mostrarTableros
 * @description Devuelve los tableros y disparos realizados de ambos jugadores en la partida
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {String} req.body.codigo - El codigo de la partida
 * @param {String} req.body.nombreId - El nombreId del jugador
 * @param {Object} res - El objeto de respuesta HTTP
 * @param {Tablero} res.tableroBarcos - El tablero de barcos del jugador y su estado actual
 * @param {Coordenada[]} res.disparosEnemigos - Los disparos realizados por el jugador enemigo
 * @param {Coordenada[]} res.misDisparos - Los disparos realizados por mi
 * @param {Coordenada[]} res.barcosHundidos - Los barcos del enemigo hundidos por mi
 * @param {Number} res.misUsosHab - Los usos restantes de la habilidad del jugador
 * @param {Number} res.usosHabEnemigas - Los usos restantes de la habilidad del enemigo
 * @example
 * peticion = { body: { codigo: '1234567890', nombreId: 'jugador1' } }
 * respuesta = { json: () => {} }
 * await mostrarTableros(peticion, respuesta)
 */
exports.mostrarTableros = async (req, res) => {
  await PartidaController.mostrarTableros(req, res);
};

/**
 * @typedef {Object} TurnoIA
 * @property {Object} disparoRealizado - El disparo realizado por la IA
 * @property {Object} [barcoCoordenadas] - Las coordenadas del barco disparado por la IA, si se ha hundido
 * @property {String} eventoOcurrido - El evento ocurrido en la partida
 * @property {Boolean} finPartida - Indica si la partida ha terminado
 * @property {String} clima - El clima de la partida
 */

/**
 * @function realizarDisparo
 * @description Realiza un disparo en la coordenada (i, j) del enemigo y actualiza el estado de la partida
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {String} req.body.codigo - El codigo de la partida
 * @param {String} req.body.nombreId - El nombreId del jugador
 * @param {Number} req.body.i - La coordenada i del disparo
 * @param {Number} req.body.j - La coordenada j del disparo
 * @param {Object} res - El objeto de respuesta HTTP
 * @param {Coordenada} res.disparoRealizado - El disparo realizado con sus coordenadas y estado
 * @param {Barco} [res.barcoCoordenadas] - Las coordenadas del barco disparado, si se ha hundido
 * @param {String} res.eventoOcurrido - true si ha ocurrido el evento del clima
 * @param {Boolean} res.finPartida - Indica si la partida ha terminado
 * @param {String} res.clima - El clima de la partida
 * @param {Coordenada} [res.minaDisparada] - La mina disparada, si se ha hundido
 * @param {Coordenada[]} [res.disparosRespuestaMina] - Los disparos realizados por el enemigo en respuesta a una mina
 * @param {Barco[]} [res.barcosHundidosRespuestaMina] - Los barcos propios hundidos por respuesta a una mina
 * @param {TurnoIA[]} [res.turnosIA] - Los turnos de la IA, si la partida es contra la IA
 * @example
 * peticion = { body: { codigo: '1234567890', nombreId: 'jugador1', i: 1, j: 1 } }
 * respuesta = { json: () => {} }
 * await realizarDisparo(peticion, respuesta)
 */
exports.realizarDisparo = async (req, res) => {
  const respuesta = await PartidaController.realizarDisparo(req, res);
  const io = getIO();
  io.to('/partida' + req.body.codigo).emit(eventosSocket.resultadoTurno, "disparo", req.body.nombreId, respuesta.disparoRealizado, respuesta.barcoCoordenadas, respuesta.finPartida, respuesta.clima,
   respuesta.eventoOcurrido, 0, respuesta.minaDisparada, respuesta.disparosRespuestaMina, respuesta.barcosHundidosRespuestaMina);
  console.log('Resultado turno tras disparo recibido en backend:', req.body.nombreId, respuesta.disparoRealizado, respuesta.barcoCoordenadas, respuesta.finPartida,
   respuesta.clima, respuesta.eventoOcurrido, respuesta.minaDisparada, respuesta.disparosRespuestaMina, respuesta.barcosHundidosRespuestaMina);
};

/**
 * @description Realiza un disparo de la habilidad de ráfaga de misiles en la coordenada (i, j) del enemigo y actualiza el estado de la partida
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {String} req.body.codigo - El codigo de la partida
 * @param {String} req.body.nombreId - El nombreId del jugador
 * @param {Number} req.body.i - La coordenada i del disparo
 * @param {Number} req.body.j - La coordenada j del disparo
 * @param {Number} req.body.misilesRafagaRestantes - Los misiles de rafaga restantes (3, 2 o 1)
 * @param {Object} res - El objeto de respuesta HTTP
 * @param {Coordenada} res.disparoRealizado - El disparo realizado con sus coordenadas y estado
 * @param {Barco} [res.barcoCoordenadas] - Las coordenadas del barco disparado, si se ha hundido
 * @param {String} res.eventoOcurrido - El evento ocurrido en la partida
 * @param {Boolean} res.finPartida - Indica si la partida ha terminado
 * @param {String} res.clima - El clima de la partida
 * @param {Boolean} res.ultimoMisilRafaga - Indica si es el último misil de la ráfaga
 * @param {Coordenada} [res.minaDisparada] - La mina disparada, si se ha hundido
 * @param {Coordenada[]} [res.disparosRespuestaMina] - Los disparos realizados por el enemigo en respuesta a una mina
 * @param {Barco[]} [res.barcosHundidosRespuestaMina] - Los barcos propios hundidos por respuesta a una mina
 * @param {Number} res.usosHab - Los usos restantes de la habilidad del jugador
 * @param {TurnoIA[]} [res.turnosIA] - Los turnos de la IA, si la partida es contra la IA
 */
exports.realizarDisparoMisilRafaga = async (req, res) => {
  const respuesta = await PartidaController.realizarDisparoMisilRafaga(req, res);
  const io = getIO();
  io.to('/partida' + req.body.codigo).emit(eventosSocket.resultadoTurno, "Rafaga", req.body.nombreId, respuesta.disparoRealizado, respuesta.barcoCoordenadas, respuesta.finPartida, respuesta.clima, respuesta.eventoOcurrido, 
    respuesta.usosHab, respuesta.minaDisparada, respuesta.disparosRespuestaMina, respuesta.barcosHundidosRespuestaMina, respuesta.ultimoMisilRafaga,);
  console.log('Resultado turno tras misil rafaga recibido en backend:', req.body.nombreId, respuesta.disparoRealizado, respuesta.barcoCoordenadas, respuesta.finPartida, respuesta.clima, respuesta.eventoOcurrido,
    respuesta.usosHab, respuesta.minaDisparada, respuesta.disparosRespuestaMina, respuesta.barcosHundidosRespuestaMina, respuesta.ultimoMisilRafaga);
};

/**
 * @function realizarDisparoTorpedoRecargado
 * @description Realiza un disparo de torpedo recargado (o lo recarga) en la coordenada (i, j) y sus vecinas del enemigo y actualiza el estado de la partida
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {String} req.body.codigo - El codigo de la partida
 * @param {String} req.body.nombreId - El nombreId del jugador
 * @param {Number} [req.body.i] - La coordenada i del disparo, necesaria si turnoRecarga es false
 * @param {Number} [req.body.j] - La coordenada j del disparo, necesaria si turnoRecarga es false
 * @param {Boolean} [req.body.turnoRecarga = false] - Indica si es el turno de recarga
 * @param {Object} res - El objeto de respuesta HTTP
 * @param {Coordenada[]} res.disparosRealizados - Los 9 disparos realizados con sus coordenadas y estado
 * @param {Boolean} [res.algunoTocado] - Indica si algun disparo del torpedo ha tocado (o hundido) un barco
 * @param {Barco[]} [res.barcoCoordenadas] - Las coordenadas de los barcos hundidos, si los hay
 * @param {String} res.eventoOcurrido - El evento ocurrido en la partida
 * @param {Boolean} res.finPartida - Indica si la partida ha terminado
 * @param {String} res.clima - El clima de la partida
 * @param {Number} res.usosHab - Los usos restantes de la habilidad del jugador
 * @param {Coordenada[]} res.minasDisparadas - Las minas disparadas por el jugador
 * @param {Coordenada[]} res.disparosRespuestasMinas - Los disparos realizados por el enemigo en respuesta a las minas
 * @param {Barco[]} res.barcosHundidosRespuestasMinas - Los barcos propios hundidos por respuesta a las minas
 * @param {TurnoIA[]} [res.turnosIA] - Los turnos de la IA, si la partida es contra la IA
 */
exports.realizarDisparoTorpedoRecargado = async (req, res) => {
  const respuesta = await PartidaController.realizarDisparoTorpedoRecargado(req, res);
  const io = getIO();
  io.to('/partida' + req.body.codigo).emit(eventosSocket.resultadoTurno, "Recargado", req.body.nombreId, respuesta.disparosRealizados, respuesta.barcoCoordenadas,
     respuesta.finPartida, respuesta.clima, respuesta.eventoOcurrido, respuesta.usosHab, respuesta.minasDisparadas, respuesta.disparosRespuestasMinas, respuesta.barcosHundidosRespuestasMinas, req.body.turnoRecarga);
  console.log('Resultado turno tras torpedo recargado recibido en backend:', req.body.nombreId, respuesta.disparosRealizados, respuesta.barcoCoordenadas, respuesta.finPartida,
     respuesta.clima, respuesta.eventoOcurrido, respuesta.usosHab, respuesta.minasDisparadas, respuesta.disparosRespuestasMinas, respuesta.barcosHundidosRespuestasMinas, req.body.turnoRecarga);
};

/**
 * @function realizarDisparoMisilTeledirigido
 * @description Realiza un disparo teledirigido a una casilla al azar ocupada por un barco enemigo y actualiza el estado de la partida
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {String} req.body.codigo - El codigo de la partida
 * @param {String} req.body.nombreId - El nombreId del jugador
 * @param {Object} res - El objeto de respuesta HTTP
 * @param {Coordenada} res.disparoRealizado - El disparo realizado con sus coordenadas y estado
 * @param {Barco} [res.barcoCoordenadas] - Las coordenadas del barco disparado, si se ha hundido
 * @param {String} res.eventoOcurrido - El evento ocurrido en la partida
 * @param {Boolean} res.finPartida - Indica si la partida ha terminado
 * @param {String} res.clima - El clima de la partida
 * @param {Number} res.usosHab - Los usos restantes de la habilidad del jugador
 * @param {Coordenada} [res.minaDisparada] - La mina disparada, si se ha hundido
 * @param {Coordenada[]} [res.disparosRespuestaMina] - Los disparos realizados por el enemigo en respuesta a una mina
 * @param {Barco[]} [res.barcosHundidosRespuestaMina] - Los barcos propios hundidos por respuesta a una mina
 * @param {TurnoIA[]} [res.turnosIA] - Los turnos de la IA, si la partida es contra la IA
 */
exports.realizarDisparoMisilTeledirigido = async (req, res) => {
  const respuesta = await PartidaController.realizarDisparoMisilTeledirigido(req, res);
  const io = getIO();
  io.to('/partida' + req.body.codigo).emit(eventosSocket.resultadoTurno, "Teledirigido", req.body.nombreId, respuesta.disparoRealizado, respuesta.barcoCoordenadas,
             respuesta.finPartida, respuesta.clima, respuesta.eventoOcurrido, respuesta.usosHab, respuesta.minaDisparada, respuesta.disparosRespuestaMina, respuesta.barcosHundidosRespuestaMina);
  console.log('Resultado turno tras teledirigido recibido en backend:', req.body.nombreId, respuesta.disparoRealizado, respuesta.barcoCoordenadas, respuesta.finPartida, respuesta.clima,
              respuesta.eventoOcurrido, respuesta.usosHab, respuesta.minaDisparada, respuesta.disparosRespuestaMina, respuesta.barcosHundidosRespuestaMina);
}

/**
 * @function usarSonar
 * @description Usa la habilidad del sónar para revelar lo que hay en la casilla (i, j) y sus vecinas del enemigo y actualiza el estado de la partida
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {String} req.body.codigo - El codigo de la partida
 * @param {String} req.body.nombreId - El nombreId del jugador
 * @param {Number} req.body.i - La coordenada i de la mina
 * @param {Number} req.body.j - La coordenada j de la mina
 * @param {Object} res - El objeto de respuesta HTTP
 * @param {String[][]} res.sonar - El resultado del sónar en la casilla (i, j) y sus vecinas: 'Barco', 'Mina' o 'Agua' (o null si fuera de rango)
 * @param {String} res.eventoOcurrido - El evento ocurrido en la partida
 * @param {Boolean} res.finPartida - Indica si la partida ha terminado
 * @param {String} res.clima - El clima de la partida
 * @param {Number} res.usosHab - Los usos restantes de la habilidad del jugador
 * @param {TurnoIA[]} [res.turnosIA] - Los turnos de la IA, si la partida es contra la IA
 */
exports.usarSonar = async (req, res) => {
  const respuesta = await PartidaController.usarSonar(req, res);
  const io = getIO();
  io.to('/partida' + req.body.codigo).emit(eventosSocket.resultadoTurno, "Sonar", req.body.nombreId, respuesta.finPartida, respuesta.clima);
  console.log('Resultado turno tras sonar recibido en backend:', req.body.nombreId, respuesta.sonar, respuesta.finPartida, respuesta.clima);
}

/**
 * @function colocarMina
 * @description Coloca una mina en la coordenada (i, j) del tablero del jugador (si no está ocupada) y actualiza el estado de la partida
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {String} req.body.codigo - El codigo de la partida
 * @param {String} req.body.nombreId - El nombreId del jugador
 * @param {Number} req.body.i - La coordenada i de la mina
 * @param {Number} req.body.j - La coordenada j de la mina
 * @param {Object} res - El objeto de respuesta HTTP
 * @param {Coordenada} res.minaColocada - Las coordenadas de la mina colocada
 * @param {String} res.eventoOcurrido - El evento ocurrido en la partida
 * @param {Boolean} res.finPartida - Indica si la partida ha terminado
 * @param {String} res.clima - El clima de la partida
 * @param {Number} res.usosHab - Los usos restantes de la habilidad del jugador
 * @param {TurnoIA[]} [res.turnosIA] - Los turnos de la IA, si la partida es contra la IA
 */
exports.colocarMina = async (req, res) => {
  const respuesta = await PartidaController.colocarMina(req, res);
  const io = getIO();
  io.to('/partida' + req.body.codigo).emit(eventosSocket.resultadoTurno, "Mina", req.body.nombreId, respuesta.finPartida, respuesta.clima);
  console.log('Resultado turno tras mina recibido en backend:', req.body.nombreId, respuesta.minaColocada, respuesta.finPartida, respuesta.clima);
}


// Funcion para obtener el chat de una partida
/**
 * @function obtenerChat
 * @description Devuelve el chat de la partida
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {String} req.body.nombreId - El nombreId del jugador, para comprobar si está en la partida
 * @param {String} req.body.codigo - El codigo de la partida
 * @param {Object} res - El objeto de respuesta HTTP
 * @returns {Object[]} El chat de la partida
 * @example
 * peticion = { body: { codigo: '1234567890', nombreId: 'jugador1' } }
 * respuesta = { json: () => {} }
 * await obtenerChat(peticion, respuesta)
 */
exports.obtenerChat = async (req, res) => {
  await PartidaController.obtenerChat(req, res);
};

// Funcion para enviar un mensaje al chat de una partida
/**
 * @function enviarMensaje
 * @description Envia un mensaje al chat de la partida
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {String} req.body.codigo - El codigo de la partida
 * @param {String} req.body.nombreId - El nombreId del autor del mensaje
 * @param {String} req.body.mensaje - El mensaje a enviar
 * @param {Object} res - El objeto de respuesta HTTP
 * @returns {Partida} La partida modificada
 * @example
 * peticion = { body: { codigo: '1234567890', nombreId: 'jugador1', mensaje: 'Hola' } }
 * respuesta = { json: () => {} }
 * await enviarMensaje(peticion, respuesta)
 */
exports.enviarMensaje = async (req, res) => {
  await PartidaController.enviarMensaje(req, res);
  io.to('/partida' + req.body.codigo).emit(eventosSocket.chat, req.body.codigo, req.body.mensaje);
};

