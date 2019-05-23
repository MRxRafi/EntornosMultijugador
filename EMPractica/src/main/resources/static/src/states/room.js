Spacewar.roomState = function(game) {
	thick=0
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

		if(game.global.myPlayer.id==game.global.myRoom.idHost){
			StartText=game.add.text(0, game.canvas.height/2, 'START', style);
			// Añade detección de eventos en cada texto
			StartText.inputEnabled = true;
			StartText.events.onInputOver.add(mouseOver,this);
			StartText.events.onInputOut.add(mouseOut,this);
			StartText.events.onInputDown.add(this.startGame,this);
		}
		else{
			StartText=game.add.text(0, game.canvas.height/2, 'Waiting Host', style);
		}
		StartText.setTextBounds(0,0,game.world.width,game.world.height);
	},

	update : function() {
		
		if(game.global.myPlayer.id!==game.global.myRoom.idHost){
			console.log(tick)
			if(tick==60){
				StartText.setText('Waiting Host .')
			}
			if(tick==120){
				StartText.setText('Waiting Host ..')
			}
			if(tick==180){
				StartText.setText('Waiting Host ...')
				tick=0;
			}
			tick++
		}
		
	},

	startGame: function(){
		let message = {
			event : 'START GAME',
			room : game.global.myPlayer.room
		}
		game.global.socket.send(JSON.stringify(message))
	}
}