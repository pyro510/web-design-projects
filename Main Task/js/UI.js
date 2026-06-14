class UI {
    constructor() {
        this.screens = document.querySelectorAll('.screen');
    }

    showScreen(screenId) {
        this.screens.forEach((s) => {
            s.classList.remove('screen--active');
        });
        const target = document.getElementById(`screen-${screenId}`);
        if (target) target.classList.add('screen--active');
    }

    renderStatsPanel(container, quizzes) {
        const results = Storage.getResults();
        const best = Storage.getBestScores();
        const totalAttempts = results.length;
        const avgScore = totalAttempts > 0
            ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalAttempts)
            : 0;
        const bestOverall = totalAttempts > 0
            ? Math.max(...results.map((r) => r.percentage))
            : 0;

        let html = `
            <div class="stats-panel__title">Статистика</div>
            <div class="stats-panel__item">
                <div class="stats-panel__label">Пройдено тестов</div>
                <div class="stats-panel__value">${totalAttempts}</div>
            </div>
            <div class="stats-panel__item">
                <div class="stats-panel__label">Средний балл</div>
                <div class="stats-panel__value stats-panel__value--accent">${avgScore}%</div>
            </div>
            <div class="stats-panel__item">
                <div class="stats-panel__label">Лучший результат</div>
                <div class="stats-panel__value">${bestOverall}%</div>
            </div>
        `;

        if (Object.keys(best).length > 0) {
            html += `<div class="stats-best-scores"><div class="stats-best-scores__title">Лучшие по тестам</div>`;
            quizzes.forEach((q) => {
                const b = best[q.id];
                if (b) {
                    html += `
                        <div class="stats-best-item">
                            <span class="stats-best-item__name">${q.title}</span>
                            <span class="stats-best-item__score">${b.percentage}%</span>
                        </div>
                    `;
                }
            });
            html += `</div>`;
        }

        container.innerHTML = html;
    }

    renderQuizList(container, quizzes, onSelect) {
        container.innerHTML = quizzes
            .map(
                (q) => `
            <div class="quiz-card" data-quiz-id="${q.id}">
                <span class="quiz-card__level">${q.level}</span>
                <h3 class="quiz-card__title">${q.title}</h3>
                <p class="quiz-card__desc">${q.description}</p>
                <div class="quiz-card__footer">
                    <span class="quiz-card__count">${q.questions.length} вопросов</span>
                    <button class="btn--start" data-quiz-id="${q.id}">Начать</button>
                </div>
            </div>
        `
            )
            .join('');

        container.querySelectorAll('.btn--start').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.quizId;
                const quiz = quizzes.find((q) => q.id === id);
                if (quiz && onSelect) onSelect(quiz);
            });
        });
    }

    renderSettings(container, settings, quiz, onBack) {
        const best = Storage.getBestScores();
        const bestScore = best[quiz.id];

        container.innerHTML = `
            <div class="settings-header">
                <h2 class="settings-title">${quiz.title}</h2>
                <p class="settings-desc">${quiz.description}</p>
            </div>
            <div class="settings-group">
                <label class="settings-label">
                    <span class="settings-label__text">Таймер</span>
                    <select id="settingsTimerMode" class="settings-select">
                        <option value="none" ${settings.timerMode === 'none' ? 'selected' : ''}>Без таймера</option>
                        <option value="global" ${settings.timerMode === 'global' ? 'selected' : ''}>Общий таймер</option>
                        <option value="perQuestion" ${settings.timerMode === 'perQuestion' ? 'selected' : ''}>Таймер на вопрос</option>
                    </select>
                </label>
                <label class="settings-label" id="settingsMaxTimeGroup" ${settings.timerMode === 'none' ? 'style="display:none"' : ''}>
                    <span class="settings-label__text">Максимальное время (сек)</span>
                    <input type="number" id="settingsMaxTime" class="settings-input" value="${settings.maxTime}" min="5" max="300">
                </label>
            </div>
            <div class="settings-actions">
                <button class="btn btn--secondary" id="settingsBack">Назад</button>
                <button class="btn btn--primary" id="settingsStart">Начать тест</button>
            </div>
            ${bestScore ? `<div class="settings-best">Лучший результат: ${bestScore.score}/${bestScore.total} (${bestScore.percentage}%)</div>` : ''}
        `;

        const timerMode = container.querySelector('#settingsTimerMode');
        const maxTimeGroup = container.querySelector('#settingsMaxTimeGroup');
        timerMode.addEventListener('change', () => {
            maxTimeGroup.style.display = timerMode.value === 'none' ? 'none' : '';
        });

        container.querySelector('#settingsBack').addEventListener('click', () => {
            if (onBack) onBack();
        });

        container.querySelector('#settingsStart').addEventListener('click', () => {
            const mode = timerMode.value;
            const maxTime = parseInt(container.querySelector('#settingsMaxTime').value) || 30;
            Storage.saveSettings({ timerMode: mode, maxTime });
            if (onBack) onBack(mode, maxTime);
        });
    }

    renderQuizQuestion(area, quiz, questionIndex, answer, onOptionSelect) {
        const q = quiz.questions[questionIndex];
        const correctIndex = q.correct;
        const hasAnswer = answer !== null;

        area.innerHTML = `
            <div class="question">
                <span class="question__number">${questionIndex + 1}</span>
                <h3 class="question__text">${q.question}</h3>
            </div>
            <div class="options">
                ${q.options
                    .map(
                        (opt, i) => {
                            let cls = 'option';
                            if (hasAnswer) {
                                if (i === correctIndex) cls += ' option--correct';
                                else if (i === answer) cls += ' option--wrong';
                            } else if (i === answer) {
                                cls += ' option--selected';
                            }
                            return `
                    <label class="${cls}" data-option="${i}">
                        <span class="option__bullet"></span>
                        <span class="option__label">${opt}</span>
                    </label>
                `;
                        }
                    )
                    .join('')}
            </div>
        `;

        area.querySelectorAll('.option:not(.option--correct):not(.option--wrong)').forEach((opt) => {
            opt.addEventListener('click', () => {
                const idx = parseInt(opt.dataset.option);
                onOptionSelect(idx);
            });
        });
    }

    renderQuizActions(container, quizIndex, total, onPrev, onNext) {
        const isFirst = quizIndex === 0;
        const isLast = quizIndex === total - 1;
        container.innerHTML = `
            <button class="btn btn--secondary" id="quizPrev" ${isFirst ? 'disabled' : ''}>${isFirst ? 'Первый вопрос' : 'Назад'}</button>
            <button class="btn btn--primary" id="quizNext">${isLast ? 'Завершить' : 'Далее'}</button>
        `;

        if (!isFirst) {
            container.querySelector('#quizPrev').addEventListener('click', () => onPrev());
        }
        container.querySelector('#quizNext').addEventListener('click', () => onNext(isLast));
    }

    renderQuizHeader(titleEl, progressEl, timerEl, quiz, index, total, timerText) {
        titleEl.textContent = quiz.title;
        progressEl.textContent = `${index + 1} / ${total}`;
        timerEl.textContent = timerText || '';
    }

    updateProgressBar(fillEl, quiz) {
        fillEl.style.width = `${quiz.progress * 100}%`;
    }

    renderResults(container, results, onReview, onHome, onSave) {
        const { percentage, score, total } = results;
        let grade, colorClass;
        if (percentage >= 90) {
            grade = 'Отлично';
            colorClass = 'results__grade--excellent';
        } else if (percentage >= 70) {
            grade = 'Хорошо';
            colorClass = 'results__grade--good';
        } else if (percentage >= 50) {
            grade = 'Удовлетворительно';
            colorClass = 'results__grade--pass';
        } else {
            grade = 'Не сдано';
            colorClass = 'results__grade--fail';
        }

        container.innerHTML = `
            <div class="results">
                <div class="results__circle ${colorClass}">${percentage}%</div>
                <h2 class="results__title">${grade}</h2>
                <p class="results__score">${score} из ${total} правильных</p>
                <p class="results__quiz">${results.title} — ${results.level}</p>
            </div>
            <div class="results-actions">
                <button class="btn btn--secondary" id="resultsReview">Разбор ошибок</button>
                <button class="btn btn--success" id="resultsSave">Сохранить результат</button>
                <button class="btn btn--primary" id="resultsHome">На главную</button>
            </div>
            <div class="review" id="reviewSection" style="display:none"></div>
        `;

        container.querySelector('#resultsHome').addEventListener('click', () => onHome());
        container.querySelector('#resultsReview').addEventListener('click', () => {
            const review = container.querySelector('#reviewSection');
            review.style.display = review.style.display === 'none' ? 'block' : 'none';
            if (review.children.length === 0) {
                this.renderReview(review, results);
            }
        });
        container.querySelector('#resultsSave').addEventListener('click', () => {
            onSave(results);
            const saveBtn = container.querySelector('#resultsSave');
            saveBtn.textContent = 'Сохранено';
            saveBtn.disabled = true;
        });
    }

    renderReview(container, results) {
        const html = results.questions
            .map((q, i) => {
                const userAnswer = results.answers[i];
                const isCorrect = userAnswer === q.correct;
                return `
                <div class="review-item ${isCorrect ? 'review-item--correct' : 'review-item--wrong'}">
                    <div class="review-item__header">
                        <span class="review-item__number">${i + 1}</span>
                        <span class="review-item__status">${isCorrect ? 'Верно' : 'Неверно'}</span>
                    </div>
                    <p class="review-item__question">${q.question}</p>
                    <p class="review-item__answer">Ваш ответ: ${userAnswer !== null ? q.options[userAnswer] : 'Нет ответа'}</p>
                    ${!isCorrect ? `<p class="review-item__correct">Правильный ответ: ${q.options[q.correct]}</p>` : ''}
                    ${q.explanation ? `<p class="review-item__explanation">${q.explanation}</p>` : ''}
                </div>
            `;
            })
            .join('');
        container.innerHTML = html;
    }

    renderHistoryFilters(container, quizzes, activeFilter, onSelect) {
        container.innerHTML = `
            <button class="filter-btn ${activeFilter === 'all' ? 'filter-btn--active' : ''}" data-filter="all">Все</button>
            ${quizzes
                .map(
                    (q) => `
                <button class="filter-btn ${activeFilter === q.id ? 'filter-btn--active' : ''}" data-filter="${q.id}">${q.title}</button>
            `
                )
                .join('')}
            <button class="filter-btn filter-btn--clear" id="historyClear">Очистить</button>
        `;

        container.querySelectorAll('.filter-btn[data-filter]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                if (onSelect) onSelect(filter);
            });
        });

        const clearBtn = container.querySelector('#historyClear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Удалить все результаты?')) {
                    Storage.clearResults();
                    if (onSelect) onSelect('all');
                }
            });
        }
    }

    renderHistoryList(container, results, quizzes) {
        if (results.length === 0) {
            container.innerHTML = '';
            return;
        }
        container.innerHTML = results
            .map((r) => {
                const date = new Date(r.date).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });
                return `
                <div class="history-card">
                    <div class="history-card__header">
                        <span class="history-card__title">${r.title}</span>
                        <span class="history-card__level">${r.level}</span>
                    </div>
                    <div class="history-card__body">
                        <span class="history-card__score">${r.score} / ${r.total}</span>
                        <span class="history-card__percentage">${r.percentage}%</span>
                    </div>
                    <div class="history-card__date">${date}</div>
                </div>
            `;
            })
            .join('');
    }

    renderHistoryEmpty(container) {
        container.innerHTML = `
            <div class="history-empty__content">
                <p class="history-empty__title">Пока нет результатов</p>
                <p class="history-empty__desc">Пройдите хотя бы один тест, чтобы увидеть историю.</p>
            </div>
        `;
    }
}
