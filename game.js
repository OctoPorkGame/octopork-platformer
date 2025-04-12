let octopork;
let octoporkSprites = [];
let duckSprite, jumpSprite, attackSprite;

let officialSprites = [];
let legalNoticeSprites = [];
let legalNoticeFastSprites = [];

let bgElements = {};
let neonSignFrames = [];
let neonSignFrame = 0;
let neonSignTimer = 0;

let obstacles = [];
let gameOver = false;

function preload() {
  // Octopork animations
  for (let i = 1; i <= 6; i++) {
    octoporkSprites.push(loadImage(`Assets/octopork_stand${i}.png`));
  }
  duckSprite = loadImage("Assets/octopork_duck.png");
  jumpSprite = loadImage("Assets/octopork_jump.png");
  attackSprite = loadImage("Assets/octopork_attack.png");

  // Official throwing animation
  for (let i = 1; i <= 4; i++) {
    officialSprites.push(loadImage(`Assets/official_throw${i}.png`));
  }

  // Legal notice (obstacles)
  legalNoticeSprites.push(
    loadImage("Assets/legal_notice1.png"),
    loadImage("Assets/legal_notice2.png")
  );
  legalNoticeFastSprites.push(
    loadImage("Assets/legal_notice_fast1.png"),
    loadImage("Assets/legal_notice_fast2.png")
  );

  // Background elements
  bgElements = {
    filingCabinet: loadImage("Assets/filing_cabinet.png"),
    waterCooler: loadImage("Assets/water_cooler.png"),
    moneyStack: loadImage("Assets/money_stack.png"),
    porkTicker: loadImage("Assets/pork_ticker.png")
  };

  // Neon Sign flicker animation
  neonSignFrames = [
    loadImage("Assets/neon_sign1.png"),
    loadImage("Assets/neon_sign2.png")
  ];
}

function setup() {
  createCanvas(800, 400);
  octopork = new Octopork();
}

function draw() {
  background(0);
  drawBackground();

  if (!gameOver) {
    octopork.update();
    octopork.display();

    handleObstacles();

    // Check for collisions
    for (let obs of obstacles) {
      if (collideRectRect(octopork.x, octopork.y, octopork.w, octopork.h, obs.x, obs.y, obs.w, obs.h)) {
        gameOver = true;
      }
    }
  } else {
    fill(255, 0, 0);
    textSize(40);
    textAlign(CENTER, CENTER);
    text("Game Over!", width / 2, height / 2);
  }

  // Neon sign flicker
  neonSignTimer++;
  if (neonSignTimer % 20 === 0) {
    neonSignFrame = (neonSignFrame + 1) % neonSignFrames.length;
  }
  image(neonSignFrames[neonSignFrame], 300, 20, 200, 50);
}

function keyPressed() {
  if (key === ' ' && !gameOver) {
    octopork.jump();
  }
  if (key === 's') {
    octopork.ducking = true;
  }
  if (key === 'a') {
    octopork.attacking = true;
  }
}

function keyReleased() {
  if (key === 's') {
    octopork.ducking = false;
  }
  if (key === 'a') {
    octopork.attacking = false;
  }
}

// --- Octopork Class ---
class Octopork {
  constructor() {
    this.x = 100;
    this.y = 300;
    this.vy = 0;
    this.gravity = 0.8;
    this.jumpForce = -12;
    this.w = 40;
    this.h = 40;
    this.ducking = false;
    this.attacking = false;
    this.frame = 0;
    this.animCounter = 0;
  }

  update() {
    this.vy += this.gravity;
    this.y += this.vy;

    if (this.y > 300) {
      this.y = 300;
      this.vy = 0;
    }

    // Animate
    this.animCounter++;
    if (this.animCounter % 5 === 0) {
      this.frame = (this.frame + 1) % octoporkSprites.length;
    }
  }

  jump() {
    if (this.y === 300) {
      this.vy = this.jumpForce;
    }
  }

  display() {
    let sprite;
    if (this.ducking) {
      sprite = duckSprite;
    } else if (this.attacking) {
      sprite = attackSprite;
    } else if (this.y < 300) {
      sprite = jumpSprite;
    } else {
      sprite = octoporkSprites[this.frame];
    }
    image(sprite, this.x, this.y, this.w, this.h);
  }
}

// --- Obstacle Logic ---
function handleObstacles() {
  if (frameCount % 90 === 0) {
    let isFast = random() < 0.3;
    let spriteSet = isFast ? legalNoticeFastSprites : legalNoticeSprites;
    let sprite = random(spriteSet);
    obstacles.push(new Obstacle(sprite, isFast ? 6 : 3));
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.update();
    obs.display();

    if (obs.x + obs.w < 0) {
      obstacles.splice(i, 1);
    }
  }
}

// --- Obstacle Class ---
class Obstacle {
  constructor(sprite, speed) {
    this.sprite = sprite;
    this.x = width;
    this.y = 310;
    this.w = 30;
    this.h = 30;
    this.speed = speed;
  }

  update() {
    this.x -= this.speed;
  }

  display() {
    image(this.sprite, this.x, this.y, this.w, this.h);
  }
}

// --- Background Elements ---
function drawBackground() {
  image(bgElements.filingCabinet, 50, 330, 50, 50);
  image(bgElements.waterCooler, 120, 320, 30, 50);
  image(bgElements.moneyStack, 700, 340, 40, 40);
  image(bgElements.porkTicker, 300, 370, 100, 30);
}
