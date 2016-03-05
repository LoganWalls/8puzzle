function Agent(strategy, horizontalConflicts, verticalConflicts, priority){
    this.distance = function(grid){return distance(grid, horizontalConflicts, verticalConflicts, priority)};
    this.counter = 0;
    this.solution = [];
    this.solve = function(grid){
        //var result = this.dfs(grid, new Set(), new Array());
        var result = this.strategy(grid, new Set(), new Array());
        result = result.map(function(x){
                return [x[0], stringifyGrid(x[1]), x[2]];
            });

        return result;
    };

    this.play = function(solution){
        for (var i = 0; i < solution.length; i++){
            var move = solution[i][0];
            makeMove(window.puzzle.grid[move[0][0]][move[0][1]], move[1][0], move[1][1]);
        }
    };

    this.dfs = function(g, stateHistory, moveHistory){
        var grid = copyGrid(g);
        stateHistory.add(stringifyGrid(grid));
        if (distance(grid) == 0){
            return moveHistory;
        }else{
            var moves = this.evaluateMoves(grid, stateHistory);
            for (var i = 0; i < moves.length; i++){
                var result = this.dfs(moves[i][1], stateHistory, moveHistory.concat([moves[i]]));
                if (result){
                    return result;
                }
            }
        }
    };

    this.bfs = function(g, stateHistory){
        var grid = copyGrid(g);
        stateHistory.add(stringifyGrid(grid));
        var q = new Queue();
        q.batchPush(this.evaluateMoves(grid, stateHistory, new Array()));
        while (q.length){
            var curMove = q.dequeue();
            var curGrid = curMove[1];
            var moveHistory = curMove[3].concat([curMove.slice(0,3)]);
            if (distance(curGrid) == 0){
                return moveHistory;
            }else if(!stateHistory.has(stringifyGrid(curGrid))){
                stateHistory.add(stringifyGrid(curGrid));
                q.batchPush(this.evaluateMoves(curGrid, stateHistory, moveHistory));
            }
        }
        return null;
    };

    this.strategy = this[strategy];

    this.step = function(){
        if (this.counter < this.solution.length){
            var move = this.solution[this.counter][0];
            console.log(this.solution[this.counter]);
            makeMove(window.puzzle.grid[move[0][0]][move[0][1]], move[1][0], move[1][1]);
            this.counter ++;
        }
    };

    this.moveValue = function(grid, srcRow, srcCol, dstRow, dstCol){
        var moveResult = simulateMove(grid, srcRow, srcCol, dstRow, dstCol);
        return this.distance(grid) - this.distance(moveResult);
    };

    this.evaluateMoves = function(grid, stateHistory, moveHistory){
        var empty = findEmpty(grid);
        var moves = getMoves(grid, empty[0], empty[1])[0];
        var result = new Array();
        for (var i = 0; i < moves.length; i++){
            var x = moves[i];
            var nextState = simulateMove(grid, x[0][0], x[0][1], x[1][0], x[1][1]);
            if (!stateHistory.has(stringifyGrid(nextState))){
                var item = [x, nextState, this.moveValue(grid, x[0][0], x[0][1], x[1][0], x[1][1])];
                if (moveHistory){
                    item.push(moveHistory);
                }
                result.push(item);
            }
        }
        return result.sort(compareValues).reverse();
    }
}

// Returns a deep copy of the given grid.
function copyGrid(grid){
  var copy = new Array();
  grid.forEach(function(x, i){
    copy.push(new Array());
    x.forEach(function(y){
        if(y){
            copy[i].push(new Tile(y.row, y.col, y.goalRow, y.goalCol, y.num, null));
        }else{
            copy[i].push(null);
        }});
  });
  return copy;
}

function simulateMove(grid, srcRow, srcCol, dstRow, dstCol){
    var result = copyGrid(grid);
    moveTile(result, srcRow, srcCol, dstRow, dstCol);
    return result;
}

function compareValues(a, b){
    if (a[2] > b[2]){
        return 1;
    }else if (a[2] < b[2]){
        return -1;
    }else{
        return [1, -1][Math.round(Math.random())];
    }
}

function Queue(){
    this.values = new Array(); 
    this.push = function(v){
        this.values = [v].concat(this.values);
    }
    this.dequeue = function(){
        return this.values.pop();
    };
    this.batchPush = function(arr){
        arr.forEach(function(x){this.push(x)}, this);
    };

    Object.defineProperty(this, "length", {
        get: function(){return this.values.length;}.bind(this)
    });
}