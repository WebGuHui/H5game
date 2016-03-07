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
					game.load.image('bg',config['bg']);
				}
				game.load.image('true',config['true']);
				game.load.image('false',config['false']);
				//onloadcomplete game.state.start('create');
				game.load.audio('bgMusic',config['music_bg']);
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

				squareBox = new squareManager();
				squareBox.init();
			};
			this.update = function() {

			};
		};
		var squareManager = function(){
			this.level = 1;
			this.squareNum = 2;
			this.margin = 20;
			this.bgWidth = game.width*0.9;
			this.true;
			this.time = 30;
			this.timeLabel;
			this.timer;
			self.musicObject.play('bgMusic',true);
		};
		squareManager.prototype.reset = function(){
			this.level = 1;
			this.squareNum = 2;
			this.true = null;
			this.squareBox.removeAll();
			this.scoreLabel();
			this.createSquare();
			this.time = 30;
			this.setTimeLabel();
			game.paused = false;
			this.timer.resume();
		};
		squareManager.prototype.createTime = function(){
			var selfCreate = this;
			this.timer = game.time.create(false);
			this.setTimeLabel();
			this.timer.loop(1000,function(){
				selfCreate.time--;
				console.log(selfCreate.time);
				selfCreate.setTimeLabel();
				if(selfCreate.time == 0) {
					game.paused = true;
					this.timer.pause();
					// alert('score:' + selfCreate.level);
					setGameScore({
						'game_score':score,
						'game_id':game_info['game_id'],
						'device_type':self.device.platform
					});
					selfCreate.reset();
				}
			},this);
			// console.log(this.timer);
			this.timer.start();
		};
		squareManager.prototype.setTimeLabel = function(){
			if(!this.timeLabel) {
				this.timeLabel = game.add.text(game.world.centerX,10,this.time,{fontSize:'60px',fill:'#fff'});
				this.timeLabel.bringToTop();
				this.timeLabel.anchor.setTo(0.5,0);
			} else {
				this.timeLabel.text = this.time;
			}
		};
		squareManager.prototype.scoreLabel = function(){
			if(!this.levelLabel) {
				this.levelLabel = game.add.text(10,10,this.level,{fontSize:'60px',fill:'#fff'});
			} else {
				this.levelLabel.text = this.level;
			}
		};
		squareManager.prototype.init = function(){
			this.createBg();
			this.scoreLabel();
			this.createSquare();
			this.bindEvent();
			this.createTime();
		};
		squareManager.prototype.createBg = function(){
			var bgX = (game.width - this.bgWidth)*0.5;
			var bgImage = game.add.bitmapData(bgX,bgX);
			bgImage.ctx.rect(0,0,bgX,bgX);
			bgImage.ctx.fillStyle = '#e88268';
			bgImage.ctx.fill();
			this.bg = game.add.image(bgX,game.height/2-this.bgWidth/2,bgImage);
			this.bg.width = this.bgWidth;
			this.bg.height = this.bgWidth;
			/*bg position x*/
		};
		squareManager.prototype.createSquare = function(){
			this.squareBox = game.add.group();
			this.squareWidth = (this.bgWidth - (this.squareNum+1)*this.margin)/this.squareNum;
			for(var i=0;i<this.squareNum;i++) {
				for(var j=0;j<this.squareNum;j++) {
					var one = this.squareBox.create((j+1)*this.margin+j*this.squareWidth+this.bg.position.x,this.bg.position.y+(i+1)*this.margin+i*this.squareWidth,'false',0);
					one.width = this.squareWidth;
					one.height = this.squareWidth;
				}
			}
			var index = Math.floor(Math.random()*(this.squareNum*this.squareNum));
			this.true = this.squareBox.getChildAt(index).kill();
			this.true = this.squareBox.create(this.true.position.x,this.true.position.y,'true');
			this.true.width = this.true.height =this.squareWidth;
			console.log(asd = this.true);
		};
		squareManager.prototype.upLevel = function(){
			if(this.squareNum<8) {
				this.squareNum++;
			}
			this.level++;
			this.squareBox.removeAll();
			this.scoreLabel();
			this.createSquare();
		};
		squareManager.prototype.bindEvent = function(){
			var self = this;
			game.input.onDown.add(function(e){
				if(self.true) {
					if(e.x*2>self.true.position.x && e.x*2<self.true.position.x+self.true.width && e.y*2>self.true.position.y && e.y*2<self.true.position.y+self.true.width) {
						console.log('nice');
						self.true = null;
						setTimeout(function(){
							self.upLevel();
						},100);
					}
				}
			});
		};
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
