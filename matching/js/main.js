var data = [
	{
		'imgSrc': 'http://24haowan-cdn.shanyougame.com/matching/assets/mobile/1.1.png',
		'title': '下列常见饮品当中，你最喜欢的是？',
		'answer': ['可乐','雪碧','橙汁','牛奶']
	},
	{
		'imgSrc': 'http://24haowan-cdn.shanyougame.com/matching/assets/mobile/2.2.png',
		'title': '你逛街时，最喜欢逛的地方是？',
		'answer': ['商场','杂市','小店','不喜欢逛街']
	},
	{
		'imgSrc': 'http://24haowan-cdn.shanyougame.com/matching/assets/mobile/3.3.png',
		'title': '外出就餐时，你最喜欢吃哪个国家的菜式？',
		'answer': ['日本料理','韩式料理','东南亚菜','中国菜']
	},
	{
		'imgSrc': 'http://24haowan-cdn.shanyougame.com/matching/assets/mobile/4.4.png',
		'title': '饭桌上，有汤、肉、菜、饭，你第一口会先吃哪样？',
		'answer': ['汤','肉','菜','饭']
	},
	{
		'imgSrc': 'http://24haowan-cdn.shanyougame.com/matching/assets/mobile/5.5.png',
		'title': '如果去电影院，你最喜欢看什么样的电影？',
		'answer': ['恐怖片','动作片','爱情片','喜剧片']
	},
	{
		'imgSrc': 'http://24haowan-cdn.shanyougame.com/matching/assets/mobile/6.6.png',
		'title': '你睡觉的时候，一般会采用什么姿势？',
		'answer': ['伸直侧睡','正面平睡','趴着睡','缩脚侧睡（虾米式）']
	},
	{
		'imgSrc': 'http://24haowan-cdn.shanyougame.com/matching/assets/mobile/7.7.png',
		'title': '你最喜欢，看哪个国家的AV？',
		'answer': ['欧美','日本','韩国','中国']
	},
	{
		'imgSrc': 'http://24haowan-cdn.shanyougame.com/matching/assets/mobile/8.8.png',
		'title': '做爱做的事情时，你最喜欢怎样的姿势？',
		'answer': ['正常体位','乘骑体位','观音坐莲','老汉推车']
	}
];

var currentNum = 0;

var answerList = [];

var shareAnswerList = [];

var shareProp = {}

function reset() {
	currentNum = 0;
	answerList = [];
	question.list = data[currentNum];
	question.name = '';
	shareAnswerList = [];
	shareProp = {};
	question.light = [];
}

function matching(list_1,list_2){
	var num = 0, len = list_1.length;

	for(var i=0;i<len;i++) {
		list_1[i] == list_2[i]?++num:num;
	}
	return (num/len*100) + '%';
}

//url 组成 share_id 分享者Id  shareAnswerList 分享者回答  
// ?share_id=12&shareAnswerList=[1,2,3,0,1,2,3,0]&name=guhui

window.onload = function(){
	if(location.href.indexOf('share_id')>-1 && location.href.indexOf('shareAnswerList')>-1) {
		var ary = location.href.split('?')[1].split('&');
		for(var i=0,len=ary.length;i<len;i++) {
			shareProp[ary[i].split('=')[0]] = ary[i].split('=')[1];
		}
		question.name = shareStart.name = shareProp['name'];
		shareAnswerList = JSON.parse(shareProp['shareAnswerList']);
		shareStart.show = 'block';
	} else {
		start.show = 'block';
	}
	question.list = data[currentNum];
}

