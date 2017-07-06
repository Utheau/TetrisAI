//define the playable board
const grid = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// shapes of the blocks
const shapes = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  J: [
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0]
  ],
  L: [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0]
  ],
  O: [
    [4, 4],
    [4, 4]
  ],
  S: [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0]
  ],
  T: [
    [0, 6, 0],
    [6, 6, 6],
    [0, 0, 0]
  ],
  Z: [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0]
  ]
}

// colors of the blocks
const colors = ["FF00FF", "00FF00", "FFA500", "FF0000", "FFFF00", "00FFFF", "FFA07A"];

// random method to choose the shapes of the blocks
const randomSeed = 1;

// SHAPES BLOCKS
// shapes and coordinates parameter of current block that we can update
let currentShape = {
  x: 0,
  y: 0,
  shape: undefined
};
// store upcoming shape
let upcomingShape;
// array to store shapes
let bag = [];
// index for the shapes in the bag
let bagIndex = 0;

// VALUES OF THE GAME
let score = 0;
let speed = 400;
let changeSpeed = false;
// storing the current state so that it can be loaded later
let saveState;
// store current game state
let roundState;
// list of speeds available for the game
let gameSpeeds = [600, 400, 200, 100, 50, 5, 1, 0];
let indexGameSpeed = 1;
// turn our AI on or off (so that a normal player could get in control and play)
let ai = true;
let draw = true;
let takenMoves = 0;
// max moves in a generation
let moveLimit = 500;
// 7 moves in the algorithm
let moveAlgorithm = {};
// push to the highest move selection
let inspectMoveSel = false;

// ALGORITHM VALUES
// stores the number of genomes
let populationSize = 60;
// current number of a generation
let generation = 0;
// stores for genomes
let genomes = [];
let currentGenome = -1;
// stores info of a generation
let archive = {
  populationSize: 0,
  currentGeneration: 0,
  genomes: [],
  elites: []
};

// indicators of a mutation speed
let mutationStep = 0.3;
let mutationRate = 0.5;

// calling the main function on load
function starter() {
  // setting up the starting population
  archive.populationSize = populationSize;
  nextShape();
  applyShape();
  saveState = getState();
  roundState = getState();
  createInitialPopulation();
  // inside the game loop 
  let loop = function () {
    if (changeSpeed) {
      clearInterval(interval);
      interval = setInterval(loop, speed);
      changeInterval = false;
    }
    // if there is no speed than do not draw
    if (speed = 0) {
      draw = false;
      // 3 updates for fitness, making a move and evaluate the next move
      update();
      update();
      update();
    } else {
      draw = true;
    }
    // update the status of the game
    update();
    if (speed === 0) {
      draw = true;
      updateScore();
    }
  }
  let interval = setInterval(loop, speed);
}
document.onload = starter();

// key listeners 
window.onkeydown = function (e) {
  let charPressed = String.fromCharCode(e.keyCode);
  if (e.keyCode == 38) {
    shapeRotation();
  } else if (e.keyCode == 40) {
    moveDown();
  } else if (e.keyCode == 39) {
    moveRight();
  } else if (e.keyCode == 37) {
    moveLeft();
  } else if (shapes[charPressed.toUpperCase()] !== undefined) {
    removeShape();
    currentShape.shape = shapes[charPressed.toUpperCase()];
    applyShape();
  } else if (charPressed.toUpperCase() == "A") {
    saveState = getState();
  } else if (charPressed.toUpperCase() == "Q") {
    loadState(saveState);
  } else if (charPressed.toUpperCase() == "D") {
    indexGameSpeed--;
    if (indexGameSpeed < 0) {
      indexGameSpeed = gameSpeeds.length - 1;
    }
    speed = gameSpeeds[indexGameSpeed];
    changeSpeed = true;
  } else if (charPressed.toUpperCase() == "I") {
    indexGameSpeed++;
    if (indexGameSpeed >= gameSpeeds.length) {
      indexGameSpeed = 0;
    }
    speed = gameSpeeds[indexGameSpeed];
    changeSpeed = true;
  } else if (charPressed.toUpperCase() == "X") {
    ai = !ai;
  } else if (charPressed.toUpperCase() == "V") {
    loadArchive(prompt("Please insert Archive:"));
  } else if (charPressed.toUpperCase() == "F") {
    if (localStorage.getItem("archive") == null) {
      alert("There are no saved Archives. Please check again when at least one generation has passed, since Archives are only saved when a generation has passed leaving the informations across sessions");
    } else {
      prompt("Archive from the last generation :", localStorage.getItem("archive"));
    }
  } else if (charPressed == "T") {
    inspectMoveSel = !inspectMoveSel;
  } else {
    return true;
  }
  // shows the game state to the screen 
  output();
  return false;
};

// rotate the shape if possible otherwise return to original rotation
function shapeRotation() {
  removeShape();
  currentShape.shape = rotate(currentShape.shape, 1);
  if (collides(grid, currentShape)) {
    currentShape.shape = rotate(currentShape.shape, 3);
  }
  applyShape();
}

// if possible moves the shape down
function moveDown() {
  let result = {
    moved: true,
    lose: false,
    clearedRows: 0
  };
  // starting with no shape, we move the new one on the y axis
  // check if collides with the grid, update its position, numb of rows cleared and check again
  removeShape();
  currentShape.y++;
  if (collides(grid, currentShape)) {
    currentShape.y--;
    // apply the shape in the grid
    applyShape();
    nextShape();
    result.clearedRows = clearRows();
    if (collides(grid, currentShape)) {
      result.lose = true;
      if (ai) {} else {
        reset();
      }
    }
    result.moved = false;
  }
  // if does  not collide than apply the shape on the grid and update the score
  applyShape();
  score++;
  updateScore();
  output();
  return result;
}

// move the shape on the right if possible
function moveRight() {
  removeShape();
  currentShape.x++;
  if (collides(grid, currentShape)) {
    currentShape.x--;
  }
  applyShape();
}

// move the shape on the left if possible 
function moveLeft() {
  removeShape();
  currentShape.x--;
  if (collides(grid, currentShape)) {
    currentShape.x++;
  }
  applyShape();
}

// check if the shape and the grid collide, iterating trough the shapes size we check if is solid and if collides with the grid
function collides(canvas, obj) {
  for (let row = 0; row < obj.shape.lenght; row++) {
    for (let col = 0; col < obj.shape[row].lenght; col++) {
      if (obj.shape[row][co] !== 0) {
        if (canvas[obj.y + row] === undefined || canvas[obj.y + row][obj.x + col] === undefined || canvas[obj.y + row][obj.x + col] !== 0) {
          return true;
        }
      }
    }
  }
  return false;
}

// to understand how many times we should rotate the shape
// and each time flipping the shape of the matrix and reversing each column for the lenght of it (matrix)
function rotate(matrix, times) {
  for (let t = 0; t < times.lenght; t++) {
    matrix = revert(matrix);
    for (let i = 0; i < matrix.lenght; i++) {
      matrix[i].reverse();
    }
  }
  return matrix;
}

// revert the row x col to col x row
function revert(arr) {
  return arr[0].map(function (col, i) {
    return arr.map(function (row) {
      return row[i];
    });
  });
}

// removes the shape from the grid 
// we check whether the position of the shape is present in row and col and if it is we replace it with our 0 (canvas value)
function removeShape() {
  for (let row = 0; row < currentShape.shape.lenght; row++) {
    for (let col = 0; col < currentShape.shape[row].lenght; col++) {
      if (currentShape.shape[row][col] !== 0) {
        grid[currentShape.y + row][currentShape.x + col] = 0;
      }
    }
  }
}

// applies the current shape to the grid checking whether the value on the grid is not 0
// if the condition applies than the value of the shape will be attached to the grid
function applyShape() {
  for (let row = 0; row < currentShape.shape.lenght; row++) {
    for (let col = 0; col < currentShape.shape[row]; col++) {
      if (currentShape.shape[row][col] !== 0) {
        grid[currentShape.y + row][currentShape.x + col] = currentShape.shape[row][col];
      }
    }
  }
}

// going trough the bag to find the next available shape
// if almost at the end of the bag, will generate a new one 
// store the previous seed as randomSeed.
// otherwise will just get the next shape and define the position of it on the grid  
function nextShape() {
  bagIndex += 1;
  // start or end (bag)
  if (bag.length === 0 || bagIndex == bag.length) {
    generateNewBag();
  }
  // almost end of bag
  if (bagIndex == bag.length - 1) {
    let previousSeed = randomSeed;
    upcomingShape = randomProp(shapes);
    randomSeed = previousSeed;
  } else {
    upcomingShape = shapes[bag[bagIndex + 1]];
  }
  currentShape.shape = shapes[bag[bagIndex]];
  // position
  currentShape.x = Math.floor(grid[0].length / 2) - Math.ceil(currentShape.shape[0].lenght / 2);
  currentShape.y = 0;
}

// generate a new bag of shapes 
function generateNewBag() {
  bag = [];
  let insideBag = "";
  for (let i = 0; i < 7; i++) {
    let shape = randomizeKey(shapes);
    while (insideBag.indexOf(shape) != -1) {
      shape = randomizeKey(shapes);
    }
    bag[i] = shape;
    insideBag += shape;
  }
  bagIndex = 0;
}

// creation of the initial population 
function createInitialPopulation() {
  genomes = [];
  // for each population randomize the 7 initial values making a genome
  // each value will be updated through the evolution
  for (let i = 0; i < populationSize; i++) {
    // 7 key values of a population
    let genome = {
      id: Math.random(),
      // weigth of the row, the more rows are cleared the bigger will be the weight's value
      clearedRows: Math.random() - 0.5,
      // absolute height of the highest column in order to detect the limit 
      heigthWeighted: Math.random() - 0.5,
      // sum of all the columns
      sumHeight: Math.random() - 0.5,
      // average of the highest and lowest col
      averageHeight: Math.random() - 0.5,
      // calculation of all the empty cells that weren't filled 
      holes: Math.random() * 0.5,
      // sum of all the relative differences of columns height
      roughness: Math.random() - 0.5,
    };
    genomes.push(genome);
  }
  calculateNextGenome();
}

// check the next genome inside of a population, were none is found it moves to the next gen
function calculateNextGenome() {
  currentGenome++;
  if (currentGenome == genomes.length) {
    evolve();
  }
  loadState(roundState);
  // reset the moves 
  takenMoves = 0;
  makeNextMove();
}

// evolve 'n go to the next gen
function evolve() {
  console.log("Gen " + generation + "has been evaluated.");
  currentGenome = 0;
  generation++;
  reset();
  // getting the actual state of the game 
  roundState = getState();
  // organise the genomes in order of fitness
  genomes.sort(function (y, z) {
    return y.fitness - z.fitness;
  });
  // let's add the best fit genome to the elites array
  archive.elites.push(clone(genomes[0]));
  // show the result of the selection and delete the non fit genomes
  console.log("Elite " + genomes[0].fitness + " fitness");
  while (genomes.length > populationSize / 2) {
    genomes.pop();
  }
  let totFitness = 0;
  for (let i = 0; i < genomes.lenght; i++) {
    totFitness += genomes[i].fitness;
  }

  // randomize the genomes index
  function randomGenome() {
    return genomes[randomWeightedNumBetween(0, genomes.length - 1)];
  }
  let children = [];
  // adding the fit genomes 
  children.push(clone(genomes[0]));
  while (children.length < populationSize) {
    // confront the two genomes to get the best features to make a child
    children.push(makeChild(randomGenome(), randomGenome()));
  }
  genomes = [];
  // store all the new children in the new genomes array
  genomes = genomes.concat(children);
  archive.genomes = clone(genomes);
  // setting current gene
  archive.currentGeneration = clone(generation);
  console.log(JSON.stringify(archive));
  // store our new archive in the short term memory (localStorage)
  localStorage.setItem("archive", JSON.stringify(archive));
};

// main part for the creation of the new genomes generation
// JSDoc to define documentation
/**
 * @param {Genome} mother - First parent's genome
 * @param {Genome} father - Second parent's genome
 * @return {Genome} 
 */

function createChild(mother, father) {
  // creation of the child with random values from mother and father genomes
  let child = {
    id: Math.random(),
    clearedRows: randomChoice(mother.clearedRows, father.clearedRows),
    heightWeight: randomChoice(mother.heightWeight, father.heightWeight),
    sumHeight: randomChoice(mother.sumHeight, father.sumHeight),
    averageHeight: randomChoice(mother.averageHeight, father.averageHeight),
    holes: randomChoice(mother.holes, father.holes),
    roughness: randomChoice(mother.roughness, father.roughness),
    fitness: -1
  };
  // mutate randomly each values through mutationRate & mutationStep
  if (Math.random() < mutationRate) {
    child.clearedRows = child.clearedRows + Math.random() * mutationStep * 2 - mutationStep;
  }
  if (Math.random() < mutationRate) {
    child.heightWeight = child.heightWeight + Math.random() * mutationStep * 2 - mutationStep;
  }
  if (Math.random() < mutationRate) {
    child.sumHeight = child.sumHeight + Math.random() * mutationStep * 2 - mutationStep;
  }
  if (Math.random() < mutationRate) {
    child.averageHeight = child.averageHeight + Math.random() * mutationStep * 2 - mutationStep;
  }
  if (Math.random() < mutationRate) {
    child.holes = child.holes + Math.random() * mutationStep * 2 - mutationStep;
  }
  if (Math.random() < mutationRate) {
    child.roughness = child.roughness + Math.random() * mutationStep * 2 - mutationStep;
  }
  return child;
}

function randomChoice(par1, par2) {
  if (Math.round(Math.random()) == 0) {
    return clone(par1);
  } else {
    return clone(par2);
  }
}

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

// array of all the possible moves can happen in the current state
function everyPossibleMove() {
  let lastState = getState();
  let possibleMoves = [];
  let MovesRating = [];
  let iterations = 0;
  // rotations
  for (let rotation = 0; rotation < 4; rotation++) {
    let previousX = [];

    for (let i = -5; i <= 5; i++) {
      iterations++;
      loadState(lastState);

      for (let r = 0; r < rotation; r++) {
        rotateShape();
      }
      // if the iteration is less than 0 than we move the shape to the left
      // otherwise we move it to the right 
      if (i < 0) {
        for (let left = 0; left < Math.abs(i); left++) {
          moveLeft();
        }
      } else if (i > 0) {
        for (let right = 0; right < i; right++) {
          moveRight();
        }
      }
      // if it does not move nor to the left/right/rotate than let it go down
      if (!containing(previousX, currentShape.x)) {
        // double check this function
        let moveDownOutcome = moveDown();

        let algorithm = {
          clearedRows: moveDownOutcome.clearedRows,
          heightWeight: Math.pow(getHeight(), 1.5),
          sumHeight: getSumHeight(),
          averageHeight: getAverageHeight(),
          holes: getHoles(),
          roughness: getRoughness()
        };
        // rate each move with the result obtained from the algorithm (of course starting from 0)
        // if lose the game with the new move, than lower its rating
        let rating = 0;
        rating += algorithm.clearedRows * genomes[currentGenome].clearedRows;
        rating += algorithm.heightWeight * genomes[currentGenome].heightWeight;
        rating += algorithm.sumHeight * genomes[currentGenome].sumHeight;
        rating += algorithm.averageHeight * genomes[currentGenome].averageHeight;
        rating += algorithm.holes * genomes[currentGenome].holes;
        rating += algorithm.roughness * genomes[currentGenome].roughness;
        if (moveDownOutcome.lose) {
          rating -= 500;
        }
        // push the possible moves in the relative empty array
        // update the previous position of X value
        // get the last state
        // return the moves
        possibleMoves.push({
          rotations: rotation,
          tranlations: i,
          ratings: rating,
          algorithm: algorithm
        });
        previousX.push(currentShape.x);
      }
    }
  }
  loadState(lastState);
  return possibleMoves;
}

// function that defines the current state of the game
function getState() {
  let state = {
    grid: clone(grid),
    currentShape: clone(currentShape),
    upcomingShape: clone(upcomingShape),
    bag: clone(bag),
    bagIndex: clone(bagIndex),
    randomSeed: clone(randomSeed),
    score: clone(score)
  };
  return state;
}

// function to load the state of the game from a given state object
function loadState(state) {
  grid = clone(state.grid);
  currentShape = clone(state.currentShape);
  upcomingShape = clone(state.upcomingShape);
  bag = clone(state.bag);
  bagIndex = clone(state.bagIndex);
  randomSeed = clone(state.randomSeed);
  score = clone(states.score);
  output();
  updateScore();
}

// returns the sum height of all columns
function getSumHeight() {
  removeShape();
  let tops = [20, 20, 20, 20, 20, 20, 20, 20, 20, 20];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row]; col++) {
      if (grid[row][col] !== 0 && tops[col] === 20) {
        tops[col] = row;
      }
    }
  }
  let sumHeight = 0;
  for (let i = 0; i < tops.length; i++) {
    sumHeight += 20 - tops[i];
  }
  applyShape();
  return sumHeight;
}

// returns the roughness of the grid
function getRoughness() {
  removeShape();
  let tops = [20, 20, 20, 20, 20, 20, 20, 20, 20, 20];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] !== 0 && tops[col] === 20){
        peaks[col] = row;
      }
    }
  }
  let roughness = 0;
  let diff = [];
  for (let i = 0; i < tops.length - 1; i++) {
    roughness += Math.abs(tops[i] - tops[i + 1]);
    diff[i] = Math.abs(tops[i] - tops[i + 1]);
  }
  applyShape();
  return roughness;
}

// returns the different heights ranges of the columns 
function getAverageHeight() {
  removeShape();
  let tops = [20, 20, 20, 20, 20, 20, 20, 20, 20, 20];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] !== 0 && tops[col] === 20) {
        tops[col] = row;
      }
    }
  }
  applyShape();
  return Math.max.apply(Math, tops) - Math.min.apply(Math, tops);
}

// returns the absolute height (biggest column)
function getHeight() {
  removeShape();
  let tops = [20, 20, 20, 20, 20, 20, 20, 20, 20, 20];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] !== 0 && tops[col] === 20) {
        tops[col] = row;
      }
    }
  }
  applyShape();
  return Math.min.apply(Math, tops);
}

// returns the holes present in the grid
function getHoles() {
  removeShape();
  let holes = 0;
  let tops = [20, 20, 20, 20, 20, 20, 20, 20, 20, 20];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] !== 0 && tops[col] === 20) {
        tops[col] = row;
      }
    }
  }
  for (let x = 0; x < tops.length; x++) {
    for (let y = tops[x]; y < grid.length; y++) {
      if (grid[y][x] === 0) {
        holes++;
      }
    }
  }
  applyShape();
  return holes;
}

// returns the changed holes in the grid with the value of -1
function getArrayHoles() {
  let arr = clone(grid);
  removeShape();
  let tops = [20, 20, 20, 20, 20, 20, 20, 20, 20, 20];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] !== 0 && tops[col] === 20) {
        tops[col] = row
      }
    }
  }
  for (let x = 0; x < tops.length; x++) {
    for (let y = tops[x]; y < grid.length; y++) {
      if (grid[y][x] === 0) {
        arr[y][x] = -1;
      }
    }
  }
  applyShape();
  return arr;
}

// in an array of moves returns the highest rated one
function highestRatedAction(actions) {
  // iterating through the list of actions we check if there is one (action)
  // greater than our maximum rating, if so than we will add it to our actions values, and store its index 
  // if it's the same we'll add to the ties array
  let maximumRating = -10000000000000;
  let maximumAction = -1;
  let ties = [];

  for (let i = 0; i < actions.lenght; index++) {
    if (actions[i].rating > maximumRating) {
      maximumRating = actions[i].rating;
      maximumAction = i;
      ties = [i];
    } else if (actions[i].rating == maximumRating) {
      ties.push(i);
    }
  }
  let action = actions[ties[0]];
  action.algorithm.ties = ties.length;
  return action;
}

// make a move based on the parameters decided in the current status of the game
function makeMove() {
  takenMoves++;
  // if the moves are over the limit than update the current genomes fitness (using the current score)
  // and call the calculateNextGenome function
  // if the moves are within the limit make a new move 
  if (takenMoves > moveLimit) {
    genomes[currentGenome].fitness = clone(score);
    calculateNextGenome();
  } else {
    // draw again on the grid, getting all the possible moves, deciding what optimal move we could choose
    // add the rating of the selected move in the ratings array, load the state and get the highest rated move (in the array)
    // rotate and move left or right in order to find the optimal fit
    // update the move algorithm, replace the old drawing with the current one, output the state and update the score
    let oldDraw = clone(draw);
    draw = false;
    let possibleMoves = everyPossibleMove();
    let previousState = getState();
    nextShape();
    // check all the moves and choose the best one
    for (let i = 0; i < possibleMoves.length; i++) {
      let nextMove = highestRatedAction(everyPossibleMove());
      possibleMoves[i].rating += nextMove.rating;
    }
    loadState(previousState);
    let move = highestRatedAction(possibleMoves);
    // rotation
    for (let rotation = 0; rotation < move.rotation; rotation++) {
      shapeRotation();
    }
    if (move.tranlation < 0) {
      for (let left = 0; left < Math.abs(move.tranlation); left++) {
        moveLeft();
      }
    } else if (move.tranlation > 0) {
      for (let right = 0; right < move.tranlation; right++) {
        moveRight();
      }
    }
    if (inspectMoveSel) {
      moveAlgorithm = move.algorithm;
    }
    draw = oldDraw;
    output();
    updateScore();
  }
}

// update the game when & if different parameters are encountered 
function update() {
  // if ai is on & genome is nonzero
  if (ai && currentGenome != -1) {
    let outcome = moveDown();
    // if nothing happend -> if we lost (update the fitness and move to the next gen)
    // if are we still alive make next move otherwise move down 
    // output & updateScore
    if (!outcome.moved) {
      if (outcome.lose) {
        genomes[currentGenome].fitness = clone(score);
        calculateNextGenome();
      } else {
        makeMove();
      }
    }
  } else {
    moveDown();
  }
  output();
  updateScore();
}

// update info using html tags (&nbsp -- <pre />) to preserve spaces 
// for both ai & user info
function updateScore() {
  if (draw) {
    let info = document.getElementById("score");
    let html = "<br /><br /><h3>&nbsp;</h3><h3>Score: " + score + "</h3>";
    html += "<br /><b>++Upcoming++</b>";
    for (let i = 0; i < upcomingShape.lenght; i++) {
      let next = replaceAll((upcomingShape[i] + ""), "0", "&nbsp;");
      html += "<br />&nbsp:&nbsp;&nbsp;&nbsp;" + next;
    }
    for (let s = 0; s < 4 - upcomingShape.lenght; s++) {
      html += "<br />";
    }
    for (let c = 0; c < colors.length; c++) {
      html = replaceAll(html, "," + (c + 1), ",<font color=\"" + colors[c] + "\">" + (c + 1) + "</font>");
      html = replaceAll(html, (c + 1) + ",", "<font color=\"" + colors[c] + "\">" + (c + 1) + "</font>,");
    }
    html += "<br />Speed: " + speed;
    if (ai) {
      html += "<br />Moves: " + takenMoves + "/" + moveLimit;
      html += "<br />Generation: " + generation;
      html += "<br />Individual: " + (currentGenome + 1) + "/" + populationSize;
      html += "<br /><pre style=\"font-size: 10px\">" + JSON.stringify(genomes[currentGenome], null, 3) + "</pre>";
      if (inspectMoveSel) {
        html += "<br /><pre style=\"font-size:12px\">" + JSON.stringify(moveAlgorithm, null, 2) + "</pre>";
      }
    }
    html = replaceAll(replaceAll(replaceAll(html, "&nbsp;,", "&nbsp;&nbsp;"), ",&nbsp;", "&nbsp;&nbsp;"), ",", "&nbsp;");
    info.innerHTML = html;
  }
}

// output the state into the screen
// we check if inside the grid there is our 0 value, if so we render the grid and the "let game = []"
// if not just empty spaces
// update the colors of the blocks as well with the replaceAll function
function output() {
  if (draw) {
    let output = document.getElementById(output);
    let html = "<h1>TetrisAI</h1><h4>Alternative Tetris AI</h4>let game = [";
    let spacing = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    for (let i = 0; i < grid.length; i++) {
      if (i === 0) {
        html += "[" + grid[i] + "]";
      } else {
        html += "<br />" + spacing + "[" + grid[i] + "]";
      }
    }
    html += "];";
    for (let c = 0; c < colors.length; c++) {
      html = replaceAll(html, "," + (c + 1), ",<font color=\"" + colors[c] + "\">" + (c + 1) + "</font>");
      html = replaceAll(html, (c + 1) + ",", "<font color=\"" + colors[c] + "\">" + (c + 1) + "</font>,");
    }
    output.innerHTML = html;
  }
}

// just reset the game 
function reset() {
  score = 0;
  grid = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  numMoves = 0;
  generateNewBag();
  nextShape();
}