/* By: Isaac Lim (idl) */

//==============================================
// UI
//==============================================

var puzzle;

function startNewGame() {
    var level = parseInt($("#levelsel").val());
    var params = getGameParamsFromLevel(level);
    puzzle = new Puzzle(params.width, params.diff);

    initGame();

    drawBoard();
}

function drawBoard() {
    var box = $("#box");
    box.empty();

    var block = $("<div>");

    if (puzzle.width === 3)
        block.attr("class", "ui-grid-b");
    else if (puzzle.width === 4)
        block.attr("class", "ui-grid-c");
    else if (puzzle.width === 5)
        block.attr("class", "ui-grid-d");

    for (var i = 0; i < puzzle.width; i++) {
        block.append(createBlock(i, 0));
        block.append(createBlock(i, 1));
        block.append(createBlock(i, 2));

        if (puzzle.width >= 4)
            block.append(createBlock(i, 3));

        if (puzzle.width >= 5)
            block.append(createBlock(i, 4));
    }

    var box = $("#box");
    box.append(block);
}

function createBlock(i, idx) {
    var letter;
    if (idx === 0) letter = "a";
    if (idx === 1) letter = "b";
    if (idx === 2) letter = "c";
    if (idx === 3) letter = "d";
    if (idx === 4) letter = "e";

    var block = $("<div>").attr("class", "ui-block-" + letter);
    var themedBox = $("<div>").attr("class", "ui-bar ui-bar-c");
    themedBox.css("height", "50px");

    var digit = puzzle.board[i][idx];

    if (digit === 0) {
        themedBox.css("opacity", "0");
    }

    var h1 = $("<h1>").text(digit).css("font-size", 25);
    themedBox.append(h1);
    block.append(themedBox);
    block.attr("id", JSON.stringify([i, idx, digit]));
    if (window.util.isEventSupported("touchend"))
        block.attr("onTouchEnd", "cellClicked(this);");
    else
        block.attr("onClick", "cellClicked(this);");

    return block;
}

function cellClicked(cell) {
    var posArr = JSON.parse($(cell).attr("id"));

    // x,y,d encapsulated in a stringified array
    var chosenCell = new Cell(posArr[1], posArr[0], posArr[2]);

    // Increment the number of moves
    if (isAdjacent(chosenCell)) {
        puzzle.numMoves++;
        $("#score").text("Moves: " + (puzzle.numMoves));
    }

    
    moveCell(chosenCell);



    // Finally, check if current board is a solution!
    if (isSolved()) {
        var dialog = $("<div>").attr("data-role", "dialog");
        var hdr = $("<div>").attr("data-role", "header");
        hdr.append($("<h3>").text("You win!"));
        var cont = $("<div>").attr("data-role", "content");
        cont.append($("<h3>").text("Congratulations! You mastered Numbergrid in just " + puzzle.numMoves + " moves!"));
        dialog.append(hdr);
        dialog.append(cont);
        $("body").append(dialog);

        $.mobile.changePage(dialog);
    }
}

//==============================================
// SETUP PUZZLE
//==============================================

function Puzzle(width, level) {
    this.width = width;
    this.board = (function(a){ while(a.push([]) < width); return a})([]);
    this.level = level;
    this.numMoves = 0;

    // Represent an empty cell with a 0
    this.emptyCell = new Cell(width-1, width-1, 0);

    return this;
}

function initGame() {
    initSolvedBoard();

    puzzle.numMoves = 0;
    $("#score").text("Moves: " + (puzzle.numMoves));

    var numShuffles = puzzle.level * 20;    // Arbitrary multiple of difficulty
    for (var i = 0; i < numShuffles; i++) {
        shuffle();
    }
}

function initSolvedBoard() {
    var digit = 1;

    for (var i = 0; i < puzzle.width; i++) {
        for (var j = 0; j < puzzle.width; j++) {
            puzzle.board[i][j] = digit++;
        }
    }

    puzzle.board[puzzle.width-1][puzzle.width-1] = 0;
}

//==============================================
// MOVING CELLS (EVERYDAY I'M SHUFFLIN')
//==============================================

/* Shuffles the board in place */
function shuffle() {
    // Generate randNum
    var randNum = randPosition();

    // Assign chosenCell from randNum
    var chosenCell = convertToCell(randNum);

    // Make sure randNum is a valid index
    while (!isValidCell(chosenCell)) {
        randNum = randPosition();
        chosenCell = convertToCell(randNum);
    }

    // Fill the digit field
    chosenCell.digit = getDigitAtPos(chosenCell.x, chosenCell.y);

    // Once a valid cell, move it!
    moveCell(chosenCell);
}

function moveCell(chosenCell) {
    if (isAdjacent(chosenCell)) {
        swap(chosenCell);
        drawBoard();
    }
}

function swap(cell) {
    puzzle.board[puzzle.emptyCell.y][puzzle.emptyCell.x] = cell.digit;
    puzzle.board[cell.y][cell.x] = 0;
    puzzle.emptyCell.x = cell.x;
    puzzle.emptyCell.y = cell.y;
}

//==============================================
// HELPER FUNCTIONS
//==============================================

function Cell(x, y, d) {
    this.x = x;
    this.y = y;
    this.digit = d;
}

function randPosition() {
    // [0:top, 1:right, 2:bottom, 3:left]
    return Math.floor(Math.random() * 4
        );
}

function convertToCell(n) {
    var cell = new Cell();

    switch (n) {
        case 0:
            cell.x = puzzle.emptyCell.x;
            cell.y = puzzle.emptyCell.y - 1;
            break;
        case 1:
            cell.x = puzzle.emptyCell.x + 1;
            cell.y = puzzle.emptyCell.y;
            break;
        case 2:
            cell.x = puzzle.emptyCell.x;
            cell.y = puzzle.emptyCell.y + 1;
            break;
        case 3:
            cell.x = puzzle.emptyCell.x - 1;
            cell.y = puzzle.emptyCell.y;
            break;
        default:
            break;
    }

    return cell;
}

function getDigitAtPos(x, y) {
    return puzzle.board[y][x];
}

function isValidCell(cell) {
    if (cell.x < 0) return false;
    if (cell.x >= puzzle.width) return false;
    if (cell.y < 0) return false;
    if (cell.y >= puzzle.width) return false;

    return true;
}

function isAdjacent(cell) {
    var diffX = Math.abs(puzzle.emptyCell.x - cell.x);
    var diffY = Math.abs(puzzle.emptyCell.y - cell.y);

    /* Must be exactly one of the adjacent cells to the current
     * emptyCell to return true
     */
    if (diffX + diffY === 1)
        return true;
    else
        return false;
}

function getGameParamsFromLevel(level) {
    var width = 4;
    var diff = 1;

    switch (level) {
        case 1: { width = 3; diff = 1; break; }
        case 2: { width = 3; diff = 3; break; }
        case 3: { width = 3; diff = 5; break; }
        case 4: { width = 4; diff = 1; break; }
        case 5: { width = 4; diff = 3; break; }
        case 6: { width = 4; diff = 5; break; }
        case 7: { width = 5; diff = 1; break; }
        case 8: { width = 5; diff = 3; break; }
        case 9: { width = 5; diff = 5; break; }
        default: break;
    }
    
    return { "width" : width, "diff" : diff };
}

function printBoard() {
    var str = puzzle.board[0][0];

    for (var i = 0; i < puzzle.width; i++) {
        for (var j = 0; j < puzzle.width; j++) {
            if (i === 0 && j === 0)
                continue;
            if (j > 0)
                str += "\t";
            
            str += puzzle.board[i][j];
        }
        str += "\n";
    }

    console.log(str);
}

//==============================================
// CHECKING FOR SOLUTION
//==============================================

function isSolved() {
    for (var i = 0; i < puzzle.width; i++) {
        for (var j = 0; j < puzzle.width; j++) {
            // Stop checking once reached the last cell!
            if (i === puzzle.width-1 && j === puzzle.width-2) {
                if (puzzle.board[puzzle.width-1][puzzle.width-1] === 0)
                    return true;
                else
                    return false;
            }

            var i1 = i;
            var j1 = j;
            var i2 = i;
            var j2 = j+1;

            if (j === puzzle.width - 1) {
                i2 = i+1;
                j2 = 0;
            }

            if (puzzle.board[i1][j1] > puzzle.board[i2][j2]) {
                return false;
            }
        }
    }

    return true;
}

//==============================================
// UTIL
//==============================================

window.util = function(){ }

window.util.patchFnBind = function(){
    if (Function.prototype.bind === undefined){
       Function.prototype.bind = function (bind) {
            var self = this;
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return self.apply(bind || null, args);
            };
        };
    }
}

window.util.isEventSupported = (function(){
    var TAGNAMES = {
      'select':'input','change':'input',
      'submit':'form','reset':'form',
      'error':'img','load':'img','abort':'img'
    }
    function isEventSupported(eventName) {
      var el = document.createElement(TAGNAMES[eventName] || 'div');
      eventName = 'on' + eventName;
      var isSupported = (eventName in el);
      if (!isSupported) {
        el.setAttribute(eventName, 'return;');
        isSupported = typeof el[eventName] == 'function';
      }
      el = null;
      return isSupported;
    }
    return isEventSupported;
})();