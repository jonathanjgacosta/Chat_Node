var express = require('express'),
	app = express();

// Linea para correr la aplicacion en Heroku, de lo contrario se sirve por el puerto 8080

var port = process.env.PORT || 8080;

//  Inicializa un nuevo objeto de tipo socket.io el cual esta atado al objeto app de express
// para que puedan coexistir sin problemas  

var io = require('socket.io').listen(app.listen(port));

// Se hace el require a los archivos rutas y config.
// Se envian los objetos app e io como argumentos a las funciones retornadas

require('./config')(app, io);
require('./rutas')(app, io);

console.log('La aplicación se esta ejecutando en http://localhost:' + port);