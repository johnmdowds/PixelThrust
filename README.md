# PixelThrust - Web Version

A web-based implementation of the classic Gravity Force 2 style space lander game.

## 🎮 [Play Now on GitHub Pages](https://johnmdowds.github.io/PixelThrust/)

**Play the game directly in your browser!** No downloads required.

## Features

- **Pure HTML5 Canvas**: No external dependencies
- **Realistic Physics**: Gravity, thrust, rotation, and momentum
- **Particle Effects**: Thrust particles with realistic behavior
- **Fuel System**: Limited fuel adds strategic gameplay
- **Landing Mechanics**: Gentle landings required for success
- **Responsive Controls**: Smooth ship movement and rotation

## Controls

- **SPACE**: Thrust
- **A/D** or **Arrow Keys**: Rotate left/right
- **R**: Restart level

## How to Play

1. Use thrust to counteract gravity
2. Rotate your ship to control direction
3. Land gently on green landing pads
4. Avoid crashing into terrain or landing too fast
5. Manage your fuel carefully!

## Running the Game

### Option 1: Play Online (Recommended)
Visit [https://johndowds.github.io/PixelThrust/](https://johndowds.github.io/PixelThrust/) to play directly in your browser!

### Option 2: Run Locally
Simply open `web-version/index.html` in a web browser. No build process required!

## Game Mechanics

- **Thrust**: Consumes fuel and applies force in the ship's forward direction
- **Gravity**: Constant downward force
- **Fuel**: Limited resource that depletes when thrusting
- **Landing**: Must land with low velocity on green pads
- **Collision**: Hitting terrain or landing too fast restarts the level

## Architecture

The game is built with a modular JavaScript architecture:

- `Vector2.js`: 2D vector math utilities
- `Ship.js`: Player ship physics and rendering
- `Particle.js`: Particle system for thrust effects
- `Game.js`: Main game loop and collision detection
- `main.js`: Entry point and initialization

## Future Enhancements

- Multiple levels
- Sound effects
- Multiplayer support (WebSockets)
- Level editor
- Better graphics and animations
- Scoring system
- Fuel pickups

## Multiplayer Ready

The architecture is designed to easily add multiplayer:
- Game state is centralized
- Input handling is separated from game logic
- Rendering is independent of game state
- Ready for WebSocket integration 
