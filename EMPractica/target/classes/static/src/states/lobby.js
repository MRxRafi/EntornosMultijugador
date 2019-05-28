Spacewar.lobbyState = function(game) {
	var inputChat
	this.MAX_NUM_SCORE=10
}

Spacewar.lobbyState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **LOBBY** state");
		}
	},

	preload : function() {

	},

	create : function() {
		showChat();
		inputChat = new inputText("rgb(0,130,130)", "white",
					"Mensaje:", "Enviar", 100);
		inputChat.submitButton.onclick = function(){
			if (inputChat.input.value !== "") {
				sendChatMessage(inputChat.input.value); // objects/functions.js 
			}
		}
		
		var titleStyle = {
				fill : "rgb(255,255,255)",
				font : "100px Chakra Petch",
				boundsAlignH : "center"
		};
		var style = {
			fill : "rgb(255,255,255)",
			font : "60px Chakra Petch",
			boundsAlignH : "center"
		};

		var styleScore = {
			fill : "rgb(255,255,255)",
			font : "40px Chakra Petch",
			boundsAlignH : "center"
		};
		nombre=game.add.text(10,10,"👤 "+game.global.myPlayer.name,styleScore);
		nombre.anchor.setTo(0,0)

		globalScore=game.add.text(10,60,game.global.myPlayer.globalScore +" 🌟",styleScore)
		globalScore.anchor.setTo(0,0)

		var titleText = game.add.text(0, 0, "Lobby", titleStyle);
		titleText.setTextBounds(0, 0, game.world.width, game.world.height);
		
		lobbyOptions = [ "Crear Partida", "Buscar Partida", "Volver" ];

		lobbyOptions = [ "Crear Partida", "Buscar Partida", "Volver" ];
		var y = game.canvas.height / 3;
		var yOffset = 80;
		var lobbyText = [];
		for (var i = 0; i < lobbyOptions.length; i++) {
			lobbyText[i] = game.add.text(0, y, lobbyOptions[i], style);
			lobbyText[i].setTextBounds(0, 0, game.world.width,
					game.world.height);
			// Añade detección de eventos en cada texto
			lobbyText[i].inputEnabled = true;
			lobbyText[i].events.onInputOver.add(mouseOver, this);
			lobbyText[i].events.onInputOut.add(mouseOut, this);
			// Indica a qué función llamar dependiendo de qué texto se trate
			switch (i) {
			case 0:
				lobbyText[i].events.onInputDown.add(this.crear, this);
				break;
			case 1:
				lobbyText[i].events.onInputDown.add(this.buscar, this);
				break;
			case 2:
				lobbyText[i].events.onInputDown.add(this.volver, this);
				break;
			}

			y += yOffset;
		}

		scoreText=[];
	    y=0;
		yOffset = 30;

		console.log(game.global.myRoom.scores)
		if(this.MAX_NUM_SCORE>game.global.myRoom.numJugadores){
			console.log(game.global.myRoom.numJugadores)
			numJug=game.global.myRoom.numJugadores
		}

		for(i=0;i<this.MAX_NUM_SCORE;i++){
			scoreText[i]=game.add.text(game.canvas.width-10,y,"",styleScores)
			
			console.log("aa: "+scoreText[i])
			scoreText[i].anchor.setTo(1,0)
			scoreText[i].fixedToCamera=true
			y+=yOffset
		}
	},
	
	update : function(){
		updateActivePlayers();
		updateGlobalScores()
		if(game.global.globalScores){
			globalScore.setText(game.global.myPlayer.globalScore+" 🌟")
			if(game.global.globalScores.length>this.MAX_NUM_SCORE){
				for(i=0;i<this.MAX_NUM_SCORE;i++){
					if(game.global.globalScores[i]){
						console.log(game.global.globalScores[i])
						scoreText[i].setText((i+1)+"º "+ game.global.globalScores[i].name+": "+game.global.globalScores[i].globalScore+" 🌟")
					}
				}
			}
			else{
				for(i=0;i<game.global.globalScores.length;i++){
					if(game.global.globalScores[i]){
						scoreText[i].setText((i+1)+"º "+ game.global.globalScores[i].name+": "+game.global.globalScores[i].globalScore+" 🌟")
					}						
				}
			}
			
		}
	},
	
	crear : function() {		
		if (typeof game.global.myPlayer.id !== 'undefined') {
			// Se crea una barra de texto
			inputRoom = new inputText("rgb(0,130,130)", "white",
			"Introduzca el nombre de la sala:", "Aceptar", 15);
			// Al pulsar el botón se asigna al nombre de la sala el valor
			// escrito en la barra de texto. Si no hay nada escrito salta una alerta
			inputRoom.submitButton.onclick = function() {
				if (inputRoom.input.value !== "") {
					//HAY QUE COMPROBAR QUE EL NOMBRE NO ESTÉ YA ESCOGIDO
					setRoomName(inputRoom.input.value); // objects/functions.js
					inputRoom.hide();
					hideChat();
				} else {
					alert("El nombre de la sala está vacío")
				}
			};
		}
	},

	buscar : function() {
		if (typeof game.global.myPlayer.id !== 'undefined') {
			hideChat();
			inputChat.hide();
			if(typeof inputRoom != 'undefined') inputRoom.hide();
			let message = {
				event : 'PARTIDAS'
			}
			game.global.socket.send(JSON.stringify(message))
		}
	},
	
	volver : function() {
		inputChat.hide();
		hideChat();
		game.state.start('menuState');
	}
}
