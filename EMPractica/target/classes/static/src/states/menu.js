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
		let name = window.prompt("Introduzca su nombre de usuario: ");
		game.global.myPlayer.name = name;
		
		let message = {
			event : 'PLAYER NAME',
			playerName : game.global.myPlayer.name
		}
		game.global.socket.send(JSON.stringify(message))
		// Crea el texto del Título
        var titleText = game.add.text(0,0,"SPACE WAR",titleStyle);
        titleText.setTextBounds(0,0,game.world.width,game.world.height);
        
        // Crea el texto de las opciones del menú
        menuOptions=["Jugar", "Opciones"];
        var y=game.canvas.height/3;
        var yOffset= 80;
        var menuText=[];
        for(var i= 0; i<menuOptions.length; i++)
            {
                menuText[i] = game.add.text(0, y, menuOptions[i], style);
                menuText[i].setTextBounds(0,0,game.world.width,game.world.height);
                // Añade detección de eventos en cada texto
                menuText[i].inputEnabled = true;
                menuText[i].events.onInputOver.add(mouseOver,this);
                menuText[i].events.onInputOut.add(mouseOut,this);
                // Indica a qué función llamar dependiendo de qué texto se trate
                switch(i){
                    case 0:
                        menuText[i].events.onInputDown.add(this.play,this);
                        break;
                    case 1:
                        // menuText[i].events.onInputDown.add(this.options,this);
                        break;
                }

                y+= yOffset;
            }
	},

	play : function() {
		if (typeof game.global.myPlayer.id !== 'undefined') {
			game.state.start('lobbyState')
		}
	},
	
	options : function() {
		
	},
}