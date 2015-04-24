jQuery(document).ready(function(){
     
    var worldHeight = Math.floor($(window).width()/32),
        worldWidth = worldHeight,
        world = [[]],
        start,
        end,
        distance,
        currentPath = [];
 
    var createWorld = function(){
        // First truncate canvas content
        $('#canvas').html('<div id="character"></div>');
        // Reset start, and and path
        start = undefined;
        end = undefined;
        currentPath = [];
        // Loop through and create an empty world
        for(var i=0; i < worldWidth; i++){
            world[i] = [];
            for (var j=0; j < worldHeight; j++){
                world[i][j] = 0;
                $('#canvas').append('<div class="node" data-x="'+i+'" data-y="'+j+'"></div>');
            }
            $('#canvas').append('<div class="clear"></div>');
        }
        // Randomly place obstacles
        for(var i=0; i < worldWidth; i++){
            for(var j=0; j < worldHeight; j++){
                if(Math.random() > 0.75){
                    world[i][j] = Math.floor((Math.random()*4)+1);
                }
            }
        }
        // Now render everything on canvas
        redrawWorld();
    }
 
    var redrawWorld = function(){
        // Reset all nodes' images
        $('#canvas div.node').attr('class', 'node');
        // Loop through to find obstacles
        for (var i=0; i < worldWidth; i++){
            for (var j=0; j < worldHeight; j++){
                // If this is an obstacle, do
                if(world[i][j]!==0){
                    // Set obstacle as image of this node
                    $('#canvas div.node[data-x="'+i+'"][data-y="'+j+'"]').addClass('obstacle').addClass('bush'+(world[i][j]));
                }
            }
        }
        // Render the starting point if there is one
        if("undefined" != typeof start){
            $('#canvas div.node[data-x="'+start[0]+'"][data-y="'+start[1]+'"]').addClass('start');
        }
        if("undefined" != typeof end){
            $('#canvas div.node[data-x="'+end[0]+'"][data-y="'+end[1]+'"]').addClass('end');
        }
        // Draw path
        if(currentPath.length>0 && $('#canvas .node.path').length===0){
            for(var i=0;i<currentPath.length;i++){
                $('#canvas .node[data-x="'+currentPath[i][0]+'"][data-y="'+currentPath[i][1]+'"]')
                .addClass('path')
                .html('['+currentPath[i][0]+','+currentPath[i][1]+']');
            }
            // Move Character
            var movementIndex = 0;
            var movementInterval = setInterval(function(){
                if(movementIndex === currentPath.length){
                    clearInterval(movementInterval);
                    return;
                }
                $('#character').css({
                    top: currentPath[movementIndex][0]*32+'px',
                    left: currentPath[movementIndex][1]*32+'px'
                });
                movementIndex++;
            }, 250);
            // Apply Spritesheet
            var spriteIndex = 0;
            var iterationIndex = 0;
            var thisNode = [];
            var nextNode = [];
            var spritesheet = [
                ['0 0', '-32px 0', '-64px 0', '-192px 0', '-224px 0', '-256px 0'],
                ['0 -96px', '-32px -96px', '-64px -96px', '-192px -96px', '-224px -96px', '-256px -96px'],
                ['0 -32px', '-32px -32px', '-64px -32px', '-192px -32px', '-224px -32px', '-256px -32px'],
                ['0 -64px', '-32px -64px', '-64px -64px', '-192px -64px', '-224px -64px', '-256px -64px'],
                ['-96px 0', '-128px 0', '-160px 0', '-288px 0', '-320px 0', '-352px 0'],
                ['-96px -32px', '-128px -32px', '-160px -32px', '-288px -32px', '-320px -32px', '-352px -32px'],
                ['-96px -64px', '-128px -64px', '-160px -64px', '-288px -64px', '-320px -64px', '-352px -64px'],
                ['-96px -96px', '-128px -96px', '-160px -96px', '-288px -96px', '-320px -96px', '-352px -96px'],
                ['0 0', '0 0', '0 0', '0 0', '0 0', '0 0']
            ];
            var directionSprites = 0,
                spriteShiftIndex = 0,
                spriteShiftInterval = setInterval(function(){
                $('#character').css('background-position', spritesheet[directionSprites][spriteShiftIndex++]);
                if(spriteShiftIndex===6){spriteShiftIndex=0;}
            }, 150);
            var spriteInterval = setInterval(function(){
                thisNode = currentPath[iterationIndex];
                nextNode = currentPath[iterationIndex+1];
                if("undefined" === typeof nextNode){
                    clearInterval(spriteInterval);
                    $('#character').css('background-position', '0 0');
                    clearInterval(spriteShiftInterval);
                    return;
                }
                if(spriteIndex===6) spriteIndex=0;
                dirX = nextNode[0]-thisNode[0];
                dirY = nextNode[1]-thisNode[1];
                if(dirX==1&&dirY==0){ // s,
                    directionSprites = 0;
                } else if(dirX==-1&&dirY==-0){ // n,
                    directionSprites = 1;
                } else if(dirX==0&&dirY==-1){ // w,
                    directionSprites = 2;
                } else if(dirX==0&&dirY==1){ // e,
                    directionSprites = 3;
                } else if(dirX==1&&dirY==-1){ // sw,
                    directionSprites = 4;
                } else if(dirX==-1&&dirY==-1){ // nw,
                    directionSprites = 5;
                } else if(dirX==1&&dirY==1){ // se,
                    directionSprites = 6;
                } else if(dirX==-1&&dirY==1){ // ne,
                    directionSprites = 7;
                }
                iterationIndex++;
            }, 250);
        }
    }
 
    var cellLeftClick = function(x,y){
        if("undefined" === typeof start){
            start = [x,y];
            Log('Set start to ['+x+','+y+']');
            return;
        } else if("undefined" === typeof end && world[x][y]!=1 && start[0]!=x && start[1]!=y){
            end = [x,y];
            Log('Set end to ['+x+','+y+']');
            var startTime = new Date().getMilliseconds();
            currentPath = findPath(world, start, end, distance);
            var endTime = new Date().getMilliseconds();
            if(currentPath.length!=0){
                Log('Path found! Path length is '+currentPath.length+'. The search took '+(endTime-startTime)+' milliseconds.');
                pathString = '<ol>';
                for(var i=0;i<currentPath.length;i++){
                    pathString += '<li>['+currentPath[i][0]+', '+currentPath[i][1]+']</li>';
                }
                pathString += '</ol>';
                Log('Path: '+pathString);
            } else {
                Log('Path not found!');
            }
            redrawWorld();
            return;
        };
    }
 
    var Log = function(s){
        $('#log').append('<li>'+s+'</li>').scrollTop($('#log')[0].scrollHeight);
    }
 
    // Finally add event listeners
    $(window).load(createWorld);
    $('#createWorld').click(createWorld);
    $('#redrawWorld').click(redrawWorld);
    $('#canvas').on('click', '.node', function(e){
        Log('Registered left click at ['+$(this).data('x')+','+$(this).data('y')+']');
        if(!$(this).hasClass('.obstacle')){
            e.preventDefault();
            cellLeftClick($(this).data('x'),$(this).data('y'));
            redrawWorld();
        }
    });
    $('#distance').change(function(){
        distance = $(this).val();
    });
    $('#minimize').click(function(){
        if($('.controls').is('.minimized')){
            $('.controls').removeClass('minimized');
        } else {
            $('.controls').addClass('minimized');
        }
        $('#minimize').toggleClass('fa-minus-square-o fa-plus-square-o');
    });
    $('#toggleBorder').click(function(){
        $('#canvas').toggleClass('border');
    });
    $('#instructions').click(function(){
        $.get('instructions.html', function(html){
            $('.dialog').html(html).show();
        });
    });
    $('#aboutAuthor').click(function(){
        $.get('author.html', function(html){
            $('.dialog').html(html).show();
        });
    });
    $('#aboutCredits').click(function(){
        $.get('credits.html', function(html){
            $('.dialog').html(html).show();
        }); 
    });
    $('body').on('click', '#closeDialog', function(){
        $('.dialog').hide();
    });
 
    // this is the core function
    // world is a 2d array of integers (eg world[10][15] = 0)
    // pathStart and pathEnd are arrays like [5,10]
    var findPath = function(world, pathStart, pathEnd, distance){
        // shortcuts for speed
        var abs = Math.abs;
        var max = Math.max;
        var pow = Math.pow;
        var sqrt = Math.sqrt;
 
        // the world data are integers:
        // anything higher than this number is considered blocked
        var maxWalkableTileNum = 0;
 
        // keep track of the world dimensions
        // Note that this A-star implementation expects the world array to be square:
        var worldWidth = world[0].length;
        var worldHeight = world.length;
        var worldSize = worldWidth * worldHeight;
 
        var distanceFunction, findNeighbours;
        switch(distance){
            case 'euclidean':
            distanceFunction = EuclideanDistance;
            findNeighbours = DiagonalNeighbours;
            break;
            case 'euclidean-free':
            distanceFunction = EuclideanDistance;
            findNeighbours = DiagonalNeighboursFree;
            break;
            case 'chebyshev':
            distanceFunction = ChebyshevDistance;
            findNeighbours = DiagonalNeighbours;
            break;
            case 'chebyshev-free':
            distanceFunction = ChebyshevDistance;
            findNeighbours = DiagonalNeighboursFree;
            break;
            case 'manhattan':default:
            distanceFunction = ManhattanDistance;
            findNeighbours = function(){};
            break;
        }
 
        function ManhattanDistance(Point, Goal){
            return abs(Point.x - Goal.x) + abs(Point.y - Goal.y);
        }
 
        function ChebyshevDistance(Point, Goal){
            return max(abs(Point.x - Goal.x), abs(Point.y - Goal.y));
        }
 
        function EuclideanDistance(Point, Goal){
            return sqrt(pow(Point.x - Goal.x, 2) + pow(Point.y - Goal.y, 2));
        }
 
        // Neighbours functions, used by findNeighbours function
        // to locate adjacent available cells that aren't blocked
 
        // Returns every available North, South, East or West
        // cell that is empty. No diagonals,
        // unless distanceFunction function is not Manhattan
        function Neighbours(x, y)
        {
            var N = y - 1,
            S = y + 1,
            E = x + 1,
            W = x - 1,
            myN = N > -1 && canWalkHere(x, N),
            myS = S < worldHeight && canWalkHere(x, S),
            myE = E < worldWidth && canWalkHere(E, y),
            myW = W > -1 && canWalkHere(W, y),
            result = [];
            if(myN)
            result.push({x:x, y:N});
            if(myE)
            result.push({x:E, y:y});
            if(myS)
            result.push({x:x, y:S});
            if(myW)
            result.push({x:W, y:y});
            findNeighbours(myN, myS, myE, myW, N, S, E, W, result);
            return result;
        }
 
        // returns every available North East, South East,
        // South West or North West cell - no squeezing through
        // "cracks" between two diagonals
        function DiagonalNeighbours(myN, myS, myE, myW, N, S, E, W, result)
        {
            if(myN)
            {
                if(myE && canWalkHere(E, N))
                result.push({x:E, y:N});
                if(myW && canWalkHere(W, N))
                result.push({x:W, y:N});
            }
            if(myS)
            {
                if(myE && canWalkHere(E, S))
                result.push({x:E, y:S});
                if(myW && canWalkHere(W, S))
                result.push({x:W, y:S});
            }
        }
 
        // returns every available North East, South East,
        // South West or North West cell including the times that
        // you would be squeezing through a "crack"
        function DiagonalNeighboursFree(myN, myS, myE, myW, N, S, E, W, result)
        {
            myN = N > -1;
            myS = S < worldHeight;
            myE = E < worldWidth;
            myW = W > -1;
            if(myE)
            {
                if(myN && canWalkHere(E, N))
                result.push({x:E, y:N});
                if(myS && canWalkHere(E, S))
                result.push({x:E, y:S});
            }
            if(myW)
            {
                if(myN && canWalkHere(W, N))
                result.push({x:W, y:N});
                if(myS && canWalkHere(W, S))
                result.push({x:W, y:S});
            }
        }
 
        // returns boolean value (world cell is available and open)
        function canWalkHere(x, y)
        {
            return ((world[x] != null) &&
                (world[x][y] != null) &&
                (world[x][y] <= maxWalkableTileNum));
        };
 
        // Node function, returns a new object with Node properties
        // Used in the calculatePath function to store route costs, etc.
        function Node(Parent, Point)
        {
            var newNode = {
                // pointer to another Node object
                Parent:Parent,
                // array index of this Node in the world linear array
                value:Point.x + (Point.y * worldWidth),
                // the location coordinates of this Node
                x:Point.x,
                y:Point.y,
                // the heuristic estimated cost
                // of an entire path using this node
                f:0,
                // the distanceFunction cost to get
                // from the starting point to this node
                g:0
            };
 
            return newNode;
        }
 
        // Path function, executes AStar algorithm operations
        function calculatePath()
        {
            // create Nodes from the Start and End x,y coordinates
            var currentPathStart = Node(null, {x:pathStart[0], y:pathStart[1]});
            var currentPathEnd = Node(null, {x:pathEnd[0], y:pathEnd[1]});
            // create an array that will contain all world cells
            var AStar = new Array(worldSize);
            // list of currently open Nodes
            var Open = [currentPathStart];
            // list of closed Nodes
            var Closed = [];
            // list of the final output array
            var result = [];
            // reference to a Node (that is nearby)
            var adjacentNodes;
            // reference to a Node (that we are considering now)
            var currentNode;
            // reference to a Node (that starts a path in question)
            var currentPath;
            // temp integer variables used in the calculations
            var length, max, min, i, j;
            // iterate through the open list until none are left
            while(length = Open.length)
            {
                max = worldSize;
                min = -1;
                for(i = 0; i < length; i++)
                {
                    if(Open[i].f < max)
                    {
                        max = Open[i].f;
                        min = i;
                    }
                }
                // grab the next node and remove it from Open array
                currentNode = Open.splice(min, 1)[0];
                // is it the destination node?
                if(currentNode.value === currentPathEnd.value){
                    currentPath = Closed[Closed.push(currentNode) - 1];
                    do {
                        result.push([currentPath.x, currentPath.y]);
                    } while(currentPath = currentPath.Parent);
                    // clear the working arrays
                    AStar = Closed = Open = [];
                    // we want to return start to finish
                    result.reverse();
                }
                else // not the destination
                {
                    // find which nearby nodes are walkable
                    adjacentNodes = Neighbours(currentNode.x, currentNode.y);
                    // test each one that hasn't been tried already
                    for(i = 0, j = adjacentNodes.length; i < j; i++)
                    {
                        currentPath = Node(currentNode, adjacentNodes[i]);
                        if (!AStar[currentPath.value])
                        {
                            // estimated cost of this particular route so far
                            currentPath.g = currentNode.g + distanceFunction(adjacentNodes[i], currentNode);
                            // estimated cost of entire guessed route to the destination
                            currentPath.f = currentPath.g + distanceFunction(adjacentNodes[i], currentPathEnd);
                            // remember this new path for testing above
                            Open.push(currentPath);
                            // mark this node in the world graph as visited
                            AStar[currentPath.value] = true;
                        }
                    }
                    // remember this route as having no more untested options
                    Closed.push(currentNode);
                }
            } // keep iterating until the Open list is empty
            return result;
        }
 
        // Calculates the A* path. Returns an array of coordinates if a path exists, otherwise returns an empty array.
        return calculatePath();
 
    }; // end of findPath() function
 
});