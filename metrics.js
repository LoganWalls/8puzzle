"use strict";
// Returns the manhattan distance between one tile's position and its goal position.
function manhattan(tile){
    if (tile){
      return Math.abs(tile.row - tile.goalRow) + Math.abs(tile.col - tile.goalCol);
    }else{
      return 0;
    }
}

// axisName is the axis to compare along:
// if passing in rows, axisName should be "Col". (must be capitalized)
function line_conflicts(line, axisName){
    var counted = new Array();
    var total = 0;
    for (var i = 0; i < line.length; i++){
      var tile = line[i];
      if (tile){
        var goal = tile["goal"+axisName];
        // console.log(goal);
        if (goal < i){
          for (var j = i - 1; j >= goal; j--){
            // console.log("left");
            var token = String(Math.min(i, j)) + String(Math.max(i, j));
            if (counted.indexOf(token) == -1 && line[j]){
              total += 2;
              counted.push(token);
            }
          }
        }else if (goal > i){
          for (var j = i + 1; j <= goal; j++){
            // console.log("right");
            var token = String(Math.min(i, j)) + String(Math.max(i, j));
            if (counted.indexOf(token) == -1 && line[j]){
              total += 2;
              counted.push(token);
            }
          }
        }
      }
  }
  return total;
}

// Rotates a grid so that its array structure is column-wise rather than
// row-wise.
function rowsToCols(rows){
  var cols = new Array();
  for (var col = 0; col < rows[0].length; col++){
    cols.push(new Array());
    for (var row = 0; row < rows.length; row++){
      cols[col].push(rows[row][col]);
    }
  }
  return cols;
}

function distance(grid, horizontalConflicts, verticalConflicts, priority){
  // Calculte the manhattan distance.
  var total = grid.reduce(function(pvi, row) {
        return pvi + row.reduce(function(pvj, tile) {
          var d = manhattan(tile);
          if (tile && priority){
            if (priority == "row"){
              d *= grid.length - tile.goalRow;
            }else if (priority == "tile"){
              d *= Math.pow(grid.length, 2) - tile.num;
            }
          }
          return pvj + d;
        }, 0);
      }, 0);
  if (horizontalConflicts){
    var rows = grid;
    total += rows.reduce(function(pv, row) {return pv + line_conflicts(row, "Col")}, 0);
  }
  if (verticalConflicts){
    var cols = rowsToCols(grid);
    total += cols.reduce(function(pv, col) {return pv + line_conflicts(col, "Row")}, 0);
  }
  return total;
}