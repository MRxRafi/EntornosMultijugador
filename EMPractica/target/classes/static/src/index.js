window.onload = function() {

	game = new Phaser.Game(1024, 600, Phaser.AUTO, 'gameDiv')

	// GLOBAL VARIABLES
	game.global = {
		FPS : 30,
		DEBUG_MODE : true,
		socket : null,
		myPlayer : new Object(),
		myRoom : new Object(),
		myInterface : new Object(),
		otherPlayers : [],
		gameList : [],
		validRoom: false,
		projectiles : [],
		idHost:-1,
		globalScores: []
	}

	game.global.myInterface.otherPlayers = []
	
	// WEBSOCKET CONFIGURATOR
	game.global.socket = new WebSocket("ws://" + window.location.host +"/spacewar")
	//game.global.socket = new WebSocket("ws://25.61.250.43:8080/spacewar")
	
	game.global.socket.onopen = () => {
		if (game.global.DEBUG_MODE) {
			console.log('[DEBUG] WebSocket connection opened.')
		}
	}

	game.global.socket.onclose = () => {
		if (game.global.DEBUG_MODE) {
			console.log('[DEBUG] WebSocket connection closed.')
		}
		
		//Si la conexión se cierra, deberíamos volver al menú.
	}
	
	game.global.socket.onmessage = (message) => {
		var msg = JSON.parse(message.data)
		
		switch (msg.event) {
		case "UPDATE GLOBAL SCORE":
				if (game.global.DEBUG_MODE) {
					console.log('[DEBUG] UPDATE GLOBAL SCORE message recieved')
					console.dir(msg)
				}
				var lista=JSON.parse(msg.globalScore)
				game.global.globalScores=lista
				game.global.myPlayer.globalScore=msg.myGlobalScore
				console.log(game.global.globalScores)
		case "ADD NAME":
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] ADD NAME message recieved')
				console.dir(msg)
			}
			if(msg.isAdded){
				game.global.myPlayer.name=msg.playerName;
			}
			else{
				if(!game.global.myPlayer.name){
					alert("Nombre escogido no valido")
				}
			}

			break;
		case 'PARTIDAS':
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] PARTIDAS message recieved')
				console.dir(msg)
			}
			var lista=JSON.parse(msg.partidas)
			console.log(lista)
			game.global.gameList=lista;	
			console.log(game.global.gameList)
			game.state.start('selectRoomState')		
			break;
		case 'UPDATE PARTIDAS':
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] PARTIDAS message recieved')
				console.dir(msg)
			}
			var lista=JSON.parse(msg.partidas)
			console.log(lista)
			game.global.gameList=lista;	
			console.log(game.global.gameList)
			break;
		case 'UPDATE SCORE':
			if (game.global.DEBUG_MODE) {
				//console.log('[DEBUG] UPDATE SCORE PLAYERS message recieved');
				//console.dir(msg);
			}
			var lista=JSON.parse(msg.scores)
			console.log(lista)
			game.global.myRoom.scores=lista
			break;
		case 'UPDATE ACTIVE PLAYERS':
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] ACTIVE PLAYERS message recieved');
				console.dir(msg);
			}
			document.getElementById("players").value = "    👾JUGADORES👾 \n";
			for (var player of msg.players){
				if (game.global.myPlayer.id !== player.id && player.name !== undefined) {
					document.getElementById("players").value += "\n[" + player.name + "]: En línea";
				}
			}
			break;
		case 'JOIN':
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] JOIN message recieved')
				console.dir(msg)
			}
			game.global.myPlayer.id = msg.id
			game.global.myPlayer.shipType = msg.shipType
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] ID assigned to player: ' + game.global.myPlayer.id)
			}
			break
		case 'CHAT':
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] CHAT message recieved')
				console.dir(msg)
			}
			document.getElementById("chat").value += "\n" + msg.playerName + ": " + msg.content;
			break
		case 'CREATE ROOM':
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] CREATE ROOM message recieved')
				console.dir(msg)
			}
			game.global.validRoom=msg.valido;
			if(!msg.valido){
				// Funcion pregunta de nuevo el nombre (arreglarloo)
				//setRoomName();
			} else{
				// Pasamos a la siguiente sala
				game.global.myPlayer.room=msg.sala;
				game.state.start('roomState')
			}
			
			break
			
		case 'UPDATE NUMJUG':
			game.global.myRoom.numJugadores = msg.numJugadores;
			if(msg.comenzar) game.state.start("gameState");
			//console.log(game.global.myRoom.numJugadores)
			break
		
		case 'NEW GAME':
			if(game.global.DEBUG_MODE){
				console.log('[DEBUG] NEW GAME message received')
				console.dir(msg)
			}
			if(msg.response === "valido"){
				if(game.global.myPlayer.id == game.global.myRoom.idHost){
					game.state.start('gameState');
				} else{
					if(msg.comenzado){
						game.state.start('gameState');
					}
				}
				
			} else {
				//Error
				console.log(msg.response);
			}
			break
		case 'INTERFAZ':
				if (game.global.DEBUG_MODE) {
					console.log('[DEBUG] INTERFAZ message recieved')
					console.dir(msg)
				}
				game.global.myPlayer.numBullets=msg.numBullets
				break
		case 'NEW ROOM' :
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] NEW ROOM message recieved')
				console.dir(msg)
			}
			game.global.myPlayer.room = msg.room;
			game.global.myRoom.idHost=msg.idHost;
			break
			
		case 'ROOM DELETED':
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] ROOM DELETED message recieved')
				console.dir(msg)
			}
			game.global.myPlayer.room = 'lobby';
			game.state.start("lobbyState");
		case 'GAME STATE UPDATE' :
			if (game.global.DEBUG_MODE) {
				//console.log('[DEBUG] GAME STATE UPDATE message recieved')
				//console.dir(msg)
			}
			
			if (typeof game.global.myPlayer.image !== 'undefined') {
				for (var player of msg.players) {
					//console.log(player.name +"  "+player.score)
					if (game.global.myPlayer.id == player.id) {
						game.global.myPlayer.image.x = player.posX
						game.global.myPlayer.image.y = player.posY
						game.global.myPlayer.image.angle = player.facingAngle  
						game.global.myPlayer.healthBar.setPosition(player.posX, player.posY - game.global.myPlayer.image.height - 5)
						game.global.myPlayer.healthBar.setPercent(player.lifePoints * 10)
						game.global.myPlayer.fuelBar.setPosition(player.posX, player.posY - game.global.myPlayer.image.height)
						game.global.myPlayer.score = player.score;
						game.global.myInterface.myPlayerName.x = player.posX - game.global.myInterface.myPlayerName.width/2;
						game.global.myInterface.myPlayerName.y = player.posY + game.global.myPlayer.image.height + 5;
					} else {
						if (typeof game.global.otherPlayers[player.id] == 'undefined') {
							if(player.lifePoints > 0){
								game.global.otherPlayers[player.id] = {
										image : game.add.sprite(player.posX, player.posY, 'spacewar', player.shipType),
										lifePoints : player.lifePoints
								}
								game.global.otherPlayers[player.id].image.anchor.setTo(0.5, 0.5)
								
								// BARRA DE VIDA
								barConfig = {width: 50, height: 5, x: game.global.myPlayer.image.x, 
									y: game.global.myPlayer.image.y - game.global.myPlayer.image.height - 5,
									bg: {color: 'red'}, bar: {color: 'green'}, animationDuration: 10 };
								game.global.otherPlayers[player.id].healthBar = new HealthBar(game, barConfig);
								// FIN DE BARRA DE VIDA
							}
							
						} else {
							game.global.otherPlayers[player.id].image.x = player.posX
							game.global.otherPlayers[player.id].image.y = player.posY
							game.global.otherPlayers[player.id].image.angle = player.facingAngle
							game.global.otherPlayers[player.id].lifepoints = player.lifePoints
							game.global.otherPlayers[player.id].healthBar.setPosition(player.posX,
									player.posY - game.global.otherPlayers[player.id].image.height - 5)
							game.global.otherPlayers[player.id].healthBar.setPercent(player.lifePoints * 10) //Puntos de vida de 0 a 10
									
							if(player.name !== null){
								if(typeof game.global.myInterface.otherPlayers[player.id] === 'undefined'){
									game.global.myInterface.otherPlayers[player.id] = {
										name : game.add.text(player.posX,
												player.posY + game.global.otherPlayers[player.id].image.height + 5,
												player.name, {font: "20px Times New Roman", fill: "#FFFFFF", align: "left"})
									}
								}
								game.global.myInterface.otherPlayers[player.id].name.x = 
									player.posX - game.global.myInterface.otherPlayers[player.id].name.width/2
								game.global.myInterface.otherPlayers[player.id].name.y = player.posY + game.global.otherPlayers[player.id].image.height + 5
							}
							
						}
					}
				}
				
				for (var projectile of msg.projectiles) {
					if (projectile.isAlive) {
						game.global.projectiles[projectile.id].image.x = projectile.posX
						game.global.projectiles[projectile.id].image.y = projectile.posY
						if (game.global.projectiles[projectile.id].image.visible === false) {
							game.global.projectiles[projectile.id].image.angle = projectile.facingAngle
							game.global.projectiles[projectile.id].image.visible = true
						}
					} else {
						if (projectile.isHit) {
							// we load explosion
							let explosion = game.add.sprite(projectile.posX, projectile.posY, 'explosion')
							explosion.animations.add('explosion')
							explosion.anchor.setTo(0.5, 0.5)
							explosion.scale.setTo(2, 2)
							explosion.animations.play('explosion', 15, false, true)
						}
						game.global.projectiles[projectile.id].image.visible = false
					}
				}
			}
			break
		case 'REMOVE PLAYER' :
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] REMOVE PLAYER message recieved')
				console.dir(msg.players)
			}
			if(msg.id == game.global.myPlayer.id){
				//Borramos nuestra nave y la del resto y pasamos al menú o puntuaciones
				game.global.myPlayer.image.destroy()
				game.global.myInterface.myPlayerName.destroy()
				game.global.myPlayer.healthBar.kill();
				game.global.validRoom = false
				game.global.idHost = -1
				game.global.gameList = []
				delete game.global.myPlayer.room
				game.global.myRoom = new Object();
				
				
				for(i = 0; i < game.global.otherPlayers.length; i++){
					if(typeof game.global.otherPlayers[i] != 'undefined'){
						game.global.otherPlayers[i].image.destroy()
						game.global.myInterface.otherPlayers[i].name.destroy()
						game.global.otherPlayers[i].healthBar.kill();
						
						delete game.global.myInterface.otherPlayers[i]
						delete game.global.otherPlayers[i]
						
					}
					
					var arrayN = []
					var arrayN2 = []
					game.global.otherPlayers = arrayN
					game.global.myInterface.otherPlayers = arrayN2
					
				}
				game.world.setBounds(0, 0, 1024, 600);
				game.camera.position.x = 0
				game.camera.position.y = 0
				
				//Disable keys
				game.input.keyboard.removeKeyCapture(Phaser.Keyboard.W);
				game.input.keyboard.removeKeyCapture(Phaser.Keyboard.A);
				game.input.keyboard.removeKeyCapture(Phaser.Keyboard.S);
				game.input.keyboard.removeKeyCapture(Phaser.Keyboard.D);
				game.input.keyboard.removeKeyCapture(Phaser.Keyboard.SPACE);
				
				game.state.start("scoreState"); 
			} else {
				game.global.otherPlayers[msg.id].image.destroy()
				game.global.myInterface.otherPlayers[msg.id].name.destroy()
				game.global.otherPlayers[msg.id].healthBar.kill();
				delete game.global.otherPlayers[msg.id]
			}
			
		default :
			console.dir(msg)
			break
		}
	}

	// PHASER SCENE CONFIGURATOR
	game.state.add('bootState', Spacewar.bootState)
	game.state.add('preloadState', Spacewar.preloadState)
	game.state.add('menuState', Spacewar.menuState)
	game.state.add('lobbyState', Spacewar.lobbyState)
	game.state.add('matchmakingState', Spacewar.matchmakingState)
	game.state.add('roomState', Spacewar.roomState)
	game.state.add('gameState', Spacewar.gameState)
	game.state.add('selectRoomState', Spacewar.selectRoomState)
	game.state.add('scoreState', Spacewar.scoreState)
	
	game.state.start('bootState')

}

