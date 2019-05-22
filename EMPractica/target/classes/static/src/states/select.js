Spacewar.selectRoomState = function(game) {
	style = {
		fill : "rgb(255,255,255)",
		font : "60px Chakra Petch",
		boundsAlignH : "center"
	},
	index=0,
	numPartidas=7,
	tick=0,
	y=20,
	yOffset= 80,
	gameText=[]
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
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **SELECTROOM** state CREATE");
		}  
		console.log(game.global.gameList.length)
		 // Crea el texto de las opciones del menú		 


		for(var i= 0; i<numPartidas; i++)
		{
			if(i<game.global.gameList.length){
			gameText[i] = game.add.text(0, y, "["+(i+1)+"] "+game.global.gameList[i].sala, style);
			gameText[i].setTextBounds(0,0,game.world.width,game.world.height);
			// Añade detección de eventos en cada texto
			gameText[i].inputEnabled = true;
			gameText[i].events.onInputOver.add(mouseOver,this);
			gameText[i].events.onInputOut.add(mouseOut,this);
			}
			else{
			gameText[i] = game.add.text(0, y, "", style);
			gameText[i].setTextBounds(0,0,game.world.width,game.world.height);
			// Añade detección de eventos en cada texto
			gameText[i].inputEnabled = true;
			gameText[i].events.onInputOver.add(mouseOver,this);
			gameText[i].events.onInputOut.add(mouseOut,this);
			}

			
			y+= yOffset;
		}
		y=20
		console.log(gameText)
	},

	update : function() {
		if(tick===300){
			if (typeof game.global.myPlayer.id !== 'undefined') {
			
				let message = {
					event : 'UPDATE PARTIDAS'
				}
				game.global.socket.send(JSON.stringify(message))
			}
			tick=0
			gameText[0].setText(gameText[0]+"aa")
		}
		var auxIndex=index;
		
		for(var i= 0; i<numPartidas; i++)
		{
			if(i<game.global.gameList.length){
				gameText[i].setText("["+(i+1)+"] "+game.global.gameList[i].sala)
			}
			else{
				gameText[i].setText("")
			}
		}
		
		tick++;
	}
}