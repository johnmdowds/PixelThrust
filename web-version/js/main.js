// Initialize the game when requested from menu
document.addEventListener('DOMContentLoaded', () => {
    console.log('PixelThrust Web Version Loaded!');
    console.log('Controls:');
    console.log('- SPACE: Thrust');
    console.log('- A/D or Arrow Keys: Rotate');
    console.log('- S/Up Arrow: Shoot');
    console.log('- R: Restart');
});

// Listen for game start event from menu
window.addEventListener('startGame', () => {
    if (typeof window.game === 'undefined') {
        window.game = new Game();
        window.game.start();
        console.log('Game started!');
    }
});



 