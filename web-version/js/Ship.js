class Ship {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0); // Start with zero velocity
        this.rotation = 0; // radians
        this.size = 12;
        
        // Physics
        this.thrustForce = 600; // 3x faster thrust
        this.rotationSpeed = 9; // 3x faster rotation
        this.gravity = 150; // 3x stronger gravity to balance (scalar, not Vector2)
        this.drag = 0.98;
        this.angularDrag = 0.95;
        this.angularVelocity = 0;
        
        // Fuel system
        this.maxFuel = 100;
        this.fuel = this.maxFuel;
        this.fuelConsumption = 4; // per second (even slower fuel consumption)
        
        // Thrust particles
        this.particles = [];
        this.isThrusting = false;
        
        // Shooting
        this.bullets = [];
        this.shootCooldown = 0;
        this.shootRate = 0.2; // seconds between shots
        
        // Landing
        this.isLanded = false;
        this.landingVelocityThreshold = 150; // Much more forgiving - allows rough landings
        this.takeoffTime = 0.5; // Start with some takeoff time to prevent immediate landing
    }
    
    update(deltaTime, input) {
        // Handle input
        if (input.left) {
            this.rotation -= this.rotationSpeed * deltaTime;
        }
        if (input.right) {
            this.rotation += this.rotationSpeed * deltaTime;
        }
        
        // Update takeoff timer
        if (!this.isLanded) {
            this.takeoffTime += deltaTime;
        }
        
        this.isThrusting = false;
        if (input.thrust && this.fuel > 0) {
            this.isThrusting = true;
            
            // Apply thrust force in the direction the ship is facing
            const thrustForce = new Vector2(0, -this.thrustForce).rotate(this.rotation);
            this.velocity = this.velocity.add(thrustForce.multiply(deltaTime));
            
            // If landed and thrusting, take off
            if (this.isLanded) {
                this.isLanded = false;
                this.takeoffTime = 0; // Reset takeoff timer
            }
            
            // Consume fuel
            this.fuel -= this.fuelConsumption * deltaTime;
            this.fuel = Math.max(0, this.fuel);
            
            // Create thrust particles
            this.createThrustParticles();
        }
        
        // Update shooting cooldown
        this.shootCooldown -= deltaTime;
        
        // Handle shooting
        if (input.shoot && this.canShoot()) {
            this.shoot();
        }
        
        // Apply gravity only if not landed
        if (!this.isLanded) {
            this.velocity = this.velocity.add(new Vector2(0, this.gravity).multiply(deltaTime));
        }
        
        // Update position only if not landed
        if (!this.isLanded) {
            this.position = this.position.add(this.velocity.multiply(deltaTime));
        }
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Update bullets
        this.updateBullets(deltaTime);
        
        // Note: World boundaries are now handled by the Game class
    }
    
    createThrustParticles() {
        // Create particles at the back of the ship
        const backOffset = new Vector2(0, this.size * 0.6).rotate(this.rotation);
        const particlePos = this.position.add(backOffset);
        
        for (let i = 0; i < 3; i++) {
            const particle = new Particle(
                particlePos.x + (Math.random() - 0.5) * 4,
                particlePos.y + (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40 + 20,
                0.5 + Math.random() * 0.3,
                `hsl(${Math.random() * 60 + 10}, 100%, 70%)`
            );
            this.particles.push(particle);
        }
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    canShoot() {
        return this.shootCooldown <= 0;
    }
    
    shoot() {
        // Create bullet at ship's nose
        const bulletOffset = new Vector2(0, -this.size).rotate(this.rotation);
        const bulletPos = this.position.add(bulletOffset);
        
        // Bullet direction should match ship's rotation (ship points up by default)
        const bullet = new Bullet(bulletPos.x, bulletPos.y, this.rotation - Math.PI/2);
        this.bullets.push(bullet);
        
        // Reset shooting cooldown
        this.shootCooldown = this.shootRate;
    }
    
    updateBullets(deltaTime, worldWidth = 1200, worldHeight = 2000) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(deltaTime, worldWidth, worldHeight);
            
            if (!bullet.isAlive()) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // Draw particles first (behind ship)
        this.particles.forEach(particle => particle.render(ctx));
        
        // Draw bullets
        this.bullets.forEach(bullet => bullet.render(ctx));
        
        // Draw ship
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        
        // Ship body (triangle)
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(0, -this.size);      // tip
        ctx.lineTo(-this.size * 0.6, this.size * 0.6);  // bottom left
        ctx.lineTo(this.size * 0.6, this.size * 0.6);   // bottom right
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Thrust glow effect
        if (this.isThrusting) {
            ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
            ctx.beginPath();
            ctx.moveTo(-this.size * 0.3, this.size * 0.6);
            ctx.lineTo(0, this.size * 1.2);
            ctx.lineTo(this.size * 0.3, this.size * 0.6);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    reset(x, y) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.rotation = 0;
        this.fuel = this.maxFuel;
        this.isLanded = false;
        this.takeoffTime = 0; // Reset takeoff timer
        this.bullets = [];
        this.particles = [];
    }
    
    getFuelPercentage() {
        return this.fuel / this.maxFuel;
    }
    
    getSpeed() {
        return this.velocity.magnitude();
    }
    
    refuel() {
        this.fuel = this.maxFuel;
    }
} 