Spacewar.roomState = function(game) {

}

Spacewar.roomState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **ROOM** state");
		}
	},

	preload : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Joining game...");
		}
			
	},

	create : function() {
		var style = {
			fill : "rgb(255,255,255)",
			font : "60px Chakra Petch",
			boundsAlignH : "center"
		};

		StartText=game.add.text(0, game.canvas.height/2, 'START', style);
		StartText.setTextBounds(0,0,game.world.width,game.world.height);
		// Añade detección de eventos en cada texto
		StartText.inputEnabled = true;
		StartText.events.onInputOver.add(mouseOver,this);
		StartText.events.onInputOut.add(mouseOut,this);
		StartText.events.onInputDown.add(this.startGame,this);

	},

	update : function() {
	},

	startGame: function(){
		let message = {
			event : 'START GAME',
			room : game.global.myPlayer.room
		}
		game.global.socket.send(JSON.stringify(message))
	}
}