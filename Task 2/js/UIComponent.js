export class UIComponent {
    constructor({ title, id }) {
        this.title = title;
        this.id = id;
        this._element = null;
        this._minimized = false;
        this._eventListeners = [];
    }

    render() {
        const el = document.createElement('div');
        el.className = 'widget';
        el.id = this.id;
        el.innerHTML = `
            <div class="widget__header">
                <span class="widget__title">${this.title}</span>
                <div class="widget__controls">
                    <button class="btn btn--ghost" data-action="minimize" aria-label="Свернуть">&#9472;&#9472;</button>
                    <button class="btn btn--ghost" data-action="close" aria-label="Закрыть">&times;</button>
                </div>
            </div>
            <div class="widget__body"></div>
        `;
        this._element = el;

        const minimizeBtn = el.querySelector('[data-action="minimize"]');
        const closeBtn = el.querySelector('[data-action="close"]');

        const minimizeHandler = () => this.minimize();
        const closeHandler = () => this.close();

        minimizeBtn.addEventListener('click', minimizeHandler);
        closeBtn.addEventListener('click', closeHandler);

        this._eventListeners.push(
            { el: minimizeBtn, event: 'click', handler: minimizeHandler },
            { el: closeBtn, event: 'click', handler: closeHandler }
        );

        return el;
    }

    destroy() {
        this._eventListeners.forEach(({ el, event, handler }) => {
            el.removeEventListener(event, handler);
        });
        this._eventListeners = [];
        if (this._element && this._element.parentNode) {
            this._element.parentNode.removeChild(this._element);
        }
        this._element = null;
    }

    minimize() {
        this._minimized = !this._minimized;
        if (this._element) {
            this._element.classList.toggle('widget--minimized', this._minimized);
        }
    }

    close() {
        if (this._onClose) {
            this._onClose(this.id);
        }
    }

    set onClose(handler) {
        this._onClose = handler;
    }

    getBody() {
        return this._element?.querySelector('.widget__body');
    }
}
