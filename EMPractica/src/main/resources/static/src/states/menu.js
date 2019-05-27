Spacewar.menuState = function(game) {

}

Spacewar.menuState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **MENU** state");
		}
	},

	preload : function() {
		// In case JOIN message from server failed, we force it
		if (typeof game.global.myPlayer.id == 'undefined') {
			if (game.global.DEBUG_MODE) {
				console.log("[DEBUG] Forcing joining server...");
			}
			let message = {
				event : 'JOIN'
			}
			game.global.socket.send(JSON.stringify(message))
		}
	},

	create : function() {
		// Se crea una barra de texto
		game.global.myPlayer.continue=false;
		if(!game.global.myPlayer.name){
			inputName = new inputText("rgb(0,130,130)", "white",
			"Introduzca su nombre de usuario:", "Aceptar", 15);
			// Al pulsar el botón se asigna al nombre del jugador el valor escrito
			// en la barra de texto. Si no hay nada escrito salta una alerta
			inputName.submitButton.onclick = function() {
				if (inputName.input.value !== "") {
					setPlayerName(inputName.input.value); // objects/functions.js
					console.log(game.global.myPlayer.name)
				
				} else {
					alert("El nombre de usuario está vacío")
				}
			}
			
		};

		// Estilos de texto
		var titleStyle = {
			fill : "rgb(255,255,255)",
			font : "100px Chakra Petch",
			boundsAlignH : "center"
		};
		var style = {
			fill : "rgb(255,255,255)",
			font : "60px Chakra Petch",
			boundsAlignH : "center"
		};
		// Se pide un nombre de usuario y se envía al servidor

		// Crea el texto del Título
		var titleText = game.add.text(0, 0, "SPACE WAR", titleStyle);
		titleText.setTextBounds(0, 0, game.world.width, game.world.height);

		// Crea el texto de las opciones del menú
		menuOptions = [ "Jugar", "Opciones" ];
		var y = game.canvas.height / 3;
		var yOffset = 80;
		var menuText = [];
		for (var i = 0; i < menuOptions.length; i++) {
			menuText[i] = game.add.text(0, y, menuOptions[i], style);
			menuText[i]
					.setTextBounds(0, 0, game.world.width, game.world.height);
			// Añade detección de eventos en cada texto
			menuText[i].inputEnabled = true;
			menuText[i].events.onInputOver.add(mouseOver, this);
			menuText[i].events.onInputOut.add(mouseOut, this);
			// Indica a qué función llamar dependiendo de qué texto se trate
			switch (i) {
			case 0:
				menuText[i].events.onInputDown.add(this.play, this);
				break;
			case 1:
				menuText[i].events.onInputDown.add(this.closeSession,this);
				break;
			}

			y += yOffset;
		}
	},

	update : function(){
		if(game.global.myPlayer.name){
			inputName.hide();
		}
	},
	
	play : function() {
		// Si el jugador tiene un id y un nombre asignado, pasa al siguiente
		// estado
		if (typeof game.global.myPlayer.id !== 'undefined'
				&& typeof game.global.myPlayer.name !== 'undefined') {
			game.state.start('lobbyState')
		} else {
			alert("Inserte su nombre de usuario");
		}
	},

	//Si se ha iniciado sesión con un nombre se borra y se vuelve a pedir
	closeSession : function() {
		if (typeof game.global.myPlayer.id !== 'undefined'
				&& typeof game.global.myPlayer.name !== 'undefined') {
			game.global.myPlayer.name = 'undefined';
			var inputName = new inputText("rgb(0,130,130)", "white",
					"Introduzca su nombre de usuario:", "Aceptar", 15);

			inputName.submitButton.onclick = function() {
				if (inputName.input.value !== "") {
					setPlayerName(inputName.input.value); // objects/functions.js
				} else {
					alert("El nombre de usuario está vacío")
				}
			}
			
		} else {
			alert("Debes iniciar sesión para poder cerrarla");
		}
	}
}
