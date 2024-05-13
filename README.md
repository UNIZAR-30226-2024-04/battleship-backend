# Battleship Project - Hamilton Games

## Intalación de dependencias
Ejecutar el siguiente comando:
```
npm install
```

## Documentación
Para generar la documentación, ejecutar el siguiente comando:
```
npm run docs
```
Se generarán en la carpeta _docs_ y se puede abrir el _index.html_ desde cualquier navegador.

## Testing
Los tests unitarios de Node y la base de datos se encuentran en la carpeta _tests_ y se ejecutan automáticamente con un workflow mediante _Github Actions_. Para ejecutarlos manualmente, utilizar _Node Packet Manager_:
```
npm test
```
Los tests ejecutados son:
- _perfilController.test.js_ con las pruebas de la API ofrecida para el manejo de perfiles con sus estadísticas, mazos, barcos, solicitudes y listas de amigos.
- _partidaController.test.js_ con las pruebas de la API ofrecida para el manejo de partidas con los disparos, actualizaciones y chat interno.
- _publicacionController.test.js_ con las pruebas de la API ofrecida para el manejo de publicaciones predefinidas de los usuarios, así como las reacciones.
- _chatController.test.js_ PENDING



## Autores
| Nombre       | NIP     | 
|--------------|--------|
| Luis Palazón Simón | 795062 |
| Carlos Paesa Lía | 798974 | 
| Álvaro De La Asunción Deza | 798996 | 
| Pablo Jesús Bueno Ereza | 799101 | 
| Santiago Illa Criado | 805798 | 
| Javier Cuesta Cocera | 806895 | 
| Nerea Salamero Labara | 820632 | 
| Ming Tao Ye | 839757 | 
