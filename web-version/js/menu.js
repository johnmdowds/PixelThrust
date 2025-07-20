// Menu system for PixelThrust
class MenuSystem {
    constructor() {
        this.starfield = null;
        this.stars = [];
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.setupStarfield();
        this.setupMenuButtons();
        this.startStarfieldAnimation();
    }
    
    setupStarfield() {
        this.starfield = document.getElementById('starfield');
        this.starfield.width = window.innerWidth;
        this.starfield.height = window.innerHeight;
        
        const ctx = this.starfield.getContext('2d');
        
        // Create stars
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * this.starfield.width,
                y: Math.random() * this.starfield.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
                opacity: Math.random() * 0.8 + 0.2,
                twinkle: Math.random() * 0.02 + 0.01
            });
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.starfield.width = window.innerWidth;
            this.starfield.height = window.innerHeight;
        });
    }
    
    startStarfieldAnimation() {
        const animate = () => {
            this.updateStarfield();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }
    
    updateStarfield() {
        const ctx = this.starfield.getContext('2d');
        ctx.clearRect(0, 0, this.starfield.width, this.starfield.height);
        
        // Update and draw stars
        this.stars.forEach(star => {
            // Move star
            star.y += star.speed;
            if (star.y > this.starfield.height) {
                star.y = -star.size;
                star.x = Math.random() * this.starfield.width;
            }
            
            // Twinkle effect
            star.opacity += Math.sin(Date.now() * star.twinkle) * 0.01;
            star.opacity = Math.max(0.1, Math.min(1, star.opacity));
            
            // Draw star
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add glow effect for larger stars
            if (star.size > 1.5) {
                ctx.fillStyle = `rgba(0, 255, 136, ${star.opacity * 0.3})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    
    setupMenuButtons() {
        const startSinglePlayer = document.getElementById('startSinglePlayer');
        const loadGame = document.getElementById('loadGame');
        const startMultiplayer = document.getElementById('startMultiplayer');
        const backToMenu = document.getElementById('backToMenu');
        const backToMainFromLevelSelect = document.getElementById('backToMainFromLevelSelect');
        
        // Single player button
        startSinglePlayer.addEventListener('click', () => {
            this.showGame();
        });
        
        // Load game button
        loadGame.addEventListener('click', () => {
            this.showLevelSelect();
        });
        
        // Multiplayer button (disabled for now)
        startMultiplayer.addEventListener('click', (e) => {
            e.preventDefault();
            this.showComingSoonMessage();
        });
        
        // Back to main from level select
        backToMainFromLevelSelect.addEventListener('click', () => {
            this.hideLevelSelect();
        });
        
        // Back to menu button
        backToMenu.addEventListener('click', () => {
            this.showMenu();
        });
        
        // Listen for showMainMenu event from game
        window.addEventListener('showMainMenu', () => {
            this.showMenu();
        });
        
        // Add sound effects to buttons (if available)
        document.querySelectorAll('.menu-button:not(.coming-soon)').forEach(button => {
            button.addEventListener('mouseenter', () => {
                // Could add hover sound here
            });
            
            button.addEventListener('click', () => {
                // Could add click sound here
            });
        });
    }
    
    showGame() {
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('gameContainer').classList.add('active');
        
        // Stop starfield animation to save resources
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Initialize the game if it hasn't been started yet
        if (typeof window.game === 'undefined') {
            // The game will be initialized by main.js
            window.dispatchEvent(new CustomEvent('startGame'));
        } else {
            // Resume existing game
            window.game.resume();
        }
    }



    showLevelSelect() {
        document.getElementById('levelSelectContainer').style.display = 'flex';
        this.updateLevelSelect();
    }

    hideLevelSelect() {
        document.getElementById('levelSelectContainer').style.display = 'none';
    }

    updateLevelSelect() {
        // Get highest unlocked level from localStorage
        const highestUnlocked = parseInt(localStorage.getItem('highestUnlockedLevel') || '1');
        
        // Update level cards
        document.querySelectorAll('.level-card').forEach(card => {
            const level = parseInt(card.dataset.level);
            const statusElement = card.querySelector('.level-status');
            
            if (level <= highestUnlocked) {
                card.classList.remove('locked');
                card.classList.add('unlocked');
                statusElement.textContent = 'Unlocked';
                statusElement.className = 'level-status unlocked';
                
                // Add click handler for unlocked levels
                card.onclick = () => {
                    this.startLevel(level);
                };
            } else {
                card.classList.add('locked');
                card.classList.remove('unlocked');
                statusElement.textContent = 'Locked';
                statusElement.className = 'level-status locked';
                card.onclick = null;
            }
        });
    }

    startLevel(levelNumber) {
        console.log(`🚀 Starting level ${levelNumber}...`);
        this.hideLevelSelect();
        
        // Initialize game if needed
        if (typeof window.game === 'undefined') {
            window.game = new Game();
        }
        
        // Set the level and start
        window.game.currentLevel = levelNumber;
        window.game.loadDefaultLevel();
        window.game.start();
        
        // Show the game
        this.showGame();
    }
    
    showMenu() {
        document.getElementById('mainMenu').classList.remove('hidden');
        document.getElementById('gameContainer').classList.remove('active');
        
        // Restart starfield animation
        if (!this.animationId) {
            this.startStarfieldAnimation();
        }
        
        // Pause the game if it exists
        if (typeof window.game !== 'undefined') {
            window.game.pause();
        }
        

    }
    
    showComingSoonMessage() {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #00ff88;
            color: white;
            padding: 20px 40px;
            font-family: 'Orbitron', monospace;
            font-size: 1.2em;
            z-index: 1001;
            text-align: center;
            animation: fadeIn 0.3s ease-in;
        `;
        notification.innerHTML = `
            <div style="margin-bottom: 10px;">🚀 MULTIPLAYER MODE</div>
            <div style="font-size: 0.9em; color: #888;">Coming in a future update!</div>
            <div style="font-size: 0.7em; margin-top: 10px; color: #555;">Click anywhere to close</div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification when clicked
        const removeNotification = () => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        };
        
        notification.addEventListener('click', removeNotification);
        document.addEventListener('click', removeNotification, { once: true });
        
        // Auto-remove after 3 seconds
        setTimeout(removeNotification, 3000);
    }
}

// Initialize menu system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.menuSystem = new MenuSystem();
});

// Add fadeOut animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
    }
`;
document.head.appendChild(style); 