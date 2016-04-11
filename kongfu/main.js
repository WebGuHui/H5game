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

				game.load.image('bg','./assets/mobile/bg.png');
				game.load.image('scoreLabel','./assets/mobile/scoreLabel.png');
				game.load.atlasJSONArray('main','./assets/mobile/main.png','./assets/mobile/main.json');
				game.load.atlasJSONArray('one','./assets/mobile/one.png','./assets/mobile/one.json');
				game.load.atlasJSONArray('two','./assets/mobile/two.png','./assets/mobile/two.json');

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
		var playGame;
		game.States.play = function(){
			this.create = function(){
				playGame = new gameManager();
			};
			this.update = function(){
				playGame.update();
				game.physics.arcade.overlap(playGame.panda,playGame.enemyGroup,playGame.judge,null,playGame);
			};
			this.render = function(){
				game.debug.body(playGame.panda);
				playGame.enemyGroup.forEachAlive(function(one){
					game.debug.body(one);
				})
			}
		}

		var gameManager = function(){
			this.bg = game.add.image(0,0,'bg');
			this.bg.width = game.width;
			this.bg.height = game.height;

			this.defaultVelocity = 1000;
			this.defaultAcceleration = 300;
			this.defaultLength = game.width*0.3;
			this.defaultAttack = game.width*0.3;
			this.score = 0;
			this.scoreLabel = null;
			this.enemyGroup = game.add.group();
			this.enemyWidth = game.width*0.2;
			this.square
			this.init();
		}

		gameManager.prototype.init = function(){
			// this.initPhysics();

			this.setScoreLabel();

			this.initPanda();

			this.bindEvent();

			this.createEnemy();

			this.loopTime();
		}

		gameManager.prototype.judge = function(panda, enemy){

			if(enemy.frame != 2 && panda.frame != 2) {
				if(panda.state == 1) {
					this.killEnemy(enemy);
				} else if(panda.state == 0 && enemy.frame == 1){
					this.gameOver();
				}
			}
			return false;
		}

		gameManager.prototype.gameOver = function(){
			this.panda.frame = 2;
			game.paused = true;
			game.input.onDown.removeAll();
			alert('gg');
			setTimeout(function(){
				console.log('gg');
			},1000);
		}

		gameManager.prototype.killEnemy = function(enemy) {
			this.score += 1;
			this.setScoreLabel();
			enemy.frame = 2;
			enemy.body.velocity.x = 0;
			enemy.body.velocity.y = 0;
			var animate = game.add.tween(enemy).to({alpha:0},1000,'Linear',true,0,0,false);
			animate.onComplete.add(function(){
				enemy.body.velocity.x = 0;
				enemy.body.velocity.y = 0;
				enemy.destroy();
			});
		}

		gameManager.prototype.update = function(){
			this.enemyGroup.forEachAlive(function(one){
				if(one.frame == 0) {
					if(one.canAttack == true && game.math.distance(one.position.x,one.position.y,this.panda.position.x,this.panda.position.y) < 300) {
						one.body.velocity.x = one.body.velocity.y = 0;
						this.attack(one);
					} else {
						var rotation = game.math.angleBetween(one.x, one.y, this.panda.position.x, this.panda.position.y);
						one.body.velocity.x = Math.cos(rotation) * 100;
						if(one.body.velocity.x<0) {
							one.width = -this.enemyWidth;
						}
						one.body.velocity.y = Math.sin(rotation) * 100;
						
					}
				}
			},this);
		}

		gameManager.prototype.attack = function(one){
			// one. enemy
			var selfMove = this;
			one.frame = 1;
			one.canAttack = false;
			var e = {
				x: one.position.x,
				y: one.position.y
			}
			setTimeout(function(){
				var distance = game.math.distance(e.x,e.y,selfMove.panda.position.x,selfMove.panda.position.y);
				var rotate = game.math.angleBetween(e.x,e.y,selfMove.panda.position.x,selfMove.panda.position.y);
				e.x = Math.cos(rotate)*selfMove.defaultAttack*-1 + selfMove.panda.position.x;
				e.y = Math.sin(rotate)*selfMove.defaultAttack*-1 + selfMove.panda.position.y;
				if(e.x<selfMove.enemyWidth/2) {
					e.x = selfMove.enemyWidth/2;
				} else if(e.x>game.width-selfMove.enemyWidth/2){
					e.x = game.width-selfMove.enemyWidth/2;
				}

				if(e.y<selfMove.enemyWidth/2) {
					e.y = selfMove.enemyWidth/2;
				} else if(e.y>game.height-selfMove.enemyWidth/2){
					e.y = game.height-selfMove.enemyWidth/2;
				}

				var animatePanda = game.add.tween(one.position).to({x : e.x, y : e.y},500,Phaser.Easing.Quadratic.Out,true,0,0,false);
				animatePanda.onComplete.add(function(){
					if(one.frame == 1) {
						one.frame = 0;
					}
				});
				setTimeout(function(){
					one.canAttack = true;
				},1000);
			},1000);
		}


		gameManager.prototype.initPhysics = function(){
			game.physics.startSystem(Phaser.Physics.Arcade);
		}

		gameManager.prototype.bindEvent = function(){
			var selfEvent = this;
			game.input.onDown.add(function(e){
				/* 判断是否点的是熊猫，若是熊猫，不移动 */
				var boundX_min = selfEvent.panda.position.x - selfEvent.panda.width/2;
				var boundX_max = selfEvent.panda.position.x + selfEvent.panda.width/2;
				var boundY_min = selfEvent.panda.position.y - selfEvent.panda.height/2;
				var boundY_max = selfEvent.panda.position.y + selfEvent.panda.height/2;
				if(e.x*2>boundX_min && e.x*2<boundX_max && e.y*2>boundY_min && e.y*2<boundY_max) {
					console.log('你点击的是熊猫');
				} else if(selfEvent.panda.canDown == true){
					if(selfEvent.panda.position.x>e.x*2) {
						//往左
						selfEvent.panda.width = -selfEvent.panda.defaultWidth;
						// game.add.tween(selfEvent.panda.position).to({x:selfEvent.panda.position.x-100},50,'Linear',true,0,0,false);
					} else {
						//往右
						selfEvent.panda.width = selfEvent.panda.defaultWidth;
						// game.add.tween(selfEvent.panda.position).to({x:selfEvent.panda.position.x+100},50,'Linear',true,0,0,false);
					}
					selfEvent.movePanda({x:e.x*2,y:e.y*2});
				}
			});
		}

		gameManager.prototype.initPanda = function(){
			this.panda = game.add.sprite(game.width*0.5,game.height*0.5,'main');

			game.physics.arcade.enable(this.panda,false);
			this.panda.body.checkCollision = true;
			// this.panda.body.collideWorldBounds = true;
			this.panda.canDown = true;
			this.panda.state = 0;
			// 0是准备，1是攻击，2是死亡
			this.panda.anchor.setTo(0.5,0.5);
			this.panda.width = this.panda.height = this.panda.defaultWidth = game.width*0.26;
		}

		gameManager.prototype.createEnemy = function(){
			var positionX = Math.random()>0.5?(-this.enemyWidth/2):(game.width+this.enemyWidth/2);
			var positionY = Math.random()*game.height;

			var one = this.enemyGroup.create(positionX,positionY,Math.random()>0.5?'one':'two');
			one.anchor.setTo(0.5,0.5);
			one.state = 0;
			one.frame = 0;
			one.canAttack = true;
			one.width = one.height = this.enemyWidth;
			game.physics.arcade.enable(one,false);
			var rotation = game.math.angleBetween(one.x, one.y, this.panda.position.x, this.panda.position.y);
			one.body.velocity.x = Math.cos(rotation) * 100;
			one.body.velocity.y = Math.sin(rotation) * 100;
		}

		gameManager.prototype.loopTime = function(){
			var selfTime = this;
			this.timer = game.time.create(false);
			this.timer.loop(500,function(){
				var num = selfTime.enemyGroup.countLiving();
				var score = selfTime.score;

				if(score > 20 && num < 12) {
					selfTime.createEnemy();
				} else if(score >= 16 && num < 10) {
					selfTime.createEnemy();
				} else if(score >= 11 && num < 8) {
					selfTime.createEnemy();
				} else if(score >= 9 && num < 6) {
					selfTime.createEnemy();
				} else if(score >= 6 && num < 4) {
					selfTime.createEnemy();
				} else if(score >= 2 && num < 3) {
					selfTime.createEnemy();
				} else if(score >= 0 && num < 2) {
					selfTime.createEnemy();
				}
			});
			this.timer.start();
		}

		gameManager.prototype.movePanda = function(e){
			var selfMove = this;
			// this.panda.canDown = false;
			var distance = game.math.distance(e.x,e.y,selfMove.panda.position.x,selfMove.panda.position.y);
			var rotate = game.math.angleBetween(e.x,e.y,selfMove.panda.position.x,selfMove.panda.position.y);
			e.x = Math.cos(rotate)*selfMove.defaultLength*-1 + selfMove.panda.position.x;
			e.y = Math.sin(rotate)*selfMove.defaultLength*-1 + selfMove.panda.position.y;
			// console.log(Math.sin(rotate)*selfMove.defaultLength);
			// if(distance/selfMove.defaultLength>1) {
			// 	// 点击坐标距离大于可移动路径
			// 	e.x *= selfMove.defaultLength/distance;
			// 	e.y *= selfMove.defaultLength/distance;
			// } else {
			// 	//点击坐标距离小于可移动路径
			// 	e.x *= selfMove.defaultLength/distance;
			// 	e.y *= selfMove.defaultLength/distance;
			// }
			// // e.x = e.x*(>1?1:1);
			// // e.y = e.y*(distance/selfMove.defaultLength>1?1:1);
			// console.log(e.x,e.y);
			
			if(e.x<this.panda.defaultWidth/2) {
				e.x = this.panda.defaultWidth/2;
			} else if(e.x>game.width-this.panda.defaultWidth/2){
				e.x = game.width-this.panda.defaultWidth/2;
			}

			if(e.y<this.panda.height/2) {
				e.y = this.panda.height/2;
			} else if(e.y>game.height-this.panda.height/2){
				e.y = game.height-this.panda.height/2;
			}

			selfMove.panda.state = 1;
			selfMove.panda.frame = 1;
			if(this.animatePanda && this.animatePanda.isRunning == true) {
				this.animatePanda.pause();
			}
			this.animatePanda = game.add.tween(this.panda.position).to({x : e.x, y : e.y},300,Phaser.Easing.Quadratic.Out,true,0,0,false);
			this.animatePanda.onComplete.add(function(){
				selfMove.panda.state = 0;
				selfMove.panda.frame = 0;
				// selfMove.panda.canDown = true;
			});
			// setTimeout(function(){
			// },800);

			// var a = Math.abs(e.y - this.panda.position.y)/Math.abs(e.x - this.panda.position.x);
			// console.log(a);
			// velocityX *= Math.sqrt(Math.pow(this.defaultVelocity,2)/(1+Math.pow(a,2)));
			// velocityY *= Math.sqrt(Math.pow(this.defaultVelocity,2)/(1+Math.pow(a,2)))*a;

			// accelerationX *= Math.sqrt(Math.pow(this.defaultAcceleration,2)/(1+Math.pow(a,2)));
			// accelerationY *= Math.sqrt(Math.pow(this.defaultAcceleration,2)/(1+Math.pow(a,2)))*a;
			// console.log(accelerationX,accelerationY);

			// var moveX = velocityX * Math.sqrt(Math.pow(this.defaultLength,2)/(1+Math.pow(a,2)))
			// var moveY = velocityY * Math.sqrt(Math.pow(this.defaultLength,2)/(1+Math.pow(a,2)))*a
			// console.log(Math.pow(this.defaultLength,2));
			// console.log(moveX,moveY);
			// this.panda.body.velocity.setTo(velocityX,velocityY);
			// this.panda.body.acceleration.setTo(accelerationX,accelerationY);
		}

		gameManager.prototype.setScoreLabel = function(){
			if(!this.scoreLabel) {
				this.scorePhoto = game.add.image(game.width - game.width*0.27 - 20,10,'scoreLabel');
				this.scorePhoto.width = game.width*0.27;
				this.scorePhoto.height = this.scorePhoto.width/2.7;
				this.scoreLabel = game.add.text(game.width - game.width*0.27,13,this.score,{fontSize:'50px',fill:'#ebff3e'});
				this.scoreLabel.anchor.setTo(0,0);
			} else {
				this.scoreLabel.text = this.score;
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
