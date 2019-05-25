Spacewar.scoreState = function(game) {
	// Estilos de texto
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
}

Spacewar.menuState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **Score** state");
		}
		
		game.kineticScrolling = game.plugins.add(Phaser.Plugin.KineticScrolling);
		game.kineticScrolling.configure({
		    kineticMovement: true,
		    timeConstantScroll: 325,
		    horizontalScroll: false,
		    verticalScroll: true,
		    horizontalWheel: false,
		    verticalWheel: true,
		    deltaWheel: 40
		});
		
		index=0,
		tick=0
		gameText=[]
	},

	preload : function() {

	},

	create : function() {
		
		// Crea el texto del Título
		var titleText = game.add.text(0, 0, "PUNTUACIÓN", titleStyle);
		titleText.setTextBounds(0, 0, game.world.width, game.world.height);
		console.log(game.global.myRoom); 

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
	
	update : function(){
		
	},
	
	volver : function() {

	}

}