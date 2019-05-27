Spacewar.preloadState = function(game) {

}

Spacewar.preloadState.prototype = {
	// Variables que indican si se han cargado los assets y la fuente
	assetsReady : false,
	fontsReady : false,
	
	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **PRELOAD** state");
		}
	},

	preload : function() {
		
 
		this.loadFonts();
        this.loadAssets();
        game.load.onLoadComplete.addOnce(this.loadComplete,this);
	},
	//Carga los Assets
    loadAssets: function() 
    {
    	game.load.atlas('spacewar', 'assets/atlas/spacewar.png',
				'assets/atlas/spacewar.json',
				Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)
		game.load.atlas('explosion', 'assets/atlas/explosion.png',
				'assets/atlas/explosion.json',
				Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)    
    },
	
	//Carga el script necesario para cargar las fuentes de google
    loadFonts: function() 
    {
        const WebFontConfig = {
            active: this.fontIsReady.bind(this),

            google: {
                families:['Chakra Petch','Orbitron']
            }
        };

        game.load.script('webfont',
        "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js",
        () => WebFont.load(WebFontConfig));  
    },
    
    //Comunica que se han cargado las fuentes
    fontIsReady: function() {
        console.log('Fonts Loaded');
        this.fontsReady = true;
    },
    //Comunica que se han cargado los assets
    loadComplete: function() {
        console.log('Assets Ready');
        this.ready = true;
    },
	//Una vez se hayan cargado los Assets y las fuentes se pasa al menú de inicio
	update : function() {
		if(typeof game.global.myPlayer.id != 'undefined'){
			if (this.ready && this.fontsReady) {
				game.state.start('menuState');
			}  
		}
		      
	}
}