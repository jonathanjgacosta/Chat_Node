
module.exports = function(app,io){

	app.get('/', function(req, res){

		res.render('home');
	});


	app.get('/crear', function(req,res){

		// Generamos un ID unico para el chat
		var id = Math.round((Math.random() * 1000000));

		// Redireccionamos al chat aleatorio
		res.redirect('/chat/'+id);
	});

	app.get('/chat/:id', function(req,res){

		// Servimos la vista chat.html
		res.render('chat');
	});



	// inicializamos la aplicacion de socket
	var chat = io.on('connection', function (socket) {

		socket.on('load',function(data){

			var room = obtenerSocketCliente(io,data);

			if(room.length === 0 ) {

				socket.emit('personasEnChat', {number: 0});
			}

			else if(room.length === 1) {

				socket.emit('personasEnChat', {
					number: 1,
					user: room[0].username,
					avatar: room[0].avatar,
					id: data
				});
			}

			else if(room.length >= 2) {

				chat.emit('muchasUsuarios', {boolean: true});
			}

		});


		socket.on('login', function(data) {

			var room = obtenerSocketCliente(io, data.id);

		
			// Validamos que solo dos personas puedan entrar al chat
			if (room.length < 2) {

				// Usamos el objeto del socket para almacenar la data del usuario

				socket.username = data.user;
				socket.room = data.id;

				// Añadimos la persona al chat
				socket.join(data.id);

				if (room.length == 1) {

					var usernames = [],
						avatars = [];

					usernames.push(room[0].username);
					usernames.push(socket.username);

					avatars.push(room[0].avatar);
					avatars.push(socket.avatar);


					chat.in(data.id).emit('iniciarChat', {
						boolean: true,
						id: data.id,
						users: usernames,
						avatars: avatars
					});
				}
			}
			else {
				socket.emit('muchasUsuarios', {boolean: true});
			}
		});


		socket.on('disconnect', function() {

			socket.broadcast.to(this.room).emit('dejarChat', {
				boolean: true,
				room: this.room,
				user: this.username,
				avatar: this.avatar
			});


			socket.leave(socket.room);
		});


		socket.on('mensaje', function(data){

			// Cuando el servidor recibe un mensaje, lo envia a la otra persona en el chat
			socket.broadcast.to(socket.room).emit('recibir', {msg: data.msg, user: data.user, img: data.img});
		});
	});


};


function obtenerSocketCliente(io,roomId, namespace) {
	var res = [],
		ns = io.of(namespace ||"/");  

	if (ns) {
		for (var id in ns.connected) {
			if(roomId) {
				var index = ns.connected[id].rooms.indexOf(roomId) ;
				if(index !== -1) {
					res.push(ns.connected[id]);
				}
			}
			else {
				res.push(ns.connected[id]);
			}
		}
	}
	return res;
}
