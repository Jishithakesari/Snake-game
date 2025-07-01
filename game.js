var SIZE = 20;
var WIDTH = 20;
var HEIGHT = 20;
var KEY = { LEFT: 37, RIGHT: 39, SPACE: 32 };

var speed = 50;
var gameLoop;

var canvas = document.getElementById("canvas-demo");
var cBackground = document.getElementById("canvas-background");
var point = new obelisk.Point(400, 50);
var pixelView = new obelisk.PixelView(canvas, point);
var pVBackground = new obelisk.PixelView(cBackground, point);
var dimension = new obelisk.CubeDimension(SIZE, SIZE, SIZE);

var matrix;
var snake;
var movX = 0;
var movY = -1;
var grow = 0;
var points = 0;

var playing = false;
var pressed = false;
var gameover = false;

function createArray(width, height) {
	var arr = new Array(width);
	for (var i = 0; i < width; i++) {
		arr[i] = new Array(height);
	}

	return arr;
}

function init() {
	points = 0;
	document.getElementById("points").innerHTML = points;
	speed = 50;
	movX = 0;
	movY = -1;
	grow = 0;
	playing = false;
	pressed = false;

	matrix = createArray(WIDTH, HEIGHT);
	snake = new Array(4);

	snake[0] = [Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2)];
	snake[1] = [Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2) + 1];
	snake[2] = [Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2) + 2];
	snake[3] = [Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2) + 3];

	putSnake();
	putFruit();
	//matrix[Math.floor(WIDTH / 2)][Math.floor(HEIGHT / 2) - 5] = 3;
}

function putFruit() {
	var oPosX = (posX = Math.floor(Math.random() * WIDTH));
	var oPosY = (posY = Math.floor(Math.random() * HEIGHT));

	while (matrix[posX][posY]) {
		posX = (posX + 1) % WIDTH;
		if (posX == WIDTH) {
			posX = posX % WIDTH;
			posY = (posY + 1) % HEIGHT;
		}

		if (oPosX == posX && oPosY == posY) {
			clearInterval(gameLoop);
			playing = false;
			document.getElementById("info").innerHTML =
				"Awesome!!!<br> You finish the game!!!";
		}
	}

	matrix[posX][posY] = 3;
}

function putSnake(last) {
	if (
		snake[0][0] < 0 ||
		snake[0][0] >= WIDTH ||
		snake[0][1] < 0 ||
		snake[0][1] >= HEIGHT
	) {
		document.getElementById("info").innerHTML =
			'Game Over <br> You hit the wall <br> Press "space" to restart';
		clearInterval(gameLoop);
		playing = false;
		gameover = true;
	} else {
		if (matrix[snake[0][0]][snake[0][1]] == 2) {
			document.getElementById("info").innerHTML =
				'Game Over <br> You eat your own body <br> Press "space" to restart';
			clearInterval(gameLoop);
			playing = false;
			gameover = true;
		} else {
			if (matrix[snake[0][0]][snake[0][1]] == 3) {
				// eat a fruit
				grow += 2;
				putFruit();
				points += 1;
				if (speed < 50) {
					speed++;
					clearInterval(gameLoop);
					gameLoop = setInterval(update, 10000 / speed);
				}

				document.getElementById("points").innerHTML = points;
			}

			matrix[snake[0][0]][snake[0][1]] = 1;
			for (var i = 1; i < snake.length; i++) {
				matrix[snake[i][0]][snake[i][1]] = 2;
			}
			if (last) {
				if (!grow) {
					matrix[last[0]][last[1]] = 0;
				} else {
					snake.push([last[0], last[1]]);
					grow--;
				}
			}
		}
	}
}

function moveSnake() {
	var last = [snake[snake.length - 1][0], snake[snake.length - 1][1]];
	for (var i = snake.length - 1; i > 0; i--) {
		snake[i][0] = snake[i - 1][0];
		snake[i][1] = snake[i - 1][1];
	}
	snake[0][0] = snake[0][0] + movX;
	snake[0][1] = snake[0][1] + movY;
	return last;
}

function update() {
	var last = moveSnake();
	putSnake(last);
	draw();
	pressed = false;
}

var colorBG = new obelisk.SideColor().getByInnerColor(
	obelisk.ColorPattern.GRAY
);

function drawBackground() {
	pVBackground.clear();

	for (var i = 0; i < WIDTH; i++) {
		var sideX0 = new obelisk.SideX(dimension, colorBG);
		var p3dX0 = new obelisk.Point3D(SIZE * i, 20 * SIZE, -SIZE);
		pVBackground.renderObject(sideX0, p3dX0);

		var sideY0 = new obelisk.SideY(dimension, colorBG);
		var p3dY0 = new obelisk.Point3D(20 * SIZE, i * SIZE, -SIZE);
		pVBackground.renderObject(sideY0, p3dY0);

		var sideY1 = new obelisk.SideY(dimension, colorBG);
		var p3dY1 = new obelisk.Point3D(0 * SIZE, i * SIZE, 0);
		pVBackground.renderObject(sideY1, p3dY1);

		var sideX1 = new obelisk.SideX(dimension, colorBG);
		var p3dX1 = new obelisk.Point3D(SIZE * i, 0 * SIZE, 0);
		pVBackground.renderObject(sideX1, p3dX1);
	}

	for (var i = 0; i < WIDTH; i++) {
		for (var j = 0; j < HEIGHT; j++) {
			var p3d = new obelisk.Point3D(i * SIZE, j * SIZE, 0);
			var brick = new obelisk.Brick(dimension, colorBG);
			pVBackground.renderObject(brick, p3d);
		}
	}
}

var colorBlue = new obelisk.CubeColor().getByHorizontalColor(
	obelisk.ColorPattern.BLUE
);
var cubeBlue = new obelisk.Cube(dimension, colorBlue);

var colorGreen = new obelisk.CubeColor().getByHorizontalColor(
	obelisk.ColorPattern.GRASS_GREEN
);
var cubeGreen = new obelisk.Cube(dimension, colorGreen);

var colorRed = new obelisk.PyramidColor().getByRightColor(
	obelisk.ColorPattern.WINE_RED
);
var pyramidRed = new obelisk.Pyramid(dimension, colorRed);

function draw() {
	pixelView.clear();

	for (var i = 0; i < WIDTH; i++) {
		for (var j = 0; j < HEIGHT; j++) {
			switch (matrix[i][j]) {
				case 1:
					// draw head snake
					var p3d = new obelisk.Point3D(i * SIZE, j * SIZE, 0);
					pixelView.renderObject(cubeBlue, p3d);
					break;
				case 2:
					// draw body snake
					var p3d = new obelisk.Point3D(i * SIZE, j * SIZE, 0);
					pixelView.renderObject(cubeGreen, p3d);
					break;
				case 3:
					// draw apple
					var p3d = new obelisk.Point3D(i * SIZE, j * SIZE, 0);
					pixelView.renderObject(pyramidRed, p3d);
					break;
				default:
					break;
			}
		}
	}
}

function onkeydown(e) {
	if (e.keyCode < 112 || e.keyCode > 123) {
		e.preventDefault();
	}

	if (playing) {
		if (!pressed) {
			switch (e.keyCode) {
				case KEY.LEFT:
					pressed = true;
					if (movY) {
						movX = movY;
						movY = 0;
					} else {
						movY = -movX;
						movX = 0;
					}
					break;
				case KEY.RIGHT:
					pressed = true;
					if (movY) {
						movX = -movY;
						movY = 0;
					} else {
						movY = movX;
						movX = 0;
					}
					break;
			}
		}
	} else {
		if (e.keyCode == KEY.SPACE) {
			if (gameover && e.keyCode == KEY.SPACE) {
				init();
				draw();
			}
			playing = true;
			pressed = true;
			gameLoop = setInterval(update, 10000 / speed);
			document.getElementById("info").innerHTML = "Eat all the fruit that you can";
		}
	}
}

document.addEventListener("keydown", onkeydown, false);

init();
drawBackground();
draw();
