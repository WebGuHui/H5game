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
					game.load.image('water',config['bg']);
				}
				game.load.atlasJSONArray('logo',config['logo'][0],config['logo'][1]);
				game.load.atlasJSONArray('tomatina',config['tomatina'][0],config['tomatina'][1]);
				game.load.image('fill',config['fill']);
				game.load.image('empty',config['empty']);
				game.load.image('title',config['title']);
				game.load.image('drink',config['drink']);
				//onloadcomplete game.state.start('create');
				//加载音效
				game.load.audio('bgMusic',config['music_bg']);
				if(self.device.platform != 'android') {
					game.load.audio('fizzing','http://24haowan-cdn.shanyougame.com/shake/assets/audio/fizzing.mp3');
					game.load.audio('shake','http://24haowan-cdn.shanyougame.com/shake/assets/audio/shake.mp3');
				}
			};
		};

		// State - create
		// 开始界面
		game.States.create = function() {
			this.create = function() {
				//添加音效
				self.musicManager = new MusicManager(game, self.device, ['bgMusic','fizzing','shake']);
				//显示开始菜单页面 使用dom构建
				$('#start-menu').show();
			}
		};

		// State - play
		// 游戏界面
		game.States.play = function(){
			this.create = function() {
				// 此处开始写游戏逻辑
				var shakeBox = new shakeManager();
				shakeBox.init();
			};
			this.update = function() {

			};
		};
		var shakeManager = function() {
			this.label;
			this.remainingLabel;
			this.timer;
			this.time = 0;
			this.num = 0;
			this.progress_fill;
			this.progress_empty;
			this.rect;
			this.one = true;
			this.progress_fill_width;
			this.shake = game.add.audio('shake');
			this.fizzing = game.add.audio('fizzing');
			this.musicPlay = false;
		};
		shakeManager.prototype.init = function() {
			self.musicManager.play('bgMusic',true);
			this.createProgress();
			this.bindEvent();
			
		};
		shakeManager.prototype.createProgress = function() {
			var bg = game.add.image(0,0,'bg');
			bg.width = game.width;
			bg.height = game.height;
			if (device == "mobile") {
				this.progress_empty = game.add.sprite(canvasWidth - 50, (canvasHeight-70)/2+80, 'empty');
				this.progress_empty.angle = -90;
				this.progress_fill = game.add.sprite(canvasWidth - 50, (canvasHeight-70)/2+80, 'fill');
				this.progress_fill_width = this.progress_fill.width;
				this.progress_fill.angle = -90;
			}
			this.coke = game.add.image(game.world.centerX,game.height - 100,'drink');
			this.coke.anchor.setTo(0.5,1);
			this.title = game.add.image(game.world.centerX,10,'title');
			this.title.anchor.setTo(0.5,0);

			this.logo = game.add.image(game.world.centerX,game.world.centerY,'logo',0);
			this.logo.anchor.setTo(0.5,0);

			this.rect = new Phaser.Rectangle(0,0,this.progress_fill.width,this.progress_fill.height);
			this.rect.x = -this.progress_fill.width; /*到0暂停*/
			this.progress_fill.crop(this.rect);
		};
		shakeManager.prototype.bindEvent = function() {
			var selfBind = this;
			var last_update = 0;
			var last_shake_time = 0;
			if (window.DeviceMotionEvent) {
			  window.addEventListener('devicemotion', deviceMotionHandler, false);
			}
			var SHAKE_THRESHOLD = 500;
			var last_update = 0;
			var x=0, y=0, z=0, last_x=0, last_y=0, last_z=0;
			var subTimer = game.time.create();
			subTimer.loop(100,function(){
				var diff = new Date().getTime() - last_shake_time;
				if(diff>1000) {
					if(-selfBind.rect.x < selfBind.progress_fill_width) {
						selfBind.rect.x -= 2;
					} else {
						selfBind.rect.x = -selfBind.progress_fill_width;
					}
					selfBind.remainingLabel.text = Math.floor((-selfBind.rect.x/selfBind.progress_fill_width)*100) + '%';
					selfBind.progress_fill.crop(selfBind.rect);
				}
			},this);
			function deviceMotionHandler(eventData) {
				var acceleration =eventData.accelerationIncludingGravity;
				var curTime = new Date().getTime();
				
				// if ((curTime - last_update)> 300) {
					var diffTime = curTime -last_update;
					last_update = curTime;
					x = acceleration.x;
					y = acceleration.y;
					z = acceleration.z;
					var speed = Math.abs(x + y + z - last_x - last_y - last_z) / diffTime * 10000;
					if (speed > SHAKE_THRESHOLD) {
						last_shake_time = new Date().getTime();
						self.musicManager.play('shake');
						selfBind.logo.frame = 2;
						selfBind.one = false;
						if(!selfBind.label) {
							selfBind.timeLabel();
						}

						if(speed > 800) {
							selfBind.rect.x += 2;
						} else {
							selfBind.rect.x++;
						}
						selfBind.remainingLabel.text = Math.floor((-selfBind.rect.x/selfBind.progress_fill_width)*100) + '%';
						selfBind.progress_fill.crop(selfBind.rect);
						subTimer.start();
						if(selfBind.rect.x >= 0) {
							subTimer.pause();
							selfBind.rect.x = 0;
							selfBind.progress_fill.crop(selfBind.rect);
							self.musicManager.play('fizzing');
							alert('你花了 ' + selfBind.time.toFixed(2).replace('.',':') + 's 摇完了，麒麟臂啊兄弟');
							window.removeEventListener('devicemotion',deviceMotionHandler,false);
							selfBind.timer.pause();
							var tomatina = game.add.sprite(game.world.centerX,selfBind.coke.position.y-selfBind.coke.height,'tomatina',0);
							console.log(asd = this.coke);
							tomatina.anchor.setTo(0.5,0.5);
							tomatina.width *= 0.5;
							tomatina.height *= 0.5;
							tomatina.animations.add('water',[0,1,2,3],5,5);
							tomatina.animations.play('water');
							selfBind.coke.bringToTop();
							selfBind.logo.bringToTop();
							selfBind.label.bringToTop();
							selfBind.remainingLabel.text = '0%';
							selfBind.remainingLabel.bringToTop();
							// game.paused = true;
						}
					}else {
						if(speed > 300){
							if(selfBind.one) {
								selfBind.logo.frame = 1;
								selfBind.one = false;
							}
						} 
					}
					last_x = x;
					last_y = y;
					last_z = z;
				// }
			}
		};
		shakeManager.prototype.timeLabel = function() {
			var self = this;
			this.label = game.add.text(game.world.centerX,self.logo.position.y + 80,'0:00',{font:"50px Microsoft YaHei",fill:"#fff"});
			this.label.anchor.setTo(0.5,0);
			self.timer = game.time.create();
			self.timer.loop(10,function(){
				self.time += 0.015;
				self.label.text = self.time.toFixed(2);
			},this);
			self.timer.start();
			this.remainingLabel = game.add.text(self.logo.position.x - 25,self.logo.position.y + 220, '100%',{font:"30px Miscrosoft YaHei",fill:"#fff100"});
			this.remainingLabel.anchor.setTo(1,0);
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
			for (var index in assets) {
				var audio = this.gameInstance.add.audio(assets[index]);
				audio.name = assets[index];
				audio.onPause.add(function() {
					self.playingList = self.playingList.splice(self.playingList.indexOf(audio.name), 1);
					if (self.playingList.length == 0) self.isPlaying = false;
				});
				audio.onStop.add(function() {
					self.playingList = self.playingList.splice(self.playingList.indexOf(audio.name), 1);
					if (self.playingList.length == 0) self.isPlaying = false;
				});
				this.musicObject[assets[index]] = audio;
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
