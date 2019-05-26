Spacewar.roomState = function(game) {
	tick=0,
	MAX_JUGADORES = 5
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

		numJugText = game.add.text(0, game.canvas.height/3 + 80, game.global.myRoom.numJugadores + '/' + MAX_JUGADORES +"👥", style)
		numJugText.setTextBounds(0,0,game.world.width,game.world.height);
		
		if(game.global.myPlayer.id==game.global.myRoom.idHost){
			StartText=game.add.text(0, game.canvas.height/3, 'START', style);
			// Añade detección de eventos en cada texto
			StartText.inputEnabled = true;
			StartText.events.onInputOver.add(mouseOver,this);
			StartText.events.onInputOut.add(mouseOut,this);
			StartText.events.onInputDown.add(this.startGame,this);
		}
		else{
			StartText=game.add.text(0, game.canvas.height/3, 'Waiting Host', style);
			
		}
		StartText.setTextBounds(0,0,game.world.width,game.world.height);
		
	},

	update : function() {
		updateNumPlayers();
		
		numJugText.setText(game.global.myRoom.numJugadores + '/' + MAX_JUGADORES+"👥")
		
		if(game.global.myPlayer.id!==game.global.myRoom.idHost){
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
			
			let message = {
				event : 'START GAME',
				room : game.global.myPlayer.room
			}
			game.global.socket.send(JSON.stringify(message))
			
		} else {
			
			
			if(game.global.myRoom.numJugadores == MAX_JUGADORES){
				
				this.startGame();
			}
		}
		
		
	},

	startGame: function(){
		let message = {
			event : 'START GAME',
			room : game.global.myPlayer.room,
			empezar: true
		}
		game.global.socket.send(JSON.stringify(message))
	}
}
