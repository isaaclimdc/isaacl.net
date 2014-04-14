/*
Group Members:
Chin Yang Oh (chinyano)
Isaac Lim (idl)
Ronald Lai (rlai)
*/

// ############################################################################
// ###############################--CONTEXTS--#################################
// ############################################################################

// Main game context.
var canvasGame = document.getElementById("gameCanvas");
var ctxGame = canvasGame.getContext("2d");

// Start screen context.
var canvasStart = document.getElementById("gameCanvas");
var ctxStart = canvasStart.getContext("2d");

// End game context.
var canvasEnd = document.getElementById("gameCanvas");
var ctxEnd = canvasStart.getContext("2d");

// Init to main game context
var ctx = ctxGame;

// ############################################################################
// ################################--GLOBALS--#################################
// ############################################################################


// Global canvas variables.
var canvasWidth = 500;
var canvasHeight = 750;
// Distance from one corner to the other.
var canvasCornerToCorner = findHyp(canvasWidth, canvasHeight);
var canvasUnit = canvasWidth / 800;

// Global ship variables.
var shipWidth = canvasWidth / 30;
var shipHeight = canvasHeight * 45 / 900;

// Global run variables.
var intervalId;
var fps = 75
var timerDelay = Math.round(1000 / fps);
var quit = false;
var gameTimeElapsed = 0;

// Global asteroid variables.
var asteroidWidth = canvasWidth / 18;
var asteroidHeight = asteroidWidth;
var asteroidsMaxPerLine = 2;
var asteroidInterval = Math.round(800/timerDelay) * timerDelay;
var xVelocityAsteroid = 0 * (2 * canvasUnit);
var yVelocityAsteroid = 0.6 * (2 * canvasUnit) * 150.0 / fps;

// Global star variables.
var starWidth = canvasWidth / 160;
var starHeight = starWidth;
var starsMaxPerLine = 2;
var starInterval = Math.round(200/timerDelay) * timerDelay;
var xVelocityStar = 0 * (2 * canvasUnit);
var yVelocityStar = yVelocityAsteroid / 4;

// Global powerup variables.
var powerupWidth = canvasWidth / 20;
var powerupHeight = powerupWidth;
var powerupsMaxPerLine = 1;
var powerupInterval = Math.round(10000/timerDelay) * timerDelay;
var xVelocityPowerup = 0 * (2 * canvasUnit);
var yVelocityPowerup = yVelocityAsteroid/1.5;
// 1:phase, 2:laser
var powerupTypes = [1, 2];
var noOfPowerupTypes = powerupTypes.length;
var laserDuration = 8000;
var phaseDuration = 8000;

// Global physics variables.
var friction = 0.90;

// Scales to frame per second.
// ############################################################################
var xMaxSpeedShip = 1.5 * (2 * canvasUnit) * 150.0 / fps;
var yMaxSpeedShip = 1.5 * (2 * canvasUnit) * 150.0 / fps;
var xAccelerationShip = xMaxSpeedShip / 2.5;
var yAccelerationShip = yMaxSpeedShip / 2.5;
// ############################################################################

// Global enemy variables.
var enemyShipWidth = shipHeight
var enemyShipHeight = enemyShipWidth;
var numberOfEnemies = 1;
var enemySpeed = xMaxSpeedShip / 2.5;

// Global animation variables
var deathRingMaxRadius = canvasWidth;
var numberOfStars = 100;
var starsFilledScreen = false;
var numOfDeathRingCircles = 15;
var deathRingCircleRadius = shipHeight / 5;
var ringAnimationDistance = canvasWidth / 60;

// Default values to cater to changing difficulty.
defYVelocityAsteroid = yVelocityAsteroid;
defEnemySpeed = enemySpeed;
defNumberOfEnemies = numberOfEnemies;
defYVelocityStar = yVelocityStar;
defPowerupInterval = powerupInterval;

// JavaScript key codes.
var qCode = 81;
var leftCode = 37;
var upCode = 38;
var rightCode = 39;
var downCode = 40;
var spaceCode = 32;
var xCode = 88;




// ############################################################################
// ####################--UTILITY FUNCTIONS--###################################
// ############################################################################

// Takes a function and a list and applies the function to each element in the
// list, returning a copy of the result if constructive is indicated as
// true (otherwise, returns an empty list).
function map(fn, arr, constructive) {
    var result = [];
    var i;
    for (i = 0; i < arr.length; i++) {
        var x = fn(arr[i]);
        if (constructive === true) {
            result[i] = x;
        }
    }
    return result;
}

// Takes two functions and a list and, applies the first function to every
// element of the list for which the second function applied to it returns
// true. If the second (filter) function returns false, it simply leaves the
// element unmodified. Returns a copy of the result if the constructive is
// indicated as true (otherwise, returns an empty list).
function filtermap(fnApply, fnFilter, arr, constructive) {
    var result = map(function(elt) {
                        if (fnFilter(elt) === true)
                            {return fnApply(elt);}
                        else
                            {return elt;}
                    },
                    arr,
                    constructive);
    return result;
}

// Finds the hypotenuse of a triangle given it's other two sides.
function findHyp(sideA, sideB) {
    return Math.sqrt(sideA*sideA + sideB*sideB);
}


// ############################################################################
// ################################--OBJECTS--#################################
// ############################################################################


function Point(x, y) {
    this.x = x;
    this.y = y;
}

function Rect() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
}

function Velocity() {
    this.x = 0;
    this.y = 0;
}

function Score() {
    this.finalScore = 0;
    this.bonusScore = 0;
    this.currentScore = 0;
}

function Obj(){}
// obj.rect = (top_left_x_coordinate, top_left_y_coordinate, width, height)
Obj.prototype.rect;
Obj.prototype.velocity;
Obj.prototype.xMaxSpeedShip = xMaxSpeedShip;
Obj.prototype.yMaxSpeedShip = yMaxSpeedShip;
Obj.prototype.moving = false;
Obj.prototype.acceleratingLeft = false;
Obj.prototype.acceleratingRight = false;
Obj.prototype.acceleratingUp = false;
Obj.prototype.acceleratingDown = false;
Obj.prototype.xMaxSpeedShip = xMaxSpeedShip;
Obj.prototype.yMaxSpeedShip = yMaxSpeedShip;
Obj.prototype.collided = false;
Obj.prototype.limitToBoundary = false;
// 1:Ship, 2:Asteroids, 3:Enemy, 4:Powerup
Obj.prototype.objType = 0;
// Location of object's death.
Obj.prototype.deathPt;

// ############################################################################

function Ship() {
    Obj.call(this);
}
// Set up inheritance
Ship.prototype = new Obj();

// correct the constructor
Ship.prototype.constructor = Ship;

// overide rect values
Ship.prototype.rect = new Rect();
Ship.prototype.velocity = new Velocity();
Ship.prototype.rect.width = shipWidth;
Ship.prototype.rect.height = shipHeight;
Ship.prototype.rect.x = (canvasWidth - shipWidth) / 2;
Ship.prototype.rect.y = (canvasHeight - shipHeight) / 2; //canvasHeight * 0.95 - shipHeight;
// limit ship's movement to within canvas boundaries.
Ship.prototype.limitToBoundary = true;
// True when death animation of ship has ended.
Ship.prototype.deathAnimationEnd = false;
// Radius of ship's death circle.
Ship.prototype.deathRingRadius = 0;
// Radius of indiv circles in ship's death circle;
Ship.prototype.laserOn = false;
Ship.prototype.laserTimer = 0;
Ship.prototype.phaseOn = false;
Ship.prototype.phaseTimer = 0;
Ship.prototype.objType = 1;

// ############################################################################

function Asteroid(rect, velocity){
    Obj.call(this);
    if (rect === undefined) {
        this.rect = new Rect();
        this.rect.width = asteroidWidth;
        this.rect.height = this.rect.width;
    }
    else {
        this.rect = rect;
    }
    if (velocity === undefined) {
        this.velocity = new Velocity();
    }
    else {
        this.velocity = velocity;
    }
    this.outlinePoints = [];
    this.radius = 20;
    this.objType = 2;
}

// Set up inheritance
Asteroid.prototype = new Obj();

// correct the constructor
Asteroid.prototype.constructor = Asteroid;


// ############################################################################

function Star(rect, velocity){
    Obj.call(this);
    if (rect === undefined) {
        this.rect = new Rect();
        this.rect.width = starWipowerup
        this.rect.height = this.rect.width;
    }
    else {
        this.rect = rect;
    }
    if (velocity === undefined) {
        this.velocity = new Velocity();
    }
    else {
        this.velocity = velocity;
    }
}

// Set up inheritance
Star.prototype = new Obj();

// correct the constructor
Star.prototype.constructor = Star;

// ############################################################################

function Powerup(rect, velocity, type){
    Obj.call(this);
    if (rect === undefined) {
        this.rect = new Rect();
        this.rect.width = powerupWidth;
        this.rect.height = this.rect.width;
    }
    else {
        this.rect = rect;
    }
    if (velocity === undefined) {
        this.velocity = new Velocity();
    }
    else {
        this.velocity = velocity;
    }
    this.type = type;
    this.objType = 4;
}

// Set up inheritance
Powerup.prototype = new Obj();

// correct the constructor
Powerup.prototype.constructor = Powerup;

// ############################################################################

function DeathRing(deathPt, objType) {
    this.deathPt = deathPt;
    this.deathRingRadius = 0;
    this.objType = objType;
}

function Game() {
    this.ship;
    this.asteroidArray;
    this.enemyArray;
    // Contains the list of (x, y, starWidth) values for the bg stars.
    this.starArray;
    this.deathRingArray = [];
    this.noOfEnemiesCreated = 0;
    this.score = new Score();
    this.scoreMultiplier = 1;
}


// ############################################################################
// ###############################--STARS--####################################
// ############################################################################


// Inits initial stars array.
function createStars() {
    // Load globals
    var max = starsMaxPerLine;
    var width = starWidth;
    var xSpeed = xVelocityStar;
    var ySpeed = yVelocityStar;

    var starArray = [];
    var n = Math.floor(Math.random() * (max+1));
    for (var i = 0; i < n; i++) {
        var rect = new Rect();
        rect.x = Math.random() * canvasWidth;
        rect.y = -(canvasHeight/15);
        rect.width = width + (Math.random() * 0.7) * width;
        rect.height = rect.width;
        var velocity = new Velocity();
        velocity.x = xSpeed;
        velocity.y = ySpeed;
        var star = new Star(rect, velocity);
        starArray.push(star);
    }
    return starArray;
}

// Generate new stars at interval
function generateStars(starArray) {
    var currentTime = Math.round(gameTimeElapsed)
    if ((Math.round(currentTime/starInterval) * starInterval)===currentTime) {
        var newStars = createStars();
        for (var i = 0; i < newStars.length; i++) {
            starArray.push(newStars[i]);
        }
    }
}

// Move stars
function moveStars(starArray) {
    map(move, starArray, false);
}

// Clear disappeared stars.
function removeDeadStars(game) {
    for (var i = 0; i < game.starArray.length; i++) {
        if (!withinBoundariesStar(game.starArray[i])) {
            if (starsFilledScreen === false) {
                starsFilledScreen = true;
            }
            game.starArray.splice(i, 1);
            i--;
        }
    }
}

// ##############################--DRAWING--###################################


// Draws all the stars.
function drawAllStars(starArray) {
    ctx.fillStyle = "white";
    map(function(star) {
        ctx.fillRect(star.rect.x, star.rect.y,
                     star.rect.width, star.rect.height);
        },
        starArray,
        false);
}




// ############################################################################
// #############################--ASTEROIDS--##################################
// ############################################################################


// returns the point on the circumference on a circle at that angle.
function getPointOnCircumference(center, radius, angle)
{
    var x = Math.floor(center.x + radius * Math.sin(angle * Math.PI/180));
    var y = Math.floor(center.y + radius * -Math.cos(angle * Math.PI/180));
    var point = new Point(x, y);

    return point;
}


// Calculates the angle for the x slice of a circle divided into n slices.
function getAngleForSlice(sliceIndex, numOfSlices)
{
    return (360 / numOfSlices) * (sliceIndex + 1);
}


// randomly generates the outline of an asteroid.
function getOutlinePointsOfAsteroid(asteroid)
{
    /* ## Constant parameters for this function ## */
    var numOfPoints = 20;        // The higher the more circle-like
    var radiusOfSubCircle = asteroid.rect.width * 0.05;
    /* ########################################### */

    var pointsArray = new Array(numOfPoints);

    // Get the points on the main circle
    var center = new Point(asteroid.rect.x + asteroid.rect.width/2, asteroid.
                 rect.y + asteroid.rect.height/2);

    for (var mainIndex = 0; mainIndex < numOfPoints - 1; mainIndex++) {
        var angle = getAngleForSlice(mainIndex, numOfPoints); // in degrees
        var centerOfSubCircle = getPointOnCircumference(center, asteroid.radius, angle); // this gives the center of each of the subcircles

        var numOfSubPoints = 3;
        var randomIndex = Math.floor(Math.random() * numOfSubPoints);
        var subAngle = getAngleForSlice(randomIndex, numOfSubPoints);

        var outlinePoint = getPointOnCircumference(centerOfSubCircle, radiusOfSubCircle, subAngle);

        outlinePoint.x -= asteroid.rect.x;
        outlinePoint.y -= asteroid.rect.y;

        pointsArray[mainIndex] = outlinePoint;
    }
    return pointsArray;
}

// Inits initial asteroid array.
function createAsteroids() {
    // Load globals
    var max = asteroidsMaxPerLine;
    var width = asteroidWidth;
    var xSpeed = xVelocityAsteroid;
    var ySpeed = yVelocityAsteroid;

    var asteroidArray = [];
    var n = Math.floor(Math.random() * (max+1));
    for (var i = 0; i < n; i++) {
        var rect = new Rect();
        rect.x = Math.random() * canvasWidth;
        rect.y = -(canvasHeight/15);
        // Added random sizes code - Isaac
        rect.width = width + (Math.random() * 0.7) * width;
        rect.height = rect.width;
        var velocity = new Velocity();
        velocity.x = xSpeed;
        velocity.y = ySpeed;
        var asteroid = new Asteroid(rect, velocity);
        asteroid.radius = asteroid.rect.width / 2 * 1.2;
          asteroid.outlinePoints = getOutlinePointsOfAsteroid(asteroid);
          asteroidArray.push(asteroid);
    }
    return asteroidArray;
}

// Generate new asteroids at interval
function generateAsteroids(asteroidArray) {
    var currentTime = Math.round(gameTimeElapsed)
    if ((Math.round(currentTime/asteroidInterval) * asteroidInterval) === currentTime) {

        var newAsteroids = createAsteroids();
        for (var i = 0; i < newAsteroids.length; i++) {
            asteroidArray.push(newAsteroids[i]);
        }
    }
}

// Move asteroids
function moveAsteroids(asteroidArray) {
    map(move, asteroidArray, false);
}

// Clear exploded or disappeared asteroids. (can stick this around line 320)
// Do we want to remove collided asteroids? if not, can take that line out.
function removeDeadAsteroids(game) {
    for (var i = 0; i < game.asteroidArray.length; i++) {
        if ((!withinBoundariesAsteroid(game.asteroidArray[i])) ||
            (game.asteroidArray[i].collided)) {
            game.asteroidArray.splice(i, 1);
            i--;
        }
    }
}

// ##############################--DRAWING--###################################


function drawAsteroid(asteroid) {
    var outlinePoints = asteroid.outlinePoints;
    var startingPoint = outlinePoints[0];

    // set drawing properties.
    // add linear gradient
    var grd = ctx.createLinearGradient(asteroid.rect.x, asteroid.rect.y,
                                       asteroid.rect.x + asteroid.rect.width,
                                       asteroid.rect.y + asteroid.rect.height);
    grd.addColorStop(0, "#827465");
    grd.addColorStop(1, "#30271E");
    ctx.fillStyle = grd;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#30271E";

    ctx.beginPath();
    ctx.moveTo(startingPoint.x + asteroid.rect.x, startingPoint.y +
               asteroid.rect.y);

    for (var i = 1; i < outlinePoints.length - 1; i++) {
        var point = outlinePoints[i];
        ctx.lineTo(point.x + asteroid.rect.x, point.y + asteroid.rect.y);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// Draws all the asteroids.
function drawAllAsteroids(asteroidArray) {
    filtermap(drawAsteroid,
              function(astd) {return !(astd.collided);},
              asteroidArray,
              false);
}

// ############################################################################
// ##############################--POWERUPS--##################################
// ############################################################################


// Inits initial powerups array.
function createPowerups() {
    // Load globals
    var max = powerupsMaxPerLine;
    var width = powerupWidth;
    var xSpeed = xVelocityPowerup;
    var ySpeed = yVelocityPowerup;
    var typeIndex;
    var powerupArray = [];
    var n = Math.floor(Math.random() * (max + 1));
    for (var i = 0; i < n; i++) {
        var rect = new Rect();
        rect.x = Math.random() * canvasWidth;
        rect.y = -(canvasHeight/15);
        rect.width = width;
        rect.height = rect.width;
        var velocity = new Velocity();
        velocity.x = xSpeed;
        velocity.y = ySpeed;
        var powerup = new Powerup(rect, velocity);
        typeIndex = Math.floor(Math.random() * (noOfPowerupTypes));
        powerup.type = powerupTypes[typeIndex];
        powerupArray.push(powerup);
    }
    return powerupArray;
}

// Generate new stars at interval
function generatePowerups(powerupArray) {
    var currentTime = Math.round(gameTimeElapsed)
    if ((Math.round(currentTime/powerupInterval) * powerupInterval) === currentTime) {
        var newPowerups = createPowerups();
        for (var i = 0; i < newPowerups.length; i++) {
            powerupArray.push(newPowerups[i]);
        }
    }
}

// Move powerups
function movePowerups(powerupArray) {
    for (var i = 0; i < powerupArray.length; i++) {
        move(powerupArray[i]);
    }
}

// Clear exploded or disappeared powerups. (can stick this around line 320)
// Do we want to remove collided powerups? if not, can take that line out.
function removeDeadPowerups(game) {
    for (var i = 0; i < game.powerupArray.length; i++) {
        if (!withinBoundariesStar(game.powerupArray[i]) ||
            powerupArray[i].collided === false) {
            game.powerupArray.splice(i, 1);
            i--;
        }
    }
}

// Remove power up
function powerupTimer(ship) {
    if (ship.laserOn == true) {
        ship.laserTimer -= timerDelay;
    }
    if (ship.phaseOn == true) {
        ship.phaseTimer -= timerDelay;
    }
    // Turns off powerups once time is up.
    if (ship.laserTimer < 0) {
        ship.laserOn = false;
    }
    if (ship.phaseTimer < 0) {
        ship.phaseOn = false;
    }
}

// ##############################--DRAWING--###################################


function drawPowerup(powerup)
{
    var grd;

    if (powerup.type === 1) {
        grd = ctx.createRadialGradient(powerup.rect.x + powerup.rect.width/2,                              powerup.rect.y + powerup.rect.height/2,
                                       powerup.rect.width/4,
                                       powerup.rect.x + powerup.rect.width/2,
                                       powerup.rect.y + powerup.rect.height/2,
                                       powerup.rect.width/2);
        grd.addColorStop(0.0, "rgba(255, 255, 0, 1.0)");
        grd.addColorStop(1.0, "rgba(255, 255, 0, 0.0)");
    }
    else {
        grd = ctx.createRadialGradient(powerup.rect.x + powerup.rect.width/2,                              powerup.rect.y + powerup.rect.height/2,
                                       powerup.rect.width/4,
                                       powerup.rect.x + powerup.rect.width/2,
                                       powerup.rect.y + powerup.rect.height/2,
                                       powerup.rect.width/2);
        grd.addColorStop(0.0, "rgba(84, 200, 232, 1.0)");
        grd.addColorStop(1.0, "rgba(84, 200, 232, 0.0)");
    }

    ctx.fillStyle = grd;

    circle(powerup.rect.x + powerup.rect.width/2,
           powerup.rect.y + powerup.rect.height/2, powerup.rect.width/2);
    ctx.fill();
}

// Draws all the asteroids.
function drawAllPowerups(powerupArray) {
    filtermap(drawPowerup,
              function(powerup) {return !(powerup.collided);},
              powerupArray,
              false);
}

function roundedRect(x,y,width,height,radius){
    ctx.beginPath();
    ctx.moveTo(x,y-radius);
    ctx.lineTo(x,y+height+radius);
    ctx.quadraticCurveTo(x,y+height,x+radius,y+height);
    ctx.lineTo(x+width-radius,y+height);
    ctx.quadraticCurveTo(x+width,y+height,x+width,y+height+radius);
    ctx.lineTo(x+width,y-radius);
    ctx.quadraticCurveTo(x+width,y,x+width-radius,y);
    ctx.lineTo(x+radius,y);
    ctx.quadraticCurveTo(x,y,x,y-radius);
    ctx.closePath();
}

function drawPowerupLevel(ship) {
    var phaseRatio = ship.phaseTimer/phaseDuration;
    var laserRatio = ship.laserTimer/laserDuration;
    var roundRectRadius = 8*canvasUnit;
    var rectHeight = 220*canvasUnit;
    ctx.beginPath();
    ctx.fillStyle = "rgba(84, 200, 232, 1.0)";
    if (phaseRatio > roundRectRadius/rectHeight) {
        roundedRect(35*canvasUnit, 350*canvasUnit, 15*canvasUnit,
                    -rectHeight*phaseRatio,roundRectRadius);
        ctx.fill();
    }
    ctx.fillStyle = "rgba(255, 255, 0, 1.0)";
    if (laserRatio > roundRectRadius/rectHeight) {
        roundedRect(60 *canvasUnit, 350*canvasUnit, 15*canvasUnit,
                    -rectHeight*laserRatio,roundRectRadius);
        ctx.fill();
    }
    ctx.closePath();

}

// ############################################################################
// ##############################--SPACESHIP--#################################
// ############################################################################


function checkDeath(game) {
    if (game.ship.collided === true) {
        game.ship.deathPt =
            new Point(game.ship.rect.x + game.ship.rect.width/2,
                      game.ship.rect.y + game.ship.rect.height/2);
        clearInterval(intervalId);
        canvasEnd.focus();
        ctx = ctxEnd;
        canvasGame.removeEventListener('keydown',
                                    function(event){onKeyDownGame(event,game)},
                                    false);
        canvasGame.removeEventListener('keyup',
                                    function(event){onKeyUpGame(event,game)},
                                    false);
        canvasEnd.addEventListener('keydown',
                                    function(event){onKeyDownEnd(event,game)},
                                    false);
        intervalId = setInterval(function(){onTimerEnd(game)}, timerDelay);
    }
}

// ##############################--DRAWING--###################################


function drawLaser(ship) {
    var grd = ctx.createLinearGradient(ship.rect.x + ship.rect.width*1/4, 0, ship.rect.x + ship.rect.width*3/4, 0);
    grd.addColorStop(0.0, "rgba(255, 255, 0, 0.3)");
    grd.addColorStop(0.5, "rgba(255, 255, 0, 1.0)");
    grd.addColorStop(1.0, "rgba(255, 255, 0, 0.3)");
    ctx.fillStyle = grd;

    ctx.beginPath();
    ctx.moveTo(ship.rect.x + ship.rect.width/2, ship.rect.y);
    ctx.lineTo(ship.rect.x + ship.rect.width*3/4,
               ship.rect.y - ship.rect.height/4);
    ctx.lineTo(ship.rect.x + ship.rect.width*3/4, 0)
    ctx.lineTo(ship.rect.x + ship.rect.width*1/4, 0)
    ctx.lineTo(ship.rect.x + ship.rect.width*1/4,
               ship.rect.y - ship.rect.height/4);
    ctx.closePath();
    ctx.fill();

    // ctx.fillStyle = "white";

    // ctx.beginPath();
    // ctx.moveTo(ship.rect.x + ship.rect.width/2, ship.rect.y);
    // ctx.lineTo(ship.rect.x + ship.rect.width*5/9,
    //            ship.rect.y - ship.rect.height/4);
    // ctx.lineTo(ship.rect.x + ship.rect.width*5/9, 0)
    // ctx.lineTo(ship.rect.x + ship.rect.width*4/9, 0)
    // ctx.lineTo(ship.rect.x + ship.rect.width*4/9,
    //            ship.rect.y - ship.rect.height/4);
    // ctx.closePath();
    // ctx.fill();
}

function drawShip(ship) {
    var x = ship.rect.x;
    var y = ship.rect.y;

    // Draw Flames.
    if (ship.velocity.y < 0) {
        // How long the flame should be based on current y speed.
        var speedRatio = Math.abs(ship.velocity.y/yMaxSpeedShip);
        // draw engine flames.
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.moveTo(x + 0.15*ship.rect.width,
                   y + 1.08*ship.rect.height);
        ctx.lineTo(x + 0.5*ship.rect.width,
                   y + (1 + speedRatio*0.5) * 1.08 * ship.rect.height);
        ctx.lineTo(x + 0.85*ship.rect.width,
                   y + 1.08*ship.rect.height);
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.moveTo(x + 0.35*ship.rect.width,
                   y + 1.08*ship.rect.height);
        ctx.lineTo(x + 0.5*ship.rect.width,
                   y + (1 + speedRatio*0.3) * 1.08 * ship.rect.height);
        ctx.lineTo(x + 0.65*ship.rect.width,
                   y + 1.08*ship.rect.height);
        ctx.closePath();
        ctx.fill();
    }

    var grd = ctx.createLinearGradient(0, y,
                                       0,
                                       y + ship.rect.height);
    // Draw Ship.
    // add linear gradient
    if (ship.phaseOn === true) {
        grd.addColorStop(0, "rgba(255, 255, 255, 0.3)");
        grd.addColorStop(1, "rgba(30, 30, 30, 0.3)");
    }

    else {
        grd.addColorStop(0, "rgba(83, 174, 219, 1.0)");
        grd.addColorStop(1, "rgba(0, 53, 145, 1.0)");
    }

    ctx.fillStyle = grd;

    ctx.beginPath();
    ctx.moveTo(x + ship.rect.width/2, y);
    ctx.lineTo(x + ship.rect.width,
               y + ship.rect.height/2);
    ctx.lineTo(x + ship.rect.width,
               y + ship.rect.height*2/3);
    ctx.lineTo(x + 1.5*ship.rect.width,
               y + ship.rect.height*7/8);
    // Bottom right most point of ship.
    ctx.lineTo(x + 1.5*ship.rect.width,
               y + ship.rect.height);
    ctx.lineTo(x + 0.9*ship.rect.width,
               y + ship.rect.height);
    ctx.lineTo(x + 0.9*ship.rect.width,
               y + 1.08*ship.rect.height);
    // Point of symmetry.
    ctx.lineTo(x + 0.1*ship.rect.width,
               y + 1.08*ship.rect.height);
    ctx.lineTo(x + 0.1*ship.rect.width,
               y + ship.rect.height);
    ctx.lineTo(x - 0.5* ship.rect.width,
               y + ship.rect.height);
    ctx.lineTo(x - 0.5 * ship.rect.width,
               y + ship.rect.height*7/8);
    ctx.lineTo(x, y + ship.rect.height*2/3);
    ctx.lineTo(x, y + ship.rect.height/2);
    ctx.closePath();
    ctx.fill();

    if (ship.laserOn === true) {
        drawLaser(ship);
    }
}


// ############################################################################
// ################################--ENEMIES--#################################
// ############################################################################


// Checks whether the objArray[i] has collided with any of the other obj in the
// same array.
function checkObjObjCollisions(objArray, index) {
    for (var j = 0; j < objArray.length; j++) {
        if (index != j) {
            if (detectCollision(objArray[index], objArray[j])) {
                obj[index].touching = true;
                return;
            }
        }
    }
    objArray[index].touching = false;
}


// Modify the velocity of enemy ships such that it's always going towards ship.
function modEnemyVelocity(enemyArray, ship) {
    var modVel = function(enemy) {
            var deltaX = ship.rect.x - enemy.rect.x;
            var deltaY = ship.rect.y - enemy.rect.y;
            var distanceScaling = enemySpeed / findHyp(deltaX,deltaY);
            enemy.velocity.x = deltaX * distanceScaling;
            enemy.velocity.y = deltaY * distanceScaling;
        };
    map(modVel,
        enemyArray,
        false);
}

function moveEnemies(enemyArray) {
    for (var i = 0; i < enemyArray.length; i++) {
        move(enemyArray[i]);
    }
}


function createEnemy() {
    var enemy = new Ship();
    enemy.rect = new Rect();
    enemy.velocity = new Velocity();
    enemy.rect.width = enemyShipWidth;
    enemy.rect.height = enemyShipHeight;
    enemy.rect.y = canvasHeight + enemyShipHeight;
    // If enemy ship is touching another enemy ship.
    enemy.touching = false;
    // Cartesian points of the ship outline, for use in drawing the enemy.
    enemy.mainBody = [[4,-0.5],[5.25,5],[6,5],[5,3],[8,6],[6,8],[6,6.5],[4,8],
                    [2,6.5],[2,8],[0,6],[3,3],[2,5],[2.75,5]];
    enemy.wings    = [[1.5,1],[2,2],[4,1],[6,2],[6.5,1],[7,3],[4,2.5],[1,3]];
    enemy.objType = 3;

    return enemy;
}

// Inits initial enemies array.
function createEnemies() {
    var enemyArray = [];

    return enemyArray;
}

// Takes an enemyArray, and number n, and adds enemies to the array until
// there are n enemies in it.
function regenEnemies(game, n) {
    var numNewEnemies = n - game.enemyArray.length;
    for (var i = 0; i < numNewEnemies; i++) {
        var newEnemy = createEnemy();
        newEnemy.rect.x = Math.random() * (canvasWidth - enemyShipWidth);
        game.noOfEnemiesCreated++;
        game.enemyArray.push(newEnemy);
    }
}

function checkEnemyAsteroidCollisions(enemyArray, asteroidArray,
                                      deathRingArray) {
    for (var i = 0; i < enemyArray.length; i++) {
        checkCollisions(enemyArray[i], asteroidArray, deathRingArray)
    }
}

function removeDeadEnemies(enemyArray) {
    // Removes dead enemies.
    for (var j = 0; j < enemyArray.length; j++) {
        if (enemyArray[j].collided === true) {
            enemyArray.splice(j,1);
            // modify j since now one element in the array is gone.
            j--;
        }
    }
}

function calcEnemiesKilled() {
    var enemiesAlive = 0;
    for (var i = 0; i < game.enemyArray.length; i++) {
        if (game.enemyArray[i].collided === false) {
            enemiesAlive++;
        }
    }
    return game.noOfEnemiesCreated - enemiesAlive;
}

// ##############################--DRAWING--###################################

function drawPoints(points, ship) {
    // Caresian coordinates when dividing ship rect in to a 8 by 8 square.
    var x = (points[0])[0];
    var y = (points[0])[1];
    // Actual pixel coordinates.
    var actualX = ship.rect.x + (x / 8.0) * ship.rect.width;
    var actualY = ship.rect.y + (y / 8.0) * ship.rect.height;
    ctx.beginPath();
    ctx.moveTo(actualX, actualY);
    for (var i = 1; i < points.length; i++) {
        x = (points[i])[0];
        y = (points[i])[1];
        actualX = ship.rect.x + (x / 8.0) * ship.rect.width;
        actualY = ship.rect.y + (y / 8.0) * ship.rect.height;
        ctx.lineTo(actualX, actualY);
    }
    ctx.closePath();
    ctx.fill();
}

function drawEnemy(ship) {
    var grd = ctx.createLinearGradient(0, ship.rect.y,
                                       0, ship.rect.y + ship.rect.height);
    grd.addColorStop(0, "#EB0000");
    grd.addColorStop(1, "#570000");
    ctx.fillStyle = grd;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#30271E";

    drawPoints(ship.mainBody, ship);
    drawPoints(ship.wings, ship);
}

// Draws all the enemies.
function drawAllEnemies(enemyArray){
    filtermap(drawEnemy,
              function(enemy) {return !(enemy.collided);},
              enemyArray,
              false);
}

function drawDeathRings(deathRingArray) {
    var color;
    for (var i = 0; i<deathRingArray.length;i++) {
    // Don't draw if ring has expanded beyond boundaries of canvas.
        if (deathRingArray[i].deathRingRadius < deathRingMaxRadius) {
            deathRingArray[i].deathRingRadius += ringAnimationDistance;
            drawRingOfCircles(deathRingArray[i],
                              deathRingArray[i].deathPt,
                              deathRingArray[i].objType);
        }
        else {
            // Animation done. Can remove ship now.
            deathRingArray.splice(i,1);
            // modify i since now one element in the array is gone.
            i--;
        }
    }
}

// ############################################################################
// ###############################--SCORE--####################################
// ############################################################################


function updateScoreWithTime(gameTimeElapsed) {
    ctx.fillStyle = "white";
    ctx.font = "20px Georgia";
    ctx.textBaseline = "middle";

    game.score.currentScore = Math.round(gameTimeElapsed/100) * 10
                              + game.score.bonusScore;
    var txt = "Score: " + game.score.currentScore;
    ctx.fillText(txt, 20, 30);

    txt = "Enemies killed: " + calcEnemiesKilled();
    ctx.fillText(txt, 20, 60);
}


// ############################################################################
// #################################--UI--#####################################
// ############################################################################

function drawUI(ship) {

    ctx.font = "20px Georgia";
    ctx.fillStyle = "gray";
    ctx.textBaseline = "middle";
    ctx.fillText("Press 'q' to quit.", canvasWidth - 160, 30);
}


// ############################################################################
// ##############################--PHYSICS--###################################
// ############################################################################

// Constantly modifies the ship's velocity based on it's acceleration in the x
// and y axis.
function modVelocity(obj) {
    if ((obj.acceleratingLeft == true) && obj.velocity.x > -obj.xMaxSpeedShip){
        obj.velocity.x -= xAccelerationShip;
    }
    if ((obj.acceleratingRight == true) && obj.velocity.x < obj.xMaxSpeedShip){
       obj.velocity.x += xAccelerationShip;
    }
    if ((obj.acceleratingUp == true) && obj.velocity.y > -obj.yMaxSpeedShip) {
        obj.velocity.y -= yAccelerationShip;
    }
    if ((obj.acceleratingDown == true) && obj.velocity.y < obj.yMaxSpeedShip) {
        obj.velocity.y += yAccelerationShip;
    }
}


// Checks if an object is within the boundaries of the canvas.
function withinBoundaries(obj) {
    if (obj.rect.x < 0 || (obj.rect.x + obj.rect.width) > canvasWidth) {
        return false;
    }
    else if (obj.rect.y < 0 || (obj.rect.y + obj.rect.height) > canvasHeight) {
        return false;
    }
    else {
        return true;
    }
}

// Checks if an asteroid is within boundaries. The difference from withinBoundaries being that, since
// we are having asteroids start at rect.y < 0, we don't count that as being
// out of boundaries.
// It might be nicer to make this a method of the Asteroid object.
// And the generic WithinBoundaries can be a method of the generic Obj.
function withinBoundariesAsteroid(astd) {
    if (astd.rect.x < 0 || (astd.rect.x + astd.rect.width) > canvasWidth) {
        return false;
    }
    else if ((astd.rect.y) > canvasHeight) {
        return false;
    }
    else {
        return true;
    }
}

function withinBoundariesStar(star) {
    if ((star.rect.y) > canvasHeight) {
        return false;
    }
    else {
        return true;
    }
}

// Moves the object by modifying it's location based on it's current velocity.
function move(obj) {
    obj.rect.y += obj.velocity.y;
    obj.rect.x += obj.velocity.x;
    // If the obj is limited to the boundaries, move it back if it's now out
    // of the boundary.
    if (obj.limitToBoundary === true) {
        if (obj.rect.x <= 0 &&  obj.velocity.x < 0) {
            obj.rect.x -= obj.velocity.x;
        }
        if (obj.rect.x+obj.rect.width > canvasWidth && obj.velocity.x > 0) {
            obj.rect.x -= obj.velocity.x;
        }
        if (obj.rect.y <= 0 &&  obj.velocity.y < 0) {
            obj.rect.y -= obj.velocity.y;
        }
        if (obj.rect.y+obj.rect.height > canvasHeight && obj.velocity.y > 0) {
            obj.rect.y -= obj.velocity.y;
        }
    }
}

// returns true if ship is currently moving.
function checkShipMoving(ship) {
    return (ship.acceleratingLeft || ship.acceleratingRight ||
            ship.acceleratingDown || ship.acceleratingUp)
}

// handles friction, naturally decelerates the ship.
function handleFriction(ship) {
    // Checks if any of the arrow keys are being pressed.
    if (ship.acceleratingRight === false && ship.acceleratingLeft === false) {
        ship.velocity.x *= friction;
    }
    if (ship.acceleratingUp === false && ship.acceleratingDown === false) {
        ship.velocity.y *= friction;
    }
}

// #############################--COLLISION--##################################

// Checks whether a point (x,y) is within a rect RectB.
function withinRect(x, y, rectB) {
    if ((x <= rectB.x + rectB.width) && (x >= rectB.x)) {
        if ((y <= rectB.y + rectB.height) && (y >= rectB.y)) {
            return true;
        }
    }
    else {
        return false;
    }
}

// Checks whether two rects have collided.
// Two rects have intersected if one of the corner points of one rect is within
// the boundaries of the other rect.
function detectCollision(objA, objB) {
    // if one of the objects have already collided, remove it.
    if (objA.collided === true || objB.collided === true) return false;
    if ( withinRect(objA.rect.x, objA.rect.y, objB.rect) ||
         withinRect(objA.rect.x + objA.rect.width, objA.rect.y, objB.rect) ||
         withinRect(objA.rect.x + objA.rect.width,
                    objA.rect.y + objA.rect.height, objB.rect) ||
         withinRect(objA.rect.x,objA.rect.y + objA.rect.height, objB.rect)) {
        return true;
    }
    else {
        return false;
    }
}

function detectLaserCollision(ship, obj) {
    // if one of the objects have already collided, remove it.
    if (ship.collided === true || obj.collided === true) return false;
    if ((obj.rect.y + obj.rect.height) < ship.rect.y &&
        (ship.rect.x + ship.rect.width/2) >= obj.rect.x &&
        (ship.rect.x + ship.rect.width/2) <= (obj.rect.x + obj.rect.width)) {
        return true;
    }
    else {
        return false;
    }
}

// Checks whether the ship has collided with any of the objs in objArray.
function checkCollisions(ship, objArray, deathRingArray) {
    // Don't check if ship has already collided.
    if (ship.collided === true) return;
    var deathPt;
    for (var i = 0; i < objArray.length; i++) {
        if (detectCollision(ship, objArray[i])) {
            ship.collided = true;
            ship.deathPt =
                new Point(ship.rect.x + ship.rect.width/2,
                          ship.rect.y + ship.rect.height/2);
            if (ship.objType != 1) {
                deathRingArray.push(new DeathRing(ship.deathPt, ship.objType));
            }
            objArray[i].collided = true;
            if (ship.objType === 3) {
                game.score.bonusScore += 500 * game.scoreMultiplier
            }
            deathPt = new Point(objArray[i].rect.x + objArray[i].rect.width/2,
                          objArray[i].rect.y + objArray[i].rect.height/2);
            deathRingArray.push(new DeathRing(deathPt, objArray[i].objType));


        }
    }
}


// Checks whether the ship's laser has contacted any of the objects in objArray
function checkLaserCollisions(ship, objArray, deathRingArray) {
    // Don't check if ship has already collided.
    if (ship.collided === true) return;
    for (var i = 0; i < objArray.length; i++) {
        if (ship.laserOn && detectLaserCollision(ship, objArray[i])) {
            objArray[i].collided = true;
            if (objArray[i].objType === 3) {
                game.score.bonusScore += 500 * game.scoreMultiplier
            }
            deathPt = new Point(objArray[i].rect.x + objArray[i].rect.width/2,
                          objArray[i].rect.y + objArray[i].rect.height/2);
            deathRingArray.push(new DeathRing(deathPt, objArray[i].objType));
        }
    }
}


// Checks whether the ship has collided with any of the objs in objArray.
function checkPowerupCollisions(ship, objArray) {
    // Don't check if ship has already collided.
    if (ship.collided === true) return;
    for (var i = 0; i < objArray.length; i++) {
        if (detectCollision(ship, objArray[i])) {
            objArray[i].collided = true;
            if (objArray[i].type === 1) {
                ship.laserOn = true;
                ship.laserTimer = laserDuration;
            }
            else if (objArray[i].type === 2) {
                ship.phaseOn = true;
                ship.phaseTimer = phaseDuration;
            }
        }
    }
}


// Checks whether the objArray[i] has collided with any of the other obj in the
// same array.
function checkObjObjCollisions(objArray, index) {
    for (var j = 0; j < objArray.length; j++) {
        if (index != j) {
            if (detectCollision(objArray[index], objArray[j])) {
                objArray[index].touching = true;
            }
        }
    }
}

// ############################################################################
// ################################--CORE--####################################
// ############################################################################


// inits game back to default values.
function initGame(game) {
    gameTimeElapsed = 0;

    game.ship.rect.width = shipWidth;
    game.ship.rect.height = shipHeight;
    game.ship.rect.x = (canvasWidth - shipWidth) / 2;
    game.ship.rect.y = (canvasHeight - shipHeight) / 2;
    game.ship.velocity.x = 0;
    game.ship.velocity.y = 0;
    game.ship.collided = false;
    game.ship.deathAnimationEnd = false;
    game.ship.deathRingRadius = 0;
    game.ship.laserOn = false;
    game.ship.phaseOn = false;
    game.ship.laserTimer = 0;
    game.ship.phaseTimer = 0;

    game.asteroidArray = [];
    game.starArray = [];
    game.powerupArray = [];

    game.enemyArray = createEnemies();
    game.noOfEnemiesCreated = 0;

    game.score.finalScore = 0;
    game.score.bonusScore = 0;

    game.deathRingArray = [];
    game.bonusScore = 0;

    // Reset change in difficulty variables.
    yVelocityAsteroid = defYVelocityAsteroid
    enemySpeed = defEnemySpeed
    numberOfEnemies = defNumberOfEnemies;
    yVelocityStar = defYVelocityStar
    powerupInterval = defPowerupInterval;
    game.scoreMultiplier = 1;

    starsFilledScreen = false;
    // ensure that stars fill the screen.
    while (starsFilledScreen === false) {
        gameTimeElapsed += timerDelay
        generateStars(game.starArray);
        moveStars(game.starArray);
        removeDeadStars(game);
        if (starsFilledScreen === true) {
            gameTimeElapsed = 0;
        }
    }
}

function timeNearlyEqual(timeA, timeB) {
    if (((timeB-20) <= timeA) && ((timeB+20) >= timeA)) {
        return true;
    }
    else {return false;}
}

function updateYVelocitiesObj(objArray, yValue) {
    for (var i = 0; i<objArray.length; i++) {
        objArray[i].velocity.y = yValue;
    }
}

// Update velocities of stars, and asteroids to reflect new default values.
function updateYVelocitiesAll(game) {
    updateYVelocitiesObj(game.asteroidArray, yVelocityAsteroid);
    updateYVelocitiesObj(game.starArray, yVelocityStar);
}


// Increases the difficulty of the game as time passes.
function updateDifficulty(game) {
    var currentTime = gameTimeElapsed;
    var updateAt = [60000,120000,180000]
    if (timeNearlyEqual(currentTime,updateAt[0])) {
        enemySpeed *= 1.1;
        yVelocityAsteroid *= 1.1;
        yVelocityStar *= 1.1;
        updateYVelocitiesAll(game);
        Math.round(9000/timerDelay) * timerDelay;
        game.scoreMultiplier = 1.5;
        console.log("LEVEL 2");
    }
    else if (timeNearlyEqual(currentTime,updateAt[1])) {
        enemySpeed *= 1.05;
        yVelocityAsteroid *= 1.1;
        yVelocityStar *= 1.1;
        numberOfEnemies = 2;
        updateYVelocitiesAll(game);
        Math.round(8000/timerDelay) * timerDelay;
        game.scoreMultiplier = 3;
        console.log("LEVEL 3");
    }
    else if (timeNearlyEqual(currentTime,updateAt[2])) {
        yVelocityAsteroid *= 1.1;
        yVelocityStar *= 1.1;
        enemySpeed *= 1.05;
        numberOfEnemies = 3;
        updateYVelocitiesAll(game);
        Math.round(7000/timerDelay) * timerDelay;
        game.scoreMultiplier = 5;
        console.log("LEVEL 4");
    }
}

function redrawAllGame(game) {
    // erase everything -- not efficient, but simple!
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // ctx.fillStyle = "grey";
    // for (var i = 0; i < game.starMap.length; i++)
    //     ctx.fillRect(game.starMap[i][0], game.starMap[i][1],
    //                     game.starMap[i][2], game.starMap[i][2]);
    drawAllStars(game.starArray);
    drawAllAsteroids(game.asteroidArray);
    drawAllEnemies(game.enemyArray);
    drawShip(game.ship);
    drawAllPowerups(game.powerupArray);
    drawPowerupLevel(game.ship);
    drawDeathRings(game.deathRingArray);
    drawUI(game.ship);
}


function onTimerGame(game) {
    gameTimeElapsed += timerDelay; // game timer

    modVelocity(game.ship);
    move(game.ship);

    modEnemyVelocity(game.enemyArray, game.ship);
    moveEnemies(game.enemyArray);

    generateAsteroids(game.asteroidArray);
    moveAsteroids(game.asteroidArray);
    generatePowerups(game.powerupArray);
    movePowerups(game.powerupArray);
    generateStars(game.starArray);
    moveStars(game.starArray);

    checkPowerupCollisions(game.ship, game.powerupArray);
    if (game.ship.phaseOn === false) {
        checkCollisions(game.ship, game.asteroidArray, game.deathRingArray);
        checkCollisions(game.ship, game.enemyArray, game.deathRingArray);
    }
    if (game.ship.laserOn === true) {
        checkLaserCollisions(game.ship,game.enemyArray,game.deathRingArray);
        checkLaserCollisions(game.ship,game.asteroidArray,game.deathRingArray);
    }

    // Stops powerups when time is up.
    powerupTimer(game.ship);

    checkEnemyAsteroidCollisions(game.enemyArray, game.asteroidArray,
                                 game.deathRingArray);

    removeDeadAsteroids(game);
    removeDeadStars(game);

    handleFriction(game.ship);
    checkDeath(game);

    redrawAllGame(game);
    removeDeadEnemies(game.enemyArray);

    regenEnemies(game, numberOfEnemies);
    updateScoreWithTime(gameTimeElapsed);

    // increase difficulty as time passes.
    updateDifficulty(game);
}


function onKeyDownGame(event, game) {

    if (event.keyCode === qCode) {
        clearInterval(intervalId);
        canvasStart.focus();
        ctx = ctxStart;
        canvasEnd.removeEventListener('keydown',
                                    function(event){onKeyDownGame(event,game)},
                                    false);
        canvasGame.addEventListener('keydown',
                                    function(event){
                                        onKeyDownStart(event,game)
                                    },
                                    false);
        intervalId = setInterval(function(){onTimerStart(game)}, timerDelay);
    }

    // Sets the ships acceleration directions if arrow keys are pressed.
    if (event.keyCode === leftCode) {
        game.ship.acceleratingLeft = true;
    }
    if (event.keyCode === rightCode) {
        game.ship.acceleratingRight = true;
    }
    if (event.keyCode === downCode) {
        game.ship.acceleratingDown = true;
    }
    if (event.keyCode === upCode) {
        game.ship.acceleratingUp = true;
    }
}


function onKeyUpGame(event, game) {

    // Stops acceleration of ship when arrow keys are released.
    if (event.keyCode === leftCode) {
        game.ship.acceleratingLeft = false;
    }
    if (event.keyCode === rightCode) {
        game.ship.acceleratingRight = false;
    }
    if (event.keyCode === downCode) {
        game.ship.acceleratingDown = false;
    }
    if (event.keyCode === upCode) {
        game.ship.acceleratingUp = false;
    }
}

// ############################################################################
// ################################--START--###################################
// ############################################################################


function drawStartScreen() {
    ctx.font="bold 70px Georgia";
    ctx.textBaseline = "middle";

    var grd = ctx.createLinearGradient(0, canvasHeight / 2 - 40, 0, canvasHeight / 2 + 10);
    grd.addColorStop(0, "#919191");
    grd.addColorStop(1, "#000000");
    ctx.fillStyle = grd;

    var txt="12 PARSECS";
    ctx.fillText(txt , (canvasWidth - ctx.measureText(txt).width) / 2,
                     canvasHeight / 2 - 20);

    ctx.fillStyle = "red";
    ctx.font="30px Georgia";
    ctx.textBaseline = "middle";
    var txt="chinyano     \u2022     rlai     \u2022     idl";
    ctx.fillText(txt , (canvasWidth - ctx.measureText(txt).width) / 2,
                     canvasHeight /2 + 40);

    ctx.fillStyle = "white";
    ctx.font="22px Georgia";
    var txt="Press ENTER to begin game";
    ctx.fillText(txt , (canvasWidth - ctx.measureText(txt).width) / 2,
                     canvasHeight /2 + 190);
}

function redrawAllStart(game) {
    // erase everything -- not efficient, but simple!
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawStartScreen();
}

function onTimerStart(game) {
    redrawAllStart(game);
}

function onKeyDownStart(event, game) {
    var enterCode = 13;
    if (event.keyCode === enterCode) {
        clearInterval(intervalId);
        canvasGame.focus();
        ctx = ctxGame;
        initGame(game);
        canvasStart.removeEventListener('keydown',
                                    function(event){
                                        onKeyDownStart(event,game)
                                    },
                                    false);
        canvasGame.addEventListener('keydown',
                                    function(event){onKeyDownGame(event,game)},
                                    false);
        canvasGame.addEventListener('keyup',
                                    function(event){onKeyUpGame(event,game)},
                                    false);
        intervalId = setInterval(function(){onTimerGame(game)}, timerDelay);
    }
}


// ############################################################################
// #################################--END--####################################
// ############################################################################


// ###########################--DEATH ANIMATION--##############################


function drawRingOfCircles(obj, center, colorIndex) {
    var deathRingRadius = obj.deathRingRadius;
    var color;
    if (colorIndex === 3) {
        color = "red";
    }
    else if (colorIndex === 2) {
        color = "#8A3324";
    }
    else if (colorIndex === 1) {
        color = "#008CFF";
    }
    // Draw the circles
    for (var i = 0; i < numOfDeathRingCircles; i++) {
        ctx.beginPath();
        var angle = getAngleForSlice(i, numOfDeathRingCircles);
        var circumferencePoint = getPointOnCircumference(center,
                                                        deathRingRadius,
                                                        angle);
        circle(circumferencePoint.x, circumferencePoint.y,
               deathRingCircleRadius);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }
    if (game.ship.collided === false) {
        if (colorIndex === 3) {
            ctx.fillStyle = "white";
            ctx.font="bold 50px Georgia";
            ctx.textBaseline = "middle";
            var txt="+" + (500*game.scoreMultiplier) + "!";
            ctx.fillText(txt , center.x, center.y);
        }
    }
}

function circle(cx, cy, radius) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2*Math.PI, true);
    ctx.closePath();
}

function drawEndScreen() {

    ctx.fillStyle = "white";
    ctx.font="bold 50px Georgia";
    ctx.textBaseline = "middle";
    var txt="GAME OVER";
    ctx.fillText(txt , (canvasWidth - ctx.measureText(txt).width) / 2,
                     canvasHeight / 2 - 20);

    ctx.fillStyle = "red";
    ctx.font="35px Georgia";
    txt="Your score is: " + game.score.finalScore;
    ctx.fillText(txt , (canvasWidth - ctx.measureText(txt).width) / 2,
                     canvasHeight /2 + 30);

    var enemiesKilled = calcEnemiesKilled();

    ctx.fillStyle = "gray";
    ctx.font="22px Georgia";
    txt="You killed: " + enemiesKilled + (enemiesKilled === 1 ? " enemy" : " enemies");
    ctx.fillText(txt , (canvasWidth - ctx.measureText(txt).width) / 2,
                     canvasHeight /2 + 60);

    ctx.fillStyle = "white";
    ctx.font="22px Georgia";
    txt="Press ENTER to try again";
    ctx.fillText(txt , (canvasWidth - ctx.measureText(txt).width) / 2,
                     canvasHeight / 2 + 170);
}

function redrawAllEnd(game) {
    // erase everything -- not efficient, but simple!
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawAllStars(game.starArray);
    drawAllAsteroids(game.asteroidArray);
    drawAllEnemies(game.enemyArray);
    drawAllPowerups(game.powerupArray);
    drawDeathRings(game.deathRingArray);
    drawUI(game.ship);

    if (game.score.finalScore === 0)
        game.score.finalScore = game.score.currentScore;

    // Draw death ring.
    // Don't draw if ring has expanded beyond boundaries of canvas.
    if (game.ship.deathAnimationEnd === false) {
        if (game.ship.deathRingRadius < deathRingMaxRadius) {
            game.ship.deathRingRadius += ringAnimationDistance;
            drawRingOfCircles(game.ship, game.ship.deathPt, 1);
        }
        else {
            game.ship.deathAnimationEnd = true;
        }
    }
    else {
        drawEndScreen();
    }

}


function onTimerEnd(game) {
    gameTimeElapsed += timerDelay; // game timer

    generateAsteroids(game.asteroidArray);
    moveAsteroids(game.asteroidArray);

    generateStars(game.starArray);
    moveStars(game.starArray);

    redrawAllEnd(game);
}


function onKeyDownEnd(event, game) {
    var enterCode = 13;
    if (event.keyCode === enterCode) {
        clearInterval(intervalId);
        canvasStart.focus();
        ctx = ctxStart;
        canvasGame.removeEventListener('keydown',
                                    function(event){onKeyDownEnd(event,game)},
                                    false);
        canvasGame.addEventListener('keydown',
                                    function(event){
                                        onKeyDownGame(event,game)
                                    },
                                    false);
        intervalId = setInterval(function(){onTimerGame(game)}, timerDelay);
    }
}


// ############################################################################
// ############################################################################
// ############################################################################

// function generateStars() {
//     var starMap = [];
//     for (var i = 0; i < numberOfStars; i++) {
//         var xCoord = Math.floor(Math.random() * canvasWidth);
//         var yCoord = Math.floor(Math.random() * canvasHeight);
//         var starSize = Math.floor(Math.random() * 7)
//         starMap[i] = [xCoord, yCoord, starSize];
//     }
//     return starMap;
// }

function run() {
    // make canvases focusable, then give it focus!
    canvasGame.setAttribute('tabindex','0');
    canvasStart.setAttribute('tabindex','0');
    canvasEnd.setAttribute('tabindex','0');

    // Comment out if starting with start screen
    /*canvasGame.focus();
    canvasGame.addEventListener('keydown',
                                function(event){onKeyDownGame(event, game)},
                                false);
    canvasGame.addEventListener('keyup',
                                function(event){onKeyUpGame(event, game)},
                                false);
    canvasStart.addEventListener('keydown',
                                 function(event){onKeyDownStart(event, game)},
                                 false);
    intervalId = setInterval(function(){onTimerGame(game)},timerDelay);*/

    // Comment out if starting with game screen
    canvasStart.focus();
    canvasEnd.removeEventListener('keydown',
                                function(event){onKeyDownGame(event,game)},
                                false);
    canvasGame.addEventListener('keydown',
                                function(event){
                                    onKeyDownStart(event,game)
                                },
                                false);
    intervalId = setInterval(function(){onTimerStart(game)},timerDelay);

    // Generate game objects.
    gameTimeElapsed = 0;
    game = new Game();
    game.ship = new Ship();
}

run();
