class LevelEditor {
    constructor() {
        this.canvas = document.getElementById('editorCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Current tool and settings
        this.currentTool = 'terrain';
        this.brushWidth = 100;
        this.brushHeight = 20;
        this.selectedColor = '#666666'; // Default gray
        
        // Level data
        this.terrain = [];
        this.landingPads = [];
        this.goalZones = [];
        this.trees = [];
        this.spawnPoint = { x: 600, y: 400 };
        
        // Mouse state
        this.isMouseDown = false;
        this.lastMousePos = null;
        
        this.setupEventListeners();
        this.render();
    }
    
    setupEventListeners() {
        // Tool buttons
        document.querySelectorAll('.tool-button[data-tool]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.selectTool(e.target.dataset.tool);
            });
        });
        
        // Brush settings
        document.getElementById('brushWidth').addEventListener('input', (e) => {
            this.brushWidth = parseInt(e.target.value);
        });
        
        document.getElementById('brushHeight').addEventListener('input', (e) => {
            this.brushHeight = parseInt(e.target.value);
        });
        
        // Color palette
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                this.selectColor(e.target.dataset.color);
            });
        });
        
        // Canvas mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.handleMouseAction(e);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isMouseDown) {
                this.handleMouseAction(e);
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isMouseDown = false;
            this.lastMousePos = null;
        });
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    selectTool(tool) {
        this.currentTool = tool;
        
        // Update UI
        document.querySelectorAll('.tool-button[data-tool]').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
        document.getElementById('currentTool').textContent = tool.charAt(0).toUpperCase() + tool.slice(1);
    }
    
    selectColor(color) {
        this.selectedColor = color;
        
        // Update UI
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.classList.remove('active');
        });
        document.querySelector(`[data-color="${color}"]`).classList.add('active');
        
        // Update color preview
        const preview = document.getElementById('selectedColorPreview');
        if (preview) {
            preview.style.background = color;
        }
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    handleMouseAction(e) {
        const mousePos = this.getMousePos(e);
        
        switch (this.currentTool) {
            case 'terrain':
                this.placeTerrain(mousePos);
                break;
            case 'landing':
                this.placeLandingPad(mousePos);
                break;
            case 'goal':
                this.placeGoalZone(mousePos);
                break;
            case 'spawn':
                this.placeSpawnPoint(mousePos);
                break;
            case 'tree':
                this.placeTree(mousePos);
                break;
            case 'erase':
                this.eraseAt(mousePos);
                break;
        }
        
        this.render();
        this.updateLevelData();
    }
    
    placeTerrain(pos) {
        const terrain = {
            x: pos.x - this.brushWidth / 2,
            y: pos.y - this.brushHeight / 2,
            width: this.brushWidth,
            height: this.brushHeight,
            color: this.selectedColor
        };
        
        // Allow overlapping for seamless terrain placement
        this.terrain.push(terrain);
    }
    
    placeLandingPad(pos) {
        const pad = {
            x: pos.x - this.brushWidth / 2,
            y: pos.y - this.brushHeight / 2,
            width: this.brushWidth,
            height: this.brushHeight
        };
        
        // Check if overlapping with existing pads
        let overlapping = false;
        for (let i = 0; i < this.landingPads.length; i++) {
            if (this.rectanglesOverlap(pad, this.landingPads[i])) {
                overlapping = true;
                break;
            }
        }
        
        if (!overlapping) {
            this.landingPads.push(pad);
        }
    }
    
    placeGoalZone(pos) {
        const goal = {
            x: pos.x - this.brushWidth / 2,
            y: pos.y - this.brushHeight / 2,
            width: this.brushWidth,
            height: this.brushHeight
        };
        
        this.goalZones.push(goal);
    }
    
    placeSpawnPoint(pos) {
        this.spawnPoint = { x: pos.x, y: pos.y };
    }
    
    placeTree(pos) {
        const tree = {
            x: pos.x,
            y: pos.y,
            type: 'palm'
        };
        
        this.trees.push(tree);
    }
    
    eraseAt(pos) {
        // Remove terrain
        this.terrain = this.terrain.filter(terrain => 
            !this.pointInRectangle(pos, terrain)
        );
        
        // Remove landing pads
        this.landingPads = this.landingPads.filter(pad => 
            !this.pointInRectangle(pos, pad)
        );
        
        // Remove goal zones
        this.goalZones = this.goalZones.filter(goal => 
            !this.pointInRectangle(pos, goal)
        );
        
        // Remove trees
        this.trees = this.trees.filter(tree => {
            const treeRect = { x: tree.x - 15, y: tree.y - 40, width: 30, height: 50 };
            return !this.pointInRectangle(pos, treeRect);
        });
    }
    
    rectanglesOverlap(rect1, rect2) {
        return !(rect1.x + rect1.width < rect2.x || 
                rect2.x + rect2.width < rect1.x || 
                rect1.y + rect1.height < rect2.y || 
                rect2.y + rect2.height < rect1.y);
    }
    
    pointInRectangle(point, rect) {
        return point.x >= rect.x && point.x <= rect.x + rect.width &&
               point.y >= rect.y && point.y <= rect.y + rect.height;
    }
    
    clearLevel() {
        this.terrain = [];
        this.landingPads = [];
        this.goalZones = [];
        this.trees = [];
        this.spawnPoint = { x: 600, y: 400 };
        this.render();
        this.updateLevelData();
    }
    
    testLevel() {
        const levelData = this.getLevelData();
        localStorage.setItem('customLevel', JSON.stringify(levelData));
        window.open('index.html?custom=true', '_blank');
    }
    
    exportLevel() {
        const levelData = this.getLevelData();
        const dataStr = JSON.stringify(levelData, null, 2);
        document.getElementById('levelData').value = dataStr;
        
        // Also copy to clipboard
        navigator.clipboard.writeText(dataStr).then(() => {
            alert('Level data copied to clipboard!');
        });
    }
    
    importLevel() {
        const levelDataText = document.getElementById('levelData').value;
        try {
            const levelData = JSON.parse(levelDataText);
            this.loadLevel(levelData);
            this.render();
        } catch (e) {
            alert('Invalid level data format!');
        }
    }
    
    getLevelData() {
        return {
            terrain: this.terrain,
            landingPads: this.landingPads,
            goalZones: this.goalZones,
            trees: this.trees,
            spawnPoint: this.spawnPoint
        };
    }
    
    loadLevel(levelData) {
        this.terrain = levelData.terrain || [];
        this.landingPads = levelData.landingPads || [];
        this.goalZones = levelData.goalZones || [];
        this.trees = levelData.trees || [];
        this.spawnPoint = levelData.spawnPoint || { x: 600, y: 400 };
        this.updateLevelData();
    }
    
    updateLevelData() {
        const levelData = this.getLevelData();
        document.getElementById('levelData').value = JSON.stringify(levelData, null, 2);
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw terrain (all terrain is solid and destructible)
        this.terrain.forEach(terrain => {
            this.ctx.fillStyle = terrain.color || '#666';
            this.ctx.fillRect(terrain.x, terrain.y, terrain.width, terrain.height);
        });
        
        // Draw landing pads
        this.ctx.fillStyle = '#00ff00';
        this.landingPads.forEach(pad => {
            this.ctx.fillRect(pad.x, pad.y, pad.width, pad.height);
            
            // Draw landing pad indicators
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillRect(pad.x + 10, pad.y - 5, 5, 5);
            this.ctx.fillRect(pad.x + pad.width - 15, pad.y - 5, 5, 5);
        });
        
        // Draw goal zones
        this.ctx.fillStyle = '#ff6600';
        this.goalZones.forEach(goal => {
            this.ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
            
            // Draw flag
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillRect(goal.x + goal.width/2 - 2, goal.y - 30, 4, 30);
            this.ctx.fillRect(goal.x + goal.width/2 + 2, goal.y - 25, 15, 10);
        });
        
        // Draw trees
        this.trees.forEach(tree => {
            this.drawPalmTree(tree.x, tree.y);
        });
        
        // Draw spawn point
        this.ctx.fillStyle = '#ffff00';
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.spawnPoint.x, this.spawnPoint.y - 12);
        this.ctx.lineTo(this.spawnPoint.x - 7, this.spawnPoint.y + 7);
        this.ctx.lineTo(this.spawnPoint.x + 7, this.spawnPoint.y + 7);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw spawn point label
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '12px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SPAWN', this.spawnPoint.x, this.spawnPoint.y - 20);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
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