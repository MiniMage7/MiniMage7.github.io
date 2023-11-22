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

// Coordinates display
const coordinateDisplay = document.getElementById("coordinatesbox");

// Add clear button event
document.getElementById("clear").addEventListener("click", clearGrid);

// Add solve puzzle event
document.getElementById("solve").addEventListener("click", solveGrid);

// When the grid size boxes are update, adds or removes tiles as needed
function updateGridSize() {
  let oldWidth = width;
  let oldHeight = height;

  // Make sure the changed values are in acceptable ranges
  const maxSize = 15;
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
  let cNumber = Number(getCNumber(e.target));
  let newCNumber = cNumber;

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

// Get the coordinates of a tile in a graph
function getCoordinates(tile) {
  const parent = tile.parentNode;
  const siblings = parent.childNodes;
  for (index = 0; index < siblings.length; index++) {
    if (tile.isSameNode(siblings[index])) {
      index--;
      let y =  Math.floor(index / height);
      let x = index % height;
      return `${y},${x}`;
    }
  }
}

// If the mouse is down on a tile enter, treat it as a click
// Also update the coodinates in the coordinate display
function mouseEnterTile(e) {
  if (isMouseDown) {
    cChange(e);
  }
  coordinateDisplay.textContent = `Coordinates: ${getCoordinates(e.target)}`; //
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

// Starts the match3 solve in solve.js
function solveGrid(e) {
  startSolve();
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