class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 32;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 4;
        this.jumpForce = -10;
        this.gravity = 0.5;
        this.onGround = false;
        this.facing = 1;
        this.animFrame = 0;
        this.animTimer = 0;
    }

    update(input, canvasWidth) {
        // Horizontal movement
        this.velocityX = 0;
        if (input.isDown('ArrowLeft') || input.isDown('KeyA')) {
            this.velocityX = -this.speed;
            this.facing = -1;
        }
        if (input.isDown('ArrowRight') || input.isDown('KeyD')) {
            this.velocityX = this.speed;
            this.facing = 1;
        }

        // Jump
        if ((input.isDown('Space') || input.isDown('KeyW') || input.isDown('ArrowUp')) && this.onGround) {
            this.velocityY = this.jumpForce;
            this.onGround = false;
            return 'jump';
        }

        // Gravity
        this.velocityY += this.gravity;

        // Apply velocity
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Clamp to canvas
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;

        // Animation
        if (this.velocityX !== 0) {
            this.animTimer++;
            if (this.animTimer > 8) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 4;
            }
        } else {
            this.animFrame = 0;
            this.animTimer = 0;
        }

        this.onGround = false;
        return null;
    }

    draw(ctx) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        const f = this.facing;

        ctx.save();
        if (f === -1) {
            ctx.translate(x + this.width, 0);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(x, 0);
        }

        // Body (pixel art style)
        ctx.fillStyle = '#4a90d9';
        ctx.fillRect(4, y + 8, 16, 14);

        // Head
        ctx.fillStyle = '#f5c6a0';
        ctx.fillRect(6, y, 12, 10);

        // Eyes
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(12, y + 3, 3, 3);

        // Hair
        ctx.fillStyle = '#5a3a2a';
        ctx.fillRect(6, y - 2, 12, 4);

        // Legs (animated)
        ctx.fillStyle = '#3a6a9a';
        const legOffset = this.velocityX !== 0 ? Math.sin(this.animFrame * Math.PI / 2) * 3 : 0;
        ctx.fillRect(5, y + 22, 6, 10);
        ctx.fillRect(13, y + 22, 6, 10);

        // Shoes
        ctx.fillStyle = '#8a4a2a';
        ctx.fillRect(4, y + 29, 7, 3);
        ctx.fillRect(13, y + 29, 7, 3);

        // Arms
        ctx.fillStyle = '#f5c6a0';
        const armSwing = this.velocityX !== 0 ? Math.sin(this.animFrame * Math.PI / 2) * 4 : 0;
        ctx.fillRect(0, y + 10 + armSwing, 4, 8);
        ctx.fillRect(20, y + 10 - armSwing, 4, 8);

        ctx.restore();
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
    }
}
