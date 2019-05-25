Spacewar.selectRoomState = function(game) {
	style = {
		fill : "rgb(255,255,255)",
		font : "60px Chakra Petch",
		boundsAlignH : "center"
	},
	index=0,
	numPartidas=100,
	tick=0,
	y=20,
	yOffset= 80,
	gameText=[],
	room='undefined'
}


Spacewar.selectRoomState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **SELECTROOM** state");
		}
		
		game.kineticScrolling = game.plugins.add(Phaser.Plugin.KineticScrolling);
		game.kineticScrolling.configure({
		    kineticMovement: true,
		    timeConstantScroll: 325, //really mimic iOS
		    horizontalScroll: false,
		    verticalScroll: true,
		    horizontalWheel: false,
		    verticalWheel: true,
		    deltaWheel: 40
		});
		
		index=0,
		tick=0
		gameText=[]
		room='undefined'
	},

	preload : function() {

	},

	create : function() {
		y=20
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **SELECTROOM** state CREATE");
		}  
		console.log(game.global.gameList.length)
		 // Crea el texto de las opciones del menú		 

		game.kineticScrolling.start(); //Comenzamos el scroll
		for(var i= 0; i<numPartidas; i++)
		{
			if(i<game.global.gameList.length){
				console.log(game.global.gameList[i].numJug)
				gameText[i] = game.add.text(0, y, "["+(i+1)+"] "+game.global.gameList[i].sala+" -> "+game.global.gameList[i].numJug+"/30", style);
				gameText[i].setTextBounds(0,0,game.world.width,game.world.height);
				// Añade detección de eventos en cada texto
				gameText[i].inputEnabled = true;
				gameText[i].events.onInputOver.add(mouseOver,this);
				gameText[i].events.onInputOut.add(mouseOut,this);
				gameText[i].events.onInputDown.add(this.select, {sigSala:game.global.gameList[i].sala});
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
		game.world.setBounds(0, 0, game.width, yOffset*game.global.gameList.length+20);
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
			console.log(game.global.gameList.length)
		}
		var auxIndex=index;
		
		for(var i= 0; i<numPartidas; i++)
		{
			if(i<game.global.gameList.length){
				gameText[i].setText("["+(i+1)+"] "+game.global.gameList[i].sala+" -> "+game.global.gameList[i].numJug+"/30")
				gameText[i].events.onInputDown.add(this.select, {sigSala:game.global.gameList[i].sala});
			}
			else{
				gameText[i].setText("")
			}
		}
		game.world.setBounds(0, 0, game.width, yOffset*game.global.gameList.length+20);
		//console.log("G "+game.global.myPlayer.room)
		//console.log(room)
		if (game.global.myPlayer.room === room) {
			if (game.global.DEBUG_MODE) {
				console.log("[DEBUG] Joined room " + game.global.myPlayer.room);
			}
			game.kineticScrolling.stop(); //Paramos el scroll
			game.state.start('roomState')
		}

		tick++;
	},

	select : function() {
		room=this.sigSala
		if (typeof game.global.myPlayer.id !== 'undefined') {
			console.log(this.sigSala)
			let message = {
				event : 'JOIN ROOM',
				room: this.sigSala
				//nJug: this.numJugs
			}
			game.global.socket.send(JSON.stringify(message))
		}
	}
}