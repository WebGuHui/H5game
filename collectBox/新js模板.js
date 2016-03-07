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
				game.load.image('acceptBtn',config['acceptBtn']);
				game.load.image('throwBtn',config['throwBtn']);
				game.load.image('good',config['good']);
				game.load.image('bad',config['bad']);
				game.load.image('bgMask',config['bgMask']);
				game.load.atlasJSONArray('countDown','http://24haowan-cdn.shanyougame.com/collectBox/assets/mobile/countDown.png','http://24haowan-cdn.shanyougame.com/collectBox/assets/mobile/countDown.json');
				//onloadcomplete game.state.start('create');
				//加载音效
				game.load.audio('bgMusic',config['music_bg']);
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
				if(self.config['game']['bg'].indexOf('#') == 0){
					game.stage.backgroundColor = self.config['game']['bg'];
				} else {
					var bg = game.add.image(0, 0, "bg");
					bg.width = self.canvasSize.width;
					bg.height = self.canvasSize.height;
				}

				box = new boxManager();
				box.init();
			};
			this.update = function() {

			};
		};
		var box;
		var btnLeft;
		var btnRight;
		var time;
		var boxSum = 30;
		var timeLabel;
		var timeNum = 0;
		var timer;
		var gameStart = false;
		//盒子初始化
		var boxManager = function(){
			timeNum = 0;
			this.boxHeight = game.cache.getImage('good').height*0.75;
			this.marginBottom = game.cache.getImage('acceptBtn').height + 150;
			this.boxNum = Math.ceil((game.height - this.marginBottom)/this.boxHeight);
		};
		boxManager.prototype.init = function(){
			box = game.add.group();
			this.boxX = game.world.centerX;
			this.boxY = game.height - this.marginBottom;
			for(var i=0;i<boxSum;i++) {
				var type = Math.floor(Math.random()*2);
				/* 0是左，完整的快递  1是右，破损的快递 */
				var one = box.create(this.boxX,this.boxY - this.boxHeight*i,type==0?'good':'bad');
				one.anchor.setTo(0.5,1);
				one.type = type;
			}
			/*button初始化*/
			var btnBox = new buttonManager();
			btnBox.init();

			timeLabel = game.add.text(game.world.centerX,game.height - 150*game.height/800,'0:00',{font:"30px Microsoft YaHei",fill:"#fff"});
			timeLabel.anchor.setTo(0.5);

			var bgMask = game.add.image(0,0,'bgMask');
			bgMask.width = self.canvasSize.width;
			bgMask.height = self.canvasSize.height;
			var countDown = game.add.sprite(game.world.centerX,game.world.centerY,'countDown',3);
			countDown.anchor.setTo(0.5);
			var countDownAnimation = countDown.animations.add('countDown',[2,1,0],1,false);
			countDownAnimation.play();
			countDownAnimation.onComplete.add(function(){
				countDown.destroy();
				bgMask.kill();
				console.log(asd = bgMask);
				// bgMask.destroy();
				gameStart = true;
				timer = game.time.events.loop(10,function(){
					timeNum += 0.01;
					timeLabel.text = (timeNum.toFixed(2).replace('.',':'));
				},this);
			});
		};

		var buttonManager = function(){
			this.marginBottom = game.cache.getImage('acceptBtn').height;
			this.btnWidth = game.cache.getImage('acceptBtn').width;
			this.btnY = game.height - this.marginBottom;
			this.margin = 10;
		};
		buttonManager.prototype.init = function(){
			this.sum = 0;
			btnLeft = game.add.image(game.world.centerX-this.margin,this.btnY,'acceptBtn');
			btnLeft.anchor.setTo(1,0);
			btnLeft.width = game.width/2 - this.margin;
			btnRight = game.add.image(game.world.centerX+this.margin,this.btnY,'throwBtn');
			btnRight.width = game.width/2 - this.margin;
			// console.log(asd = btnLeft);
			this.bindEvents();
		};
		buttonManager.prototype.bindEvents = function(){
			var selfBind = this;
			var operation = [];
			var operationNum = boxSum;
			var isAnimation = false;

			function animationOperation() {
				if(isAnimation == true) {
					return ; 
				} else {
					if(operation.length>0) {
						isAnimation = true;
						if(operation[0] == 'left') {
							/*0*/
							animationStart(0);
						} else if(operation[0] == 'right') {
							/*1*/
							animationStart(1);
						}
					} else {
						return ;
					}
				}
			} // animationOperation

			function animationStart(type) {
				var one = box.getFirstAlive();
				if(one.type != type) {
					selfBind.gameOver(operationNum);
				} else {
					var diff = (type==0?-one.width:game.width+one.width);
					var moveAnimation = game.add.tween(one).to({x:diff},100,'Linear',true,0,0,false);
					moveAnimation.onComplete.add(function(){
						one.destroy();
						selfBind.downBox();
						setTimeout(function(){
							operationNum--;
							if(operationNum == 0) {
								game.paused = true;
								selfBind.gameOver(operationNum);
							}
							operation.shift();
							isAnimation = false;
							animationOperation();
						},100);
					});
				}
			}

			game.input.onDown.add(function(e){
				if(gameStart) {
					if(e.x*2>=btnLeft.position.x - btnLeft.width && e.x*2<=btnLeft.position.x && e.y*2>=btnLeft.position.y && e.y*2<=btnLeft.position.y+btnLeft.height) {
						operation.push('left');
						animationOperation();
					} else if(e.x*2>=btnRight.position.x && e.x*2<=btnRight.position.x+btnRight.width && e.y*2>=btnRight.position.y && e.y*2<=btnRight.position.y+btnRight.height){
						operation.push('right');
						animationOperation();
					}
				}
			});
		};
		buttonManager.prototype.downBox = function(){
			box.forEachAlive(function(one){
				game.add.tween(one).to({y:one.y+one.height*0.75},50,'Linear',true,0,0,false);
			},this);
		}
		buttonManager.prototype.gameOver = function(num){
			game.paused = true;
			alert('你花了 '  + timeNum.toFixed(2) + 's,处理了:' + (boxSum - num) + '个盒子');
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
