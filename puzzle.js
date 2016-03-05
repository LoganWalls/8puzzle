"use strict";
//Creates controls and initializes the puzzle.
window.onload = function(){
  window.subjectInfo = new Object();
  window.moveRecord = new Array();
  window.puzzle = new Puzzle(3);
  window.puzzle.shuffle();
  window.initialGrid = copyGrid(puzzle.grid);
  window.vanilla = new Agent("dfs", true, true);
  window.rowsFirst = new Agent("dfs", false, true);
  window.colsFirst = new Agent("dfs", true, false);
  window.rowOrder = new Agent("dfs", true, true, "row");
  window.tileOrder = new Agent("dfs", true, true, "tile");
  window.optimal = new Agent("bfs", true, true);
  // window.optimal.solution = window.optimal.solve(initialGrid);
  // document.getElementById("stepbutton").onclick = window.optimal.step.bind(optimal);
  document.getElementById("continuebutton").onclick = submitForm;
  document.getElementById("readybutton").onclick = function(){
    window.initTime = Date.now();
    window.lastMoveTime = Date.now();
    document.getElementById("instructions").style.display = "none";
  };
};

function getMoves (grid, emptyRow, emptyCol){
    var moveables = new Array();
    var nonmoveables = new Array();
    for (var row = 0; row < grid.length; row++){
        for (var col = 0; col < grid[row].length; col++){
            var tile = grid[row][col];
            if(tile){
                if(row == emptyRow){
                    if (Math.abs(col - emptyCol) == 1){
                        moveables.push([[tile.row, tile.col], [emptyRow, emptyCol]]);
                    }else{
                        nonmoveables.push([[tile.row, tile.col]]);
                    }

                }else if(col == emptyCol){
                    if (Math.abs(row - emptyRow) == 1){
                        moveables.push([[tile.row, tile.col], [emptyRow, emptyCol]]);
                    }else{
                        nonmoveables.push([[tile.row, tile.col]]);
                    }
                }else{
                    nonmoveables.push([[tile.row, tile.col]]);
                }
            }
        }
    }
    return [moveables, nonmoveables];
};

//Sets a tile to be moveable.
function setMoveable(tile, emptyRow, emptyCol){
    tile.disp.classList.add("moveable");
    tile.disp.onclick = function(){makeMove(tile, emptyRow, emptyCol, true);};
}

//Sets a tile to be not moveable.
function unsetMoveable(tile){
    tile.disp.classList.remove("moveable");
    tile.disp.onclick = null;
}

//Moves 'tile' on both the board and the screen.
function makeMove(tile, dstRow, dstCol, record){
    var now = Date.now();
    var timeDiff = now - window.lastMoveTime;
    window.lastMoveTime = now;
    var dstX = dstCol * window.TILE_DIMENSION;
    var dstY = dstRow * window.TILE_DIMENSION;
    var oldRow = tile.row;
    var oldCol = tile.col;
    //Update the board position
    moveTile(puzzle.grid, tile.row, tile.col, dstRow, dstCol);
    if (record){
      window.moveRecord.push([[[oldRow, oldCol],[dstRow, dstCol]], stringifyGrid(window.puzzle.grid), timeDiff]);
    }
    //Move the tile.
    tile.disp.style.left = dstX+"px";
    tile.disp.style.top = dstY+"px";
    //Update which tiles are moveable.
    window.puzzle.updateMovable(oldRow, oldCol);
    if (record && distance(puzzle.grid) == 0){
      taskComplete();
    }
}

function Puzzle(dimension){
  //Updates which tiles can be moved and which can't
  //(applies styles accordingly).
  //Takes the x and y coordinates of the empty square in pixels.
  this.updateMovable = function (emptyRow, emptyCol){
        var moves = getMoves(this.grid, emptyRow, emptyCol);
        moves[0].forEach(function(x){setMoveable(this.grid[x[0][0]][x[0][1]], emptyRow, emptyCol);}.bind(this));
        moves[1].forEach(function(x){unsetMoveable(this.grid[x[0][0]][x[0][1]]);}.bind(this));
  };

  //Shuffles the tiles 1000 times.
  this.shuffle = function(){
    //Makes 1000 random moves.
    for(var i = 0; i < 1000; i++){
      //Get all of the movable tiles, and select one at random.
      var empty = findEmpty(this.grid);
      var movables = getMoves(this.grid, empty[0], empty[1])[0];
      var index = Math.round(Math.random()*(movables.length - 1));
      var selected = movables[index];
      //Move the randomly selected tile as if it were clicked.
      makeMove(this.grid[selected[0][0]][selected[0][1]], selected[1][0], selected[1][1], false);
    }
  }

  // The array which keeps track of the tiles.
  this.grid = new Array();
  window.GRID_DIMENSION = dimension;
  window.TILE_DIMENSION = Math.round(400/window.GRID_DIMENSION);
  var borderDimension = Math.round((window.TILE_DIMENSION*0.1)/2);
  var puzzlearea = document.getElementById("puzzlearea");
  puzzlearea.innerHTML = '';

  var tileNum = 1;
    for (var row = 0; row < window.GRID_DIMENSION; row++){
        var cur_row = new Array();
        for (var col = 0; col < window.GRID_DIMENSION; col++){
            //Creates empty square last.
            if (tileNum != Math.pow(window.GRID_DIMENSION, 2)){
                var currentTile = document.createElement("DIV");
                var xPos = (col * window.TILE_DIMENSION);
                var yPos = (row * window.TILE_DIMENSION);

                //Setup tile and background.
                currentTile.style.height = (window.TILE_DIMENSION-(2*borderDimension))+"px";
                currentTile.style.width = (window.TILE_DIMENSION-(2*borderDimension))+"px";
                currentTile.style.left = xPos+"px";
                currentTile.style.top = yPos+"px";
                currentTile.style.borderWidth = borderDimension+"px";
                currentTile.style.backgroundPosition = (-xPos)+"px "+(-yPos)+"px";
                //Setup tile text.
                currentTile.style.fontSize = (window.TILE_DIMENSION*0.4)+"pt";
                currentTile.innerHTML = tileNum;
                puzzlearea.appendChild(currentTile);
                cur_row.push(new Tile(row, col, row, col, tileNum, currentTile));
                tileNum++;
            }else{
                cur_row.push(null);
            }
        }
        this.grid.push(cur_row);
    }
    this.updateMovable(dimension - 1, dimension - 1);
}

function makeGrid(dimension, str){
  var grid = new Array();
  for (var row = 0; row < dimension; row ++){
    grid.push(new Array());
    for (var col = 0; col < dimension; col++){
      if (str){
        var num = str[row * dimension + col];
        if (num == "X"){
          num = null;
        }else{
          num = Number(num);
        }
      }else if ((row + 1) * (col + 1) < dimension * dimension){
        var num = row * dimension + col + 1;
      }else{
        var num = null;
      }
      var goalRow = Math.floor((num - 1) / dimension);
      var goalCol = (num - 1) % dimension;
      if (num){
        grid[row].push(new Tile(row, col, goalRow, goalCol, num, null));
      }else{
        grid[row].push(null);
      }
    }
  }
  return grid;
}


function Tile(row, col, goalRow, goalCol, num, disp){
  this.row = row;
  this.col = col;
  this.goalRow = goalRow;
  this.goalCol = goalCol;
  this.num = num;
  this.disp = disp;
}

function logGrid(grid){
    var result = "-------------\n";
    grid.forEach(function(x){
        result += "|";
        x.forEach(function(y){
            if (y){
                result += " " + y.num;
            }else{
                result += "  ";
            }
            result += " |";}
        );
        result += "\n-------------\n";
    });
    console.log(result);
}

function stringifyGrid(grid){
    var nums = grid.map(function(x){
      return x.map(function(y){
        if(y){
          return y.num;
        }else{
          return "X"
        }
      });
    });
    return nums.map(function(x){return x.join("");}).join("");
}

function moveTile(grid, srcRow, srcCol, destRow, destCol){
        var tile = grid[srcRow][srcCol];
        grid[srcRow][srcCol] = null;
        grid[destRow][destCol] = tile;
        tile.row = destRow;
        tile.col = destCol;
}

function findEmpty(grid){
    var empty = null;
    for (var row = 0; row < grid.length; row++){
        var emptyInd = grid[row].indexOf(null);
        if (emptyInd != -1){
            empty = [row, emptyInd];
        }
    }
    return empty;
}

function compareGrids(g1, g2){
    return JSON.stringify(g1) === JSON.stringify(g2);
}

function save(data, fname){
  var output = JSON.stringify(data);
  var a = document.createElement('a');
  var b = new Blob([output], {type: 'text/json'});
  a.href = URL.createObjectURL(b);
  a.download = fname;
  a.click();
}

function taskComplete(){
  window.subjectInfo.totalTime = Date.now() - window.initTime;
  alert("Congratulations!\n\n\nYou have solved the puzzle.\nPlease give the computer back the the experimentor.");
  window.vanilla.solution = window.vanilla.solve(initialGrid);
  window.rowsFirst.solution = window.rowsFirst.solve(initialGrid);
  window.colsFirst.solution = window.colsFirst.solve(initialGrid);
  window.rowOrder.solution = window.rowOrder.solve(initialGrid);
  window.tileOrder.solution = window.tileOrder.solve(initialGrid);
  window.optimal.solution = window.optimal.solve(initialGrid);
  exportResults();
}

function exportResults(){
  var fname = new Date().toString().slice(0,24).replace(new RegExp(' ', 'g'),'_') +'.json';
  var data = {
    "subjectInfo": window.subjectInfo,
    "initialGrid": window.initialGrid,
    "initialStr": stringifyGrid(window.initialGrid),
    "subjectMoves": window.moveRecord,
    "vanilla": window.vanilla.solution,
    "rowsFirst": window.rowsFirst.solution,
    "colsFirst": window.rowsFirst.solution,
    "rowOrder": window.rowsFirst.solution,
    "tileOrder": window.tileOrder.solution,
    "optimal": window.optimal.solution
  };
  save(data, "experiment_results/"+ fname);
}

function submitForm(){
  window.subjectInfo.gender = function(){
    var radios = document.getElementsByName('gender');
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked){
            return radios[i].value;
        }
    }
  }();
  window.subjectInfo.age = document.getElementById("age").value;
  window.subjectInfo.major = document.getElementById("major").value;
  var tasktext = document.getElementById("tasktext");
  var emph = document.createElement('span');
  emph.className += "emphasis";
  if (Math.random() >= 0.5){
    emph.innerHTML = " in as few moves as possible.";
    window.subjectInfo.condition = "accuracy";
  }else{
    emph.innerHTML = " as quickly as possible.";
    window.subjectInfo.condition = "speed";
  }
  tasktext.appendChild(emph);
  document.getElementById("instructions").style.display = "block";
  document.getElementById("welcome").style.display = "none";
}