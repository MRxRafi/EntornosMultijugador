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
		
		
		let message = {
			event : 'JOIN ROOM',
			room : 'game'
		}
		game.global.socket.send(JSON.stringify(message))
	},

	create : function() {
		

	},

	update : function() {
		if (game.global.myPlayer.room === 'game') {
			if (game.global.DEBUG_MODE) {
				console.log("[DEBUG] Joined game " + game.global.myPlayer.room);
			}
			game.state.start('gameState')
		}
	}
}