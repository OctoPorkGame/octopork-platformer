// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load sprites
const backgroundImage = new Image();
backgroundImage.src = '/assets/background.png';

const octoPorkStandSprites = [];
for (let i = 1; i <= 6; i++) {
    const img = new Image();
    img.src = `/assets/octopork_stand${i}.png`;
    octoPorkStandSprites.push(img);
}
const octoPorkDuck = new Image();
octoPorkDuck.src = '/assets/octopork_duck.png';
const octoPorkJump = new Image();
octoPorkJump.src = '/assets/octopork_jump.png';

const officialSprites = [];
for (let i = 1; i <= 4; i++) {
    const img = new Image();
    img.src = `/assets/official_throw${i}.png`;
    officialSprites.push(img);
}

const legalNoticeSprites = [];
for (let i = 1; i <= 2; i++) {
    const img = new Image();
    img.src = `/assets/legal_notice${i}.png`;
    legalNoticeSprites.push(img);
}

const filingCabinet = new Image();
filingCabinet.src = '/assets/filing_cabinet.png';
const waterCooler = new Image();
waterCooler.src = '/assets/water_cooler.png';
const moneyStack = new Image();
moneyStack.src = '/assets/money_stack.png';
const porkTicker = new Image();
porkTicker.src = '/assets/pork_ticker.png';

// Game objects
const platform = {
    y: canvas.height - 100,
    height: 20,
    color: '#666699'
};

const octoPork = {
    x: 50,
    y: platform.y - 40,
    width: 40,
    height: 40,
    speed: 5,
    velocityY: 0,
    isJumping: false,
    isDucking: false,
    duckHeight: 20,
    frame: 0,
    frameCount: 6,
    frameTimer: 0,
    frameInterval: 10
};

const official = {
    x: canvas.width - 100,
    y: platform.y - 40,
    width: 40,
    height: 40,
    frame: 0,
    frameCount: 4,
    frameTimer: 0,
    frameInterval: 10
};

const moneyBag = {
    x: canvas.width - 60,
    y: platform.y - 30,
    width: 20,
    height: 20
};

// Game stats
let playerName = '';
let saved = 0;
let totalSaved = 0;
let playerCount = 0;
let currentLevel = 1;
let wins = 0;
const levelGoals = [
    1000000000,      // Level 1: $1B
    5000000000,      // Level 2: $5B
    25000000000,     // Level 3: $25B
    100000000000,    // Level 4: $100B
    500000000000,    // Level 5: $500B
    1000000000000,   // Level 6: $1T
    5000000000000,   // Level 7: $5T
    10000000000000,  // Level 8: $10T
    20000000000000,  // Level 9: $20T
    36000000000000   // Level 10: $36T
];
const TARGET = 36000000000000;

// UI elements
const savedDiv = document.getElementById('saved');
const totalDiv = document.getElementById('total');
const playersDiv = document.getElementById('players');
const messageDiv = document.getElementById('message');
const badgeDiv = document.getElementById('badge');
const progressBar = document.getElementById('progress');
const levelDisplay = document.getElementById('level-display');
const namePrompt = document.getElementById('name-prompt');
const playerNameInput = document.getElementById('player-name-input');
const jumpBtn = document.getElementById('jump-btn');
const duckBtn = document.getElementById('duck-btn');
const shareBtn = document.getElementById('share-btn');
const chaChing = document.getElementById('cha-ching');
const shredder = document.getElementById('shredder');

// Obstacles array
let obstacles = [];
let obstacleTimer = 0;
let obstacleFrequency = 60;

// Initialize stats display
savedDiv.textContent = `$PORK Freed: $${saved.toLocaleString()}`;
totalDiv.textContent = `Total $PORK Freed: $${totalSaved.toLocaleString()}`;
playersDiv.textContent = `Players Shredding Waste: ${playerCount.toLocaleString()}`;

// Player name handling
window.onload = () => {
    namePrompt.style.display = 'block';
};

function submitPlayerName() {
    const name = playerNameInput.value.trim();
    if (name && name.length >= 3 && name.length <= 20) {
        playerName = name;
        namePrompt.style.display = 'none';
        updateLeaderboard();
        gameLoop();
    } else {
        alert('Name must be 3-20 characters.');
    }
}

function changePlayerName() {
    namePrompt.style.display = 'block';
}

// Badges
function updateBadge() {
    if (saved >= 100000000000) badgeDiv.textContent = 'Badge: Pork Tycoon!';
    else if (saved >= 10000000000) badgeDiv.textContent = 'Badge: Waste Warrior!';
    else if (saved >= 1000000000) badgeDiv.textContent = 'Badge: Shredder!';
    else badgeDiv.textContent = '';
}

// Levels
function updateLevelDisplay() {
    const goal = levelGoals[currentLevel - 1];
    levelDisplay.textContent = `Level: ${currentLevel} (${wins}/${currentLevel * 5} wins)`;
    const progress = (saved / goal) * 100;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
    if (saved >= goal && currentLevel < levelGoals.length) levelUp();
}

function levelUp() {
    currentLevel++;
    wins = 0;
    let rewardMessage = '';
    switch (currentLevel) {
        case 2: rewardMessage = 'Unlocked Paper Shredder animation!'; break;
        case 3: rewardMessage = 'Unlocked Ocean Cleaner skin! We’ve hit $5B—aim for $25B!'; break;
        case 4: rewardMessage = 'Unlocked Junkyard Titan skin!'; break;
        case 5: rewardMessage = 'Unlocked Corporate King animation!'; break;
        case 6: rewardMessage = 'Unlocked Space Explorer skin!'; break;
        case 7: rewardMessage = 'Unlocked Wall Street Boss animation!'; break;
        case 8: rewardMessage = 'Unlocked Fortress Guardian skin!'; break;
        case 9: rewardMessage = 'Unlocked Mars Conqueror animation!'; break;
        case 10: rewardMessage = 'Unlocked Galactic Ruler skin!'; break;
        case 11: rewardMessage = 'Unlocked Debt Destroyer skin + Victory Animation! $36T achieved!'; break;
    }
    alert(`Level Up to ${currentLevel}! ${rewardMessage}`);
    updateLevelDisplay();
    if (currentLevel === 3) messageDiv.textContent = 'We’ve freed $5B! Aim for $25B!';
    if (currentLevel === 11) messageDiv.textContent = '$36T freed—victory is ours!';
}

// Controls
jumpBtn.addEventListener('click', () => {
    if (!octoPork.isJumping) {
        octoPork.velocityY = -10;
        octoPork.isJumping = true;
        octoPork.isDucking = false;
    }
});

duckBtn.addEventListener('click', () => {
    if (!octoPork.isJumping) {
        octoPork.isDucking = true;
        setTimeout(() => {
            octoPork.isDucking = false;
        }, 500);
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') octoPork.x -= octoPork.speed;
    if (e.key === 'ArrowRight') octoPork.x += octoPork.speed;
    if (e.key === ' ' && !octoPork.isJumping) {
        octoPork.velocityY = -10;
        octoPork.isJumping = true;
        octoPork.isDucking = false;
    }
    if (e.key === 'ArrowDown') {
        octoPork.isDucking = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowDown') octoPork.isDucking = false;
});

shareBtn.addEventListener('click', () => {
    const text = `I freed $${saved.toLocaleString()} in $PORK playing OctoPork Platformer! Join the mission: [Your Netlify URL]`;
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
});

// Game loop
function gameLoop() {
    if (!playerName) return;

    // Neon office background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Background elements
    ctx.drawImage(filingCabinet, 50, platform.y - 100, 50, 50);
    ctx.drawImage(waterCooler, canvas.width - 100, platform.y - 80, 30, 50);
    ctx.drawImage(moneyStack, canvas.width / 2 - 20, platform.y - 80, 40, 40);

    // Neon sign: Pork Save & Savd
    let signOpacity = 1;
    let signFlicker = 0;
    signFlicker++;
    if (signFlicker % 20 === 0) signOpacity = Math.random() * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255, 105, 180, ${signOpacity})`; // Pink neon
    ctx.font = '24px Arial';
    ctx.fillText('PORK SAVE & SAVD', canvas.width / 2 - 100, platform.y - 50);

    // $PORK ticker
    ctx.drawImage(porkTicker, canvas.width / 2 - 50, 20, 100, 30);

    // Draw platform
    ctx.fillStyle = platform.color;
    ctx.fillRect(0, platform.y, canvas.width, platform.height);
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.strokeStyle = '#333366';
        ctx.beginPath();
        ctx.moveTo(x, platform.y);
        ctx.lineTo(x, platform.y + platform.height);
        ctx.stroke();
    }

    // Update OctoPork
    octoPork.y += octoPork.velocityY;
    octoPork.velocityY += 0.5;
    if (octoPork.y > platform.y - (octoPork.isDucking ? octoPork.duckHeight : octoPork.height)) {
        octoPork.y = platform.y - (octoPork.isDucking ? octoPork.duckHeight : octoPork.height);
        octoPork.velocityY = 0;
        octoPork.isJumping = false;
    }

    // Animate OctoPork
    octoPork.frameTimer++;
    if (octoPork.frameTimer >= octoPork.frameInterval) {
        octoPork.frame = (octoPork.frame + 1) % octoPork.frameCount;
        octoPork.frameTimer = 0;
    }

    // Draw OctoPork
    if (octoPork.isDucking) {
        ctx.drawImage(octoPorkDuck, octoPork.x, octoPork.y + (octoPork.height - octoPork.duckHeight), octoPork.width, octoPork.duckHeight);
    } else if (octoPork.isJumping) {
        ctx.drawImage(octoPorkJump, octoPork.x, octoPork.y, octoPork.width, octoPork.height);
    } else {
        ctx.drawImage(octoPorkStandSprites[octoPork.frame], octoPork.x, octoPork.y, octoPork.width, octoPork.height);
    }

    // Draw official with animation
    official.frameTimer++;
    if (official.frameTimer >= official.frameInterval) {
        official.frame = (official.frame + 1) % official.frameCount;
        official.frameTimer = 0;
    }
    ctx.drawImage(officialSprites[official.frame], official.x, official.y, official.width, official.height);

    // Draw money bag
    ctx.drawImage(moneyStack, moneyBag.x, moneyBag.y, moneyBag.width, moneyBag.height);

    // Spawn obstacles
    obstacleTimer++;
    if (obstacleTimer >= obstacleFrequency) {
        const isHigh = Math.random() > 0.5;
        obstacles.push({
            x: official.x,
            y: isHigh ? platform.y - 60 : platform.y - 20,
            width: 15,
            height: 15,
            speed: 4 + (octoPork.x / canvas.width) * 2,
            isHigh: isHigh,
            frame: 0,
            counted: false
        });
        obstacleTimer = 0;
    }

    // Update and draw obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= obs.speed;
        obs.frame = (obs.frame + 1) % 20;

        // Draw obstacle with animation
        const noticeSprite = obs.frame < 10 ? legalNoticeSprites[0] : legalNoticeSprites[1];
        ctx.drawImage(noticeSprite, obs.x, obs.y, obs.width, obs.height);

        // Collision detection
        const octoHeight = octoPork.isDucking ? octoPork.duckHeight : octoPork.height;
        if (
            octoPork.x < obs.x + obs.width &&
            octoPork.x + octoPork.width > obs.x &&
            octoPork.y < obs.y + obs.height &&
            octoPork.y + octoHeight > obs.y
        ) {
            octoPork.x = 50;
            obstacles = [];
            // Reset on collision (no "deaths" counter for simplicity)
        } else if (obs.x < octoPork.x && !obs.counted) {
            const amount = 10000;
            saved += amount;
            totalSaved += amount;
            savedDiv.textContent = `$PORK Freed: $${saved.toLocaleString()}`;
            totalDiv.textContent = `Total $PORK Freed: $${totalSaved.toLocaleString()}`;
            updateBadge();
            updateLevelDisplay();
            // chaChing.play().catch(() => {});
            // shredder.play().catch(() => {});
            submitScore();
            obs.counted = true;
        }

        // Remove off-screen obstacles
        if (obs.x < -obs.width) {
            obstacles.splice(i, 1);
        }
    }

    // Win condition (reach the money bag)
    if (
        octoPork.x + octoPork.width > moneyBag.x &&
        octoPork.y < moneyBag.y + moneyBag.height &&
        octoPork.y + (octoPork.isDucking ? octoPork.duckHeight : octoPork.height) > moneyBag.y
    ) {
        const amount = 1000000;
        saved += amount;
        totalSaved += amount;
        wins++;
        savedDiv.textContent = `$PORK Freed: $${saved.toLocaleString()}`;
        totalDiv.textContent = `Total $PORK Freed: $${totalSaved.toLocaleString()}`;
        updateBadge();
        updateLevelDisplay();
        // chaChing.play().catch(() => {});
        submitScore();
        alert(`You freed the money! +$1,000,000 $PORK\nLevel: ${currentLevel}`);
        octoPork.x = 50;
        obstacles = [];
        if (wins >= currentLevel * 5) {
            levelUp();
        }
    }

    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();