function setRoomName(name) {
	let message = {
		event : 'CREATE ROOM',
		sala : name
	}
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
