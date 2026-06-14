document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);

    // UI elements
    const scoreDisplay = document.getElementById('scoreDisplay');
    const livesDisplay = document.getElementById('livesDisplay');
    const highScoreDisplay = document.getElementById('highScoreDisplay');
    const startOverlay = document.getElementById('startOverlay');
    const pauseOverlay = document.getElementById('pauseOverlay');
    const gameOverOverlay = document.getElementById('gameOverOverlay');
    const finalScore = document.getElementById('finalScore');

    // Buttons
    document.getElementById('startBtn').addEventListener('click', () => {
        startOverlay.classList.add('game-overlay--hidden');
        game.start();
    });

    document.getElementById('resumeBtn').addEventListener('click', () => {
        pauseOverlay.classList.add('game-overlay--hidden');
        game.resume();
    });

    document.getElementById('restartBtn').addEventListener('click', () => {
        gameOverOverlay.classList.add('game-overlay--hidden');
        game.start();
    });

    document.getElementById('restartBtn2')?.addEventListener('click', () => {
        game.start();
        pauseOverlay.classList.add('game-overlay--hidden');
        gameOverOverlay.classList.add('game-overlay--hidden');
        startOverlay.classList.add('game-overlay--hidden');
    });

    document.getElementById('restartBtnPause')?.addEventListener('click', () => {
        game.start();
        pauseOverlay.classList.add('game-overlay--hidden');
        gameOverOverlay.classList.add('game-overlay--hidden');
    });

    // Pause key
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyP') {
            if (game.state === 'playing') {
                game.pause();
                pauseOverlay.classList.remove('game-overlay--hidden');
            } else if (game.state === 'paused') {
                game.resume();
                pauseOverlay.classList.add('game-overlay--hidden');
            }
        }
    });

    // Resize
    const resizeObserver = new ResizeObserver(() => {
        game.renderer.resize();
    });
    resizeObserver.observe(canvas.parentElement);

    // Initial render
    game.renderer.resize();
    game.renderer.clear();
    game.renderer.drawBackground(0);

    // Update UI loop
    function updateUI() {
        scoreDisplay.textContent = game.getScore();
        const hearts = '♥'.repeat(game.getLives()) + '♡'.repeat(Math.max(0, 3 - game.getLives()));
        livesDisplay.textContent = hearts;
        highScoreDisplay.textContent = game.getHighScore();

        if (game.state === 'gameover') {
            finalScore.textContent = game.getScore();
            gameOverOverlay.classList.remove('game-overlay--hidden');
        }

        requestAnimationFrame(updateUI);
    }
    updateUI();
});
