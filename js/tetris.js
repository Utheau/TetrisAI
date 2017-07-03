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
// turn our AI on or off (so that a normal player could get in control ad play)
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

}

// key listeners 
window.onkeydown = function (e) {
  let charPressed = String.fromCharCode(e.keyCode);
  if (e.keyCode == 38) {
    rotateShape();
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
  } else if(charPressed.toUpperCase() == "I") {
    indexGameSpeed++;
    if (indexGameSpeed >= gameSpeeds.length) {
      indexGameSpeed = 0;
    }
    speed = gameSpeeds[indexGameSpeed];
    changeSpeed = true;
  } else if (charPressed.toUpperCase() == "X") {
    ai =!ai;
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
      heigthWeight: Math.random() - 0.5,
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
  if(currentGenome == genomes.length) {
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
  genomes.sort(function(y, z) {
    return y.fitness - z.fitness;
  });
  // let's add the best fit genome to the elites array
  archive.elites.push(clone(genomes[0]));
  // show the result of the selection and delete the non fit genomes
  console.log("Elite " + genomes[0].fitness + " fitness");
  while(genomes.length > populationSize / 2) {
    genomes.pop();
  }
  let totFitness = 0;
  for(let i = 0; i < genomes.lenght; i++) {
    totFitness += genomes[i].fitness;
  }
  // randomize the genomes index
  function randomGenome() {
    return genomes[randomWeightedNumBetween(0, genomes.length - 1)];
  }
  let children = [];
  // adding the fit genomes 
  children.push(clone(genomes[0]));
  while(children.length < populationSize) {
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



