class Cell {
	constructor(x, y, isAlive, randomColor) {
		this.xPos = x;
		this.yPos = y;
		this.alive = isAlive;
		this.aliveNextGen = isAlive;
		this.color = randomColor || '#000000';

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
		context.fillStyle = this.color; 
		context.stroke();
	}

	clearCell() {
		context.clearRect(this.xPos*10,this.yPos*10, 10, 10);
	}

	checkNeighbours(cells) {
		let aliveNeighbours = 0;
		let xStart = this.xPos - 1 > 0 ? this.xPos - 1 : 0;
		let yStart = this.yPos - 1 > 0 ? this.yPos - 1 : 0;

		for (let i = xStart; i <= Math.min(this.xPos + 1, cells.length-1); i++) {
			for (let j = yStart; j <= Math.min(this.yPos + 1, cells[i].length-1); j++) {
				if (cells[i][j].alive && cells[i][j] !== this) {
					aliveNeighbours++;
				}
			}
		}
		
		if (!this.alive && aliveNeighbours === 3) {
			//Creates a new cell here due to 'reproduction' next generation
			this.aliveNextGen = true;
		} else if (this.alive && (aliveNeighbours < 2 || aliveNeighbours > 3) ) {
			//Sparse population or overcrowding leads to death
			this.aliveNextGen = false;
		} else if (this.alive && (aliveNeighbours === 2 || aliveNeighbours === 3)) {
			//Ideal conditions, cell continues to live
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

let canvas = document.getElementById('game-display');
let boardWidth = 1280;
let boardHeight = 720;
let gridWidth;
let gridHeight;
let padding = 20;
let autoPlayInterval;
let isPlaying = false;
let randomColors = document.getElementById('random-colors-checkbox'); 
let context = canvas.getContext('2d');

let currentGenCells = [];

function generateStartingCells(xDimensions,yDimensions, randomAlive, randomColors) {
	canvas.width = 10 * xDimensions;
	canvas.height = 10 * yDimensions;
	gridWidth = xDimensions;
	gridHeight = yDimensions;
	let randomChance;
	let numAlive = 0;
	let numNotAlive = 0;
	console.log(randomColors);

	if (randomAlive) {
		randomChance = document.getElementById('aliveChanceSlider').value / 100;
	}

	for (let i = 0; i < xDimensions; i++) {
		currentGenCells[i] = new Array(yDimensions);	

		for (let j = 0; j < yDimensions; j++) {
			if (!randomAlive) {

				currentGenCells[i][j] = new Cell(i,j,false, randomColors ? getRandomColor() : null);
			} else {
				let alive = Math.random() <= randomChance;
				alive ? numAlive++ : numNotAlive++;
				currentGenCells[i][j] = new Cell(i,j,alive, randomColors ? getRandomColor() : null);
			}
		}
	}

	console.log(randomChance, numAlive, numNotAlive)
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function updateCells() {
	for (let i = 0; i < gridWidth; i++) {
		for (let j = 0; j < gridHeight; j++) {
			currentGenCells[i][j].checkNeighbours(currentGenCells);
		}
	}
	
	for (let i = 0; i < gridWidth; i++) {
		for (let j = 0; j < gridHeight; j++) {
			currentGenCells[i][j].nextGeneration();
		}
	}
}

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

canvas.addEventListener('click', function(event) {
	let xGridPos = Math.floor(event.offsetX / 10);
	let yGridPos = Math.floor(event.offsetY / 10);
	
	isPlaying = false;
	clearInterval(autoPlayInterval);

	if (currentGenCells[xGridPos][yGridPos].alive) {
		currentGenCells[xGridPos][yGridPos].die();
	} else {
		currentGenCells[xGridPos][yGridPos].birth();
	}
});

document.getElementById('play-button').addEventListener('click', () => {
	autoPlayInterval = setInterval(updateCells, 100 * (document.getElementById('speedSlider').value / 100));
	isPlaying = true;
});

document.getElementById('speedSlider').oninput = function() {
	autoPlaySpeed = this.value / 100;
	if (isPlaying) {
		clearInterval(autoPlayInterval);
		autoPlayInterval = setInterval(updateCells, 100 * (this.value / 100));
	}
}

document.getElementById('pause-button').addEventListener('click', () => {
	clearInterval(autoPlayInterval);
	isPlaying = false;
});

document.getElementById('random-colors-checkbox').addEventListener('click', () => {
})

document.getElementById('reset-button').addEventListener('click', () => {
	clearInterval(autoPlayInterval);
	context.clearRect(0, 0, canvas.width, canvas.height);
	let xGridSize = document.getElementById('x-dimension-input').value;
	let yGridSize = document.getElementById('y-dimension-input').value;
	generateStartingCells(xGridSize,yGridSize, true, randomColors.checked);
});



document.getElementById('step-button').addEventListener('click', () => {
	if (isPlaying) {
		clearInterval(autoPlayInterval);
		updateCells();
	} else {
		updateCells();
	}
})

generateStartingCells(100,70, true, randomColors.checked);
