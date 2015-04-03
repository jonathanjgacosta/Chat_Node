
$(function(){


	var id = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);

	// Nos conectamos al socket
	var socket = io();
	
	// Variables para cada usuario logeado
	var nombre = "",
		email = "",
		imagen = "",
		amigo = "";

var section = $(".section"),
		footer = $("footer"),
		conectado = $(".conectado"),
		invitarAmigo = $(".invitarAmigo"),
		usuarioEnChat = $(".usuarioEnChat"),
		ventanaChats = $(".ventanaChats"),
		dejoChat = $(".dejoChat"),
		sinMensajes = $(".sinMensajes"),
		muchasPersonas = $(".muchasPersonas");


	var usuarioChat = $(".usuario-chat"),
		dejoChatNombre = $(".dejoChatNombre"),
		formLogin = $(".FormLogin"),
		tuNombre = $("#nombre"),
		tuEmail = $("#email"),
		nombre2 = $("#nombre2"),
		email2 = $("#email2"),
		formChat = $("#formChat"),
		mensaje = $("#mensaje"),
		tiempoEnviado = $(".tiempoEnviado"),
		chats = $(".chat");

	var ownerImage = $("#ownerImage"),
		dejoChatImagen = $("#dejoChatImagen"),
		ImagenNoMensajes = $("#ImagenNoMensajes");

	// si hay conexion con el servidor obtenemos el ID del chat

	socket.on('connect', function(){

		socket.emit('load', id);
	});


	// Recibimos los nombres y avatares de todos los usuarios en el chat
	socket.on('personasEnChat', function(data){

		if(data.number === 0){

			mostrarMensaje("conectado");

			formLogin.on('submit', function(e){

				e.preventDefault();

				nombre = $.trim(tuNombre.val());
				imagen = "../img/user.png";
				
				if(nombre.length < 6){
					alert("Por favor ingrese un usuario mayor de 6 caracteres");
					return;
				}

				email = tuEmail.val();

				if(!ValidarCorreo(email)) {
					alert("Por favor ingrese un correo valido");
				}
				else {

					mostrarMensaje("invitarAmigo");

					socket.emit('login', {user: nombre, avatar: imagen, id: id});
				}
			
			});
		}

		else if(data.number === 1) {

			mostrarMensaje("personasEnChat",data);

			formLogin.on('submit', function(e){

				e.preventDefault();

				nombre = $.trim(nombre2.val());
				imagen = "../img/user2.png";

				if(nombre.length < 6){
					alert("Por favor ingrese un usuario mayor de 6 caracteres");
					return;
				}

				if(nombre == data.user){
					alert("El nombre de usuario \"" + nombre + "\" ya existe en este chat");
					return;
				}
				email = email2.val();

				if(!ValidarCorreo(email)){
					alert("Por favor ingrese un correo valido");
				}
				else {

					socket.emit('login', {user: nombre, avatar: imagen, id: id});
				}

			});
		}

		else {
			mostrarMensaje("muchasPersonas");
		}

	});

	socket.on('iniciarChat', function(data){
		console.log(data.users[1]);
		if(data.boolean && data.id == id) {

			chats.empty();

			if(nombre === data.users[0]) {

				mostrarMensaje("usuarioSinMensajes",data);
			}
			else {

				mostrarMensaje("invitadoSinMensajes",data);
			}

			usuarioChat.text(amigo);
		}
	});



	socket.on('recibir', function(data){

		mostrarMensaje('chatEmpieza');

		if(data.msg.trim().length) {
			crearMensaje(data.msg, data.user, data.img, moment());
			scrollMensaje();
		}
	});


		mensaje.keypress(function(e){

		if(e.which == 13) {
			e.preventDefault();
			formChat.trigger('submit');
		}

	});


			formChat.on('submit', function(e){

		e.preventDefault();


		mostrarMensaje("chatEmpieza");

		if(mensaje.val().trim().length) {
			crearMensaje(mensaje.val(), nombre, imagen, moment());
			scrollMensaje();

			socket.emit('mensaje', {msg: mensaje.val(), user: nombre, img: imagen});

		}

		mensaje.val("");
	});



	setInterval(function(){

		tiempoEnviado.each(function(){
			var each = moment($(this).data('time'));
			$(this).text(each.fromNow());
		});

	},60000);




	function crearMensaje(msg,user,img,now){

		var quien = '';

		if(user===nombre) {
			quien = 'usuario';
		}
		else {
			quien = 'invitado';
		}

		var li = $(
			'<li class=' + quien + '>'+
				'<div class="image">' +
					'<img src=' + img + ' />' +
					'<b></b>' +
					'<i class="tiempoEnviado" data-time=' + now + '></i> ' +
				'</div>' +
				'<p></p>' +
			'</li>');


		li.find('p').text(msg);
		li.find('b').text(user);

//añadimos al dom el mensaje

		chats.append(li);

		tiempoEnviado = $(".tiempoEnviado");
		tiempoEnviado.last().text(now.fromNow());
	}



	socket.on('dejarChat',function(data){

		if(data.boolean && id==data.room){

			mostrarMensaje("usuarioDejoChat", data);
			chats.empty();
		}

	});

	socket.on('muchasUsuarios', function(data){

		if(data.boolean && name.length === 0) {

			mostrarMensaje('muchasPersonas');
		}
	});

function ValidarCorreo(correo) {

		var expregular = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return expregular.test(correo);
	}


	function scrollMensaje(){
		$("html, body").animate({ scrollTop: $(document).height()-$(window).height() },1000);
	}

function mostrarMensaje(status,data){

		if(status === "conectado"){

			section.children().css('display', 'none');
			conectado.fadeIn(1200);
		}

		else if(status === "invitarAmigo"){

			$("#link").text(window.location.href);

			conectado.fadeOut(1200, function(){
				invitarAmigo.fadeIn(1200);
			});
		}

		else if(status === "personasEnChat"){

			conectado.css("display", "none");
			usuarioEnChat.fadeIn(1200);

			usuarioChat.text(data.user);

		}

		else if(status === "usuarioSinMensajes") {

				invitarAmigo.fadeOut(1200,function(){
					sinMensajes.fadeIn(1200);
					footer.fadeIn(1200);
				});

			amigo = data.users[1];
			ImagenNoMensajes.attr("src","../img/user2.png");
		}

		else if(status === "invitadoSinMensajes") {

			usuarioEnChat.fadeOut(1200,function(){
				invitarAmigo.fadeOut(1200);
				sinMensajes.fadeIn(1200);
				footer.fadeIn(1200);
			});

             amigo = data.users[0];
			ImagenNoMensajes.attr("src","../img/user.png");
		}

		else if(status === "chatEmpieza"){

			section.children().css('display','none');
			ventanaChats.css('display','block');
		}

		else if(status === "usuarioDejoChat"){

			dejoChatImagen.attr("src",data.avatar);
			dejoChatNombre.text(data.user);

			section.children().css('display','none');
			footer.css('display', 'none');
			dejoChat.fadeIn(1200);
		}

		else if(status === "muchasPersonas") {

			section.children().css('display', 'none');
			muchasPersonas.fadeIn(1200);
		}
	}


});