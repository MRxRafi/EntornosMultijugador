window.onload = function() {

	game = new Phaser.Game(1024, 600, Phaser.AUTO, 'gameDiv')

	// GLOBAL VARIABLES
	game.global = {
		FPS : 30,
		DEBUG_MODE : true,
		socket : null,
		myPlayer : new Object(),
		myInterface : new Object(),
		otherPlayers : [],
		gameList : [],
		validRoom: false,
		projectiles : []
	}

	game.global.myInterface.otherPlayers = []
	
	// WEBSOCKET CONFIGURATOR
	game.global.socket = new WebSocket("ws://" + window.location.host +"/spacewar")
	
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
		case 'CREATE ROOM':
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] CREATE ROOM message recieved')
				console.dir(msg)
			}
			game.global.validRoom=msg.valido;
			if(!msg.valido){
				// Funcion pregunta de nuevo el nombre
				inputAnotherRoomName();
			} else{
				// Pasamos a la siguiente sala
				game.global.myPlayer.room=msg.sala;
				game.state.start('roomState')
			}
			
			break
		case 'NEW ROOM' :
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] NEW ROOM message recieved')
				console.dir(msg)
			}
			game.global.myPlayer.room = msg.room;
			break
		case 'GAME STATE UPDATE' :
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] GAME STATE UPDATE message recieved')
				console.dir(msg)
			}
			if (typeof game.global.myPlayer.image !== 'undefined') {
				for (var player of msg.players) {
					if (game.global.myPlayer.id == player.id) {
						game.global.myPlayer.image.x = player.posX
						game.global.myPlayer.image.y = player.posY
						game.global.myPlayer.image.angle = player.facingAngle
						
						game.global.myInterface.myPlayerName.x = player.posX - game.global.myInterface.myPlayerName.width/2;
						game.global.myInterface.myPlayerName.y = player.posY + game.global.myPlayer.image.height + 5;
					} else {
						if (typeof game.global.otherPlayers[player.id] == 'undefined') {
							game.global.otherPlayers[player.id] = {
									image : game.add.sprite(player.posX, player.posY, 'spacewar', player.shipType)
							}
							game.global.otherPlayers[player.id].image.anchor.setTo(0.5, 0.5)
							
						} else {
							game.global.otherPlayers[player.id].image.x = player.posX
							game.global.otherPlayers[player.id].image.y = player.posY
							game.global.otherPlayers[player.id].image.angle = player.facingAngle

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
			game.global.otherPlayers[msg.id].image.destroy()
			game.global.myInterface.otherPlayers[msg.id].name.destroy()
			delete game.global.otherPlayers[msg.id]
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

	game.state.start('bootState')

}