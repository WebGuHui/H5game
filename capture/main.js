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
				game.load.atlasJSONHash('countDown', 'assets/'+device+'/countDown.png', 'assets/'+device+'/countDown.json');
				game.load.image('bg', 'assets/'+device+'/bg.png');
				game.load.image('phone0', 'assets/'+device+'/dragon0.png');
				game.load.image('phone1', 'assets/'+device+'/dragon1.png');
				game.load.image('camera', 'assets/'+device+'/camera.png');
				game.load.image('capture', 'assets/'+device+'/capture.png');
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

		var phoneSize = {width: 0, height: 0};
		var captureY, captureDistance;
		var phoneObject;
		var tapEnable = false;
		var captureRec;

		game.States.play = function(){
			this.create = function(){
				var self = this;
				score = 0;
				// 添加背景图片
				var bg = game.add.image(0, 0, "bg");
				bg.width = canvasWidth;
				bg.height = canvasHeight;
				// 生成手机
				this.createPhone();
				// 显示拍摄按钮
				var captureBtnPic = game.cache.getImage("camera");
				var captureBtn = game.add.image(game.world.centerX, canvasHeight*0.85, "camera");
				captureBtn.width = canvasWidth*0.4;
				captureBtn.height = captureBtn.width/(captureBtnPic.width/captureBtnPic.height);
				captureBtn.anchor.set(0.5, 0.5);
				// 显示拍摄框
				var captureRecPic = game.cache.getImage("capture");
				captureRec = game.add.image(game.world.centerX, canvasHeight*0.25, "capture");
				captureRec.width = canvasWidth*0.5;
				captureRec.height = captureRec.width/(captureRecPic.width/captureRecPic.height);
				captureRec.anchor.set(0.5, 0.5);
				captureY = captureRec.y;
				captureDistance = captureRec.height/2;
				// 倒数蒙版
				var countDownMaskBitmap = game.add.bitmapData(canvasWidth, canvasHeight);
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
						self.startToPlay();
						$(game.canvas).on("touchstart", function() {
							if (tapEnable) self.capture();
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
				photo.width = canvasWidth*0.5;
				photo.height = canvasWidth*0.5;
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
						alert("得分是: "+score);
						tapEnable = false;
					});
				});
			};
			this.createPhone = function() {
				var self = this;
				var random = (Math.random() > 0.2) ? 0 : 1;
				var phonePic = game.cache.getImage("phone"+random);
				phoneSize.width = canvasWidth/4;
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
				var self = this;
				var randomVelocity = (Math.random()*60) + 360;
				phoneObject.body.angularVelocity = (Math.random() > 0.5) ? -randomVelocity : randomVelocity;
				var velocity = (parseInt(phoneObject.type) == 1) ? canvasHeight/1.2 : canvasHeight/2;
				phoneObject.body.velocity.y = velocity;
				tapEnable = true;
				setTimeout(function() {
					phoneObject.checkWorldBounds = true;
					phoneObject.events.onOutOfBounds.add(function() {
						// 强制拍摄，0分
						self.capture();
					});
				}, 500);
			};
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
