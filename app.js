class Cell {
	constructor(x, y, isAlive, randomColor, cellSize) {
		this.xPos = x;
		this.yPos = y;
		this.alive = isAlive;
		this.aliveNextGen = isAlive;
		this.cellSize = cellSize;
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
		context.fillRect(x*this.cellSize,y*this.cellSize, this.cellSize, this.cellSize);
		context.fillStyle = this.color; 
		context.stroke();
	}

	clearCell() {
		context.clearRect(this.xPos*this.cellSize,this.yPos*this.cellSize, this.cellSize, this.cellSize);
	}

	checkNeighbours(cells) {
		let aliveNeighbours = 0;
		let xStart = this.xPos - 1 > 0 ? this.xPos - 1 : 0;
		let yStart = this.yPos - 1 > 0 ? this.yPos - 1 : 0;
		let lenX = Math.min(this.xPos + 1, cells.length-1);
		for (let i = xStart; i <= lenX; i++) {
			let lenY = Math.min(this.yPos + 1, cells[i].length-1);
			for (let j = yStart; j <= lenY; j++) {
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
let cellSizeInput = document.getElementById('cell-size-input');
let context = canvas.getContext('2d');

let currentGenCells = [];

function generateStartingCells(xDimensions,yDimensions, randomAlive, randomColors, cellSize) {
	canvas.width = cellSize * xDimensions;
	canvas.height = cellSize * yDimensions;
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
				currentGenCells[i][j] = new Cell(i,j,false, randomColors ? getRandomColor() : null, cellSize);
			} else {
				let alive = Math.random() <= randomChance;
				alive ? numAlive++ : numNotAlive++;
				currentGenCells[i][j] = new Cell(i,j,alive, randomColors ? getRandomColor() : null, cellSize);
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
	generateStartingCells(xGridSize,yGridSize, true, randomColors.checked, parseInt(cellSizeInput.value));
});



document.getElementById('step-button').addEventListener('click', () => {
	if (isPlaying) {
		clearInterval(autoPlayInterval);
		updateCells();
	} else {
		updateCells();
	}
})

generateStartingCells(100,60, true, randomColors.checked, cellSizeInput.value);
