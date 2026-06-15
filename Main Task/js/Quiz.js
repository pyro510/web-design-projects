class Quiz {
    constructor(quizData) {
        this.quiz = quizData;
        this.currentIndex = 0;
        this.answers = new Array(quizData.questions.length).fill(null);
        this.score = 0;
    }

    getCurrentQuestion() {
        return this.questions[this.currentIndex];
    }

    get questions() {
        return this.quiz.questions;
    }

    get totalQuestions() {
        return this.questions.length;
    }

    get isComplete() {
        return this.currentIndex >= this.totalQuestions;
    }

    get progress() {
        return this.currentIndex / this.totalQuestions;
    }

    answer(questionIndex, optionIndex) {
        this.answers[questionIndex] = optionIndex;
        if (optionIndex === this.questions[questionIndex].correct) {
            this.score++;
        }
    }

    next() {
        if (!this.isComplete) {
            this.currentIndex++;
        }
    }

    previous() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        }
    }

    getResults() {
        return {
            quizId: this.quiz.id,
            title: this.quiz.title,
            level: this.quiz.level,
            badgeClass: this.quiz.badgeClass,
            total: this.totalQuestions,
            score: this.score,
            percentage: Math.round((this.score / this.totalQuestions) * 100),
            answers: [...this.answers],
            questions: this.questions.map((q) => ({
                question: q.q,
                options: q.options,
                correct: q.correct,
                explanation: q.explanation || '',
            })),
        };
    }
}
