class Timer {
    constructor() {
        this.remaining = 0;
        this.total = 0;
        this.interval = null;
        this.onTick = null;
        this.onEnd = null;
    }

    start(seconds, onTick, onEnd) {
        this.stop();
        if (seconds <= 0) return;
        this.remaining = seconds;
        this.total = seconds;
        this.onTick = onTick;
        this.onEnd = onEnd;

        if (this.onTick) this.onTick(this.remaining, this.total);

        this.interval = setInterval(() => {
            this.remaining--;
            if (this.remaining <= 0) {
                this.stop();
                if (this.onEnd) this.onEnd();
            } else if (this.onTick) {
                this.onTick(this.remaining, this.total);
            }
        }, 1000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    reset() {
        this.stop();
        this.remaining = 0;
        this.total = 0;
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
}
