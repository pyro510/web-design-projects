class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.input = new InputHandler();
        this.player = new Player(150, 400);

        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.particles = [];

        this.score = 0;
        this.lives = 3;
        this.highScore = parseInt(localStorage.getItem('pixelRunnerHighScore')) || 0;
        this.state = 'start';

        this.scrollX = 0;
        this.gameSpeed = 1.2;
        this.spawnTimer = 0;
        this.difficultyLevel = 1;

        this._lastTime = 0;
        this._invincible = 0;

        this.audioCtx = null;
        this._initAudio();
    }

    _initAudio() {
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch {
            // No audio support
        }
    }

    _playSound(type) {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        const now = this.audioCtx.currentTime;
        switch (type) {
            case 'jump':
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'coin':
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.setValueAtTime(1200, now + 0.08);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;
            case 'hit':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
        }
    }

    start() {
        this.state = 'playing';
        this.player.reset(150, 400);
        this.platforms = [new Platform(50, 500, 300, 20)];
        this.coins = [];
        this.enemies = [];
        this.particles = [];
        this.score = 0;
        this.lives = 3;
        this.scrollX = 0;
        this.gameSpeed = 1.2;
        this.spawnTimer = 0;
        this.difficultyLevel = 1;
        this._generateInitialPlatforms();
        this._lastTime = performance.now();
        this._loop();
    }

    _generateInitialPlatforms() {
        let x = 380;
        for (let i = 0; i < 6; i++) {
            this._spawnPlatform(x);
            x += 160 + Math.random() * 100;
        }
    }

    _spawnPlatform(x) {
        const canvasH = this.canvas.height;
        const lastPlatform = this.platforms.length > 0 ? this.platforms[this.platforms.length - 1] : null;

        const maxGapY = 100;
        const minWidth = 120;
        const maxWidth = 180;

        let y;
        if (lastPlatform) {
            const minY = lastPlatform.y - maxGapY;
            const maxY = lastPlatform.y + maxGapY;
            y = Math.max(canvasH * 0.3, Math.min(canvasH * 0.82, minY + Math.random() * (maxY - minY)));
        } else {
            y = canvasH * 0.55 + Math.random() * (canvasH * 0.2);
        }

        const w = minWidth + Math.random() * (maxWidth - minWidth);

        // Ensure no overlap with last platform
        let finalX = x;
        if (lastPlatform && finalX < lastPlatform.x + lastPlatform.width + 40) {
            finalX = lastPlatform.x + lastPlatform.width + 40;
        }

        const platform = new Platform(finalX, y, w, 20);
        this.platforms.push(platform);

        // Maybe add coin
        if (Math.random() < 0.6) {
            const coinX = platform.x + platform.width / 2 - 6;
            const coinY = platform.y - 24;
            this.coins.push(new Coin(coinX, coinY));
        }

        // Maybe add enemy
        if (Math.random() < 0.12 * this.difficultyLevel && platform.width > 160) {
            const enemyX = platform.x + 40 + Math.random() * (platform.width - 80);
            this.enemies.push(new Enemy(enemyX, platform.y - 20, platform.width));
        }
    }

    _spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4 - 2,
                life: 1,
                decay: 0.02 + Math.random() * 0.03,
                size: 2 + Math.random() * 2,
                color,
            });
        }
    }

    update() {
        if (this.state !== 'playing') return;

        // Player
        const event = this.player.update(this.input, this.canvas.width);
        if (event === 'jump') {
            this._playSound('jump');
        }

        // Scroll
        this.scrollX += this.gameSpeed;
        this.score += Math.floor(this.gameSpeed);

        // Difficulty
        this.difficultyLevel = 1 + Math.floor(this.score / 500);
        this.gameSpeed = 2 + this.difficultyLevel * 0.3;

        // Invincibility timer
        if (this._invincible > 0) this._invincible--;

        // Move platforms, coins, enemies left
        const moveSpeed = this.gameSpeed;
        this.platforms.forEach((p) => (p.x -= moveSpeed));
        this.coins.forEach((c) => { c.x -= moveSpeed; c.update(); });
        this.enemies.forEach((e) => { e.x -= moveSpeed; e.update(); });

        // Remove off-screen
        this.platforms = this.platforms.filter((p) => p.x + p.width > -50);
        this.coins = this.coins.filter((c) => !c.collected && c.x > -50);
        this.enemies = this.enemies.filter((e) => e.x > -50);

        // Spawn new platforms
        const lastPlatform = this.platforms[this.platforms.length - 1];
        if (lastPlatform && lastPlatform.x < this.canvas.width - 200) {
            this._spawnPlatform(lastPlatform.x + 160 + Math.random() * 120);
        }

        // Collision: player-platform
        this.player.onGround = false;
        this.platforms.forEach((p) => Collision.resolvePlatform(this.player, p));

        // Collision: player-coin
        this.coins.forEach((c) => {
            if (!c.collected && Collision.aabb(this.player, c)) {
                c.collect();
                this.score += 50;
                this._playSound('coin');
                this._spawnParticles(c.x + 6, c.y + 6, '255, 215, 0', 8);
            }
        });

        // Collision: player-enemy
        if (this._invincible <= 0) {
            this.enemies.forEach((e) => {
                if (Collision.aabb(this.player, e)) {
                    this.lives--;
                    this._playSound('hit');
                    this._spawnParticles(this.player.x + 12, this.player.y + 16, '194, 91, 91', 12);
                    this._invincible = 60;

                    if (this.lives <= 0) {
                        this.state = 'gameover';
                        if (this.score > this.highScore) {
                            this.highScore = this.score;
                            localStorage.setItem('pixelRunnerHighScore', this.highScore);
                        }
                    }
                }
            });
        }

        // Fall off screen
        if (this.player.y > this.canvas.height + 80) {
            this.lives--;
            this._playSound('hit');
            this._invincible = 60;
            this.player.reset(150, 100);

            if (this.lives <= 0) {
                this.state = 'gameover';
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('pixelRunnerHighScore', this.highScore);
                }
            }
        }

        // Particles
        this.particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life -= p.decay;
        });
        this.particles = this.particles.filter((p) => p.life > 0);
    }

    render() {
        this.renderer.clear();
        this.renderer.drawBackground(this.scrollX);

        this.platforms.forEach((p) => p.draw(this.renderer.ctx));
        this.coins.forEach((c) => c.draw(this.renderer.ctx));
        this.enemies.forEach((e) => e.draw(this.renderer.ctx));
        this.player.draw(this.renderer.ctx);
        this.renderer.drawParticles(this.particles);

        // Invincibility flash
        if (this._invincible > 0 && Math.floor(this._invincible / 4) % 2 === 0) {
            this.renderer.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.renderer.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    _loop() {
        if (this.state !== 'playing') return;
        this.update();
        this.render();
        requestAnimationFrame(() => this._loop());
    }

    pause() {
        if (this.state === 'playing') {
            this.state = 'paused';
        }
    }

    resume() {
        if (this.state === 'paused') {
            this.state = 'playing';
            this._lastTime = performance.now();
            this._loop();
        }
    }

    getScore() {
        return this.score;
    }

    getLives() {
        return this.lives;
    }

    getHighScore() {
        return this.highScore;
    }

    destroy() {
        this.input.destroy();
    }
}
