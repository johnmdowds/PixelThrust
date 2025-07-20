// Initialize the level editor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const editor = new LevelEditor();
    
    // Make editor globally accessible for button onclick events
    window.editor = editor;
    
    console.log('PixelThrust Level Editor Started!');
    console.log('Instructions:');
    console.log('- Select a tool from the sidebar');
    console.log('- Click and drag on the canvas to place objects');
    console.log('- Use "Test Level" to play your creation');
    console.log('- Export/Import to save and share levels');
}); 