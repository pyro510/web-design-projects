import { UIComponent } from './UIComponent.js';

export class QuoteWidget extends UIComponent {
    constructor(config) {
        super({ ...config, title: config.title || 'Quote' });
        this.quotes = [
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "It's not a bug. It's an undocumented feature.", author: "Unknown" },
            { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
            { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
            { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
            { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
            { text: "In order to be irreplaceable, one must always be different.", author: "Coco Chanel" },
            { text: "There are only two hard things in Computer Science: cache invalidation and naming things.", author: "Phil Karlton" },
        ];
        this._refreshHandler = null;
    }

    render() {
        const el = super.render();
        const body = this.getBody();
        body.innerHTML = `
            <p class="quote-widget__text"></p>
            <p class="quote-widget__author"></p>
            <button class="btn btn--outline quote-widget__refresh">Обновить</button>
        `;

        const refreshBtn = body.querySelector('.quote-widget__refresh');
        this._refreshHandler = () => this._showQuote();
        refreshBtn.addEventListener('click', this._refreshHandler);
        this._eventListeners.push({ el: refreshBtn, event: 'click', handler: this._refreshHandler });

        this._showQuote();
        return el;
    }

    _showQuote() {
        const body = this.getBody();
        const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        body.querySelector('.quote-widget__text').textContent = `"${quote.text}"`;
        body.querySelector('.quote-widget__author').textContent = `— ${quote.author}`;
    }
}
