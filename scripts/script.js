"use strict";
const page = {
    tiles: document.querySelectorAll('.tic-tac'),
    header: document.querySelector('h1'),
};
/* Model */
let playerMark = 'X';
let board = (() => {
    const _SIDE_LENGTH = 3;
    const _MAX_MOVES = 9;
    let _movesMade = 0;
    let _board = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];
    let _state = {
        empty: '',
        x: 'X',
        o: 'O'
    };
    const _numberToPosition = (index) => {
        return {
            row: Math.floor(index / _SIDE_LENGTH),
            col: index % _SIDE_LENGTH
        };
    };
    const _setState = (row, col, text) => {
        _board[row][col] = text;
    };
    // Every element in array matches the first element.
    const _isWinningRow = (arr) => {
        return String(arr) ==
            String(arr[0].repeat(_SIDE_LENGTH).split(''));
    };
    const _rowVictory = () => {
        for (let row of _board) {
            if (row.indexOf('') != -1) {
                continue;
            }
            if (_isWinningRow(row)) {
                return true;
            }
        }
        return false;
    };
    const _colVictory = () => {
        for (let col in _board) {
            let column = [];
            _board.forEach((row) => column.push(row[col]));
            if (_isWinningRow(column)) {
                return true;
            }
        }
        return false;
    };
    const _diagVictory = () => {
        let leftToRight = [];
        let rightToLeft = [];
        for (let i = 0; i < _SIDE_LENGTH; i++) {
            leftToRight.push(_board[i][i]);
            rightToLeft.push(_board[i][(_SIDE_LENGTH - 1) - i]);
        }
        if (leftToRight.indexOf('') != -1 &&
            rightToLeft.indexOf('') != -1) {
            return false;
        }
        return _isWinningRow(leftToRight) || _isWinningRow(rightToLeft);
    };
    const _victoryCheck = () => {
        return (_rowVictory() ||
            _colVictory() ||
            _diagVictory());
    };
    const changeTile = (index, playerChoice) => {
        if (_movesMade >= _MAX_MOVES) {
            page.header.textContent = "The Game is Over!";
            return '-';
        }
        _movesMade += 1;
        let { row, col } = _numberToPosition(index);
        let playerMark = _movesMade % 2 ? 'O' : 'X';
        _setState(row, col, playerMark);
        // TODO
        if (_victoryCheck()) {
            page.header.textContent = `${playerMark} is The Winner!`;
        }
        return playerMark;
    };
    return { changeTile };
})();
/* View */
const tileUsed = (button, mark) => {
    button.disable = true;
    button.textContent = mark;
};
/* Controller */
// Each button is clickable once.
page.tiles.forEach((tile, index) => {
    const makeMove = (e) => {
        playerMark = board.changeTile(index, playerMark);
        tileUsed(e.target, playerMark);
        e.target.removeEventListener('click', makeMove);
    };
    tile.addEventListener('click', makeMove);
});
