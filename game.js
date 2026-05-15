// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 32;
const GRID_WIDTH = canvas.width / TILE_SIZE;
const GRID_HEIGHT = canvas.height / TILE_SIZE;

// Player object
const player = {
    x: 5,
    y: 5,
    width: 1,
    height: 1,
    speed: 0.15,
    vx: 0,
    vy: 0,
    color: '#e74c3c'
};

// Game state
let gameState = {
    roses: 0,
    currentLocation: 0,
    discoveredPictures: [],
    gameRunning: true
};

// Locations with their own tilemaps
const locations = [
    {
        name: 'Starting Garden',
        description: 'A peaceful garden filled with flowers',
        tiles: generateGarden(),
        objects: [
            { x: 3, y: 3, type: 'rose', id: 'rose_1' },
            { x: 7, y: 4, type: 'rose', id: 'rose_2' },
            { x: 12, y: 8, type: 'door', targetLocation: 1, label: '1' },
            { x: 2, y: 2, type: 'picture', pictureName: 'Mysterious Smile', id: 'pic_1' }
        ]
    },
    {
        name: 'Dark Forest',
        description: 'A mysterious forest shrouded in shadows',
        tiles: generateForest(),
        objects: [
            { x: 8, y: 2, type: 'rose', id: 'rose_3' },
            { x: 3, y: 10, type: 'door', targetLocation: 0, label: '0' },
            { x: 10, y: 6, type: 'picture', pictureName: 'Glowing Eyes', id: 'pic_2' },
            { x: 5, y: 5, type: 'rose', id: 'rose_4' }
        ]
    },
    {
        name: 'Abandoned Temple',
        description: 'Ancient ruins covered in strange symbols',
        tiles: generateTemple(),
        objects: [
            { x: 6, y: 4, type: 'rose', id: 'rose_5' },
            { x: 15, y: 10, type: 'door', targetLocation: 0, label: '0' },
            { x: 2, y: 8, type: 'picture', pictureName: 'Hieroglyphic Mystery', id: 'pic_3' },
            { x: 10, y: 3, type: 'rose', id: 'rose_6' }
        ]
    },
    {
        name: 'Cosmic Void',
        description: 'A strange realm filled with otherworldly phenomena',
        tiles: generateVoid(),
        objects: [
            { x: 8, y: 8, type: 'rose', id: 'rose_7' },
            { x: 3, y: 3, type: 'picture', pictureName: 'Impossible Geometry', id: 'pic_4' },
            { x: 14, y: 14, type: 'door', targetLocation: 0, label: '0' },
            { x: 12, y: 5, type: 'rose', id: 'rose_8' }
        ]
    }
];

// Tile generation functions
function generateGarden() {
    const tiles = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (Math.random() < 0.1) {
                tiles.push({ x, y, type: 'flower', color: '#9b59b6' });
            } else {
                tiles.push({ x, y, type: 'grass', color: '#27ae60' });
            }
        }
    }
    return tiles;
}

function generateForest() {
    const tiles = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (Math.random() < 0.15) {
                tiles.push({ x, y, type: 'tree', color: '#16a085' });
            } else {
                tiles.push({ x, y, type: 'dark_grass', color: '#1e8449' });
            }
        }
    }
    return tiles;
}

function generateTemple() {
    const tiles = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if ((x + y) % 4 === 0) {
                tiles.push({ x, y, type: 'stone', color: '#7f8c8d' });
            } else {
                tiles.push({ x, y, type: 'ancient_stone', color: '#95a5a6' });
            }
        }
    }
    return tiles;
}

function generateVoid() {
    const tiles = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const rand = Math.random();
            if (rand < 0.3) {
                tiles.push({ x, y, type: 'void', color: '#2c3e50' });
            } else if (rand < 0.6) {
                tiles.push({ x, y, type: 'star', color: '#34495e' });
            } else {
                tiles.push({ x, y, type: 'cosmic', color: '#2a3f5f' });
            }
        }
    }
    return tiles;
}

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;

    if (e.key.toLowerCase() === 'g') {
        openGallery();
    }
    if (e.key === ' ') {
        e.preventDefault();
        interact();
    }
    if (e.key.toLowerCase() === 'e') {
        interact();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Update player movement
function updatePlayer() {
    if (!gameState.gameRunning) return;
    
    player.vx = 0;
    player.vy = 0;

    if (keys['arrowup'] || keys['w']) player.vy = -player.speed;
    if (keys['arrowdown'] || keys['s']) player.vy = player.speed;
    if (keys['arrowleft'] || keys['a']) player.vx = -player.speed;
    if (keys['arrowright'] || keys['d']) player.vx = player.speed;

    player.x += player.vx;
    player.y += player.vy;

    // Boundary check
    player.x = Math.max(0, Math.min(GRID_WIDTH - 1, player.x));
    player.y = Math.max(0, Math.min(GRID_HEIGHT - 1, player.y));
}

// Interact with objects
function interact() {
    const currentLoc = locations[gameState.currentLocation];
    const playerGridX = Math.floor(player.x);
    const playerGridY = Math.floor(player.y);

    for (let obj of currentLoc.objects) {
        const dist = Math.hypot(obj.x - playerGridX, obj.y - playerGridY);
        if (dist < 1.5) {
            if (obj.type === 'rose') {
                collectRose(obj);
            } else if (obj.type === 'door') {
                changeLoc(obj.targetLocation);
            } else if (obj.type === 'picture') {
                viewPicture(obj);
            }
        }
    }
}

function collectRose(rose) {
    gameState.roses++;
    const loc = locations[gameState.currentLocation];
    loc.objects = loc.objects.filter(obj => obj.id !== rose.id);
    updateHUD();
}

function changeLoc(locIndex) {
    gameState.currentLocation = locIndex;
    player.x = 5;
    player.y = 5;
    updateHUD();
}

function viewPicture(picture) {
    if (!gameState.discoveredPictures.find(p => p.id === picture.id)) {
        gameState.discoveredPictures.push({
            id: picture.id,
            name: picture.pictureName,
            image: generateWeirdImage(),
            comments: []
        });
    }
    openPictureView(picture.id);
}

// Generate weird pixel art images
function generateWeirdImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    // Random color scheme
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e91e63', '#00bcd4'];
    const bgColor = colors[Math.floor(Math.random() * colors.length)];
    const fgColor = colors[Math.floor(Math.random() * colors.length)];

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 200, 200);

    // Draw weird shapes
    ctx.fillStyle = fgColor;
    for (let i = 0; i < 5; i++) {
        const size = Math.random() * 60 + 20;
        const x = Math.random() * (200 - size);
        const y = Math.random() * (200 - size);
        if (Math.random() > 0.5) {
            ctx.fillRect(x, y, size, size);
        } else {
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Add eyes or symbols
    ctx.fillStyle = '#000';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(Math.random() * 180 + 10, Math.random() * 180 + 10, 8, 8);
    }

    return canvas.toDataURL();
}

// HUD update
function updateHUD() {
    document.getElementById('roseCount').textContent = gameState.roses;
    document.getElementById('locationName').textContent = locations[gameState.currentLocation].name;
}

// Draw functions
function drawTiles() {
    const currentLoc = locations[gameState.currentLocation];
    for (let tile of currentLoc.tiles) {
        ctx.fillStyle = tile.color;
        ctx.fillRect(tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
}

function drawObjects() {
    const currentLoc = locations[gameState.currentLocation];
    for (let obj of currentLoc.objects) {
        ctx.save();
        ctx.translate((obj.x + 0.5) * TILE_SIZE, (obj.y + 0.5) * TILE_SIZE);

        if (obj.type === 'rose') {
            ctx.fillStyle = '#e91e63';
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#c2185b';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (obj.type === 'door') {
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(-12, -12, 24, 24);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(-4, -4, 8, 8);
            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(obj.label, 0, 0);
        } else if (obj.type === 'picture') {
            ctx.fillStyle = '#ecf0f1';
            ctx.fillRect(-14, -14, 28, 28);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(-10, -10, 20, 20);
            ctx.fillStyle = '#3498db';
            ctx.fillRect(-6, -6, 12, 12);
        }
        ctx.restore();
    }
}

function drawPlayer() {
    ctx.save();
    ctx.translate((player.x + 0.5) * TILE_SIZE, (player.y + 0.5) * TILE_SIZE);
    ctx.fillStyle = player.color;
    ctx.fillRect(-10, -10, 20, 20);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-4, -6, 3, 4);
    ctx.fillRect(1, -6, 3, 4);
    ctx.restore();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * TILE_SIZE, 0);
        ctx.lineTo(x * TILE_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * TILE_SIZE);
        ctx.lineTo(canvas.width, y * TILE_SIZE);
        ctx.stroke();
    }
}

// Main game loop - ALWAYS runs, but only updates when gameRunning is true
function gameLoop() {
    updatePlayer();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTiles();
    drawGrid();
    drawObjects();
    drawPlayer();

    requestAnimationFrame(gameLoop);
}

// Start game
updateHUD();
gameLoop();
