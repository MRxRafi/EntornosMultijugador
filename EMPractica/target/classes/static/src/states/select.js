<<<<<<< HEAD
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

        console.log("----------------------------------------")
        console.log(message)

	},

	update : function() {
		//game.state.start('gameState')
	}
=======
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

        console.log("----------------------------------------")
        console.log(message)

	},

	update : function() {
		//game.state.start('gameState')
	}
>>>>>>> a65316bee685a668b4f7fd6db5495d656ff98a90
}