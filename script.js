const nameForm = document.getElementsByTagName("form")[0];
const nameInput = document.getElementById("name");
const board = document.getElementById("board");
const resetButton = document.getElementById("reset");
const rows = 10; // Number of rows
const cols = 10; // Number of columns
let playerNum = 1;
let totalPlayers = 1; // Default to 1 player, can be updated to up to 4 players
let selectedMonster = null; // Track the selected monster for movement
let gameStart = false; // verify if everything is ready for start game
isGameOver = false;
const monstersRemoved = {1: 0, 2: 0, 3: 0, 4: 0}
let activePlayers = [] // Active Players on the board
nameForm.getElementsByTagName("input")[0].disabled = true;
nameForm.getElementsByTagName("button")[0].disabled = true;
  
// Colors for each player
const playerColors = {
    1: "#c42205ce",  // Player 1 
    2: "#286ca3d2",  // Player 2
    3: "#0e610ed8",  // Player 3
    4: "#968007da"   // Player 4
}
  
// Colors to highlight player zones (lighter version)
const playerZoneColors = {
    1: "rgba(255, 99, 71, 0.3)",
    2: "rgba(70, 130, 180, 0.3)",
    3: "rgba(50, 205, 50, 0.3)", 
    4: "rgba(255, 215, 0, 0.3)"
}

resetButton.addEventListener("click", (event) => {
  const hexes = document.querySelectorAll(".hexagon");
  hexes.forEach(hex => {
    hex.innerText = "";
    hex.classList.remove("placed", "highlight");
    hex.removeAttribute("data-player");
    hex.style.backgroundColor = "";
  })
  isGameOver = false;
  selectedMonster = null;
  playerNum = 1;
  activePlayers = [1, 2, 3, 4];
  for (let i = 1; i <= 4; i++) {
    monstersRemoved[i] = 0;
  }
  gameStart = true; // Keep the game running
  updateMonsterCounters(); // Update User Interface
  updateTurnDisplay();
  highlightPlayerZone(playerNum);
  alert("The board has been reset. Players can restart the game.");
})

// Check for elimination and victory
function checkEliminationAndVictory() {
  if (activePlayers.length === 1) {
    alert(`Player ${activePlayers[0]} wins the game!`);
    isGameOver = true;
    resetButton.style.display = "block";
  }
}

// Update the left panel counters
function updateMonsterCounters() {
  for (let i = 1; i <= 4; i++) {
    const counterElement = document.querySelector(`#player-${i}-monsters`);
    if (counterElement) {
      counterElement.innerText = `Monsters Down: ${monstersRemoved[i]}`;
    }
  }
}

function removeMonster(hex) {
  const player = parseInt(hex.getAttribute("data-player"));
  if (!player || !activePlayers.includes(player)) return;
  monstersRemoved[player]++;
  updateMonsterCounters();
  if (monstersRemoved[player] >= 10) {
    activePlayers = activePlayers.filter(p => p !== player);
    alert(`Player ${player} has been eliminated!`);
  }
  hex.innerText = "";
  hex.classList.remove("placed"); // hexagon is empty
  hex.removeAttribute("data-player"); // player attribute empty
  hex.style.backgroundColor = ""; // color reset
}

function resolveBattle(type1, type2) {
  const battleRules = {
    v: "w", // Vampire beats Werewolf
    w: "g", // Werewolf beats Ghost
    g: "v"  // Ghost beats Vampire
  };
  if (type1 === type2) {
    return "draw"; // both are removed
  } else if (battleRules[type1] === type2) {
    return "win"; // type1 beats type2
  } else {
    return "lose"; // type2 beats type1
  }
}

function clearZoneHighlights() {
  document.querySelectorAll(".hexagon").forEach((hex) => {
    if (!hex.classList.contains("placed")) {
      hex.style.backgroundColor = "";
    }
  });
}

function clearHighlights() {
  document.querySelectorAll(".highlight").forEach(cell => {
    cell.classList.remove("highlight");
  })
}

function endTurn() {
  checkEliminationAndVictory(); // Checking for monster removal and victory
  playerNum = (playerNum % totalPlayers) + 1;
  while (!activePlayers.includes(playerNum)) {
      playerNum = (playerNum % totalPlayers) + 1;
  }
  selectedMonster = null; // Reset selected monster at the end of the turn
  clearHighlights(); // Clear the highlighted moves
  clearZoneHighlights(); // Clear the zone highlights
  updateTurnDisplay();
  highlightPlayerZone(playerNum);
}

// Function to place a monster on the board
function placeMonster(hex, monster) {
  hex.innerText = monster;
  hex.classList.add("placed");
  hex.setAttribute("data-player", playerNum);
  hex.style.backgroundColor = playerColors[playerNum]; // Set strong color based on num player
  endTurn();
}

function finalizeMove(targetHex) {
  const { hex, type } = selectedMonster;
  hex.innerText = "";
  hex.classList.remove("placed");
  hex.removeAttribute("data-player");
  // place monster in a new hexagon
  targetHex.innerText = type;
  targetHex.classList.add("placed");
  targetHex.setAttribute("data-player", playerNum);
  targetHex.style.backgroundColor = playerColors[playerNum];
  selectedMonster = null; // cleans selection
  clearHighlights();
  endTurn(); // turn ends
}

function moveMonster(targetHex, targetRow, targetCol) {
  const { hex, type } = selectedMonster;
  if (targetHex.classList.contains("placed")) {
    // verify if monster belongs to same player
    const defenderPlayer = parseInt(targetHex.getAttribute("data-player"));
    if (defenderPlayer === playerNum) {
      alert("Come on you can't kill your own monsters!");
      return; // can't strike
    }
    // if hexagon is busy by other player, they will battle
    const defenderType = targetHex.innerText.toLowerCase(); // monster type on hexagon
    const battleResult = resolveBattle(type, defenderType); // define the battle
    if (battleResult === "win") {
      // current player wins: remove others player monster
      removeMonster(targetHex);
      finalizeMove(targetHex, targetRow, targetCol);
    } else if (battleResult === "lose") {
      // competition wins: remove player monster
      removeMonster(hex);
      selectedMonster = null; // cleans selection
      clearHighlights();
      endTurn();
    } else if (battleResult === "draw") {
      // both defeated
      removeMonster(targetHex);
      removeMonster(hex);
      selectedMonster = null;
      clearHighlights();
      endTurn();
    }
    return;
  }
  // if hexagon isnt busy just move in
  finalizeMove(targetHex, targetRow, targetCol);
}

function highlightMoves(row, col) {
  clearHighlights(); // clean previous highlights
  const possibleMoves = getPossibleMoves(row, col); // get corrected moves
  possibleMoves.forEach(([r, c]) => {
    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    if (cell) {
      cell.classList.add("highlight");
    }
  })
}

// validate the move
function canMoveTo(row, col) {
  const targetCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  if (!targetCell) return false;
  if (targetCell.classList.contains("placed")) {
    const targetPlayer = parseInt(targetCell.getAttribute("data-player"));
    return targetPlayer === playerNum; // can pass by own monsters
  }
  return true; // empty hexagon
}

function checkValidMove(startRow, startCol, targetRow, targetCol) {
  const possibleMoves = getPossibleMoves(startRow, startCol);
  // allow moves to valid hexagons even if theyre busy
  return possibleMoves.some(([r, c]) => r === targetRow && c === targetCol);
}

function getDiagonalMoves(row, col) {
  // I hard coded all diagoinal. couldn't get them placed right otherwise
  const diagonals = [
// Diagonal 1
[[1, 0], [0, 0], [1, 1], [2, 1], [3, 2], [4, 2], [5, 3], [6, 3], [7, 4], [8, 4], [9, 5]],
// Diagonal 2
[[3, 0], [2, 0], [1, 1], [0, 1], [1, 2], [2, 2], [3, 3], [4, 3], [5, 4], [6, 4], [7, 5], [8, 5], [9, 6]],
// Diagonal 3
[[5, 0], [4, 0], [3, 1], [2, 1], [1, 2], [0, 2], [1, 3], [2, 3], [3, 4], [4, 4], [5, 5], [6, 5], [7, 6], [8, 6], [9, 7]],
// Diagonal 4
[[7, 0], [6, 0], [5, 1], [4, 1], [3, 2], [2, 2], [1, 3], [0, 3], [1, 4], [2, 4], [3, 5], [4, 5], [5, 6], [6, 6], [7, 7], [8, 7], [9, 8]],
// Diagonal 5
[[9, 0], [8, 0], [7, 1], [6, 1], [5, 2], [4, 2], [3, 3], [2, 3], [1, 4], [0, 4], [1, 5], [2, 5], [3, 6], [4, 6], [5, 7], [6, 7], [7, 8], [8, 8], [9, 9]],
// Diagonal 6
[[0, 9], [1, 9], [2, 8], [3, 8], [4, 7], [5, 7], [6, 6], [7, 6], [8, 5], [9, 5]],
// Diagonal 7
[[2, 9], [1, 9], [0, 8], [1, 8], [2, 7], [3, 7], [4, 6], [5, 6], [6, 5], [7, 5], [8, 4], [9, 4]],
// Diagonal 8
[[4, 9], [3, 9], [2, 8], [1, 8], [0, 7], [1, 7], [2, 6], [3, 6], [4, 5], [5, 5], [6, 4], [7, 4], [8, 3], [9, 3]],
// Diagonal 9
[[6, 9], [5, 9], [4, 8], [3, 8], [2, 7], [1, 7], [0, 6], [1, 6], [2, 5], [3, 5], [4, 4], [5, 4], [6, 3], [7, 3], [8, 2], [9, 2]],
// Diagonal 10
[[8, 9], [7, 9], [6, 8], [5, 8], [4, 7], [3, 7], [2, 6], [1, 6], [0, 5], [1, 5], [2, 4], [3, 4], [4, 3], [5, 3], [6, 2], [7, 2], [8, 1], [9, 1]],
// Diagonal 11
[[9, 9], [8, 8], [7, 8], [6, 7], [5, 7], [4, 6], [3, 6], [2, 5], [1, 5], [0, 4], [1, 4], [2, 3], [3, 3], [4, 2], [5, 2], [6, 1], [7, 1], [8, 0], [9, 0]],
// Diagonal 12
[[0, 0], [1, 1], [2, 1], [3, 2], [4, 2], [5, 3], [6, 3], [7, 4], [8, 4], [9, 5], [8, 5], [7, 6], [6, 6], [5, 7], [4, 7], [3, 8], [2, 8], [1, 9], [0, 9]],
// Diagonal 13
[[1, 0], [0, 0], [2, 0], [3, 1], [4, 1], [5, 2], [6, 2], [7, 3], [8, 3], [9, 4], [8, 4], [7, 5], [6, 5], [5, 6], [4, 6], [3, 7], [2, 7], [1, 8], [0, 8]],
// Diagonal 14
[[0, 1], [1, 1], [2, 0], [3, 0], [4, 0], [5, 1], [6, 1], [7, 2], [8, 2], [9, 3], [8, 3], [7, 4], [6, 4], [5, 5], [4, 5], [3, 6], [2, 6], [1, 7], [0, 7]],
// Diagonal 15
[[5, 0], [6, 0], [7, 1], [8, 1], [9, 2], [8, 2], [7, 3], [6, 3], [5, 4], [4, 4], [3, 5], [2, 5], [1, 6], [0, 6]],
// Diagonal 16
[[7, 0], [8, 0], [9, 1], [8, 1], [7, 2], [6, 2], [5, 3], [4, 3], [3, 4], [2, 4], [1, 5], [0, 5]],
// Diagonal 17
[[9, 0], [8, 0], [7, 1], [6, 1], [5, 2], [4, 2], [3, 3], [2, 3], [1, 4], [0, 4]],
// Diagonal 18
[[8, 9], [9, 9], [8, 8], [7, 8], [6, 7], [5, 7], [4, 6], [3, 6], [2, 5], [1, 5], [0, 4]],
// Diagonal 19
[[6, 9], [7, 9], [8, 8], [9, 8], [8, 7], [7, 7], [6, 6], [5, 6], [4, 5], [3, 5], [2, 4], [1, 4], [0, 3]],
// Diagonal 20
[[4, 9], [5, 9], [6, 8], [7, 8], [8, 7], [9, 7], [8, 6], [7, 6], [6, 5], [5, 5], [4, 4], [3, 4], [2, 3], [1, 3], [0, 2]],
// Diagonal 21
[[2, 9], [3, 9], [4, 8], [5, 8], [6, 7], [7, 7], [8, 6], [9, 6], [8, 5], [7, 5], [6, 4], [5, 4], [4, 3], [3, 3], [2, 2], [1, 2], [0, 1]]
]
  // get all diagonals moves (row, col)
  const diagonalMoves = [];
  diagonals.forEach(diagonal => {
    const index = diagonal.findIndex(([r, c]) => r === row && c === col);
    if (index !== -1) {
      // max 2 moves to each direction
      const movesForward = diagonal.slice(index + 1, index + 3);
      const movesBackward = diagonal.slice(Math.max(0, index - 2), index);
      diagonalMoves.push(...movesForward, ...movesBackward);
    }
  });
  return diagonalMoves;
}

function getPossibleMoves(row, col) {
  const moves = [];
  // Vertical movement
  for (let i = 0; i < rows; i++) {
    if (i !== row) {
      const isAligned = (row % 2 === 0 && i % 2 === 0) || (row % 2 !== 0 && i % 2 !== 0);
      if (isAligned) {
        const targetCell = document.querySelector(`[data-row="${i}"][data-col="${col}"]`);
        if (!targetCell) continue; 
        if (targetCell.classList.contains("placed")) {
          const targetPlayer = parseInt(targetCell.getAttribute("data-player"));
          if (targetPlayer === playerNum) {
            moves.push([i, col]); // can pass by own monsters
          } else {
            moves.push([i, col]); // allow to get in enemy hexagon
            break; // dont allow to pass by enemy hexagon
          }
        } 
        else {
          moves.push([i, col]); // empty hexagon
        }
      }
    }
  }
  // Horizontal movement (to the right)
  for (let j = col + 1; j < cols; j++) {
    const targetCell = document.querySelector(`[data-row="${row}"][data-col="${j}"]`);
    if (!targetCell) continue;
    if (targetCell.classList.contains("placed")) {
      const targetPlayer = parseInt(targetCell.getAttribute("data-player"));
      if (targetPlayer === playerNum) {
        moves.push([row, j]);
      } else {
        moves.push([row, j]);
        break;
      }
    } else {
      moves.push([row, j]);
    }
  }
  // Horizontal movement (to the left)
  for (let j = col - 1; j >= 0; j--) {
    const targetCell = document.querySelector(`[data-row="${row}"][data-col="${j}"]`);
    if (!targetCell) continue;
    if (targetCell.classList.contains("placed")) {
      const targetPlayer = parseInt(targetCell.getAttribute("data-player"));
      if (targetPlayer === playerNum) {
        moves.push([row, j]);
      } else {
        moves.push([row, j]);
        break;
      }
    } else {
      moves.push([row, j]);
    }
  }
  const diagonalMoves = getDiagonalMoves(row, col);
  moves.push(...diagonalMoves);
  return moves;
}

function SelectMonster(hex) {
  if (!gameStart) {return} // block board
  const targetRow = parseInt(hex.getAttribute("data-row"));
  const targetCol = parseInt(hex.getAttribute("data-col"));
  // Deselect the selected monster if clicked again
  if (selectedMonster && selectedMonster.hex === hex) {
    selectedMonster = null; // Clear the selection
    clearHighlights(); // Remove highlights for possible moves
    return; // Exit the function
  }
  // If a monster is selected, try to move it
  if (selectedMonster) {
    const isValidMove = checkValidMove(selectedMonster.row, selectedMonster.col, targetRow, targetCol);
    if (isValidMove) {
      moveMonster(hex, targetRow, targetCol); // Move or resolve battle
    } else {
      alert("Invalid move. Try a valid move!");
    }
    return; // Exit after attempting to move
  }
  // If no monster is selected, allow selecting a monster to move
  if (hex.classList.contains("placed")) {
    const hexPlayer = parseInt(hex.getAttribute("data-player"));
    if (hexPlayer === playerNum) {
      selectedMonster = { hex, row: targetRow, col: targetCol, type: hex.innerText.toLowerCase() };
      highlightMoves(targetRow, targetCol); // Highlight possible moves
    } else {
      alert("Is that your monster?");
    }
  } else {
    // Allow placing a new monster if the hexagon is empty
    if (playerZone(targetRow, targetCol)) {
      let monster = prompt("Pick your monster (V/W/G):").toLowerCase();
      if (!["v", "w", "g"].includes(monster)) {
        alert("Invalid Monster! Type either V, W or G.");
        return;
      }
      placeMonster(hex, monster);
    } else {
      alert("Get yourself a designed spot");
    }
  }
}

// Function to highlight the num player's zone
function highlightPlayerZone(player) {
  document.querySelectorAll(".hexagon").forEach((hex) => {
    const row = parseInt(hex.getAttribute("data-row"));
    const col = parseInt(hex.getAttribute("data-col"));
    if (playerZone(row, col, player) && !hex.classList.contains("placed")) {
      hex.style.backgroundColor = playerZoneColors[player];
    }
  });
}

function playerZone(row, col, player = playerNum) {
  // Handle shared corner ownership
  if (row === 0 && col === 0) {
    return player === 1 || player === 3; // Top-left shared by Player 1 and Player 3
  }
  if (row === 0 && col === cols - 1) {
    return player === 1 || player === 4; // Top-right shared by Player 1 and Player 4
  }
  if (row === rows - 1 && col === cols - 1) {
    return player === 2 || player === 4; // Bottom-right shared by Player 2 and Player 4
  }
  if (row === rows - 1 && col === 0) {
    return player === 2 || player === 3; // Bottom-left shared by Player 2 and Player 3
  }
  // Default zone logic for other tiles
  if (player === 1 && row === 0) return true; // Player 1: Top row
  if (player === 2 && row === rows - 1) return true; // Player 2: Bottom row
  if (player === 3 && col === 0) return true; // Player 3: Left column
  if (player === 4 && col === cols - 1) return true; // Player 4: Right column
  return false; // All other cells are invalid for placement
}

function createBoard() {
  board.innerHTML = ""; // Clean board
  for (let row = 0; row < rows; row++) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row");
    for (let col = 0; col < cols; col++) {
      const hex = document.createElement("div");
      hex.classList.add("hexagon");
      hex.setAttribute("data-row", row);
      hex.setAttribute("data-col", col);      
      if (row === 0 && col === 0) {
        for (let player = 1; player <= 4; player++) {
          if (playerZone(row, col, player)) {
            hex.style.backgroundColor = playerZoneColors[player];
            break; // get out the loop
          }
        }
      }     
      // listener for click on hexagon
      hex.addEventListener("click", () => SelectMonster(hex));
      rowDiv.appendChild(hex);
    }
    board.appendChild(rowDiv);
  }
}

function updateTurnDisplay() {
  const playerNumIndicator = document.getElementById('num-player-indicator');
  if (playerNumIndicator) {
    playerNumIndicator.innerText = (`Player ${playerNum}'s turn`);
  }
} 

function startGame() {
  totalPlayers = parseInt(prompt("Enter the number of players (1-4):"));
  if (isNaN(totalPlayers) || totalPlayers < 1 || totalPlayers > 4) {
    alert("Please enter a valid number of players between 1 and 4.");
    return;
  }
  // array for set up active players
  activePlayers = Array.from({ length: totalPlayers }, (_, i) => i + 1);
  playerNum = 1; // start by player 1
  updateTurnDisplay();
  nameForm.getElementsByTagName("input")[0].disabled = false;
  nameForm.getElementsByTagName("button")[0].disabled = false;
  nameInput.placeholder = `Enter name for Player ${playerNum}`;
  document.getElementById("start-button").disabled = true; // Disable start button
  createBoard();
  highlightPlayerZone(playerNum);
  gameStart = false;
}

// Start and End Turn button event listeners
document.getElementById("start-button").addEventListener("click", startGame);

// Event Listeners and Game Start
nameForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const playerName = nameInput.value;
  if (!playerName) {
    alert("Player name cannot be empty.");
    return;
  }
  const playerNameDisplay = document.getElementById(`player-${playerNum}-name`);
  playerNameDisplay.innerText = playerNameDisplay.innerText + playerName;
  nameInput.value = "";
  if (playerNum === totalPlayers) {
    nameForm.getElementsByTagName("input")[0].disabled = true;
    nameForm.getElementsByTagName("button")[0].disabled = true;
    playerNum = 1;
    highlightPlayerZone(playerNum); // player 1 zone
    gameStart = true;
  } else {
    playerNum += 1; // name next player
    nameInput.placeholder = (`Enter name for Player ${playerNum}`);
  }
})