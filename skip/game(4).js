/** 
 * 游戏初始化方法
 * 
 * bestScore (float) 最高分数
 * assetsConfig (object) 资源配置
**/
var Game = function(bestScore, domId) {
	this.bestScore = bestScore || 0;
	this.domId = domId || '';
	// 初始化设备信息
	this.initDevice();
	// 初始化画布大小
	this.initCanvasSize();
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
				game.state.start('preload');
			};
		};

		// State - preload
		// 加载游戏所需资源
		game.States.preload = function() {
			this.preload = function() {
				// 加载资源
				//onloadcomplete game.state.start('create');
			};
		};

		// State - create
		// 开始界面
		game.States.create = function() {
			this.create = function() {
				//显示开始菜单页面 使用dom构建
				$('#start_menu').show();
			}
		};

		// State - play
		// 游戏界面
		game.States.play = function(){
			this.create = function() {
				// 此处开始写游戏逻辑

			};
			this.update = function() {

			};
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
	},
	// 计算得分对应奖牌
	getBadge : function() {
		if(this.score >= 3000) {
	        return 1;
	    } else if(this.score >= 2500) {
	        return 2;
	    } else if(this.score >= 1500) {
	        return 3;
	    } else {
	        return 0;
	    }
	}
};



/* 音乐管理器 */
var MusicManager = function(gameInstance, deviceInfo) {
	this.gameInstance = gameInstance;
	this.deviceInfo = deviceInfo;
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
					this.musicObject[assetName].loopFull();
				} else {
					this.musicObject[assetName].play();
				}
				this.playingList.push(assetName);
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
