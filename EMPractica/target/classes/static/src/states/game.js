Spacewar.gameState = function(game) {
	style1 = {
		fill : "rgb(255,255,255)",
		font : "60px Chakra Petch",
		boundsAlignH : "left",
	}
	style2 = {
		fill : "rgb(255,255,255)",
		font : "60px Chakra Petch",
		boundsAlignH : "right",
	}
	this.MAX_BULLETS=100
	this.MAX_FUEL=50
	this.bulletTime
	this.fireBullet
	this.numStars = 100 // Should be canvas size dependant
	this.maxProjectiles = 800 // 8 per player
	game.global.myPlayer.healthBar
}

Spacewar.gameState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **GAME** state");
		}
		game.world.setBounds(0, 0, 3000, 3000);
	},

	preload : function() {
		// We create a procedural starfield background
		for (var i = 0; i < this.numStars; i++) {
			let sprite = game.add.sprite(game.world.randomX,
					game.world.randomY, 'spacewar', 'staralpha.png');
			let random = game.rnd.realInRange(0, 0.6);
			sprite.scale.setTo(random, random)
		}

		// We preload the bullets pool
		game.global.proyectiles = new Array(this.maxProjectiles)
		for (var i = 0; i < this.maxProjectiles; i++) {
			game.global.projectiles[i] = {
				image : game.add.sprite(0, 0, 'spacewar', 'projectile.png')
			}
			game.global.projectiles[i].image.anchor.setTo(0.5, 0.5)
			game.global.projectiles[i].image.visible = false
		}

		// we load a random ship
		let random = [ 'blue', 'darkgrey', 'green', 'metalic', 'orange',
				'purple', 'red' ]
		let randomImage = random[Math.floor(Math.random() * random.length)]
				+ '_0' + (Math.floor(Math.random() * 6) + 1) + '.png'
		game.global.myPlayer.image = game.add.sprite(0, 0, 'spacewar',
				game.global.myPlayer.shipType)
		game.global.myPlayer.image.anchor.setTo(0.5, 0.5)
		game.global.myPlayer.lifePoints = 10;
		game.global.myPlayer.score = 0;
		
		game.global.myInterface.myPlayerName = game.add.text(game.global.myPlayer.image.x,
				game.global.myPlayer.image.y + game.global.myPlayer.image.height + 5,
				game.global.myPlayer.name, {font: "20px Times New Roman", fill: "#FFFFFF", align: "left"});
		
		////// BARRA DE VIDA //////
        barConfig = {width: 50, height: 5, x: game.global.myPlayer.image.x, y: game.global.myPlayer.image.y - game.global.myPlayer.image.height - 5,
                     bg: {color: 'red'}, bar: {color: 'green'}, animationDuration: 10 };
        game.global.myPlayer.healthBar = new HealthBar(game, barConfig);
        ////// FIN BARRA DE VIDA //////
        
        game.global.otherPlayers = new Array()
        game.global.myInterface.otherPlayers = new Array()
	},

	create : function() {
		game.global.myPlayer.numBullets=this.MAX_BULLETS
		this.fuel=this.MAX_FUEL
		this.bulletTime = 0
		this.fireBullet = function() {
			if (game.time.now > this.bulletTime && game.global.myPlayer.numBullets>0) {
				this.bulletTime = game.time.now + 250;
				game.global.myPlayer.numBullets--
				// this.weapon.fire()
				return true
			} else {
				return false
			}
		}

		bulletsText=game.add.text(game.camera.x+10,game.camera.y+game.canvas.height-100,game.global.myPlayer.numBullets+"/"+this.MAX_BULLETS,style1)
		fuelText=game.add.text(game.camera.x+game.canvas.width-250,game.camera.y+game.canvas.height-100,this.fuel+"/"+this.MAX_FUEL,style2)

		this.wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
		this.sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
		this.aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
		this.dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
		this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

		// Stop the following keys from propagating up to the browser
		game.input.keyboard.addKeyCapture([ Phaser.Keyboard.W,
				Phaser.Keyboard.S, Phaser.Keyboard.A, Phaser.Keyboard.D,
				Phaser.Keyboard.SPACEBAR ]);

		game.camera.follow(game.global.myPlayer.image);
	},

	update : function() {
		if(typeof game.global.myPlayer != 'undefined'){
			if(game.global.otherPlayers.length==0){
				
			}

			bulletsText.setText(game.global.myPlayer.numBullets+"/"+this.MAX_BULLETS)
			bulletsText.x=game.camera.x+10
			bulletsText.y=game.camera.y+game.canvas.height-100

			fuelText.setText(this.fuel+"/"+this.MAX_FUEL)
			fuelText.x=game.camera.x+game.canvas.width-225
			fuelText.y=game.camera.y+game.canvas.height-100

			let msg = new Object()
			msg.event = 'UPDATE MOVEMENT'

			msg.movement = {
				thrust : false,
				brake : false,
				rotLeft : false,
				rotRight : false
			}

			msg.bullet = false

			if(this.wKey.isDown){
				if(this.fuel>0){
					msg.movement.thrust = true;
					this.fuel--
				}
			}	
			else{
				if(this.fuel<this.MAX_FUEL){
					this.fuel++
				}
			}
			if (this.sKey.isDown)
				msg.movement.brake = true;
			if (this.aKey.isDown)
				msg.movement.rotLeft = true;
			if (this.dKey.isDown)
				msg.movement.rotRight = true;
			if (this.spaceKey.isDown) {
				msg.bullet = this.fireBullet()
			}

			if (game.global.DEBUG_MODE) {
				//console.log("[DEBUG] Sending UPDATE MOVEMENT message to server")
			}
			game.global.socket.send(JSON.stringify(msg))
		} else {
			//Puntuaciones o lobby.. ¿Habría que resetear algo?
			//game.state.start("menuState")
		}
	}
}
