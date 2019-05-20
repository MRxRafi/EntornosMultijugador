Spacewar.matchmakingState = function(game) {

}

Spacewar.matchmakingState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **MATCH-MAKING** state");
		}
	},

	preload : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Joining room...");
		}
		
		let name = window.prompt("Introduzca su nombre de usuario: ");
		game.global.myPlayer.name = name;
		
		let message = {
			event : 'JOIN ROOM',
			playerName : game.global.myPlayer.name
		}
		game.global.socket.send(JSON.stringify(message))
	},

	create : function() {

	},

	update : function() {
		if (typeof game.global.myPlayer.room !== 'undefined') {
			if (game.global.DEBUG_MODE) {
				console.log("[DEBUG] Joined room " + game.global.myPlayer.room);
			}
			game.state.start('roomState')
		}
	}
}