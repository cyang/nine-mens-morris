import {PURPLE_TURN, YELLOW_TURN} from './common.js';

const CENTER_POSITION = 3;

function countNewMills(move, gameProperties) {
    if (move.ROW === CENTER_POSITION) {
        if (move.COL < CENTER_POSITION) {
            return checkMill(move, 0, 2, true, gameProperties) +
                checkMill(move, 0, 6, false, gameProperties);
        } else {
            return checkMill(move, 4, 6, true, gameProperties) +
                checkMill(move, 0, 6, false, gameProperties);
        }
    }

    if (move.COL === CENTER_POSITION) {
        if (move.ROW < CENTER_POSITION) {
            return checkMill(move, 0, 6, true, gameProperties) +
                checkMill(move, 0, 2, false, gameProperties);
        } else {
            return checkMill(move, 0, 6, true, gameProperties) +
                checkMill(move, 4, 6, false, gameProperties);
        }
    }

    return checkMill(move, 0, 6, true, gameProperties) + checkMill(move, 0, 6, false, gameProperties);
}

function checkMill(move, start, end, checkRow, gameProperties) {
    let count = 0;
    for (let i = start; i <= end; i++) {
        let tileState = checkRow ? move.BOARD[move.ROW][i] : move.BOARD[i][move.COL];
        if (tileState.ISAVAILABLE === true && tileState.TURN === move.TURN) {
            count += 1;
        }
    }
    if (count === 3) {
        // change ISMILL to true
        for (let i = start; i <= end; i++) {
            let tileState = checkRow ? move.BOARD[move.ROW][i] : move.BOARD[i][move.COL];
            if (tileState.ISAVAILABLE === true && tileState.ISMILL === false) {
                tileState.ISMILL = true;
                if (move.TURN === YELLOW_TURN) {
                    gameProperties.YELLOW_PLAYER.MILLPIECES += 1;
                } else if (move.TURN === PURPLE_TURN) {
                    gameProperties.PURPLE_PLAYER.MILLPIECES += 1;
                }
            }
        }
        return 1;
    } else {
        return 0;
    }
}

function isValidMove(move) {
    let tileState = move.BOARD[move.ROW][move.COL];
    return (tileState.ISAVAILABLE && tileState.TURN === null);
}

function isRemovable(move, otherTurn) {
    // Is not part of a mill and has a piece
    let tileState = move.BOARD[move.ROW][move.COL];
    return (tileState.ISAVAILABLE && tileState.TURN === otherTurn);
}

/**
 Phase 2 Functions
 **/
const SHIFT = {
    LEFT: 0,
    RIGHT: 1,
    UP: 2,
    DOWN: 3
};

function isValidShift(move) {
    let i = move.ROW;
    let j = move.COL;
    let t1 = 0;
    let t2 = 0;
    let rowBounds = [0, 6];
    let colBounds = [0, 6];

    // Make sure that there is a piece to move
    if (!move.BOARD[move.ROW][move.COL].ISAVAILABLE) {
        console.log("1");
        return false;
    }

    // Translation for shift
    switch (move.SHIFT) {
        case SHIFT.LEFT:
            t2 = -1;
            break;
        case SHIFT.RIGHT:
            t2 = 1;
            break;
        case SHIFT.UP:
            t1 = -1;
            break;
        case SHIFT.DOWN:
            t1 = 1;
            break;
        default:
            console.log("2");
            return false;
    }

    // Special cases for center row/column
    if (move.ROW === CENTER_POSITION) {
        if (move.COL < CENTER_POSITION) {
            colBounds[1] = CENTER_POSITION;
        } else {
            colBounds[0] = CENTER_POSITION;
        }
    }

    if (move.COL === CENTER_POSITION) {
        if (move.ROW < CENTER_POSITION) {
            rowBounds[1] = CENTER_POSITION;
        } else {
            rowBounds[0] = CENTER_POSITION;
        }
    }

    while (true) { // Continue moving in a direction
        i += t1;
        j += t2;

        if (i < rowBounds[0] || i > rowBounds[1] || j < colBounds[0] || j > colBounds[1]) { // Out of bounds
            console.log("3");
            return false;
        }

        if (move.BOARD[i][j].ISAVAILABLE) {
            if (move.BOARD[i][j].TURN === null) { // No piece there, we can shift
                move.SHIFTROW = i;
                move.SHIFTCOL = j;
                return true;
            } else {
                console.log(move);
                console.log("4");
                return false;
            }
        }
    }
}

export {countNewMills, isValidMove, isRemovable, isValidShift, CENTER_POSITION};

