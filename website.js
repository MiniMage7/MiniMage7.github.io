// Initialize the grid
const tileContainer = document.getElementById("tilecontainer");
const gridSizeBoxes = document.getElementsByClassName("sizeinput");
const widthBox = gridSizeBoxes[0].children[0];
const heightBox = gridSizeBoxes[1].children[0];
let width = 0;
let height = 0;
updateGridSize();

// Give the input boxes event handlers
widthBox.addEventListener("change", updateGridSize);
heightBox.addEventListener("change", updateGridSize);

// For determining if the mouse is being held down
let isMouseDown = false;
document.addEventListener("mousedown", mouseDown);
document.addEventListener("mouseup", mouseUp);

// Help button events
const helpArea = document.getElementById("helparea");
document.getElementById("helpdiamond").addEventListener("click", showHelpArea);
helpArea.addEventListener("click", hideHelpArea);

// Add clear button event
document.getElementById("clear").addEventListener("click", clearGrid);

// Add solve puzzle event
const solveButton = document.getElementById("solve");
solveButton.addEventListener("click", solveGrid);

// To handle if the website is stepping through the solution instead of drawing
let inSolveMode = false;
let currentStep = 0;

// Next and pervious buttons for solve mode
const previousButton = document.getElementById("previous");
previousButton.addEventListener("click", previousBoardState);

const nextButton = document.getElementById("next");
nextButton.addEventListener("click", nextBoardState);

// Track if the solve button is disabled due to lack of solution
let noSolution = false;

// When the grid size boxes are update, adds or removes tiles as needed
function updateGridSize() {
  let oldWidth = width;
  let oldHeight = height;

  // Make sure the changed values are in acceptable ranges
  const maxSize = 32;
  if (widthBox.value > maxSize) {
    widthBox.value = maxSize;
  } else if (widthBox.value < 1) {
    widthBox.value = 1; 
  }
  if (heightBox.value > maxSize) {
    heightBox.value = maxSize;
  } else if (heightBox.value < 1) {
    heightBox.value = 1; 
  }

  width = Number(widthBox.value);
  height = Number(heightBox.value);

  // Resize grid
  tileContainer.style.gridTemplateColumns = "repeat(" + String(width) + ", auto)";
  tileContainer.style.gridTemplateRows = "repeat(" + String(height) + ", auto)";

  // Add tiles
  if (width * height > oldWidth * oldHeight) {
    for (let i = 0; i < (width * height - oldWidth * oldHeight); i++) {
      const tile = document.createElement("div");
      tile.classList.add("tile", "c0");
      tile.addEventListener("mousedown", cChange);
      tile.addEventListener("mouseenter", mouseEnterTile)
      tileContainer.appendChild(tile);
    }
  }
  // Remove tiles
  else {
    for (let i = 0; i < (oldWidth * oldHeight - width * height); i++) {
      tileContainer.removeChild(tileContainer.lastElementChild);
    }
  }
}

// Changed the class up or down 1 on user click
function cChange(e) {
  // If the website is in solve mode, don't allow drawing
  if (inSolveMode) {
    return;
  }

  // If the solve button is disabled, allow it to be pushed again
  if (noSolution) {
    noSolution = true;
    solveButton.textContent = "Solve";
    solveButton.removeAttribute("disabled");
  }

  let cNumber = Number(getCNumber(e.target));
  let newCNumber;

  // If shift is being held go down
  if (e.shiftKey) {
    newCNumber = cNumber - 1;
    if (newCNumber < -1) {
      newCNumber = 10;
    }
  } // Otherwise go up by 1
  else {
    newCNumber = cNumber + 1;
    if (newCNumber > 10) {
      newCNumber = -1;
    }
  }

  e.target.classList.replace("c" + cNumber, "c" + newCNumber);
}

// Returns the value of the current class
function getCNumber(tile) {
  return tile.className.replace("tile", "").replace("c", "").trim();
}

// If the mouse is down on a tile enter, treat it as a click
function mouseEnterTile(e) {
  if (isMouseDown) {
    cChange(e);
  }
}

// Keeps track of if the mouse is being pressed
function mouseDown(e) {
  isMouseDown = true;
}

// Keeps track of if the mouse is being pressed
function mouseUp(e) {
  isMouseDown = false;
}

// Makes all the tiles white (c0)
function clearGrid(e) {
  // If the website is in solve mode, disable it
  if (inSolveMode) {
    disableSolveMode();
  }

  let tiles = tileContainer.getElementsByClassName("tile");

  // For each tile
  for (let index = 0; index < tiles.length; index++) {
    const tile = tiles[index];
    // Get the tiles c number
    let cNumber = Number(getCNumber(tile));
    // Replace its c class with c0
    tile.classList.replace("c" + cNumber, "c0");
  }
}

// If the website is in solve mode, disable it
// Otherwise, starts the match3 solve in solve.js
function solveGrid(e) {
  if (inSolveMode) {
    disableSolveMode();
  }
  else {
    startSolve();
  }
}

// Shows the help rules
function showHelpArea(e) {
  helpArea.style.display = "block";
}

// Hides the help area
function hideHelpArea(e) {
  if (e.target.id == "helparea") {
    helpArea.style.display = "none";
  }
}

// Enables solve mode and buttons that interact with it
function enableSolveMode() {
  inSolveMode = true;

  // Reset the current spot in the step through
  currentStep = 0;

  // Disable the ability to change the grid size
  widthBox.disabled = "disabled";
  heightBox.disabled = "disabled";

  // Make the next and previous buttons visible
  previousButton.style.visibility = "visible";
  nextButton.style.visibility = "visible";

  // Enable the next button and disable the previous one
  previousButton.disabled = "disabled";
  nextButton.removeAttribute("disabled");

  // Update board state to highlight next move
  updateBoardState();
}

// Disables solve modes and buttons that interact with it
function disableSolveMode() {
  inSolveMode = false;

  // Remove move highlight
  highlightMove("solid");

  // Enable the ability to change the grid size
  widthBox.removeAttribute("disabled");
  heightBox.removeAttribute("disabled");

  // Make the next and previous buttons hidden
  previousButton.style.visibility = "hidden";
  nextButton.style.visibility = "hidden";
}

// Handles moving to the next step in the solution
function nextBoardState() {
  // If there isn't a next step, return
  if (currentStep + 1 >= storedBoards.length) {
    return;
  }

  // Disable currently highlighted move
  highlightMove("solid");

  // Increment current step
  currentStep++;

  // Enable the previous button (in case its disabled)
  previousButton.removeAttribute("disabled");
  // Check to see if the next button should be disabled
  if (currentStep + 1 >= storedBoards.length) {
    nextButton.disabled = "disabled";
  }

  // Update to the next board state
  updateBoardState();
}

// Handles moving to the previous step in the solution
function previousBoardState() {
  // If there isn't a previous step, return
  if (currentStep - 1 < 0) {
    return;
  }

  // Disable currently highlighted move
  highlightMove("solid");

  // Decrement current step
  currentStep--;

  // Enable the next button (in case its disabled)
  nextButton.removeAttribute("disabled");
  // Check to see if the previous button should be disabled
  if (currentStep - 1 < 0) {
    previousButton.disabled = "disabled";
  }

  // Update to the next board state
  updateBoardState();
}

// Updates to the next requested step of the solution
function updateBoardState() {
  const tiles = tileContainer.getElementsByClassName("tile");

  // For each tile
  for (let index = 0; index < tiles.length; index++) {
    const tile = tiles[index];
    // Get the tiles c number
    let cNumber = Number(getCNumber(tile));
    // Replace its c class with the c Number from the stored board state
    let newCNumber = storedBoards[currentStep][Math.floor(index / width)][index % width];
    tile.classList.replace("c" + cNumber, "c" + newCNumber);
  }

  highlightMove("dotted");
}

// Changes the currently selected move to the passed highlight
// Dotted to enable, solid to disable highlighted move
function highlightMove(style) {
  const tiles = tileContainer.getElementsByClassName("tile");

  // If it isnt the last board state, show the next move to make
  if (movesToSolve.length > currentStep) {
    let nextMove = movesToSolve[currentStep];
    tiles[Number(nextMove[0][0]) * width + Number(nextMove[0][1])].style.borderStyle = style;
    tiles[Number(nextMove[1][0]) * width + Number(nextMove[1][1])].style.borderStyle = style;
  }
}