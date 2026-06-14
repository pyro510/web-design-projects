class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);

        // Top surface (grass)
        ctx.fillStyle = '#4a8a3a';
        ctx.fillRect(x, y, this.width, 4);

        // Dirt layers
        ctx.fillStyle = '#8a6a3a';
        ctx.fillRect(x, y + 4, this.width, this.height - 4);

        // Pixel details
        ctx.fillStyle = '#7a5a2a';
        for (let i = 0; i < this.width; i += 8) {
            ctx.fillRect(x + i, y + 8, 4, 2);
        }

        // Edge highlights
        ctx.fillStyle = '#5a9a4a';
        ctx.fillRect(x, y, 2, this.height);
    }

    static generate(x, minWidth, maxWidth, yRange) {
        const w = minWidth + Math.random() * (maxWidth - minWidth);
        const y = yRange[0] + Math.random() * (yRange[1] - yRange[0]);
        return new Platform(x, y, w, 16);
    }
}
