function setRoomName(name) {
	let message = {
		event : 'CREATE ROOM',
		sala : name
	}
	game.global.myRoom.idHost=game.global.myPlayer.id
	game.global.socket.send(JSON.stringify(message))
}

function setPlayerName(name) {
	game.global.myPlayer.name = name;
	let message = {
		event : 'PLAYER NAME',
		playerName : game.global.myPlayer.name
	}
	game.global.socket.send(JSON.stringify(message))
}

function sendChatMessage(string){
	let message = {
			event : 'CHAT',
			playerName: game.global.myPlayer.name,
			content: string
	}
	game.global.socket.send(JSON.stringify(message))
}

function updateActivePlayers(){
	let message = {
			event: "UPDATE ACTIVE PLAYERS"
	}
	game.global.socket.send(JSON.stringify(message))
}

function updateNumPlayers(){
	let message = {
			event : 'UPDATE NUMJUG',
			room : game.global.myPlayer.room
		}
		game.global.socket.send(JSON.stringify(message))
}

function sendScore(){
	let message = {
			event : 'SEND SCORE',
			playerName : game.global.myPlayer.name
			score : game.global.myPlayer.score
	}
	game.global.socket.send(JSON.stringify(message))
}