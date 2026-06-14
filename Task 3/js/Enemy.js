class Enemy {
    constructor(x, y, platformWidth) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.speed = 1.5;
        this.direction = 1;
        this.platformStart = x;
        this.platformEnd = x + platformWidth - this.width;
        this.animFrame = 0;
        this.animTimer = 0;
    }

    update() {
        this.x += this.speed * this.direction;

        if (this.x <= this.platformStart || this.x + this.width >= this.platformEnd) {
            this.direction *= -1;
        }

        this.animTimer++;
        if (this.animTimer > 12) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 2;
        }
    }

    draw(ctx) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);

        // Body
        ctx.fillStyle = '#c25b5b';
        ctx.fillRect(x + 2, y + 4, 16, 12);

        // Head
        ctx.fillStyle = '#d47a7a';
        ctx.fillRect(x + 4, y, 12, 8);

        // Eyes
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(x + 6, y + 3, 3, 3);
        ctx.fillRect(x + 12, y + 3, 3, 3);

        // Spikes
        ctx.fillStyle = '#a84040';
        const spikeY = y + (this.animFrame === 0 ? 0 : 2);
        ctx.fillRect(x, y + 4 + spikeY, 4, 4);
        ctx.fillRect(x + 16, y + 4 + spikeY, 4, 4);

        // Legs
        ctx.fillStyle = '#8a3030';
        ctx.fillRect(x + 4, y + 16, 4, 4);
        ctx.fillRect(x + 12, y + 16, 4, 4);
    }
}
