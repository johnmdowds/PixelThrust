class Particle {
    constructor(x, y, vx, vy, life, color) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(vx, vy);
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = 2 + Math.random() * 3;
    }
    
    update(deltaTime) {
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        this.life -= deltaTime;
        
        // Fade out over time
        this.velocity = this.velocity.multiply(0.98);
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
} 