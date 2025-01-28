// Variables for microphone and game elements
let mic; // To capture the microphone's sound level
let birdX = 50; // Bird's horizontal position
let birdY; // Bird's vertical position
let birdSpeedY = 0; // Vertical speed for the bird
let pipes = []; // Array holding all obstacles
let gravity = 0.2; // Gravitational effect pulling the bird down
let score = 0; // Player's score
let highScore = 0; // Highest score achieved
let startDelay = 120; // Frame delay before the game starts (2 seconds at 60 FPS)
let gameStarted = false; // Control variable for whether the game is running
let bgImage; // Variable for background image
let birdImage; // Variable for the bird's image
let groundHeight = 135; // Height of the ground, used to place obstacles and limit bird's movement

// Preloads images before the game starts
function preload() {
  bgImage = loadImage('nyybild.avif'); // Loads background image
  birdImage = loadImage('birrd.png'); // Loads the bird's image
}

function setup() {
  createCanvas(800, 600); // Creates a canvas of 800x600 pixels
  birdY = height / 2; // Starting position for the bird in the middle of the screen

  // Fetches previous high score from localStorage if available
  highScore = getItem("highScore") || 0;

  // Initializes the microphone
  mic = new p5.AudioIn(); // Creates a microphone input
  userStartAudio(); // Requires user-initiated audio start for browser security
  mic.start(); // Starts microphone recording

  // Creates the first obstacle
  pipes.push(new Pipe());
}

function draw() {
  // Draws the background
  background(bgImage);

  // Fetches the microphone's sound level
  let micLevel = mic.getLevel();

  // Handles the game's start delay
  if (!gameStarted) {
    birdSpeedY = 0; // Keeps the bird stationary
    textSize(48); // Large text size
    stroke(0); // Black outline for the text
    strokeWeight(4); // Outline thickness
    fill(255, 255, 0); // Yellow fill for the text
    textAlign(CENTER); // Centers the text
    text("Get Ready!", width / 2, height / 2); // Displays start message

    // Starts the game after the delay
    if (frameCount >= startDelay) {
      gameStarted = true;
    }
  } else {
    // Updates the bird's movement based on sound level
    if (mic.enabled && micLevel > 0.05) {
      birdSpeedY = map(micLevel, 0.02, 0.3, -3, -8, true); // Loud sound gives greater upward force
    } else {
      birdSpeedY += gravity; // Adds gravity if sound level is low
    }

    // Updates the bird's y-position
    birdY += birdSpeedY;

    // Checks if the bird hits the ceiling
    if (birdY < 0) {
      endGame(); // Ends the game if the bird flies off-screen
      return;
    }

    // Checks if the bird hits the ground
    if (birdY > height - groundHeight - 50) {
      birdY = height - groundHeight - 50; // Stops the bird at ground level
      birdSpeedY = 0; // Resets speed
    }

    // Draws the bird as an image
    drawBird();

    // Handles obstacles
    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].show(); // Draws the obstacle
      pipes[i].update(); // Moves the obstacle left

      // Checks for collision between the bird and the obstacle
      if (pipes[i].hits(birdX, birdY)) {
        endGame(); // Ends the game if the bird hits an obstacle
        return;
      }

      // Removes obstacles that have left the screen
      if (pipes[i].offscreen()) {
        pipes.splice(i, 1);
        score++; // Increases the score when an obstacle is passed
      }
    }

    // Creates new obstacles at regular intervals
    if (frameCount % 100 === 0) {
      pipes.push(new Pipe());
    }

    // Displays the player's score
    fill(255); // White text
    textSize(24); // Medium text size
    textAlign(LEFT); // Aligns text to the left
    text("Score: " + score, 10, 30);
  }

  // Displays sound level, speed multiplier, and high score
  fill(255); // White text
  textSize(16); // Smaller text size
  textAlign(LEFT); // Aligns text to the left
  text("Mic Level: " + micLevel.toFixed(2), 10, 50);
  let speedMultiplier = 1 + score * 0.01; // Increases speed by 1% per point
  text("Speed Multiplier: " + speedMultiplier.toFixed(2), 10, 70);
  text("High Score: " + highScore, 10, 90);
}

// Draws the bird on the screen
function drawBird() {
  image(birdImage, birdX, birdY, 50, 50); // Adjusts size if necessary
}

// Class for obstacles
class Pipe {
  constructor() {
    this.spacing = random(150, 200); // Distance between the top and bottom sections
    this.top = random(50, height - groundHeight - this.spacing - 50); // Top section of the pipe
    this.bottom = height - groundHeight - (this.top + this.spacing); // Bottom section of the pipe
    this.x = width; // Starts off-screen on the right
    this.w = 40; // Width of the pipe
    this.speed = 3; // Initial speed of the pipe
  }

  // Draws the pipe
  show() {
    fill("#79aa2d"); // Green color
    rect(this.x, 0, this.w, this.top); // Draws the top section
    rect(this.x, height - this.bottom - groundHeight, this.w, this.bottom); // Draws the bottom section
  }

  // Moves the pipe to the left
  update() {
    let speedMultiplier = 1 + score * 0.01; // Increases speed based on score
    this.speed = 3 * speedMultiplier;
    this.x -= this.speed; // Moves the pipe left
  }

  // Checks if the bird hits the pipe
  hits(birdX, birdY) {
    if (birdX > this.x && birdX < this.x + this.w) {
      if (birdY < this.top || birdY > height - groundHeight - this.bottom) {
        return true; // Collision occurs
      }
    }
    return false;
  }

  // Checks if the pipe has left the screen
  offscreen() {
    return this.x < -this.w;
  }
}

// Function to end the game
function endGame() {
  noLoop(); // Stops the draw loop
  if (score > highScore) {
    highScore = score; // Updates high score if necessary
    storeItem("highScore", highScore); // Saves high score in localStorage
  }
  textSize(32); // Text size for the message
  stroke(0); // Black outline
  strokeWeight(4); // Outline thickness
  fill(255, 255, 0); // Yellow text
  textAlign(CENTER);
  text("Game Over! Score: " + score, width / 2, height / 2); // Displays final score
  textSize(20);
  text("Press 'R' to restart", width / 2, height / 2 + 40); // Restart instruction
}

// Function to restart the game
function keyPressed() {
  if (key === 'R' || key === 'r') {
    resetGame();
  }
}

// Function to reset the game
function resetGame() {
  score = 0; // Resets the score
  pipes = []; // Clears the obstacle array
  birdY = height / 2; // Resets the bird's position
  birdSpeedY = 0; // Resets the bird's speed
  gameStarted = false; // Resets the start flag
  startDelay = frameCount + 120; // Sets new delay
  loop(); // Restarts the draw loop
}
