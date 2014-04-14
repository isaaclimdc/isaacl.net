window.totalScore = 0;
window.bestScore = 0;

var Ball = function(config){
    this.style = config.style || 'blue';
    this.radius = config.radius;

    this.damping = config.damping || 1.5;

    this.x = config.x;
    this.y = config.y;
    
    this.velx = 0;
    this.vely = 0;

    this.maxX = config.maxX;
    this.maxY = config.maxY;
}

Ball.prototype.update = function(timeDiff){
    this.x += this.velx*timeDiff/20;
    this.y += this.vely*timeDiff/20;

    if (this.x - this.radius < 0){
        this.x = this.radius;
        this.velx = -this.velx/this.damping;
    }
    else if(this.x + this.radius > this.maxX){
        this.x = this.maxX - this.radius;
        this.velx = -this.velx/this.damping;
    }
    if (this.y - this.radius < 0){
        this.y = this.radius;
        this.vely = -this.vely/this.damping;
    }
    else if (this.y + this.radius > this.maxY - this.maxX/6){
        this.y = this.maxY - this.radius - this.maxY/6;
        this.vely = -this.vely/this.damping;
    }
    if ((100 < this.x && this.x < 130) && (4*this.maxY/6 < this.y + this.radius && this.y + this.radius < 5*this.maxY/6)) {
        gameOver();
    }
    if ((this.maxX - 130 < this.x && this.x < this.maxX - 100) && (4*this.maxY/6 < this.y + this.radius && this.y + this.radius < 5*this.maxY/6)) {
        gameOver();
    }

    var leftBound = this.x-this.radius;
    var rightBound = this.x+this.radius;

    if ((110 <= leftBound && leftBound < 120) || (this.maxX - 120 <= rightBound && rightBound <= this.maxX - 110))
        window.totalScore += 10;
    else if ((120 <= leftBound && leftBound < 140) || (this.maxX - 140 <= rightBound && rightBound <= this.maxX - 120))
        window.totalScore += 1;
    else if (leftBound <= 80 || rightBound >= this.maxX - 80)
        window.totalScore = 0;
    else
        window.totalScore += 0;

    $("body h1").text(window.totalScore);
    if (window.totalScore > window.bestScore) {
        window.bestScore = window.totalScore;
        $("body h2").text("Best: "+window.totalScore);
    }
}

function gameOver() {
    console.log("GAME OVER!");
    window.totalScore = 0;
}

Ball.prototype.draw = function(scaledPage){
    scaledPage.fillCircle(this.x, this.y, this.radius, this.style);
}

