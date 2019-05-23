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
