Spacewar.lobbyState = function(game) {

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
		var style = {
			fill : "rgb(255,255,255)",
			font : "60px Chakra Petch",
			boundsAlignH : "center"
		};

		lobbyOptions=["Crear Partida", "Buscar Partida"];
        var y=game.canvas.height/3;
        var yOffset= 80;
        var lobbyText=[];
        for(var i= 0; i<lobbyOptions.length; i++)
            {
               lobbyText[i] = game.add.text(0, y, lobbyOptions[i], style);
               lobbyText[i].setTextBounds(0,0,game.world.width,game.world.height);
               // Añade detección de eventos en cada texto
               lobbyText[i].inputEnabled = true;
               lobbyText[i].events.onInputOver.add(this.over,this);
               lobbyText[i].events.onInputOut.add(this.out,this);
                // Indica a qué función llamar dependiendo de qué texto se trate
                switch(i){
                    case 0:
                        lobbyText[i].events.onInputDown.add(this.crear,this);
                        break;
                    case 1:
                        //lobbyText[i].events.onInputDown.add(this.buscar,this);
                        break;
                }

                y+= yOffset;
            }
		//game.state.start('matchmakingState')
	},

	crear : function() {
		if (typeof game.global.myPlayer.id !== 'undefined') {
			game.state.start('matchmakingState')
		}
	},

	buscar : function() {

	},

	//Recibe como parámetro un texto  
	//Modifica su color al pasar el ratón por encima, reproduciendo un sonido
	over : function(text) {

	    text.fill = "rgb(255,0,255)";
	},
	
	//Recibe como parámetro un texto  
	//Modifica su color al apartar el ratón
	out : function(text) {
	    text.fill = "rgb(255,255,255)";
	}
}