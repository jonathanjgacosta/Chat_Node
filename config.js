var express = require('express');

module.exports = function(app, io){

	// Definimos el .html como la extension por defecto para las plantillas
	app.set('view engine', 'html');

	// Inicializamos el motor de plantillas ejs
	app.engine('html', require('ejs').renderFile);

	// Luego le decimos a express la ruta en la cual encontrara las plantillas
	app.set('views', __dirname + '/views');

	//  Por ultimo hacemos los archivos estaticos disponibles a nuestra aplicacion 
	app.use(express.static(__dirname + '/public'));

};
