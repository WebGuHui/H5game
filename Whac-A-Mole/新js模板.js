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
				game.load.atlasJSONArray('crocodile',config['crocodile'][0],config['crocodile'][1]);
				game.load.image('top',config['top']);
				game.load.image('mask','//24haowan-cdn.shanyougame.com/Whac-A-Mole/assets/mobile/mask.png');
				game.load.image('hole','//24haowan-cdn.shanyougame.com/Whac-A-Mole/assets/mobile/hole.png');
				game.load.image('clock','//24haowan-cdn.shanyougame.com/Whac-A-Mole/assets/mobile/clock.png');
				game.load.image('scoreTip','//24haowan-cdn.shanyougame.com/Whac-A-Mole/assets/mobile/scoreTip.png');
				//onloadcomplete game.state.start('create');
				//加载音效
				if(self.device.platform != 'android') {

				}
			};
		};

		// State - create
		// 开始界面
		game.States.create = function() {
			this.create = function() {
				//添加音效
				self.musicManager = new MusicManager(game, self.device, []);
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
				var playGame = new gameManager();
			};
			this.update = function() {

			};
		};

		var gameManager = function(){
			this.crocodileList = [];
			this.animation_rise = [];
			this.animation_falling = [];
			this.score = 0;
			this.time = 30;
			this.timeLabel = null;
			this.init();
		}
		gameManager.prototype.init = function(){
			/* 背景 */
			game.stage.backgroundColor = '#59d3b3';

			var topPhoto = game.add.image(0,0,'top');
			topPhoto.width = game.width;
			topPhoto.height = game.height*0.4;

			//洞
			this.holeGroup = game.add.group();
			//鳄鱼
			this.crocodileGroup = game.add.group();
			//遮罩
			this.maskGroup = game.add.group();

			//创建洞和遮罩
			this.createHole();

			//点击事件
			this.bindEvent();

			//开始计时
			this.createTime();

			//开始有分数
			this.setScoreLabel();

			//开始游戏
			this.startGame();
		}

		gameManager.prototype.startGame = function(time){
			var time = time || 750;
			var selfStart = this;
			if(this.loopTime) {
				this.loopTime.removeAll();

			} else {
				this.loopTime = game.time.create(false);
			}
			this.loopTime.loop(time,function(){
				selfStart.getCrocodileIndex();
			});
			this.loopTime.start();
			// 	//产生鳄鱼函数
		}
		gameManager.prototype.setScoreLabel = function(){
			if(!this.scoreLabel) {
				this.scoreLabel = game.add.text(15,10,this.score,{fontSize:'60px',fill:'#517e8c'});
				this.scoreLabel.anchor.setTo(0,0);
			} else {
				this.scoreLabel.text = this.score;
			}
		}
		gameManager.prototype.addScoreAnimate = function(one){
			var oneScore = game.add.image(one.position.x,one.position.y,'scoreTip');
			oneScore.anchor.setTo(0.5,1);
			oneScore.alpha  = 0.8;
			// setTimeout(function(){
			var animate = game.add.tween(oneScore.position).to({y:oneScore.position.y - 30},1000,'Linear',true,0,0,false);
			animate.onComplete.add(function(){
				oneScore.kill();
			})
			// oneScore.tint = '0x'
		}
		gameManager.prototype.createTime = function(){
			var selfCreate = this;
			this.timer = game.time.create(false);
			this.setTimeLabel();
			this.timer.loop(1000,function(){
				selfCreate.time--;
				selfCreate.setTimeLabel();

				if(selfCreate.time == 10) {
					selfCreate.startGame(400);
				} else if (selfCreate.time == 20) {
					selfCreate.startGame(500);
				}
				if(selfCreate.time == 0) {
					game.paused = true;
					this.timer.pause();
					clearInterval(selfCreate.loopTime);
					// alert('score:' + selfCreate.level);
					setGameScore({
						'game_score':selfCreate.level,
						'game_id':game_info['game_id'],
						'device_type':self.device.platform
					});
					game.state.start('end');
				}
			},this);
			this.timer.start();
		}
		gameManager.prototype.setTimeLabel = function(){
			if(!this.timeLabel) {

				this.timeLabel = game.add.text(game.width*0.9-15,10,this.time,{fontSize:'60px',fill:'#517e8c'});
				this.timeLabel.bringToTop();
				this.timeLabel.anchor.setTo(0,0);
				this.timeLogo = game.add.image(game.width*0.9-30,10,'clock');
				this.timeLogo.anchor.setTo(1,0);
				this.timeLogo.tint = '0x517e8c';
			} else {
				this.timeLabel.text = this.time;
			}
		}
		gameManager.prototype.bindEvent = function(){
			var selfEvent = this;
			game.input.onDown.add(function(e){
				selfEvent.crocodileGroup.forEachAlive(function(one){
					if(one.canDown == true && e.x*2>one.position.x-one.width/2 && e.x*2<one.position.x + one.width/2 && e.y*2 > one.position.y && e.y*2< one.position.y+one.height*0.75) {
						var index = one.index;
						selfEvent.animation_rise[index] && selfEvent.animation_rise[index].stop();
						selfEvent.animation_falling[index] && selfEvent.animation_falling[index].stop();
						one.frame = 1;
						one.canDown = false;
						selfEvent.score++;
						selfEvent.setScoreLabel();
						selfEvent.addScoreAnimate(one);
						setTimeout(function(){
							selfEvent.crocodileList[index] = false;
							one.kill();
						},1000);
					}
				});
			});
		}

		gameManager.prototype.createHole = function(){
			var squareWidth = game.width/3;
			for(var i=0;i<9;i++) {
				/* 初始化鳄鱼数组 */
				this.crocodileList[i] = false;
				/* 造洞造遮罩 */
				if(i<3) {
					var holeX = squareWidth*i + squareWidth/2;
					var holeY = game.height*0.4 + game.height*0.2*0 + 10;
				} else if(i<6) {
					var holeX = squareWidth*(i-3) + squareWidth/2;
					var holeY = game.height*0.4 + game.height*0.2*1 + 10;
				} else {
					var holeX = squareWidth*(i-6) + squareWidth/2;
					var holeY = game.height*0.4 + game.height*0.2*2 + 10;
				}
				var holeone = this.holeGroup.create(holeX,holeY,'hole');
				holeone.anchor.setTo(0.5,0);
				holeone.width = squareWidth*0.8;
				holeone.height = squareWidth*0.8/2;

				var maskone = this.maskGroup.create(holeX,holeY+holeone.height*0.5,'mask');
				maskone.anchor.setTo(0.5,0);
				maskone.width = squareWidth*0.8;
				maskone.height = squareWidth*0.8/1.2;
			}
		}

		gameManager.prototype.getCrocodileIndex = function(){
			var crocodileone;
			var randomNum = 0;
			var canRandom = true;
			do{
				randomNum++;
				var randomIndex = Math.floor(Math.random()*9);
				crocodileone = this.crocodileList[randomIndex];
				if(randomNum == 9) {
					crocodileone = true;
					canRandom = false;
				}
			}while(crocodileone);
			if(canRandom) {
				this.crocodileList[randomIndex] = true;
				this.createCrocodile(randomIndex);
			}
		}

		gameManager.prototype.createCrocodile = function(index){
			var selfCreate = this;
			var mask = this.maskGroup.getChildAt(index);
			var animationTime = 350;
			var one = this.crocodileGroup.create(mask.position.x,mask.position.y,'crocodile');
			one.anchor.setTo(0.5,0);
			one.width *= 0.8;
			one.height *= 0.7;
			one.canDown = true;
			one.index = index;

			selfCreate.animation_rise[index] = game.add.tween(one.position).to({y: mask.position.y - one.height*0.6},animationTime,'Linear',true,0,0,false);
			selfCreate.animation_rise[index].onComplete.addOnce(function(){
				selfCreate.animation_rise[index] = null;
				if(one.canDown) {
					selfCreate.animation_falling[index] = game.add.tween(one.position).to({y: mask.position.y},animationTime,'Linear',true,0,0,false);
					selfCreate.animation_falling[index].onComplete.addOnce(function(){
						selfCreate.animation_falling[index] = null;
						if(one.canDown) {
							selfCreate.crocodileList[index] = false;
							one.kill();
						}
					});
				}
			});
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
