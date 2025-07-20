class Bullet {
    constructor(x, y, direction, speed = 300) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(
            Math.cos(direction) * speed,
            Math.sin(direction) * speed
        );
        this.life = 3.0; // 3 seconds max life
        this.size = 2;
        this.damage = 16; // Damage radius - creates roughly 2x2 block crater
    }
    
    update(deltaTime, worldWidth = 1200, worldHeight = 1600) {
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        this.life -= deltaTime;
        
        // Bullets die if they go off screen
        if (this.position.x < 0 || this.position.x > worldWidth || 
            this.position.y < 0 || this.position.y > worldHeight) {
            this.life = 0;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    isAlive() {
        return this.life > 0;
    }
} 