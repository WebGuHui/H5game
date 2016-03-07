/********************************************
	// 设置分数
	$('.over_menu .score').text(score);
	$('.over_menu .best').text(max_score);
	// 显示结束界面
	$('#over_box').show();
	$('#over_box .over-btn-container').show();
	//发送分数
	setGameScore(score,getBadge(score),resetShareText());
	//排行榜接口
	showRankBox();
	//隐藏开始图片
	hiddenImg();
	//隐藏开始用户信息
	hiddenLabel();
********************************************/

var game,
	isInit = false;
var bgRatio_mobile = 828/1344;
var bgRatio_pad = 1408/2048;

// 设备类型
var device = (navigator.userAgent.indexOf("iPad") > -1) ? 'pad' : 'mobile';
var device_name = (navigator.userAgent.toLowerCase().indexOf('android')<0)?'apple':'android';

$(function(){

	if(window.innerWidth<window.innerHeight) {
		var canvasWidth = window.innerWidth*2;
		var canvasHeight = window.innerHeight*2;
		var ratio = canvasWidth/canvasHeight; 
	}

	function initGame() {
		game = new Phaser.Game(canvasWidth,canvasHeight,Phaser.CANVAS,'game_div');
		isInit = true;
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
				game.load.audio('fizzing','assets/audio/fizzing.mp3');
				game.load.audio('shake','assets/audio/shake.mp3');

				game.load.image('drink','assets/' + device + '/drink.png');
				game.load.spritesheet('tomatina','assets/' + device + '/tomatina.png',712,698);
				game.load.image('empty','assets/' + device + '/empty.png');
				game.load.image('fill','assets/' + device + '/fill.png');
				game.load.image('title','assets/' + device + '/title.png');
				game.load.image('bg','assets/' + device + '/bg.png');
				game.load.atlasJSONArray('logo','assets/' + device + '/logo.png','assets/' + device + '/logo.json');
			};
			this.create = function(){
				game.state.start('create');
			};
		}

		//开始的菜单模块
		game.States.create = function(){
			this.create = function() {
				//显示开始菜单页面 使用dom构建
				$('#start_menu').show();
			}
		}

		game.States.play = function(){
			this.create = function(){
				var shakeBox = new shakeManager();
				shakeBox.init();
			};
			this.update = function(){

			};
		}

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
			this.createProgress();
			this.bindEvent();
			
		};
		shakeManager.prototype.createProgress = function() {
			var self = this;
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
			var self = this;
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
					if(-self.rect.x < self.progress_fill_width) {
						self.rect.x -= 2;
					} else {
						self.rect.x = -self.progress_fill_width;
					}
					self.remainingLabel.text = Math.floor((-self.rect.x/self.progress_fill_width)*100) + '%';
					self.progress_fill.crop(self.rect);
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
						if(self.musicPlay == false) {
							self.musicPlay = true;
							self.shake.play();
							self.shake.onStop.add(function(){
								self.musicPlay = false;
							})
						};
						self.logo.frame = 2;
						self.one = false;
						if(!self.label) {
							self.timeLabel();
						}

						if(speed > 800) {
							self.rect.x += 2;
						} else {
							self.rect.x++;
						}
						self.remainingLabel.text = Math.floor((-self.rect.x/self.progress_fill_width)*100) + '%';
						self.progress_fill.crop(self.rect);
						subTimer.start();
						if(self.rect.x >= 0) {
							subTimer.pause();
							self.rect.x = 0;
							self.progress_fill.crop(self.rect);
							self.fizzing.play();
							// alert('你花了 ' + self.time.toFixed(2).replace('.',':') + 's 摇完了，麒麟臂啊兄弟');
							window.removeEventListener('devicemotion',deviceMotionHandler,false);
							self.timer.pause();
							var tomatina = game.add.sprite(game.world.centerX,self.coke.position.y-self.coke.height,'tomatina',0);
							console.log(asd = this.coke);
							tomatina.anchor.setTo(0.5,0.5);
							tomatina.width *= 0.5;
							tomatina.height *= 0.5;
							tomatina.animations.add('water',[0,1,2,3],5,5);
							tomatina.animations.play('water');
							self.coke.bringToTop();
							self.logo.bringToTop();
							self.label.bringToTop();
							self.remainingLabel.text = '0%';
							self.remainingLabel.bringToTop();
							// game.paused = true;
						}
					}else {
						if(speed > 300){
							if(self.one) {
								self.logo.frame = 1;
								self.one = false;
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
		game.state.add('boot',game.States.boot);
		game.state.add('preload',game.States.preload);
		game.state.add('create',game.States.create);
		game.state.add('play',game.States.play);
		game.state.start('boot');
	}

	var musicManager = function(){
		this.musicBox = {};
	};
	musicManager.prototype.init = function(){
		
	}
	musicManager.prototype.play = function(name){
		
	}

	//文案分享接口
	function resetShareText() {
	    var obj = {
	            share:"“点击右上方，炫耀自己打掉恶魔的成绩”",
	            default:"助方块长老一臂之力，清掉所有恶魔方块",
	            title:"我在打掉魔块中取得了{score}分，打败了全国{persent}%人，快来帮忙拯救小方块",
	            desc:"恶魔军团，绑架了方块家族成员作人质，助方块长老一臂之力，清掉所有恶魔方块。",
	            imgUrl:"http://24haowan-cdn.shanyougame.com/BreakSquare/pic_title.png",
	    };
	    /*平台会把 {score} 替换成分数 把 {persent} 替换成百分比*/
	    return obj;
	}

	//分数规则接口
	function getBadge(score) {
	    if(score>=3000) {
	        return 1;
	    } else if(score>=2500) {
	        return 2;
	    } else if(score>=1500) {
	        return 3;
	    } else {
	        return 0;
	    }
	}
	function reloadData() {
		// 屏幕数据
		canvasWidth = window.innerWidth*2;
		canvasHeight = window.innerHeight*2;
		ratio = canvasWidth/canvasHeight;
	}
	function rotation() {
		window.addEventListener("orientationchange", orientationChanged, false);

		function orientationChanged() {
			if(window.orientation==180 || window.orientation==0){ // 竖屏状态
				reloadData();
				if(!isInit) initGame();
				game.paused = false;
				$(game.canvas).css("width", canvasWidth/2);
				$(game.canvas).css("height", canvasHeight/2);
				$("#rotate-box").css("display", "none");
		    } else if (window.orientation==90 || window.orientation==-90) {
		    	$("#rotate-box").css("display", "-webkit-box");
		    	if(isInit) {
			    	game.paused = true;
		    	}
		    }
		}
		orientationChanged();
		if (window.orientation == undefined && !isInit) initGame();
	}
	rotation(); 
});


$(function(){
	/*开始页面模块*/
	$('#start_menu .start_btn').on('tap',function(){
		game.state.start('play');
		$('#start_menu').hide();
		// hiddenLabel();
	});
	$('#start_menu .rank_btn').on('tap',function(){
		showRankBox();
	});

	/*结束页面模块*/
	$("#over_box .over-btn-replay").on("tap", function() {
		game.state.start("create");
		game.paused = false;
		$('#over_box').hide();
		$('#over_box .over-btn-container').hide();
	});
	$("#over_box .over-btn-more").on("tap", function() {
		location.href = "http://24haowan.shanyougame.com/main/subject";
	});
	$("#over_box .over-btn-rank").on("tap", function() {
		showRankBox();
	});



	/*暂停页面模块*/
	$('.pause_btn').on('tap',function(){
		game.paused = true;
		$('.pause_div').show();
		$('.mask').show();
	});

	$('.pause_div .exit').on('tap',function(){
		$('.pause_div').hide();
		$('.mask').hide();
		game.state.start('play');
		game.paused = false;
	});

	$('.pause_div .goon').on('tap',function(){
		game.paused = false;
		$('.pause_div').hide();
		$('.mask').hide();
	});
});
