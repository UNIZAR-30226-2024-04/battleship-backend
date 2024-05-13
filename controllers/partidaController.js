const Partida = require('../models/partidaModel');
const Perfil = require('../models/perfilModel');
const Coordenada = require('../data/coordenada');
const Tablero = require('../data/tablero');
const {barcosDisponibles} = require('../data/barco');
const biomasDisponibles = require('../data/biomas');
const climasDisponibles = require('../data/climas');
const {actualizarEstadisticas, actualizarPuntosExperiencia} = require('./perfilController');
const tableroDim = Coordenada.i.max;  // Dimensiones del tablero
/**
 * @module partida
 * @description Gestión de partidas
 * @requires module:perfil
 * @requires module:data~barcosDisponibles
 * @requires module:data~climasDisponibles
 * @requires module:data~biomasDisponibles
 * @requires module:data~Coordenada
 * @requires module:data~Tablero
 * 
 */

// ------------------------------------------ //
// ----------- FUNCIONES INTERNAS ----------- //
// ------------------------------------------ //

// Función para generar un id de partida único
function generarCodigo() {
  const timestamp = new Date().getTime(); // Obtiene el timestamp actual
  const hash = require('crypto').createHash('sha1'); // Selecciona el algoritmo hash
  hash.update(timestamp.toString()); // Actualiza el hash con el timestamp convertido a cadena
  const codigo = hash.digest('hex'); // Obtiene el hash en formato hexadecimal
  return parseInt(codigo.substring(0, 10), 16); // Convierte los primeros 10 caracteres del hash en un número
}

exports.generarCodigo = generarCodigo;

// Función para verificar si el barco que irá en la posición barcoId colisiona con otros barcos
function barcoColisionaPrevios(tablero, barcoCoordenadas, barcoId) {
  if (tablero.length === 0) return false;
  for (let i = 0; i < barcoId; i++) { // Recorrer los otros barcos
    for (const coordenada of tablero[i].coordenadas) {
      for (const nuevaCoordenada of barcoCoordenadas) {
        if (coordenada.i === nuevaCoordenada.i && coordenada.j === nuevaCoordenada.j) {
          return true; // Hay colisión
        }
      }
    }
  }
  return false; // No hay colisión
}

// Function generarTableroAleatorio
// Devuelve un tablero de barcos aleatorio
function generarTableroAleatorio() {
  let tablero = [];
  for (let barco of barcosDisponibles) {
    let barcoId = barcosDisponibles.indexOf(barco);
    let barcoLongitud = barcoId === 0 ? 2 : barcoId === 1 ? 3 :
      barcoId === 2 ? 3 : barcoId === 3 ? 4 : 5;
    while (true) {
      // Definir orientación y coordenadas iniciales
      let orientacion = Math.random() < 0.5;
      if (orientacion) { // Horizontal
        i = Math.floor(Math.random() * tableroDim) + 1;
        j = Math.floor(Math.random() * (tableroDim - barcoLongitud + 1)) + 1;
      } else { // Vertical
        i = Math.floor(Math.random() * (tableroDim - barcoLongitud + 1)) + 1;
        j = Math.floor(Math.random() * tableroDim) + 1;
      }
      // Completa las coordenadas del barco
      let coordenadas = [];
      for (let k = 0; k < barcoLongitud; k++) {
        if (orientacion) { // Horizontal
          coordenadas.push( { i, j: j + k, estado: 'Agua' });
        } else { // Vertical
          coordenadas.push( { i: i + k, j, estado: 'Agua' });
        }
      }
      // Comprueba si el barco colisiona con otros barcos
      if (!barcoColisionaPrevios(tablero, coordenadas, barcoId)) {
        tablero.push({ coordenadas: coordenadas, tipo: barco });
        break;
      }
    }
  }
  return tablero;
}

function generarDisparoAleatorio(disparosRealizados) {
  let i = Math.floor(Math.random() * tableroDim) + 1;
  let j = Math.floor(Math.random() * tableroDim) + 1;
  let disparoRepetido = disparosRealizados.find(disparo => disparo.i === i && disparo.j === j);
  while (disparoRepetido) {
    i = Math.floor(Math.random() * tableroDim) + 1;
    j = Math.floor(Math.random() * tableroDim) + 1;
    disparoRepetido = disparosRealizados.find(disparo => disparo.i === i && disparo.j === j);
  }
  return { i, j };
}

function calcularActualizacionELO(elo1, elo2, resultado) {
  const k = 64;
  const esperado1 = 1 / (1 + Math.pow(10, (elo2 - elo1) / 400));
  const esperado2 = 1 / (1 + Math.pow(10, (elo1 - elo2) / 400));
  let nuevosTrofeos1 = k * (resultado - esperado1);
  let nuevosTrofeos2 = k * (1 - resultado - esperado2);
  if (elo1 < 100 && nuevosTrofeos1 < 0) nuevosTrofeos1 -= nuevosTrofeos1 * 0.5;
  if (elo2 < 100 && nuevosTrofeos2 < 0) nuevosTrofeos2 -= nuevosTrofeos2 * 0.5;
  return [nuevosTrofeos1|0, nuevosTrofeos2|0];
}

function calcularEstadisticasPartida(partida, jugador) {
  let estadisticas = {
    nuevosBarcosHundidos: 0,
    nuevosBarcosPerdidos: 0,
    nuevosDisparosAcertados: 0,
    nuevosDisparosFallados: 0,
    nuevosPuntosExperiencia: 0
  };
  let tableroEnemigo = jugador === 1 ? partida.tableroBarcos2 : partida.tableroBarcos1;
  let disparosEnemigos = jugador === 1 ? partida.disparosRealizados2 : partida.disparosRealizados1;
  let barcosHundidos = tableroEnemigo.filter(barco => barco.coordenadas.every(coordenada => coordenada.estado === 'Hundido'));
  let barcosPerdidos = tableroEnemigo.filter(barco => barco.coordenadas.every(coordenada => coordenada.estado === 'Hundido' || coordenada.estado === 'Tocado'));
  let disparosAcertados = disparosEnemigos.filter(disparo => tableroEnemigo.some(barco => barco.coordenadas.some(coordenada => coordenada.i === disparo.i && coordenada.j === disparo.j)));
  let disparosFallados = disparosEnemigos.filter(disparo => !tableroEnemigo.some(barco => barco.coordenadas.some(coordenada => coordenada.i === disparo.i && coordenada.j === disparo.j)));
  estadisticas.nuevosBarcosHundidos = barcosHundidos.length;
  estadisticas.nuevosBarcosPerdidos = barcosPerdidos.length;
  estadisticas.nuevosDisparosAcertados = disparosAcertados.length;
  estadisticas.nuevosDisparosFallados = disparosFallados.length;

  // Calcular puntos de experiencia
  let puntosExperiencia = 0;
  puntosExperiencia += estadisticas.nuevosBarcosHundidos * 10;
  puntosExperiencia += estadisticas.nuevosDisparosAcertados * 1;
  puntosExperiencia += estadisticas.nuevosDisparosFallados * 0.25;
  estadisticas.nuevosPuntosExperiencia = puntosExperiencia;
  return estadisticas;
}
  
// -------------------------------------------- //
// -------------- PARTIDA BASICA -------------- //
// -------------------------------------------- //

/**
 * @function crearPartida
 * @description Crea una partida con dos jugadores y un bioma, la guarda en la base de datos y devuelve la partida creada
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {Number} [req.body.codigo] - El código de la partida, se generará automáticamente si no se proporciona
 * @param {String} req.body.nombreId1 - El nombreId del jugador 1
 * @param {String} req.body.nombreId2 - El nombreId del jugador 2
 * @param {BiomasDisponibles} req.body.bioma - El bioma de la partida
 * @param {Boolean} [req.body.amistosa = true] - Indica si la partida es amistosa, por defecto es false
 * @param {Object} res - El objeto despuesta HTTP con el codigo de la partida creada TODO: CAMBIAR ESTO EN BACKEND
 * @param {Number} res.codigo - El código de la partida
 * @example 
 * peticion = { body: { nombreId1: 'jugador1', nombreId2: 'jugador2', bioma: 'Mediterraneo', amistosa: true }}
 * respuesta = { json: () => {} }
 * await crearPartida(peticion, respuesta)
 */
exports.crearPartida = async (req, res) => {
  try {
    const { codigo, nombreId1, nombreId2, bioma = 'Mediterraneo', amistosa = false, torneo = false, ...extraParam } = req.body;
    let codigoFinal = codigo;
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera nombreId1, nombreId2 y bioma');
      console.error("Sobran parámetros, se espera nombreId1, nombreId2 y bioma");
      return;
    }
    // Verificar si falta el nombreId1 
    if (!nombreId1 ) {
      res.status(400).send('Falta el nombreId1 del jugador 1');
      console.error("Falta el nombreId1 del jugador 1");
      return;
    }
    // Verificar si el bioma elegido está en la lista de biomas disponibles
    if (!biomasDisponibles.includes(bioma)) {
      const biomasMensaje = biomasDisponibles.join(', '); // Convierte la lista de biomas en un string separado por comas
      res.status(400).send('El bioma debe ser alguno de:', biomasMensaje);
      console.error("El bioma debe ser alguno de:", biomasMensaje);
      return;
    }
    // Verificar que existen los perfiles
    const filtro1 = { nombreId: nombreId1 };
    let jugador1 = await Perfil.findOne(filtro1);
    if (!jugador1) {
      res.status(404).send('No se ha encontrado el jugador 1');
      console.error("No se ha encontrado el jugador 1");
      return;
    }
    let jugador2 = undefined;
    let filtro2 = {};
    if (nombreId2) {
      filtro2 = { nombreId: nombreId2 };
      jugador2 = await Perfil.findOne(filtro2);
      if (!jugador2) {
        res.status(404).send('No se ha encontrado el jugador 2');
        console.error("No se ha encontrado el jugador 2");
        return;
      }
      if (jugador1.nombreId === jugador2.nombreId) {
        res.status(400).send('Los jugadores deben ser diferentes');
        console.error("Los jugadores deben ser diferentes");
        return;
      }
      if (jugador2.codigoPartidaActual !== -1) {
        res.status(400).send('El jugador 2 ya está en una partida');
        console.error("El jugador 2 ya está en una partida");
        return;
      }
    }
    if (jugador1.codigoPartidaActual !== -1) {
      res.status(400).send('El jugador 1 ya está en una partida');
      console.error("El jugador 1 ya está en una partida");
      return;
    }
    // Comprobar que no es partida amisotosa torneo al mismo tiempo
    if (amistosa && torneo) {
      res.status(400).send('No se puede crear una partida amistosa y de torneo al mismo tiempo');
      console.error('No se puede crear una partida amistosa y de torneo al mismo tiempo');
      return;
    }
    // Obtenemos los tableros de barcos de los jugadores y generamos un código único
    const tableroBarcos1 = jugador1.tableroInicial;
    let tableroBarcos2;
    if (jugador2 === undefined) {
      tableroBarcos2 = generarTableroAleatorio();
    } else {
      tableroBarcos2 = jugador2.tableroInicial;
    }
    if(!codigo) codigoFinal = generarCodigo();
    // Actualizamos los códigos de partida actuales de los jugadores
    jugador1.codigoPartidaActual = codigoFinal;
    await Perfil.findOneAndUpdate(
      filtro1, // Filtrar
      jugador1, // Actualizar (jugador1 contiene los cambios)
      { new: true } // Para devolver el documento actualizado
    );
    if (jugador2 !== undefined) {
      jugador2.codigoPartidaActual = codigoFinal;
      await Perfil.findOneAndUpdate(
        filtro2, // Filtrar
        jugador2, // Actualizar (jugador2 contiene los cambios)
        { new: true } // Para devolver el documento actualizado
      );
    } else {
      // Si el jugador 2 es IA, no puede ser partida de torneo
      if(torneo) {
        res.status(400).send('No se puede crear una partida de torneo con un jugador IA');
        console.error('No se puede crear una partida de torneo con un jugador IA');
        return;
      }
      console.log('Jugador 2 es IA');
    }
    const nuevaPartida = new Partida({ 
      codigo: codigoFinal, 
      nombreId1, 
      nombreId2,
      tableroBarcos1,
      tableroBarcos2,
      bioma,
      clima: bioma == 'Bermudas' ? 'Tormenta' : 'Calma',
      amistosa: (jugador2 === undefined) ? true : amistosa,
      torneo: torneo
    });

    const partidaGuardada = await nuevaPartida.save(); // ESTA LINEA DA FALLO COJONES
    res.json({ codigo: partidaGuardada.codigo });
    console.log('Partida creada con éxito');
  } catch (error) {
    res.status(500).send('Hubo un error creando la partida'+ error.message);
    console.error('Hubo un error creando la partida', error);
  }
};

/**
 * @function abandonarPartida
 * @description Modifica el valor de partida actual del usuario en base de datos a -1 y envia respuesta de finalizacion de partida
 */
exports.abandonarPartida = async (req, res) => {
  try {
    const { codigo, nombreId, ...extraParam} = req.body;
    //
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera codigo y jugador');
      console.error("Sobran parámetros, se espera codigo y jugador");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!codigo || !nombreId) {
      res.status(400).send('Falta el codigo y/o jugador');
      console.error("Falta el codigo y/o jugador");
      return;
    }
    // Verificar que existe la partida
    const filtro = { codigo: codigo };
    const partidaActual = await Partida.findOne(filtro);
    if (partidaActual) {
      const jugador = await Perfil.findOne({ nombreId: partidaActual.nombreId1 });
      // Cambiamos el código de partida actual del jugador a -1
      jugador.codigoPartidaActual = -1;
      await Perfil.findOneAndUpdate(
        { nombreId: jugador.nombreId }, // Filtrar
        jugador, // Actualizar (jugador contiene los cambios)
        { new: true } // Para devolver el documento actualizado
      );      
      // Si hay un segundo jugador, también lo cambiamos
      if (partidaActual.nombreId2) {
        const jugador2 = await Perfil.findOne({ nombreId: partidaActual.nombreId2 });
        jugador2.codigoPartidaActual = -1;
        await Perfil.findOneAndUpdate(
          { nombreId: jugador2.nombreId }, // Filtrar
          jugador2, // Actualizar (jugador contiene los cambios)
          { new: true } // Para devolver el documento actualizado
        );
      }
      // Cambiar el ganador de la partida
      partidaActual.ganador = jugador.nombreId === nombreId ? partidaActual.nombreId2 : partidaActual.nombreId1;
      await Partida.findOneAndUpdate(
        filtro, // Filtrar
        partidaActual, // Actualizar (partidaActual contiene los cambios)
        { new: true } // Para devolver el documento actualizado
      );
      res.json({ mensaje: 'Partida abandonada con éxito' });
      
    } else {
      res.status(404).send('Partida no encontrada');
      console.error('Partida no encontrada');
      return;
    }
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error('Hubo un error');
    return;
  }
};

/**
 * @function mostrarMiTablero
 * @description Devuelve el tablero de barcos, las minas y los disparos realizados del jugador en la partida
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {Number} req.body.codigo - El codigo de la partida
 * @param {String} req.body.nombreId - El nombreId del jugador
 * @param {Object} res - El tablero de barcos y los disparos realizados del jugador
 * @param {Tablero} res.tableroBarcos - El tablero de barcos del jugador y su estado actual
 * @param {Coordenada[]} res.minas - Las minas colocadas por el jugador
 * @param {Coordenada[]} res.disparosEnemigos - Los disparos realizados por el jugador enemigo
 * @param {Number} res.contadorTurno - El contador de turnos de la partida
 * @example
 * peticion = { body: { codigo: '1234567890', nombreId: 'jugador1' } }
 * respuesta = { json: () => {} }
 * await mostrarMiTablero(peticion, respuesta)
 */
exports.mostrarMiTablero = async (req, res) => {
  try {
    const { codigo, nombreId, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera codigo y jugador');
      console.error("Sobran parámetros, se espera codigo y jugador");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!codigo || !nombreId) {
      res.status(400).send('Falta el codigo y/o jugador');
      console.error("Falta el codigo y/o jugador");
      return;
    }
    // Verificar que existe la partida
    const filtro = { codigo: codigo };
    const partidaActual = await Partida.findOne(filtro);
    if (partidaActual) {
      const jugador1 = await Perfil.findOne({ nombreId: partidaActual.nombreId1 });
      let jugador2 = { nombreId: "IA" };
      if (partidaActual.nombreId2) {
        jugador2 = await Perfil.findOne({ nombreId: partidaActual.nombreId2 });
      }
      // Comprobamos que el jugador está en la partida
      var jugador = 0;
      if (jugador1.nombreId === nombreId) {
        jugador = 1;
      } else if (jugador2.nombreId === nombreId) {
        jugador = 2;
      } else {
        res.status(404).send('El jugador no está en la partida');
        console.error('El jugador no está en la partida');
        return;
      }

      let tableroBarcos = jugador === 1 ? partidaActual.tableroBarcos1 : partidaActual.tableroBarcos2;
      for (let barco of tableroBarcos) {
        barco._id = undefined;
        for (let coordenada of barco.coordenadas) {
          coordenada._id = undefined;
        }
      }

      let disparosEnemigos = jugador === 1 ? partidaActual.disparosRealizados2 : partidaActual.disparosRealizados1;
      for (let disparo of disparosEnemigos) {
        disparo._id = undefined;
      }

      let minas = jugador === 1 ? partidaActual.minas1 : partidaActual.minas2;
      for (let mina of minas) {
        mina._id = undefined;
      }

      let contadorTurno = partidaActual.contadorTurno;

      const tableroDisparos = {
        tableroBarcos: tableroBarcos,
        minas: minas,
        disparosEnemigos: disparosEnemigos,
        contadorTurno: contadorTurno
      };
      res.json(tableroDisparos);
      console.log('Mi tablero obtenido con éxito');
    } else {
      res.status(404).send('Partida no encontrada');
      console.error('Partida no encontrada');
      return;
    }
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error('Hubo un error');
    return;
  }
};

/**
 * @function mostrarTableroEnemigo
 * @description Devuelve el tablero de barcos hundidos del jugador enemigo en la partida, las minas explotadas y sus disparos recibidos
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {String} req.body.codigo - El codigo de la partida
 * @param {String} req.body.nombreId - El nombreId del jugador
 * @param {Object} res - El objeto de respuesta HTTP
 * @param {Coordenada[]} res.misDisparos - Los disparos realizados por mi
 * @param {Coordenada[]} res.barcosHundidos - Los barcos del enemigo hundidos por mi
 * @param {Coordenada[]} res.minasExplotadas - Las minas explotadas por mi
 * @param {Number} res.contadorTurno - El contador de turnos de la partida
 * @param {String} res.tipoPartida - El tipo de partida
 * @example
 * peticion = { body: { codigo: '1234567890', nombreId: 'jugador1' } }
 * respuesta = { json: () => {} }
 * await mostrarTableroEnemigo(peticion, respuesta)
 */
exports.mostrarTableroEnemigo = async (req, res) => {
  try {
    const { codigo, nombreId, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera codigo y jugador');
      console.error("Sobran parámetros, se espera codigo y jugador");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!codigo || !nombreId) {
      res.status(400).send('Falta el codigo y/o jugador');
      console.error("Falta el codigo y/o jugador");
      return;
    }
    // Verificar que existe la partida
    const filtro = { codigo: codigo };
    const partidaActual = await Partida.findOne(filtro);
    if (partidaActual) {
      const jugador1 = await Perfil.findOne({ nombreId: partidaActual.nombreId1 });
      let jugador2 = { nombreId: "IA" };
      if (partidaActual.nombreId2) {
        jugador2 = await Perfil.findOne({ nombreId: partidaActual.nombreId2 });
      }
      // Comprobamos que el jugador está en la partida
      var jugador = 0;
      if (jugador1.nombreId === nombreId) {
        jugador = 1;
      } else if (jugador2.nombreId === nombreId) {
        jugador = 2;
      } else {
        res.status(404).send('El jugador no está en la partida');
        console.error('El jugador no está en la partida');
        return;
      }

      // Obtengo los barcos hundidos en el tablero enemigo
      let listaBarcosHundidos = [];
      for (let barco of jugador === 1 ? partidaActual.tableroBarcos2 : partidaActual.tableroBarcos1) {
        barco._id = undefined;
        if (barco.coordenadas.some(coordenada => coordenada.estado === 'Hundido')) {
          listaBarcosHundidos.push(barco);
        }
      }

      // Obtengo los disparos realizados por el jugador
      let misDisparos = jugador === 1 ? partidaActual.disparosRealizados1 : partidaActual.disparosRealizados2;
      for (let disparo of misDisparos) {
        disparo._id = undefined;
      }

      let minasExplotadas = [];
      for (let mina of jugador === 1 ? partidaActual.minas2 : partidaActual.minas1) {
        mina._id = undefined;
        if (mina.estado === 'Hundido') {
          minasExplotadas.push(mina);
        }
      }

      // COSAS PARA FRONTEND MOBILE
      let contadorTurno = partidaActual.contadorTurno;
      let tipoPartida;
      if(jugador2.nombreId === "IA"){
        tipoPartida = 'INDIVIDUAL';
      } else if (jugador2.nombreId !== "IA"){
        if(partidaActual.amistosa) tipoPartida = 'AMISTOSA';
        else if(partidaActual.torneo) tipoPartida = 'TORNEO';
        else { tipoPartida = 'COMPETITIVA'; }
      }

      const disparosBarcos = {
        misDisparos: misDisparos,
        minasExplotadas: minasExplotadas,
        barcosHundidos: listaBarcosHundidos,
        contadorTurno: contadorTurno,
        tipoPartida: tipoPartida
      };
      res.json(disparosBarcos);
      console.log('Tablero enemigo obtenido con éxito');
    } else {
      res.status(404).send('Partida no encontrada');
      console.error('Partida no encontrada');
      return;
    }
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error('Hubo un error: ', error);
    return;
  }
};

/**
 * @function mostrarTableros
 * @description Devuelve los tableros con barcos, minas (del enemigo sólo los hundidos) y disparos realizados de ambos jugadores en la partida
 * @param {Object} req - El objeto de solicitud HTTP
 * @param {String} req.body.codigo - El codigo de la partida
 * @param {String} req.body.nombreId - El nombreId del jugador
 * @param {Object} res - El objeto de respuesta HTTP
 * @param {Tablero} res.tableroBarcos - El tablero de barcos del jugador y su estado actual
 * @param {Coordenada[]} res.disparosEnemigos - Los disparos realizados por el jugador enemigo
 * @param {Coordenada[]} res.misMinas - Las minas colocadas por mi
 * @param {Coordenada[]} res.misDisparos - Los disparos realizados por mi
 * @param {Coordenada[]} res.barcosHundidos - Los barcos del enemigo hundidos por mi
 * @param {Coordenada[]} res.minasEnemigas - Las minas del enemigo que he hundido
 * @example
 * peticion = { body: { codigo: '1234567890', nombreId: 'jugador1' } }
 * respuesta = { json: () => {} }
 * await mostrarTableros(peticion, respuesta)
 */
exports.mostrarTableros = async (req, res) => {
  try {
    const { codigo, nombreId, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera codigo');
      console.error("Sobran parámetros, se espera codigo");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!codigo || !nombreId) {
      res.status(400).send('Falta el codigo y/o jugador');
      console.error("Falta el codigo y/o jugador");
      return;
    }
    // Verificar que existe la partida
    const filtro = { codigo: codigo };
    const partidaActual = await Partida.findOne(filtro);
    if (partidaActual) {      
      const jugador1 = await Perfil.findOne({ nombreId: partidaActual.nombreId1 });
      let jugador2 = { nombreId: "IA" };
      if (partidaActual.nombreId2) {
        jugador2 = await Perfil.findOne({ nombreId: partidaActual.nombreId2 });
      }
      // Comprobamos que el jugador está en la partida
      var jugador = 0;
      if (jugador1.nombreId === nombreId) {
        jugador = 1;
      } else if (jugador2.nombreId === nombreId) {
        jugador = 2;
      } else {
        res.status(404).send('El jugador no está en la partida');
        console.error('El jugador no está en la partida');
        return;
      }

      let tableroBarcos = jugador === 1 ? partidaActual.tableroBarcos1 : partidaActual.tableroBarcos2;
      for (let barco of tableroBarcos) {
        barco._id = undefined;
        for (let coordenada of barco.coordenadas) {
          coordenada._id = undefined;
        }
      }

      let disparosEnemigos = jugador === 1 ? partidaActual.disparosRealizados2 : partidaActual.disparosRealizados1;
      for (let disparo of disparosEnemigos) {
        disparo._id = undefined;
      }

      // Obtengo los barcos hundidos en el tablero enemigo
      let listaBarcosHundidos = [];
      for (let barco of jugador === 1 ? partidaActual.tableroBarcos2 : partidaActual.tableroBarcos1) {
        barco._id = undefined;
        if (barco.coordenadas.some(coordenada => coordenada.estado === 'Hundido')) {
          listaBarcosHundidos.push(barco);
        }
      }

      // Obtengo los disparos realizados por el jugador
      let misDisparos = jugador === 1 ? partidaActual.disparosRealizados1 : partidaActual.disparosRealizados2;
      for (let disparo of misDisparos) {
        disparo._id = undefined;
      }

      let misMinas = jugador === 1 ? partidaActual.minas1 : partidaActual.minas2;
      for (let mina of misMinas) {
        mina._id = undefined;
      }

      let minasEnemigas = [];
      for (let mina of jugador === 1 ? partidaActual.minas2 : partidaActual.minas1) {
        mina._id = undefined;
        if (mina.estado === 'Hundido') {
          minasEnemigas.push(mina);
        }
      }

      const tableros = {
        tableroBarcos: tableroBarcos,
        disparosEnemigos: disparosEnemigos,
        misMinas: misMinas,
        misDisparos: misDisparos,
        barcosHundidos: listaBarcosHundidos,
        minasEnemigas: minasEnemigas
      };
      res.json(tableros);
      console.log('Tableros obtenidos con éxito');
    } else {
      res.status(404).send('Partida no encontrada');
      console.error('Partida no encontrada');
      return;
    }
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error('Hubo un error');
    return;
  }
};

//-------------------------------------------Funciones de disparo----------------------------------------------
// Función que verifica si la partida existe, no ha terminado y es el turno del jugador
// Opcionalmente, verifica si el jugador puede usar una habilidad si recibe el parámetro habilidad (con true por ejemplo)
// En tal caso, devuelve la partida, jugador1, jugador2 y jugador (1 si nombreId es el jugador1, 2 si es el jugador2)
// En caso contrario, devuelve mensaje con el error
async function verificarTurno(filtro, nombreId, habilidad) {
  let mensajeError = undefined;
  const partidaActual = await Partida.findOne(filtro);
  if (partidaActual) {
    let jugador1 = await Perfil.findOne({ nombreId: partidaActual.nombreId1 });
    let jugador2 = { nombreId: "IA" };
    if (partidaActual.nombreId2) {
      jugador2 = await Perfil.findOne({ nombreId: partidaActual.nombreId2 });
    }
    // Comprobamos que el jugador está en la partida
    let jugador = 0;
    if (jugador1.nombreId === nombreId) {
      jugador = 1;
    } else if (jugador2.nombreId === nombreId) {
      jugador = 2;
    } else {
      mensajeError = 'El jugador no está en la partida';
      console.error('El jugador no está en la partida');
      return {mensajeError};
    }
    // Comprobar que la partida no ha terminado
    if (partidaActual.ganador) {
      mensajeError = 'La partida ha terminado';
      console.error('La partida ha terminado');
      return {mensajeError};
    }
    // Comprobar si es el turno del jugador
    if (jugador === 1 && partidaActual.contadorTurno % 2 === 0 || 
          jugador === 2 && partidaActual.contadorTurno % 2 === 1) {
      mensajeError = 'No es el turno del jugador';
      console.error('No es el turno del jugador');
      return {mensajeError};
    }
    // Comprobar si el jugador tiene habilidades disponibles
    if (habilidad && (jugador === 1 && partidaActual.usosHab1 === 0 || 
      jugador === 2 && partidaActual.usosHab2 === 0)) {
      mensajeError = 'Las habilidades han sido consumidas';
      console.error('Las habilidades han sido consumidas');
      return {mensajeError};
    }
    // Comprobar si el clima permite usar habilidades
    if (habilidad && partidaActual.clima === 'Tormenta') {
      mensajeError = 'No se puede usar habilidades con el clima actual';
      console.error('No se puede usar habilidades con el clima actual');
      return {mensajeError};
    }
    return {partidaActual, jugador1, jugador2, jugador};
  } else {
    mensajeError = 'No se ha encontrado la partida a actualizar';
    console.error('No se ha encontrado la partida a actualizar');
    return {mensajeError};
  }
}

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

// Función que dispara en la cordenada indicada, actualiza partidaActual y estadisticasJugadores y devuelve el disparo y el barco disparado (si existe)
// También actualiza el turno si se falla un disparo y noActualizarTurno no es true
function gestionarDisparo(jugador, partidaActual, estadisticasJugadores, i, j, // args de disparo básico
  noActualizarTurno) {  // arg adicional para disparo recargado o respuesta de mina
  let {barcoDisparado, minaDisparada} = jugador === 1 ? 
    dispararCoordenada(partidaActual.tableroBarcos2, partidaActual.minas2, i, j) :
    dispararCoordenada(partidaActual.tableroBarcos1, partidaActual.minas1, i, j);
  let disparo = { i, j, estado: 'Agua' };
  let disparosRespuestaMina = [];
  let barcosHundidosRespuestaMina = [];
  if (barcoDisparado) {
    barcoDisparado._id = undefined;
    barcoDisparado.coordenadas._id = undefined;
    for (let coord of barcoDisparado.coordenadas) {
      coord._id = undefined;
    }
    estadisticasJugadores[jugador - 1].nuevosDisparosAcertados++;
    disparo.estado = 'Tocado'; // Los disparos solo son Agua o Tocado
    let hundido = true;
    for (let coord of barcoDisparado.coordenadas) {
      if (coord.estado === 'Agua') {
        hundido = false;
        break;
      }
    }
    if (hundido) {
      estadisticasJugadores[jugador - 1].nuevosBarcosHundidos++;
      estadisticasJugadores[jugador === 1 ? 1 : 0].nuevosBarcosPerdidos++;
      for (let coord of barcoDisparado.coordenadas) {
        coord.estado = 'Hundido';
      }
      disparo.estado = 'Hundido';
    }
  } else {  // Sólo cambia el turno si se falla el disparo
    estadisticasJugadores[jugador - 1].nuevosDisparosFallados++;
    if (!noActualizarTurno) {
      partidaActual.contadorTurno++;
    }
    // Si se ha explotado una mina, recibir disparos
    if (minaDisparada) {
      const jugadorEnemigo = jugador === 1 ? 2 : 1;
      for (let k = 0; k < 5; k++) {
        while (true) {  // Buscar coordenada aleatoria en la que no hay una mina
          var iRespuesta = Math.floor(Math.random() * tableroDim) + 1;
          var jRespuesta = Math.floor(Math.random() * tableroDim) + 1;
          if (jugador === 1) {
            if (!partidaActual.minas1.some(mina => mina.i === iRespuesta && mina.j === jRespuesta && mina.estado === 'Agua')) {
              break;
            }
          } else {
            if (!partidaActual.minas2.some(mina => mina.i === iRespuesta && mina.j === jRespuesta && mina.estado === 'Agua')) {
              break;
            }
          }
        }

        let {disparo: disparoRespuesta, barcoDisparado: barcoDisparadoRespuesta} = 
          gestionarDisparo(jugadorEnemigo, partidaActual, estadisticasJugadores, iRespuesta, jRespuesta, true);
        disparosRespuestaMina.push(disparoRespuesta);
        if (disparoRespuesta.estado === 'Hundido') {
          barcosHundidosRespuestaMina.push(barcoDisparadoRespuesta);
        }

      }
    }
  }
  
  jugador === 1 ? partidaActual.disparosRealizados1.push(disparo) : 
    partidaActual.disparosRealizados2.push(disparo);

  return {
    disparo: disparo, // Último disparo
    barcoDisparado: barcoDisparado, // Barco disparado por disparo, si existe
    minaDisparada: minaDisparada, // Mina disparada por disparo, si existe
    disparosRespuestaMina: disparosRespuestaMina, // Disparos enemigos en respuesta de mina, si los hay
    barcosHundidosRespuestaMina: barcosHundidosRespuestaMina // Barcos propios hundidos por respuesta de mina, si los hay
  };
}

// Función que verifica si la partida ha finalizado y en tal caso actualiza los datos de los jugadores.
// Devuelve true si la partida ha finalizado, false en caso contrario.
async function comprobarFinDePartida(jugador, jugador1, jugador2, partidaActual, estadisticasJugadores, partidaContraIA) {
  let finPartida;
  if (jugador === 1) {
    finPartida = partidaActual.tableroBarcos2.every(barco =>
      barco.coordenadas.every(coordenada => coordenada.estado === 'Hundido'));
  } else {
    finPartida = partidaActual.tableroBarcos1.every(barco =>
      barco.coordenadas.every(coordenada => coordenada.estado === 'Hundido'));
  }

  if (finPartida) {
    if (jugador === 1) {
      estadisticasJugadores[0].victoria = 1;
      estadisticasJugadores[1].victoria = 0;
      partidaActual.ganador = jugador1.nombreId;
    } else {
      estadisticasJugadores[1].victoria = 1;
      estadisticasJugadores[0].victoria = 0;
      partidaActual.ganador = jugador2.nombreId;
    }
    jugador1.codigoPartidaActual = -1;
    await Perfil.findOneAndUpdate(
      { nombreId: jugador1.nombreId }, // Filtrar
      jugador1, // Actualizar (jugador1 contiene los cambios)
      { new: true } // Para devolver el documento actualizado
    );

    if (!partidaContraIA) {
      jugador2.codigoPartidaActual = -1;
      await Perfil.findOneAndUpdate(
        { nombreId: jugador2.nombreId }, // Filtrar
        jugador2, // Actualizar (jugador2 contiene los cambios)
        { new: true } // Para devolver el documento actualizado
      );
    }
  }
  return finPartida;
}

// Función que realiza los turnos de la IA, actualizando la partida, estadísticas y los turnos de la IA y devuelve true si la partida ha finalizado
async function juegaIA(jugador1, jugador2, partidaActual, estadisticasJugadores, turnosIA) {
  console.log('Turno de la IA');
  let sigueIA = true;
  let finPartida = false;
  while (sigueIA) {
    let posibleDisparoIA = generarDisparoAleatorio(partidaActual.disparosRealizados2);
    let {disparo, barcoDisparado, minaDisparada, disparosRespuestaMina, barcosHundidosRespuestaMina} = 
      gestionarDisparo(2, partidaActual, estadisticasJugadores, posibleDisparoIA.i, posibleDisparoIA.j);

    // Comprobar si la partida ha terminado
    finPartida = false;
    if (disparo.estado === 'Hundido') { // He podido ganar si he hundido el último barco
      finPartida = await comprobarFinDePartida(2, jugador1, jugador2, partidaActual, estadisticasJugadores, true);
    } else if (minaDisparada) { // He podido perder
      finPartida = await comprobarFinDePartida(1, jugador1, jugador2, partidaActual, estadisticasJugadores, true);
    }

    let turnoIA = {
      disparoRealizado: disparo,
      barcoCoordenadas: (disparo.estado === 'Hundido') ? barcoDisparado : undefined,
      eventoOcurrido: undefined, // Evento ocurrido en la partida
      finPartida: finPartida,
      clima: partidaActual.clima,
      minaDisparada: minaDisparada,
      disparosRespuestaMina: (minaDisparada !== undefined) ? disparosRespuestaMina : [],
      barcosHundidosRespuestaMina: (minaDisparada !== undefined) ? barcosHundidosRespuestaMina : [],
    };
    turnosIA.push(turnoIA);
    sigueIA = disparo.estado !== 'Agua' && !finPartida;
  }

  return finPartida;
}

// Función que actualiza las estadísticas de los jugadores en la base de datos tras finalizar un turno
// Devuelve mensaje de error si hay algún problema
async function actualizarEstadisticasTurno(nuevosTrofeos, partidaActual, estadisticasJugadores, jugador1, jugador2, partidaContraIA) {
  let mensajeError = undefined;
  let tempRes1 = { json: () => {}, status: function(s) { 
    this.statusCode = s; return this;} };
  // Actualizar ptos de experiencia y ELO si la partida no es amistosa
  console.log('Chivato0');
  if (!partidaActual.amistosa) {
    estadisticasJugadores[0].nuevosTrofeos = 
      (estadisticasJugadores[0].victoria === 1) ? 20 : 0; // Place holder === TODO ELO
    let experienciaJ1 = 1*estadisticasJugadores[0].nuevosDisparosAcertados 
    + 0.25*estadisticasJugadores[0].nuevosDisparosFallados 
    + 5*estadisticasJugadores[0].nuevosBarcosHundidos
    + (estadisticasJugadores[0].victoria === 1) ? 10 : 0;
    nuevosTrofeos = calcularActualizacionELO(jugador1.trofeos, jugador2.trofeos,
      estadisticasJugadores[0].victoria);
    estadisticasJugadores[0].nuevosTrofeos = nuevosTrofeos[0];
    console.log('Chivato0.5');
    await actualizarPuntosExperiencia({ body: { nombreId: estadisticasJugadores[0].nombreId, 
      nuevosPuntosExperiencia: experienciaJ1 } }, tempRes1);
    if (tempRes1.statusCode !== undefined && tempRes1.statusCode !== 200) {
      mensajeError = 'Error al actualizar los puntos de experiencia del jugador 1';
      return {mensajeError};
    }
  }
  console.log('Chivato1');
  await actualizarEstadisticas({ body: estadisticasJugadores[0] }, tempRes1);
  if (tempRes1.statusCode !== undefined && tempRes1.statusCode !== 200) {
    mensajeError = 'Error al actualizar las estadísticas del jugador 1';
    return {mensajeError};
  }
  console.log('Chivato2');
  if (!partidaContraIA) {
    let tempRes2 = { json: () => {}, status: function(s) {
      this.statusCode = s; return this;} };
    // Las partidas amistosas no cuentan para la experiencia ni para los trofeos
    if (!partidaActual.amistosa) {
      estadisticasJugadores[1].nuevosTrofeos = 20; // Place holder === TODO ELO
      let experienciaJ2 = 1*estadisticasJugadores[1].nuevosDisparosAcertados
      + 0.25*estadisticasJugadores[1].nuevosDisparosFallados
      + 5*estadisticasJugadores[1].nuevosBarcosHundidos
      + (estadisticasJugadores[1].victoria === 1) ? 10 : 0;
      estadisticasJugadores[1].nuevosTrofeos = nuevosTrofeos[1];
      await actualizarPuntosExperiencia({ body: { nombreId: estadisticasJugadores[1].nombreId,
        nuevosPuntosExperiencia: experienciaJ2 } }, tempRes2);
      if (tempRes2.statusCode !== undefined && tempRes2.statusCode !== 200) {
        mensajeError = 'Error al actualizar los puntos de experiencia del jugador 2';
        return {mensajeError};
      }
    }
    console.log('Chivato3');
    await actualizarEstadisticas({ body: estadisticasJugadores[1] }, tempRes2);
    if (tempRes2.statusCode !== undefined && tempRes2.statusCode !== 200) {
      mensajeError = 'Error al actualizar las estadísticas del jugador 2';
      return {mensajeError};
    }
  }
  return {mensajeError};
}

// Función que añade las estadísticas de la partida en la respuesta de disparo
function añadirEstadisticasEnRespuesta(respuestaDisparo, partidaActual, estadisticasJugadores, jugador, nuevosTrofeos){
  let estadisticas = calcularEstadisticasPartida(partidaActual, jugador);
  estadisticas.nuevosPuntosExperiencia += 10*estadisticasJugadores[jugador - 1].victoria;
  estadisticas.nuevosTrofeos = nuevosTrofeos[jugador - 1];
  respuestaDisparo.estadisticas = estadisticas;
}

//-------------------------------------------Funciones de clima----------------------------------------------
// Funcion para seleccionar el clima en funcion del bioma de la partida 
function seleccionarClima(bioma, clima) {
  // Número aleatorio para determinar si hay un cambio de clima
  let cambioClima = Math.random();

  // Número aleatorio para determinar el nuevo clima
  let nuevoClima = Math.random();

  // Número aleatorio para decidir un viento
  let v = Math.random();
  if (v < 0.25) { viento = 'VientoSur'; }
  else if(v < 0.5) { viento = 'VientoNorte'; }
  else if(v < 0.75) { viento = 'VientoEste'; }
  else { viento = 'VientoOeste'; }

  // Climas del bioma Mediterraneo: calma, viento, niebla
  // Cambia de climas con frecuencia 10 %
  // Calma -> Viento 60%, Niebla 40%
  // Viento -> Calma 70%, Niebla 30%
  // Niebla -> Calma 70%, Viento 30%
  if(bioma === 'Mediterraneo') {
    if(cambioClima < 0.1) {
      if(clima == 'Calma') {
        if(nuevoClima < 0.6) { return viento; }
        else { return 'Niebla'; }
      }
      else if(clima == 'VientoSur' || clima == 'VientoNorte' || clima == 'VientoEste' || clima == 'VientoOeste') {
        if(nuevoClima < 0.7) { return 'Calma'; }
        else { return 'Tormenta'; }
      }
      else if(clima == 'Niebla') { return 'Calma'; }
      else if(clima == 'Tormenta') {
        if(nuevoClima < 0.3) { return viento; }
        else { return 'Calma'; }
      }
    }
  }
  // Climas del bioma Cantabrico: Calma, Viento, Niebla, Tormenta
  // Cambia de climas con frecuencia 30 %
  // Calma -> Viento 50%, Niebla 50%
  // Viento -> Calma 50%, Tormenta 50%
  // Niebla -> Calma 100%
  // Tormenta -> Viento 50%, Calma 50%
  else if(bioma === 'Cantabrico') {
    if(cambioClima < 0.3) {
      if(clima == 'Calma') {
        if(nuevoClima < 0.5) { return viento; }
        else { return 'Niebla'; }
      }
      else if(clima == 'VientoSur' || clima == 'VientoNorte' || clima == 'VientoEste' || clima == 'VientoOeste') {
        if(nuevoClima < 0.5) { return 'Calma'; }
        else { return 'Tormenta'; }
      }
      else if(clima == 'Niebla') { return 'Calma'; }
      else if(clima == 'Tormenta') {
        if(nuevoClima < 0.5) { return viento; }
        else { return 'Calma'; }
      }
    }
  }
  // Climas del bioma Norte: Calma, Viento, Niebla, Tormenta
  // Cambia de climas con frecuencia 50 %
  // Calma -> Viento 60%, Niebla 40%
  // Viento -> Calma 40%, Tormenta 60%
  // Niebla -> Calma 80%, Viento 20%
  // Tormenta -> Viento 50%, Calma 30%, Niebla 20%
  else if(bioma === 'Norte') {
    if(cambioClima < 0.5) {
      if(clima == 'Calma') {
        if(nuevoClima < 0.6) { return viento; }
        else { return 'Niebla'; }
      }
      else if(clima == 'VientoSur' || clima == 'VientoNorte' || clima == 'VientoEste' || clima == 'VientoOeste') {
        if(nuevoClima < 0.4) { return 'Calma'; }
        else { return 'Tormenta'; }
      }
      else if(clima == 'Niebla') {
        if(nuevoClima < 0.8) { return 'Calma'; }
        else { return viento; }
      }
      else if(clima == 'Tormenta') {
        if(nuevoClima < 0.5) { return viento; }
        else if(nuevoClima < 0.8) { return 'Calma'; }
        else { return 'Niebla'; }
      }
    }

  }
  else if(bioma === 'Bermudas') {
    return 'Tormenta'
  }
  else {
    // El bioma no está definido
    console.error('El bioma no está definido');
    return undefined;
  }
}  

// Función que dada una casilla (i, j) la desplaza una posición (si no se sale del tablero) en función de la dirección
// de origen del viento
function desplazarCasilla(i, j, direccion) {
  if (direccion === 'VientoSur') {
    if (i > 1) i--;
  } else if (direccion === 'VientoNorte') {
    if (i < tableroDim) i++;
  } else if (direccion === 'VientoEste') {
    if (j > 1) j--;
  } else if (direccion === 'VientoOeste') {
    if (j < tableroDim) j++;
  } else {
    console.error('La dirección del viento no está definida');    // Este caso no puede darse nunca porque se comprueba antes
  }
  return { i: i, j: j, eventoOcurrido: direccion };
}

// Función que devuelve true o false con probabilidad 0.5
function tirarMoneda() {
  return Math.random() < 0.5;
}

// Función que devuelve la nueva casilla de disparo si se ha aplicado el efecto del clima o la misma casiila si no
function efectoClima(clima, i, j) {
  if (clima == 'Niebla') {
    return tirarMoneda() ? {i: undefined, j: undefined, eventoOcurrido: "Niebla"} : {i: i, j: j, eventoOcurrido: "Calma"};
  } else if (clima == 'VientoNorte' || clima == 'VientoSur' || clima == 'VientoEste' || clima == 'VientoOeste') {
    return desplazarCasilla(i, j, clima);
  } else {
    return {i: i, j: j, eventoOcurrido: "Calma"};
  }
}

/**
 * @typedef {Object} TurnoIA
 * @property {Coordenada} disparoRealizado - El disparo realizado por la IA
 * @property {Barco} [barcoCoordenadas] - Las coordenadas del barco disparado por la IA, si se ha hundido
 * @property {String} eventoOcurrido - El evento ocurrido en la partida
 * @property {Boolean} finPartida - Indica si la partida ha terminado
 * @property {String} clima - El clima de la partida
 * @property {Coordenada} [minaDisparada] - La mina disparada por la IA, si se ha hundido
 * @property {Coordenada[]} [disparosRespuestaMina] - Los disparos realizados por el jugador en respuesta a una mina
 * @property {Barco[]} [barcosHundidosRespuestaMina] - Los barcos de la IA hundidos por respuesta a una mina
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
  try {
    const { codigo, nombreId, i, j, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra que no se espera
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera codigo, jugador, i, j');
      console.error("Sobran parámetros, se espera codigo, jugador, i, j");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!codigo || !nombreId || !i || !j) {
      res.status(400).send('Falta alguno de los siguientes parámetros: codigo, nombreId, i, j');
      return;
    }
    // Comprobar si i, j es casilla válida
    if (i < 1 || i > tableroDim || j < 1 || j > tableroDim) {
      res.status(400).send('Las coordenadas i, j deben estar entre 1 y 10');
      console.error("Las coordenadas i, j deben estar entre 1 y 10");
      return;
    }
    // Verificar que el turno es válido: partida existe, no ha terminado y es el turno del jugador
    const filtro = { codigo: codigo };
    let {partidaActual, jugador1, jugador2, jugador, mensajeError} = await verificarTurno(filtro, nombreId);
    if (mensajeError) {
      res.status(404).send(mensajeError);
      return;
    } else {
      let estadisticasJugadores = [
        { victoria: undefined, nuevosBarcosHundidos: 0, nuevosBarcosPerdidos: 0,
          nuevosDisparosAcertados: 0, nuevosDisparosFallados: 0, nuevosTrofeos: 0,
          nombreId: jugador1.nombreId },
        { victoria: undefined, nuevosBarcosHundidos: 0, nuevosBarcosPerdidos: 0,
          nuevosDisparosAcertados: 0, nuevosDisparosFallados: 0, nuevosTrofeos: 0,
          nombreId: jugador2.nombreId }
      ]

      const partidaContraIA = !partidaActual.nombreId2;
      // Aplicar efecto de clima y actualizar el clima
      const {i: iClima, j: jClima, eventoOcurrido} = efectoClima(partidaActual.clima, i, j);
      console.log('Bioma: ', partidaActual.bioma, ' Clima: ', partidaActual.clima);
      const nuevoClima = seleccionarClima(partidaActual.bioma, partidaActual.clima);
      partidaActual.clima = nuevoClima;

      var disparo = undefined, barcoDisparado, minaDisparada, disparosRespuestaMina, barcosHundidosRespuestaMina;
      var finPartida = false;
      if (iClima !== undefined && jClima !== undefined) {
        // Realizar disparo
        console.log('Hay clima raro, : ', nuevoClima);
        let gestionDisparo = gestionarDisparo(jugador, partidaActual, estadisticasJugadores, iClima, jClima);
        console.log('Resultado gestion disparo: ', gestionDisparo);
        disparo = gestionDisparo.disparo;
        barcoDisparado = gestionDisparo.barcoDisparado;
        minaDisparada = gestionDisparo.minaDisparada;
        disparosRespuestaMina = gestionDisparo.disparosRespuestaMina;
        barcosHundidosRespuestaMina = gestionDisparo.barcosHundidosRespuestaMina;
        
        // Comprobar si la partida ha terminado
        if (disparo.estado === 'Hundido') { // He podido ganar si he hundido el último barco
          finPartida = await comprobarFinDePartida(jugador, jugador1, jugador2, partidaActual, estadisticasJugadores, partidaContraIA);
        } else if (minaDisparada) { // He podido perder
          let jugadorEnemigo =  jugador === 1 ? 2 : 1;
          finPartida = await comprobarFinDePartida(jugadorEnemigo, jugador1, jugador2, partidaActual, estadisticasJugadores, partidaContraIA);
        }
      } else {  // Se ha fallado el disparo por niebla
        partidaActual.contadorTurno++;
      }

      let turnosIA = [];
      let finPartidaIA = false;
      if (partidaContraIA && (disparo === undefined || disparo.estado === 'Agua' && !finPartida)) {
        finPartidaIA = await juegaIA(jugador1, jugador2, partidaActual, estadisticasJugadores, turnosIA);
      }
      console.log('Disparo realizado con éxito');
      // Actualizar la partida
      const partidaModificada = await Partida.findOneAndUpdate(
        filtro, // Filtrar
        partidaActual, // Actualizar (partida contiene los cambios)
        { new: true } // Para devolver el documento actualizado
      );

      if (partidaModificada) {
        let respuestaDisparo = {
          coordenadasOriginales : { i: i, j: j },
          disparoRealizado: disparo,
          barcoCoordenadas: (disparo && disparo.estado === 'Hundido') ? barcoDisparado : undefined,
          eventoOcurrido: eventoOcurrido, // Evento ocurrido en la partida
          finPartida: finPartida,
          clima: partidaActual.clima,
          minaDisparada: minaDisparada,
          disparosRespuestaMina: (minaDisparada !== undefined) ? disparosRespuestaMina : [],
          barcosHundidosRespuestaMina: (minaDisparada !== undefined) ? barcosHundidosRespuestaMina : [],
          turnosIA: turnosIA
        };

        // Actualizar estadisticas de los jugadores
        let nuevosTrofeos = [0, 0];
        console.log('Partida contra IA: ', partidaContraIA);
        const {mensajeError} = await actualizarEstadisticasTurno(nuevosTrofeos, partidaActual, estadisticasJugadores, jugador1, jugador2, partidaContraIA);
        console.log('Mensaje de error: ', mensajeError);
        if (mensajeError) {
          res.status(500).send(mensajeError);
          console.error(mensajeError);
          return;
        }

        // Si acaba la partida, devolver las estadisticas totales del jugador
        if (finPartida || finPartidaIA) {
          añadirEstadisticasEnRespuesta(respuestaDisparo, partidaActual, estadisticasJugadores, jugador, nuevosTrofeos);
        }
        res.json(respuestaDisparo);
        console.log("Partida modificada con éxito");
        return (respuestaDisparo);
      } else {
        res.status(404).send('No se ha encontrado la partida a actualizar');
        console.error("No se ha encontrado la partida a actualizar");
      }
    }
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Hubo un error");
  }
};

/**
 * @function realizarDisparoMisilRafaga
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
 * @param {Coordenada} [res.minaDisparada] - La mina disparada, si se ha hundido
 * @param {Coordenada[]} [res.disparosRespuestaMina] - Los disparos realizados por el enemigo en respuesta a una mina
 * @param {Barco[]} [res.barcosHundidosRespuestaMina] - Los barcos propios hundidos por respuesta a una mina
 * @param {Number} res.usosHab - Los usos restantes de la habilidad del jugador
 * @param {TurnoIA[]} [res.turnosIA] - Los turnos de la IA, si la partida es contra la IA
 * @example
 * peticion = { body: { codigo: '1234567890', nombreId: 'jugador1', i: 1, j: 1, misilesRafagaRestantes: 3 } }
 * respuesta = { json: () => {} }
 * await realizarDisparoMisilRafaga(peticion, respuesta)
 * peticion = { body: { codigo: '1234567890', nombreId: 'jugador1', i: 1, j: 1, misilesRafagaRestantes: 2 } }
 * respuesta = { json: () => {} }
 * await realizarDisparoMisilRafaga(peticion, respuesta)
 * peticion = { body: { codigo: '1234567890', nombreId: 'jugador1', i: 1, j: 1, misilesRafagaRestantes: 1 } }
 * respuesta = { json: () => {} }
 * await realizarDisparoMisilRafaga(peticion, respuesta)
 */
exports.realizarDisparoMisilRafaga = async (req, res) => {
  try {
    const { codigo, nombreId, i, j, misilesRafagaRestantes, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra que no se espera
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera codigo, jugador, i, j');
      console.error("Sobran parámetros, se espera codigo, jugador, i, j");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!codigo || !nombreId || !i || !j || !misilesRafagaRestantes) {
      res.status(400).send('Falta alguno de los siguientes parámetros: codigo, nombreId, i, j o misilesRafagaRestantes');
      return;
    }
    // Comprobar si i, j es casilla válida
    if (i < 1 || i > tableroDim || j < 1 || j > tableroDim) {
      res.status(400).send('Las coordenadas i, j deben estar entre 1 y 10');
      console.error("Las coordenadas i, j deben estar entre 1 y 10");
      return;
    }
    // Comprobar si misilesRafagaRestantes es un entero positivo
    if (misilesRafagaRestantes <= 0) {
      res.status(400).send('misilesRafagaRestantes debe ser un entero positivo');
      console.error("misilesRafagaRestantes debe ser un entero positivo");
      return;
    }
    // Verificar que el turno es válido: partida existe, no ha terminado, es el turno del jugador y puede usar habilidad
    const filtro = { codigo: codigo };
    let {partidaActual, jugador1, jugador2, jugador, mensajeError} = await verificarTurno(filtro, nombreId, habilidad=true);
    if (mensajeError) {
      res.status(404).send(mensajeError);
      return;
    } else {
      let estadisticasJugadores = [
        { victoria: undefined, nuevosBarcosHundidos: 0, nuevosBarcosPerdidos: 0,
          nuevosDisparosAcertados: 0, nuevosDisparosFallados: 0, nuevosTrofeos: 0,
          nombreId: jugador1.nombreId },
        { victoria: undefined, nuevosBarcosHundidos: 0, nuevosBarcosPerdidos: 0,
          nuevosDisparosAcertados: 0, nuevosDisparosFallados: 0, nuevosTrofeos: 0,
          nombreId: jugador2.nombreId }
      ]

      const partidaContraIA = !partidaActual.nombreId2;
      let ultimoMisilRafaga = misilesRafagaRestantes === 1;
      // Consumir habilidad si es el último misil de la ráfaga
      if (ultimoMisilRafaga) { // Si es el último de la ráfaga, consumir habilidad
        if (jugador === 1) partidaActual.usosHab1--;
        else partidaActual.usosHab2--;
      }
      // Realizar disparo
      const {disparo, barcoDisparado, minaDisparada, disparosRespuestaMina, barcosHundidosRespuestaMina} = 
        gestionarDisparo(jugador, partidaActual, estadisticasJugadores, i, j, !ultimoMisilRafaga); // No actualizar turno si es el último misil de la ráfaga
      // Comprobar si la partida ha terminado
      let finPartida = false;
      if (disparo.estado === 'Hundido') { // He podido ganar si he hundido el último barco
        finPartida = await comprobarFinDePartida(jugador, jugador1, jugador2, partidaActual, estadisticasJugadores, partidaContraIA);
      } else if (minaDisparada) { // He podido perder
        let jugadorEnemigo =  jugador === 1 ? 2 : 1;
        finPartida = await comprobarFinDePartida(jugadorEnemigo, jugador1, jugador2, partidaActual, estadisticasJugadores, partidaContraIA);
      }
      let turnosIA = [];
      let finPartidaIA = false;
      // La IA no juega si no es el último misil de ráfaga
      if (partidaContraIA && disparo.estado === 'Agua' && !finPartida && ultimoMisilRafaga) {
        finPartidaIA = await juegaIA(jugador1, jugador2, partidaActual, estadisticasJugadores, turnosIA);
      }
      console.log('Disparo realizado con éxito');
      // Actualizar la partida
      const partidaModificada = await Partida.findOneAndUpdate(
        filtro, // Filtrar
        partidaActual, // Actualizar (partida contiene los cambios)
        { new: true } // Para devolver el documento actualizado
      );

      if (partidaModificada) {
        let respuestaDisparo = {
          disparoRealizado: disparo,
          barcoCoordenadas: (disparo.estado === 'Hundido') ? barcoDisparado : undefined,
          eventoOcurrido: undefined, // Evento ocurrido en la partida
          finPartida: finPartida,
          clima: partidaActual.clima,
          ultimoMisilRafaga: ultimoMisilRafaga,
          usosHab: jugador === 1 ? partidaActual.usosHab1 : partidaActual.usosHab2,
          minaDisparada: minaDisparada,
          disparosRespuestaMina: (minaDisparada !== undefined) ? disparosRespuestaMina : [],
          barcosHundidosRespuestaMina: (minaDisparada !== undefined) ? barcosHundidosRespuestaMina : [],
          turnosIA: turnosIA
        };

        // Actualizar estadisticas de los jugadores
        let nuevosTrofeos = [0, 0];
        const {mensajeError} = await actualizarEstadisticasTurno(nuevosTrofeos, partidaActual, estadisticasJugadores, jugador1, jugador2, partidaContraIA);
        if (mensajeError) {
          res.status(500).send(mensajeError);
          console.error(mensajeError);
          return;
        }

        // Si acaba la partida, devolver las estadisticas totales del jugador
        if (finPartida || finPartidaIA) {
          añadirEstadisticasEnRespuesta(respuestaDisparo, partidaActual, estadisticasJugadores, jugador, nuevosTrofeos);
        }
        res.json(respuestaDisparo);
        console.log("Partida modificada con éxito");
        return (respuestaDisparo);
      } else {
        res.status(404).send('No se ha encontrado la partida a actualizar');
        console.error("No se ha encontrado la partida a actualizar");
      }
    }
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Hubo un error");
  }
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
 * @param {Coordenada} res.disparosRealizados - Los 9 disparos realizados con sus coordenadas y estado
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
 * @example
 * peticion = { body: { codigo: '1234567890', nombreId: 'jugador1', turnoRecarga: true } }
 * respuesta = { json: () => {} }
 * await realizarDisparoTorpedoRecargado(peticion, respuesta)
 * peticion = { body: { codigo: '1234567890', nombreId: 'jugador1', i: 5, j: 5 } }
 * respuesta = { json: () => {} }
 * await realizarDisparoTorpedoRecargado(peticion, respuesta)
 */
exports.realizarDisparoTorpedoRecargado = async (req, res) => {
  try {
    const { codigo, nombreId, i, j, turnoRecarga = false, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra que no se espera
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera codigo, jugador, i, j');
      console.error("Sobran parámetros, se espera codigo, jugador, i, j");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!codigo || !nombreId || (!turnoRecarga && (!i || !j))) {
      res.status(400).send('Falta alguno de los siguientes parámetros: codigo, nombreId, i, j');
      return;
    }
    // Comprobar si i, j es casilla válida
    if (!turnoRecarga && (i < 1 || i > tableroDim || j < 1 || j > tableroDim)) {
      res.status(400).send('Las coordenadas i, j deben estar entre 1 y 10');
      console.error("Las coordenadas i, j deben estar entre 1 y 10");
      return;
    }
    // Verificar que el turno es válido: partida existe, no ha terminado, es el turno del jugador y puede usar habilidad
    const filtro = { codigo: codigo };
    let {partidaActual, jugador1, jugador2, jugador, mensajeError} = await verificarTurno(filtro, nombreId, habilidad=true);
    if (mensajeError) {
      res.status(404).send(mensajeError);
      return;
    } else {
      var estadisticasJugadores = [
        { victoria: undefined, nuevosBarcosHundidos: 0, nuevosBarcosPerdidos: 0,
          nuevosDisparosAcertados: 0, nuevosDisparosFallados: 0, nuevosTrofeos: 0,
          nombreId: jugador1.nombreId },
        { victoria: undefined, nuevosBarcosHundidos: 0, nuevosBarcosPerdidos: 0,
          nuevosDisparosAcertados: 0, nuevosDisparosFallados: 0, nuevosTrofeos: 0,
          nombreId: jugador2.nombreId }
      ]
      var partidaContraIA = !partidaActual.nombreId2;
      // Distinguir turno de recarga de turno de disparo
      if (turnoRecarga) {
        partidaActual.contadorTurno++;
      } else {
        // Consumir habilidad
        if (jugador === 1) partidaActual.usosHab1--;
        else partidaActual.usosHab2--;
        // Realizar disparos
        var disparosTorpedo = [];
        var numBarcosTocados = 0;
        var barcosHundidos = [];
        var minasDisparadas = [];
        var disparosRespuestasMinas = [];
        var barcosHundidosRespuestasMinas = [];
        const vecinidad = [-1, 0, 1];
        for (let iVecino of vecinidad) {
          for (let jVecino of vecinidad) {
            let iDisparo = i + iVecino;
            let jDisparo = j + jVecino;
            if (iDisparo >= 1 && iDisparo <= tableroDim && jDisparo >= 1 && jDisparo <= tableroDim) {
              var {disparo, barcoDisparado, minaDisparada, disparosRespuestaMina, barcosHundidosRespuestaMina} = 
                gestionarDisparo(jugador, partidaActual, estadisticasJugadores, iDisparo, jDisparo, true);  // No actualizar turno
              disparosTorpedo.push(disparo);
              if (disparo.estado === 'Tocado' || disparo.estado === 'Hundido') {
                numBarcosTocados++;
                if (disparo.estado === 'Hundido') {
                  barcosHundidos.push(barcoDisparado);
                }
              } else if (minaDisparada) {
                minasDisparadas.push(minaDisparada);
                disparosRespuestasMinas = disparosRespuestasMinas.concat(disparosRespuestaMina);
                barcosHundidosRespuestasMinas = barcosHundidosRespuestasMinas.concat(barcosHundidosRespuestaMina);
              }
            }
          }
        }
        // Sólo cambia el turno si se fallan todos los disparos
        if (numBarcosTocados === 0) {
          partidaActual.contadorTurno++;
        }

        // Comprobar si la partida ha terminado
        var finPartida = false;
        if (barcosHundidos.length > 0) { // He podido ganar si he hundido el último barco
          finPartida = await comprobarFinDePartida(jugador, jugador1, jugador2, partidaActual, estadisticasJugadores, partidaContraIA);
        } else if (minasDisparadas.length > 0) { // He podido perder
          let jugadorEnemigo =  jugador === 1 ? 2 : 1;
          finPartida = await comprobarFinDePartida(jugadorEnemigo, jugador1, jugador2, partidaActual, estadisticasJugadores, partidaContraIA);
        }
      }
      let turnosIA = [];
      let finPartidaIA = false;
      if (partidaContraIA && (turnoRecarga || numBarcosTocados === 0 && !finPartida)) {
        finPartidaIA = await juegaIA(jugador1, jugador2, partidaActual, estadisticasJugadores, turnosIA);
      }
      console.log('Disparo o recarga realizado con éxito');
      // Actualizar la partida
      const partidaModificada = await Partida.findOneAndUpdate(
        filtro, // Filtrar
        partidaActual, // Actualizar (partida contiene los cambios)
        { new: true } // Para devolver el documento actualizado
      );
      if (partidaModificada) {
        let respuestaDisparo = {
          disparosRealizados: disparosTorpedo,
          algunoTocado: numBarcosTocados > 0,
          barcoCoordenadas: (barcosHundidos && barcosHundidos.length > 0) ? barcosHundidos : undefined,
          eventoOcurrido: undefined, // Evento ocurrido en la partida
          finPartida: finPartida,
          clima: partidaActual.clima,
          usosHab: jugador === 1 ? partidaActual.usosHab1 : partidaActual.usosHab2,
          minasDisparadas: (minasDisparadas && minasDisparadas.length > 0) ? minasDisparadas : undefined,
          disparosRespuestasMinas: (minaDisparada !== undefined) ? disparosRespuestasMinas : [],
          barcosHundidosRespuestasMinas: (minaDisparada !== undefined) ? barcosHundidosRespuestasMinas : [],
          turnosIA: turnosIA
        };
        // Actualizar estadisticas de los jugadores
        let nuevosTrofeos = [0, 0];
        const {mensajeError} = await actualizarEstadisticasTurno(nuevosTrofeos, partidaActual, estadisticasJugadores, jugador1, jugador2, partidaContraIA);
        if (mensajeError) {
          res.status(500).send(mensajeError);
          console.error(mensajeError);
          return;
        }

        // Si acaba la partida, devolver las estadisticas totales del jugador
        if (finPartida || finPartidaIA) {
          añadirEstadisticasEnRespuesta(respuestaDisparo, partidaActual, estadisticasJugadores, jugador, nuevosTrofeos);
        }
        res.json(respuestaDisparo);
        console.log("Partida modificada con éxito");
        return (respuestaDisparo);
      } else {
        res.status(404).send('No se ha encontrado la partida a actualizar');
        console.error("No se ha encontrado la partida a actualizar");
      }
    }
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Hubo un error");
  }
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
 * @example
 * peticion = { body: { codigo: '1234567890', nombreId: 'jugador1' } }
 * respuesta = { json: () => {} }
 * await realizarDisparoMisilTeledirigido(peticion, respuesta)
 */
exports.realizarDisparoMisilTeledirigido = async (req, res) => {
  try {
    const { codigo, nombreId, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra que no se espera
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera codigo, jugador');
      console.error("Sobran parámetros, se espera codigo, jugador");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!codigo || !nombreId) {
      res.status(400).send('Falta alguno de los siguientes parámetros: codigo, nombreId');
      return;
    }
    // Verificar que el turno es válido: partida existe, no ha terminado, es el turno del jugador y puede usar habilidad
    const filtro = { codigo: codigo };
    let {partidaActual, jugador1, jugador2, jugador, mensajeError} = await verificarTurno(filtro, nombreId, habilidad=true);
    if (mensajeError) {
      res.status(404).send(mensajeError);
      return;
    } else {
      let estadisticasJugadores = [
        { victoria: undefined, nuevosBarcosHundidos: 0, nuevosBarcosPerdidos: 0,
          nuevosDisparosAcertados: 0, nuevosDisparosFallados: 0, nuevosTrofeos: 0,
          nombreId: jugador1.nombreId },
        { victoria: undefined, nuevosBarcosHundidos: 0, nuevosBarcosPerdidos: 0,
          nuevosDisparosAcertados: 0, nuevosDisparosFallados: 0, nuevosTrofeos: 0,
          nombreId: jugador2.nombreId }
      ]

      const partidaContraIA = !partidaActual.nombreId2;
      // Consumir habilidad
      if (jugador === 1) partidaActual.usosHab1--;
      else partidaActual.usosHab2--;
      // Obtener la casilla aleatoria ocupada por un barco enemigo
      const tableroEnemigo = jugador === 1 ? partidaActual.tableroBarcos2 : partidaActual.tableroBarcos1;
      const coordenadasCandidatas = tableroEnemigo.flatMap(barco => barco.coordenadas.filter(coordenada => coordenada.estado === 'Agua'));
      const coordenadaAleatoria = coordenadasCandidatas[Math.floor(Math.random() * coordenadasCandidatas.length)];
      // Realizar disparo
      const {disparo, barcoDisparado, minaDisparada, disparosRespuestaMina, barcosHundidosRespuestaMina} = 
        gestionarDisparo(jugador, partidaActual, estadisticasJugadores, coordenadaAleatoria.i, coordenadaAleatoria.j);

      // Comprobar si la partida ha terminado
      let finPartida = false;
      if (disparo.estado === 'Hundido') { // He podido ganar si he hundido el último barco
        finPartida = await comprobarFinDePartida(jugador, jugador1, jugador2, partidaActual, estadisticasJugadores, partidaContraIA);
      } else if (minaDisparada) { // He podido perder
        let jugadorEnemigo =  jugador === 1 ? 2 : 1;
        finPartida = await comprobarFinDePartida(jugadorEnemigo, jugador1, jugador2, partidaActual, estadisticasJugadores, partidaContraIA);
      }

      let turnosIA = [];
      let finPartidaIA = false; // La IA no juega porque el disparo siempre es tocado o hundido
      console.log('Disparo realizado con éxito');
      // Actualizar la partida
      const partidaModificada = await Partida.findOneAndUpdate(
        filtro, // Filtrar
        partidaActual, // Actualizar (partida contiene los cambios)
        { new: true } // Para devolver el documento actualizado
      );

      if (partidaModificada) {
        let respuestaDisparo = {
          disparoRealizado: disparo,
          barcoCoordenadas: (disparo.estado === 'Hundido') ? barcoDisparado : undefined,
          eventoOcurrido: undefined, // Evento ocurrido en la partida
          finPartida: finPartida,
          clima: partidaActual.clima,
          usosHab: jugador === 1 ? partidaActual.usosHab1 : partidaActual.usosHab2,
          minaDisparada: minaDisparada,
          disparosRespuestaMina: (minaDisparada !== undefined) ? disparosRespuestaMina : [],
          barcosHundidosRespuestaMina: (minaDisparada !== undefined) ? barcosHundidosRespuestaMina : [],
          turnosIA: turnosIA
        };

        // Actualizar estadisticas de los jugadores
        let nuevosTrofeos = [0, 0];
        const {mensajeError} = await actualizarEstadisticasTurno(nuevosTrofeos, partidaActual, estadisticasJugadores, jugador1, jugador2, partidaContraIA);
        if (mensajeError) {
          res.status(500).send(mensajeError);
          console.error(mensajeError);
          return;
        }

        // Si acaba la partida, devolver las estadisticas totales del jugador
        if (finPartida || finPartidaIA) {
          añadirEstadisticasEnRespuesta(respuestaDisparo, partidaActual, estadisticasJugadores, jugador, nuevosTrofeos);
        }
        res.json(respuestaDisparo);
        console.log("Partida modificada con éxito");
        return (respuestaDisparo);
      } else {
        res.status(404).send('No se ha encontrado la partida a actualizar');
        console.error("No se ha encontrado la partida a actualizar");
      }
    }
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Hubo un error");
  }
};

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
 * @example
 * peticion = { body: { codigo: '1234567890', nombreId: 'jugador1', i: 1, j: 1 } }
 * respuesta = { json: () => {} }
 * await colocarMina(peticion, respuesta)
 */
exports.colocarMina = async (req, res) => {
  try {
    const { codigo, nombreId, i, j, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra que no se espera
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera codigo, jugador, i, j');
      console.error("Sobran parámetros, se espera codigo, jugador, i, j");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!codigo || !nombreId || !i || !j) {
      res.status(400).send('Falta alguno de los siguientes parámetros: codigo, nombreId, i, j');
      return;
    }
    // Comprobar si i, j es casilla válida
    if (i < 1 || i > tableroDim || j < 1 || j > tableroDim) {
      res.status(400).send('Las coordenadas i, j deben estar entre 1 y 10');
      console.error("Las coordenadas i, j deben estar entre 1 y 10");
      return;
    }
    // Verificar que el turno es válido: partida existe, no ha terminado, es el turno del jugador y puede usar habilidad
    const filtro = { codigo: codigo };
    let {partidaActual, jugador1, jugador2, jugador, mensajeError} = await verificarTurno(filtro, nombreId, habilidad=true);
    if (mensajeError) {
      res.status(404).send(mensajeError);
      return;
    } else {
      // Comprobar si la casilla está ocupada por un barco propio u otra mina
      const miTablero = jugador === 1 ? partidaActual.tableroBarcos1 : partidaActual.tableroBarcos2;
      const ocupadaPorBarco = miTablero.some(barco => barco.coordenadas.some(coordenada => coordenada.i === i && coordenada.j === j && coordenada.estado === 'Agua'));
      if (ocupadaPorBarco) {
        let respuestaDisparo = {
          minaColocada: false,
          eventoOcurrido: undefined, // Evento ocurrido en la partida
          finPartida: undefined,
          clima: undefined,
          usosHab: jugador === 1 ? partidaActual.usosHab1 : partidaActual.usosHab2,
          turnosIA: undefined
        };
        res.json(respuestaDisparo);
        console.error("La casilla está ocupada por un barco");
        return;
      }
      const misMinas = jugador === 1 ? partidaActual.minas1 : partidaActual.minas2;
      const ocupadaPorMina = misMinas.some(mina => mina.i === i && mina.j === j && mina.estado === 'Agua');
      if (ocupadaPorMina) {
        let respuestaDisparo = {
          minaColocada: false,
          eventoOcurrido: undefined, // Evento ocurrido en la partida
          finPartida: undefined,
          clima: undefined,
          usosHab: jugador === 1 ? partidaActual.usosHab1 : partidaActual.usosHab2,
          turnosIA: undefined
        };
        res.json(respuestaDisparo);
        console.error("La casilla está ocupada por un barco");
        return;
      }

      let estadisticasJugadores = [
        { victoria: undefined, nuevosBarcosHundidos: 0, nuevosBarcosPerdidos: 0,
          nuevosDisparosAcertados: 0, nuevosDisparosFallados: 0, nuevosTrofeos: 0,
          nombreId: jugador1.nombreId },
        { victoria: undefined, nuevosBarcosHundidos: 0, nuevosBarcosPerdidos: 0,
          nuevosDisparosAcertados: 0, nuevosDisparosFallados: 0, nuevosTrofeos: 0,
          nombreId: jugador2.nombreId }
      ]

      const partidaContraIA = !partidaActual.nombreId2;
      // Consumir habilidad y colocar mina
      if (jugador === 1) {
        partidaActual.usosHab1--;
        partidaActual.minas1.push({i: i, j: j});
      } else {
        partidaActual.usosHab2--;
        partidaActual.minas2.push({i: i, j: j});
      }
      // Actualizar turno
      partidaActual.contadorTurno++;

      // Comprobar si la partida ha terminado
      const finPartida = false; // No puede acabar la partida al colocar una mina
      
      let turnosIA = [];
      let finPartidaIA = false;
      // La IA no juega si no es el último misil de ráfaga
      if (partidaContraIA) {  // La IA juega siempre tras colocar una mina
        finPartidaIA = await juegaIA(jugador1, jugador2, partidaActual, estadisticasJugadores, turnosIA);
      }
      console.log('Mina colocada con éxito');
      // Actualizar la partida
      const partidaModificada = await Partida.findOneAndUpdate(
        filtro, // Filtrar
        partidaActual, // Actualizar (partida contiene los cambios)
        { new: true } // Para devolver el documento actualizado
      );

      if (partidaModificada) {
        let respuestaDisparo = {
          minaColocada: {i: i, j: j},
          eventoOcurrido: undefined, // Evento ocurrido en la partida
          finPartida: finPartida,
          clima: partidaActual.clima,
          usosHab: jugador === 1 ? partidaActual.usosHab1 : partidaActual.usosHab2,
          turnosIA: turnosIA
        };

        // Actualizar estadisticas de los jugadores
        let nuevosTrofeos = [0, 0];
        const {mensajeError} = await actualizarEstadisticasTurno(nuevosTrofeos, partidaActual, estadisticasJugadores, jugador1, jugador2, partidaContraIA);
        if (mensajeError) {
          res.status(500).send(mensajeError);
          console.error(mensajeError);
          return;
        }

        // Si acaba la partida, devolver las estadisticas totales del jugador
        if (finPartida || finPartidaIA) {
          añadirEstadisticasEnRespuesta(respuestaDisparo, partidaActual, estadisticasJugadores, jugador, nuevosTrofeos);
        }
        res.json(respuestaDisparo);
        console.log("Partida modificada con éxito");
        return (respuestaDisparo);
      } else {
        res.status(404).send('No se ha encontrado la partida a actualizar');
        console.error("No se ha encontrado la partida a actualizar");
      }
    }
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Hubo un error");
  }
};

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
 * @example
 * peticion = { body: { codigo: '1234567890', nombreId: 'jugador1', i: 2, j: 2 } }
 * respuesta = { json: () => {} }
 * await usarSonar(peticion, respuesta)
 */
exports.usarSonar = async (req, res) => {
  try {
    const { codigo, nombreId, i, j, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra que no se espera
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera codigo, jugador, i, j');
      console.error("Sobran parámetros, se espera codigo, jugador, i, j");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!codigo || !nombreId || !i || !j) {
      res.status(400).send('Falta alguno de los siguientes parámetros: codigo, nombreId, i, j');
      return;
    }
    // Comprobar si i, j es casilla válida
    if (i < 1 || i > tableroDim || j < 1 || j > tableroDim) {
      res.status(400).send('Las coordenadas i, j deben estar entre 1 y 10');
      console.error("Las coordenadas i, j deben estar entre 1 y 10");
      return;
    }
    // Verificar que el turno es válido: partida existe, no ha terminado, es el turno del jugador y puede usar habilidad
    const filtro = { codigo: codigo };
    let {partidaActual, jugador1, jugador2, jugador, mensajeError} = await verificarTurno(filtro, nombreId, habilidad=true);
    if (mensajeError) {
      res.status(404).send(mensajeError);
      return;
    } else {
      let estadisticasJugadores = [
        { victoria: undefined, nuevosBarcosHundidos: 0, nuevosBarcosPerdidos: 0,
          nuevosDisparosAcertados: 0, nuevosDisparosFallados: 0, nuevosTrofeos: 0,
          nombreId: jugador1.nombreId },
        { victoria: undefined, nuevosBarcosHundidos: 0, nuevosBarcosPerdidos: 0,
          nuevosDisparosAcertados: 0, nuevosDisparosFallados: 0, nuevosTrofeos: 0,
          nombreId: jugador2.nombreId }
      ]

      const partidaContraIA = !partidaActual.nombreId2;
      // Consumir habilidad 
      if (jugador === 1) {
        partidaActual.usosHab1--;
      } else {
        partidaActual.usosHab2--;
      }

      // Descubrir casillas enemigas
      let sonar = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
      ];
      const tableroEnemigo = jugador === 1 ? partidaActual.tableroBarcos2 : partidaActual.tableroBarcos1;
      const minasEnemigas = jugador === 1 ? partidaActual.minas2 : partidaActual.minas1;
      const vecinidad = [-1, 0, 1];
      for (let iVecino of vecinidad) {
        for (let jVecino of vecinidad) {
          let iCasilla = i + iVecino;
          let jCasilla = j + jVecino;
          if (iCasilla >= 1 && iCasilla <= tableroDim && jCasilla >= 1 && jCasilla <= tableroDim) {
            if (tableroEnemigo.some(barco => barco.coordenadas.some(coordenada => coordenada.i === iCasilla && coordenada.j === jCasilla && coordenada.estado === 'Agua'))) {
              sonar[iVecino + 1][jVecino + 1] = 'Barco';
            } else if (minasEnemigas.some(mina => mina.i === iCasilla && mina.j === jCasilla && mina.estado === 'Agua')) {
              sonar[iVecino + 1][jVecino + 1] = 'Mina';
            } else {
              sonar[iVecino + 1][jVecino + 1] = 'Agua';
            }
          }
        }
      }

      // Actualizar turno
      partidaActual.contadorTurno++;

      // Comprobar si la partida ha terminado
      const finPartida = false; // No puede acabar la partida al usar el sónar
      
      let turnosIA = [];
      let finPartidaIA = false;
      // La IA no juega si no es el último misil de ráfaga
      if (partidaContraIA) {  // La IA juega siempre tras usar el sónar
        finPartidaIA = await juegaIA(jugador1, jugador2, partidaActual, estadisticasJugadores, turnosIA);
      }
      console.log('Sónar usado con éxito');
      // Actualizar la partida
      const partidaModificada = await Partida.findOneAndUpdate(
        filtro, // Filtrar
        partidaActual, // Actualizar (partida contiene los cambios)
        { new: true } // Para devolver el documento actualizado
      );

      if (partidaModificada) {
        let respuestaDisparo = {
          sonar: sonar,
          eventoOcurrido: undefined, // Evento ocurrido en la partida
          finPartida: finPartida,
          clima: partidaActual.clima,
          usosHab: jugador === 1 ? partidaActual.usosHab1 : partidaActual.usosHab2,
          turnosIA: turnosIA
        };

        // Actualizar estadisticas de los jugadores
        let nuevosTrofeos = [0, 0];
        const {mensajeError} = await actualizarEstadisticasTurno(nuevosTrofeos, partidaActual, estadisticasJugadores, jugador1, jugador2, partidaContraIA);
        if (mensajeError) {
          res.status(500).send(mensajeError);
          console.error(mensajeError);
          return;
        }

        // Si acaba la partida, devolver las estadisticas totales del jugador
        if (finPartida || finPartidaIA) {
          añadirEstadisticasEnRespuesta(respuestaDisparo, partidaActual, estadisticasJugadores, jugador, nuevosTrofeos);
        }
        res.json(respuestaDisparo);
        console.log("Partida modificada con éxito");
        return(respuestaDisparo);
      } else {
        res.status(404).send('No se ha encontrado la partida a actualizar');
        console.error("No se ha encontrado la partida a actualizar");
      }
    }
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error("Hubo un error");
  }
};

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
  try {
    const { codigo, nombreId, ...extraParam  } = req.body;
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera codigo y nombreId');
      console.error("Sobran parámetros, se espera codigo y nombreId");
      return;
    }
    if (!codigo) {
      res.status(400).send('Falta el codigo de partida');
      console.error("Falta el codigo de partida");
      return;
    }
    if (!nombreId) {
      res.status(400).send('Falta el nombreId del jugador');
      console.error("Falta el nombreId del jugador");
      return;
    }
    const filtro = { codigo: codigo };
    const partidaActual = await Partida.findOne(filtro);
    if (partidaActual) {
      if (partidaActual.nombreId1 !== nombreId && partidaActual.nombreId2 !== nombreId) {
        res.status(404).send('El jugador no está en la partida');
        console.error('El jugador no está en la partida');
        return;
      }
      let chatDevuelto = partidaActual.chat;
      for (let mensaje of chatDevuelto) {
        mensaje._id = undefined;
      }
      res.json(chatDevuelto);
      console.log('Chat obtenido con éxito');
    } else {
      res.status(404).send('Partida no encontrada');
      console.error('Partida no encontrada');
    }
  } catch (error) {
    res.status(500).send('Hubo un error');
    console.error('Hubo un error');
  }
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
  try {
    const { codigo, nombreId, mensaje, ...extraParam } = req.body;
    // Verificar si hay algún parámetro extra que no se espera
    if (Object.keys(extraParam).length > 0) {
      res.status(400).send('Sobran parámetros, se espera codigo, nombreId y mensaje');
      console.error("Sobran parámetros, se espera codigo, nombreId y mensaje");
      return;
    }
    // Verificar si alguno de los parámetros está ausente
    if (!codigo || !nombreId || !mensaje) {
      res.status(400).send('Falta alguno de los siguientes parámetros: codigo, nombreId, mensaje');
      console.error("Falta alguno de los siguientes parámetros: codigo, nombreId, mensaje");
      return;
    }
    // Verificar que existe la partida
    const filtro = { codigo: codigo };
    const partidaActual = await Partida.findOne(filtro);
    if (partidaActual) {
      if (partidaActual.nombreId1 !== nombreId && partidaActual.nombreId2 !== nombreId) {
        res.status(404).send('El jugador no está en la partida');
        console.error('El jugador no está en la partida');
        return;
      }
      partidaActual.chat.push({ mensaje, nombreId, timestamp: new Date() });

      // Actualizar la partida
      const partidaModificada = await Partida.findOneAndUpdate(
        filtro, // Filtrar
        partidaActual, // Actualizar (partida contiene los cambios)
        { new: true } // Para devolver el documento actualizado
      );
      if (partidaModificada) {
        let chatDevuelto = partidaModificada.chat;
        for (let mensaje of chatDevuelto) {
          mensaje._id = undefined;
        }
        res.json(chatDevuelto);
        console.log("Mensaje enviado con éxito");
      } else {
        res.status(404).send('No se ha encontrado la partida a actualizar');
        console.error("No se ha encontrado la partida a actualizar");
      }
    } else {
      console.error('Partida no encontrada');
      res.status(404).send('Partida no encontrada');
    }
  } catch (error) {
    console.error('Hubo un error', error);
    res.status(500).send('Hubo un error');
  }
};
