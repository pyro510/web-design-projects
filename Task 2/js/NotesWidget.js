import { UIComponent } from './UIComponent.js';

export class NotesWidget extends UIComponent {
    constructor(config) {
        super({ ...config, title: config.title || 'Notes' });
        this._inputHandler = null;
    }

    render() {
        const el = super.render();
        const body = this.getBody();
        const saved = localStorage.getItem(`notes-${this.id}`) || '';
        body.innerHTML = `
            <textarea class="notes-textarea" placeholder="Заметки...">${this._escape(saved)}</textarea>
            <p class="notes-status"></p>
        `;

        const textarea = body.querySelector('.notes-textarea');
        const status = body.querySelector('.notes-status');

        this._inputHandler = () => {
            localStorage.setItem(`notes-${this.id}`, textarea.value);
            status.textContent = 'Сохранено';
            clearTimeout(this._saveTimeout);
            this._saveTimeout = setTimeout(() => {
                status.textContent = '';
            }, 2000);
        };

        textarea.addEventListener('input', this._inputHandler);
        this._eventListeners.push({ el: textarea, event: 'input', handler: this._inputHandler });

        return el;
    }

    _escape(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
