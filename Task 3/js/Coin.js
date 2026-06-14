class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 12;
        this.height = 12;
        this.collected = false;
        this.animFrame = 0;
        this.animTimer = 0;
    }

    update() {
        this.animTimer++;
        if (this.animTimer > 6) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }

    draw(ctx) {
        if (this.collected) return;

        const x = Math.round(this.x);
        const y = Math.round(this.y);

        // Coin shape (pixel art)
        ctx.fillStyle = '#ffd700';
        const widths = [8, 12, 8, 4];
        const w = widths[this.animFrame];
        const offset = (12 - w) / 2;
        ctx.fillRect(x + offset, y + 2, w, 8);
        ctx.fillRect(x + 2, y + 1, 8, 10);

        // Highlight
        ctx.fillStyle = '#fff5a0';
        ctx.fillRect(x + 4, y + 3, 3, 3);
    }

    collect() {
        this.collected = true;
    }
}
