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

				game.load.atlasJSONArray('left','assets/' + device + '/left.png','assets/' + device + '/left.json');
				game.load.atlasJSONArray('right','assets/' + device + '/right.png','assets/' + device + '/right.json');
				game.load.atlasJSONArray('spring','assets/' + device + '/spring.png','assets/' + device + '/spring.json');
				game.load.atlasJSONArray('man','assets/' + device + '/man.png','assets/' + device + '/man.json');
				game.load.atlasJSONArray('num','assets/' + device + '/number.png','assets/' + device + '/number.json');
				game.load.image('stab','assets/' + device + '/stab.png');
				game.load.image('hidden','assets/' + device + '/hidden.png');
				game.load.image('top','assets/' + device + '/top.png');
				game.load.image('common','assets/' + device + '/common.png');
				game.load.image('hpLogo','assets/' + device + '/hp.png');

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
			this.create = function() {
				game.physics.startSystem(Phaser.Physics.ARCADE);
				game.physics.arcade.checkCollision.down = false;
				game.stage.backgroundColor = '#fff2b1';
				/* score */
				var scoreLabelPositionY = game.cache.getImage('top').height/1254*game.height + game.height*0.1;
				scoreLabel = game.add.text(game.world.centerX,scoreLabelPositionY,score,{fontSize:"135px",fill:"#000"});
				scoreLabel.alpha = 0.2;
				scoreLabel.anchor.setTo(0.5,0);
				peopleBox = new peopleManager();

			};
			this.update = function() {
				//碰平台
				game.physics.arcade.collide(people,platformGroup,this.peopleOnPlatform, null, this);
				//碰上方尖刺
				game.physics.arcade.overlap(people,stabBox,this.peopleHitStab, null, this);
				if(people.body.velocity>=10) {
					subSpeed = false;
				}
			};
			this.peopleOnPlatform = function(_man,_floor) {
				if(currentFloor != _floor) {
					/* 跳到新的板块 根据板块判断各种事件*/
					/*
						1 普通板 红色
						2 尖刺板 黄色
						3 滚动版 绿色
						4 弹簧板 紫色
						5 消失板 蓝色
					*/
					if(currentFloor != undefined) {
						var num = Math.ceil((_floor.position.y - currentFloor.position.y)/(game.height/8));
						peopleBox.addScore(num);
					}
					currentFloor = _floor;
					subSpeed = false;
					if(_floor.type == 1) {

					} else if(_floor.type == 2) {
						console.log(_floor);
						peopleBox.subHealth(2);
					} else if(_floor.type == 3) {
						subSpeed = _floor.direction;
					} else if(_floor.type == 4) {
						people.body.velocity.y = _floor.body.velocity.y-500;
						// currentFloor = null;
						_floor.animations.play('jump');
					} else if(_floor.type == 5) {
						(function(){
							var animation = game.add.tween(_floor).to({alpha:0},500,'Linear',true,0,0,false);
							animation.onComplete.add(function(){
								_floor.body.checkCollision.up = false;
							});
							console.log('123');
						})(_floor)
					}
					peopleBox.addHealth();
					floorChange = true;
				} else if(_floor.type == 4){
					/*旧版块如果是弹簧板有反应*/
					people.body.velocity.y = _floor.body.velocity.y-500;
					_floor.animations.play('jump');
					peopleBox.addHealth();
				} else if(_floor.type == 3 && isDown == false) {
					people.body.velocity.x = (subSpeed=='left'?-100:100);
				}
			};
			this.peopleHitStab = function(_man,_stab) {
				if(floorChange) {
					/*扣血落下*/
					floorChange = false;
					peopleBox.subHealth(2);
					people.body.velocity.y = 0;
					currentFloor.body.checkCollision.up = false; /* 上方碰撞失效 */
				}

			};
			this.render =function() {
				// game.debug.body(stabBox);
				// platformGroup.forEach(function(one){
				// 	game.debug.body(one);
				// },this);
			}
		}
		var platformGroup;
		var people;
		var currentFloor;
		var floorChange = false;
		var stabBox;
		var score = 0;
		var scoreLabel;
		var isDown = false;
		// var hpLabel;
		var subSpeed = false;
		var peopleManager = function() {
			people = game.add.sprite(game.world.centerX,game.world.centerY,'man',0);
			peopleW = people.width/750*game.width;
			peopleH = people.height/1254*game.height;
			people.anchor.setTo(0.5,1); /*锚点在底部*/
			people.health = 5;
			people.color = 'green';
			people.width = peopleW;
			people.height = peopleH;
			
			this.velocity = 400;
			this.init();
			this.changeRed;
			// hpLabel = game.add.text(10,10,6,{font:"30px Microsoft YaHei",fill:"#000"});
			this.createHP();
		};
		peopleManager.prototype.createHP = function() {
			var hpLogo = game.add.image(12,stabBoxH+12,'hpLogo');
			this.hpNum = game.add.sprite(hpLogo.position.x + hpLogo.width + 12,hpLogo.position.y,'num',people.health);
		}
		peopleManager.prototype.addHealth = function() {
			if(people.health<5) {
				people.health++;
				this.hpNum.frame = people.health;
			}
			// hpLabel.text = people.health;
		};
		peopleManager.prototype.subHealth = function(num) {
			if(this.changeRed) {
				game.time.events.remove(this.changeRed);
			}
			people.color = 'red';
			if(people.frame < 2) {
				people.frame += 2;
			}
			this.changeRed = game.time.events.add(4000,function(){
				if(people.frame >= 2) {
					people.frame -= 2;
					people.color = 'green';
				}
			},this);
			if(num) {
				/* 扣两血 */
				if(people.health<2) {
					people.health -= 1;
				} else {
					people.health -= 2;
				}
			} else {
				people.health --;
			}
			this.hpNum.frame = people.health;
			if(people.health <= 0) {
				people.health = 0;
				this.hpNum.frame = people.health;
				game.paused = true;
				alert('game over');
			}
			// hpLabel.text = people.health;
		}
		peopleManager.prototype.init = function() {
			var self = this;

			game.physics.arcade.enable(people);
			people.body.gravity.y = 2000;
			people.checkWorldBounds = true;
			people.outOfBoundsKill = true;
			people.body.collideWorldBounds = true;
			people.events.onKilled.add(function(){
				/*game over*/
				game.paused = true;
				alert('game.over,score:' + score);
			});

			this.bindEvents();

			/*create platform*/
			this.platformBox = new platformManager();
			this.platformBox.init();

			/*create top stab*/
			stabBox = game.add.sprite(0,0,'top');
			stabBoxH = game.cache.getImage('top').height/1254*game.height;
			stabBox.width = game.width;
			stabBox.height = stabBoxH;
			game.physics.arcade.enable(stabBox);
		};
		peopleManager.prototype.addScore = function(num) {
			score += (num||1);
			scoreLabel.text = score;
			this.platformBox.changeVelocity(7-score/100*6);
			if(score>=100) {
				game.paused = true;
				alert('win');
			}
		}
		peopleManager.prototype.bindEvents = function() {
			var self = this;
			var onDownNum = 0;
			game.input.onDown.add(function(e){
				if(people) {
					onDownNum++;
					isDown = true;
					if(e.x*2>game.width/2) {
						/*right*/
						if(subSpeed == false) {
							people.body.velocity.x = self.velocity;
						} else if(subSpeed == 'left') {
							people.body.velocity.x = self.velocity*0.5;
						} else if(subSpeed == 'right') {
							people.body.velocity.x = self.velocity*1.5;
						}
						// people.animations.play('right');
						if(people.color == 'green') {
							people.frame = 1;
						} else {
							people.frame = 3;
						}
					} else {
						/*left*/
						if(subSpeed == false) {
							people.body.velocity.x = -self.velocity;
						} else if(subSpeed == 'left') {
							people.body.velocity.x = -self.velocity*1.5;
						} else if(subSpeed == 'right') {
							people.body.velocity.x = -self.velocity*0.5;
						}
						if(people.color == 'green') {
							people.frame = 0;
						} else {
							people.frame = 2;
						}
					}
				}
			});

			game.input.onUp.add(function(){
				onDownNum--;
				if(onDownNum==0) {
					people.body.velocity.x = 0;
					isDown = false;
				}
			});
		};
		var platformManager = function() {
			platformGroup = game.add.group();
			this.platformNum = 8;
			this.margin = game.cache.getImage('common').height + 25;
		};
		platformManager.prototype.randomplatformX = function(){
			this.platformWidth = game.cache.getImage('common').width/750*canvasWidth/2;
			return Math.ceil(Math.random()*(game.width-this.platformWidth*2) + this.platformWidth);
		};
		platformManager.prototype.changeVelocity = function(time) {
			this.speedTime = time || 7; /* 5s */

			this.speed = -Math.floor(canvasHeight / this.speedTime);
			platformGroup.forEachAlive(function(one){
				one.body.velocity.y = this.speed;
			},this);
			if(this.createTime) {
				game.time.events.remove(this.createTime);
			}
			this.createTime = game.time.events.loop(this.speedTime*1000/this.platformNum, this.addPlatform, this);
			console.log('change');
		};
		platformManager.prototype.init = function() {
			this.changeVelocity();
			/*create first floor*/
			var one = platformGroup.create(game.world.centerX,people.position.y,'common',0);
			one.width = 198/750*canvasWidth;
			one.height = 40/1254*canvasHeight;
			one.anchor.setTo(0.5,0);
			game.physics.arcade.enable(one);
			one.body.immovable = true;
			one.checkWorldBounds = true;
			one.outOfBoundsKill = true;
			one.body.velocity.y = this.speed;
			one.type = 1;
			/*  */
			// var one = platformGroup.create(game.world.centerX,people.position.y+this.margin,'platform',0);
			// var num = game.height/2
			for(var j=1;j<=3;j++) {
				this.addPlatform(one.position.y + (game.height/8)*j);
			}

		};
		platformManager.prototype.addPlatform = function(y) {
			var platformH = game.cache.getImage('common').height;
			var platformW = game.cache.getImage('common').width;
			var oneType = this.randomType();
			var oneY = y||game.height;
			var platformName;
			if(oneType == 1) {
				platformName = 'common';
			} else if(oneType == 2) {
				platformName = 'stab';
			} else if(oneType == 3) {
				var direction = (Math.random()>0.5?'left':'right');
				platformName = direction;
			} else if(oneType == 4) {
				platformName = 'spring';
			} else if(oneType == 5) {
				platformName = 'hidden';
			}
			var one = platformGroup.create(this.randomplatformX(),oneY,platformName,0);
			one.width = platformW/750*canvasWidth;
			one.height = platformH/1254*canvasHeight;
			one.anchor.setTo(0.5,0);
			game.physics.arcade.enable(one);
			one.body.immovable = true;
			one.checkWorldBounds = true;
			one.outOfBoundsKill = true;
			one.body.velocity.y = this.speed;
			one.type = oneType;
			one.body.checkCollision.left = false;
			one.body.checkCollision.down = false;
			one.body.checkCollision.right = false;
			if(one.type == 3) {
				one.direction = platformName;
				one.animations.add('roll',[0,1,2],10,true);
				one.animations.play('roll');
			}
			if(one.type == 2) {
				one.body.setSize(platformW, game.cache.getImage('common').height, 0, 28/68*one.height);
			}
			if(one.type == 4) {
				one.animations.add('jump',[0,1,2,1,0],10,false);
				one.anchor.setTo(0.5,1);
				one.position.y += game.cache.getImage('common').height;
			}
			one.frame = one.type-1;
		};
		platformManager.prototype.randomType = function() {
			/*
				1 普通板
				2 尖刺板
				3 滚动版
				4 弹簧板
				5 消失板
			*/
			var num = Math.random();
			if(num <0.4) {
				return 1;
			} else if(num<0.6) {
				return 2;
			} else if(num<0.7) {
				return 3;
			} else if(num<0.8) {
				return 4;
			} else if(num<1) {
				return 5;
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
