// Initialize the grid
const tileContainer = document.getElementById("tilecontainer");
const gridSizeBoxes = document.getElementsByClassName("sizeinput");
const colorSelector = document.getElementById("colorselector");
const widthBox = gridSizeBoxes[0].children[0];
const heightBox = gridSizeBoxes[1].children[0];
let width = 0;
let height = 0;
let selectedColor = null;
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

// Color selector events
colorSelector.addEventListener("click", cSelect);

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

// Export and import buttons
const importButton = document.getElementById("import");
importButton.addEventListener("click", importBoard);

const exportButton = document.getElementById("export");
exportButton.addEventListener("click", exportBoard);

// Track if the solve button is disabled due to lack of solution
let noSolution = false;

// Set color selector size
colorSelector.style.gridTemplateColumns = "repeat(7, auto)";
colorSelector.style.gridTemplateRows = "repeat(2, auto)";

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
// Or use selected color if there is one
function cChange(e) {
  // If the website is in solve mode, don't allow drawing
  if (inSolveMode) {
    return;
  }

  // If the solve button is disabled, allow it to be pushed again
  if (noSolution) {
    noSolution = false;
    solveButton.textContent = "Solve";
    solveButton.removeAttribute("disabled");
  }

  if (selectedColor !== null) {
    e.target.classList.replace("c" + getCNumber(e.target), "c" + selectedColor);
    return;
  }

  let cNumber = Number(getCNumber(e.target));
  let newCNumber;

  // If shift is being held go down
  if (e.shiftKey) {
    newCNumber = cNumber - 1;
    if (newCNumber < -1) {
      newCNumber = 12;
    }
  } // Otherwise go up by 1
  else {
    newCNumber = cNumber + 1;
    if (newCNumber > 12) {
      newCNumber = -1;
    }
  }

  e.target.classList.replace("c" + cNumber, "c" + newCNumber);
}

// Changes the selected color to the clicked color
function cSelect(e) {
  // If the clicked element isn't a color, return
  if (!e.target.classList.contains("tile")) {
    return;
  }

  // Remove selected state from all colors
  let tiles = colorSelector.getElementsByClassName("tile");
  for (let index = 0; index < tiles.length; index++) {
    const tile = tiles[index];
    tile.classList.toggle("selected", false);
  }

  let targetColor = Number(getCNumber(e.target));

  // If the clicked element is the selected color, unselect it and return
  if (selectedColor === targetColor) {
    selectedColor = null;
    return;
  }
  
  selectedColor = targetColor;

  // Add selected state to the clicked color
  e.target.classList.toggle("selected", true);
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
  previousButton.style.zIndex = "1";
  nextButton.style.zIndex = "1";

  // Hides the Export and Import buttons
  importButton.style.visibility = "hidden";
  exportButton.style.visibility = "hidden";

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
  highlightMove("0px");

  // Enable the ability to change the grid size
  widthBox.removeAttribute("disabled");
  heightBox.removeAttribute("disabled");

  // Make the next and previous buttons hidden
  previousButton.style.visibility = "hidden";
  nextButton.style.visibility = "hidden";
  previousButton.style.zIndex = "0";
  nextButton.style.zIndex = "0";

  // Show the export and import buttons
  importButton.style.visibility = "visible";
  exportButton.style.visibility = "visible";
}

// Handles moving to the next step in the solution
function nextBoardState() {
  // If there isn't a next step, return
  if (currentStep + 1 >= storedBoards.length) {
    return;
  }

  // Disable currently highlighted move
  highlightMove("0px");

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
  highlightMove("0px");

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

  highlightMove("8px");
}

// Changes the currently selected move to the passed highlight
// 8px to highlight, 0px to remove highlight
function highlightMove(radius) {
  // If it isn't the last board state, show the next move to make
  if (movesToSolve.length > currentStep) {
    const tiles = tileContainer.getElementsByClassName("tile");
    
    let nextMove = movesToSolve[currentStep];
    tiles[Number(nextMove[0][0]) * width + Number(nextMove[0][1])].style.borderRadius = radius;
    tiles[Number(nextMove[1][0]) * width + Number(nextMove[1][1])].style.borderRadius = radius;
  }
}

// Copies the board as a json onto the clipboard
async function exportBoard() {
  let outputJSONString = "{ \"height\": " + height + ", \"width\": " + width + ", \"board\": ";
  
  // Get all the tiles
  let tiles = tileContainer.getElementsByClassName("tile");

  // For each row in the grid
  let boardString = "["
  for (let y = 0; y < height; y++) {
    // For each column in the grid
    boardString += "[";
    for (let x = 0; x < width; x++) {
      // Add that tile's c value to the row of tiles
      const tile = tiles[y * width + x];
      let cNumber = Number(getCNumber(tile));
      boardString += cNumber += ",";
    }
    boardString = boardString.substring(0, boardString.length - 1) + "], ";
  }
  boardString = boardString.substring(0, boardString.length - 2) + "]";
  outputJSONString += boardString + " }";

  // Copy the string to the clipboard
  await navigator.clipboard.writeText(outputJSONString);

  // Change the export button for a few seconds to show it copied
  exportButton.textContent = "Copied";
  exportButton.disabled = "disabled";
  await sleep(3000)
  exportButton.textContent = "Export";
  exportButton.removeAttribute("disabled");
}

// Imports a json (string) from the clipboard and onto the board
async function importBoard() {
  // Read JSON from clipboard
  let importJSONString;
  try {
    importJSONString = await navigator.clipboard.readText();
  } catch (error) {
    // I feel like there is something I'm missing because Firefox's documentation makes it look like I can do this
    // but I can't figure it out. Would appreciate help.
    alert("This browser doesn't support copying from the clipboard.\nChrome and Edge are confirmed to work.");
  }
  
  let importedBoard;

  // Try to extract the data from the clipboard text
  try {
    importedJSON = JSON.parse(importJSONString);

    heightBox.value = importedJSON.height;
    widthBox.value = importedJSON.width;

    importedBoard = importedJSON.board;
  } catch {
    importButton.textContent = "Invalid";
    importButton.style.disabled = "disabled";
    await sleep(3000);
    importButton.textContent = "Import";
    importButton.removeAttribute("disabled");
    return;
  }
  
  // Resize the grid
  updateGridSize();

  // Update all the tiles in the board
  const tiles = tileContainer.getElementsByClassName("tile");

  for (let index = 0; index < tiles.length; index++) {
    const tile = tiles[index];
    // Get the tiles c number
    let cNumber = Number(getCNumber(tile));
    // Replace its c class with the c Number from the stored board state
    let newCNumber = importedBoard[Math.floor(index / width)][index % width];
    tile.classList.replace("c" + cNumber, "c" + newCNumber);
  }
}

// Sleeps for passed ms
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}