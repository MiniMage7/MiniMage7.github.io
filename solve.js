// Javascript intepretation of the Match 3 Solver
// Only usable through the website

// Arrays used for solving
const puzzleBoard = [];
const movesToSolve = [];
const storedBoards = [];

// Holds a value to color dictionary
var dict = {};
dict[1] = "Blue";
dict[2] = "Purple";
dict[3] = "Pink";
dict[4] = "Red";
dict[5] = "Orange";
dict[6] = "Yellow";
dict[7] = "Lime";
dict[8] = "Cyan";
dict[9] = "Teal";
dict[10] = "Brown";

// Function called from the website button to start the solve process
function startSolve() {
    // Change the cursor to show there is something happening
    document.body.style.cursor = "progress";
    // Also disable the solve button
    solveButton.disabled = "disabled";

    window.setTimeout(function() {
        setUpBoard();
        solve();

        // If this is reached, there was no solution found

        // Undo the cursor change
        document.body.style.cursor = "default";
        // Change the solve button to say no solution
        solveButton.textContent = "Impossible";
        noSolution = true;
    }, 100);
}

// Sets the puzzleBoard and movesToSolve arrays up pre-solve
function setUpBoard() {
    // Empty the board if it isn't already
    puzzleBoard.length = 0;
    // Empty the solution moves if it isn't already
    movesToSolve.length = 0;
    // Empty the stored board states if they aren't already
    storedBoards.length = 0;

    // Get all the tiles
    let tiles = tileContainer.getElementsByClassName("tile");

    // For each row in the grid
    for (let y = 0; y < height; y++) {
        // For each column in the grid
        const tempRowOfTiles = [];
        for (let x = 0; x < width; x++) {
            // Add that tile's c value to the row of tiles
            const tile = tiles[y * height + x];
            let cNumber = Number(getCNumber(tile));
            tempRowOfTiles.push(cNumber);
        }
        // Add the row of tiles to the puzzleBoard
        puzzleBoard.push(tempRowOfTiles);
    }
}

// Recursive function that solves the puzzle
function solve() {
    checkForWin();

    // For each row in the grid
    for (let y = 0; y < height; y++) {
        // For each column in the grid
        for (let x = 0; x < width; x++) {
            // If the tile is movable
            if (puzzleBoard[y][x] > 0) {
                // Check if the piece can be moved up or right
                // There is no need to check down or left as those would be
                // another piece's up or right respectively

                if (checkValidMove(y, x, y - 1, x)) { // Up
                    executeMove(y, x, y - 1, x);
                }
                if (checkValidMove(y, x, y, x + 1)) { // Right
                    executeMove(y, x, y, x + 1);
                }
            }
        }
    }
}

// Checks if a move is a valid move
// Input coordinates y1, x1 to be swapped with y2, x2
function checkValidMove(y1, x1, y2, x2) {
    // If the move is out of bounds
    if (y2 < 0 || x2 >= width) {
        return false;
    }

    // If the move is swapping with air or a blocker
    if (puzzleBoard[y2][x2] < 1) {
        return false;
    }

    // Swap the 2 spots on the puzzle board
    let tempValue = puzzleBoard[y1][x1];
    puzzleBoard[y1][x1] = puzzleBoard[y2][x2];
    puzzleBoard[y2][x2] = tempValue;

    // Check if the move results in any blocks being removed
    let isMoveValid = (checkIfBlocksRemoved(y1, x1) || checkIfBlocksRemoved(y2, x2));

    // Swap the pieces back
    tempValue = puzzleBoard[y1][x1];
    puzzleBoard[y1][x1] = puzzleBoard[y2][x2];
    puzzleBoard[y2][x2] = tempValue;

    return isMoveValid;
}

// Takes an x and y coordinate of the puzzle board
// Checks if that piece should be removed
function checkIfBlocksRemoved(y, x) {
    // If it matches with the 2 blocks above it
    if (y - 2 >= 0) {
        if (puzzleBoard[y - 2][x] == puzzleBoard[y - 1][x] && puzzleBoard[y - 1][x] == puzzleBoard[y][x]) {
            return true;
        }
    }
    // If it matches with 1 block above it and 1 below it
    if (y - 1 >= 0 && y + 1 < height) {
        if (puzzleBoard[y - 1][x] == puzzleBoard[y][x] && puzzleBoard[y][x] == puzzleBoard[y + 1][x]) {
            return true;
        }
    }
    // If it matches with the 2 blocks below it
    if (y + 2 < height) {
        if (puzzleBoard[y][x] == puzzleBoard[y + 1][x] && puzzleBoard[y + 1][x] == puzzleBoard[y + 2][x]) {
            return true;
        }
    }

    // If it matches with the 2 blocks to the left of it
    if (x - 2 >= 0) {
        if (puzzleBoard[y][x - 2] == puzzleBoard[y][x - 1] && puzzleBoard[y][x - 1] == puzzleBoard[y][x]) {
            return true;
        }
    }
    // If it matches with the block to the left and to the right of it
    if (x - 1 >= 0 && x + 1 < width) {
        if (puzzleBoard[y][x - 1] == puzzleBoard[y][x] && puzzleBoard[y][x] == puzzleBoard[y][x + 1]) {
            return true;
        }
    }
    // If it matches with the 2 blocks to the right of it
    if (x + 2 < width) {
        if (puzzleBoard[y][x] == puzzleBoard[y][x + 1] && puzzleBoard[y][x + 1] == puzzleBoard[y][x + 2]) {
            return true;
        }
    }

    // If none of the moves resulted in blocks being removed
    return false;
}

// Executes a given move on the board
// Input coordinates y1, x1 to be swapped with y2, x2
function executeMove(y1, x1, y2, x2) {
    // Add the move to the move list
    movesToSolve.push([[y1, x1, dict[puzzleBoard[y1][x1]]], [y2, x2, dict[puzzleBoard[y2][x2]]]]);
    // Save the current board state
    const oldBoardState = JSON.parse(JSON.stringify(puzzleBoard));
    // Add that board state to the saved boards
    storedBoards.push(oldBoardState);

    // Execute the move and recalculate the new puzzle board
    let tempValue = puzzleBoard[y1][x1];
    puzzleBoard[y1][x1] = puzzleBoard[y2][x2];
    puzzleBoard[y2][x2] = tempValue;
    recalculateBoard();

    // Attempt to do the next move
    solve();

    // If this line was reached, the move was inccorect, so revert to the old board state
    puzzleBoard.length = 0;
    for (let index = 0; index < height; index++) {
        puzzleBoard.push(oldBoardState[index]);
    }
    // And remove the move from the move list
    movesToSolve.pop();
    storedBoards.pop();
}

// Check if there are any pieces that need to be removed and removes them
// Then rearranges the board to account for pieces falling
// Recursively calls itself until no pieces move
function recalculateBoard() {
    // Get what blocks need to be removed
    const blocksToRemove = checkWhatBlocksToRemove();

    let isBlocksToRemove = false;
    // For each row in the grid
    for (let y = 0; y < height; y++) {
        // For each column in the grid
        for (let x = 0; x < width; x++) {
            // If the tile is to be removed
            if (blocksToRemove[y][x] == 1) {
                isBlocksToRemove = true;
            }
        }
    }

    // If there are blocks to remove
    if (isBlocksToRemove){
        // Remove the blocks
        removeGivenBlocks(blocksToRemove);
        // Make all the blocks fall down
        calculateGravity();
        // Restart this process
        recalculateBoard();
    }
}

// Iterates over the whole puzzle board and returns what blocks need to be removed
// Return: An 2d array of 0s and 1s where 1s represent the positions where blocks need to be removed
function checkWhatBlocksToRemove() {
    const blocksToRemove = [];

    // Fill blockToRemove with 0s
    // For each row in the grid
    for (let y = 0; y < height; y++) {
        // For each column in the grid
        const tempRowOfTiles = [];
        for (let x = 0; x < width; x++) {
            tempRowOfTiles.push(0);
        }
        blocksToRemove.push(tempRowOfTiles);
    }

    // For each row in the grid
    for (let y = 0; y < height; y++) {
        // For each column in the grid
        for (let x = 0; x < width; x++) {
            // If the piece is a removable piece
            if (puzzleBoard[y][x] > 0) {
                // We only have to check for these 2 because all the other circumstances will be checked
                // in another piece's 2 above or 2 to the right

                // Check if it can be matched with the 2 pieces above it
                if (y - 2 >= 0) {
                    if (puzzleBoard[y - 2][x] == puzzleBoard[y - 1][x] && puzzleBoard[y - 1][x] == puzzleBoard[y][x]) {
                        // Mark the pieces to be removed
                        blocksToRemove[y - 2][x] = 1;
                        blocksToRemove[y - 1][x] = 1;
                        blocksToRemove[y][x] = 1;
                    }
                }

                // Check if it can be matched with the 2 pieces to the right of it
                if (x + 2 < width) {
                    if (puzzleBoard[y][x] == puzzleBoard[y][x + 1] && puzzleBoard[y][x + 1] == puzzleBoard[y][x + 2]) {
                        // Mark the pieces to be removed
                        blocksToRemove[y][x] = 1;
                        blocksToRemove[y][x + 1] = 1;
                        blocksToRemove[y][x + 2] = 1;
                    }
                }
            }
        }
    }

    return blocksToRemove;
}

// Takes an array of 1's and 0's
// Removes all blocks from the puzzle board where the given array has a 1 in the same position
// Used with checkWhatBlocksToRemove()
function removeGivenBlocks(blocksToRemove) {
    // For each row in the grid
    for (let y = 0; y < height; y++) {
        // For each column in the grid
        for (let x = 0; x < width; x++) {
            // If the piece is marked to be removed
            if (blocksToRemove[y][x] == 1) {
                // Remove the piece
                puzzleBoard[y][x] = 0;
            }
        }
    }
}

// Makes all blocks that need to fall down in the puzzle board fall down
// Moves all blocks with air under them down 1
// Recursively calls itself until no blocks move
// Blockers (-1s) do not fall
function calculateGravity() {
    let didBlocksMove = false;

    // For each row in the grid (bottom to top skipping bottom most row)
    for (let y = height - 2; y >= 0; y--) {
        // For each column in the grid
        for (let x = 0; x < width; x++) {
            // If the piece is effected by gravity
            if (puzzleBoard[y][x] > 0) {
                // If there is air below it
                if (puzzleBoard[y + 1][x] == 0) {
                    // Move it down to that block
                    puzzleBoard[y + 1][x] = puzzleBoard[y][x];
                    puzzleBoard[y][x] = 0;
                    didBlocksMove = true;
                }
            }
        }
    }

    // If any blocks moved, check if any more gravity is needed
    if (didBlocksMove) {
        calculateGravity();
    }
}

// Check if the puzzle is solved and stopping the solve if it is
function checkForWin() {
    // For each row in the grid
    for (let y = 0; y < height; y++) {
        // For each column in the grid
        for (let x = 0; x < width; x++) {
            // If there is a tile, return
            if (puzzleBoard[y][x] > 0) {
                return;
            }
        }
    }

    // If this line is reached, the puzzle is solved

    // Add the empty board state to the stored boards
    storedBoards.push(JSON.parse(JSON.stringify(puzzleBoard)));

    // Enables solve mode if the board isn't empty
    if (movesToSolve.length != 0) {
        enableSolveMode();
    }

    // Remove the cursor change
    document.body.style.cursor = "default";
    // Enable the solve button again
    solveButton.removeAttribute("disabled");

    throw new Error("This is not an error. This is just to stop the solving process on success.");
}