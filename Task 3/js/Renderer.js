class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = 1360;
        this.canvas.height = 760;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground(scrollX) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Sky gradient
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#1a2e4a');
        grad.addColorStop(0.6, '#2a4a3a');
        grad.addColorStop(1, '#0a1a14');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Stars (parallax layer 1)
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 40; i++) {
            const sx = ((i * 73 + 17) % w + w - (scrollX * 0.05) % w) % w;
            const sy = (i * 47 + 11) % (h * 0.5);
            ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
        }

        // Mountains (parallax layer 2)
        ctx.fillStyle = '#1a3a2a';
        for (let i = 0; i < 8; i++) {
            const mx = ((i * 160) - (scrollX * 0.15) % (w + 160)) % (w + 160) - 80;
            const mh = 80 + (i % 3) * 40;
            ctx.beginPath();
            ctx.moveTo(mx, h - 60);
            ctx.lineTo(mx + 60, h - 60 - mh);
            ctx.lineTo(mx + 120, h - 60);
            ctx.fill();
        }

        // Trees (parallax layer 3)
        ctx.fillStyle = '#0d2218';
        for (let i = 0; i < 12; i++) {
            const tx = ((i * 100) - (scrollX * 0.3) % (w + 100)) % (w + 100) - 50;
            const th = 30 + (i % 4) * 10;
            ctx.fillRect(tx + 8, h - 60 - th, 8, th);
            ctx.fillRect(tx, h - 60 - th - 10, 24, 14);
        }
    }

    drawParticles(particles) {
        const ctx = this.ctx;
        particles.forEach((p) => {
            ctx.fillStyle = `rgba(${p.color}, ${p.life})`;
            ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        });
    }

    drawScore(score, ctxOverride) {
        const ctx = ctxOverride || this.ctx;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 18px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`Score: ${score}`, this.canvas.width - 16, 30);
    }
}
