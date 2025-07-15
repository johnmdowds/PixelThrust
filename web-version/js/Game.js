class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Input handling
        this.keys = {};
        this.setupInput();
        
        // Game state
        this.lastTime = 0;
        this.running = false;
        this.levelComplete = false;
        this.currentLevel = 1; // Track current level
        this.gameStartTime = performance.now(); // Initialize immediately
        this.gameTime = 0; // Track time since game/level start
        
        // Terrain system - now using tiny blocks
        this.blockSize = 8;
        this.terrainBlocks = new Map(); // Use Map for efficient lookup: "x,y" -> block
        this.explosionParticles = [];
        
        // World bounds - no horizontal wrapping, vertical bounds
        this.worldWidth = 1200;
        this.worldHeight = 1600; // Increased height for vertical exploration
        
        // Check if we should load a custom level
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('custom') === 'true') {
            this.loadCustomLevel();
        } else {
            this.loadDefaultLevel();
        }
        
        // UI elements
        this.fuelBar = document.getElementById('fuelFill');
        this.velocityDisplay = document.getElementById('velocity');
    }
    
    loadDefaultLevel() {
        // Load level based on current level number
        switch (this.currentLevel) {
            case 1:
                this.createAlienPlanetLevel();
                break;
            case 2:
                this.createMarsLevel();
                break;
            default:
                // If no more levels, loop back to level 1
                this.currentLevel = 1;
                this.createAlienPlanetLevel();
                break;
        }
    }
    
    createAlienPlanetLevel() {
        // Player spawn - positioned just above the starting landing pad
        this.spawnPoint = { x: 600, y: 1380 }; // Just 40 pixels above the landing pad
        this.ship = new Ship(this.spawnPoint.x, this.spawnPoint.y);
        
        // Landing pads - green refuel pads and orange goal pad
        this.landingPads = [
            { x: 550, y: 1420, width: 100, height: 20 }, // Starting/refuel pad (green) - moved up
            { x: 200, y: 1200, width: 80, height: 20 },  // Mid-level refuel station (green)
            { x: 800, y: 800, width: 80, height: 20 },   // Upper refuel station (green)
            { x: 400, y: 400, width: 80, height: 20 },   // High refuel station (green)
        ];
        
        // Goal zone - orange landing pad at the top
        this.goalZones = [
            { x: 550, y: 100, width: 100, height: 20 } // Goal at the top (orange)
        ];
        
        // Reset level complete state
        this.levelComplete = false;
        
        // Generate terrain using tiny blocks
        this.generateBlockTerrain();
        
        // Generate palm trees made of blocks
        this.generatePalmTrees();
    }
    
    generateBlockTerrain() {
        // Clear existing terrain
        this.terrainBlocks.clear();
        
        // Generate ground level with rolling hills at the bottom
        for (let x = 0; x < this.worldWidth; x += this.blockSize) {
            const groundHeight = 1450 + Math.sin(x * 0.01) * 30 + Math.sin(x * 0.003) * 50;
            
            // Fill from ground to bottom
            for (let y = Math.floor(groundHeight); y < this.worldHeight; y += this.blockSize) {
                this.addTerrainBlock(x, y, this.getTerrainColor(y));
            }
        }
        
        // Add platforms for vertical progression - create a challenging path upward
        this.addPlatformBlocks(100, 1300, 200, 40, '#4a7c59');  // Platform 1
        this.addPlatformBlocks(500, 1200, 180, 30, '#4a7c59');  // Platform 2
        this.addPlatformBlocks(800, 1100, 150, 40, '#4a7c59');  // Platform 3
        this.addPlatformBlocks(200, 1000, 200, 30, '#4a7c59');  // Platform 4
        this.addPlatformBlocks(600, 900, 180, 40, '#4a7c59');   // Platform 5
        this.addPlatformBlocks(100, 800, 160, 30, '#4a7c59');   // Platform 6
        this.addPlatformBlocks(400, 700, 200, 40, '#4a7c59');   // Platform 7
        this.addPlatformBlocks(800, 600, 150, 30, '#4a7c59');   // Platform 8
        this.addPlatformBlocks(200, 500, 180, 40, '#4a7c59');   // Platform 9
        this.addPlatformBlocks(600, 400, 200, 30, '#4a7c59');   // Platform 10
        this.addPlatformBlocks(100, 300, 160, 40, '#4a7c59');   // Platform 11
        this.addPlatformBlocks(500, 200, 300, 50, '#4a7c59');   // Top platform
        
        // Add barriers and walls that require shooting through
        this.addWallBlocks(350, 1250, 40, 80, '#5a8c69');   // Barrier 1
        this.addWallBlocks(650, 1150, 30, 100, '#5a8c69');  // Barrier 2
        this.addWallBlocks(300, 950, 50, 80, '#5a8c69');    // Barrier 3
        this.addWallBlocks(500, 850, 40, 100, '#5a8c69');   // Barrier 4
        this.addWallBlocks(250, 750, 30, 80, '#5a8c69');    // Barrier 5
        this.addWallBlocks(650, 650, 50, 100, '#5a8c69');   // Barrier 6
        this.addWallBlocks(350, 550, 40, 80, '#5a8c69');    // Barrier 7
        this.addWallBlocks(150, 450, 30, 100, '#5a8c69');   // Barrier 8
        this.addWallBlocks(450, 350, 50, 80, '#5a8c69');    // Barrier 9
        this.addWallBlocks(250, 250, 40, 100, '#5a8c69');   // Barrier 10
    }
    
    addTerrainBlock(x, y, color) {
        const blockX = Math.floor(x / this.blockSize) * this.blockSize;
        const blockY = Math.floor(y / this.blockSize) * this.blockSize;
        const key = `${blockX},${blockY}`;
        this.terrainBlocks.set(key, { x: blockX, y: blockY, color });
    }
    
    addPlatformBlocks(x, y, width, height, color) {
        for (let px = x; px < x + width; px += this.blockSize) {
            for (let py = y; py < y + height; py += this.blockSize) {
                this.addTerrainBlock(px, py, color);
            }
        }
    }
    
    addWallBlocks(x, y, width, height, color) {
        for (let px = x; px < x + width; px += this.blockSize) {
            for (let py = y; py < y + height; py += this.blockSize) {
                this.addTerrainBlock(px, py, color);
            }
        }
    }
    
    getTerrainColor(y) {
        // Gradient from dark green at bottom to lighter green at top
        const depth = this.worldHeight - y;
        if (depth < 50) return '#2d5a3d'; // Deep earth
        if (depth < 100) return '#3d6a4d'; // Subsoil
        return '#4a7c59'; // Surface soil
    }
    
    generatePalmTrees() {
        // Generate palm trees at various heights made of blocks
        const treePositions = [
            { x: 300, y: 1500 },
            { x: 500, y: 1530 },
            { x: 750, y: 1520 },
            { x: 1000, y: 1500 },
            { x: 250, y: 1280 },
            { x: 650, y: 1180 },
            { x: 150, y: 1080 },
            { x: 550, y: 980 },
            { x: 750, y: 880 },
            { x: 150, y: 780 },
            { x: 450, y: 680 },
            { x: 850, y: 580 },
            { x: 250, y: 480 },
            { x: 650, y: 380 },
            { x: 150, y: 280 },
            { x: 750, y: 180 },
        ];
        
        for (const pos of treePositions) {
            this.generatePalmTreeBlocks(pos.x, pos.y);
        }
    }
    
    generatePalmTreeBlocks(x, y) {
        const trunkHeight = 40;
        const trunkColor = '#8B4513';
        const frondColor = '#228B22';
        
        // Tree trunk (2 blocks wide)
        for (let ty = y - trunkHeight; ty < y; ty += this.blockSize) {
            this.addTerrainBlock(x - this.blockSize, ty, trunkColor);
            this.addTerrainBlock(x, ty, trunkColor);
        }
        
        // Palm fronds - create blocky fronds
        const frondPositions = [
            { dx: -24, dy: -8 }, { dx: -16, dy: -16 }, { dx: -8, dy: -24 },
            { dx: 8, dy: -24 }, { dx: 16, dy: -16 }, { dx: 24, dy: -8 },
            { dx: -16, dy: 0 }, { dx: 16, dy: 0 },
            { dx: -8, dy: 8 }, { dx: 8, dy: 8 }
        ];
        
        for (const frond of frondPositions) {
            this.addTerrainBlock(x + frond.dx, y - trunkHeight + frond.dy, frondColor);
        }
    }
    
    createMarsLevel() {
        // Player spawn - positioned just above the starting landing pad
        this.spawnPoint = { x: 600, y: 1380 };
        this.ship = new Ship(this.spawnPoint.x, this.spawnPoint.y);
        
        // Landing pads - blue refuel pads (Mars atmosphere effect)
        this.landingPads = [
            { x: 550, y: 1420, width: 100, height: 20 }, // Starting/refuel pad
            { x: 100, y: 1300, width: 80, height: 20 },  // Left side refuel
            { x: 900, y: 1250, width: 80, height: 20 },  // Right side refuel
            { x: 300, y: 1100, width: 80, height: 20 },  // Mid-left refuel
            { x: 750, y: 950, width: 80, height: 20 },   // Mid-right refuel
            { x: 150, y: 800, width: 80, height: 20 },   // Upper left refuel
            { x: 850, y: 650, width: 80, height: 20 },   // Upper right refuel
            { x: 450, y: 500, width: 80, height: 20 },   // High refuel station
        ];
        
        // Goal zone - red landing pad at the top (Mars theme)
        this.goalZones = [
            { x: 500, y: 200, width: 200, height: 20 } // Large goal at the top
        ];
        
        // Reset level complete state
        this.levelComplete = false;
        
        // Generate Mars terrain
        this.generateMarsBlockTerrain();
        
        // Generate Mars rock formations
        this.generateMarsRockFormations();
    }
    
    generateMarsBlockTerrain() {
        // Clear existing terrain
        this.terrainBlocks.clear();
        
        // Generate Mars-like ground with rusty red colors and rocky terrain
        for (let x = 0; x < this.worldWidth; x += this.blockSize) {
            const groundHeight = 1450 + Math.sin(x * 0.008) * 40 + Math.sin(x * 0.002) * 80;
            
            // Fill from ground to bottom with Mars colors
            for (let y = Math.floor(groundHeight); y < this.worldHeight; y += this.blockSize) {
                this.addTerrainBlock(x, y, this.getMarsTerrainColor(y));
            }
        }
        
        // Add Mars canyon walls and plateaus - more dramatic terrain
        this.addPlatformBlocks(50, 1350, 150, 60, '#8B4513');   // Deep canyon wall
        this.addPlatformBlocks(300, 1300, 200, 40, '#CD853F');  // Mars plateau 1
        this.addPlatformBlocks(700, 1250, 180, 80, '#A0522D');  // Mars plateau 2
        this.addPlatformBlocks(150, 1200, 160, 50, '#8B4513');  // Rocky outcrop
        this.addPlatformBlocks(600, 1150, 220, 60, '#CD853F');  // Large plateau
        this.addPlatformBlocks(100, 1050, 140, 40, '#A0522D');  // Mid-level platform
        this.addPlatformBlocks(500, 1000, 200, 70, '#8B4513');  // Upper plateau
        this.addPlatformBlocks(800, 950, 160, 50, '#CD853F');   // Right side platform
        this.addPlatformBlocks(200, 900, 180, 60, '#A0522D');   // Left canyon wall
        this.addPlatformBlocks(650, 850, 190, 40, '#8B4513');   // High plateau
        this.addPlatformBlocks(100, 750, 150, 80, '#CD853F');   // Very high left
        this.addPlatformBlocks(400, 700, 220, 50, '#A0522D');   // Near-top plateau
        this.addPlatformBlocks(750, 650, 170, 60, '#8B4513');   // High right
        this.addPlatformBlocks(200, 600, 160, 40, '#CD853F');   // Upper left
        this.addPlatformBlocks(550, 550, 200, 70, '#A0522D');   // High central
        this.addPlatformBlocks(100, 450, 180, 50, '#8B4513');   // Near summit left
        this.addPlatformBlocks(700, 400, 150, 60, '#CD853F');   // Near summit right
        this.addPlatformBlocks(350, 350, 300, 40, '#A0522D');   // Wide summit approach
        this.addPlatformBlocks(450, 250, 400, 80, '#8B4513');   // Summit plateau
        
        // Add Mars-specific barriers - more challenging
        this.addWallBlocks(400, 1300, 60, 120, '#654321');  // Canyon barrier
        this.addWallBlocks(750, 1200, 40, 150, '#654321');  // Tall wall
        this.addWallBlocks(250, 1100, 80, 100, '#654321');  // Rocky wall
        this.addWallBlocks(600, 1000, 50, 130, '#654321');  // Mid barrier
        this.addWallBlocks(150, 900, 70, 110, '#654321');   // Left wall
        this.addWallBlocks(850, 850, 60, 140, '#654321');   // Right wall
        this.addWallBlocks(400, 750, 90, 120, '#654321');   // Central barrier
        this.addWallBlocks(700, 650, 50, 100, '#654321');   // Upper barrier
        this.addWallBlocks(200, 550, 80, 130, '#654321');   // High wall
        this.addWallBlocks(650, 450, 60, 110, '#654321');   // Near-top barrier
    }
    
    generateMarsRockFormations() {
        // Generate Mars-specific rock formations and boulders
        const rockFormations = [
            { x: 200, y: 1400, size: 'large' },
            { x: 450, y: 1380, size: 'medium' },
            { x: 800, y: 1350, size: 'large' },
            { x: 100, y: 1250, size: 'small' },
            { x: 350, y: 1200, size: 'medium' },
            { x: 650, y: 1150, size: 'large' },
            { x: 900, y: 1100, size: 'small' },
            { x: 250, y: 1000, size: 'medium' },
            { x: 550, y: 950, size: 'large' },
            { x: 750, y: 900, size: 'small' },
            { x: 150, y: 850, size: 'medium' },
            { x: 450, y: 800, size: 'large' },
            { x: 700, y: 750, size: 'small' },
            { x: 300, y: 700, size: 'medium' },
            { x: 600, y: 650, size: 'large' },
            { x: 850, y: 600, size: 'small' },
            { x: 200, y: 550, size: 'medium' },
            { x: 500, y: 500, size: 'large' },
            { x: 750, y: 450, size: 'small' },
            { x: 350, y: 400, size: 'medium' },
            { x: 650, y: 350, size: 'large' },
        ];
        
        for (const rock of rockFormations) {
            this.generateMarsRockBlocks(rock.x, rock.y, rock.size);
        }
    }
    
    generateMarsRockBlocks(x, y, size) {
        const rockColor = '#8B4513';
        const darkRockColor = '#654321';
        
        let width, height;
        switch (size) {
            case 'small':
                width = 24;
                height = 16;
                break;
            case 'medium':
                width = 40;
                height = 32;
                break;
            case 'large':
                width = 64;
                height = 48;
                break;
        }
        
        // Create irregular rock shape
        for (let rx = 0; rx < width; rx += this.blockSize) {
            for (let ry = 0; ry < height; ry += this.blockSize) {
                // Create irregular edges
                const edgeChance = (rx === 0 || rx >= width - this.blockSize || ry === 0 || ry >= height - this.blockSize) ? 0.7 : 1.0;
                if (Math.random() < edgeChance) {
                    const color = Math.random() < 0.3 ? darkRockColor : rockColor;
                    this.addTerrainBlock(x + rx - width/2, y + ry - height, color);
                }
            }
        }
    }
    
    getMarsTerrainColor(y) {
        // Mars-like color gradient - rusty reds and browns
        const depth = y - 1450;
        if (depth < 50) {
            return '#CD853F'; // Sandy brown surface
        } else if (depth < 100) {
            return '#A0522D'; // Sienna
        } else if (depth < 150) {
            return '#8B4513'; // Saddle brown
        } else {
            return '#654321'; // Dark brown depths
        }
    }
    
    loadCustomLevel() {
        try {
            const levelData = JSON.parse(localStorage.getItem('customLevel'));
            this.terrainBlocks = new Map(levelData.terrainBlocks || []);
            this.landingPads = levelData.landingPads || [];
            this.goalZones = levelData.goalZones || [];
            this.spawnPoint = levelData.spawnPoint || { x: 600, y: 1400 };
            this.ship = new Ship(this.spawnPoint.x, this.spawnPoint.y);
        } catch (e) {
            console.error('Failed to load custom level, using default');
            this.loadDefaultLevel();
        }
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'KeyR') {
                this.restart();
            }
            
            if (e.code === 'Enter' && this.levelComplete) {
                console.log('🚀 Player wants to progress to next level!');
                this.nextLevel();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    getInput() {
        return {
            left: this.keys['KeyA'] || this.keys['ArrowLeft'],
            right: this.keys['KeyD'] || this.keys['ArrowRight'],
            thrust: this.keys['Space'],
            shoot: this.keys['KeyS'] || this.keys['ArrowUp']
        };
    }
    
    start() {
        this.running = true;
        this.paused = false;
        this.gameStartTime = performance.now(); // Reset game start time
        this.gameTime = 0; // Reset game time
        this.lastTime = performance.now();
        this.animationId = null;
        this.gameLoop();
    }
    
    stop() {
        this.running = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    pause() {
        this.paused = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    resume() {
        this.paused = false;
        if (!this.animationId && this.running) {
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }
    
    isPaused() {
        return this.paused || false;
    }
    
    restart() {
        this.ship.reset(this.spawnPoint.x, this.spawnPoint.y);
        this.levelComplete = false; // Reset level complete state
        this.gameStartTime = performance.now(); // Reset game start time
        this.gameTime = 0; // Reset game time
    }
    
    nextLevel() {
        this.currentLevel++;
        console.log(`🚀 Advancing to level ${this.currentLevel}!`);
        this.levelComplete = false;
        this.gameStartTime = performance.now();
        this.gameTime = 0;
        
        // Clear existing particles
        this.explosionParticles = [];
        
        // Load the next level
        this.loadDefaultLevel();
    }
    
    gameLoop(currentTime = 0) {
        if (!this.running || this.paused) return;
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Update game time
        this.gameTime = (currentTime - this.gameStartTime) / 1000;
        
        // Update
        this.update(deltaTime);
        
        // Render
        this.render();
        
        // Continue loop
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        if (!this.running) return;
        
        // Update ship
        const input = this.getInput();
        this.ship.update(deltaTime, input);
        
        // Update ship bullets with world dimensions
        this.ship.updateBullets(deltaTime, this.worldWidth, this.worldHeight);
        
        // Apply world boundaries - no horizontal wrapping
        if (this.ship.position.x < 0) {
            this.ship.position.x = 0;
            this.ship.velocity.x = Math.max(0, this.ship.velocity.x);
        }
        if (this.ship.position.x > this.worldWidth) {
            this.ship.position.x = this.worldWidth;
            this.ship.velocity.x = Math.min(0, this.ship.velocity.x);
        }
        
        // Vertical boundaries
        if (this.ship.position.y < 0) {
            this.ship.position.y = 0;
            this.ship.velocity.y = Math.max(0, this.ship.velocity.y);
        }
        if (this.ship.position.y > this.worldHeight) {
            this.ship.position.y = this.worldHeight;
            this.ship.velocity.y = Math.min(0, this.ship.velocity.y);
        }
        
        // Update explosion particles
        this.updateExplosionParticles(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        this.checkBulletCollisions();
        
        // Update UI
        this.updateUI();
    }
    
    updateExplosionParticles(deltaTime) {
        for (let i = this.explosionParticles.length - 1; i >= 0; i--) {
            const particle = this.explosionParticles[i];
            particle.life -= deltaTime;
            
            if (particle.life <= 0) {
                this.explosionParticles.splice(i, 1);
                continue;
            }
            
            // Update particle position
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            // Apply gravity to particles
            particle.vy += 200 * deltaTime;
            
            // Fade out
            particle.alpha = particle.life / particle.maxLife;
        }
    }
    
    createExplosion(x, y, color) {
        // Create explosion particles
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            
            this.explosionParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5 + Math.random() * 0.5,
                maxLife: 0.5 + Math.random() * 0.5,
                alpha: 1.0,
                color: color,
                size: 2 + Math.random() * 3
            });
        }
    }
    
    checkCollisions() {
        const shipPos = this.ship.position;
        const shipSize = this.ship.size;
        const speed = this.ship.getSpeed();
        
        // Reset landing state each frame
        this.ship.isLanded = false;
        
        // Don't check landing for a short time after takeoff to prevent bouncing
        const takeoffBuffer = 0.2; // 0.2 seconds
        if (this.ship.takeoffTime < takeoffBuffer) {
            return;
        }
        
        // Check landing pad collisions first (priority over terrain)
        for (const pad of this.landingPads) {
            if (shipPos.x + shipSize/2 > pad.x && shipPos.x - shipSize/2 < pad.x + pad.width &&
                shipPos.y + shipSize >= pad.y && shipPos.y + shipSize <= pad.y + pad.height + 8) {
                
                if (speed < this.ship.landingVelocityThreshold && Math.abs(this.ship.velocity.y) < 100) {
                    // Successful landing on pad - very forgiving
                    this.ship.velocity = new Vector2(0, 0);
                    this.ship.position.y = pad.y - shipSize; // Snap to pad surface
                    this.ship.isLanded = true;
                    this.ship.refuel();
                    console.log('⛽ LANDED! REFUELED!');
                    return; // Don't check other collisions
                } else {
                    // Crash landing - restart immediately
                    console.log(`DEBUG: Crash landing - speed=${speed.toFixed(1)} >= ${this.ship.landingVelocityThreshold} OR velY=${Math.abs(this.ship.velocity.y).toFixed(1)} >= 100`);
                    this.restart();
                    console.log('💥 Crashed on landing pad! Too fast!');
                    return;
                }
            }
        }
        
        // Check goal zone collisions
        if (this.goalZones) {
            for (const goal of this.goalZones) {
                if (shipPos.x + shipSize/2 > goal.x && shipPos.x - shipSize/2 < goal.x + goal.width &&
                    shipPos.y + shipSize >= goal.y && shipPos.y + shipSize <= goal.y + goal.height + 8) {
                    
                    if (speed < this.ship.landingVelocityThreshold && Math.abs(this.ship.velocity.y) < 100) {
                        // Goal reached! - very forgiving
                        this.ship.velocity = new Vector2(0, 0);
                        this.ship.position.y = goal.y - shipSize; // Snap to goal surface
                        this.ship.isLanded = true;
                        this.ship.refuel();
                        console.log('🎉 GOAL REACHED! LEVEL COMPLETE!');
                        this.levelComplete = true;
                        return; // Don't check other collisions
                    } else {
                        // Crash landing - restart immediately
                        console.log(`DEBUG: Goal crash - speed=${speed.toFixed(1)} >= ${this.ship.landingVelocityThreshold} OR velY=${Math.abs(this.ship.velocity.y).toFixed(1)} >= 100`);
                        this.restart();
                        console.log('💥 Crashed into goal! Too fast!');
                        return;
                    }
                }
            }
        }
        
        // Check terrain collisions - allow soft landings on flat surfaces
        for (const block of this.terrainBlocks.values()) {
            if (shipPos.x + shipSize/2 > block.x && shipPos.x - shipSize/2 < block.x + this.blockSize &&
                shipPos.y + shipSize > block.y && shipPos.y < block.y + this.blockSize) {
                
                // Check if this is a soft landing on top of terrain (landing from above)
                if (speed < this.ship.landingVelocityThreshold && 
                    Math.abs(this.ship.velocity.y) < 100 && 
                    shipPos.y + shipSize <= block.y + 8 && // Landing on top
                    this.ship.velocity.y >= 0) { // Moving downward or stopped
                    
                    // Soft landing on terrain - no refuel, no message
                    this.ship.velocity = new Vector2(0, 0);
                    this.ship.position.y = block.y - shipSize; // Snap to terrain surface
                    this.ship.isLanded = true;
                    // No refuel on terrain landing
                    // No console message for terrain landing
                    return; // Don't check other collisions
                } else {
                    // Crash into terrain (side collision or too fast)
                    this.restart();
                    console.log('💥 Crashed into terrain!');
                    return;
                }
            }
        }
    }
    
    checkBulletCollisions() {
        for (const bullet of this.ship.bullets) {
            if (!bullet.isAlive()) continue;
            
            // Check bullet vs terrain blocks
            const bulletBlockX = Math.floor(bullet.position.x / this.blockSize) * this.blockSize;
            const bulletBlockY = Math.floor(bullet.position.y / this.blockSize) * this.blockSize;
            
            // Check a small area around the bullet for block collisions
            for (let dx = -this.blockSize; dx <= this.blockSize; dx += this.blockSize) {
                for (let dy = -this.blockSize; dy <= this.blockSize; dy += this.blockSize) {
                    const checkX = bulletBlockX + dx;
                    const checkY = bulletBlockY + dy;
                    const blockKey = `${checkX},${checkY}`;
                    
                    if (this.terrainBlocks.has(blockKey)) {
                        const block = this.terrainBlocks.get(blockKey);
                        
                        if (bullet.position.x > block.x && bullet.position.x < block.x + this.blockSize &&
                            bullet.position.y > block.y && bullet.position.y < block.y + this.blockSize) {
                            
                            // Destroy bullet
                            bullet.life = 0;
                            
                            // Create explosion effect
                            this.createExplosion(bullet.position.x, bullet.position.y, block.color);
                            
                            // Damage terrain - create a small crater
                            this.damageTerrain(bullet.position.x, bullet.position.y, bullet.damage);
                            return;
                        }
                    }
                }
            }
        }
    }
    
    damageTerrain(x, y, damage) {
        // Create a circular crater by removing blocks in a radius
        const craterRadius = damage; // Use bullet damage as crater radius
        const centerBlockX = Math.floor(x / this.blockSize) * this.blockSize;
        const centerBlockY = Math.floor(y / this.blockSize) * this.blockSize;
        
        // Remove blocks in a circular pattern
        for (let dx = -craterRadius; dx <= craterRadius; dx += this.blockSize) {
            for (let dy = -craterRadius; dy <= craterRadius; dy += this.blockSize) {
                const blockX = centerBlockX + dx;
                const blockY = centerBlockY + dy;
                
                // Check if this block is within the crater radius
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= craterRadius) {
                    const blockKey = `${blockX},${blockY}`;
                    if (this.terrainBlocks.has(blockKey)) {
                        this.terrainBlocks.delete(blockKey);
                    }
                }
            }
        }
    }
    
    updateUI() {
        // Update fuel bar
        const fuelPercentage = this.ship.getFuelPercentage() * 100;
        this.fuelBar.style.width = `${fuelPercentage}%`;
        
        // Update velocity display
        const speed = this.ship.getSpeed();
        this.velocityDisplay.textContent = Math.round(speed);
    }
    
    render() {
        // Clear canvas with level-appropriate background
        if (this.currentLevel === 2) {
            // Mars atmosphere - reddish sky
            this.ctx.fillStyle = '#2e1a0a';
        } else {
            // Space background for alien planet
            this.ctx.fillStyle = '#0a0a2e';
        }
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context for camera transform
        this.ctx.save();
        
        // Camera follows ship with expanded vertical bounds
        const cameraX = Math.max(0, Math.min(this.ship.position.x - this.canvas.width / 2, this.worldWidth - this.canvas.width));
        const cameraY = Math.max(0, Math.min(this.ship.position.y - this.canvas.height / 2, this.worldHeight - this.canvas.height));
        this.ctx.translate(-cameraX, -cameraY);
        
        // Draw stars background
        this.drawStars();
        
        // Draw terrain blocks
        for (const block of this.terrainBlocks.values()) {
            // Only draw blocks that are visible on screen
            if (block.x + this.blockSize >= cameraX && block.x <= cameraX + this.canvas.width &&
                block.y + this.blockSize >= cameraY && block.y <= cameraY + this.canvas.height) {
                
                this.ctx.fillStyle = block.color || '#444';
                this.ctx.fillRect(block.x, block.y, this.blockSize, this.blockSize);
                
                // Add subtle block outline for better visibility
                this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                this.ctx.lineWidth = 0.5;
                this.ctx.strokeRect(block.x, block.y, this.blockSize, this.blockSize);
            }
        }
        
        // Draw landing pads
        const padColor = this.currentLevel === 2 ? '#0066ff' : '#00ff00'; // Blue for Mars, green for alien planet
        this.ctx.fillStyle = padColor;
        for (const pad of this.landingPads) {
            this.ctx.fillRect(pad.x, pad.y, pad.width, pad.height);
            
            // Draw landing pad indicators
            this.ctx.fillStyle = padColor;
            this.ctx.fillRect(pad.x + 10, pad.y - 5, 5, 5);
            this.ctx.fillRect(pad.x + pad.width - 15, pad.y - 5, 5, 5);
        }
        
        // Draw goal zones
        if (this.goalZones) {
            const goalColor = this.currentLevel === 2 ? '#ff3300' : '#ff6600'; // Brighter red for Mars
            this.ctx.fillStyle = goalColor;
            for (const goal of this.goalZones) {
                this.ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
                
                // Draw flag
                const flagColor = this.currentLevel === 2 ? '#ffaa00' : '#ffff00'; // Orange flag for Mars
                this.ctx.fillStyle = flagColor;
                this.ctx.fillRect(goal.x + goal.width/2 - 2, goal.y - 30, 4, 30);
                this.ctx.fillRect(goal.x + goal.width/2 + 2, goal.y - 25, 15, 10);
            }
        }
        
        // Draw explosion particles
        for (const particle of this.explosionParticles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
            this.ctx.restore();
        }
        
        // Draw ship
        this.ship.render(this.ctx);
        
        // Restore context after world rendering
        this.ctx.restore();
        
        // Draw UI elements in screen space
        
        // Draw level indicator
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Courier New';
        this.ctx.textAlign = 'left';
        const levelName = this.currentLevel === 1 ? 'Alien Planet' : this.currentLevel === 2 ? 'Mars' : `Level ${this.currentLevel}`;
        this.ctx.fillText(`Level ${this.currentLevel}: ${levelName}`, 10, 30);
        
        if (this.ship.isLanded && !this.levelComplete) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = '24px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('LANDED! REFUELED!', this.canvas.width / 2, 50);
        }
        
        if (this.levelComplete) {
            this.ctx.fillStyle = '#ff6600';
            this.ctx.font = '28px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`🎉 LEVEL ${this.currentLevel} COMPLETE! 🎉`, this.canvas.width / 2, 50);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '18px Courier New';
            if (this.currentLevel === 1) {
                this.ctx.fillText('Press ENTER to travel to Mars!', this.canvas.width / 2, 80);
            } else if (this.currentLevel === 2) {
                this.ctx.fillText('Press ENTER to continue exploring!', this.canvas.width / 2, 80);
            } else {
                this.ctx.fillText('Press ENTER to continue to next level', this.canvas.width / 2, 80);
            }
        }
    }
    
    drawStars() {
        // Simple star field covering expanded world
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 200; i++) {
            const x = (i * 137.5) % this.worldWidth;
            const y = (i * 73.3) % this.worldHeight;
            const size = (i % 3) + 1;
            this.ctx.fillRect(x, y, size, size);
        }
    }
    
    drawPalmTree(x, y) {
        this.ctx.save();
        
        // Tree trunk
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x - 3, y - 40, 6, 40);
        
        // Palm fronds
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        
        // Draw 6 fronds
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const endX = x + Math.cos(angle) * 20;
            const endY = y - 40 + Math.sin(angle) * 15;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - 40);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
} 