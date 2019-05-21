function inputAnotherRoomName(){
	let name = window.prompt("Introduzca su nombre de sala: ");
	let message = {
		event : 'CREATE ROOM',
		sala: name
	}
	game.global.socket.send(JSON.stringify(message))
}