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

				game.load.atlasJSONArray('crocodile','./assets/mobile/crocodile.png','./assets/mobile/crocodile.json');
				game.load.image('top','./assets/mobile/top.png');
				game.load.image('mask','./assets/mobile/mask.png');
				game.load.image('hole','./assets/mobile/hole.png');
				game.load.image('clock','./assets/mobile/clock.png');
				game.load.image('scoreTip','./assets/mobile/scoreTip.png');

			};
			this.create = function(){
				game.state.start('create');
			};
		}

		//开始的菜单模块
		game.States.create = function(){
			this.create = function() {
				//显示开始菜单页面 使用dom构建
				// $('#start_menu').show();
				game.state.start('play');
			}
		}

		game.States.play = function(){
			this.create = function(){
				var playGame = new gameManager();
			};
			this.update = function(){

			};
		}


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
					// setGameScore({
					// 	'game_score':selfCreate.level,
					// 	'game_id':game_info['game_id'],
					// 	'device_type':self.device.platform
					// });
					// game.state.start('end');
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
			one.width = game.width/3*0.8*0.8;
			one.height = game.width/3*0.8/1.2*0.8;
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
	$('.pause_btn').on("touchmove", function(e) {
		e.preventDefault();
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
