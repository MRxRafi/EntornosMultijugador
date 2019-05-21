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
		
		
		let message = {
			event : 'JOIN ROOM',
			room : 'room'
		}
		game.global.socket.send(JSON.stringify(message))
	},

	create : function() {

	},

	update : function() {
		if (game.global.myPlayer.room === 'room') {
			if (game.global.DEBUG_MODE) {
				console.log("[DEBUG] Joined room " + game.global.myPlayer.room);
			}
			game.state.start('roomState')
		}
	}
}