/* BUGS:
 * New Game/Restart requires double click before accepting Set Player.
 * Mark: not changed with Set Player.
 * AI chooses cat's eye over victory. 
 * Displayed Score doesn't reset to zero when player changed.
 */

 /* Features:
  * Make AI a player instead of a Button. 
  */

const page = {
    tiles: <NodeListOf<HTMLInputElement>>document.querySelectorAll('.tic-tac')!,
    display: {
        header: document.querySelector('.title')!,
        startBtn: <HTMLInputElement>document.querySelector('#start-game')!,
        turn: document.querySelector('.players-turn')!,
        aiBtn: document.querySelector('.best-move')!,
        player: {
            one: {
                name: document.querySelector('#p1-set-name')!,
                score: document.querySelector('#p1-score')!,
            },
            two: {
                name: document.querySelector('#p2-set-name')!,
                score: document.querySelector('#p2-score')!,
            }
        }
    },
    player: {
        // remove score to page.display.one.score.
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
    },
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


let board = (() => {
    const _SIDE_LENGTH = 3;

    let _board = [
        ['','',''], 
        ['','',''], 
        ['','','']
    ];

    const indexToCoord = (index: number) => {
        return {
            row: Math.floor(index / board.get.length()), 
            col: index % board.get.length()
        };
    }

    const check = (() => {
        // If every element in array matches the first element, return true.
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

        const victory = () => {
            return (
                _rowVictory(_board) ||
                    _colVictory(_board) ||
                    _diagVictory(_board)
            );
        };
        const victoryCheck = (board: Array<Array<string>>) => {
            return (
                _rowVictory(board) ||
                    _colVictory(board) ||
                    _diagVictory(board)
            );
        };
        return {victoryCheck, victory};
    })();

    const get = (() => {
        const board = () => {return _board;};
        const length = () => {return _SIDE_LENGTH;};
        const _unmadeMoves = () => {
            let movesLeft: Array<number> = [];
            // collect unmade moves.
            let absIdx = -1;
            _board.map((i) => {
                i.map((n) => {
                    absIdx += 1;
                    if (n === '') movesLeft.push(absIdx);
                })
            });
            return movesLeft;
        };

        // Prefers blocking to winning. 
        const best = () => {
            let _moves = _unmadeMoves();
            if (_moves.length == 0) {
                return [4,4];
            }

            let _player = displayController.get.player('current');
            let _nextPlayer = displayController.get.player('next');

            // iterate own victoryCheck if victory, return move.
            for (let tileIdx of _moves) {
                let {row,col} = indexToCoord(tileIdx);
                _board[row][col] = _player.get.mark();
                if (check.victory()) {
                    _board[row][col] = '';
                    return [row, col];
                }
                _board[row][col] = '';
                // Do the stuff. 
            }

            // iterate enemy victoryCheck, if victory, return move.
            for (let tileIdx of _moves) {
                let {row,col} = indexToCoord(tileIdx);
                _board[row][col] = _nextPlayer.get.mark();
                if (check.victory()) {
                    _board[row][col] = '';
                    return [row, col];
                }
                _board[row][col] = '';
            }
            // iterate fork.
            // iterate block fork.
            // center.
            if (_moves.indexOf(4) != -1) {
                return [1,1];
            }
            // opposite corner.
            // empty corner
            for (let even of (_moves.filter(n=>n%2==0))) {
                let {row, col} = indexToCoord(even);
                return [row,col];
            }
            // empty side.
            for (let odd of (_moves.filter(n=>n%2!=0))) {
                let {row,col} = indexToCoord(odd);
                return [row,col]
            }

            let {row,col} = indexToCoord(_moves[0]);
            return [row,col];
        };
        return {board, length, best};
    })();

    const set = (() => {
        const tile = (row: number, col: number, current_player: any) => {
            _board[row][col] = current_player.get.mark();
        }


        const empty = () => {
            _board = [['','',''],['','',''],['','','']]
        }

        return {tile, empty};
    })();


    return {check, get, set, indexToCoord };
})();


/* View */

const squarePlayed: any = (button: any, mark: string) => {
    button.disabled = true;
    button.textContent = mark;
}

const cleanTiles = () => {
    page.tiles.forEach(t => {
        t.disabled = false;
        t.textContent = '';
    });
};

// BUG: Displayed Score Doesn't reset to zero when player changed.
const setPlayer = (e: any) => {
    if (e.target!.className == 'p1') {
        let player1 = Player(
            page.player.one.name.value,
            page.player.one.mark.value
        );
        displayController.set.player(player1, true);
        page.display.player.one.name.textContent = `Name: ${player1.get.name()}`;
    } else {
        let player2 = Player(
            page.player.two.name.value,
            page.player.two.mark.value
        );
        displayController.set.player(player2, false);
        page.display.player.two.name.textContent = `Name: ${player2.get.name()}`;
    }
}

/* Controller */

const minimax = (board: Array<Array<string>>) => {
    let move: Number = 0;
}

// TODO:
// Set 'display.turn' to first player when both players set.
// Switch first players.
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
                cleanTiles();
                _players[first?'x':'o'] = person;
            } else {
                page.display.header.textContent = 'Please restart to change players.';
            }
        };

        const best = () => {
            let [row,column] = board.get.best();
            if (row == 4 || column == 4) {
                return "No moves left.";
            }

            let index = row*3+column;
            let mark = changeTile(index);

            if (mark === 'NP1' || mark == 'NP2') {
                return "Error. Players not set.";
            }

            squarePlayed(page.tiles[index], mark);
        }

        return {best, player};
    })();

    const get = (() => {
        const player = (current: string) => {
            if (current == "current"){
                return _players[_movesMade % 2 ? 'o' : 'x'];
            } else {
                return _players[_movesMade % 2 ? 'x' : 'o'];
            }
        };
        return {player};
    })();

    const changeTile = (index: number) => {
        // Ensure players set.
        if (_players['x'].get.name() == 'Player1') {
            page.display.header.textContent = "Set player 1 please.";
            return "NP1";
        } else if (_players['o'].get.name() == 'Player2') {
            page.display.header.textContent = "Set player 2 please.";
            return "NP2";
        } else {
            page.display.turn.textContent = '';
        }

        if (!_gameStarted) {
            _gameStarted = true;
            page.display.header.textContent = "Game Started.";
            page.display.startBtn.value = 'Restart Game';
        }

        // Stop game if over.
        if (_movesMade >= _MAX_MOVES || _gameWon) {
            page.display.header.textContent = "Start a new game.";
            page.display.startBtn.value = 'New Game';
            return '-';
        }
        
        _movesMade += 1;
        
        let {row, col} = board.indexToCoord(index);

        let player = get.player('current');

        board.set.tile(row, col, player);
        // Set display opposite current player.
        page.display.turn.textContent = `${(get.player('next')).get.name()}'s turn.`

        if (board.check.victory()) {
            _gameWon = true;
            page.display.header.textContent = "Game Over";
            page.display.turn.textContent = `${player.get.name()} is The Winner!`;
            player.won();
            page.player[_movesMade%2? 'two' : 'one']
                .score
                .textContent = 
                `Score: ${player.get.score()}`;

        }
        
        if (_movesMade == _MAX_MOVES && !_gameWon) {
            page.display.header.textContent = "Cat's Eye!";
            page.display.turn.textContent = "No more turns.";
        } 
        
        return player.get.mark();
    }

    const newGame = () => {
        page.display.header.textContent = 'New Game!'
        page.display.startBtn.value = 'New Game!'
        board.set.empty();
        cleanTiles();

        _movesMade = 0;
        _gameStarted = false;
        _gameWon = false;
    }

    return {get, set, changeTile, newGame};
})();

// State code. Needed to check if players have set any other name. 
displayController.set.player(Player('Player1', 'X'), true);
displayController.set.player(Player('Player2', 'O'), false);

// Each button is clickable once.
page.tiles.forEach((tile: HTMLInputElement, index) => {
    const makeMove = (e: Event | any) => {
        // Does not mark board if invalid players.
        let playerMark = displayController.changeTile(index);
        // If players not set, don't modify or disable tiles.
        if (playerMark == "NP1" || playerMark == "NP2") {
            return;
        }
        squarePlayed(e.target!, playerMark);

        // e.target!.removeEventListener('click', makeMove);
    };
    tile.addEventListener('click', makeMove);
});

page.display.startBtn.addEventListener( 'click', () => {
    displayController.newGame();
});

page.player.one.set.addEventListener('click', setPlayer);
page.player.two.set.addEventListener('click', setPlayer);
page.display.aiBtn.addEventListener('click', displayController.set.best);
