var BallBalanceApp = function(){
    this.setup();
    window.util.deltaTimeRequestAnimationFrame(this.draw.bind(this));
}

//==============================================
//SETUP
//==============================================

BallBalanceApp.prototype.setup = function(){
    window.util.patchRequestAnimationFrame();
    window.util.patchFnBind();
    this.initCanvas();
    TouchHandler.init(this);
    this.initBall();
    this.initAccelerometer();
}

BallBalanceApp.prototype.initCanvas = function(){
    this.body = $(document.body);
    this.body.width(document.body.offsetWidth);
    this.body.height(window.innerHeight - 20);
    this.width = 480;
    this.height = 200;
    this.canvas = window.util.makeAspectRatioCanvas(this.body, this.width/this.height);
    this.page = new ScaledPage(this.canvas, this.width);
};

BallBalanceApp.prototype.initBall = function(){
    this.ball = new Ball({'x': this.width/2, 'y': this.height/2,
                            'radius': 20,
                            'maxX': this.width, 'maxY': this.height});
    this.ball.velx = 5;
    this.ball.vely = 5;
}

BallBalanceApp.prototype.initAccelerometer = function(){
    this.accelerometer = new Accelerometer();
    this.accelerometer.startListening();
}

//==============================================
//DRAWING
//==============================================

BallBalanceApp.prototype.draw = function(timeDiff){
    this.clearPage();
    this.drawBall(timeDiff);
    TouchHandler.drawBalls(timeDiff);
    this.updateBall();

    this.drawRedWall();
    this.drawBasket();
}

BallBalanceApp.prototype.drawRedWall = function(){
    this.page.fillRect(0, 5*this.height/6, this.width, this.height/6, '#aa0000');
}

BallBalanceApp.prototype.drawBasket = function(){
    this.page.fillRect(70, 4*this.height/6, 30, 2*this.height/6, '#999999');
    this.page.fillRect(this.width - 100, 4*this.height/6, 30, 2*this.height/6, '#999999');
}

BallBalanceApp.prototype.clearPage = function(){
    this.page.fillRect(0, 0, this.width, this.height, '#eee');
}

BallBalanceApp.prototype.drawBall = function(timeDiff){
    this.ball.update(timeDiff);
    this.ball.draw(this.page);
}

BallBalanceApp.prototype.updateBall = function(){
    var lastAcceleration = this.accelerometer.getLast();
    this.ball.velx += lastAcceleration.x/10;
    this.ball.vely += lastAcceleration.y/10;


}
