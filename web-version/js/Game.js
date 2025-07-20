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
        
        // Always start with default level 1 when starting normally
        this.loadDefaultLevel();
        
        // UI elements
        this.fuelBar = document.getElementById('fuelFill');
        this.velocityDisplay = document.getElementById('velocity');
    }
    
    loadDefaultLevel() {
        console.log(`🌍 Loading default level ${this.currentLevel}...`);
        // Clear all level-specific data structures to prevent conflicts
        this.clearLevelData();
        
        // Load level based on current level number
        switch (this.currentLevel) {
            case 1:
                console.log('🌍 Creating Earth level...');
                this.createEarthLevel();
                break;
            case 2:
                console.log('🌙 Creating Moon level...');
                this.createMercuryLevel();
                break;
            case 3:
                console.log('🔴 Creating Mars level...');
                this.createMarsLevel();
                break;
            case 4:
                console.log('☄️ Creating Asteroid Belt level...');
                this.createAsteroidBeltLevel();
                break;
            case 5:
                console.log('🪐 Creating Jupiter level...');
                this.createJupiterLevel();
                break;
            default:
                console.log('❌ No more levels, returning to main menu');
                // If no more levels, return to main menu
                this.returnToMainMenu();
                break;
        }
        console.log(`✅ Level ${this.currentLevel} loaded successfully`);
    }
    
    clearLevelData() {
        console.log('🧹 Clearing level data...');
        
        // Reset world dimensions to default - important for cleaning up after Jupiter/Saturn
        this.worldWidth = 1200;
        this.worldHeight = 1600;
        
        // Clear terrain blocks
        this.terrainBlocks.clear();
        
        // Clear landing pads and goal zones
        this.landingPads = [];
        this.goalZones = [];
        
        // Clear level-specific arrays
        this.floatingAsteroids = [];
        this.jupiterMoons = [];
        this.jupiterDebris = [];
        this.asteroidDebris = [];
        
        // Clear explosion particles
        this.explosionParticles = [];
        
        // Reset level state
        this.levelComplete = false;
        
        // Completely destroy the old ship to prevent state conflicts
        this.ship = null;
        this.spawnPoint = null;
        

        
        console.log('🧹 Level data cleared successfully');
    }
    
    createEarthLevel() {
        console.log('🌍 Setting up Earth level...');
        
        // Set world dimensions for Earth
        this.worldWidth = 1200;
        this.worldHeight = 1600;
        
        // Player spawn - positioned just above the starting landing pad
        this.spawnPoint = { x: 600, y: 1380 }; // Just 40 pixels above the landing pad
        this.ship = new Ship(this.spawnPoint.x, this.spawnPoint.y);
        this.ship.isLanded = false; // Ensure ship starts in flight mode
        this.ship.takeoffTime = 0.6; // Start with takeoff buffer to prevent immediate landing
        console.log(`🚀 Ship created at ${this.spawnPoint.x}, ${this.spawnPoint.y}`);
        console.log(`🚀 Ship position: ${this.ship.position.x}, ${this.ship.position.y}`);
        console.log(`🚀 Ship isLanded: ${this.ship.isLanded}`);
        
        // Landing pads - green refuel pads and orange goal pad
        this.landingPads = [
            { x: 550, y: 1420, width: 100, height: 20 }, // Starting/refuel pad (green) - moved up
            { x: 200, y: 1200, width: 80, height: 20 },  // Mid-level refuel station (green)
            { x: 800, y: 800, width: 80, height: 20 },   // Upper refuel station (green)
            { x: 400, y: 400, width: 80, height: 20 },   // High refuel station (green)
        ];
        console.log(`🛬 Created ${this.landingPads.length} landing pads`);
        
        // Goal zone - orange landing pad at the top
        this.goalZones = [
            { x: 550, y: 100, width: 100, height: 20 } // Goal at the top (orange)
        ];
        console.log(`🎯 Created ${this.goalZones.length} goal zones`);
        
        // Reset level complete state
        this.levelComplete = false;
        
        // Generate terrain using tiny blocks
        console.log('🏔️ Generating terrain...');
        this.generateBlockTerrain();
        console.log(`🏔️ Generated ${this.terrainBlocks.size} terrain blocks`);
        
        // Generate palm trees made of blocks
        console.log('🌴 Generating palm trees...');
        this.generatePalmTrees();
        console.log('🌍 Earth level setup complete!');
    }
    
    generateBlockTerrain() {
        // Clear existing terrain
        this.terrainBlocks.clear();
        
        // Generate ground level with rolling hills at the bottom
        for (let x = 0; x < this.worldWidth; x += this.blockSize) {
            const groundHeight = 1450 + Math.sin(x * 0.01) * 30 + Math.sin(x * 0.003) * 50;
            
            // Fill from ground to bottom, but limit depth to prevent too many blocks
            const maxDepth = 200; // Limit terrain depth to 200 pixels
            const terrainBottom = Math.min(groundHeight + maxDepth, this.worldHeight);
            
            for (let y = Math.floor(groundHeight); y < terrainBottom; y += this.blockSize) {
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
        // Set world dimensions for Mars
        this.worldWidth = 1200;
        this.worldHeight = 1600;
        
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
            
            // Fill from ground to bottom with Mars colors, but limit depth to prevent too many blocks
            const maxDepth = 200; // Limit terrain depth to 200 pixels
            const terrainBottom = Math.min(groundHeight + maxDepth, this.worldHeight);
            
            for (let y = Math.floor(groundHeight); y < terrainBottom; y += this.blockSize) {
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

    createMercuryLevel() {
        // Set world dimensions for Moon
        this.worldWidth = 1200;
        this.worldHeight = 1600;
        
        // Player spawn - positioned just above the starting landing pad
        this.spawnPoint = { x: 600, y: 1380 };
        this.ship = new Ship(this.spawnPoint.x, this.spawnPoint.y);
        
        // Make Moon movement slightly faster and more responsive
        this.ship.thrustForce = 700; // Increased from 600
        this.ship.rotationSpeed = 10; // Increased from 9
        this.ship.gravity = 140; // Reduced from 150 (lower gravity like real Moon)
        
        // Landing pads - white/silver pads (Moon theme)
        this.landingPads = [
            { x: 550, y: 1420, width: 100, height: 20 }, // Starting/refuel pad
            { x: 150, y: 1320, width: 80, height: 20 },  // Left crater rim
            { x: 850, y: 1300, width: 80, height: 20 },  // Right crater rim
            { x: 400, y: 1180, width: 80, height: 20 },  // Central crater
            { x: 700, y: 1100, width: 80, height: 20 },  // High crater
            { x: 200, y: 950, width: 80, height: 20 },   // Deep crater
            { x: 800, y: 850, width: 80, height: 20 },   // Upper crater
            { x: 450, y: 700, width: 80, height: 20 },   // High altitude station
            { x: 250, y: 550, width: 80, height: 20 },   // Mountain peak
            { x: 650, y: 400, width: 80, height: 20 },   // Summit station
        ];
        
        // Goal zone - bright white landing pad (Moon sunlit side)
        this.goalZones = [
            { x: 400, y: 150, width: 200, height: 20 } // Large summit goal
        ];
        
        // Reset level complete state
        this.levelComplete = false;
        
        // Generate Mercury terrain
        this.generateMercuryBlockTerrain();
        
        // Generate space objects instead of palm trees
        this.generateMercurySpaceObjects();
        
        // Add a few small visual craters for atmosphere
        this.generateMercuryCraters();
    }

    generateMercuryBlockTerrain() {
        // Clear existing terrain
        this.terrainBlocks.clear();
        
        // Generate Mercury-like ground with gray/white colors and less cluttered terrain
        for (let x = 0; x < this.worldWidth; x += this.blockSize) {
            const groundHeight = 1450 + Math.sin(x * 0.005) * 60 + Math.sin(x * 0.001) * 100;
            
            // Fill from ground to bottom with Mercury colors, but limit depth to prevent too many blocks
            const maxDepth = 200; // Limit terrain depth to 200 pixels
            const terrainBottom = Math.min(groundHeight + maxDepth, this.worldHeight);
            
            for (let y = Math.floor(groundHeight); y < terrainBottom; y += this.blockSize) {
                this.addTerrainBlock(x, y, this.getMercuryTerrainColor(y));
            }
        }
        
        // Add Mercury crater rims and mountains - similar complexity to level 1
        this.addPlatformBlocks(100, 1350, 200, 50, '#C0C0C0');   // Large crater rim
        this.addPlatformBlocks(400, 1320, 160, 40, '#D3D3D3');   // Central crater
        this.addPlatformBlocks(750, 1300, 180, 60, '#A9A9A9');   // Right crater rim
        this.addPlatformBlocks(200, 1200, 200, 50, '#C0C0C0');   // Wide plateau
        this.addPlatformBlocks(600, 1100, 180, 60, '#D3D3D3');   // Central peak
        this.addPlatformBlocks(100, 1000, 160, 40, '#A9A9A9');   // Left mountain
        this.addPlatformBlocks(500, 900, 200, 50, '#C0C0C0');    // Upper plateau
        this.addPlatformBlocks(800, 800, 150, 60, '#D3D3D3');    // Right peak
        this.addPlatformBlocks(200, 700, 180, 40, '#A9A9A9');    // High plateau
        this.addPlatformBlocks(600, 600, 200, 50, '#C0C0C0');    // Very high plateau
        this.addPlatformBlocks(100, 500, 160, 60, '#D3D3D3');    // Summit left
        this.addPlatformBlocks(700, 400, 150, 40, '#A9A9A9');    // Summit right
        this.addPlatformBlocks(400, 300, 300, 50, '#C0C0C0');    // Final summit
        
        // Add Mercury-specific crater walls and barriers - much fewer than before
        this.addWallBlocks(300, 1350, 60, 80, '#808080');   // Crater wall
        this.addWallBlocks(650, 1250, 40, 100, '#808080');  // Deep crater wall
        this.addWallBlocks(150, 1150, 50, 90, '#808080');   // Left barrier
        this.addWallBlocks(550, 1050, 40, 100, '#808080');  // Central barrier
        this.addWallBlocks(750, 950, 60, 80, '#808080');    // Right barrier
        this.addWallBlocks(250, 850, 40, 110, '#808080');   // High wall
        this.addWallBlocks(600, 750, 50, 90, '#808080');    // Summit barrier
        this.addWallBlocks(400, 650, 40, 100, '#808080');   // Peak barrier
    }

    generateMercurySpaceObjects() {
        // Generate space-themed objects instead of craters - much fewer obstacles
        const spaceObjects = [
            { x: 250, y: 1500, type: 'moon_buggy' },
            { x: 500, y: 1520, type: 'space_station' },
            { x: 750, y: 1510, type: 'moon_buggy' },
            { x: 150, y: 1400, type: 'solar_panel' },
            { x: 400, y: 1380, type: 'communication_dish' },
            { x: 650, y: 1350, type: 'moon_buggy' },
            { x: 200, y: 1250, type: 'space_equipment' },
            { x: 550, y: 1200, type: 'solar_panel' },
            { x: 800, y: 1150, type: 'communication_dish' },
            { x: 350, y: 1000, type: 'space_station' },
            { x: 150, y: 900, type: 'moon_buggy' },
            { x: 500, y: 850, type: 'space_equipment' },
            { x: 750, y: 800, type: 'solar_panel' },
            { x: 300, y: 700, type: 'communication_dish' },
            { x: 600, y: 650, type: 'space_station' },
            { x: 200, y: 500, type: 'moon_buggy' },
            { x: 450, y: 450, type: 'space_equipment' },
            { x: 700, y: 400, type: 'solar_panel' },
        ];
        
        for (const obj of spaceObjects) {
            this.generateSpaceObjectBlocks(obj.x, obj.y, obj.type);
        }
    }

    generateSpaceObjectBlocks(x, y, type) {
        const metalColor = '#C0C0C0';
        const darkMetalColor = '#808080';
        const solarColor = '#000080';
        const antennaColor = '#FFFFFF';
        
        switch (type) {
            case 'moon_buggy':
                // Create a blocky moon buggy
                // Body
                this.addTerrainBlock(x - 16, y - 16, metalColor);
                this.addTerrainBlock(x - 8, y - 16, metalColor);
                this.addTerrainBlock(x, y - 16, metalColor);
                this.addTerrainBlock(x + 8, y - 16, metalColor);
                this.addTerrainBlock(x - 8, y - 8, metalColor);
                this.addTerrainBlock(x, y - 8, metalColor);
                // Wheels
                this.addTerrainBlock(x - 16, y - 8, darkMetalColor);
                this.addTerrainBlock(x + 8, y - 8, darkMetalColor);
                // Antenna
                this.addTerrainBlock(x - 4, y - 24, antennaColor);
                break;
                
            case 'space_station':
                // Create a small space station module
                // Main body
                for (let dx = -12; dx <= 12; dx += 8) {
                    for (let dy = -16; dy <= -8; dy += 8) {
                        this.addTerrainBlock(x + dx, y + dy, metalColor);
                    }
                }
                // Solar panels
                this.addTerrainBlock(x - 20, y - 12, solarColor);
                this.addTerrainBlock(x + 20, y - 12, solarColor);
                // Antenna
                this.addTerrainBlock(x, y - 24, antennaColor);
                break;
                
            case 'solar_panel':
                // Create solar panel array
                // Panel base
                this.addTerrainBlock(x - 4, y - 8, metalColor);
                this.addTerrainBlock(x + 4, y - 8, metalColor);
                // Solar cells
                for (let dx = -16; dx <= 16; dx += 8) {
                    this.addTerrainBlock(x + dx, y - 16, solarColor);
                }
                // Support
                this.addTerrainBlock(x, y - 24, metalColor);
                break;
                
            case 'communication_dish':
                // Create a communication dish
                // Base
                this.addTerrainBlock(x - 4, y - 8, metalColor);
                this.addTerrainBlock(x + 4, y - 8, metalColor);
                // Dish
                this.addTerrainBlock(x - 8, y - 16, antennaColor);
                this.addTerrainBlock(x, y - 16, antennaColor);
                this.addTerrainBlock(x + 8, y - 16, antennaColor);
                this.addTerrainBlock(x - 4, y - 24, antennaColor);
                this.addTerrainBlock(x + 4, y - 24, antennaColor);
                break;
                
            case 'space_equipment':
                // Create misc space equipment
                // Equipment box
                this.addTerrainBlock(x - 8, y - 16, metalColor);
                this.addTerrainBlock(x, y - 16, metalColor);
                this.addTerrainBlock(x + 8, y - 16, metalColor);
                this.addTerrainBlock(x - 8, y - 8, metalColor);
                this.addTerrainBlock(x + 8, y - 8, metalColor);
                // Instruments
                this.addTerrainBlock(x - 4, y - 24, darkMetalColor);
                this.addTerrainBlock(x + 4, y - 24, darkMetalColor);
                break;
        }
    }

    generateMercuryCraters() {
        // Generate only a few small craters for visual variety (not obstacles)
        const craterPositions = [
            { x: 300, y: 1450, size: 'small' },
            { x: 600, y: 1470, size: 'small' },
            { x: 900, y: 1460, size: 'small' },
            { x: 150, y: 1350, size: 'small' },
            { x: 450, y: 1330, size: 'small' },
            { x: 750, y: 1340, size: 'small' },
            { x: 350, y: 1180, size: 'small' },
            { x: 650, y: 1160, size: 'small' },
        ];
        
        for (const pos of craterPositions) {
            this.generateMercuryCraterBlocks(pos.x, pos.y, pos.size);
        }
    }

    createAsteroidBeltLevel() {
        // Set world dimensions for Asteroid Belt
        this.worldWidth = 1200;
        this.worldHeight = 1600;
        
        // Player spawn - positioned in space
        this.spawnPoint = { x: 600, y: 1380 };
        this.ship = new Ship(this.spawnPoint.x, this.spawnPoint.y);
        
        // Make Asteroid Belt movement with very low gravity and enhanced maneuverability
        this.ship.thrustForce = 800; // Increased from 700 for better control in zero-g
        this.ship.rotationSpeed = 12; // Increased from 10 for better maneuverability
        this.ship.gravity = 50; // Much lower gravity than Moon (was 140)
        this.ship.drag = 0.995; // Less drag in space
        
        // Landing pads - mining stations (industrial theme)
        this.landingPads = [
            { x: 550, y: 1420, width: 100, height: 20 }, // Starting mining station
            { x: 200, y: 1300, width: 80, height: 20 },  // Mining platform 1
            { x: 850, y: 1250, width: 80, height: 20 },  // Mining platform 2
            { x: 400, y: 1100, width: 80, height: 20 },  // Deep space station
            { x: 700, y: 950, width: 80, height: 20 },   // Asteroid mining rig
            { x: 150, y: 800, width: 80, height: 20 },   // Processing station
            { x: 800, y: 650, width: 80, height: 20 },   // Orbital platform
            { x: 450, y: 500, width: 80, height: 20 },   // High orbit station
            { x: 250, y: 350, width: 80, height: 20 },   // Deep space outpost
        ];
        
        // Goal zone - main mining headquarters
        this.goalZones = [
            { x: 500, y: 100, width: 200, height: 20 } // Mining headquarters
        ];
        
        // Initialize floating asteroids system
        this.floatingAsteroids = [];
        this.asteroidDebris = [];
        
        // Reset level complete state
        this.levelComplete = false;
        
        // Generate minimal terrain (mostly empty space)
        this.generateAsteroidBeltTerrain();
        
        // Generate floating asteroids
        this.generateFloatingAsteroids();
        
        // Generate mining equipment
        this.generateMiningEquipment();
    }

    generateAsteroidBeltTerrain() {
        // Clear existing terrain
        this.terrainBlocks.clear();
        
        // Generate minimal ground (deep space with some floating platforms)
        for (let x = 0; x < this.worldWidth; x += this.blockSize) {
            const groundHeight = 1500; // Much higher ground = more empty space
            
            // Only add ground in some areas to create floating platforms
            if (x < 100 || x > this.worldWidth - 100 || 
                (x > 500 && x < 700) || (x > 300 && x < 400)) {
                for (let y = Math.floor(groundHeight); y < this.worldHeight; y += this.blockSize) {
                    this.addTerrainBlock(x, y, this.getAsteroidBeltTerrainColor(y));
                }
            }
        }
        
        // Add floating platforms strategically positioned
        this.addPlatformBlocks(200, 1350, 120, 30, '#4A4A4A');  // Mining platform 1
        this.addPlatformBlocks(600, 1300, 140, 30, '#4A4A4A');  // Mining platform 2
        this.addPlatformBlocks(400, 1200, 160, 30, '#4A4A4A');  // Central platform
        this.addPlatformBlocks(150, 1050, 120, 30, '#4A4A4A');  // Left platform
        this.addPlatformBlocks(750, 1000, 140, 30, '#4A4A4A');  // Right platform
        this.addPlatformBlocks(350, 900, 180, 30, '#4A4A4A');   // Mid platform
        this.addPlatformBlocks(600, 800, 120, 30, '#4A4A4A');   // Upper platform
        this.addPlatformBlocks(200, 700, 140, 30, '#4A4A4A');   // High platform
        this.addPlatformBlocks(500, 600, 160, 30, '#4A4A4A');   // Very high platform
        this.addPlatformBlocks(300, 450, 180, 30, '#4A4A4A');   // Near summit
        this.addPlatformBlocks(450, 300, 200, 30, '#4A4A4A');   // Summit platform
        
        // Add minimal barriers (support structures)
        this.addWallBlocks(350, 1320, 30, 60, '#666666');  // Support pillar
        this.addWallBlocks(650, 1250, 30, 60, '#666666');  // Support pillar
        this.addWallBlocks(200, 1000, 30, 60, '#666666');  // Support pillar
        this.addWallBlocks(550, 850, 30, 60, '#666666');   // Support pillar
        this.addWallBlocks(400, 650, 30, 60, '#666666');   // Support pillar
    }

    generateFloatingAsteroids() {
        // Create floating asteroids that move and can be destroyed
        const asteroidData = [
            { x: 300, y: 1400, size: 'medium', vx: 20, vy: 0 },
            { x: 700, y: 1350, size: 'large', vx: -15, vy: 10 },
            { x: 150, y: 1250, size: 'small', vx: 25, vy: 0 },
            { x: 850, y: 1200, size: 'medium', vx: -20, vy: -5 },
            { x: 450, y: 1150, size: 'large', vx: 10, vy: 15 },
            { x: 250, y: 1050, size: 'small', vx: 30, vy: 0 },
            { x: 650, y: 1000, size: 'medium', vx: -25, vy: 10 },
            { x: 500, y: 950, size: 'large', vx: 15, vy: -10 },
            { x: 100, y: 850, size: 'small', vx: 35, vy: 5 },
            { x: 800, y: 800, size: 'medium', vx: -30, vy: 0 },
            { x: 350, y: 750, size: 'large', vx: 20, vy: 15 },
            { x: 600, y: 700, size: 'small', vx: -25, vy: 0 },
            { x: 200, y: 650, size: 'medium', vx: 25, vy: -10 },
            { x: 750, y: 600, size: 'large', vx: -15, vy: 20 },
            { x: 400, y: 550, size: 'small', vx: 30, vy: 0 },
            { x: 550, y: 500, size: 'medium', vx: -20, vy: 15 },
            { x: 300, y: 450, size: 'large', vx: 25, vy: -5 },
            { x: 700, y: 400, size: 'small', vx: -30, vy: 10 },
            { x: 150, y: 350, size: 'medium', vx: 35, vy: 0 },
            { x: 500, y: 300, size: 'large', vx: -25, vy: -15 },
        ];
        
        for (const data of asteroidData) {
            this.floatingAsteroids.push({
                x: data.x,
                y: data.y,
                vx: data.vx,
                vy: data.vy,
                size: data.size,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 2,
                health: this.getAsteroidHealth(data.size),
                maxHealth: this.getAsteroidHealth(data.size),
                blocks: this.generateAsteroidBlocks(data.size)
            });
        }
    }

    getAsteroidHealth(size) {
        switch (size) {
            case 'small': return 1;
            case 'medium': return 2;
            case 'large': return 3;
            default: return 1;
        }
    }

    generateAsteroidBlocks(size) {
        const blocks = [];
        let radius;
        
        switch (size) {
            case 'small': radius = 16; break;
            case 'medium': radius = 24; break;
            case 'large': radius = 32; break;
            default: radius = 16;
        }
        
        // Create irregular asteroid shape
        for (let dx = -radius; dx <= radius; dx += this.blockSize) {
            for (let dy = -radius; dy <= radius; dy += this.blockSize) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                const noise = Math.random() * 0.3 + 0.7; // Add irregularity
                
                if (distance <= radius * noise) {
                    blocks.push({
                        x: dx,
                        y: dy,
                        color: this.getAsteroidColor()
                    });
                }
            }
        }
        
        return blocks;
    }

    getAsteroidColor() {
        const colors = ['#8B7355', '#A0522D', '#696969', '#708090', '#2F4F4F'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    generateMiningEquipment() {
        // Generate mining-themed objects
        const miningObjects = [
            { x: 200, y: 1500, type: 'mining_drill' },
            { x: 500, y: 1520, type: 'ore_processor' },
            { x: 800, y: 1510, type: 'mining_drill' },
            { x: 150, y: 1400, type: 'conveyor' },
            { x: 600, y: 1380, type: 'refinery' },
            { x: 350, y: 1300, type: 'mining_drill' },
            { x: 750, y: 1250, type: 'ore_processor' },
            { x: 250, y: 1150, type: 'conveyor' },
            { x: 550, y: 1100, type: 'refinery' },
            { x: 400, y: 1000, type: 'mining_drill' },
            { x: 700, y: 950, type: 'ore_processor' },
            { x: 150, y: 850, type: 'conveyor' },
            { x: 500, y: 800, type: 'refinery' },
            { x: 350, y: 700, type: 'mining_drill' },
            { x: 650, y: 650, type: 'ore_processor' },
            { x: 300, y: 550, type: 'conveyor' },
            { x: 550, y: 500, type: 'refinery' },
            { x: 200, y: 400, type: 'mining_drill' },
        ];
        
        for (const obj of miningObjects) {
            this.generateMiningEquipmentBlocks(obj.x, obj.y, obj.type);
        }
    }

    generateMiningEquipmentBlocks(x, y, type) {
        const metalColor = '#4A4A4A';
        const darkMetalColor = '#2F2F2F';
        const yellowColor = '#FFD700';
        const redColor = '#FF4500';
        
        switch (type) {
            case 'mining_drill':
                // Drill base
                this.addTerrainBlock(x - 8, y - 8, metalColor);
                this.addTerrainBlock(x, y - 8, metalColor);
                this.addTerrainBlock(x + 8, y - 8, metalColor);
                // Drill bit
                this.addTerrainBlock(x, y - 16, darkMetalColor);
                this.addTerrainBlock(x, y - 24, darkMetalColor);
                // Warning lights
                this.addTerrainBlock(x - 8, y - 16, yellowColor);
                this.addTerrainBlock(x + 8, y - 16, yellowColor);
                break;
                
            case 'ore_processor':
                // Main unit
                for (let dx = -12; dx <= 12; dx += 8) {
                    for (let dy = -16; dy <= -8; dy += 8) {
                        this.addTerrainBlock(x + dx, y + dy, metalColor);
                    }
                }
                // Processing chamber
                this.addTerrainBlock(x, y - 24, redColor);
                // Vents
                this.addTerrainBlock(x - 16, y - 12, darkMetalColor);
                this.addTerrainBlock(x + 16, y - 12, darkMetalColor);
                break;
                
            case 'conveyor':
                // Conveyor belt
                for (let dx = -16; dx <= 16; dx += 8) {
                    this.addTerrainBlock(x + dx, y - 8, darkMetalColor);
                }
                // Support posts
                this.addTerrainBlock(x - 16, y - 16, metalColor);
                this.addTerrainBlock(x + 16, y - 16, metalColor);
                break;
                
            case 'refinery':
                // Refinery tower
                this.addTerrainBlock(x - 4, y - 8, metalColor);
                this.addTerrainBlock(x + 4, y - 8, metalColor);
                this.addTerrainBlock(x - 4, y - 16, metalColor);
                this.addTerrainBlock(x + 4, y - 16, metalColor);
                this.addTerrainBlock(x, y - 24, redColor);
                // Pipes
                this.addTerrainBlock(x - 12, y - 12, darkMetalColor);
                this.addTerrainBlock(x + 12, y - 12, darkMetalColor);
                break;
        }
    }

    createJupiterLevel() {
        console.log('🪐 Setting up Jupiter level...');
        
        // Jupiter is 3x the vertical size of other levels
        this.worldWidth = 1200;
        this.worldHeight = 4800; // 3x the normal 1600 height
        
        // Player spawn - positioned just above the starting landing pad
        this.spawnPoint = { x: 600, y: 4600 }; // Just above the landing pad at bottom
        this.ship = new Ship(this.spawnPoint.x, this.spawnPoint.y);
        console.log(`🚀 Ship created at ${this.spawnPoint.x}, ${this.spawnPoint.y}`);
        
        // Enhanced ship physics for Jupiter's massive scale
        this.ship.thrustForce = 1000; // Increased thrust for massive level
        this.ship.rotationSpeed = 15; // Faster rotation for better control
        this.ship.gravity = 200; // Moderate gravity in Jupiter's atmosphere
        this.ship.drag = 0.99; // Some atmospheric drag
        
        // Only start and end landing pads - no intermediate platforms
        this.landingPads = [
            { x: 550, y: 4620, width: 100, height: 20 }, // Starting pad at bottom
        ];
        console.log(`🛬 Created ${this.landingPads.length} landing pad`);
        
        // Goal zone - at the very top of the massive level
        this.goalZones = [
            { x: 550, y: 100, width: 100, height: 20 } // Goal at the very top
        ];
        console.log(`🎯 Created ${this.goalZones.length} goal zone`);
        
        // Clear ALL terrain - Jupiter should have no solid ground
        this.terrainBlocks.clear();
        console.log('🗑️ Cleared all terrain blocks for Jupiter');
        
        // Initialize Jupiter-specific systems
        this.jupiterMoons = [];
        this.jupiterDebris = [];
        
        // Reset level complete state
        this.levelComplete = false;
        
        // Generate Jupiter's floating moons
        console.log('🌙 Generating Jupiter moons...');
        this.generateJupiterMoons();
        
        // Generate floating debris
        console.log('🗑️ Generating floating debris...');
        this.generateJupiterDebris();
        
        console.log('🪐 Jupiter level setup complete!');
    }

    generateJupiterMoons() {
        // Create massive floating moons that serve as landing platforms
        const moonData = [
            { x: 200, y: 4000, size: 'large', name: 'Io' },
            { x: 800, y: 3500, size: 'medium', name: 'Europa' },
            { x: 150, y: 3000, size: 'large', name: 'Ganymede' },
            { x: 750, y: 2500, size: 'medium', name: 'Callisto' },
            { x: 400, y: 2000, size: 'large', name: 'Amalthea' },
            { x: 900, y: 1500, size: 'medium', name: 'Himalia' },
            { x: 100, y: 1000, size: 'large', name: 'Elara' },
            { x: 650, y: 500, size: 'medium', name: 'Pasiphae' },
        ];
        
        for (const data of moonData) {
            this.jupiterMoons.push({
                x: data.x,
                y: data.y,
                size: data.size,
                name: data.name,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.5,
                blocks: this.generateMoonBlocks(data.size, data.name)
            });
        }
    }

    generateMoonBlocks(size, name) {
        const blocks = [];
        let radius;
        
        switch (size) {
            case 'small': radius = 40; break;
            case 'medium': radius = 60; break;
            case 'large': radius = 80; break;
            default: radius = 60;
        }
        
        // Different moon colors based on name
        let baseColor;
        switch (name) {
            case 'Io': baseColor = '#FF6B35'; break; // Volcanic orange
            case 'Europa': baseColor = '#87CEEB'; break; // Ice blue
            case 'Ganymede': baseColor = '#8B7355'; break; // Rocky brown
            case 'Callisto': baseColor = '#696969'; break; // Dark gray
            case 'Amalthea': baseColor = '#CD853F'; break; // Sandy brown
            case 'Himalia': baseColor = '#A0522D'; break; // Reddish brown
            case 'Elara': baseColor = '#708090'; break; // Slate gray
            case 'Pasiphae': baseColor = '#2F4F4F'; break; // Dark slate
            default: baseColor = '#8B7355';
        }
        
        // Create moon shape with craters
        for (let dx = -radius; dx <= radius; dx += this.blockSize) {
            for (let dy = -radius; dy <= radius; dy += this.blockSize) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                const noise = Math.random() * 0.2 + 0.8; // Slightly irregular
                
                if (distance <= radius * noise) {
                    // Add crater effects
                    let color = baseColor;
                    if (Math.random() < 0.1) { // 10% chance of crater
                        color = '#2F2F2F'; // Dark crater color
                    }
                    
                    blocks.push({
                        x: dx,
                        y: dy,
                        color: color
                    });
                }
            }
        }
        
        return blocks;
    }

    generateJupiterDebris() {
        // Create floating debris that moves through Jupiter's atmosphere
        const debrisData = [
            { x: 300, y: 4500, size: 'large', vx: 30, vy: -10 },
            { x: 700, y: 4200, size: 'medium', vx: -25, vy: 15 },
            { x: 150, y: 3800, size: 'small', vx: 40, vy: 0 },
            { x: 850, y: 3600, size: 'large', vx: -35, vy: -20 },
            { x: 450, y: 3200, size: 'medium', vx: 20, vy: 25 },
            { x: 250, y: 2800, size: 'small', vx: 45, vy: -15 },
            { x: 650, y: 2400, size: 'large', vx: -30, vy: 30 },
            { x: 500, y: 2000, size: 'medium', vx: 35, vy: -25 },
            { x: 100, y: 1600, size: 'small', vx: 50, vy: 10 },
            { x: 800, y: 1200, size: 'large', vx: -40, vy: -30 },
            { x: 350, y: 800, size: 'medium', vx: 25, vy: 35 },
            { x: 600, y: 400, size: 'small', vx: 55, vy: -20 },
        ];
        
        for (const data of debrisData) {
            this.jupiterDebris.push({
                x: data.x,
                y: data.y,
                vx: data.vx,
                vy: data.vy,
                size: data.size,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 3,
                life: 1.0,
                maxLife: 1.0,
                color: this.getJupiterDebrisColor()
            });
        }
    }

    getJupiterDebrisColor() {
        const colors = ['#8B4513', '#A0522D', '#696969', '#708090', '#2F4F4F', '#4A4A4A'];
        return colors[Math.floor(Math.random() * colors.length)];
    }









    adjustColor(baseColor, variation) {
        // Simple color adjustment for moon blocks
        if (baseColor.startsWith('#')) {
            const r = parseInt(baseColor.slice(1, 3), 16);
            const g = parseInt(baseColor.slice(3, 5), 16);
            const b = parseInt(baseColor.slice(5, 7), 16);
            
            const newR = Math.max(0, Math.min(255, r + variation * 255));
            const newG = Math.max(0, Math.min(255, g + variation * 255));
            const newB = Math.max(0, Math.min(255, b + variation * 255));
            
            return `rgb(${Math.round(newR)}, ${Math.round(newG)}, ${Math.round(newB)})`;
        }
        return baseColor;
    }





    getAsteroidBeltTerrainColor(y) {
        // Deep space / industrial colors
        const depth = y - 1500;
        if (depth < 50) {
            return '#2F2F2F'; // Dark metallic
        } else if (depth < 100) {
            return '#4A4A4A'; // Medium gray
        } else {
            return '#1C1C1C'; // Very dark space
        }
    }

    generateMercuryCraterBlocks(x, y, size) {
        const craterColor = '#696969'; // Dark gray for crater interior
        const rimColor = '#D3D3D3';   // Light gray for crater rim
        
        let radius, rimWidth;
        switch (size) {
            case 'small':
                radius = 16;
                rimWidth = 8;
                break;
            case 'medium':
                radius = 24;
                rimWidth = 12;
                break;
            case 'large':
                radius = 32;
                rimWidth = 16;
                break;
        }
        
        // Create circular crater with raised rim
        for (let dx = -radius - rimWidth; dx <= radius + rimWidth; dx += this.blockSize) {
            for (let dy = -radius - rimWidth; dy <= radius + rimWidth; dy += this.blockSize) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= radius) {
                    // Interior of crater - darker
                    this.addTerrainBlock(x + dx, y + dy, craterColor);
                } else if (distance <= radius + rimWidth) {
                    // Rim of crater - lighter
                    if (Math.random() < 0.8) { // Some irregularity
                        this.addTerrainBlock(x + dx, y + dy, rimColor);
                    }
                }
            }
        }
    }



    getMercuryTerrainColor(y) {
        // Mercury-like color gradient - grays and whites
        const depth = y - 1450;
        if (depth < 50) {
            return '#F5F5F5'; // Very light gray surface (sunlit)
        } else if (depth < 100) {
            return '#D3D3D3'; // Light gray
        } else if (depth < 150) {
            return '#A9A9A9'; // Medium gray
        } else {
            return '#696969'; // Dark gray depths
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
        
        // Ensure ship is properly positioned and visible
        if (this.ship && this.spawnPoint) {
            this.ship.position = new Vector2(this.spawnPoint.x, this.spawnPoint.y);
            this.ship.velocity = new Vector2(0, -50); // Start with slight upward velocity
            this.ship.rotation = 0;
            this.ship.isLanded = false; // Ensure ship is in flight mode
            this.ship.takeoffTime = 0.6; // Reset takeoff buffer
            console.log(`🚀 Game start - Ship reset to: ${this.ship.position.x}, ${this.ship.position.y}`);
        }
        
        // Render initial frame immediately to ensure ship is visible
        this.render();
        
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

        
        // Save progress - unlock the next level
        const nextLevel = this.currentLevel + 1;
        const highestUnlocked = parseInt(localStorage.getItem('highestUnlockedLevel') || '1');
        if (nextLevel > highestUnlocked) {
            localStorage.setItem('highestUnlockedLevel', nextLevel.toString());
            console.log(`🔓 Unlocked level ${nextLevel}!`);
        }
        
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

    returnToMainMenu() {
        console.log('🎉 All levels completed! Returning to main menu...');
        
        // Stop the game
        this.stop();
        
        // Reset game state
        this.currentLevel = 1;
        this.levelComplete = false;
        this.gameStartTime = performance.now();
        this.gameTime = 0;
        
        // Clear all game objects
        this.explosionParticles = [];
        if (this.floatingAsteroids) {
            this.floatingAsteroids = [];
        }
        if (this.asteroidDebris) {
            this.asteroidDebris = [];
        }
        
        // Dispatch event to show main menu
        window.dispatchEvent(new CustomEvent('showMainMenu'));
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
        
        // Update floating asteroids if in asteroid belt level
        if (this.currentLevel === 4) {
            this.updateFloatingAsteroids(deltaTime);
        }
        
        // Update Jupiter debris if in Jupiter level
        if (this.currentLevel === 5) {
            this.updateJupiterDebris(deltaTime);
        }
        

        

        

        

        
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

    updateFloatingAsteroids(deltaTime) {
        // Update floating asteroids
        for (let i = this.floatingAsteroids.length - 1; i >= 0; i--) {
            const asteroid = this.floatingAsteroids[i];
            
            // Update position
            asteroid.x += asteroid.vx * deltaTime;
            asteroid.y += asteroid.vy * deltaTime;
            
            // Update rotation
            asteroid.rotation += asteroid.rotationSpeed * deltaTime;
            
            // Wrap around screen edges
            if (asteroid.x < -50) {
                asteroid.x = this.worldWidth + 50;
            } else if (asteroid.x > this.worldWidth + 50) {
                asteroid.x = -50;
            }
            
            if (asteroid.y < -50) {
                asteroid.y = this.worldHeight + 50;
            } else if (asteroid.y > this.worldHeight + 50) {
                asteroid.y = -50;
            }
            
            // Check collision with ship
            const shipDistance = Math.sqrt(
                Math.pow(asteroid.x - this.ship.position.x, 2) + 
                Math.pow(asteroid.y - this.ship.position.y, 2)
            );
            
            const asteroidRadius = this.getAsteroidRadius(asteroid.size);
            if (shipDistance < asteroidRadius + this.ship.size) {
                // Ship hit asteroid - restart
                this.restart();
                console.log('💥 Ship hit asteroid!');
                return;
            }
        }
        
        // Update asteroid debris
        for (let i = this.asteroidDebris.length - 1; i >= 0; i--) {
            const debris = this.asteroidDebris[i];
            debris.x += debris.vx * deltaTime;
            debris.y += debris.vy * deltaTime;
            debris.life -= deltaTime;
            
            if (debris.life <= 0) {
                this.asteroidDebris.splice(i, 1);
            }
        }
    }

    updateJupiterDebris(deltaTime) {
        // Update Jupiter's floating debris
        for (let i = this.jupiterDebris.length - 1; i >= 0; i--) {
            const debris = this.jupiterDebris[i];
            
            // Update position
            debris.x += debris.vx * deltaTime;
            debris.y += debris.vy * deltaTime;
            
            // Update rotation
            debris.rotation += debris.rotationSpeed * deltaTime;
            
            // Wrap around screen edges
            if (debris.x < -50) {
                debris.x = this.worldWidth + 50;
            } else if (debris.x > this.worldWidth + 50) {
                debris.x = -50;
            }
            
            if (debris.y < -50) {
                debris.y = this.worldHeight + 50;
            } else if (debris.y > this.worldHeight + 50) {
                debris.y = -50;
            }
            
            // Check collision with ship
            const debrisRadius = debris.size === 'small' ? 8 : debris.size === 'medium' ? 12 : 16;
            const shipDistance = Math.sqrt(
                Math.pow(debris.x - this.ship.position.x, 2) + 
                Math.pow(debris.y - this.ship.position.y, 2)
            );
            
            if (shipDistance < debrisRadius + this.ship.size) {
                // Ship hit debris - restart
                this.restart();
                console.log('💥 Ship hit Jupiter debris!');
                return;
            }
        }
    }









    getAsteroidRadius(size) {
        switch (size) {
            case 'small': return 16;
            case 'medium': return 24;
            case 'large': return 32;
            default: return 16;
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
        const takeoffBuffer = 0.8; // Increased to 0.8 seconds to allow proper takeoff
        if (this.ship.takeoffTime < takeoffBuffer) {
            return;
        }
        
        // Check landing pad collisions first (priority over terrain) - LESS AGGRESSIVE
        for (const pad of this.landingPads) {
            // Smaller collision area - only expanded by 5 pixels in all directions
            const expandedPad = {
                x: pad.x - 5,
                y: pad.y - 5,
                width: pad.width + 10,
                height: pad.height + 10
            };
            
            if (shipPos.x + shipSize/2 > expandedPad.x && shipPos.x - shipSize/2 < expandedPad.x + expandedPad.width &&
                shipPos.y + shipSize >= expandedPad.y && shipPos.y + shipSize <= expandedPad.y + expandedPad.height) {
                
                // Check if ship is trying to take off (has upward velocity or is thrusting)
                const input = this.getInput();
                const isThrusting = input.thrust;
                const hasUpwardVelocity = this.ship.velocity.y < -20; // Even more sensitive to upward movement
                
                // If ship is thrusting or has upward velocity, allow it to take off
                if (isThrusting || hasUpwardVelocity) {
                    this.ship.isLanded = false; // Ensure ship is marked as not landed
                    this.ship.takeoffTime = 0; // Reset takeoff timer
                    return; // Don't force landing, allow takeoff
                }
                
                // Only trigger landing if ship is actually touching the pad surface
                const actualPadCollision = shipPos.x + shipSize/2 > pad.x && shipPos.x - shipSize/2 < pad.x + pad.width &&
                    shipPos.y + shipSize >= pad.y && shipPos.y + shipSize <= pad.y + pad.height;
                
                if (actualPadCollision) {
                    // Much more forgiving speed requirements
                    const maxSpeed = this.ship.landingVelocityThreshold * 2; // Double the speed limit
                    const maxVerticalSpeed = 200; // Double the vertical speed limit
                    
                    if (speed < maxSpeed && Math.abs(this.ship.velocity.y) < maxVerticalSpeed) {
                        // Successful landing on pad - SUPER forgiving
                        this.ship.velocity = new Vector2(0, 0);
                        this.ship.position.y = pad.y - shipSize; // Snap to pad surface
                        this.ship.isLanded = true;
                        this.ship.refuel();
                        console.log('⛽ LANDED! REFUELED!');
                        return; // Don't check other collisions
                    } else {
                        // Crash landing - restart immediately
                        console.log(`DEBUG: Crash landing - speed=${speed.toFixed(1)} >= ${maxSpeed} OR velY=${Math.abs(this.ship.velocity.y).toFixed(1)} >= ${maxVerticalSpeed}`);
                        this.restart();
                        console.log('💥 Crashed on landing pad! Too fast!');
                        return;
                    }
                }
            }
        }
        
        // Check goal zone collisions - SUPER FORGIVING (goals should be easier to land on)
        if (this.goalZones) {
            for (const goal of this.goalZones) {
                // Much more forgiving collision area - expanded by 20 pixels in all directions
                const expandedGoal = {
                    x: goal.x - 20,
                    y: goal.y - 20,
                    width: goal.width + 40,
                    height: goal.height + 40
                };
                
                if (shipPos.x + shipSize/2 > expandedGoal.x && shipPos.x - shipSize/2 < expandedGoal.x + expandedGoal.width &&
                    shipPos.y + shipSize >= expandedGoal.y && shipPos.y + shipSize <= expandedGoal.y + expandedGoal.height) {
                    
                    // Much more forgiving speed requirements for all levels
                    const maxSpeed = this.ship.landingVelocityThreshold * 2; // Double the speed limit
                    const maxVerticalSpeed = 200; // Double the vertical speed limit
                    
                    if (speed < maxSpeed && Math.abs(this.ship.velocity.y) < maxVerticalSpeed) {
                        // Goal reached! - SUPER forgiving
                        this.ship.velocity = new Vector2(0, 0);
                        this.ship.position.y = goal.y - shipSize; // Snap to goal surface
                        this.ship.isLanded = true;
                        this.ship.refuel();
                        console.log('🎉 GOAL REACHED! LEVEL COMPLETE!');
                        this.levelComplete = true;
                        return; // Don't check other collisions
                    } else {
                        // Crash landing - restart immediately
                        console.log(`DEBUG: Goal crash - speed=${speed.toFixed(1)} >= ${maxSpeed} OR velY=${Math.abs(this.ship.velocity.y).toFixed(1)} >= ${maxVerticalSpeed}`);
                        this.restart();
                        console.log('💥 Crashed into goal! Too fast!');
                        return;
                    }
                }
            }
        }
        
        // Check Jupiter moon collisions (only in Jupiter level)
        if (this.currentLevel === 5 && this.jupiterMoons) {
            for (const moon of this.jupiterMoons) {
                const moonRadius = moon.size === 'small' ? 40 : moon.size === 'medium' ? 60 : 80;
                const shipDistance = Math.sqrt(
                    Math.pow(shipPos.x - moon.x, 2) + 
                    Math.pow(shipPos.y - moon.y, 2)
                );
                
                if (shipDistance < moonRadius + shipSize) {
                    // Much more forgiving speed requirements for moon landings
                    const maxSpeed = this.ship.landingVelocityThreshold * 2; // Double the speed limit
                    const maxVerticalSpeed = 200; // Double the vertical speed limit
                    
                    if (speed < maxSpeed && Math.abs(this.ship.velocity.y) < maxVerticalSpeed) {
                        // Successful landing on moon - SUPER forgiving
                        this.ship.velocity = new Vector2(0, 0);
                        // Position ship on the moon surface
                        const angle = Math.atan2(shipPos.y - moon.y, shipPos.x - moon.x);
                        this.ship.position.x = moon.x + Math.cos(angle) * (moonRadius - shipSize);
                        this.ship.position.y = moon.y + Math.sin(angle) * (moonRadius - shipSize);
                        this.ship.isLanded = true;
                        this.ship.refuel();
                        console.log(`🌙 LANDED ON ${moon.name}! REFUELED!`);
                        return; // Don't check other collisions
                    } else {
                        // Crash landing on moon - restart immediately
                        console.log(`DEBUG: Moon crash - speed=${speed.toFixed(1)} >= ${maxSpeed} OR velY=${Math.abs(this.ship.velocity.y).toFixed(1)} >= ${maxVerticalSpeed}`);
                        this.restart();
                        console.log(`💥 Crashed on ${moon.name}! Too fast!`);
                        return;
                    }
                }
            }
        }
        

        


        

        
        // Check terrain collisions - allow soft landings on flat surfaces
        for (const block of this.terrainBlocks.values()) {
            if (shipPos.x + shipSize/2 > block.x && shipPos.x - shipSize/2 < block.x + this.blockSize &&
                shipPos.y + shipSize > block.y && shipPos.y < block.y + this.blockSize) {
                
                // Check if this is a soft landing on top of terrain (landing from above) - MORE FORGIVING
                const maxSpeed = this.ship.landingVelocityThreshold * 1.5; // 1.5x the speed limit for terrain
                const maxVerticalSpeed = 150; // 1.5x the vertical speed limit for terrain
                
                if (speed < maxSpeed && 
                    Math.abs(this.ship.velocity.y) < maxVerticalSpeed && 
                    shipPos.y + shipSize <= block.y + 12 && // Landing on top (more forgiving)
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
            
            // Check bullet vs floating asteroid collision (only in asteroid belt level)
            if (this.currentLevel === 4 && this.floatingAsteroids) {
                for (let j = this.floatingAsteroids.length - 1; j >= 0; j--) {
                    const asteroid = this.floatingAsteroids[j];
                    const distance = Math.sqrt(
                        Math.pow(bullet.position.x - asteroid.x, 2) + 
                        Math.pow(bullet.position.y - asteroid.y, 2)
                    );
                    
                    const asteroidRadius = this.getAsteroidRadius(asteroid.size);
                    if (distance < asteroidRadius) {
                        // Hit asteroid
                        asteroid.health--;
                        
                        // Create explosion
                        this.createExplosion(bullet.position.x, bullet.position.y, '#ff6600');
                        
                        // Create debris
                        this.createAsteroidDebris(asteroid.x, asteroid.y, asteroid.size);
                        
                        // Destroy bullet
                        bullet.life = 0;
                        
                        // If asteroid is destroyed, remove it
                        if (asteroid.health <= 0) {
                            // Create more debris when fully destroyed
                            this.createAsteroidDebris(asteroid.x, asteroid.y, asteroid.size, true);
                            this.floatingAsteroids.splice(j, 1);
                        }
                        
                        return;
                    }
                }
            }
            

            


            
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

    createAsteroidDebris(x, y, size, isDestroyed = false) {
        const debrisCount = isDestroyed ? 8 : 3;
        
        for (let i = 0; i < debrisCount; i++) {
            const angle = (Math.PI * 2 * i) / debrisCount;
            const speed = 50 + Math.random() * 100;
            
            this.asteroidDebris.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 2 + Math.random() * 2,
                maxLife: 2 + Math.random() * 2,
                size: 2 + Math.random() * 4,
                color: this.getAsteroidColor()
            });
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
            // Moon - deep space background (no atmosphere)
            this.ctx.fillStyle = '#000000';
        } else if (this.currentLevel === 3) {
            // Mars atmosphere - reddish sky
            this.ctx.fillStyle = '#2e1a0a';
        } else if (this.currentLevel === 4) {
            // Asteroid Belt - deep space background
            this.ctx.fillStyle = '#0a0a1e';
        } else if (this.currentLevel === 5) {
            // Jupiter - gas giant atmosphere with swirling bands
            this.ctx.fillStyle = '#8B4513'; // Jupiter's orange-brown atmosphere
        } else if (this.currentLevel === 6) {
            // Saturn - deep space with golden rings
            this.ctx.fillStyle = '#1a1a2e'; // Deep space background
        } else {
            // Space background for Earth
            this.ctx.fillStyle = '#0a0a2e';
        }
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate camera position
        let cameraX, cameraY;
        if (this.ship && this.ship.position) {
            cameraX = Math.max(0, Math.min(this.ship.position.x - this.canvas.width / 2, this.worldWidth - this.canvas.width));
            cameraY = Math.max(0, Math.min(this.ship.position.y - this.canvas.height / 2, this.worldHeight - this.canvas.height));
        } else {
            // If no ship, center camera on spawn point or default position
            const defaultX = this.spawnPoint ? this.spawnPoint.x : this.worldWidth / 2;
            const defaultY = this.spawnPoint ? this.spawnPoint.y : this.worldHeight / 2;
            cameraX = Math.max(0, Math.min(defaultX - this.canvas.width / 2, this.worldWidth - this.canvas.width));
            cameraY = Math.max(0, Math.min(defaultY - this.canvas.height / 2, this.worldHeight - this.canvas.height));
        }
        
        // Save context for camera transform
        this.ctx.save();
        
        // Apply camera transform
        this.ctx.translate(-cameraX, -cameraY);
        
        // Draw stars background
        this.drawStars();
        
        // Draw terrain blocks
        console.log(`🎨 Rendering ${this.terrainBlocks.size} terrain blocks...`);
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
        
        // Draw floating asteroids (only in asteroid belt level)
        if (this.currentLevel === 4 && this.floatingAsteroids) {
            for (const asteroid of this.floatingAsteroids) {
                this.ctx.save();
                this.ctx.translate(asteroid.x, asteroid.y);
                this.ctx.rotate(asteroid.rotation);
                
                // Draw asteroid blocks
                for (const block of asteroid.blocks) {
                    this.ctx.fillStyle = block.color;
                    this.ctx.fillRect(block.x, block.y, this.blockSize, this.blockSize);
                }
                
                this.ctx.restore();
            }
        }
        
        // Draw Jupiter's moons (only in Jupiter level)
        if (this.currentLevel === 5 && this.jupiterMoons) {
            for (const moon of this.jupiterMoons) {
                this.ctx.save();
                this.ctx.translate(moon.x, moon.y);
                this.ctx.rotate(moon.rotation);
                
                // Draw moon blocks
                for (const block of moon.blocks) {
                    this.ctx.fillStyle = block.color;
                    this.ctx.fillRect(block.x, block.y, this.blockSize, this.blockSize);
                }
                
                this.ctx.restore();
                
                // Draw moon landing area indicator (semi-transparent)
                const moonRadius = moon.size === 'small' ? 40 : moon.size === 'medium' ? 60 : 80;
                this.ctx.save();
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillStyle = '#00ff00'; // Green landing area
                this.ctx.beginPath();
                this.ctx.arc(moon.x, moon.y, moonRadius + 20, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
                
                // Draw moon name
                this.ctx.save();
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Courier New';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(moon.name, moon.x, moon.y - moonRadius - 10);
                this.ctx.restore();
            }
        }
        
        // Draw Jupiter's floating debris
        if (this.currentLevel === 5 && this.jupiterDebris) {
            for (const debris of this.jupiterDebris) {
                this.ctx.save();
                this.ctx.translate(debris.x, debris.y);
                this.ctx.rotate(debris.rotation);
                this.ctx.globalAlpha = debris.life / debris.maxLife;
                
                // Draw debris as simple rectangles
                const size = debris.size === 'small' ? 8 : debris.size === 'medium' ? 12 : 16;
                this.ctx.fillStyle = debris.color;
                this.ctx.fillRect(-size/2, -size/2, size, size);
                
                this.ctx.restore();
            }
        }
        


        

        

        

        

        
        // Draw asteroid debris
        if (this.currentLevel === 4 && this.asteroidDebris) {
            for (const debris of this.asteroidDebris) {
                this.ctx.save();
                this.ctx.globalAlpha = debris.life / debris.maxLife;
                this.ctx.fillStyle = debris.color;
                this.ctx.fillRect(debris.x - debris.size/2, debris.y - debris.size/2, debris.size, debris.size);
                this.ctx.restore();
            }
        }
        
        // Draw landing pads
        let padColor;
        if (this.currentLevel === 2) {
            padColor = '#ffffff'; // White for Moon
        } else if (this.currentLevel === 3) {
            padColor = '#0066ff'; // Blue for Mars
        } else if (this.currentLevel === 4) {
            padColor = '#ffaa00'; // Orange for Asteroid Belt mining stations
        } else if (this.currentLevel === 5) {
            padColor = '#ff6600'; // Orange for Jupiter

        } else {
            padColor = '#00ff00'; // Green for Earth
        }
        this.ctx.fillStyle = padColor;
        for (const pad of this.landingPads) {
            // Draw the actual landing pad
            this.ctx.fillRect(pad.x, pad.y, pad.width, pad.height);
            
            // Draw expanded collision area (semi-transparent)
            this.ctx.fillStyle = padColor + '40'; // Add transparency
            this.ctx.fillRect(pad.x - 5, pad.y - 5, pad.width + 10, pad.height + 10);
            
            // Draw landing pad indicators
            this.ctx.fillStyle = padColor;
            this.ctx.fillRect(pad.x + 10, pad.y - 5, 5, 5);
            this.ctx.fillRect(pad.x + pad.width - 15, pad.y - 5, 5, 5);
        }
        
        // Draw goal zones
        if (this.goalZones) {
            let goalColor, flagColor;
            if (this.currentLevel === 2) {
                goalColor = '#ffff00'; // Bright yellow for Moon (sunlit)
                flagColor = '#ffffff'; // White flag for Moon
            } else if (this.currentLevel === 3) {
                goalColor = '#ff3300'; // Brighter red for Mars
                flagColor = '#ffaa00'; // Orange flag for Mars
            } else if (this.currentLevel === 4) {
                goalColor = '#00ffff'; // Cyan for Asteroid Belt mining HQ
                flagColor = '#ffaa00'; // Orange flag for mining theme
            } else if (this.currentLevel === 5) {
                goalColor = '#ffaa00'; // Bright orange for Jupiter
                flagColor = '#ffff00'; // Yellow flag for Jupiter

            } else {
                goalColor = '#ff6600'; // Orange for Earth
                flagColor = '#ffff00'; // Yellow flag for Earth
            }
            
            this.ctx.fillStyle = goalColor;
            for (const goal of this.goalZones) {
                // Draw the actual goal zone
                this.ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
                
                // Draw expanded collision area (semi-transparent)
                this.ctx.fillStyle = goalColor + '40'; // Add transparency
                this.ctx.fillRect(goal.x - 20, goal.y - 20, goal.width + 40, goal.height + 40);
                
                // Draw flag
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
        if (this.ship && this.ship.position) {
            this.ship.render(this.ctx);
        }
        
        // Restore context after world rendering
        this.ctx.restore();
        
        // Draw UI elements in screen space
        
        // Draw level indicator
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Courier New';
        this.ctx.textAlign = 'left';
        let levelName;
        if (this.currentLevel === 1) {
            levelName = 'Earth';
            this.ctx.fillText(`Level ${this.currentLevel}: ${levelName}`, 10, 30);
        } else if (this.currentLevel === 2) {
            levelName = 'Moon';
            this.ctx.fillText(`Level ${this.currentLevel}: ${levelName}`, 10, 30);
        } else if (this.currentLevel === 3) {
            levelName = 'Mars';
            this.ctx.fillText(`Level ${this.currentLevel}: ${levelName}`, 10, 30);
        } else if (this.currentLevel === 4) {
            levelName = 'Asteroid Belt';
            this.ctx.fillText(`Level ${this.currentLevel}: ${levelName}`, 10, 30);
        } else if (this.currentLevel === 5) {
            levelName = 'Jupiter';
            this.ctx.fillText(`Level ${this.currentLevel}: ${levelName}`, 10, 30);

        } else {
            levelName = `Level ${this.currentLevel}`;
            this.ctx.fillText(`Level ${this.currentLevel}: ${levelName}`, 10, 30);
        }
        
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
            
            if (this.currentLevel === 4) {
                this.ctx.fillText(`🎉 LEVEL ${this.currentLevel} COMPLETE! 🎉`, this.canvas.width / 2, 50);
            } else if (this.currentLevel === 5) {
                this.ctx.fillText(`🎉 LEVEL ${this.currentLevel} COMPLETE! 🎉`, this.canvas.width / 2, 50);

            } else {
                this.ctx.fillText(`🎉 LEVEL ${this.currentLevel} COMPLETE! 🎉`, this.canvas.width / 2, 50);
            }
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '18px Courier New';
            if (this.currentLevel === 1) {
                this.ctx.fillText('Press ENTER to travel to Moon!', this.canvas.width / 2, 110);
            } else if (this.currentLevel === 2) {
                this.ctx.fillText('Press ENTER to travel to Mars!', this.canvas.width / 2, 110);
            } else if (this.currentLevel === 3) {
                this.ctx.fillText('Press ENTER to travel to Asteroid Belt!', this.canvas.width / 2, 110);
            } else if (this.currentLevel === 4) {
                this.ctx.fillText('Press ENTER to travel to Jupiter!', this.canvas.width / 2, 110);
            } else if (this.currentLevel === 5) {
                this.ctx.fillText('Press ENTER to return to Main Menu!', this.canvas.width / 2, 110);
            } else {
                this.ctx.fillText('Press ENTER to continue to next level', this.canvas.width / 2, 110);
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

    drawParachute() {
        // Draw the parachute above the ship
        const shipX = this.ship.position.x;
        const shipY = this.ship.position.y;
        
        // Parachute canopy (semi-circle)
        this.ctx.save();
        this.ctx.fillStyle = '#FFD700'; // Golden parachute
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 2;
        
        // Draw parachute canopy
        this.ctx.beginPath();
        this.ctx.arc(shipX, shipY - 40, 30, Math.PI, 0, false); // Semi-circle above ship
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw parachute lines
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(shipX - 25, shipY - 40);
        this.ctx.lineTo(shipX - 10, shipY - 10);
        this.ctx.moveTo(shipX + 25, shipY - 40);
        this.ctx.lineTo(shipX + 10, shipY - 10);
        this.ctx.moveTo(shipX, shipY - 40);
        this.ctx.lineTo(shipX, shipY - 10);
        this.ctx.stroke();
        
        this.ctx.restore();
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