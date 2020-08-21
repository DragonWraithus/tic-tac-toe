const page = {
    tiles: <NodeListOf<HTMLInputElement>>document.querySelectorAll('.tic-tac')!,
    display: {
        header: document.querySelector('h1')!,
        startBtn: <HTMLInputElement>document.querySelector('#start-game')!,
        turn: document.querySelector('.players-turn')!,
    },
    player: {
        one: {
            set: document.querySelector('#set-p1')!,
            name: <HTMLInputElement>document.querySelector('#p1-name')!,
            mark: <HTMLInputElement>document.querySelector('#p1-mark')!,
            score: document.querySelector('#p1-score')!,
        },
        two: {
            set: document.querySelector('#set-p2')!,
            name: <HTMLInputElement>document.querySelector('#p2-name')!,
            mark: <HTMLInputElement>document.querySelector('#p2-mark')!,
            score: document.querySelector('#p2-score')!,
        },
    }
};


/* Model */

const Player = (_name: string, _mark: string) => {
    let _score = 0;
    const get = (() => {
        const name = () => _name;
        const mark = () => _mark;
        const score = () => _score;
        return {name, mark, score};
    })();

    const won = () => {
        _score += 1;
    }

    return {get, won};
}

let playerMark: string = 'X';

let board = (() => {
    const _SIDE_LENGTH = 3;

    let _board = [
        ['','',''], 
        ['','',''], 
        ['','','']
    ];

    const get = (() => {
        const board = () => {return _board;};
        const length = () => {return _SIDE_LENGTH;};
        return {board, length};
    })();

    const set = (() => {
        const tile = (row: number, col: number, player: any) => {
            _board[row][col] = player.get.mark();
        }

        const empty = () => {
            _board = [['','',''],['','',''],['','','']]
        }
        
        return {tile, empty};
    })();


    return {get, set};
})();


/* View */

const squarePlayed = (button: any, mark: string) => {
    button.disable = true;
    button.textContent = mark;
}

const cleanTiles = () => {
    page.tiles.forEach(t => {
        t.disabled = false;
        t.textContent = '';
    });
};
/*const cleanTiles = () => {
    page.tiles.forEach((tile: any) => {
        tile.textContent = ''; 
        tile.disabled = false;
    });
}*/

// BUG: Displayed Score Doesn't reset to zero when player changed.
const setPlayer = (e: any) => {
    if (e.target!.className == 'p1') {
        let player1 = Player(
            page.player.one.name.value,
            page.player.one.mark.value
        );
        displayController.set.player(player1, true);
    } else {
        let player2 = Player(
            page.player.two.name.value,
            page.player.two.mark.value
        );
        displayController.set.player(player2, false);
    }
}

/* Controller */


// TODO:
// Switch first players.
// Start/Reset Game.
// Block player change before new game.
// AI Min-max.
let displayController = (() => {
    const _players: any = {
        x: {}, 
        o: {}
    };
    const _MAX_MOVES = 9;
    let _movesMade = 0;
    let _gameStarted = false;
    let _gameWon = false;
    
    const set = (() => {
        const player = (person: Object, first: boolean) => {
            if (!_gameStarted) {
                _players[first?'x':'o'] = person;
            } else {
                page.display.header.textContent = 'Please restart to change players.';
            }
        }
        return {player};
    })();

    const _numberToPosition = (index: number) => {
        return {
            row: Math.floor(index / board.get.length()), 
            col: index % board.get.length()
        };
    }


     // Every element in array matches the first element.
    const _isWinningRow = (arr: Array<string>) => {
        if (arr.indexOf('') != -1) {
            return false;
        }
        // Properly deals with unicode.
        return (
            String(String(arr).split('').filter((e) => e != ',')) == 
            String(String(arr[0].repeat(3)).split(''))
        );
    }

    const _rowVictory = (board: Array<Array<string>>) => {
        for (let row of board) {
            if (row.indexOf('') != -1) {
                continue;
            }
            
            if (_isWinningRow(row)) {
                return true;
            }
        }
        return false;
    }

    const _colVictory = (board: Array<Array<string>>) => {
        for (let col in board) {
            let column: Array<string> = [];
            board.forEach((row) => column.push(row[col]));
            
            if (_isWinningRow(column)) {
                return true;
            }
        }
        return false;
    }

    const _diagVictory = (board: Array<Array<string>>) => {
        let leftToRight = [];
        let rightToLeft = [];
        for (let i = 0; i < board.length; i++) {
            leftToRight.push(board[i][i])
            rightToLeft.push(
                board[i][(board.length-1)-i]
            )
        }
        
        if (leftToRight.indexOf('') != -1 &&
            rightToLeft.indexOf('') != -1
        ){
            return false;
        }
        
        return _isWinningRow(leftToRight) || _isWinningRow(rightToLeft)
    }

    const _victoryCheck = (board: Array<Array<string>>) => {
        return (
            _rowVictory(board) ||
            _colVictory(board) ||
            _diagVictory(board)
        );
    };

    const changeTile = (index: number) => {
        _gameStarted = true;
        if (_movesMade >= _MAX_MOVES || _gameWon) {
            console.debug(_movesMade, _gameWon);
            return '-';
        }
        
        _movesMade += 1;
        
        let {row, col} = _numberToPosition(index);

        let player = _players[_movesMade % 2? 'o': 'x'];

        board.set.tile(row, col, player);

        if (_victoryCheck(board.get.board())) {
            _gameWon = true;
            page.display.header.textContent = "Game Over";
            page.display.turn.textContent = `${player.get.name()} is The Winner!`;
            player.won();
            page.player[_movesMade%2? 'two' : 'one']
                .score
                .textContent = 
                    `Score: ${player.get.score()}`;

            // BUG: Toggles off after displaying previous winner.
            page.display.turn.classList.toggle('hide');
        }
        
        if (_movesMade == _MAX_MOVES && !_gameWon) {
            page.display.header.textContent = "Cat's Eye!";            
        } 
        
        return player.get.mark();
    }

    const newGame = () => {
        page.display.header.textContent = 'New Game!'
        board.set.empty();
        cleanTiles();

        _movesMade = 0;
        _gameStarted = false;
        _gameWon = false;
    }

    return {set, changeTile, newGame};
})();

displayController.set.player(Player('Todd', 'TE'), true);
displayController.set.player(Player('Mark', 'O'), false);

// Each button is clickable once.
page.tiles.forEach((tile: HTMLInputElement, index) => {
    const makeMove = (e: Event | any) => {
        playerMark = displayController.changeTile(index);
        squarePlayed(e.target!, playerMark);
        tile.disabled = true;

        // e.target!.removeEventListener('click', makeMove);
    };
    tile.addEventListener('click', makeMove);
});

page.display.startBtn.addEventListener( 'click', () => {
    displayController.newGame();
});

page.player.one.set.addEventListener('click', setPlayer);
page.player.two.set.addEventListener('click', setPlayer);
