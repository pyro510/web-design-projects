class Storage {
    static KEYS = {
        RESULTS: 'quiz_results',
        SETTINGS: 'quiz_settings',
    };

    static getResults() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.RESULTS)) || [];
        } catch {
            return [];
        }
    }

    static saveResult(result) {
        const results = this.getResults();
        results.unshift({
            ...result,
            date: new Date().toISOString(),
        });
        localStorage.setItem(this.KEYS.RESULTS, JSON.stringify(results));
    }

    static getBestScores() {
        const results = this.getResults();
        const best = {};
        results.forEach((r) => {
            if (!best[r.quizId] || r.score > best[r.quizId].score) {
                best[r.quizId] = r;
            }
        });
        return best;
    }

    static getSettings() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS)) || { timerMode: 'none', maxTime: 30 };
        } catch {
            return { timerMode: 'none', maxTime: 30 };
        }
    }

    static saveSettings(settings) {
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    }

    static clearResults() {
        localStorage.removeItem(this.KEYS.RESULTS);
    }
}
