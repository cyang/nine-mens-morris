import * as algorithm from './algorithm.js';
import {PURPLE_PLAYER, YELLOW_PLAYER, PURPLE_TURN, YELLOW_TURN} from './common.js';

// Structs
const TILE = {
    ISAVAILABLE: true,
    ISMILL: false,
    TURN: null
};

const STATES = {
    UNAVAILABLE: 0,
    AVAILABLE: 1,
    PURPLE: "P",
    YELLOW: "Y"
};

const MOVE = {
    ROW: null,
    COL: null,
    COLOR: null,
    BOARD: null,
    SHIFT: null,
    SHIFTROW: null,
    SHIFTCOL: null
};

const MATRIX_SIZE = 7;
const board = new Array(MATRIX_SIZE);

function init() {
    for (let i = 0; i < MATRIX_SIZE; i++) {
        board[i] = new Array(MATRIX_SIZE);
        for (let j = 0; j < 7; j++) {
            board[i][j] = {
                ISAVAILABLE: true,
                ISMILL: false,
                COLOR: null
            };
        }
    }


    board[0][1].ISAVAILABLE = false;
    board[0][2].ISAVAILABLE = false;
    board[0][4].ISAVAILABLE = false;
    board[0][5].ISAVAILABLE = false;

    board[1][0].ISAVAILABLE = false;
    board[1][2].ISAVAILABLE = false;
    board[1][4].ISAVAILABLE = false;
    board[1][6].ISAVAILABLE = false;

    board[2][0].ISAVAILABLE = false;
    board[2][1].ISAVAILABLE = false;
    board[2][5].ISAVAILABLE = false;
    board[2][6].ISAVAILABLE = false;

    board[3][3].ISAVAILABLE = false;

    board[6][1].ISAVAILABLE = false;
    board[6][2].ISAVAILABLE = false;
    board[6][4].ISAVAILABLE = false;
    board[6][5].ISAVAILABLE = false;

    board[5][0].ISAVAILABLE = false;
    board[5][2].ISAVAILABLE = false;
    board[5][4].ISAVAILABLE = false;
    board[5][6].ISAVAILABLE = false;

    board[4][0].ISAVAILABLE = false;
    board[4][1].ISAVAILABLE = false;
    board[4][5].ISAVAILABLE = false;
    board[4][6].ISAVAILABLE = false;
}

function coinFlip() {
    return Math.floor(Math.random() * 2);
}

const GAME_PROPERTIES = {
    TURN: null,
    CAPTURING: false,
    MILLS: 0
};

function checkLose() {
    if (PURPLE_PLAYER.PLACED < 3) return PURPLE_TURN;
    if (YELLOW_PLAYER.PLACED < 3) return YELLOW_TURN;
}

function startGame() {
    init();
    GAME_PROPERTIES.TURN = coinFlip();
    printBoard();
    console.log("Phase1");
    phase1();
    console.log("Phase2");
    phase2();
    if (checkLose() === PURPLE_TURN) {
        console.log("Yellow Wins");
    } else {
        console.log("Purple Wins");
    }
}

function printBoard() {
    let stringBoard = "";
    for (let i = 0; i < MATRIX_SIZE; i++) {
        for (let j = 0; j < 7; j++) {
            let tileState = board[i][j];
            let stringState = tileState.ISAVAILABLE ? STATES.AVAILABLE : STATES.UNAVAILABLE;
            if (tileState.COLOR !== null && tileState.COLOR !== undefined) {
                stringState = tileState.COLOR ? STATES.YELLOW : STATES.PURPLE;
            }
            stringBoard += stringState;
        }
        stringBoard += "\n";
    }
    console.log(stringBoard);
}

function placeSoldier(move) {
    if (algorithm.isValidMove(move)) {
        board[move.ROW][move.COL].COLOR = move.COLOR;
        if (move.COLOR === PURPLE_TURN) {
            PURPLE_PLAYER.AVAILABLE--;
            PURPLE_PLAYER.PLACED++;
        } else {
            YELLOW_PLAYER.AVAILABLE--;
            YELLOW_PLAYER.PLACED++;
        }
        return true;
    } else {
        console.log("Algorithm: Not a valid move.");
        return false;
    }
}

function removeSoldier(move) {
    // When removing, we remove the piece with that color
    let removingPiece = (move.COLOR === PURPLE_TURN) ? PURPLE_PLAYER : YELLOW_PLAYER;
    if (!algorithm.isRemovable(move)) {
        return false;
    }

    if (!board[move.ROW][move.COL].ISMILL) { // not a mill
        board[move.ROW][move.COL].COLOR = null;
        removingPiece.PLACED--;
        return true;
    } else { // is a mill
        if (removingPiece.PLACED - removingPiece.MILLPIECES === 0) { // Removing from mill is possible if only mills are left
            board[move.ROW][move.COL].COLOR = null;
            board[move.ROW][move.COL].ISMILL = false;
            removingPiece.PLACED--;
            removingPiece.MILLPIECES--;
            return true;
        }
        return false;
    }
}

function shiftSoldier(move) {
    if (algorithm.isValidShift(move)) {
        // reset state of current
        board[move.ROW][move.COL].COLOR = null;
        if (board[move.ROW][move.COL].ISMILL === true) {
            if (move.COLOR === PURPLE_TURN) {
                PURPLE_PLAYER.MILLPIECES--;
            } else {
                YELLOW_PLAYER.MILLPIECES--;
            }
            board[move.ROW][move.COL].ISMILL = false;
        }

        // update color of new
        board[move.SHIFTROW][move.SHIFTCOL].COLOR = move.COLOR;
        return true;
    }

    return false;
}

function handleNewMills(move) {
    let numMills = algorithm.countNewMills(move);
    while (numMills > 0) { // Made a mill
        printBoard();
        let message = "";
        if (GAME_PROPERTIES.TURN === YELLOW_TURN) {
            message = "Yellow: Enter a position to remove a purple piece in the form of row,col";
        } else {
            message = "Purple: Enter a position to remove a yellow piece in the form of row,col"
        }

        let removingPiece = (((GAME_PROPERTIES.TURN + 1) % 2) === PURPLE_TURN) ? PURPLE_PLAYER : YELLOW_PLAYER;
        if (removingPiece.PLACED - removingPiece.MILLPIECES === 0) { // Removing from mill is possible if only mills are left
            message += " that is a mill";
        } else {
            message += " that is not a mill";
        }

        let positions = prompt(message);
        positions = positions.split(",");
        move = {
            ROW: parseInt(positions[0], 10),
            COL: parseInt(positions[1], 10),
            COLOR: (GAME_PROPERTIES.TURN + 1) % 2,
            BOARD: board
        };
        if (removeSoldier(move)) {
            numMills--;
        } else {
            console.log("Invalid remove");
        }
    }
}

function phase1() {
    while (PURPLE_PLAYER.AVAILABLE > 0 || YELLOW_PLAYER.AVAILABLE > 0) {
        if (GAME_PROPERTIES.TURN === YELLOW_TURN) {
            var positions = prompt("Yellow: Enter a position to place the piece in the form of row,col");
        } else {
            var positions = prompt("Purple: Enter a position to place the piece in the form of row,col");
        }
        positions = positions.split(",");
        let move = {
            ROW: parseInt(positions[0], 10),
            COL: parseInt(positions[1], 10),
            COLOR: GAME_PROPERTIES.TURN,
            BOARD: board
        };

        if (placeSoldier(move)) {
            handleNewMills(move);
            GAME_PROPERTIES.TURN = (GAME_PROPERTIES.TURN + 1) % 2;
        } else {
            console.log("Invalid place");
        }

        printBoard();
    }
}

function phase2() {
    while (PURPLE_PLAYER.PLACED > 2 && YELLOW_PLAYER.PLACED > 2) {
        if (GAME_PROPERTIES.TURN === YELLOW_TURN) {
            var positions = prompt("Yellow: Select position of your piece in the form of row,col");
            var direction = prompt("Yellow: Enter 0(left), 1(right), 2(up), or 3(down)");
        } else {
            var positions = prompt("Purple: Select position of your piece in the form of row,col");
            var direction = prompt("Purple: Enter 0(left), 1(right), 2(up), or 3(down)");
        }
        positions = positions.split(",");

        // Set up move for shift
        let move = {
            ROW: parseInt(positions[0], 10),
            COL: parseInt(positions[1], 10),
            COLOR: GAME_PROPERTIES.TURN,
            BOARD: board,
            SHIFT: parseInt(direction, 10),
            SHIFTROW: null,
            SHIFTCOL: null
        };

        if (move.BOARD[move.ROW][move.COL].COLOR !== GAME_PROPERTIES.TURN) {
            // Not your color
            console.log("Invalid piece chosen");
            continue;
        }

        if (shiftSoldier(move)) {
            // Update row and col for handleNewMills
            move.ROW = move.SHIFTROW;
            move.COL = move.SHIFTCOL;
            handleNewMills(move);
            GAME_PROPERTIES.TURN = (GAME_PROPERTIES.TURN + 1) % 2;
        } else {
            console.log("Invalid shift");
        }

        printBoard();
    }
}

console.log("initializing game");

startGame();
