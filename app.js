let canvas = document.getElementById('game-display');

let boardWidth = 1280;
let boardHeight = 720;
let padding = 20;

let context = canvas.getContext('2d');
let gridState = {
		x: {}
	};

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

drawBoard();

let cells = [];

canvas.addEventListener('click', function(event) {
	let xGridPos = Math.floor(event.offsetX / 10);
	let yGridPos = Math.floor(event.offsetY / 10);
	console.log(xGridPos, yGridPos);
	cells.push(new Cell(xGridPos, yGridPos));
});


function updateCells() {
	let len = cells.length;
	for (let i = 0; i < len; i++) {
		cells[i].checkNeighbours();
	}
}

setInterval(updateCells.bind(this), 1000);

class Cell {
	constructor(x, y) {
		this.xPos = x;
		this.yPos = y;
		if (gridState[x] === undefined) {
			gridState[x] = {};
		} else if (gridState[x][y] !== undefined || gridState[x][y] === true) {
			console.log('Occupied');
			return delete this;
		}
		gridState[x][y] = true;
		console.log(gridState);
		
		this.drawCell(this.xPos, this.yPos);
	}

	drawCell(x, y) {
		context.beginPath();
		context.fillRect(x*10,y*10, 10, 10);
		context.stroke();
	}

	checkNeighbours() {
		let numNeighbours = 0;
		console.log('testing', this.xPos, this.yPos);
		for (let i = this.xPos-1; i <= this.xPos + 1; i++) {
			for (let j = this.yPos-1; j <= this.yPos + 1; j++) {
				if (i !== this.xPos && j !== this.yPos) {
					if (gridState[i] !== undefined) {
						if (gridState[i][j] !== undefined) {
							if (gridState[i][j] === true) {
								numNeighbours++;
							}
						}
					}
				}
			}
		}

		console.log(numNeighbours);
	}

}
