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
				// game.load.spritesheet('box','assets/' + device + '/jewel.png',64,64);
				game.load.image('acceptBtn','assets/' + device + '/throw.png');
				game.load.image('throwBtn','assets/' + device + '/accept.png');
				game.load.image('good','assets/' + device + '/frazzle.png');
				game.load.image('bad','assets/' + device + '/intact.png');
				game.load.image('bgMask','assets/' + device + '/black.png');
				game.load.atlasJSONArray('countDown','assets/' + device + '/countDown.png','assets/' + device + '/countDown.json');
			};
			this.create = function(){
				game.state.start('create');
			};
		}

		//开始的菜单模块
		game.States.create = function(){
			this.create = function() {
				//显示开始菜单页面 使用dom构建
				//开始按钮调用 
				/*
					game.state.start('play');
					hiddenLabel();
				*/
				$('#start_menu').show();
			}
		}

		game.States.play = function(){
			this.create = function(){
				timeNum = 0;
				game.state.backgroundColor = '#ffec7d';

				$('.pause_btn').show();
				// console.log('11');
				box = new boxManager();
				box.init();
			};
			this.update = function(){

			};
		}

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
			this.boxHeight = game.cache.getImage('good').height*0.75;
			this.marginBottom = game.cache.getImage('acceptBtn').height + 150;
			this.boxNum = Math.ceil((game.height - this.marginBottom)/this.boxHeight);
		};
		boxManager.prototype.init = function(){
			var self = this;

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
			bgMask.width = canvasWidth;
			bgMask.height = canvasHeight;
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
			var self = this;
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
			var self = this;
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
					self.gameOver(operationNum);
				} else {
					var diff = (type==0?-one.width:game.width+one.width);
					var moveAnimation = game.add.tween(one).to({x:diff},100,'Linear',true,0,0,false);
					moveAnimation.onComplete.add(function(){
						one.destroy();
						self.downBox();
						setTimeout(function(){
							operationNum--;
							if(operationNum == 0) {
								game.paused = true;
								self.gameOver(operationNum);
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



		game.state.add('boot',game.States.boot);
		game.state.add('preload',game.States.preload);
		game.state.add('create',game.States.create);
		game.state.add('play',game.States.play);
		game.state.start('boot');
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
