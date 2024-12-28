var sw = 20,//方块的宽度
    sh = 20,//方块的高度
    tr = 30,//行数
    td = 30; //列数

var snake = null, //蛇的实例
    food = null, //食物的实例
    game = null;
//方块
function Square(x,y,classname) {
    //0,0  ->0,0
    //20,0 ->1,0
    //40,0 ->2,0

    this.x = x*sw;
    this.y = y*sh;
    this.class = classname;

    this.viewContent = document.createElement('div'); //方块对应的DOM元素
    this.viewContent.className = this.class;
    this.parent = document.getElementById('snakeWrap'); //方块的父级
}

Square.prototype.create = function () { //创建方块DOM
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw+'px';
    this.viewContent.style.height = sh+'px';
    this.viewContent.style.left = this.x+'px';
    this.viewContent.style.top = this.y+'px';

    this.parent.appendChild(this.viewContent);
}

Square.prototype.remove = function () {
    this.parent.removeChild(this.viewContent);
}

//蛇
function Snake() {
    this.head = null; //存储蛇头的信息
    this.tail = null; //存储蛇尾的信息
    this.pos = [];    //存储蛇的每一个方块的位置
    this.directionNum = { //存储蛇走的方向，用一个对象来表示
        left:{
            x:-1,
            y:0,
            rotate:180, //蛇头在不同的方向中应该进行旋转。要不始终是向右
        },
        right:{
            x:1,
            y:0,
            rotate: 0,
        },
        up:{
            x:0,
            y:-1,
            rotate:-90
        },
        down:{
            x:0,
            y:1,
            rotate:-90
        }
    }

}

Snake.prototype.init = function () {
    //创建蛇头
    var snakeHead = new Square(2,0,'snakeHead');
    snakeHead.create();
    this.head =snakeHead; //存储蛇头信息
    this.pos.push([2,0])  //存储蛇头坐标

    //创建身体1
    var snakeBody1 = new Square(1,0,'snakeBody');
    snakeBody1.create();
    this.pos.push([1,0])  //存储蛇头坐标

    //创建身体2
    var snakeBody2 = new Square(0,0,'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2;  //蛇尾信息存储
    this.pos.push([0,0])  //存储蛇头坐标

    //形成链表关系
    snakeHead.last = null;
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    //给蛇添加一条属性，用来表示蛇走的方向
    this.direction = this.directionNum.right;//默认让蛇往右走
}

//这个方法用来获取蛇头下一个位置对应的元素，要根据元素做不同的事情
Snake.prototype.getNextPos = function() {
    var nextPos = [ //蛇头要走的下一个点的坐标
        this.head.x/sw + this.direction.x,
        this.head.y/sh + this.direction.y
    ]

    //下个点是自己，代表撞到自己，游戏结束
    var selfCollied = false; //是否撞到自己
    this.pos.forEach(function (value) {
        if(value[0] == nextPos[0] && value[1] ==nextPos[1]) {
            //如果数组中的两个数据都相等，就说明下一个点在蛇身上里面能找到，代表撞到自己了
            selfCollied = true
        }
    })

    if(selfCollied) {
        game.over();
        return
    }
    //下个点是围墙，游戏结束
    if(nextPos[0]<0 || nextPos[1]<0 || nextPos[0]>td-1 || nextPos[1]>tr-1) {
        console.log('撞墙了')
        this.strategies.die.call(this);
        return;
    }
    //下个点是食物，吃
    if(food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
        //如果这个条件成立，说明现在蛇头要走的下一个点是食物那个点
        console.log('撞到食物了');
        this.strategies.eat.call(this)
        return
    }

    //下个点什么都不是，走
    this.strategies.move.call(this)
}

//处理碰撞逻辑
Snake.prototype.strategies =  {
    move:function (format) { //这个参数用于决定要不要删除最后一个方块（蛇尾）
        // console.log('move');
        //创建新的身体，在旧蛇头的位置
        var newBody = new Square(this.head.x/sw,this.head.y/sh,'snakeBody');
        //更新链表的关系
        newBody.next = this.head.next;
        newBody.next.last = newBody;
        newBody.last = null;

        this.head.remove(); //把蛇头从原来的位置删除
        newBody.create();

        //创建一个新蛇头(蛇头下一个要走到的点)
        var newHead = new Square(this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y,'snakeHead')
        //更新链表关系
        newHead.next = newBody;
        newHead.last = null;
        newBody.last = newHead;
        newHead.viewContent.style.transform = 'rotate(' +this.direction.rotate+'deg)';
        newHead.create();

        //蛇身上的每一个坐标也要更新
        this.pos.splice(0,0,[this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y])
        this.head = newHead;//还要把this.head的信息更新一下

        if(!format) { //如果format的值为false,表示需要删除（除了吃之外的操作）,当传了这个参数，表示吃
            this.tail.remove();
            this.tail = this.tail.last;
            this.pos.pop();
        }
    },
    eat:function() {
        // console.log('eat');
        this.strategies.move.call(this,true)
        creatFood();
        game.score++;
    },
    die:function() {
        console.log('die');
        game.over();
    }
}

snake = new Snake();
// snake.init();
// snake.getNextPos();

//创建食物
function creatFood() {
    //食物小方块的随机坐标
    var x= null;
    var y= null;

    var include =true; //循环跳出的条件，true表示食物生成的坐标在蛇的身上（循环），false表示蛇的坐标不在蛇的身上（不循环）
    while (include) {
        x =Math.round(Math.random()*(td-1));
        y =Math.round(Math.random()*(tr-1));

        snake.pos.forEach(function (value) {
            if(x!=value[0] && y!=value[1]) {
                //这个条件成立说明现在随机出来的这个坐标，在蛇的身上没有找到
                include = false;
            }
        })
    }

    //生成食物
    food = new Square(x,y,'food')
    food.pos = [x,y] //存储生成食物坐标，用于下一个生成点的对比
    var foodDom = document.querySelector('.food');
    if(foodDom) {
        foodDom.style.left = x*sw+'px'
        foodDom.style.top = y*sh+'px'
    }else {
        food.create();
    }

}

// //创建游戏逻辑
function Game() {
    this.timer = null;
    this.score = 0;
}
Game.prototype.init = function () {
    snake.init();
    creatFood();
    document.onkeydown = function (ev) {
        if(ev.which == 37 && snake.direction != snake.directionNum.right) {//用户按下左键的时候，这条蛇不能是正下往右走
            snake.direction= snake.directionNum.left;
        }
        if(ev.which == 38 && snake.direction != snake.directionNum.down) {
            snake.direction= snake.directionNum.up;
        }
        if(ev.which == 39 && snake.direction != snake.directionNum.left) {
            snake.direction= snake.directionNum.right;
        }
        if(ev.which == 40 && snake.direction != snake.directionNum.up) {
            snake.direction= snake.directionNum.down;
        }
    }
    this.start();
}
Game.prototype.start = function() { //开始游戏
        // snake.getNextPos(); //获取下一个点的坐标
    this.timer = setInterval(function () {
        snake.getNextPos(); //获取下一个点的坐标
    },200)
}
Game.prototype.pause = function() { //暂停游戏
    clearInterval(this.timer);
}
Game.prototype.over = function() {
    clearInterval(this.timer)
    alert('你的得分为：'+this.score);
    //游戏回到最初是的状态
    var snakeWrap = document.getElementById('snakeWrap');
    snakeWrap.innerHTML = '';

    snake = new Snake();
    game = new Game();

    var startBtn = document.querySelector('.startBtn');
    startBtn.style.display = 'block';
}


game =new Game();
//开启游戏
var startBtn = document.querySelector('.startBtn');
startBtn.onclick = function() {
    startBtn.style.display = 'none';
    game.init();
}
//暂停/开始 游戏
var pauseBtn = document.querySelector('.pauseBtn');
var snakeWrap = document.getElementById('snakeWrap');
snakeWrap.onclick= function() {
    game.pause();
    pauseBtn.style.display= 'block';
}
pauseBtn.onclick =function() {
    pauseBtn.style.display='none';
    game.start();
}
