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
				game.load.atlasJSONArray('square','./assets/mobile/square.png','./assets/mobile/square.json');
				game.load.image('bg','./assets/mobile/bg.png');
				game.load.image('mask','./assets/mobile/mask.png');
				game.load.image('clock','./assets/mobile/clock.png');
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
				var squareList = new squareManager();
			};
			this.update = function(){

			};
		}
		var squareManager = function(){
			this.level = 1;
			this.squareNum = 2;
			this.colorNum = 2;
			this.score = 0;
			this.trueSquare = null;
			this.time = 40;
			this.color = [];
			this.init();
		}
		squareManager.prototype = {
			init: function(){
				this.createBg();
				this.createSquare();
				this.bindEvent();
			},
			bindEvent: function(){
				var selfEvent = this;
				game.input.onDown.add(function(point){
					var pointX = point.x*2;
					var pointY = point.y*2;
					selfEvent.square.forEach(function(one){
						if(pointX>one.position.x && pointY>one.position.y && pointX<one.position.x+selfEvent.squareWidth && pointY<one.position.y+selfEvent.squareWidth) {
							console.log(one.index);
							if(one.index == selfEvent.lucky) {
								selfEvent.levelUp();
							} else {
								selfEvent.gameEnd();
							}
						}
					});
				});
			},
			levelUp: function(){
				this.level++;
				this.score++;
				this.scoreText.text = this.score;
				if(this.level<3) {
					this.squareNum = 2;
					this.colorNum = 2;
				} else if(this.level == 3) {
					this.squareNum = 3;
					this.colorNum = 2;
				} else if(this.level < 7) {
					this.squareNum = 3;
					this.colorNum = 3;
				} else if(this.level < 10) {
					this.squareNum = 4;
					this.colorNum = 3;
				} else if(this.level < 15) {
					this.squareNum = 4;
					this.colorNum = 4;
				} else if(this.level <20) {
					this.squareNum = 5;
					this.colorNum = 4;
				} else if(this.level < 26) {
					this.squareNum = 5;
					this.colorNum = 5;
				} else {
					this.squareNum = 5;
					this.colorNum = 6;
				}
				this.square.removeAll();
				this.createSquare();
			},
			gameEnd:function(){
				// this.timeEvent.pause();
				alert('GG,score:'+this.score);
			},
			createBg: function(){
				var selfBg = this;
				game.stage.backgroundColor = '#ffe38f';
				// this.bg = game.add.image(0,0,'bg');
				// this.bg.width = canvasWidth;
				// this.bg.height = canvasHeight;

				var maskWidth = canvasWidth*0.9;
				this.mask = game.add.image(canvasWidth*0.1*0.5,game.height*0.5-maskWidth*0.5,'mask');
				this.mask.width = this.mask.height = maskWidth;

				this.squareWidth = Math.ceil(maskWidth*0.9/5);
				this.scoreText = game.add.text(game.world.centerX,20,'0',{fontSize: '40px', fill:"#FFFFFF"});
				this.scoreText.anchor.setTo(0.5,0);

				this.clock = game.add.image(game.width-95,12,'clock');
				this.clock.anchor.setTo(1,0);
				this.timeText = game.add.text(game.width-80,20,selfBg.time,{fontSize: '40px', fill:"#FFFFFF"});
				//Time label
				this.timeEvent = game.time.create(false);
				this.timeEvent.loop(1000, function(){
					selfBg.time--;
					if(selfBg.time == 0) {
						selfBg.gameEnd();
					}
					selfBg.timeText.text = selfBg.time;
				}, this);
				this.timeEvent.start();
			},
			randomColor: function(){
				this.color = [];
				for(var i=0;i<this.colorNum;i++) {
					var random = Math.floor(Math.random()*6);
					if(this.color.indexOf(random) >= 0) {
						i--;
						continue;
					} else {
						this.color.push(random);
					}
				}
				console.log('color:'+this.color);
			},
			randomArr: function(squareNum,colorNum){
				//最多数的上下限
				var squareSum = squareNum*squareNum;
				var m = squareSum - colorNum + 1;
				var n = squareSum%colorNum == 0?squareSum/colorNum+1:Math.ceil(squareSum/colorNum);
				var bestNum = Math.floor(Math.random()*(m-n)+n);
				var currentNum = 0;
				var colorArr = [];
				colorArr.push(bestNum);
				currentNum+=bestNum;
				for(var i=1;i<colorNum;i++) {
					if(i == colorNum-1) {
						var rad = squareSum - currentNum;
						if(rad == bestNum) {
						} else {
							colorArr.push(rad);
						}
					} else {
						var min = (squareSum - currentNum) - (colorNum-1-i)*(bestNum-1);
						if(min<0) {
							min = 1;
						}
						var max = bestNum-1;
						if(squareSum - currentNum - (colorNum-1-i) < bestNum) {
							max = squareSum - currentNum - (colorNum-1-i);
						}
						// console.log('1:'+min+',2:'+max);
						var rad = Math.round(Math.random()*(max-min))+min;
						currentNum += rad;
						// console.log('num:'+currentNum);
						if(currentNum>squareSum) {
							currentNum -= rad;
							i--;
							continue;
						} else {
							colorArr.push(rad);
						}
					}
				}
				console.log(colorArr);
				return colorArr;
			},
			creataColor: function(){
				var colorArr = this.randomArr(this.squareNum,this.colorNum);
				this.randomColor();
				var colorList = [];
				var selfColor = this;
				colorArr.map(function(value,k){
					for(var i=0;i<value;i++) {
						colorList.push(selfColor.color[k]);
						console.log(value,k,selfColor.color[k])
					}
				});
				this.lucky = selfColor.color[0];
				console.log(colorList,this.lucky);
				colorList.sort(function(){
					return Math.random()>.5 ? -1 : 1;
				});
				return colorList;
			},
			createSquare: function(){
				this.square = game.add.group();
				var colorList = this.creataColor();
				// 起始坐标
				var baseX = Math.floor(this.mask.position.x + (this.mask.width - this.squareNum*this.squareWidth)*0.5);
				var baseY = Math.floor(this.mask.position.y + (this.mask.width - this.squareNum*this.squareWidth)*0.5);
				for(var i=0;i<this.squareNum;i++) {
					for(var j=0;j<this.squareNum;j++) {
						var posX = baseX + i*this.squareWidth;
						var posY = baseY + j*this.squareWidth;
						var index = colorList.shift();
						var one = this.square.create(posX,posY,'square',index);
						one.width = one.height = this.squareWidth;
						one.index = index;
						one.bringToTop();
					}
				}
			}

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
