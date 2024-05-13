const app = require('./app')
const { initializeSocket } = require('./socketManager');
const { Server } = require('socket.io');
const mongoose = require('mongoose'); // Asegúrate de requerir mongoose
const PORT = 8080;


// Inicia el servidor express
const server = app.listen(PORT, () => {
    console.log(`Servidor web en el puerto ${PORT}.`);
});

// Inicializa Socket.io
initializeSocket(server);

server.closeAll = () => {
    mongoose.disconnect() // Cierra conexión a MongoDB
    .then(() => {
        console.log('Conexión a MongoDB cerrada');
        server.close(() => { // Cierra servidor web
            console.log('Servidor web cerrado');
        });
    })
    .catch((err) => {
        console.error('Error al cerrar la conexión a MongoDB', err);
    });
}

module.exports = server; // Exporta server para poder usarlo en otros archivos