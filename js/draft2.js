$(document).ready(function () {

  //define the playable board
  let grid = [
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
      [0, 0, 0, 0],
      [0, 2, 0, 0],
      [0, 2, 0, 0],
      [2, 2, 0, 0]
    ],
    L: [
      [0, 0, 0, 0],
      [0, 3, 0, 0],
      [0, 3, 0, 0],
      [0, 3, 3, 0]
    ],
    O: [
      [0, 0, 0, 0],
      [0, 4, 4, 0],
      [0, 4, 4, 0],
      [0, 0, 0, 0]
    ],
    S: [
      [0, 0, 0, 0],
      [0, 5, 5, 0],
      [5, 5, 0, 0],
      [0, 0, 0, 0]
    ],
    T: [
      [0, 0, 0, 0],
      [0, 6, 0, 0],
      [6, 6, 6, 0],
      [0, 0, 0, 0]
    ],
    Z: [
      [0, 0, 0, 0],
      [7, 7, 0, 0],
      [0, 7, 7, 0],
      [0, 0, 0, 0]
    ]
  };

  // colors of the blocks
  const colors = ["cyan", "royalblue", "magenta", "chocolate", "forestgreen", "khaki", "crimson"];
  // random method to choose the shapes of the blocks
  let rndSeed = 1;

  // SHAPES BLOCKS
  // shapes and coordinates parameter of current block that we can update
  let currentShape = {
    x: 0,
    y: 0,
    shape: undefined
  };
  // store upcoming shape
  let followingShape;
  // array to store shapes
  let bag = [];
  // index for the shapes in the bag
  let bagIndex = 0;

  // VALUES OF THE GAME
  let score = 0;
  let speed = 400;
  let changeSpeed = false;
  // store current game state
  let roundState;
  // storing the current state so that it can be loaded later
  let saveState;
  // list of Speeds available for the game
  let gameSpeeds = [600, 400, 200, 100, 50, 5, 1, 0];
  let indexGameSpeed = 1;
  // turn our AI on or off (so that a player could get in control and play)
  let ai = true;
  let draw = true;
  let takenMoves = 0;
  // max moves in a generation
  let moveLimit = 500;
  // 7 moves in the algorithm
  let moveAlgorithm = {};
  // push to the highest move selection
  let inspectMoveSelection = false;

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
  let mutationRate = 0.25;
  let mutationStep = 0.4;

  // calling the main function on load
  function starter() {
    instructions();
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
      if (speed === 0) {
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
    };
    let interval = setInterval(loop, speed);
  }
  document.onLoad = starter();

  // key listeners 
  window.onkeydown = function () {
    let characterPressed = String.fromCharCode(event.keyCode);
    if (event.keyCode == 38) {
      shapeRotation();
    } else if (event.keyCode == 40) {
      moveDown();
    } else if (event.keyCode == 39) {
      moveRight();
    } else if (event.keyCode == 37) {
      moveLeft();
    } else if (shapes[characterPressed.toUpperCase()] !== undefined) {
      removeShape();
      currentShape.shape = shapes[characterPressed.toUpperCase()];
      applyShape();
    } else if (characterPressed.toUpperCase() == "A") {
      saveState = getState();
    } else if (characterPressed.toUpperCase() == "Q") {
      loadState(saveState);
    } else if (characterPressed.toUpperCase() == "N") {
      indexGameSpeed--;
      if (indexGameSpeed < 0) {
        indexGameSpeed = gameSpeeds.length - 1;
      }
      speed = gameSpeeds[indexGameSpeed];
      changeSpeed = true;
    } else if (characterPressed.toUpperCase() == "B") {
      indexGameSpeed++;
      if (indexGameSpeed >= gameSpeeds.length) {
        indexGameSpeed = 0;
      }
      speed = gameSpeeds[indexGameSpeed];
      changeSpeed = true;
    } else if (characterPressed.toUpperCase() == "X") {
      ai = !ai;
    } else if (characterPressed.toUpperCase() == "V") {
      loadArchive(prompt("Please insert Archive:"));
    } else if (characterPressed.toUpperCase() == "F") {
      if (localStorage.getItem("archive") === null) {
        alert("There are no saved Archives. Please check again when at least one generation has passed, since Archives are only saved when a generation has passed leaving the informations across sessions");
      } else {
        prompt("Archive from the last generation :", localStorage.getItem("archive"));
      }
    } else if (characterPressed == "K") {
      inspectMoveSelection = !inspectMoveSelection;
    } else {
      return true;
    }
    // shows the game state to the screen 
    output();
    return false;
  };

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
        clearedRows: Math.random() - 0.6,
        // absolute height of the highest column in order to detect the limit 
        heightWeighted: Math.random() - 0.6,
        // sum of all the columns
        sumHeight: Math.random() - 0.6,
        // average of the highest and lowest col
        averageHeight: Math.random() - 0.6,
        // calculation of all the empty cells that weren't filled 
        holes: Math.random() * 0.6,
        // sum of all the relative differences of columns height
        roughness: Math.random() - 0.6,
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
    makeMove();
  }

  // evolve 'n go to the next gen
  function evolve() {
    console.log("Gen: " + generation + " has been evaluated.");
    currentGenome = 0;
    generation++;
    reset();
    // getting the actual state of the game 
    roundState = getState();
    // organise the genomes in order of fitness
    genomes.sort(function (a, b) {
      return b.fitness - a.fitness;
    });
    // let's add the best fit genome to the elites array
    archive.elites.push(clone(genomes[0]));
    // show the result of the selection and delete the non fit genomes
    console.log("The elite fitness is: " + genomes[0].fitness);
    while (genomes.length > populationSize / 2) {
      genomes.pop();
    }
    let totFitness = 0;
    for (let i = 0; i < genomes.length; i++) {
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
      children.push(createChild(randomGenome(), randomGenome()));
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
  }

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
      heightWeighted: randomChoice(mother.heightWeighted, father.heightWeighted),
      sumHeight: randomChoice(mother.sumHeight, father.sumHeight),
      averageHeight: randomChoice(mother.averageHeight, father.averageHeight),
      holes: randomChoice(mother.holes, father.holes),
      roughness: randomChoice(mother.roughness, father.roughness),
      fitness: genomes[0].fitness
    };
    // mutate randomly each values through mutationRate & mutationStep
    if (Math.random() < mutationRate) {
      child.clearedRows = child.clearedRows + Math.random() * mutationStep * 2 - mutationStep;
    }
    if (Math.random() < mutationRate) {
      child.heightWeighted = child.heightWeighted + Math.random() * mutationStep * 2 - mutationStep;
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

  // array of all the possible moves can happen in the current state
  function everyPossibleMove() {
    let lastState = getState();
    let possibleMoves = [];
    let movesRating = [];
    let iterations = 0;
    for (let rots = 0; rots < 4; rots++) {
      let previousX = [];
      for (let t = -5; t <= 5; t++) {
        iterations++;
        loadState(lastState);
        for (let j = 0; j < rots; j++) {
          shapeRotation();
        }
        // if the iteration is less than 0 than we move the shape to the left
        // otherwise we move it to the right 
        if (t < 0) {
          for (let l = 0; l < Math.abs(t); l++) {
            moveLeft();
          }
        } else if (t > 0) {
          for (let r = 0; r < t; r++) {
            moveRight();
          }
        }
        // if it does not move nor to the left/right/rotate than let it go down

        if (!contains(previousX, currentShape.x)) {
          let moveDownOutcome = moveDown();
          while (moveDownOutcome.moved) {
            moveDownOutcome = moveDown();
          }
          let algorithm = {
            clearedRows: moveDownOutcome.clearedRows,
            heightWeighted: Math.pow(getHeight(), 1.5),
            sumHeight: getSumHeight(),
            averageHeight: getAverageHeight(),
            holes: getHoles(),
            roughness: getRoughness()
          };
          // rate each move with the result obtained from the algorithm (of course starting from 0)
          // if lose the game with the new move, than lower its rating
          let rating = 0;
          rating += algorithm.clearedRows * genomes[currentGenome].clearedRows;
          rating += algorithm.heightWeighted * genomes[currentGenome].heightWeighted;
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
            rotations: rots,
            translation: t,
            rating: rating,
            algorithm: algorithm
          });
          previousX.push(currentShape.x);
        }
      }
    }
    loadState(lastState);
    return possibleMoves;
  }

  function highestRatedMove(moves) {
    // iterating through the list of moves we check if there is one (Move)
    // greater than our maximum rating, if so than we will add it to our moves values, and store its index 
    // if it's the same we'll add to the ties array
    let maximumRating = -100000000000000;
    let maximumMove = -1;
    let ties = [];

    for (let index = 0; index < moves.length; index++) {
      if (moves[index].rating > maximumRating) {
        maximumRating = moves[index].rating;
        maximumMove = index;
        ties = [index];
      } else if (moves[index].rating == maximumRating) {
        ties.push(index);
      }
    }
    let move = moves[ties[0]];
    move.algorithm.ties = ties.length;
    return move;
  }

  // make a move based on the parameters decided in the current status of the game
  function makeMove() {
    takenMoves++;
    // if the moves are over the limit than update the current genomes fitness (using the current score)
    // and call the calculateNextGenome()unction
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
        let nextMove = highestRatedMove(everyPossibleMove());
        possibleMoves[i].rating += nextMove.rating;
      }
      loadState(previousState);
      let move = highestRatedMove(possibleMoves);
      // rotation
      for (let rotations = 0; rotations < move.rotations; rotations++) {
        shapeRotation();
      }
      if (move.translation < 0) {
        for (let lefts = 0; lefts < Math.abs(move.translation); lefts++) {
          moveLeft();
        }
      } else if (move.translation > 0) {
        for (let rights = 0; rights < move.translation; rights++) {
          moveRight();
        }
      }
      if (inspectMoveSelection) {
        moveAlgorithm = move.algorithm;
      }
      draw = oldDraw;
      output();
      updateScore();
    }
  }

  // returns the sum height of all columns
  function getSumHeight() {
    removeShape();
    let tops = [20, 20, 20, 20, 20, 20, 20, 20, 20, 20];
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
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


  // returns the holes present in the grid
  function getHoles() {
    removeShape();

    let tops = [20, 20, 20, 20, 20, 20, 20, 20, 20, 20];
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col] !== 0 && tops[col] === 20) {
          tops[col] = row;
        }
      }
    }
    let holes = 0;
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
    let array = clone(grid);
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
          array[y][x] = -1;
        }
      }
    }
    applyShape();
    return array;
  }

  // returns the roughness of the grid
  function getRoughness() {
    removeShape();
    let tops = [20, 20, 20, 20, 20, 20, 20, 20, 20, 20];
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col] !== 0 && tops[col] === 20) {
          tops[col] = row;
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
    // the function Math.max.apply serves to return the maximum value of an array (in this case numbers thanks to the apply fn)
    // without apply will not work because max or min do not accept arrays as values 
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
    return 20 - Math.min.apply(Math, tops);
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

  // rotate the shape if possible otherwise return to original rotation
  function shapeRotation() {
    removeShape();
    currentShape.shape = rotate(currentShape.shape, 1);
    if (collides(grid, currentShape)) {
      currentShape.shape = rotate(currentShape.shape, 3);
    }
    applyShape();
  }

  // clears completed rows iterating through rows and columns to check whether any 0 is present 
  function clearRows() {
    let toBeCleared = [];
    for (let row = 0; row < grid.length; row++) {
      let withEmptySpace = false;
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col] === 0) {
          withEmptySpace = true;
        }
      }
      if (!withEmptySpace) {
        toBeCleared.push(row);
      }
    }
    // adding score following the original tetris rules
    if (toBeCleared.length == 1) {
      score += 400;
    } else if (toBeCleared.length == 2) {
      score += 1000;
    } else if (toBeCleared.length == 3) {
      score += 3000;
    } else if (toBeCleared.length == 4) {
      score += 12000;
    }
    // create new arr for cleared rows and removed them from the grid
    let clearedRows = clone(toBeCleared.length);
    for (let toBe = toBeCleared.length - 1; toBe >= 0; toBe--) {
      grid.splice(toBeCleared[toBe], 1);
    }
    while (grid.length < 20) {
      grid.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }
    return clearedRows;
  }

  // applies the current shape to the grid checking whether the value on the grid is not 0
  // if the condition applies than the value of the shape will be attached to the grid
  function applyShape() {
    for (let row = 0; row < currentShape.shape.length; row++) {
      for (let col = 0; col < currentShape.shape[row].length; col++) {
        if (currentShape.shape[row][col] !== 0) {
          grid[currentShape.y + row][currentShape.x + col] = currentShape.shape[row][col];
        }
      }
    }
  }

  // removes the shape from the grid 
  // we check whether the position of the shape is present in row and col and if it is we replace it with our 0 (canvas value)
  function removeShape() {
    for (let row = 0; row < currentShape.shape.length; row++) {
      for (let col = 0; col < currentShape.shape[row].length; col++) {
        if (currentShape.shape[row][col] !== 0) {
          grid[currentShape.y + row][currentShape.x + col] = 0;
        }
      }
    }
  }

  // going trough the bag to find the next available shape
  // if almost at the end of the bag, will generate a new one 
  // store the previous seed as rndSeed.
  // otherwise will just get the next shape and define the position of it on the grid  
  function nextShape() {
    bagIndex += 1;
    // start or end (bag)
    if (bag.length === 0 || bagIndex == bag.length) {
      generateNewBag();
    }
    // almost end of bag
    if (bagIndex == bag.length - 1) {
      let previousSeed = rndSeed;

      followingShape = randomProperty(shapes);
      rndSeed = previousSeed;
    } else {
      followingShape = shapes[bag[bagIndex + 1]];
    }
    currentShape.shape = shapes[bag[bagIndex]];
    // position
    currentShape.x = Math.floor(grid[0].length / 2) - Math.ceil(currentShape.shape[0].length / 2);
    currentShape.y = 0;
  }

  // generate a new bag of shapes 
  function generateNewBag() {
    bag = [];
    let insideBag = "";
    for (let i = 0; i < 7; i++) {
      let shape = randomKey(shapes);
      while (insideBag.indexOf(shape) != -1) {
        shape = randomKey(shapes);
      }
      bag[i] = shape;
      insideBag += shape;
    }
    bagIndex = 0;
  }

  // check if the shape and the grid collide, iterating trough the shapes size we check if is solid and if collides with the grid
  function collides(canvas, obj) {
    for (let row = 0; row < obj.shape.length; row++) {
      for (let col = 0; col < obj.shape[row].length; col++) {
        if (obj.shape[row][col] !== 0) {
          if (canvas[obj.y + row] === undefined || canvas[obj.y + row][obj.x + col] === undefined || canvas[obj.y + row][obj.x + col] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // to understand how many times we should rotate the shape
  // and each time flipping the shape of the matrix and reversing each column for the length of it (matrix)
  function rotate(matrix, times) {
    for (let t = 0; t < times; t++) {
      matrix = revert(matrix);
      for (let i = 0; i < matrix.length; i++) {
        matrix[i].reverse();
      }
    }
    return matrix;
  }

  // revert the row x col to col x row
  function revert(array) {
    return array[0].map(function (col, i) {
      return array.map(function (row) {
        return row[i];
      });
    });
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

  // output the state into the screen
  function output() {
    if (draw) {
      let output = $('#output');
      output.empty();
      let title = $('<div>').addClass('title');
      title.html('<h2>TetrisAI</h2>');
      let subtitle = $('<div>').addClass('subtitle');
      subtitle.append('<h1>&nbsp;</h1><h3>The evolution of Tetris</h3>');
      output.append(title);
      output.append(subtitle);
      let playground = $('<div>').addClass('play');
      for (let i = 0; i < grid.length; i++) {
        let cellsRow = $('<div>').addClass('row');
        for (let j = 0; j < grid[i].length; j++) {
          let cell = $('<div>').addClass('cell');
          if (grid[i][j] !== 0) {
            cell.css('background-color', colors[parseInt(grid[i][j]) - 1]);
          }
          cellsRow.append(cell);
        }
        playground.append(cellsRow);
      }
      output.append(playground);
    }
  }

  // update & render the score 
  function updateScore() {
    if (draw) {
      let info = $('#score');
      info.empty();
      let scorestyle = $('<div>').addClass('scorestyle');
      scorestyle.append('<br /><h2>&nbsp;Score: ' + score + '</h2>');
      let shapesty = $('<div>').addClass('shapesty');
      shapesty.html('++Next Shape++');
      const block = $('<div>').addClass('block');
      for (let i = 0; i < followingShape.length; i++) {
        $('<div>').addClass('row');
        let blockRow = $('<div>').addClass('row');
        for (let j = 0; j < followingShape[i].length; j++) {
          let cell = $('<div>').addClass('cell');
          if (followingShape[i][j] !== 0)
            cell.css('background-color', colors[parseInt(followingShape[i][j]) - 1]);
          blockRow.append(cell);
        }
        block.append(blockRow);
      }
      let speedScore = $('<div>').addClass('speedScore');
      speedScore.html('<br />Speed: ' + speed);
      let movesScore = $('<div>').addClass('movesScore');
      if (ai) {
        movesScore.html('Moves: ' + takenMoves + '/' + moveLimit + '<br />\
                      Generation: ' + generation + '<br />\
                      Genome: ' + (currentGenome + 1) + '/' + populationSize + '<br />\
                      <div class= "genome">' + JSON.stringify(genomes[currentGenome], null, 3) + '</div>');
      }
      let moveSelScore = $('<div>').addClass('moveSelScore');
      if (inspectMoveSelection) {
        moveSelScore.html('<pre>' + JSON.stringify(moveAlgorithm, null, 2) + '</pre>');
      }
      info.append(scorestyle);
      info.append(shapesty);
      info.append(block);
      info.append(speedScore);
      info.append(movesScore);
      info.append(moveSelScore);
    }
  }

  // render the instuctions on the screen
  function instructions() {
    let instruction = $('#instructions');
    instruction.empty();
    let infoHeader = $('<div>').addClass('infoHeader');
    infoHeader.html('<h4>Key Commands</h4>');
    let bodyInfo = $('<div>').addClass('bodyInfo');
    bodyInfo.html("<ul>\
                        <li id='li1'>Speed Up [B]</li>\
                        <br />\
                        <li id='li2'>Slow Down [N]</li>\
                        <br />\
                        <li id='li3'>Activate / Deactivate AI [X]</li>\
                        <br />\
                        <li id='li4'>Move Shape [Left & Right\
                        &nbsp;&nbsp;Arrow Keys]\
                        <br /><br />\
                        <li id='li5'>Rotate Shape [Up Arrow]</li>\
                        <br />\
                        <li id='li6'>Move Down Shape [Down \
                          &nbsp;&nbsp;Arrow]</li>\
                        <br />\
                        <li id='li7'>Save Current State [A]</li>\
                        <br />\
                        <li id='li8'>Load Saved State [Q]</li>\
                        <br />\
                        <li id='li9'>Choose Shape [O, T, I, L, J, Z, S]\
                        </ul>");

    instruction.append(infoHeader);
    instruction.append(bodyInfo);
  }

  // function that defines the current state of the game
  function getState() {
    let state = {
      grid: clone(grid),
      currentShape: clone(currentShape),
      followingShape: clone(followingShape),
      bag: clone(bag),
      bagIndex: clone(bagIndex),
      rndSeed: clone(rndSeed),
      score: clone(score)
    };
    return state;
  }

  // function to load the state of the game from a given state object
  function loadState(state) {
    grid = clone(state.grid);
    currentShape = clone(state.currentShape);
    followingShape = clone(state.followingShape);
    bag = clone(state.bag);
    bagIndex = clone(state.bagIndex);
    rndSeed = clone(state.rndSeed);
    score = clone(state.score);
    output();
    updateScore();
  }

  // loads the archive
  function loadArchive(archiveString) {
    archive = JSON.parse(archiveString);
    genomes = clone(archive.genomes);
    populationSize = archive.populationSize;
    generation = archive.currentGeneration;
    currentGenome = 0;
    reset();
    roundState = getState();
    console.log("The archive has been loaded.");
  }

  // clones an obj
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function randomProperty(obj) {
    return (obj[randomKey(obj)]);
  }

  function randomKey(obj) {
    let keys = Object.keys(obj);
    let x = seededRandom(0, keys.length);
    return keys[x];
  }

  function replaceAll(target, search, replacement) {
    return target.replace(new RegExp(search, 'g'), replacement);
  }

  // return a random num determined from a seeded num generator
  function seededRandom(min, max) {
    max = max || 1;
    min = min || 0;

    rndSeed = (rndSeed * 9301 + 49297) % 233280;
    let random = rndSeed / 233280;

    return Math.floor(min + random * (max - min));
  }

  function randomNumBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function randomWeightedNumBetween(min, max) {
    return Math.floor(Math.pow(Math.random(), 2) * (max - min + 1) + min);
  }

  function randomChoice(par1, par2) {
    if (Math.round(Math.random()) === 0) {
      return clone(par1);
    } else {
      return clone(par2);
    }
  }

  function contains(z, obj) {
    let y = z.length;
    while (y--) {
      if (z[y] === obj) {
        return true;
      }
    }
    return false;
  }
});