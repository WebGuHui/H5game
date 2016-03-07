var canvasWidth = window.innerWidth*2;
var canvasHeight = window.innerHeight*2;
var game = new Phaser.Game(canvasWidth,canvasHeight,Phaser.CANVAS,'game_div');
// var game = new Phaser.Game(480,800,Phaser.CANVAS,'');

var ball; //小球
var paddle; //平台

var squareGroup; //方块组
var propGroup; //道具组
var GameisDown; //是否按住屏幕
var currentLevel; //当前关卡
var score; //当前分数
var maxScore = 0;
try {
    maxScore = (localStorage.breakPixelMaxScore != undefined) ? localStorage.breakPixelMaxScore : 0
} catch (e) {}
var scoreLabel; //分数面板
var levelLabel; //关卡面板
var ratio = canvasWidth/canvasHeight;
// 背景宽高比
var bgRatio_mobile = 828/1344;
var bgRatio_pad = 1408/2048;
// 设备类型
var device = (navigator.userAgent.indexOf("iPad") > -1) ? 'pad' : 'mobile';
//音效
var btn_music;
var levelUp_music;
var gameOver_music;
var collide_music;
var bg_music;
game.States = {};

game.States.boot = function(){
	this.preload = function(){
		// 进度条
		game.load.image('loading','http://24haowan-cdn.shanyougame.com/CubeAdventure/squareImage/' + device +'/loading/background.png');
		game.load.image('progress_empty','http://24haowan-cdn.shanyougame.com/CubeAdventure/squareImage/' + device +'/loading/progress_empty.png');
		game.load.image('progress_fill','http://24haowan-cdn.shanyougame.com/CubeAdventure/squareImage/' + device +'/loading/progress_fill.png');

		// 设置画布大小
		$(game.canvas).css("width", canvasWidth/2);
		$(game.canvas).css("height", canvasHeight/2);
		//会撑大屏幕
		game.stage.backgroundColor = '#aaa';
	},
	this.create = function() {
		// setTimeout(function(){
  //           hiddenImg();
  //       }, 1500);
		game.state.start('preload');
	}
}

//加载模块，显示进度条
game.States.preload = function(){
	this.preload = function(){
		//加载图
		var pic_start = game.add.image(0,0,'loading');
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
			progress_empty = game.add.sprite((canvasWidth-326)/2, (canvasHeight-70)/2+40, 'progress_empty');
			progress_empty.width = 326;
			progress_empty.height = 70;
			progress_fill = game.add.sprite((canvasWidth-320)/2, (canvasHeight-60)/2+40, 'progress_fill');
			progress_fill.width = 320;
			progress_fill.height = 60;
		} else {
			progress_empty = game.add.sprite((canvasWidth-486)/2, (canvasHeight-110)/2+60, 'progress_empty');
			progress_empty.width = 486;
			progress_empty.height = 110;
			progress_fill = game.add.sprite((canvasWidth-480)/2, (canvasHeight-90)/2+60, 'progress_fill');
			progress_fill.width = 480;
			progress_fill.height = 90;
		}
		
		game.load.setPreloadSprite(progress_fill);


		//加分
		game.load.image('score10','../image/breakSquare/' + device + '/score10.png');
		game.load.image('score20','../image/breakSquare/' + device + '/score20.png');

		//道具
		game.load.image('prop','../image/breakSquare/' + device + '/prop.png');
		game.load.image('splitProp','../image/breakSquare/' + device + '/splitProp.png');

		//下方平板
		game.load.image('paddle','../image/breakSquare/' + device + '/paddle.png');

		//小球
		game.load.image('ball','../image/breakSquare/' + device + '/ball.png');

		//游戏背景
		game.load.image('bg','../image/breakSquare/' + device + '/background.png')

		//方块
		game.load.atlasJSONArray('pixels', '../image/breakSquare/' + device + '/pixels.png', '../image/breakSquare/' + device + '/pixels.json');
		game.load.image('help','../image/breakSquare/' + device + '/helpMe.png');
		//音效
		game.load.audio('btn_music','../music/btn_music.mp3');
		game.load.audio('levelUp_music','../music/levelUp.mp3');
		game.load.audio('gameOver_music','../music/gameOver.mp3');
		game.load.audio('collide_music','../music/collide.mp3');
		game.load.audio('bg_music','../music/bg_music.mp3');
	};
	this.create = function(){
		//加载音乐
		btn_music = game.add.audio('btn_music');
		levelUp_music = game.add.audio('levelUp_music');
		gameOver_music = game.add.audio('gameOver_music');
		collide_music = game.add.audio('collide_music');
		bg_music = game.add.audio('bg_music');
		game.state.start('create');
	};
}

//开始的菜单模块
game.States.create = function(){
	this.create = function() {
		$('#start_menu').show();
	}
}



//所有点击事件触发的均为物理像素，由于画布扩大了两倍，所以所有的触屏坐标计算都应当乘以2
game.States.play = function(){
	this.create = function(){
		navigator.userAgent.toLowerCase().indexOf("android") < 0 && bg_music.loopFull(); //非安卓
		//对dom进行操作
		$('#start_menu').hide();
		$('.pause_btn').show();
		this.init();
		scoreLabel.text = '当前分数:0';
		levelLabel.text = '当前关卡:1';
		game.physics.arcade.checkCollision.down = false; //下面不发生碰撞
		this.pad = new Paddle();
		this.pad.init();
		this.bal = new Ball();
		this.bal.init();
		asd=this.bal;
		this.pix = new Pixel();
		this.pix.init(currentLevel);
	};
	this.init = function() {
		//初始化所有分数
		GameisDown = false;
		currentLevel = 1;
		score = 0;

		var pic_game = game.add.image(0,0,'bg');
		var ratio_temp = (device == "mobile") ? bgRatio_mobile : bgRatio_pad;
		if (ratio >= ratio_temp) {
			pic_game.width = canvasWidth;
			pic_game.height = canvasWidth/ratio_temp;
		} else {
			pic_game.width = canvasHeight*ratio_temp;
			pic_game.height = canvasHeight;
			pic_game.x = -(pic_game.width - canvasWidth)/2;
		}

		scoreLabel = game.add.text(10, 12, '',{ fontSize: '32px miscrosoft yahei', fill: '#000' });
		levelLabel = game.add.text(canvasWidth/2,12,'',{ fontSize: '32px miscrosoft yahei', fill: '#000' });
		levelLabel.anchor.setTo(0.5,0);
		// scoreLabel.text = '当前分数:10';
		//bug 写在此处时不改变scoreLabel的值

		propGroup = game.add.group();
	};
	this.update = function(){
		//拖动
		if(GameisDown) {
			if(game.input.x*2<paddle.width/2) {
				paddle.x = paddle.width/2
			} else if(game.input.x*2 >canvasWidth-paddle.width/2) {
				paddle.x = canvasWidth-paddle.width/2;
			} else {
				paddle.x = game.input.x*2;
			}
		}
		//球和平台
		game.physics.arcade.collide(ball, paddle, this.ballHitPaddle, null, this);

		//球和方块
		game.physics.arcade.collide(ball,squareGroup,this.ballHitSquare,null,this);

		//平台和道具
		game.physics.arcade.overlap(paddle,propGroup,this.paddleHitProp,null,this);

		//救援块
		game.physics.arcade.collide(help_pic, ball);
	};

	//平台吃道具
	this.paddleHitProp = function(_paddle,_prop) {
		_prop.kill();
		if(_prop.type == 1) {
			//长
			this.pad.change(1);
		} else if(_prop.type == 2) {
			//短
			this.pad.change(2);
		} else {
			//分开
			this.bal.splitBall();
		}

	};
	//碰撞下方平台
	this.ballHitPaddle = function(_paddle, _ball) {
		collide_music.play();
		var diff = _paddle.x - _ball.x;
		if(diff > 0) {
			// 碰撞左半边 ball往左 x<0
			_ball.body.velocity.x = (-3 * diff);
		} else if(diff < 0) {
			// 碰撞右半边 ball往右 x>0
			_ball.body.velocity.x = (-3 * diff);
		} else {
			var direction = ((_ball.body.velocity.x >0)?1:-1);
			_ball.body.velocity.x = (2 + Math.random() * 8)*direction;
		}
	};
	//碰撞上方方块
	this.ballHitSquare = function(_ball, _pixel){
		//是否粉碎
		collide_music.play();
		_pixel.damage(1);
		_pixel.type != 5 && _pixel.animations.play('p'+_pixel.type);
		if(squareGroup.countLiving() == 0) {
			this.pix.init(++currentLevel);
			levelUp_music.play();
			this.bal.resetBall();
			this.pad.resetPaddle();
			levelLabel.text = '当前关卡:'+currentLevel;
		}
	};
	this.gameOver = function() {

	};
	this.gameAgain = function() {
		// game.state.start('play');
	}
}

game.state.add('boot',game.States.boot);
game.state.add('preload',game.States.preload);
game.state.add('create',game.States.create);
game.state.add('play',game.States.play);
game.state.start('boot');


//初始化小版块 paddle
var Paddle = function(){
	paddle = null;
}

Paddle.prototype.init = function(){
	/*
	*/
	paddle = game.add.sprite(canvasWidth/2,canvasHeight - 100,'paddle');
	paddle.len = 1;
	paddle.anchor.setTo(0.5);
	game.physics.arcade.enable(paddle,true);
	paddle.body.immovable = true;
	//按屏幕事件 移动平台
	game.input.onDown.add(function(e){
		game.add.tween(paddle).to({x:e.x*2},100,Phaser.Easing.Linear.None,true);
		setTimeout(function(){
			GameisDown = true;
		},100);
	},this);
	game.input.onUp.add(function(){
		setTimeout(function(){
			GameisDown = false;
		},100);
	});
}

Paddle.prototype.change = function(type) {
	if(type == 1) {
		// 变长
		if(paddle.len == 0.5) {
			paddle.scale.set(1,1);
			paddle.len = 1;
		} else if(paddle.len == 1) {
			paddle.scale.set(1.5,1);
			paddle.len = 1.5;
		}
	} else {
		//变短
		if(paddle.len == 1) {
			paddle.scale.set(0.5,1);
			paddle.len = 0.5;
		} else if(paddle.len == 1.5) {
			paddle.scale.set(1,1);
			paddle.len = 1;
		}
	}
}
//平台变回去
Paddle.prototype.resetPaddle = function() {
	paddle.scale.setTo(1);
}


var Ball = function(){
	this.onPaddle = true;
	this.ballNum = 0;
	this.isSplit = false;
	ball = game.add.group();
}
//初始化小球 ball
Ball.prototype.init = function(){
	if(this.ballNum == 0) {
		var one = ball.create(paddle.x,paddle.y-30,'ball');
		this.ballNum++;
		one.anchor.setTo(0.5);
		one.checkWorldBounds = true;
		game.physics.arcade.enable(one,true);
		one.body.collideWorldBounds = true;
		one.body.bounce.set(1);
		one.events.onOutOfBounds.add(this.ballLost, this);
		game.input.onDown.add(function(){
			if(this.onPaddle) {
				this.onPaddle = false;
				ball.getFirstAlive().body.velocity.y = -800;
			    ball.getFirstAlive().body.velocity.x = -100;
			}
		},this);
	}
};
//分裂小球
Ball.prototype.splitBall = function() {
	if(this.ballNum == 1 && this.isSplit == false) {
		this.isSplit = true;
		var two = ball.getFirstAlive();
		var one = ball.create(two.x,two.y,'ball');
		this.ballNum++;
		one.anchor.setTo(0.5);
		one.scale.setTo(0.8);
		one.checkWorldBounds = true;
		game.physics.arcade.enable(one,true);
		one.body.collideWorldBounds = true;
		one.body.bounce.set(1);
		one.events.onOutOfBounds.add(this.ballLost, this);
		one.body.velocity.y = two.body.velocity.y;
		one.body.velocity.x = -two.body.velocity.x;
		one.width = one.width /2 ;
		one.height = one.height /2;
		two.width = two.width /2;
		two.height = two.height /2;
	}
};
//球掉下去了 gameover
Ball.prototype.ballLost = function(e){
	this.ballNum--;
	e.kill();
	if(this.ballNum <= 0) {
		gameOver_music.play();

		if (score > maxScore) {
			try {
			    maxScore = score;
			    localStorage.breakPixelMaxScore = maxScore;

			} catch (e) {}
		}
		// 设置分数
		// $('.over_menu .score').text(score);
		// $('.over_menu .best').text(maxScore);
		// 显示结束界面
		// $('#over_box').show();
		// $('#over_box .over-btn-replay').show();
		// $('#over_box .over-btn-more').show();
		// $('#over_box .over-btn-rank').show();
		// setGameScore(score,getBadge(score),resetShareText());
	}
};
//重置小球
Ball.prototype.resetBall = function(){
	this.isSplit = false;
	this.onPaddle = true;
	this.ballNum = 0;
	ball.removeAll();
	this.init();
}

//初始化小砖块 width:
var Pixel = function(){
	squareGroup = game.add.group();

	this.levelSetting_arr = [
		{"x":9, "y":4},
		{"x":11, "y":5, "m1":[10, 15]},
		{"x":11, "y":6, "m1":[15, 25], "m2":[1, 5]},
		{"x":13, "y":6, "m1":[20, 25], "m2":[5, 10], "m3":[1, 3]},
		{"x":13, "y":7, "m1":[20, 30], "m2":[5, 10], "m3":[3, 5], "m4":[1, 3]},
		{"x":13, "y":7, "m1":[25, 30], "m2":[10, 15], "m3":[5, 8], "m4":[3, 5]}
	]; //五种关卡类型
	this.levelType = 0;
	this.map = [];
	this.numX = canvasWidth/16; // 每一块区域的宽 【2 14】
	this.numY = canvasHeight/15;// 每一块区域的高 【2  8】

	//中间部分不变
	help_pic = game.add.sprite(this.numX*6.5,this.numY*3,'help');
	game.physics.arcade.enable(help_pic,true);
	help_pic.body.immovable = true;
	help_pic.body.bounce.set(1);
	help_pic.width = this.numX * 3;
	help_pic.height = help_pic.width/1.6;
	// help_pic.height = this.numY * 2;

}

Pixel.prototype.initMap = function (level) {
	this.map = [];
	if (level < 2) {
		this.createArr(this.levelSetting_arr[0]);
	} else if (level < 5) {
		this.createArr(this.levelSetting_arr[1]);
		this.levelType = 1;
	} else if (level < 7) {
		this.createArr(this.levelSetting_arr[2]);
		this.levelType = 2;
	} else if (level < 10) {
		this.createArr(this.levelSetting_arr[3]);
		this.levelType = 3;
	} else if (level < 13) {
		this.createArr(this.levelSetting_arr[4]);
		this.levelType = 4;
	} else {
		this.createArr(this.levelSetting_arr[5]);
		this.levelType = 5;
	}
}

Pixel.prototype.createArr = function(levelSetting) {
	// 填充1 - 恶魔方块
	for (var i = 0; i < levelSetting["y"]; i++) {
		this.map[i] = [];
		for (var j = 0; j < levelSetting["x"]; j++) {
			this.map[i][j] = 1;
		}
	}
	// 填充0 - 救援方块
	var centerX = (levelSetting["x"]-1)/2;
	for (var i = 1; i < 2; i++) {
		for (var j = centerX-1; j <= centerX+1; j++) {
			this.map[i][j] = 0;
		}
	}
	// 每种怪物的数量
	var m1 = (levelSetting["m1"]) ? (Math.ceil(Math.random()*(levelSetting["m1"][1]-levelSetting["m1"][0]))+levelSetting["m1"][0]) : 0;
	var m2 = (levelSetting["m2"]) ? (Math.ceil(Math.random()*(levelSetting["m2"][1]-levelSetting["m2"][0]))+levelSetting["m2"][0]) : 0;
	var m3 = (levelSetting["m3"]) ? (Math.ceil(Math.random()*(levelSetting["m3"][1]-levelSetting["m3"][0]))+levelSetting["m3"][0]) : 0;
	var m4 = (levelSetting["m4"]) ? (Math.ceil(Math.random()*(levelSetting["m4"][1]-levelSetting["m4"][0]))+levelSetting["m4"][0]) : 0;
	var m_arr = [m1, m2, m3, m4];
	// 填充怪物
	for (var i = 0, m = 2; i < m_arr.length; i++, m++) {
		while(m_arr[i] > 0) {
			var x = Math.floor(Math.random()*levelSetting["y"]);
			var y = Math.floor(Math.random()*levelSetting["x"]);
			if (i == 1 && x == levelSetting["y"]-1) {
				// 炎魔不在最下面一层
				continue;
			} else if (this.map[x][y] == 1) {
				this.map[x][y] = m;
				m_arr[i] -= 1;
			}
		};
	}
}

Pixel.prototype.init = function(level) {
	squareGroup.removeAll();
	self = this;
	function bindKill(one,type){
		one.events.onKilled.add(function(obj){
			score += obj.score;
			scoreLabel.text = '当前分数:' + score;
			self.prop(obj);
		});
	}

	this.initMap(level);

	// i行 j列
	for(var i = 0; i < this.map.length; i++) {
		for (var j = 0; j <this.map[i].length; j++) {
			var startPosition = Math.floor((16 - this.levelSetting_arr[this.levelType].x)/2);
			if(this.map[i][j]) {
				var one = squareGroup.create((j+startPosition+1)*this.numX,this.numY*(i+2+0.5),'pixels','p_0'+(2*this.map[i][j]-1)+'.png');
				var num = (this.map[i][j]-1)*2;
				this.map[i][j]!=5 && one.animations.add('p'+this.map[i][j],[num,num+1,num],10,false);
				
				game.physics.arcade.enable(one);
				one.body.bounce.set(1);
				one.body.immovable = true;
				one.anchor.setTo(0.5);
				one.scale.setTo(0.8);
				one.type = this.map[i][j];
				if(one.type == 1) {
					one.health = 1;
					one.score = 10;
				} else if(one.type == 2) {
					one.health = 3;
					one.score = 10;
				} else if(one.type == 3 || one.type == 4) {
					one.health = 2;
					one.score = 20;
				} else {
					one.health = 2;
					one.score = 10
				}
				bindKill(one,one.type);
			} else {

			}
		}
	}
}
//产生道具
Pixel.prototype.prop = function(obj) {
	if(obj.type == 3) {
		//加速
		var vx = ball.getFirstAlive().body.velocity.x;
		var vy = ball.getFirstAlive().body.velocity.y;
		ball.getFirstAlive().body.velocity.x = vx * 1.2;
		ball.getFirstAlive().body.velocity.y = vy * 1.2;
		slowVelocity(vx,vy);
	} else if(obj.type == 5) {
		//下方平板变短变长的道具
		createProp(obj,(Math.random()<0.3)?((Math.random()>0.5)?1:2):(null));
	} else if(obj.type == 4) {
		// 一个小球变两个的道具
		createProp(obj,3);
	}
}
//缓慢减速
function slowVelocity(vx,vy) {
	var time = 50;
	timer = setInterval(function(){
		subX = Math.abs(vx/4000*time);
		subY = Math.abs(vy/4000*time);
		ball.body.velocity.x += ball.body.velocity.x>0?-subX:+subX;
		ball.body.velocity.y += ball.body.velocity.y>0?-subY:+subY;
		if(Math.abs(ball.body.velocity.x)<Math.abs(vx) || Math.abs(ball.body.velocity.y)<Math.abs(vy)) {
			ball.body.velocity.x = ball.body.velocity.x>0?Math.abs(vx):Math.abs(vx)*-1;
			ball.body.velocity.y = ball.body.velocity.y>0?Math.abs(vy):Math.abs(vy)*-1;
			clearInterval(timer);
		}
	},time);
}
/*
	type == 1 变长
	type == 2 变短
	type == 3 分裂
*/
var createProp = function(obj,type) {
	if(type>=1 ||type<=3) {
		if(type == 3) {
			var one = propGroup.create(obj.x,obj.y,'splitProp');
		}else {
			var one = propGroup.create(obj.x,obj.y,'prop');
		}
		one.anchor.setTo(0.5);
		game.physics.arcade.enable(one,true);
		one.checkWorldBounds = true;
		one.outOfBoundsKill = true;
		one.body.gravity.y = 3000;
		one.type = type;
	}
}

function resetShareText() {
    var obj = {
            share:"“点击右上方，炫耀自己打掉恶魔的成绩”",
            default:"助方块长老一臂之力，清掉所有恶魔方块",
            title:"我在打掉魔块中取得了{score}分，打败了全国{persent}%人，快来帮忙拯救小方块",
            desc:"恶魔军团，绑架了方块家族成员作人质，助方块长老一臂之力，清掉所有恶魔方块。",
            imgUrl:"http://24haowan-cdn.shanyougame.com/CubeAdventure/squareImage/sharePic.png",
    };
    return obj;
}

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