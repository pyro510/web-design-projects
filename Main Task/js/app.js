class App {
    constructor() {
        this.ui = new UI();
        this.timer = new Timer();
        this.quiz = null;
        this.settings = Storage.getSettings();
        this.timerMode = 'none';
        this.maxTime = 30;

        this._bindNavigation();
        this._showHome();
    }

    _bindNavigation() {
        document.querySelectorAll('[data-screen]').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const screen = link.dataset.screen;
                this._navigate(screen);
                document.body.classList.remove('nav--open');
                const burger = document.querySelector('.burger');
                if (burger) burger.classList.remove('burger--active');
            });
        });

        const burger = document.querySelector('.burger');
        const nav = document.querySelector('.nav');
        if (burger && nav) {
            burger.addEventListener('click', () => {
                burger.classList.toggle('burger--active');
                document.body.classList.toggle('nav--open');
            });
        }
    }

    _navigate(screen) {
        if (screen === 'home') {
            this.timer.stop();
            this._showHome();
        } else if (screen === 'history') {
            this.timer.stop();
            this._showHistory();
        } else if (screen === 'quiz') {
            this._startQuiz();
        }
    }

    _showHome() {
        this.ui.showScreen('home');
        this.ui.renderStatsPanel(document.getElementById('statsPanel'), QUIZZES);
        this.ui.renderQuizList(document.getElementById('quizList'), QUIZZES, (quiz) => {
            this._selectedQuiz = quiz;
            this._showSettings(quiz);
        });
    }

    _showSettings(quiz) {
        this.ui.showScreen('settings');
        const settings = Storage.getSettings();
        this.ui.renderSettings(
            document.getElementById('settingsCard'),
            settings,
            quiz,
            (mode, maxTime) => {
                if (mode !== undefined) {
                    this.timerMode = mode;
                    this.maxTime = maxTime || 30;
                    this._startQuiz();
                } else {
                    this._showHome();
                }
            }
        );
    }

    _startQuiz() {
        if (!this._selectedQuiz) return;

        this.quiz = new Quiz(this._selectedQuiz);
        this.ui.showScreen('quiz');

        const titleEl = document.getElementById('quizTitle');
        const progressEl = document.getElementById('quizProgress');
        const timerEl = document.getElementById('quizTimer');
        const questionArea = document.getElementById('questionArea');
        const actionsContainer = document.getElementById('quizActions');
        const progressFill = document.getElementById('progressFill');

        this._renderQuizScreen(titleEl, progressEl, timerEl, questionArea, actionsContainer, progressFill);

        if (this.timerMode === 'global') {
            const totalSeconds = this.maxTime * this.quiz.totalQuestions;
            this.timer.start(
                totalSeconds,
                (remaining) => {
                    timerEl.textContent = this.timer.formatTime(remaining);
                    if (remaining <= 60) {
                        timerEl.classList.add('quiz-timer--warning');
                    }
                },
                () => {
                    this._finishQuiz();
                }
            );
        } else if (this.timerMode === 'perQuestion') {
            this._startPerQuestionTimer(timerEl);
        } else {
            timerEl.textContent = '';
        }
    }

    _startPerQuestionTimer(timerEl) {
        this.timer.stop();
        this.timer.start(
            this.maxTime,
            (remaining) => {
                timerEl.textContent = this.timer.formatTime(remaining);
                if (remaining <= 10) {
                    timerEl.classList.add('quiz-timer--warning');
                } else {
                    timerEl.classList.remove('quiz-timer--warning');
                }
            },
            () => {
                this.quiz.next();
                if (this.quiz.isComplete) {
                    this._finishQuiz();
                } else {
                    this._renderCurrentQuestion(
                        document.getElementById('quizTimer'),
                        document.getElementById('progressFill')
                    );
                }
            }
        );
    }

    _renderQuizScreen(titleEl, progressEl, timerEl, questionArea, actionsContainer, progressFill) {
        this._renderCurrentQuestion(timerEl, progressFill);
    }

    _renderCurrentQuestion(timerEl, progressFill) {
        const titleEl = document.getElementById('quizTitle');
        const progressEl = document.getElementById('quizProgress');
        const questionArea = document.getElementById('questionArea');
        const actionsContainer = document.getElementById('quizActions');
        const progressFillEl = progressFill || document.getElementById('progressFill');

        this.ui.renderQuizHeader(
            titleEl,
            progressEl,
            document.getElementById('quizTimer'),
            this.quiz.quiz,
            this.quiz.currentIndex,
            this.quiz.totalQuestions,
            document.getElementById('quizTimer').textContent
        );

        this.ui.updateProgressBar(progressFillEl, this.quiz);

        const currentAnswer = this.quiz.answers[this.quiz.currentIndex];
        this.ui.renderQuizQuestion(questionArea, this.quiz, this.quiz.currentIndex, currentAnswer, (optionIndex) => {
            this.quiz.answer(this.quiz.currentIndex, optionIndex);
            this._renderCurrentQuestion(document.getElementById('quizTimer'), progressFillEl);
        });

        this.ui.renderQuizActions(actionsContainer, this.quiz.currentIndex, this.quiz.totalQuestions, () => {
            this.quiz.previous();
            if (this.timerMode === 'perQuestion') {
                this._startPerQuestionTimer(document.getElementById('quizTimer'));
            }
            this._renderCurrentQuestion(document.getElementById('quizTimer'), progressFillEl);
        }, (isLast) => {
            if (isLast) {
                this._finishQuiz();
            } else {
                this.quiz.next();
                if (this.timerMode === 'perQuestion') {
                    this._startPerQuestionTimer(document.getElementById('quizTimer'));
                }
                this._renderCurrentQuestion(document.getElementById('quizTimer'), progressFillEl);
            }
        });

        document.getElementById('quizTimer').classList.remove('quiz-timer--warning');
    }

    _finishQuiz() {
        this.timer.stop();
        const results = this.quiz.getResults();
        Storage.saveResult(results);
        this._showResults(results);
    }

    _showResults(results) {
        this.ui.showScreen('results');
        this.ui.renderResults(
            document.getElementById('resultsCard'),
            results,
            () => {},
            () => this._showHome()
        );
    }

    _showHistory() {
        this.ui.showScreen('history');
        const results = Storage.getResults();
        const container = document.getElementById('historyList');
        const filtersContainer = document.getElementById('historyFilters');
        const emptyContainer = document.getElementById('historyEmpty');

        let activeFilter = 'all';

        const render = (filter) => {
            activeFilter = filter;
            const filtered = filter === 'all' ? results : results.filter((r) => r.quizId === filter);

            this.ui.renderHistoryFilters(filtersContainer, QUIZZES, activeFilter, (f) => render(f));

            if (filtered.length === 0) {
                container.innerHTML = '';
                this.ui.renderHistoryEmpty(emptyContainer);
                emptyContainer.style.display = '';
            } else {
                emptyContainer.style.display = 'none';
                this.ui.renderHistoryList(container, filtered, QUIZZES);
            }
        };

        render('all');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
