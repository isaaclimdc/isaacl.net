var TiltApp = function(){
    this.setup();
    window.util.deltaTimeRequestAnimationFrame(this.updateNumbers.bind(this));
    setInterval(function(){deductScore();}, 1000);
}

TiltApp.prototype.setup = function() {
    window.util.patchRequestAnimationFrame();
    window.util.patchFnBind();
    window.TiltAppVars = {
        "score" : 100,
        "disabledAxis" : 'z',
        "hasWon" : false,
        "randomX" : 0,
        "randomY" : 0,
        "randomZ" : 0
    }

    this.initAccelerometer();
    randomizeTarget();
}

TiltApp.prototype.initAccelerometer = function() {
    this.accelerometer = new Accelerometer();
    this.accelerometer.startListening();
}

TiltApp.prototype.updateNumbers = function() {
    var lastAcceleration = this.accelerometer.getLast();
    var x = roundTo1(lastAcceleration.x);
    var y = roundTo1(lastAcceleration.y);
    var z = roundTo1(lastAcceleration.z);

    $("#observedX").text(x);
    $("#observedY").text(y);
    $("#observedZ").text(z);

    calculateDiff(x, y, z);
}

function randomizeDisabledAxis() {
    var randomNum = Math.floor(Math.random()*3);
    var axis;

    if (randomNum === 0) {
        axis = 'x';
        $("#diffX").css("background-color", "#BBBBBB");
    }
    else if (randomNum === 1) {
        axis = 'y';
        $("#diffY").css("background-color", "#BBBBBB");
    }
    else if (randomNum === 2) {
        axis = 'z';
        $("#diffZ").css("background-color", "#BBBBBB");
    }

    window.TiltAppVars.disabledAxis = axis;
}

function randomizeTarget() {
    for (var i = 0; i < 3; i++) {
        var randomNum = Math.floor(Math.random()*11);
        var randomSign = Math.floor(Math.random()*2);
        randomNum *= (randomSign === 1) ? -1 : 1;

        if (i === 0)
            window.TiltAppVars.randomX = randomNum;
        else if (i === 1)
            window.TiltAppVars.randomY = randomNum;
        else if (i === 2)
            window.TiltAppVars.randomZ = randomNum;
    }

    $("#targetX").text(window.TiltAppVars.randomX);
    $("#targetY").text(window.TiltAppVars.randomY);
    $("#targetZ").text(window.TiltAppVars.randomZ);

    randomizeDisabledAxis();
}

function calculateDiff(x, y, z) {
    var diffX = Math.abs(roundTo1(window.TiltAppVars.randomX - x));
    var diffY = Math.abs(roundTo1(window.TiltAppVars.randomY - y));
    var diffZ = Math.abs(roundTo1(window.TiltAppVars.randomZ - z));

    $("#diffX").text(diffX);
    $("#diffY").text(diffY);
    $("#diffZ").text(diffZ);

    var changeColors = function(diff, elem) {
        if (diff <= 0.5) {
            $("#" + elem).css("background-color", "#00FF00");
        }
        else if (0.5 < diff && diff <= 1) {
            $("#" + elem).css("background-color", "#FFFF00");
        }
        else if (1 < diff && diff <= 3) {
            $("#" + elem).css("background-color", "#FFA200");
        }
        else {
            $("#" + elem).css("background-color", "#FF0000");
        }
    }

    var disabledAxis = window.TiltAppVars.disabledAxis;

    if (disabledAxis !== 'x')
        changeColors(diffX, "diffX");
    if (disabledAxis !== 'y')
        changeColors(diffY, "diffY");
    if (disabledAxis !== 'z')
        changeColors(diffZ, "diffZ");

    checkWin(diffX, diffY, diffZ);
}

function checkWin(diffX, diffY, diffZ) {
    var diffAxis1;
    var diffAxis2;

    var disabledAxis = window.TiltAppVars.disabledAxis;
    if (disabledAxis === 'x') {
        diffAxis1 = diffY;
        diffAxis2 = diffZ;
    }
    else if (disabledAxis === 'y') {
        diffAxis1 = diffX;
        diffAxis2 = diffZ;
    }
    else if (disabledAxis === 'z') {
        diffAxis1 = diffX;
        diffAxis2 = diffY;
    }

    if (diffAxis1 <= 0.1 && diffAxis2 <= 0.1) {
        if (window.TiltAppVars.hasWon === true) {
            window.TiltAppVars.hasWon = false;
            window.TiltAppVars.score += 100;
        }

        window.TiltAppVars.hasWon = true;

        $("body").css("background-color", "#22A800");
        $("body h1").text("Score: " + window.TiltAppVars.score);

        var newGameDelay = setTimeout(function(){
            newGame();
        },1000);
    }    
}

function score() {
    calculateDiff(window.TiltAppVars.randomX, window.TiltAppVars.randomY, window.TiltAppVars.randomZ);
}

function deductScore() {
    if (window.TiltAppVars.score != 0)
        window.TiltAppVars.score -= 1;

    $("body h1").text("Score: " + window.TiltAppVars.score);
}

function startOver() {
    newGame();
    window.TiltAppVars.score = 100;
    $("body h1").text("Score: " + window.TiltAppVars.score);
}

function newGame() {
    $("body").css("background-color", "#54C5EB");
    randomizeTarget();
}

function roundTo1(x) {
    return Math.round(x*10)/10;
}