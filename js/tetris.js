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

  const colors = ["cyan", "royalblue", "magenta", "chocolate", "forestgreen", "khaki", "crimson"];
  let rndSeed = 1;

  // SHAPES BLOCKS
  let actualShape = {
    x: 0,
    y: 0,
    shape: undefined
  };
  let followingShape;
  let bag = [];
  let bagIndex = 0;

  // VALUES OF THE GAME
  let score = 0;
  let speed = 400;
  let changeSpeed = false;
  let roundState;
  let saveState;
  let gameSpeeds = [600, 400, 200, 100, 50, 5, 1, 0];
  let indexGameSpeed = 1;
  let ai = true;
  let draw = true;
  let takenMoves = 0;
  let moveLimit = 500;
  let moveAlgorithm = {};
  let inspectMoveSelection = false;

  // ALGORITHM VALUES
  let populationSize = 60;
  let generation = 0;
  let genomes = [];
  let currentGenome = -1;
  let archive = {
    populationSize: 0,
    currentGeneration: 0,
    genomes: [],
    elites: []
  };

  // indicators of a mutation speed
  let mutationRate = 0.25;
  let mutationStep = 0.5;

  function starter() {
    instructions();
    archive.populationSize = populationSize;
    nextShape();
    applyShape();
    saveState = getState();
    roundState = getState();
    createInitialPopulation();
    let loop = function () {
      if (changeSpeed) {
        clearInterval(interval);
        interval = setInterval(loop, speed);
        changeInterval = false;
      }
      if (speed === 0) {
        draw = false;
        update();
        update();
        update();
      } else {
        draw = true;
      }
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
  window.onkeydown = function (event) {
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
      actualShape.shape = shapes[characterPressed.toUpperCase()];
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
    output();
    return false;
  };


  function createInitialPopulation() {
    genomes = [];
    for (let i = 0; i < populationSize; i++) {
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

  function calculateNextGenome() {
    currentGenome++;
    if (currentGenome == genomes.length) {
      evolve();
    }
    loadState(roundState);
    takenMoves = 0;
    makeMove();
  }

  function evolve() {
    console.log("Gen: " + generation + " has been evaluated.");
    currentGenome = 0;
    generation++;
    reset();
    roundState = getState();
    genomes.sort(function (a, b) {
      return b.fitness - a.fitness;
    });
    archive.elites.push(clone(genomes[0]));
    console.log("The elite fitness is: " + genomes[0].fitness);
    while (genomes.length > populationSize / 2) {
      genomes.pop();
    }
    let totFitness = 0;
    for (let i = 0; i < genomes.length; i++) {
      totFitness += genomes[i].fitness;
    }


    function randomGenome() {

      return genomes[randomWeightedNumBetween(0, genomes.length - 1)];
    }
    let children = [];
    children.push(clone(genomes[0]));
    while (children.length < populationSize) {
      children.push(createChild(randomGenome(), randomGenome()));
    }
    genomes = [];
    genomes = genomes.concat(children);
    archive.genomes = clone(genomes);
    archive.currentGeneration = clone(generation);
    console.log(JSON.stringify(archive));
    localStorage.setItem("archive", JSON.stringify(archive));
  }

  /**
   * @param {Genome} mother - First parent's genome
   * @param {Genome} father - Second parent's genome
   * @return {Genome} 
   */

  // creation of the child with random values from mother and father genomes
  function createChild(mother, father) {
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

        if (t < 0) {
          for (let l = 0; l < Math.abs(t); l++) {
            moveLeft();
          }
        } else if (t > 0) {
          for (let r = 0; r < t; r++) {
            moveRight();
          }
        }

        if (!contains(previousX, actualShape.x)) {
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
          possibleMoves.push({
            rotations: rots,
            translation: t,
            rating: rating,
            algorithm: algorithm
          });
          previousX.push(actualShape.x);
        }
      }
    }
    loadState(lastState);
    return possibleMoves;
  }

  // iterating through the list of moves we check if there is one (Move)
  // greater than our maximum rating, if so than we will add it to our moves values, and store its index 
  // if it's the same we'll add to the ties array
  function highestRatedMove(moves) {
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


  function makeMove() {
    takenMoves++;
    if (takenMoves > moveLimit) {
      genomes[currentGenome].fitness = clone(score);
      calculateNextGenome();
    } else {
      let oldDraw = clone(draw);
      draw = false;
      let possibleMoves = everyPossibleMove();
      let previousState = getState();
      nextShape();
      for (let i = 0; i < possibleMoves.length; i++) {
        let nextMove = highestRatedMove(everyPossibleMove());
        possibleMoves[i].rating += nextMove.rating;
      }
      loadState(previousState);
      let move = highestRatedMove(possibleMoves);
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


  function moveDown() {
    let result = {
      moved: true,
      lose: false,
      clearedRows: 0
    };
    removeShape();
    actualShape.y++;
    if (collides(grid, actualShape)) {
      actualShape.y--;
      applyShape();
      nextShape();
      result.clearedRows = clearRows();
      if (collides(grid, actualShape)) {
        result.lose = true;
        if (ai) {} else {
          reset();
        }
      }
      result.moved = false;
    }
    applyShape();
    score++;
    updateScore();
    output();
    return result;
  }


  function moveRight() {
    removeShape();
    actualShape.x++;
    if (collides(grid, actualShape)) {
      actualShape.x--;
    }
    applyShape();
  }


  function moveLeft() {
    removeShape();
    actualShape.x--;
    if (collides(grid, actualShape)) {
      actualShape.x++;
    }
    applyShape();
  }

  // rotate the shape if possible otherwise return to original rotation
  function shapeRotation() {
    removeShape();
    actualShape.shape = rotate(actualShape.shape, 1);
    if (collides(grid, actualShape)) {
      actualShape.shape = rotate(actualShape.shape, 3);
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

    if (toBeCleared.length == 1) {
      score += 400;
    } else if (toBeCleared.length == 2) {
      score += 1000;
    } else if (toBeCleared.length == 3) {
      score += 3000;
    } else if (toBeCleared.length == 4) {
      score += 12000;
    }
    let clearedRows = clone(toBeCleared.length);
    for (let toBe = toBeCleared.length - 1; toBe >= 0; toBe--) {
      grid.splice(toBeCleared[toBe], 1);
    }
    while (grid.length < 20) {
      grid.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }
    return clearedRows;
  }


  function applyShape() {
    for (let row = 0; row < actualShape.shape.length; row++) {
      for (let col = 0; col < actualShape.shape[row].length; col++) {
        if (actualShape.shape[row][col] !== 0) {
          grid[actualShape.y + row][actualShape.x + col] = actualShape.shape[row][col];
        }
      }
    }
  }


  function removeShape() {
    for (let row = 0; row < actualShape.shape.length; row++) {
      for (let col = 0; col < actualShape.shape[row].length; col++) {
        if (actualShape.shape[row][col] !== 0) {
          grid[actualShape.y + row][actualShape.x + col] = 0;
        }
      }
    }
  }


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
    actualShape.shape = shapes[bag[bagIndex]];

    actualShape.x = Math.floor(grid[0].length / 2) - Math.ceil(actualShape.shape[0].length / 2);
    actualShape.y = 0;
  }


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

  function rotate(matrix, times) {
    for (let t = 0; t < times; t++) {
      matrix = revert(matrix);
      for (let i = 0; i < matrix.length; i++) {
        matrix[i].reverse();
      }
    }
    return matrix;
  }


  function revert(array) {
    return array[0].map(function (col, i) {
      return array.map(function (row) {
        return row[i];
      });
    });
  }


  function update() {
    if (ai && currentGenome != -1) {
      let outcome = moveDown();
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


  function output() {
    if (draw) {
      let output = $('#output');
      output.empty();
      let title = $('<div>').addClass('title');
      title.html('<p>TetrisAI</p>');
      let subtitle = $('<div>').addClass('subtitle');
      subtitle.append('<p>The evolution of Tetris</p>');
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
                      <div class= "genome">' + JSON.stringify(genomes[currentGenome], null, '  ') + '</div>');
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


  function instructions() {
    let instruction = $('#instructions');
    instruction.empty();
    let infoHeader = $('<div>').addClass('infoHeader');
    infoHeader.html('<h4>Key Commands</h4>');
    let bodyInfo = $('<div>').addClass('bodyInfo');
    bodyInfo.html("<ul>\
                        <li id='li1'>Activate / Deactivate AI [X]</li>\
                        <br />\
                        <li id='li2'>Move Shape [Left & Right\
                        &nbsp;&nbsp;Arrow Keys]\
                        <br /><br />\
                        <li id='li3'>Move Down Shape [Down \
                          &nbsp;&nbsp;Arrow]</li>\
                        <br />\
                        <li id='li4'>Rotate Shape [Up Arrow]</li>\
                        <br />\
                        <li id='li5'>Speed Up [B]</li>\
                        <br />\
                        <li id='li6'>Slow Down [N]</li>\
                        <br />\
                        <li id='li7'>Load a full evolve Generation [CTRL]</li>\
                        <br />\
                        <li id='li8'>Save Current State [A]</li>\
                        <br />\
                        <li id='li9'>Load Saved State [Q]</li>\
                        <br />\
                        <li id='li10'>Choose Shape [O, T, I, L, J, Z, S]\
                        </ul>");

    instruction.append(infoHeader);
    instruction.append(bodyInfo);
  }


  function getState() {
    let state = {
      grid: clone(grid),
      actualShape: clone(actualShape),
      followingShape: clone(followingShape),
      bag: clone(bag),
      bagIndex: clone(bagIndex),
      rndSeed: clone(rndSeed),
      score: clone(score)
    };
    return state;
  }


  function loadState(state) {
    grid = clone(state.grid);
    actualShape = clone(state.actualShape);
    followingShape = clone(state.followingShape);
    bag = clone(state.bag);
    bagIndex = clone(state.bagIndex);
    rndSeed = clone(state.rndSeed);
    score = clone(state.score);
    output();
    updateScore();
  }


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