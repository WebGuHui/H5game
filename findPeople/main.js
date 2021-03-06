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
device = 'mobile';
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
				game.load.image('bg','assets/' + device + '/bg.png');
				game.load.image('true','assets/' + device + '/fantrue.png');
				game.load.image('false','assets/' + device + '/fanfalse.png');
				// game.load.atlasJSONArray('square','assets/' + device + '/type.png','assets/' + device + '/type.json');
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
				game.stage.backgroundColor = '#a8f7f1';
				squareBox = new squareManager();
				squareBox.init();
			};
			this.update = function(){

			};
		}

		game.state.add('boot',game.States.boot);
		game.state.add('preload',game.States.preload);
		game.state.add('create',game.States.create);
		game.state.add('play',game.States.play);
		game.state.start('boot');
	}
	var squareManager = function(){
		this.level = 1;
		this.squareNum = 2;
		this.margin = 20;
		this.bgWidth = game.width*0.9;
		this.true;
		this.time = 30;
		this.timeLabel;
		this.timer;
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
		var self = this;
		this.timer = game.time.create(false);
		this.setTimeLabel();
		this.timer.loop(1000,function(){
			self.time--;
			console.log(self.time);
			self.setTimeLabel();
			if(self.time == 0) {
				game.paused = true;
				this.timer.pause();
				alert('score:' + self.level);
				self.reset();
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
