"use strict";
const page = {
    tiles: document.querySelectorAll('.tic-tac'),
    display: {
        header: document.querySelector('h1'),
        turn: document.querySelector('.players-turn'),
    },
    player: {
        one: {
            set: document.querySelector('#set-p1'),
            name: document.querySelector('#p1-name'),
            mark: document.querySelector('#p1-mark'),
            score: document.querySelector('#p1-score'),
        },
        two: {
            set: document.querySelector('#set-p2'),
            name: document.querySelector('#p2-name'),
            mark: document.querySelector('#p2-mark'),
            score: document.querySelector('#p2-score'),
        },
    }
};
/* Model */
const Player = (_name, _mark) => {
    let _score = 0;
    const get = (() => {
        const name = () => _name;
        const mark = () => _mark;
        const score = () => _score;
        return { name, mark, score };
    })();
    const won = () => {
        _score += 1;
    };
    return { get, won };
};
let playerMark = 'X';
let board = (() => {
    const _SIDE_LENGTH = 3;
    let _board = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];
    const get = (() => {
        const board = () => { return _board; };
        const length = () => { return _SIDE_LENGTH; };
        return { board, length };
    })();
    const set = (() => {
        const tile = (row, col, player) => {
            _board[row][col] = player.get.mark();
        };
        return { tile };
    })();
    return { get, set };
})();
/* View */
const squarePlayed = (button, mark) => {
    button.disable = true;
    button.textContent = mark;
};
// BUGS: 
// Player1's name is always the winner.
// Player2's mark is the only one played.
const setPlayer = (e) => {
    if (e.target.className == 'p1') {
        let player1 = Player(page.player.one.name.value, page.player.one.mark.value);
        displayController.set.player(player1, true);
    }
    else {
        let player2 = Player(page.player.two.name.value, page.player.two.mark.value);
        displayController.set.player(player2, false);
    }
};
/* Controller */
// TODO:
// Switch first players.
// Make emojis work.
// Start/Reset Game.
// Block player change before new game.
// AI Min-max.
let displayController = (() => {
    const _players = {
        x: {},
        o: {}
    };
    const _MAX_MOVES = 9;
    let _movesMade = 0;
    let gameWon = false;
    const set = (() => {
        const player = (person, first) => {
            _players[first ? 'x' : 'o'] = person;
        };
        return { player };
    })();
    const _numberToPosition = (index) => {
        return {
            row: Math.floor(index / board.get.length()),
            col: index % board.get.length()
        };
    };
    // Every element in array matches the first element.
    const _isWinningRow = (arr) => {
        if (arr.indexOf('') != -1) {
            return false;
        }
        // Properly deals with unicode.
        return (String(String(arr).split('').filter((e) => e != ',')) ==
            String(String(arr[0].repeat(3)).split('')));
    };
    const _rowVictory = (board) => {
        for (let row of board) {
            if (row.indexOf('') != -1) {
                continue;
            }
            if (_isWinningRow(row)) {
                return true;
            }
        }
        return false;
    };
    const _colVictory = (board) => {
        for (let col in board) {
            let column = [];
            board.forEach((row) => column.push(row[col]));
            if (_isWinningRow(column)) {
                return true;
            }
        }
        return false;
    };
    const _diagVictory = (board) => {
        let leftToRight = [];
        let rightToLeft = [];
        for (let i = 0; i < board.length; i++) {
            leftToRight.push(board[i][i]);
            rightToLeft.push(board[i][(board.length - 1) - i]);
        }
        if (leftToRight.indexOf('') != -1 &&
            rightToLeft.indexOf('') != -1) {
            return false;
        }
        return _isWinningRow(leftToRight) || _isWinningRow(rightToLeft);
    };
    const _victoryCheck = (board) => {
        return (_rowVictory(board) ||
            _colVictory(board) ||
            _diagVictory(board));
    };
    const changeTile = (index) => {
        if (_movesMade >= _MAX_MOVES || gameWon) {
            return '-';
        }
        _movesMade += 1;
        let { row, col } = _numberToPosition(index);
        let player = _players[_movesMade % 2 ? 'o' : 'x'];
        board.set.tile(row, col, player);
        // TODO
        if (_victoryCheck(board.get.board())) {
            gameWon = true;
            page.display.header.textContent = "Game Over";
            page.display.turn.textContent = `${player.get.name()} is The Winner!`;
            page.display.turn.classList.toggle('hide');
        }
        if (_movesMade == _MAX_MOVES && !gameWon) {
            page.display.header.textContent = "Cat's Eye!";
        }
        return player.get.mark();
    };
    return { set, changeTile };
})();
displayController.set.player(Player('Todd', 'TE'), true);
displayController.set.player(Player('Mark', 'O'), false);
// Each button is clickable once.
page.tiles.forEach((tile, index) => {
    const makeMove = (e) => {
        playerMark = displayController.changeTile(index);
        squarePlayed(e.target, playerMark);
        e.target.removeEventListener('click', makeMove);
    };
    tile.addEventListener('click', makeMove);
});
page.player.one.set.addEventListener('click', setPlayer);
page.player.two.set.addEventListener('click', setPlayer);
