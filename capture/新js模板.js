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
				game.load.image('phone0',config['phone0']);
				game.load.image('phone1',config['phone1']);
				game.load.image('camera',config['camera']);
				game.load.image('capture',config['capture']);
				game.load.atlasJSONArray('countDown','http://24haowan-cdn.shanyougame.com/collectBox/assets/mobile/countDown.png','http://24haowan-cdn.shanyougame.com/collectBox/assets/mobile/countDown.json');
				game.load.audio('bgMusic',config['music_bg']);
				//onloadcomplete game.state.start('create');
				//加载音效
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

		var phoneSize = {width: 0, height: 0};
		var captureY, captureDistance;
		var phoneObject;
		var tapEnable = false;
		var captureRec;
		// State - play
		// 游戏界面
		game.States.play = function(){
			this.create = function(){
				if(self.config['game']['bg'].indexOf('#') == 0){
					game.stage.backgroundColor = self.config['game']['bg'];
				} else {
					var bg = game.add.image(0, 0, "bg");
					bg.width = self.canvasSize.width;
					bg.height = self.canvasSize.height;
				}
				var selfPlay = this;
				score = 0;
				// 添加背景图片
				var bg = game.add.image(0, 0, "bg");
				bg.width = self.canvasSize.width;
				bg.height = self.canvasSize.height;
				// 生成手机
				this.createPhone();
				// 显示拍摄按钮
				var captureBtnPic = game.cache.getImage("camera");
				var captureBtn = game.add.image(game.world.centerX, self.canvasSize.height*0.85, "camera");
				captureBtn.width = self.canvasSize.width*0.4;
				captureBtn.height = captureBtn.width/(captureBtnPic.width/captureBtnPic.height);
				captureBtn.anchor.set(0.5, 0.5);
				// 显示拍摄框
				var captureRecPic = game.cache.getImage("capture");
				captureRec = game.add.image(game.world.centerX, self.canvasSize.height*0.25, "capture");
				captureRec.width = self.canvasSize.width*0.5;
				captureRec.height = captureRec.width/(captureRecPic.width/captureRecPic.height);
				captureRec.anchor.set(0.5, 0.5);
				captureY = captureRec.y;
				captureDistance = captureRec.height/2;
				// 倒数蒙版
				var countDownMaskBitmap = game.add.bitmapData(self.canvasSize.width, self.canvasSize.height);
				countDownMaskBitmap.ctx.beginPath();
				countDownMaskBitmap.ctx.rect(0, 0, countDownMaskBitmap.width, countDownMaskBitmap.height);
				countDownMaskBitmap.ctx.fill();
				var countDownMask = game.add.sprite(0, 0, countDownMaskBitmap);
				countDownMask.alpha = 0.6;
				// 倒数
				var countDown = game.add.sprite(game.world.centerX, game.world.centerY, 'countDown', 3);
				countDown.anchor.setTo(0.5);
				var countDownAnimation = countDown.animations.add('countDown', [2,1,0], 1, false);
				countDownAnimation.play();
				countDownAnimation.onComplete.add(function(){
					countDownMask.kill();
					countDown.destroy();
					var randomTime = 500+Math.random()*2000;
					setTimeout(function() {
						selfPlay.startToPlay();
						$(game.canvas).on("touchstart", function() {
							if (tapEnable) selfPlay.capture();
						});
					}, randomTime);
				});
			};
			this.update = function(){

			};
			this.capture = function() {
				
				// 停下来
				phoneObject.body.angularVelocity = 0;
				phoneObject.body.gravity.y = 0;
				phoneObject.body.velocity.y = 0;
				// 删除聚焦框
				captureRec.destroy();
				// 计算相差距离
				var rotation = phoneObject.body.rotation/180*Math.PI;
				var phoneY = phoneObject.y;
				var delta = phoneY-captureY;
				var multiply = (parseInt(phoneObject.type) == 0) ? 1 : 1.5;
				// 拍照
				var phonePic = game.cache.getImage("phone"+phoneObject.type);
				var bitmap = game.add.bitmapData(captureRec.width+10, captureRec.width+10);
				// 背景
				bitmap.ctx.beginPath();
				bitmap.ctx.rect(10, 10, bitmap.width-30, bitmap.height-30);
				bitmap.ctx.fillStyle = "#ffd788";
				bitmap.ctx.fill();
				// 生成旋转的恐龙
				var x = bitmap.width/2;
				var y = bitmap.height/2;
				var drawX = -phoneSize.width/2 + (delta-10)*Math.sin(rotation);
				var drawY = -phoneSize.height/2 + (delta-10)*Math.cos(rotation);
				bitmap.ctx.translate(x, y);
				bitmap.ctx.rotate(rotation);
				bitmap.ctx.drawImage(phonePic, drawX, drawY, phoneSize.width, phoneSize.height);
				bitmap.ctx.rotate(-rotation);
				bitmap.ctx.translate(-x, -y);
				// 阴影
				bitmap.ctx.beginPath();
				bitmap.ctx.fillStyle = "#999999";
				bitmap.ctx.rect(bitmap.width-10, 10, 10, bitmap.height-10);
				bitmap.ctx.fill();
				bitmap.ctx.rect(10, bitmap.height-10, bitmap.width-10, 10);
				bitmap.ctx.fill();
				// 边框
				bitmap.ctx.beginPath();
				bitmap.ctx.lineWidth = 10;
				bitmap.ctx.rect(5, 5, bitmap.width-20, bitmap.height-20);
				bitmap.ctx.strokeStyle = "#ffffff";
				bitmap.ctx.stroke();
				// 添加到画布中
				var photo = game.add.sprite(game.world.centerX+5, captureRec.y+5, bitmap);
				photo.width = self.canvasSize.width*0.5;
				photo.height = self.canvasSize.width*0.5;
				photo.anchor.set(0.5, 0.5);
				// 拍照蒙版
				var maskBitMap = game.add.bitmapData(bitmap.width-30, bitmap.height-30);
				maskBitMap.ctx.rect(0, 0, maskBitMap.width, maskBitMap.height);
				maskBitMap.ctx.fillStyle = "#ffffff";
				maskBitMap.ctx.fill();
				var captureMask = game.add.sprite(captureRec.x, captureRec.y, maskBitMap);
				captureMask.width = maskBitMap.width;
				captureMask.height = maskBitMap.height;
				captureMask.alpha = 0.0;
				captureMask.anchor.set(0.5, 0.5);
				// 删除照片
				phoneObject.destroy();
				// 播放拍照动画
				var maskTween = game.add.tween(captureMask).to({alpha: 0.8}, 80, Phaser.Easing.Linear.None, true, 0, 0, true);
				maskTween.onComplete.add(function() {
					// 删除蒙版
					captureMask.destroy();
					// 旋转照片
					var rotationTween = game.add.tween(photo).to({rotation: Math.PI/10}, 100, Phaser.Easing.Linear.None, true);
					rotationTween.onComplete.add(function() {
						// 计算分数
						score = (1-Math.abs(delta)/captureDistance)*100*multiply;
						score = (score < 0) ? 0 : score;
						score = score.toFixed(2);
						game.paused = true;
						console.log("得分是: "+score);
						setGameScore({
							'game_score':score,
							'game_id':game_info['game_id'],
							'device_type':self.device.platform
						});
						tapEnable = false;
					});
				});
			};
			this.createPhone = function() {
				var selfPlay = this;
				var random = (Math.random() > 0.2) ? 0 : 1;
				var phonePic = game.cache.getImage("phone"+random);
				phoneSize.width = self.canvasSize.width/4;
				phoneSize.height = phoneSize.width/(phonePic.width/phonePic.height);
				phoneObject = game.add.sprite(game.world.centerX, -phoneSize.height, "phone"+random);
				phoneObject.type = random;
				phoneObject.width = phoneSize.width;
				phoneObject.height = phoneSize.height;
				game.physics.startSystem(Phaser.Physics.Arcade);
				game.physics.arcade.enableBody(phoneObject);
				phoneObject.anchor.set(0.5, 0.5);
			};
			this.startToPlay = function() {
				var selfPlay = this;
				var randomVelocity = (Math.random()*60) + 360;
				phoneObject.body.angularVelocity = (Math.random() > 0.5) ? -randomVelocity : randomVelocity;
				var velocity = (parseInt(phoneObject.type) == 1) ? self.canvasSize.height/1.2 : self.canvasSize.height/2;
				phoneObject.body.velocity.y = velocity;
				tapEnable = true;
				setTimeout(function() {
					phoneObject.checkWorldBounds = true;
					phoneObject.events.onOutOfBounds.add(function() {
						// 强制拍摄，0分
						selfPlay.capture();
					});
				}, 500);
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
