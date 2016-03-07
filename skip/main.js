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

var score = 0;
var max_score = 0;

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

		var audioManager;

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
				game.load.spritesheet('man', 'assets/'+device+'/doge.png', 87, 109);
				game.load.image('water', 'assets/'+device+'/water.png');
				game.load.image('platform', 'assets/'+device+'/platform.png');
				game.load.image('diamond', 'assets/'+device+'/drink.png');
				game.load.image('scoreLogo', 'assets/'+device+'/score_logo.png');
				game.load.image('item001', 'assets/'+device+'/item001.png');
				game.load.image('item002', 'assets/'+device+'/item002.png');
				game.load.image('item003', 'assets/'+device+'/item003.png');
				game.load.audio('bg', 'assets/audio/bg.mp3');
				if (device_name == "apple") {
					game.load.audio('dead', 'assets/audio/dead.mp3');
					game.load.audio('pickup', 'assets/audio/pickup.mp3');
					game.load.audio('move', 'assets/audio/move.mp3');
				}
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

				// 添加声效素材
				audioManager = new musicManager();
				audioManager.init();
			}
		}

		var startX = canvasWidth*2/7;
		var startY = canvasHeight/3;
		var platformWidth = canvasWidth/7;
		var manObject;
		var balls;
		var diamondObject;
		var scoreText;

		game.States.play = function(){
			var ball = null;
			this.create = function(){
				var _this = this;
				score = 0;
				if (ball) clearInterval(ball.createInterval);
				// 显示暂停按钮
				$('.pause_btn').show();
				// 播放背景音乐
				audioManager.bgLoop();
				// 页面不可见时暂停
				document.addEventListener("webkitvisibilitychange", function() {
					if (document.visibilityState == "hidden") {
						game.paused = true;
					}
				});
				// 开启物理引擎
				game.physics.startSystem(Phaser.Physics.ARCADE);
				// 添加背景
				var bg = game.add.image(0, 0, "water");
				bg.width = canvasWidth;
				bg.height = canvasHeight;
				// 显示左上角分数
				var scoreLogo = game.add.image(24, 24, "scoreLogo");
				scoreLogo.width = 33;
				scoreLogo.height = 42;
				scoreText = game.add.text(80, 24, '0', {fontSize: '38px', fill:"#000000"});
				// 添加地面
				var platform = game.add.image(startX, startY, 'platform');
				platform.width = 3*platformWidth;
				platform.height = 3*platformWidth;
				// 添加人物
				var man = new Man();
				man.init();
				// 添加触摸事件
				$(game.canvas).swipeLeft(function() {
					if (manObject.currentLocation.x > 0 && manObject.currentStatus == "wait" && !game.paused) {
						audioManager.play("move");
						manObject.currentDirection = "left";
						manObject.frame = 1;
						manObject.currentStatus = "moving";
						var tween = game.add.tween(manObject).to({x: manObject.x-platformWidth}, 80, Phaser.Easing.Linear.None, true);
						tween.onComplete.add(function() {
							if (manObject.currentStatus == "moving") manObject.currentStatus = "wait";
							manObject.currentLocation.x--;
							checkDiamond(_this);
						});
					}
				});
				$(game.canvas).swipeRight(function() {
					if (manObject.currentLocation.x < 2 && manObject.currentStatus == "wait" && !game.paused) {
						audioManager.play("move");
						manObject.currentDirection = "right";
						manObject.frame = 0;
						manObject.currentStatus = "moving";
						var tween = game.add.tween(manObject).to({x: manObject.x+platformWidth}, 80, Phaser.Easing.Linear.None, true);
						tween.onComplete.add(function() {
							if (manObject.currentStatus == "moving") manObject.currentStatus = "wait";
							manObject.currentLocation.x++;
							checkDiamond(_this);
						});
					}
				});
				$(game.canvas).swipeUp(function() {
					if (manObject.currentLocation.y > 0 && manObject.currentStatus == "wait" && !game.paused) {
						audioManager.play("move");
						manObject.currentStatus = "moving";
						var tween = game.add.tween(manObject).to({y: manObject.y-platformWidth}, 80, Phaser.Easing.Linear.None, true);
						tween.onComplete.add(function() {
							if (manObject.currentStatus == "moving") manObject.currentStatus = "wait";
							manObject.currentLocation.y--;
							checkDiamond(_this);
						});
					}
				});
				$(game.canvas).swipeDown(function() {
					if (manObject.currentLocation.y < 2 && manObject.currentStatus == "wait" && !game.paused) {
						audioManager.play("move");
						manObject.currentStatus = "moving";
						var tween = game.add.tween(manObject).to({y: manObject.y+platformWidth}, 80, Phaser.Easing.Linear.None, true);
						tween.onComplete.add(function() {
							if (manObject.currentStatus == "moving") manObject.currentStatus = "wait";
							manObject.currentLocation.y++;
							checkDiamond(_this);
						});
					}
				});
				// 添加钻石				
				this.createDiamond();
				// 添加小球
				ball = new Ball();
				ball.init();
				ball.createInterval = setInterval(function() {
					if (!game.paused) ball.create();
				}, 2000);

				function checkDiamond(_this) {
					if (manObject.currentLocation.x == diamondObject.currentLocation.x && manObject.currentLocation.y == diamondObject.currentLocation.y) {
						_this.getDiamond();
					}
				}
			};
			this.update = function(){
				game.physics.arcade.overlap(manObject, balls, this.killMan, null, this);
			};
			this.killMan = function(_manObject, _balls) {
				audioManager.play("dead");
				_balls.destroy();
				manObject.currentStatus = "dead";
				var animation = manObject.animations.play("dead");
				animation.onComplete.add(function() {
					clearInterval(balls.createInterval);
					game.paused = true;
					console.log("得分是: "+score);
					alert("得分是: "+score);
				});
			};
			this.getDiamond = function() {
				audioManager.play("pickup");
				var x = diamondObject.currentLocation.x;
				var y = diamondObject.currentLocation.y;
				var randomX, randomY;
				do {
					randomX = Math.floor(Math.random()*3);
					randomY = Math.floor(Math.random()*3);
				} while(randomX == x && randomY == y);
				diamondObject.currentLocation.x = randomX;
				diamondObject.currentLocation.y = randomY;
				diamondObject.x = startX+platformWidth*(randomX+0.15);
				diamondObject.y = startY+platformWidth*(randomY-0.2);
				score++;
				scoreText.text = score;
				this.levelUp();
			};
			this.createDiamond = function() {
				var randomX, randomY;
				do {
					randomX = Math.floor(Math.random()*3);
					randomY = Math.floor(Math.random()*3);
				} while(randomX == 1 && randomY == 1);
				diamondObject = game.add.sprite(startX+platformWidth*(randomX+0.15), startY+platformWidth*(randomY-0.2), "diamond");
				diamondObject.width = 0.7*platformWidth;
				diamondObject.height = platformWidth;
				diamondObject.currentLocation = {x: randomX, y: randomY};
			};
			this.levelUp = function() {
				if (score == 10) {
					clearInterval(ball.createInterval);
					balls.speed = 200;
					ball.createInterval = setInterval(function() {
						if (!game.paused) ball.create();
					}, 1800);
				} else if (score == 20) {
					clearInterval(ball.createInterval);
					balls.speed = 250;
					ball.createInterval = setInterval(function() {
						if (!game.paused) ball.create();
					}, 1500);
				} else if (score == 30) {
					clearInterval(ball.createInterval);
					balls.speed = 300;
					ball.createInterval = setInterval(function() {
						if (!game.paused) ball.create();
					}, 1200);
				} else if (score == 40) {
					clearInterval(ball.createInterval);
					balls.speed = 300;
					ball.createInterval = setInterval(function() {
						if (!game.paused) ball.create();
					}, 1000);
				}
			}
		}

		/* 主角 */
		var Man = function() {
			manObject = null;
		}
		Man.prototype.init = function() {
			manObject = game.add.sprite(startX+platformWidth*1.1, startY+platformWidth*0.8, 'man');
			manObject.width = platformWidth*0.8;
			manObject.height = platformWidth;
			manObject.currentDirection = "right";
			manObject.currentStatus = "wait";
			manObject.currentLocation = {x: 1, y: 1};
			// 添加动画
			manObject.animations.add('dead', [0, 1, 0, 1, 0], 10, false);
			// 开启动画碰撞
			game.physics.arcade.enable(manObject,true);
		}


		/* 球 */
		var Ball = function() {
			balls = null;
		};
		Ball.prototype.init = function() {
			balls = game.add.group();
			balls.enableBody = true;
			balls.createInterval = null;
			balls.speed = 150;
		};
		Ball.prototype.create = function() {
			var ballStartX, ballStartY, ballEndX, ballEndY, randomX, randomY;
			var horizontal, moveTime, moveDirection, velocity;
			// 运动方向
			horizontal = (Math.random() > 0.5) ? true : false;
			// 移动时间
			moveTime = (horizontal) ? canvasWidth/balls.speed : canvasHeight/balls.speed;
			moveTime *= 1000;
			// 正反方向
			moveDirection = (Math.random() > 0.5) ? true : false;
			// 移动速度
			velocity = (moveDirection) ? balls.speed : -1*balls.speed;
			if (horizontal) { // 水平方向
				ballStartX = (moveDirection) ? -platformWidth/2 : canvasWidth;
				ballEndX = (moveDirection) ? canvasWidth : -platformWidth/2;
				randomY = Math.floor(Math.random()*3);
				ballStartY = startY + platformWidth*(randomY-0.2);
				ballEndY = ballStartY;
			} else { // 垂直方向
				randomX = Math.floor(Math.random()*3);
				ballStartX = startX + platformWidth*(randomX+0.1);
				ballEndX = ballStartX;
				ballStartY = (moveDirection) ? -platformWidth/2 : canvasHeight;
				ballEndY = (moveDirection) ? canvasHeight : -platformWidth/2;
			}
			var randomItem = Math.ceil(Math.random()*3);
			var ballObject = balls.create(ballStartX, ballStartY, 'item00'+randomItem);
			ballObject.width = platformWidth*0.8;
			ballObject.height = platformWidth;
			ballObject.body.velocity.x = (horizontal) ? velocity : 0;
			ballObject.body.velocity.y = (horizontal) ? 0 : velocity;
			ballObject.body.setSize(ballObject.width/4, ballObject.height/4, ballObject.width/8, ballObject.height/8);
			ballObject.checkWorldBounds = true;
			ballObject.outOfBoundsKill = true;
			ballObject.bringToTop();
		};

		game.state.add('boot',game.States.boot);
		game.state.add('preload',game.States.preload);
		game.state.add('create',game.States.create);
		game.state.add('play',game.States.play);
		game.state.start('boot');
	}

	var musicManager = function() {
		this.musicBox = {};
	};
	musicManager.prototype.init = function() {
		this.musicBox["bg"] = game.add.audio("bg");
		if (device_name == "apple") {
			this.musicBox["dead"] = game.add.audio("dead");
			this.musicBox["move"] = game.add.audio("move");
			this.musicBox["pickup"] = game.add.audio("pickup");
		}
	}
	musicManager.prototype.play = function(name) {
		if (this.musicBox[name]) {
			this.musicBox[name].play();
		}
	}
	musicManager.prototype.bgLoop = function() {
		if (!this.musicBox["bg"].isPlaying) this.musicBox["bg"].loopFull();
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



