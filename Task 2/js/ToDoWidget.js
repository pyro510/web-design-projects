import { UIComponent } from './UIComponent.js';

export class ToDoWidget extends UIComponent {
    constructor(config) {
        super({ ...config, title: config.title || 'ToDo' });
        this.tasks = [];
        this._nextId = 1;
        this._addHandler = null;
        this._inputHandler = null;
        this._load();
    }

    render() {
        const el = super.render();
        const body = this.getBody();
        body.innerHTML = `
            <form class="todo-form">
                <input type="text" class="todo-form__input" placeholder="Новая задача..." required>
                <button type="submit" class="btn btn--sm">Добавить</button>
            </form>
            <ul class="todo-list"></ul>
        `;

        const form = body.querySelector('.todo-form');
        const input = body.querySelector('.todo-form__input');

        this._addHandler = (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (text) {
                this.addTask(text);
                input.value = '';
            }
        };
        form.addEventListener('submit', this._addHandler);
        this._eventListeners.push({ el: form, event: 'submit', handler: this._addHandler });

        this._renderTasks();
        return el;
    }

    addTask(text) {
        this.tasks.push({ id: this._nextId++, text, done: false });
        this._save();
        this._renderTasks();
    }

    removeTask(id) {
        this.tasks = this.tasks.filter((t) => t.id !== id);
        this._save();
        this._renderTasks();
    }

    toggleTask(id) {
        const task = this.tasks.find((t) => t.id === id);
        if (task) {
            task.done = !task.done;
            this._save();
            this._renderTasks();
        }
    }

    _renderTasks() {
        const list = this.getBody()?.querySelector('.todo-list');
        if (!list) return;
        list.innerHTML = '';
        this.tasks.forEach((task) => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            li.innerHTML = `
                <input type="checkbox" class="todo-item__checkbox" ${task.done ? 'checked' : ''}>
                <span class="todo-item__text ${task.done ? 'todo-item__text--done' : ''}">${this._escape(task.text)}</span>
                <button class="btn btn--danger todo-item__delete">&times;</button>
            `;
            const checkbox = li.querySelector('.todo-item__checkbox');
            const deleteBtn = li.querySelector('.todo-item__delete');

            const toggleHandler = () => this.toggleTask(task.id);
            const deleteHandler = () => this.removeTask(task.id);

            checkbox.addEventListener('change', toggleHandler);
            deleteBtn.addEventListener('click', deleteHandler);

            this._eventListeners.push(
                { el: checkbox, event: 'change', handler: toggleHandler },
                { el: deleteBtn, event: 'click', handler: deleteHandler }
            );

            list.appendChild(li);
        });
    }

    _escape(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    _save() {
        localStorage.setItem(`todo-${this.id}`, JSON.stringify({ tasks: this.tasks, nextId: this._nextId }));
    }

    _load() {
        try {
            const data = JSON.parse(localStorage.getItem(`todo-${this.id}`));
            if (data) {
                this.tasks = data.tasks || [];
                this._nextId = data.nextId || 1;
            }
        } catch {
            // ignore
        }
    }
}
