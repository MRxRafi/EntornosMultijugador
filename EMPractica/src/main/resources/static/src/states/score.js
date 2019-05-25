Spacewar.scoreState = function(game) {
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
	var y = game.canvas.height / 3;
	var yOffset = 80;
}

Spacewar.menuState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **Score** state");
		}		
	},

	preload : function() {

	},

	create : function() {
		
		// Crea el texto del Título
		var titleText = game.add.text(0, 0, "PUNTUACIÓN", titleStyle);
		titleText.setTextBounds(0, 0, game.world.width, game.world.height);
		//Puntuación del Jugador
		var scoreText = game.add.text(0, y, game.global.myPlayer.score, style);
		scoreText.setTextBounds(0, 0, game.world.width, game.world.height);
		//Botón para volver atrás
		var returnText = game.add.text(0, y + yOffset, menuOptions[i], style);
		returnText.setTextBounds(0, 0, game.world.width, game.world.height);
		
		returnText.inputEnabled = true;
		returnText.events.onInputOver.add(mouseOver, this);
		returnText.events.onInputOut.add(mouseOut, this);
		returnText.events.onInputDown.add(this.volver, this);

	},

	volver : function() {
		sendScore();
		game.state.start("menuState");
	}

}