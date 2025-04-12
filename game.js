const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 400;

// Load background image
const backgroundImage = new Image();
backgroundImage.src = '/assets/background.png';

// Game variables
let score = 0;
let gameOver = false;
let playerName = '';

// Player (OctoPork)
const player = {
    x: 50,
    y: canvas.height - 60,
    width: 40,
    height: 40,
    velocityY: 0,
    gravity: 0.6,
    jumpPower: -12,
    isJumping: false,
    frame: 0,
    frameCount: 6,
    frameTimer: 0,
    frameInterval: 10,
    sprites: []
};

// Load idle animation sprites
for (let i = 1; i <= player.frameCount; i++) {
    const img = new Image();
    img.src = `/assets/octopork_stand${i}.png`;
    player.sprites.push(img);
}

// Legal Notices (Obstacles)
const obstacles = [];
const obstacleWidth = 15;
const obstacleHeight = 15;
const obstacleSpeed = -3;
let obstacleSpawnTimer = 0;
const obstacleSpawnInterval = 60;

// Load legal notice sprites
const legalNoticeSprites = [];
for (let i = 1; i <= 2; i++) {
    const img = new Image();
    img.src = `/assets/legal_notice${i}.png`;
    legalNoticeSprites.push(img);
}

// Input handling
let keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space' && !player.isJumping) {
        player.velocityY = player.jumpPower;
        player.isJumping = true;
    }
});
window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Spawn obstacles
function spawnObstacle() {
    obstacles.push({
        x: canvas.width,
        y: canvas.height - 30,
        width: obstacleWidth,
        height: obstacleHeight,
        frame: 0,
        frameTimer: 0,
        frameInterval: 10
    });
}

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Game loop
function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2);
        return;
    }

    // Clear canvas and draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Update player
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    // Ground collision
    if (player.y > canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }

    // Animate player
    player.frameTimer++;
    if (player.frameTimer >= player.frameInterval) {
        player.frame = (player.frame + 1) % player.frameCount;
        player.frameTimer = 0;
    }
    ctx.drawImage(player.sprites[player.frame], player.x, player.y, player.width, player.height);

    // Spawn obstacles
    obstacleSpawnTimer++;
    if (obstacleSpawnTimer >= obstacleSpawnInterval) {
        spawnObstacle();
        obstacleSpawnTimer = 0;
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x += obstacleSpeed;

        // Animate obstacle
        obstacle.frameTimer++;
        if (obstacle.frameTimer >= obstacle.frameInterval) {
            obstacle.frame = (obstacle.frame + 1) % 2;
            obstacle.frameTimer = 0;
        }
        ctx.drawImage(legalNoticeSprites[obstacle.frame], obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Check collision
        if (checkCollision(player, obstacle)) {
            gameOver = true;
        }

        // Remove off-screen obstacles
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
            score += 10;
        }
    }

    // Draw score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);

    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();