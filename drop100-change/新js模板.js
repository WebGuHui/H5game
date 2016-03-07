/** 
	结束接口
	setGameScore({
		'game_score':score,
		'game_id':game_info['game_id'],
		'device_type':self.device.platform
	});
**/
var Game = function(bestScore, config ,domId) {
	this.bestScore = bestScore || 0;
	this.config = config;
	this.domId = domId || '';
};

/* 游戏属性 */
Game.prototype = {
	// 得分
	score : 0,
	// 最高得分
	bestScore : 0,
	// 初始化标记
	isInit : false,
	// 资源配置
	assetsConfig : null,
	// 资源加载器
	assetsLoader : null,
	// 音乐管理器
	musicManager : null,
	// 插入的domId
	domId : null,
	// 设备信息
	device : {
		type : null,
		platform : null,
		width : 0,
		height : 0
	},
	// 画布大小
	canvasSize : {
		width : 0,
		height : 0,
		ratio : 0
	},
	// phaser游戏对象实例
	instance : null,

	// 初始化-设备信息
	initDevice : function() {
		this.device.width = window.innerWidth;
		this.device.height = window.innerHeight;
		if (window.innerWidth > window.innerHeight) {
			this.device.width = window.innerHeight;
			this.device.height = window.innerWidth;
		}
		this.device.platform = (navigator.userAgent.toLowerCase().indexOf('android') < 0) ? 'apple' : 'android';
		this.device.type = (this.device.width > 700) ? 'pad' : 'mobile';
	},
	// 初始化-画布大小
	initCanvasSize : function() {
		if (window.innerWidth < window.innerHeight) {
			this.canvasSize.width = window.innerWidth * 2;
			this.canvasSize.height = window.innerHeight * 2;
			this.canvasSize.ratio = this.canvasSize.width/this.canvasSize.height;
		}
	},
	// 初始化-游戏
	init : function() {
		// 初始化设备信息
		this.initDevice();
		// 初始化画布大小
		this.initCanvasSize();
		var self = this;
		this.isInit = true;
		this.instance = new Phaser.Game(this.canvasSize.width, this.canvasSize.height, Phaser.CANVAS, this.domId);
		this.instance.States = {};
		var game = this.instance;

		// State - boot
		// 加载加载页所需资源
		game.States.boot = function() {
			this.preload = function() {
				// 设置画布大小
				$(game.canvas).css("width", self.canvasSize.width/2);
				$(game.canvas).css("height", self.canvasSize.height/2);
				// 设置默认背景颜色
				game.stage.backgroundColor = '#aaa';
			};
			this.create = function() {
				// setTimeout(function(){
					game.state.start('preload');
				// },1500);
			};
		};

		// State - preload
		// 加载游戏所需资源
		game.States.preload = function() {
			this.preload = function() {
				game.load.onLoadComplete.add(function(){
					console.log('create');
					$('#loading').hide();
					game.state.start('create');
				});

				// 加载资源
				var config = self.config['game'];
				if(config['bg'].indexOf('#') != 0){
					game.add.image('bg',config['bg']);
				}
				game.load.atlasJSONArray('left','http://24haowan-cdn.shanyougame.com/drop100/assets/mobile/left.png','http://24haowan-cdn.shanyougame.com/drop100/assets/mobile/left.json');
				game.load.atlasJSONArray('right','http://24haowan-cdn.shanyougame.com/drop100/assets/mobile/right.png','http://24haowan-cdn.shanyougame.com/drop100/assets/mobile/right.json');
				game.load.atlasJSONArray('spring','http://24haowan-cdn.shanyougame.com/drop100/assets/mobile/spring.png','http://24haowan-cdn.shanyougame.com/drop100/assets/mobile/spring.json');
				game.load.atlasJSONArray('num','http://24haowan-cdn.shanyougame.com/drop100/assets/mobile/num.png','http://24haowan-cdn.shanyougame.com/drop100/assets/mobile/num.json');
				game.load.atlasJSONArray('man',config['man'][0],config['man'][1]);
				game.load.image('stab','http://24haowan-cdn.shanyougame.com/drop100/assets/mobile/stab.png');
				game.load.image('hidden','http://24haowan-cdn.shanyougame.com/drop100/assets/mobile/hidden.png');
				game.load.image('top','http://24haowan-cdn.shanyougame.com/drop100/assets/mobile/top.png');
				game.load.image('common','http://24haowan-cdn.shanyougame.com/drop100/assets/mobile/common.png');
				game.load.image('hpLogo','http://24haowan-cdn.shanyougame.com/drop100/assets/mobile/hp.png');
				//onloadcomplete game.state.start('create');
				//加载音效
				game.load.audio('bgMusic',config['music_bg']);
				if(self.device.platform != 'android') {

				}
			};
		};

		// State - create
		// 开始界面
		game.States.create = function() {
			this.create = function() {
				//添加音效
				self.musicManager = new MusicManager(game, self.device, ['bgMusic']);
				//显示开始菜单页面 使用dom构建
				$('#start-menu').show();
			}
		};

		// State - play
		// 游戏界面
		game.States.play = function(){
			this.create = function() {
				// 此处开始写游戏逻辑
				// 添加背景
				if(self.config['game']['bg'].indexOf('#') == 0){
					game.stage.backgroundColor = self.config['game']['bg'];
				} else {
					var bg = game.add.image(0, 0, "bg");
					bg.width = self.canvasSize.width;
					bg.height = self.canvasSize.height;
				}
				game.physics.startSystem(Phaser.Physics.ARCADE);
				game.physics.arcade.checkCollision.down = false;
				/* score */
				var scoreLabelPositionY = game.cache.getImage('top').height/1254*game.height + game.height*0.1;
				scoreLabel = game.add.text(game.world.centerX,scoreLabelPositionY,score,{fontSize:"135px",fill:"#000"});
				scoreLabel.alpha = 0.2;
				scoreLabel.anchor.setTo(0.5,0);
				peopleBox = new peopleManager();
			};
			this.update = function() {
				//碰平台
				game.physics.arcade.collide(people,platformGroup,this.peopleOnPlatform, null, this);
				//碰上方尖刺
				game.physics.arcade.overlap(people,stabBox,this.peopleHitStab, null, this);
				if(people.body.velocity>=10) {
					subSpeed = false;
				}
			};
			this.peopleOnPlatform = function(_man,_floor) {
				if(currentFloor != _floor) {
					/* 跳到新的板块 根据板块判断各种事件*/
					/*
						1 普通板 红色
						2 尖刺板 黄色
						3 滚动版 绿色
						4 弹簧板 紫色
						5 消失板 蓝色
					*/
					if(currentFloor != undefined) {
						var num = Math.ceil((_floor.position.y - currentFloor.position.y)/(game.height/8));
						peopleBox.addScore(num);
					}
					currentFloor = _floor;
					subSpeed = false;
					if(_floor.type == 1) {

					} else if(_floor.type == 2) {
						console.log(_floor);
						peopleBox.subHealth(2);
					} else if(_floor.type == 3) {
						subSpeed = _floor.direction;
					} else if(_floor.type == 4) {
						people.body.velocity.y = _floor.body.velocity.y-500;
						// currentFloor = null;
						_floor.animations.play('jump');
					} else if(_floor.type == 5) {
						(function(){
							var animation = game.add.tween(_floor).to({alpha:0},500,'Linear',true,0,0,false);
							animation.onComplete.add(function(){
								_floor.body.checkCollision.up = false;
							});
							console.log('123');
						})(_floor)
					}
					peopleBox.addHealth();
					floorChange = true;
				} else if(_floor.type == 4){
					/*旧版块如果是弹簧板有反应*/
					people.body.velocity.y = _floor.body.velocity.y-500;
					_floor.animations.play('jump');
					peopleBox.addHealth();
				} else if(_floor.type == 3 && isDown == false) {
					people.body.velocity.x = (subSpeed=='left'?-100:100);
				}
			};
			this.peopleHitStab = function(_man,_stab) {
				if(floorChange) {
					/*扣血落下*/
					floorChange = false;
					peopleBox.subHealth(2);
					people.body.velocity.y = 0;
					currentFloor.body.checkCollision.up = false; /* 上方碰撞失效 */
				}

			};
			this.render =function() {
				// game.debug.body(stabBox);
				// platformGroup.forEach(function(one){
				// 	game.debug.body(one);
				// },this);
			}
		};
		var platformGroup;
		var people;
		var currentFloor;
		var floorChange = false;
		var stabBox;
		var score = 0;
		var scoreLabel;
		var isDown = false;
		// var hpLabel;
		var subSpeed = false;
		var peopleManager = function() {
			score = 0;
			people = game.add.sprite(game.world.centerX,game.world.centerY,'man',0);
			peopleW = people.width/750*game.width;
			peopleH = people.height/1254*game.height;
			people.anchor.setTo(0.5,1); /*锚点在底部*/
			people.health = 5;
			people.color = 'green';
			people.width = peopleW;
			people.height = peopleH;
			
			this.velocity = 400;
			this.init();
			this.changeRed;
			// hpLabel = game.add.text(10,10,6,{font:"30px Microsoft YaHei",fill:"#000"});
			this.createHP();
		};
		peopleManager.prototype.createHP = function() {
			var hpLogo = game.add.image(12,stabBoxH+12,'hpLogo');
			this.hpNum = game.add.sprite(hpLogo.position.x + hpLogo.width + 12,hpLogo.position.y,'num',people.health);
		}
		peopleManager.prototype.addHealth = function() {
			if(people.health<5) {
				people.health++;
				this.hpNum.frame = people.health;
			}
			// hpLabel.text = people.health;
		};
		peopleManager.prototype.subHealth = function(num) {
			if(this.changeRed) {
				game.time.events.remove(this.changeRed);
			}
			people.color = 'red';
			if(people.frame < 2) {
				people.frame += 2;
			}
			this.changeRed = game.time.events.add(4000,function(){
				if(people.frame >= 2) {
					people.frame -= 2;
					people.color = 'green';
				}
			},this);
			if(num) {
				/* 扣两血 */
				if(people.health<2) {
					people.health -= 1;
				} else {
					people.health -= 2;
				}
			} else {
				people.health --;
			}
			this.hpNum.frame = people.health;
			if(people.health <= 0) {
				people.health = 0;
				this.hpNum.frame = people.health;
				game.paused = true;
				alert('game over');
			}
			// hpLabel.text = people.health;
		}
		peopleManager.prototype.init = function() {
			game.physics.arcade.enable(people);
			people.body.gravity.y = 2000;
			people.checkWorldBounds = true;
			people.outOfBoundsKill = true;
			people.body.collideWorldBounds = true;
			people.events.onKilled.add(function(){
				/*game over*/
				game.paused = true;
				alert('game.over,score:' + score);
			});

			this.bindEvents();

			/*create platform*/
			this.platformBox = new platformManager();
			this.platformBox.init();

			/*create top stab*/
			stabBox = game.add.sprite(0,0,'top');
			stabBoxH = game.cache.getImage('top').height/1254*game.height;
			stabBox.width = game.width;
			stabBox.height = stabBoxH;
			game.physics.arcade.enable(stabBox);
		};
		peopleManager.prototype.addScore = function(num) {
			score += (num||1);
			scoreLabel.text = score;
			this.platformBox.changeVelocity(7-score/100*6);
			if(score>=100) {
				game.paused = true;
				alert('win');
			}
		}
		peopleManager.prototype.bindEvents = function() {
			var selfBind = this;
			var onDownNum = 0;
			game.input.onDown.add(function(e){
				if(people) {
					onDownNum++;
					isDown = true;
					if(e.x*2>game.width/2) {
						/*right*/
						if(subSpeed == false) {
							people.body.velocity.x = selfBind.velocity;
						} else if(subSpeed == 'left') {
							people.body.velocity.x = selfBind.velocity*0.5;
						} else if(subSpeed == 'right') {
							people.body.velocity.x = selfBind.velocity*1.5;
						}
						// people.animations.play('right');
						if(people.color == 'green') {
							people.frame = 1;
						} else {
							people.frame = 3;
						}
					} else {
						/*left*/
						if(subSpeed == false) {
							people.body.velocity.x = -selfBind.velocity;
						} else if(subSpeed == 'left') {
							people.body.velocity.x = -selfBind.velocity*1.5;
						} else if(subSpeed == 'right') {
							people.body.velocity.x = -selfBind.velocity*0.5;
						}
						if(people.color == 'green') {
							people.frame = 0;
						} else {
							people.frame = 2;
						}
					}
				}
			});

			game.input.onUp.add(function(){
				onDownNum--;
				if(onDownNum==0) {
					people.body.velocity.x = 0;
					isDown = false;
				}
			});
		};
		var platformManager = function() {
			platformGroup = game.add.group();
			this.platformNum = 8;
			this.margin = game.cache.getImage('common').height + 25;
		};
		platformManager.prototype.randomplatformX = function(){
			this.platformWidth = game.cache.getImage('common').width/750*canvasWidth/2;
			return Math.ceil(Math.random()*(game.width-this.platformWidth*2) + this.platformWidth);
		};
		platformManager.prototype.changeVelocity = function(time) {
			this.speedTime = time || 7; /* 5s */

			this.speed = -Math.floor(canvasHeight / this.speedTime);
			platformGroup.forEachAlive(function(one){
				one.body.velocity.y = this.speed;
			},this);
			if(this.createTime) {
				game.time.events.remove(this.createTime);
			}
			this.createTime = game.time.events.loop(this.speedTime*1000/this.platformNum, this.addPlatform, this);
			console.log('change');
		};
		platformManager.prototype.init = function() {
			this.changeVelocity();
			/*create first floor*/
			var one = platformGroup.create(game.world.centerX,people.position.y,'common',0);
			one.width = 198/750*canvasWidth;
			one.height = 40/1254*canvasHeight;
			one.anchor.setTo(0.5,0);
			game.physics.arcade.enable(one);
			one.body.immovable = true;
			one.checkWorldBounds = true;
			one.outOfBoundsKill = true;
			one.body.velocity.y = this.speed;
			one.type = 1;
			/*  */
			// var one = platformGroup.create(game.world.centerX,people.position.y+this.margin,'platform',0);
			// var num = game.height/2
			for(var j=1;j<=3;j++) {
				this.addPlatform(one.position.y + (game.height/8)*j);
			}

		};
		platformManager.prototype.addPlatform = function(y) {
			var platformH = game.cache.getImage('common').height;
			var platformW = game.cache.getImage('common').width;
			var oneType = this.randomType();
			var oneY = y||game.height;
			var platformName;
			if(oneType == 1) {
				platformName = 'common';
			} else if(oneType == 2) {
				platformName = 'stab';
			} else if(oneType == 3) {
				var direction = (Math.random()>0.5?'left':'right');
				platformName = direction;
			} else if(oneType == 4) {
				platformName = 'spring';
			} else if(oneType == 5) {
				platformName = 'hidden';
			}
			var one = platformGroup.create(this.randomplatformX(),oneY,platformName,0);
			one.width = platformW/750*canvasWidth;
			one.height = platformH/1254*canvasHeight;
			one.anchor.setTo(0.5,0);
			game.physics.arcade.enable(one);
			one.body.immovable = true;
			one.checkWorldBounds = true;
			one.outOfBoundsKill = true;
			one.body.velocity.y = this.speed;
			one.type = oneType;
			one.body.checkCollision.left = false;
			one.body.checkCollision.down = false;
			one.body.checkCollision.right = false;
			if(one.type == 3) {
				one.direction = platformName;
				one.animations.add('roll',[0,1,2],10,true);
				one.animations.play('roll');
			}
			if(one.type == 2) {
				one.body.setSize(platformW, game.cache.getImage('common').height, 0, 28/68*one.height);
			}
			if(one.type == 4) {
				one.animations.add('jump',[0,1,2,1,0],10,false);
				one.anchor.setTo(0.5,1);
				one.position.y += game.cache.getImage('common').height;
			}
			one.frame = one.type-1;
		};
		platformManager.prototype.randomType = function() {
			/*
				1 普通板
				2 尖刺板
				3 滚动版
				4 弹簧板
				5 消失板
			*/
			var num = Math.random();
			if(num <0.4) {
				return 1;
			} else if(num<0.6) {
				return 2;
			} else if(num<0.7) {
				return 3;
			} else if(num<0.8) {
				return 4;
			} else if(num<1) {
				return 5;
			}
		}
		// State - end
		// 游戏结束界面
		game.States.end = function() {
			this.create = function() {
				// 游戏结束

			}
		};

		game.state.add('boot',game.States.boot);
		game.state.add('preload',game.States.preload);
		game.state.add('create',game.States.create);
		game.state.add('play',game.States.play);
		game.state.add('end',game.States.end);
		game.state.start('boot');
	}

};



/* 音乐管理器 */
var MusicManager = function(gameInstance, deviceInfo, assets) {
	this.gameInstance = gameInstance;
	this.deviceInfo = deviceInfo;
	this.assets = assets;
	this.init();
};
MusicManager.prototype = {
	// 游戏实例
	gameInstance : null,
	// 设备信息
	deviceInfo : null,
	// 资源
	assets : null,
	// 音乐对象
	musicObject : null,
	// 静音标记
	isBaned : false,
	// 是否播放中
	isPlaying : false,
	// 正在播放列表
	playingList : [],
	// 初始化
	init : function() {
		var self = this;
		if (this.assets) {
			this.musicObject = {};
			for (var index=0,len = this.assets.length;index<len;index++) {
				var audio = this.gameInstance.add.audio(this.assets[index]);
				audio.name = this.assets[index];
				audio.onPause.add(function() {
					self.playingList = self.playingList.splice(self.playingList.indexOf(audio.name), 1);
					if (self.playingList.length == 0) self.isPlaying = false;
				});
				audio.onStop.add(function() {
					self.playingList = self.playingList.splice(self.playingList.indexOf(audio.name), 1);
					if (self.playingList.length == 0) self.isPlaying = false;
				});
				this.musicObject[this.assets[index]] = audio;
			}
		}
	},
	// 播放
	play : function(assetName, loop) {
		if (!this.isBaned) {
			var playTag = false;
			if (this.deviceInfo.platform == "apple") {
				playTag = true;
			} else if (this.deviceInfo.platform == "android" && !this.isPlaying) {
				playTag = true;
			}
			if (playTag) {
				if (loop) {
					if (!this.musicObject[assetName].isPlaying){
						this.musicObject[assetName].loopFull();
						this.playingList.push(assetName);
					}
				} else {
					if (!this.musicObject[assetName].isPlaying) {
						this.musicObject[assetName].play();
						this.playingList.push(assetName);
					}
				}
				this.isPlaying = true;
			}
		}
	},
	resume : function() {
		for (var item in this.playingList) {
			var name = this.playingList[item];
			this.musicObject[name].resume();
		}
		this.isPlaying = true;
	},
	pause : function() {
		for (var item in this.playingList) {
			var name = this.playingList[item];
			this.musicObject[name].pause();
		}
		this.isPlaying = false;
	},
	stop : function() {
		for (var item in this.playingList) {
			var name = this.playingList[item];
			this.musicObject[name].stop();
		}
		this.isPlaying = false;
		this.playingList = [];
	},
	ban : function() {
		this.isBaned = true;
		this.pause();
	},
	disban : function() {
		this.isBaned = false;
		this.resume();
	}
};
