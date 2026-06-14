import { ToDoWidget } from './ToDoWidget.js';
import { QuoteWidget } from './QuoteWidget.js';
import { PokemonWidget } from './PokemonWidget.js';
import { RandomUserWidget } from './RandomUserWidget.js';
import { NotesWidget } from './NotesWidget.js';

export class Dashboard {
    constructor(container) {
        this.container = container;
        this.widgets = [];
        this._counter = 0;
    }

    _generateId() {
        return `widget-${++this._counter}`;
    }

    addWidget(type) {
        const id = this._generateId();
        let widget;

        const config = { id };

        switch (type) {
            case 'todo':
                widget = new ToDoWidget(config);
                break;
            case 'quote':
                widget = new QuoteWidget(config);
                break;
            case 'pokemon':
                widget = new PokemonWidget(config);
                break;
            case 'users':
                widget = new RandomUserWidget(config);
                break;
            case 'notes':
                widget = new NotesWidget(config);
                break;
            default:
                console.warn(`Unknown widget type: ${type}`);
                return null;
        }

        widget.onClose = (widgetId) => this.removeWidget(widgetId);

        const el = widget.render();
        this.container.appendChild(el);
        this.widgets.push(widget);

        return widget;
    }

    removeWidget(widgetId) {
        const index = this.widgets.findIndex((w) => w.id === widgetId);
        if (index !== -1) {
            this.widgets[index].destroy();
            this.widgets.splice(index, 1);
        }
    }
}
