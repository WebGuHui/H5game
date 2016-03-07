var canvasWidth = window.innerWidth*2;
var canvasHeight = window.innerHeight*2;
var game = new Phaser.Game(canvasWidth,canvasHeight,Phaser.CANVAS,'game_div');

// 背景宽高比
var ratio = canvasWidth/canvasHeight;
var bgRatio_mobile = 828/1344;
var bgRatio_pad = 1408/2048;

// 设备类型
var device = (navigator.userAgent.indexOf("iPad") > -1) ? 'pad' : 'mobile';
var device_type = navigator.userAgent.toLowerCase().indexOf('android')<0?'apple':'android'

game.States = {};

//加载进度条所需资源
game.States.boot = function(){
	this.preload = function(){
		// 进度条
		game.load.atlasJSONArray('loading','http://24haowan-cdn.shanyougame.com/public/image/' + device +'/sprite.png','http://24haowan-cdn.shanyougame.com/public/image/' + device +'/sprite.json');

		// 设置画布大小
		$(game.canvas).css("width", canvasWidth/2);
		$(game.canvas).css("height", canvasHeight/2);
		//会撑大屏幕
		game.stage.backgroundColor = '#aaa';
	},
	this.create = function() {
		setTimeout(function(){
            // hiddenImg();
        }, 1500);
		game.state.start('preload');
	}
}

//加载列表
game.States.preload = function(){
	this.preload = function(){
		var pic_start = game.add.image(0,0,'loading','background.png');
        var ratio_temp = (device == "mobile") ? bgRatio_mobile : bgRatio_pad;
		if (ratio >= ratio_temp) {
			pic_start.width = canvasWidth;
			pic_start.height = canvasWidth/ratio_temp;
		} else {
			pic_start.width = canvasHeight*ratio_temp;
			pic_start.height = canvasHeight;
			pic_start.x = -(pic_start.width - canvasWidth)/2;
		}

		// 显示进度条
		var progress_fill, progress_empty;
		if (device == "mobile") {
			progress_empty = game.add.sprite((canvasWidth-326)/2, (canvasHeight-70)/2+80, 'loading', 'progress_empty.png');
			progress_empty.width = 326;
			progress_empty.height = 70;
			progress_fill = game.add.sprite((canvasWidth-320)/2, (canvasHeight-60)/2+80, 'loading', 'progress_fill.png');
			progress_fill.width = 320;
			progress_fill.height = 60;
		} else {
			progress_empty = game.add.sprite((canvasWidth-486)/2, (canvasHeight-110)/2+100, 'loading', 'progress_empty.png');
			progress_empty.width = 486;
			progress_empty.height = 110;
			progress_fill = game.add.sprite((canvasWidth-480)/2, (canvasHeight-90)/2+100, 'loading', 'progress_fill.png');
			progress_fill.width = 480;
			progress_fill.height = 90;
		}
		
		game.load.setPreloadSprite(progress_fill);

		//加载资源
		game.load.image('bg','assets/' + device + '/bg.png');
		// game.load.image('home','assets/' + device + '/home.png'); 
		game.load.image('border','assets/' + device + '/border.png');
		game.load.image('hp','assets/' + device + '/hp.png');
		game.load.image('bg-score','assets/' + device + '/bg-score.png');
		game.load.image('timeUp','assets/' + device + '/timeUp.png');
		game.load.image('bg_start','assets/' + device + '/bg_start.png');
		game.load.image('boomPic','assets/' + device + '/boom.png');

		game.load.atlasJSONArray('score','assets/' + device + '/score.png','assets/' + device + '/score.json');
		game.load.atlasJSONArray('gift','assets/' + device + '/gift.png','assets/' + device + '/gift.json');
		game.load.atlasJSONArray('friend','assets/' + device + '/friend.png','assets/' + device + '/friend.json');
		game.load.atlasJSONArray('badman','assets/' + device + '/badman.png','assets/' + device + '/badman.json');
		game.load.atlasJSONArray('home','assets/' + device + '/home.png','assets/' + device + '/home.json');
		game.load.atlasJSONArray('bomb','assets/' + device + '/bomb.png','assets/' + device + '/bomb.json');
		game.load.atlasJSONArray('finger','assets/finger.png','assets/finger.json');
		game.load.spritesheet('christmasMan','assets/' + device + '/fatherChristmas.png');

		game.load.audio('bgMusic','assets/audio/bg_music.mp3');
		if(device_type == 'apple') {
			game.load.audio('boom','assets/audio/boom.mp3');
			game.load.audio('gameOver','assets/audio/gameOver.mp3');
			game.load.audio('giftHitBadman','assets/audio/giftHitBadman.mp3');
			game.load.audio('hp_add','assets/audio/hp_add.mp3');
			game.load.audio('score_add','assets/audio/score_add.mp3');
			game.load.audio('score_sub','assets/audio/score_sub.mp3');
			game.load.audio('start_music','assets/audio/start_music.mp3');
			game.load.audio('throwBomb','assets/audio/throwBomb.mp3');
			game.load.audio('throwGift','assets/audio/throwGift.mp3');
		}
	};
	this.create = function(){
		musicBox['bgMusic'] = game.add.audio('bgMusic'); //BGM
		if(device_type == 'apple') {
			musicBox['boom'] = game.add.audio('boom'); //炸弹爆炸
			musicBox['gameOver'] = game.add.audio('gameOver'); //游戏结束
			musicBox['giftHitBadman'] = game.add.audio('giftHitBadman'); //礼物砸中坏人
			musicBox['hp_add'] = game.add.audio('hp_add'); //礼物砸中好人
			musicBox['score_add'] = game.add.audio('score_add'); //加分
			musicBox['score_sub'] = game.add.audio('score_sub'); //减分
			musicBox['start_music'] = game.add.audio('start_music'); //开始游戏
			musicBox['throwBomb'] = game.add.audio('throwBomb'); //抛炸弹
			musicBox['throwGift'] = game.add.audio('throwGift'); //跑礼物
		}
		game.state.start('create');
	};
}

//开始的菜单模块
game.States.create = function(){
	this.create = function() {
		//显示开始菜单页面 使用dom构建
		//开始按钮调用 
		/*
			game.state.start('play');
			hiddenLabel();
		*/
		// game.input.onDown.add(function(){
		$('#start_menu').show();
		// });
	}
}
var bg, //背景
	car, //汽车
	christmasMan, //圣诞老人
	gift, //礼物
	house, //房子
	GameisDown = false, //是否按下
	christmasHeight,
	score = 0,
	scoreLabel,
	time = 40,
	timeLabel,
	canMove = true,
	musicBox = {},
	scaleNum = 0.5,
	scaleNumHouse = 0.7;

var velocity = 150; // 150px/s


/*地图*/
var bgManager = function(){
	game.stage.backgroundColor = '#000';
};
bgManager.prototype.init = function(){
	var bgWidth = game.cache.getImage('bg').width;
	var bgHeight = game.cache.getImage('bg').height;
	bg = game.add.tileSprite(game.world.centerX,game.world.centerY,bgWidth,bgHeight,'bg');
	bg.anchor.setTo(0.5);
	bg.autoScroll(0,velocity);
	if(canvasWidth <= 640) {
		bg.tilePosition.x = -30;
	}
	// game.add.tween(bg).to({alpha: 0.3},10000,'Linear',true,0,-1,true)
	
};

bgManager.prototype.reset = function(){
	bg.autoScroll(0,velocity);
};

/*圣诞老人 & 礼物*/
var manManager = function(){
	this.currentBall = null;
	this.onKill = false;
};
manManager.prototype.init = function(){
	//圣诞老人位置
	christmasMan = game.add.sprite(canvasWidth-5, canvasHeight/2, 'christmasMan');
	if(canvasWidth <= 640) {
		christmasMan.width *= scaleNum;
		christmasMan.height *= scaleNum;
	}
	christmasMan.anchor.setTo(1,0.5);
	this.bindDrag();

	this.giftX = christmasMan.position.x-christmasMan.width/2;
	this.giftY = christmasMan.position.y;

	gift = game.add.group();
	this.createGift();

};
var touchChristmas = false;
manManager.prototype.bindDrag = function(){
	var self = this;
	game.input.onDown.add(function(e){
		// game.add.tween(christmasMan).to({y:e.y*2},100,Phaser.Easing.Linear.None,true);
		if(e.x*2>=christmasMan.position.x - christmasMan.width && e.y*2>=christmasMan.position.y-(christmasMan.height/2) && e.x*2<=christmasMan.position.x && e.y*2<=christmasMan.position.y+(christmasMan.height/2)) {
			touchChristmas = true;
		}
		GameisDown = true;
	},this);
	game.input.onUp.add(function(){
		if(self.currentBall != null && GameisDown && canMove) {
			self.flyGift();
		}
		setTimeout(function(){
			touchChristmas = false;
			GameisDown = false;
		},100);
	});
    
};
manManager.prototype.moveChristmas = function(y){
	// this.christmasManAnimation && this.christmasManAnimation.stop();

	this.christmasManAnimation = game.add.tween(christmasMan).to({y:y},10,Phaser.Easing.Linear.None,true);
	this.giftY = y;
	if(this.currentBall != null) {
		// this.giftAnimation && this.giftAnimation.stop();
		this.giftAnimation = game.add.tween(this.currentBall).to({y:y},10,Phaser.Easing.Linear.None,true);
	}
};
manManager.prototype.createGift = function(){
	//礼物位置 需微调
	var one = gift.create(this.giftX, this.giftY, 'gift',Math.floor(Math.random()*3));
	one.anchor.setTo(1,0.5);
	if(canvasWidth <= 640) {
		one.width *= scaleNum;
		one.height *= scaleNum;
	}
	game.physics.arcade.enable(one);
	one.checkWorldBounds = true;
	one.outOfBoundsKill = true;
	one.type = "gift";
	this.currentBall = one;
};
manManager.prototype.killGift = function(_gift,boom_x,boom_y){
	var self = this;
	if(this.onKill == true) {
		return false;
	} else {
		this.onKill = true;
		if(_gift.type == 'gift') {
			_gift.kill();
			this.onKill = false;
		} else {
			/*爆炸效果*/
			var boomPic = game.add.sprite(boom_x,boom_y,'boomPic');
			boomPic.anchor.setTo(0.5);
			_gift.animations.stop('warn');
			_gift.kill();
			setTimeout(function(){
				boomPic.kill();
				self.onKill = false;
			},200);
		}
	}
};
manManager.prototype.createBomb = function(car_x,car_y){
	//生成炸弹事件
	canMove = false; //炸弹移动不允许

	var self = this;
	if(this.currentBall) {
		this.currentBall.kill();
		this.currentBall = null;
	}
	var one = gift.create(Math.floor(car_x), Math.floor(car_y), 'bomb','bomb1.png');
	one.animations.add('warn',[0,1],5,true);
	one.anchor.setTo(1,0.5);
	this.currentBall = one;
	game.physics.arcade.enable(one);
	one.type = 'bomb';
	var bombAnimation = game.add.tween(one).to({x:self.giftX,y:self.giftY},300,'Linear',true,0,0,false);
	bombAnimation.onComplete.add(function(){
		canMove = true;
		one.play('warn',5,true);
	});
};
manManager.prototype.flyGift = function(){
	if(device_type == 'apple') {
		if(this.currentBall.type == 'bomb') {
			musicBox['throwBomb'].play();
		} else {
			musicBox['throwGift'].play();
		}
	}
	this.currentBall.body.velocity.x = -1000;
	var self = this;
	this.currentBall = null;
	game.time.events.add(500,function(){
		if(self.currentBall == null) {
			self.createGift();
		}
	},this);
};

var houseManager = function(){
	house = game.add.group();
	// house.createMultiple(10,'home');
	game.physics.arcade.enable(house);
	this.tileHeight = game.cache.getImage('home').height;
};
houseManager.prototype.init = function(){
	var self = this;
	var bottom = -this.tileHeight;
	//初始化一些房子
	for(var i = 0;i<2;i++) {
		var random = Math.ceil(Math.random()*5);
		var one = house.create(10,bottom - i*bottom,'home','h'+random+'.png');
		if(canvasWidth <= 640) {
			one.width *= scaleNumHouse;
			one.height *= scaleNumHouse;
		}
		if(one.frame == 0) {
			one.score = 50;
		} else if(one.frame == 1) {
			one.score = 40;
		} else if(one.frame == 2) {
			one.score = 30;
		} else if(one.frame == 3) {
			one.score = 20;
		} else {
			one.score = 10;
		}
		game.physics.arcade.enable(one);
		one.body.velocity.y = velocity;
		one.checkWorldBounds = true;
		// one.outOfBoundsKill = true;
	}

	house.timer = game.time.events.loop(5000, self.addHouse, this);
};
houseManager.prototype.addHouse = function(y){
	if(typeof y == "undefined") {
		y = -this.tileHeight;
	}
	var random = Math.ceil(Math.random()*5);
	var one = house.create(10,y,'home','h'+random+'.png');
	if(canvasWidth <= 640) {
		one.width *= scaleNumHouse;
		one.height *= scaleNumHouse;
		console.log('1');
	}
	if(one.frame == 0) {
		one.score = 50;
	} else if(one.frame == 1) {
		one.score = 40;
	} else if(one.frame == 2) {
		one.score = 30;
	} else if(one.frame == 3) {
		one.score = 20;
	} else {
		one.score = 10;
	}
	game.physics.arcade.enable(one);
	one.body.velocity.y = velocity;
	one.body.immovable = true;
	one.checkWorldBounds = true;
	// one.outOfBoundsKill = true;
};


var carManager = function(){
	car = game.add.group();
	this.randomNum = 0.3;
};
carManager.prototype.init = function(){
	var self = this;
	this.time = 10000; //init
	this.timer = game.time.events.add(self.time, function(){
		self.addCar();
		self.changeTime();
	}, this);
};
carManager.prototype.changeTime = function(_time){
	var self = this;
	_time = _time || 10000;
	game.time.events.remove(this.timer);
	this.timer = game.time.events.loop(_time,self.addCar,this);
};
carManager.prototype.addCar = function(){
	this.time = 8000;
	var type = Math.random(), // [0,1)
		one,
		carHeight,
		carWidth,
		random;
		
	if(type>this.randomNum) {
		//贼车
		carHeight = game.cache.getImage('badman').height;
		carWidth = game.cache.getImage('badman').width/2;
		randomDiff = (Math.random()>0.5?(game.world.centerX):(game.world.centerX+carWidth*1.5));
		one = car.create(randomDiff ,-carHeight,'badman',0);
		one.anchor.setTo(0.5);
		game.physics.arcade.enable(one);
		one.type = 'bad';
		(function(one){
			game.time.events.repeat(3000,5,function(){
				one.body.velocity.y += Math.floor(Math.random()*400- 200);
			});
		})(one);
		one.body.velocity.y = 500;
	} else {
		//粮食车
		carHeight = game.cache.getImage('friend').height;
		carWidth = game.cache.getImage('friend').width/2;
		randomDiff = (Math.random()>0.5?(game.world.centerX):(game.world.centerX+carWidth*1.5));
		one = car.create(randomDiff ,-carHeight,'friend',0);
		one.anchor.setTo(0.5);
		game.physics.arcade.enable(one);
		one.type = 'good';
		one.body.velocity.y = 500;
	}
};
carManager.prototype.killCar = function(_car){
	_car.body.velocity.y = 0;
	_car.frame = 1;
	var carAnimation = game.add.tween(_car).to({alpha:0},300,'Linear',true,0,0,false);
	carAnimation.onComplete.add(function(){
		_car.kill();
	});
}

var labelManager = function(){
};
labelManager.prototype.init = function(){

	scoreLabel = null;
	timeLabel = null;
	time = 40;
	score = 0;
	if(device == 'mobile') {
		this.bgScore = game.add.image(10, 20, 'bg-score');
	} else {
		this.bgScore = game.add.image(15, 30, 'bg-score');
	}
	var Px = game.world.width- 10,
		Py = game.cache.getImage('border').height;
	this.power = game.add.image(Px,Py,'hp');
	this.powerBorder = game.add.image(Px,Py,'border');
	this.powerBorder.anchor.setTo(1,1);
	this.power.anchor.setTo(1,1);
	this.rect = new Phaser.Rectangle(0,0,this.power.width,this.power.height);
	this.power.crop(this.rect);

	this.powerHeight = this.power.height - 9; //图片下方留白
	this.powerTitle = game.add.text(Px - this.powerBorder.width/2,Py + 10,'体 力',{font:"30px Microsoft YaHei",fill:"#ef7b00"});
	this.powerTitle.anchor.setTo(0.5,0);
	this.changeScore();
	this.changeTime();
	this.setTimeStart();
};

labelManager.prototype.changeScore = function(){
	if(scoreLabel) {
		scoreLabel.text = score;
	} else {
		if(device == 'mobile') {
			scoreLabel = game.add.text(100,24,score,{font:'38px Microsoft YaHei',fill:"#fff"});
		} else {
			scoreLabel = game.add.text(180,36,score,{font:'57px Microsoft YaHei',fill:"#fff"});
		}
		scoreLabel.anchor.setTo(1,0);
	}
};

labelManager.prototype.changeTime = function(){
	this.rect.y = this.powerHeight*(1 - (time>60?60:time)/60);
	this.power.crop(this.rect);
};

labelManager.prototype.changeVelocity = function(v){
	if(typeof v === 'number') {
		velocity = v;
		bg.autoScroll(0,velocity);
		house.setAll('body.velocity.y',velocity);
		house.timer.delay = Math.floor(5000/(v/150));
	}
}

labelManager.prototype.setTimeStart = function(){
	var self = this;
	game.time.events.loop(1000,function(){
		time--;
		if(time>0) {
			if(time>60) {
				self.rect.y = 0;
			} else {
				self.rect.y = self.powerHeight*(1 - time/60);
			}
			self.power.crop(self.rect);
			self.changeVelocity((300*(1 - (time>60?60:time)/60))+150);

		} else {
			if(device_type == 'apple') {
				musicBox['gameOver'].play();
			}
			self.rect.y = self.powerHeight*(1 - time/60);
			self.power.crop(self.rect);
			console.log('game over');
			game.paused = true;
		}

	},this);
}

game.States.play = function(){
	this.currentHouse = null;
	this.currentScore = 10;
	this.oneGiftHitCar = false;
	this.oneGiftHitHouse = false;
	this.create = function(){
		musicBox['bgMusic'].loopFull();
		if(device_type == 'apple') {
			musicBox['start_music'].play();
		}

		christmasHeight = game.cache.getImage('christmasMan').height;
		if(canvasWidth <= 640) {
			christmasHeight *= scaleNum;
		}
		var bgBox = new bgManager();
		bgBox.init();

		manBox = new manManager();
		manBox.init();

		houseBox = new houseManager();
		houseBox.init();

		labelBox = new labelManager();
		labelBox.init();

		carBox = new carManager();
		carBox.init();

		/*提示*/
		var finger = game.add.sprite(canvasWidth,canvasHeight/2,'finger','finger.png');
		finger.animations.add('tip',[0,1],5,true);
		if(canvasWidth<=640) {
			finger.width *= scaleNum;
			finger.height *= scaleNum;
		}
		finger.angle = -15;
		finger.anchor.setTo(1,0.5);
		var clickAnimation = finger.animations.play('tip');
		
		game.input.onDown.addOnce(function(){
			finger.animations.stop('tip');
			finger.frame = 0;
			finger.y = canvasHeight - finger.height;
			var fingerAnimation = game.add.tween(finger).to({y:finger.height+10},2000,'Linear',true,0,1,true);
			fingerAnimation.onComplete.add(function(){
				finger.kill();
			});
		});
		
	};
	this.update = function(){
		//拖动
		if(GameisDown && touchChristmas && canMove) {
			if(game.input.y*2<christmasHeight/2) {
				//上方
				manBox.moveChristmas(christmasHeight/2);
			} else if(game.input.y*2 >canvasHeight-christmasHeight/2) {
				//下方
				manBox.moveChristmas(canvasHeight-christmasHeight/2);
			} else {
				manBox.moveChristmas(game.input.y*2);
			}
		}

		game.physics.arcade.overlap(gift,house,this.giftHitHouse,null,this);
		game.physics.arcade.overlap(gift,car,this.giftHitCar,null,this);
	};

	this.giftHitHouse = function(_gift,_house){
		if(this.oneGiftHitHouse == true) {
			return ;
		} else {
			this.oneGiftHitHouse = true;
			if(_gift.type == 'gift') {
				score += _house.score;
				if(device_type == 'apple') {
					musicBox['score_add'].play();
				}
				var scorePic = game.add.sprite(_house.x + _house.width/2,_house.y-10,'score','score_'+_house.score+'.png');
				if(canvasWidth <= 640) {
					scorePic.width *= scaleNum;
					scorePic.height *= scaleNum;
				}
				scorePic.anchor.setTo(0.5,1);
				game.physics.arcade.enable(scorePic);
				scorePic.body.velocity.y = _house.body.velocity.y;
				setTimeout(function(){
					scorePic.kill();
				},500);
			} else if(_gift.type == 'bomb') {
				score -= 5;
				if(device_type == 'apple') {
					musicBox['boom'].play();
					musicBox['score_sub'].play();
				}
				var scorePic = game.add.sprite(_house.x + _house.width/2,_house.y-10,'score','score-5.png');
				if(canvasWidth <= 640) {
					scorePic.width *= scaleNum;
					scorePic.height *= scaleNum;
				}
				scorePic.anchor.setTo(0.5,1);
				game.physics.arcade.enable(scorePic);
				scorePic.body.velocity.y = _house.body.velocity.y;
				setTimeout(function(){
					scorePic.kill();
				},500);
			}
			manBox.killGift(_gift,_house.x,_house.y);
			labelBox.changeScore();
			this.oneGiftHitHouse = false;
		}

	};
	this.giftHitCar = function(_gift,_car){
		/*
			1,判断gift的type是 gift 还是 bomb
			2,判断car的type是 good 还是 bad
		*/
		// console.log(_gift);
		var self = this;
		if(!canMove) {
			return ;
		}
		if(this.oneGiftHitCar == true) {
			return ;
		} else {
			this.oneGiftHitCar = true;
			manBox.killGift(_gift,_car.x,_car.y); 
			if(_gift.type == 'gift') {
				if(_car.type == 'good') {
					time += 3;
					if(device_type == 'apple') {
						musicBox['hp_add'].play();
					}
					labelBox.changeTime();

					var scorePic = game.add.sprite(_car.x,_car.y-_car.height/2,'timeUp');
					game.physics.arcade.enable(scorePic);
					scorePic.body.velocity.y = _car.body.velocity.y;
					scorePic.anchor.setTo(0.5,1);
					setTimeout(function(){
						scorePic.kill();
					},500);
				} else if(_car.type == 'bad') {
					if(device_type == 'apple') {
						musicBox['giftHitBadman'].play();
					}
					manBox.createBomb(_car.x,_car.y);
				}
			} else if(_gift.type == 'bomb') {
				carBox.killCar(_car);
				if(_car.type == 'good') {
					if(device_type == 'apple') {
						musicBox['boom'].play();
					}
				} else if(_car.type == 'bad') {
					score += 5;
					if(device_type == 'apple') {
						musicBox['boom'].play();
						musicBox['score_add'].play();
					}
					labelBox.changeScore();
					var scorePic = game.add.sprite(_car.x + _car.width/2,_car.y-10,'score','score_5.png');
					if(canvasWidth <= 640) {
						scorePic.width *= scaleNum;
						scorePic.height *= scaleNum;
					}
					game.physics.arcade.enable(scorePic);
					scorePic.body.velocity.y = _car.body.velocity.y;
					scorePic.anchor.setTo(0.5,1);
					setTimeout(function(){
						scorePic.kill();
					},500);
				}
			}
			setTimeout(function(){
				self.oneGiftHitCar = false;
			},300)
		}
	}
}
//开始写逻辑


game.state.add('boot',game.States.boot);
game.state.add('preload',game.States.preload);
game.state.add('create',game.States.create);
game.state.add('play',game.States.play);
game.state.start('boot');

//文案分享接口
function resetShareText() {
    var obj = {
            share:"“点击右上角分享，祝福大家圣诞快乐”",
            default:"丢礼圣诞老人说帮他送礼物，他就送一打妹子给你。",
            title:"圣诞老人评价我{score}分,打败了全国{persent}%人,他说送我一打妹子。圣诞节，帮圣诞老人送礼物，他会圆你一个愿望",
            desc:"圣诞特快来咯！看看你能帮圣诞老人送出多少礼物。游戏里，许个愿，圣诞老人帮你实现。",
            imgUrl:"http://24haowan-cdn.shanyougame.com/BreakSquare/pic_title.png",
    };
    return obj;
}

//分数规则接口
function getBadge(score) {
    if(score>=1000) {
        return 1;
    } else if(score>=800) {
        return 2;
    } else if(score>=600) {
        return 3;
    } else {
        return 0;
    }
}


/*
game.add.tween(bg).to({alpha: 0.3},10000,'Linear',true,0,-1,true)
*/