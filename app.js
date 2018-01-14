let canvas = document.getElementById('game-display');

let boardWidth = 1280;
let boardHeight = 720;
let padding = 20;

let context = canvas.getContext('2d');
let gridState = {};

function drawBoard() {
	context.beginPath();

	for (let x = 0; x <= boardWidth; x += 10) {
			context.moveTo(x, 0);
			context.lineTo(x, boardHeight);
	}

	for (let y = 0; y <= boardHeight; y += 10) {
		context.moveTo(0, y);
		context.lineTo(boardWidth, y);
	}

	context.strokeStyle = "black";
	context.stroke();
}


let currentGenCells = [];

let cells = [];
let dyingCells = [];
let birthedCells = [];




canvas.addEventListener('click', function(event) {
	let xGridPos = Math.floor(event.offsetX / 10);
	let yGridPos = Math.floor(event.offsetY / 10);
	
	currentGenCells[xGridPos][yGridPos].birth();
});

function updateCells() {
	for (let i = 0; i < 100; i++) {
		for (let j = 0; j < 100; j++) {
			currentGenCells[i][j].checkNeighbours();
		}
	}
	
	for (let i = 0; i < 100; i++) {
		for (let j = 0; j < 100; j++) {
			currentGenCells[i][j].nextGeneration();
		}
	}
	
	console.log('done');
}

class Cell {
	constructor(x, y, isAlive) {
		this.xPos = x;
		this.yPos = y;
		this.alive = isAlive;
		this.aliveNextGen = isAlive;

		if (this.alive) {
			this.drawCell(this.xPos, this.yPos);
		}
	}

	birth() {
		this.alive = true;
		this.drawCell(this.xPos,this.yPos);
	}

	die() {
		this.alive = false;
		this.clearCell();
	}

	drawCell(x, y) {
		context.beginPath();
		context.fillRect(x*10,y*10, 10, 10);
		context.stroke();
	}

	clearCell() {
		context.clearRect(this.xPos*10,this.yPos*10, 10, 10);
	}

	checkNeighbours() {
		let aliveNeighbours = 0;
		let xStart = this.xPos - 1 > 0 ? this.xPos - 1 : 0;
		let yStart = this.yPos - 1 > 0 ? this.yPos - 1 : 0;

		for (let i = xStart; i <= Math.min(this.xPos + 1, 99); i++) {
			for (let j = yStart; j <= Math.min(this.yPos + 1, 99); j++) {
				if (currentGenCells[i][j].alive && currentGenCells[i][j] !== this) {
					aliveNeighbours++;
				}
			}
		}
		
		if (!this.alive && aliveNeighbours === 3) {
			this.aliveNextGen = true;
		} else if (this.alive && (aliveNeighbours < 2 || aliveNeighbours > 3) ) {
			this.aliveNextGen = false;
		} else if (this.alive && (aliveNeighbours === 2 || aliveNeighbours === 3)) {
			this.aliveNextGen = true;
		}
	}

	nextGeneration() {
		if (this.alive && !this.aliveNextGen) {
			this.die();
		} else if (!this.alive && this.aliveNextGen) {
			this.birth();
		}
	}
}

document.addEventListener('keydown', (event) => {
	updateCells();
})

function generateStartingCells(xDimensions,yDimensions, randomAlive) {
	for (let i = 0; i < xDimensions; i++) {
		currentGenCells[i] = new Array(yDimensions);	

		for (let j = 0; j < yDimensions; j++) {
			if (!randomAlive) {
				currentGenCells[i][j] = new Cell(i,j,false);
			} else {
				currentGenCells[i][j] = new Cell(i,j,Math.round(Math.random()));
			}
		}
	}

	console.log(currentGenCells);
}

generateStartingCells(100,100, true);
