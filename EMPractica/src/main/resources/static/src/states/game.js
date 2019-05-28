Spacewar.gameState = function(game) {
	style = {
		fill : "rgb(255,255,255)",
		font : "60px Chakra Petch",
		boundsAlignH : "left",
	}
	styleScores = {
		fill : "rgb(255,255,255)",
		font : "25px Chakra Petch",
		boundsAlignH : "left",
	}
	this.worldBounds = 3000
	this.MAX_BULLETS=10
	this.MAX_FUEL=50
	this.bulletTime
	this.fireBullet
	this.rechargeTime
	this.recharge
	this.numStars = 100 // Should be canvas size dependant
	this.maxProjectiles = 800 // 8 per player
	this.MAX_NUM_SCORE=10
	game.global.myPlayer.healthBar
}

Spacewar.gameState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **GAME** state");
		}
		game.world.setBounds(0, 0, this.worldBounds, this.worldBounds);
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
        ////// BARRA DE COMBUSTIBLE //////
        barConfig2 = {width: 50, height: 5, x: game.global.myPlayer.image.x, y: game.global.myPlayer.image.y - game.global.myPlayer.image.height,
                bg: {color: 'grey'}, bar: {color: 'white'}, animationDuration: 10 };
        game.global.myPlayer.fuelBar = new HealthBar(game, barConfig2);
        ////// FIN BARRA DE COMBUSTIBLE //////
		
        game.global.otherPlayers = new Array()
        game.global.myInterface.otherPlayers = new Array()
	},

	create : function() {
		pass=false;
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
		this.rechargeTime = 0
		this.recharge = function() {
			if (game.time.now > this.bulletTime && game.global.myPlayer.numBullets<this.MAX_BULLETS) {
				this.bulletTime = game.time.now + 200;
				game.global.myPlayer.numBullets++			
			}
		}
		game.global.myPlayer.fuelBar.setPercent(this.fuel * 2)

		bulletsText=game.add.text(game.camera.x+10,game.camera.y+game.canvas.height,"🔥 "+game.global.myPlayer.numBullets+"/"+this.MAX_BULLETS,style)
		bulletsText.anchor.setTo(0,1);
		bulletsText.fixedToCamera = true;
		fuelText=game.add.text(game.camera.x+game.canvas.width-10,game.camera.y+game.canvas.height,"⛽ "+this.fuel+"/"+this.MAX_FUEL,style)
		fuelText.anchor.setTo(1,1);
		fuelText.fixedToCamera = true;

		scoreText=[];
		var y=0;
		var offSet=30
		numJug=this.MAX_NUM_SCORE

		console.log(game.global.myRoom.scores)
		if(this.MAX_NUM_SCORE>game.global.myRoom.numJugadores){
			console.log(game.global.myRoom.numJugadores)
			numJug=game.global.myRoom.numJugadores
		}

		for(i=0;i<this.MAX_NUM_SCORE;i++){
			scoreText[i]=game.add.text(game.camera.x+game.canvas.width-10,game.camera.y+y,"",styleScores)
			
			console.log("aa: "+scoreText[i])
			scoreText[i].anchor.setTo(1,0)
			scoreText[i].fixedToCamera=true
			y+=offSet
		}

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

			bulletsText.setText("🔥 "+game.global.myPlayer.numBullets+"/"+this.MAX_BULLETS)

			fuelText.setText("⛽ "+this.fuel+"/"+this.MAX_FUEL)
			
			game.global.myPlayer.fuelBar.setPercent(this.fuel * 2)
			
			console.log(game.global.myRoom.scores)
			if(game.global.myRoom.scores){
				if(game.global.myRoom.scores.length>this.MAX_NUM_SCORE){
					for(i=0;i<this.MAX_NUM_SCORE;i++){
						if(game.global.myRoom.scores)
						scoreText[i].setText((i+1)+"º "+ game.global.myRoom.scores[i].name+": "+game.global.myRoom.scores[i].score)
					}
				}
				else{
					for(i=0;i<game.global.myRoom.scores.length;i++){
						if(game.global.myRoom.scores)
						scoreText[i].setText((i+1)+"º "+ game.global.myRoom.scores[i].name+": "+game.global.myRoom.scores[i].score)
					}
				}
				
			}

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
			} else {
				this.recharge()
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
