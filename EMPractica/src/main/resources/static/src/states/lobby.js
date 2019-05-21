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

		lobbyOptions=["Crear Partida", "Buscar Partida"];
        var y=game.canvas.height/3;
        var yOffset= 80;
        var lobbyText=[];
        for(var i= 0; i<lobbyOptions.length; i++)
            {
               lobbyText[i] = game.add.text(0, y, lobbyOptions[i], style);
               lobbyText[i].setTextBounds(0,0,game.world.width,game.world.height);
               // Añade detección de eventos en cada texto
               lobbyText[i].inputEnabled = true;
               lobbyText[i].events.onInputOver.add(mouseOver,this);
               lobbyText[i].events.onInputOut.add(mouseOut,this);
                // Indica a qué función llamar dependiendo de qué texto se trate
                switch(i){
                    case 0:
                        lobbyText[i].events.onInputDown.add(this.crear,this);
                        break;
                    case 1:
                        lobbyText[i].events.onInputDown.add(this.buscar,this);
                        break;
                }

                y+= yOffset;
            }
		//game.state.start('matchmakingState')
	},

	crear : function() {
		if (typeof game.global.myPlayer.id !== 'undefined') {
<<<<<<< HEAD

			inputAnotherRoomName(); // objects/functions.js
=======
			var valido=false;
			while(!valido){
				let name = window.prompt("Introduzca su nombre de sala: ");
				let message = {
					event : 'CREATE ROOM',
					sala: name
				}
				game.global.socket.send(JSON.stringify(message))
				valido=game.global.validRoom;
			}
			game.state.start('roomState')
>>>>>>> a65316bee685a668b4f7fd6db5495d656ff98a90
		}
	},

	buscar : function() {
		if (typeof game.global.myPlayer.id !== 'undefined') {
			game.state.start('selectRoomState')
		}
	},
}