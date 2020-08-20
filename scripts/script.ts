const page = {
    tiles: document.querySelectorAll('.tic-tac')!,
    header: document.querySelector('h1')!,
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
    const _MAX_MOVES = 9;
    let _movesMade = 0;
    let gameWon = false;

    let _board = [
        ['','',''], 
        ['','',''], 
        ['','','']
    ];

    const _numberToPosition = (index: number) => {
        return {
            row: Math.floor(index / _SIDE_LENGTH), 
            col: index % _SIDE_LENGTH
        };
    }

    const _setState = (row: number, col: number, text: string) => {
        _board[row][col] = text;
    }

     // Every element in array matches the first element.
    const _isWinningRow = (arr: Array<string>) => {
        return String(arr) == 
               String(arr[0].repeat(_SIDE_LENGTH).split(''));
    }

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
    }

    const _colVictory = () => {
        for (let col in _board) {
            let column: Array<string> = [];
            _board.forEach((row) => column.push(row[col]));
            
            if (_isWinningRow(column)) {
                return true;
            }
        }
        return false;
    }

    const _diagVictory = () => {
        let leftToRight = [];
        let rightToLeft = [];
        for (let i = 0; i < _SIDE_LENGTH; i++) {
            leftToRight.push(_board[i][i])
            rightToLeft.push(
                _board[i][(_SIDE_LENGTH-1)-i]
            )
        }
        
        if (leftToRight.indexOf('') != -1 &&
            rightToLeft.indexOf('') != -1
        ){
            return false;
        }
        
        return _isWinningRow(leftToRight) || _isWinningRow(rightToLeft)
    }

    const _victoryCheck = () => {
        return (
            _rowVictory() ||
            _colVictory() ||
            _diagVictory()
        );
    };

    const changeTile = (index: number, playerChoice: string) => {
        if (_movesMade >= _MAX_MOVES || gameWon) {
            page.header.textContent = "The Game is Over!"
            return '-';
        }
        
        _movesMade += 1;
        
        let {row, col} = _numberToPosition(index);
        let playerMark = _movesMade % 2? 'O' : 'X';
        _setState(row, col, playerMark);
        
        // TODO
        if (_victoryCheck()) {
            gameWon = true;
            page.header.textContent = `${playerMark} is The Winner!`;
        }
        
        return playerMark;
    }

    return {changeTile};
})();


/* View */

const tileUsed = (button: any, mark: string) => {
    button.disable = true;
    button.textContent = mark;
}

/* Controller */

let player1 = Player('Player1', 'X');

// Each button is clickable once.
page.tiles.forEach((tile, index) => {
    const makeMove = (e: Event | any) => {
        playerMark = board.changeTile(index, playerMark);
        tileUsed(e.target!, playerMark);

        e.target!.removeEventListener('click', makeMove);
    };
    tile.addEventListener('click', makeMove);
});

