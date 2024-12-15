


class Player {
    constructor(letter, player) {
        this.letter = letter;
        this.player = player;
    }

    getMove(game) {
        return;
    }
}

class HumanPlayer extends Player {
    constructor(letter, player = "Human") {
        super(letter, player);
    }
}

class MachineEasyPlayer extends Player {
    constructor(letter, player = "Easy Machine") {
        super(letter, player);
    }

    getMove(game) {
        return game.availableMoves()[Math.floor(Math.random() * game.availableMoves().length + 1)];
    }
}

class MachineNormalPlayer extends Player {
    constructor(letter, player = "Normal Machine") {
        super(letter, player);
    }

    getMove(game) {
        let player = this.letter,
            nextPlayer = player === "X" ? "O" : "X";
        let attack = this.strategy(game, player),
            defense = this.strategy(game, nextPlayer);

        if (attack.length) {
            return attack[0];
        } else if (defense.length) {
            return defense[0];
        } else {
            return game.availableMoves()[Math.floor(Math.random() * game.numberEmptyMarks())];
        }
    }

    strategy(game, player) {
        var rules = game.rules;
        var board = [];

        for (let rule of rules) {
            var checked = [];
            for (let index of rule) {
                let minmax = game.board[index] === player ? 1 : game.board[index] === " " ? 0 : -1;
                checked.push(minmax);
            }
            board.push(checked);
        }

        var attack = [];

        for (let index = 0; index < 8; index++) {
            let grid = board[index];
            let rule = game.rules[index];
            let sum = grid[0] + grid[1] + grid[2];
            // let sum = move.reduce((a, b) => a + b, 0);

            if (sum > 1) {
                attack.push(rule[grid.indexOf(0)])
            }
        }

        return attack;
    }
}

class MachineExpertPlayer extends Player {
    constructor(letter, player = "Expert Machine") {
        super(letter, player);
    }

    getMove(game) {
        let score = this.minmax(game, this.letter);
        return score.mark;
    }

    minmax(game, player) {
        var maxPlayer = this.letter;
        var nextPlayer = player === "X" ? "O" : "X";

        if (game.winner === nextPlayer) {
            return {
                mark: NaN,
                score: nextPlayer === maxPlayer ? 1 * (game.numberEmptyMarks() + 1) : -1 * (game.numberEmptyMarks() + 1)
            };
        } else if (!game.existEmptyMarks()) {
            return { mark: NaN, score: 0 };
        }

        var bestScore = {
            mark: NaN,
            score: player === maxPlayer ? -Infinity : Infinity
        }

        for (let possible of game.availableMoves()) {
            game.makeMove(player, possible);
            var score = this.minmax(game, nextPlayer);
            game.board[possible] = " ";
            game.winner = NaN;
            score.mark = possible;

            if (player === maxPlayer) {
                bestScore = score.score > bestScore.score ? score : bestScore;
            } else {
                bestScore = score.score < bestScore.score ? score : bestScore;
            }
        }

        return bestScore;
    }
}

class TicTacToe {
    constructor() {
        this.rules = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        this.defaults();
    }

    defaults() {
        this.winner = NaN;
        this.board = [..." ".repeat(9)];
    }

    availableMoves() {
        let moves = [];
        this.board.forEach((letter, index) => {
            if (letter === " ") {
                moves.push(index);
            }
        });
        return moves;
    }

    numberEmptyMarks() {
        return this.board.filter(empty => empty === " ").length;
    }

    existEmptyMarks() {
        return this.board.includes(" ");
    }

    makeMove(player, ref) {
        if (this.board[ref] === " ") {
            this.board[ref] = player;
            if (this.checkWinner(player)) {
                this.winner = player
            }
            return true;
        }
        return false;
    }

    checkWinner(player) {

        for (let index = 0; index < 8; index++) {
            let rule = this.rules[index];
            if (this.board[rule[0]] === player &&
			 this.board[rule[0]] === this.board[rule[1]] &&
                this.board[rule[1]] === this.board[rule[2]]) {

                return true;
            }
        }
        return false;
    }
}

class Letter {
    constructor(letter, index) {
        this.letter = letter;
        this.index = index;
    }
}

class Text {
    constructor(text) {
        this.text = text;
        this.on = false;
    }

    changeText(text) {
        this.text = text;
    }
}

class Display {

    gameTitle = document.getElementById("gametitle");
    gameBoard = document.getElementById("gameboard");
    gameLevel = document.getElementById("gamelevel");
    gameMessage = document.getElementById("message");
    warnings = {
        X: "Congratulations %s! You win.",
        O: "I win! Better luck next time %s.",
        welcome: "Welcome %s!",
        quit: "quit message",
        none: "",
        tie: "It's a tie, let's go again!",
        over: "It's over, Come to play again!",
        full: "You're good huh! Let's try again.",
    }


    constructor() {
        this.index = Object.keys(this.warnings);
        this.title = new Text("TicTacToe");
        this.message = new Text("Welcome");
        this.level = new Text(null);
    }

    defaults() {
        this.gameBoard.innerHTML = "";
    }

    intro() {
        this.drawtitle();
        this.drawmessage();
    }

    changeMessage(ref, playername) {
        if (!this.index.includes(ref)) { return; }

        if (this.index.slice(0, this.index.length - 3).includes(ref)) {
            if (this.index.slice(0, 3).includes(ref)) {
                this.message.changeText(this.warnings[ref].replace(/%s/g, playername));
            } else {
                this.message.changeText(this.warnings[ref]);
            }
        } else {
            this.message.changeText(this.warnings[this.index.slice(this.index.length - 3, this.index.length)[Math.floor(Math.random() * 3)]]);
        }

        this.drawmessage();

    }

    changeLevel(level) {
        this.gameLevel.innerHTML = `<p>${level}</p>`;
    }

    resetMessage() {
        this.gameMessage.innerHTML = "";
    }

    drawtitle() {
        this.gameTitle.innerHTML = `<h2>${this.title.text}</h2>`;
    }

    drawmessage() {
        this.gameMessage.innerHTML = `<p>${this.message.text}</p>`;
    }
}

class Game {

    modes = { 1: "Easy", 2: "Normal", 3: "Expert" };

    constructor(game, human = "Human", level = 2, fps = 30) {
        this.game = game;
        this.human = human;
        this.level = level;
        this.fps = fps;
        this.onHumanClick = this.onHumanClick.bind(this);
        this.onLevel = this.onLevel.bind(this);
    }

    init() {
        let level = this.modes[this.level];

        this.display = new Display();
        this.display.changeMessage("welcome", this.human);
        this.display.changeLevel(level);
        this.display.intro();
    }

    defaults() {
        for (let index = 0; index < 9; index++) {
            let cell = document.createElement("div");
            cell.id = `M${index}`;
            cell.className = "cell";
            cell.style.gridArea = `M${index}`;
            cell.addEventListener("click", this.onHumanClick, { once: true });
            this.display.gameBoard.appendChild(cell);
        }
        this.display.gameLevel.addEventListener("click", this.onLevel);

        this.humanPlayer = new HumanPlayer("X", this.human);
        this.selectMachine(this.level);
        this.player = this.humanPlayer.letter;
        this.running = true;
        this.gameover = false;
        this.delay = NaN;
        this.counter = 0;
    }

    selectMachine(level) {
        this.machinePlayer = level === 3 ? new MachineExpertPlayer("O") : level === 2 ? new MachineNormalPlayer("O") : new MachineEasyPlayer("O");
    }

    warnings(code, player) {
        this.display.changeMessage(code, player);
    }

    restart() {
        this.display.defaults();
        this.game.defaults();
        this.defaults();
    }

    onHumanClick(event) {

        let cell = event.target;
        let index = parseInt((cell.id.match(/\d/g)));

        cell.innerHTML = `<p>${this.player}</p>`;
        this.game.board[index] = this.player;

        if (this.game.checkWinner(this.player)) { this.game.winner = this.player; }

        if (this.game.numberEmptyMarks() === 8) {
            this.warnings("none", this.humanPlayer.player);
            this.display.gameLevel.removeEventListener("click", this.onLevel);
        }

        this.running = false;

    }

    onLevel() {

        this.level++;

        if (this.level > 3) { this.level = 1; }
        console.log(this.level);

        this.selectMachine(this.level);
        let level = this.modes[this.level];

        this.display.changeLevel(level);
    }

    play() {

        setInterval(() => {

            if (this.delay) {
                this.delay--;
                if (this.delay <= 1) {
                    this.delay = NaN;
                }
            }

            if (this.player === this.humanPlayer.letter && !this.gameover && !this.delay) {

                if (!this.running) {
                    this.player = this.machinePlayer.letter;
                    this.delay = 1 * this.fps;
                }

            } else if (this.player === this.machinePlayer.letter && this.game.existEmptyMarks() && !this.game.winner && !this.gameover && !this.delay) {

                let index = this.machinePlayer.getMove(this.game);

                this.display.gameBoard.childNodes[index].innerHTML = `<p>${this.player}</p>`;
                this.display.gameBoard.childNodes[index].removeEventListener("click", this.onHumanClick, { once: true });

                this.game.board[index] = this.player;
                if (this.game.checkWinner(this.player)) { this.game.winner = this.player; }

                this.player = this.humanPlayer.letter;
                this.running = true;
            }

            if (this.game.winner && !this.gameover && !this.delay) {
                for (let index of this.game.availableMoves()) {
                    this.display.gameBoard.childNodes[index].removeEventListener("click", this.onHumanClick, { once: true });
                }
                this.warnings(this.game.winner, this.humanPlayer.player);
                this.delay = 3 * this.fps;
                this.gameover = true;
            }

            if (!this.game.existEmptyMarks() && !this.game.winner && !this.gameover && !this.delay) {
                this.warnings("tie", this.humanPlayer.player);
                this.delay = 3 * this.fps;
                this.gameover = true;
            }

            if (this.gameover && !this.delay) { this.restart(); }

        }, 1000 / this.fps);
    }
}

function start() {

    const tictactoe = new Game(new TicTacToe(), prompt("Your name"));
    tictactoe.init();
    tictactoe.defaults();
    tictactoe.play();
}

start();
