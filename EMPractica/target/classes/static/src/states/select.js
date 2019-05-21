Spacewar.selectRoomState = function(game) {

}

Spacewar.selectRoomState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **SELECTROOM** state");
		}
	},

	preload : function() {

	},

	create : function() {
        let message = {
            event : 'PARTIDAS'
        }
        game.global.socket.send(JSON.stringify(message))
		console.log(game.global.gameList)
	},

	update : function() {
		//game.state.start('gameState')
	}
}