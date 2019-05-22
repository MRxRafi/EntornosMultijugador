Spacewar.lobbyState = function(game) {

}

Spacewar.lobbyState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **LOBBY** state");
		}
	},

	preload : function() {

	},

	create : function() {
		var style = {
			fill : "rgb(255,255,255)",
			font : "60px Chakra Petch",
			boundsAlignH : "center"
		};

		lobbyOptions = [ "Crear Partida", "Buscar Partida" ];
		var y = game.canvas.height / 3;
		var yOffset = 80;
		var lobbyText = [];
		for (var i = 0; i < lobbyOptions.length; i++) {
			lobbyText[i] = game.add.text(0, y, lobbyOptions[i], style);
			lobbyText[i].setTextBounds(0, 0, game.world.width,
					game.world.height);
			// Añade detección de eventos en cada texto
			lobbyText[i].inputEnabled = true;
			lobbyText[i].events.onInputOver.add(mouseOver, this);
			lobbyText[i].events.onInputOut.add(mouseOut, this);
			// Indica a qué función llamar dependiendo de qué texto se trate
			switch (i) {
			case 0:
				lobbyText[i].events.onInputDown.add(this.crear, this);
				break;
			case 1:
				lobbyText[i].events.onInputDown.add(this.buscar, this);
				break;
			}

			y += yOffset;
		}
		// game.state.start('matchmakingState')
	},

	crear : function() {
		if (typeof game.global.myPlayer.id !== 'undefined') {
			// Se crea una barra de texto
			var inputRoom = new inputText("rgb(0,130,130)", "white",
					"Introduzca el nombre de la sala:", "Aceptar");
			// Al pulsar el botón se asigna al nombre de la sala el valor
			// escrito en la barra de texto. Si no hay nada escrito salta una alerta
			inputRoom.submitButton.onclick = function() {
				if (inputRoom.input.value !== "") {
					setRoomName(inputRoom.input.value); // objects/functions.js
					inputRoom.hide();
				} else {
					alert("El nombre de la sala está vacío")
				}
			};
		}
	},

	buscar : function() {
		if (typeof game.global.myPlayer.id !== 'undefined') {

			let message = {
				event : 'PARTIDAS'
			}
			game.global.socket.send(JSON.stringify(message))
		}
	}
}