import { UIComponent } from './UIComponent.js';

export class PokemonWidget extends UIComponent {
    constructor(config) {
        super({ ...config, title: config.title || 'Pokemon' });
        this.pokemon = [];
        this._refreshHandler = null;
    }

    render() {
        const el = super.render();
        const body = this.getBody();
        body.innerHTML = `
            <div class="loading">Загрузка...</div>
            <button class="btn btn--outline" style="margin-top:10px">Обновить</button>
        `;

        const refreshBtn = body.querySelector('.btn--outline');
        this._refreshHandler = () => this.fetchPokemon();
        refreshBtn.addEventListener('click', this._refreshHandler);
        this._eventListeners.push({ el: refreshBtn, event: 'click', handler: this._refreshHandler });

        this.fetchPokemon();
        return el;
    }

    async fetchPokemon() {
        const body = this.getBody();
        if (!body) return;

        body.innerHTML = `<div class="loading">Загрузка...</div>`;

        try {
            const offset = Math.floor(Math.random() * 100);
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=8&offset=${offset}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            const details = await Promise.all(
                data.results.map(async (p) => {
                    const r = await fetch(p.url);
                    return r.json();
                })
            );

            this.pokemon = details.map((p) => ({
                name: p.name,
                image: p.sprites.front_default,
                types: p.types.map((t) => t.type.name),
            }));

            this._renderPokemon();
        } catch (err) {
            body.innerHTML = `<p class="error-msg">Ошибка загрузки: ${err.message}</p>`;
        }
    }

    _renderPokemon() {
        const body = this.getBody();
        if (!body) return;

        const grid = document.createElement('div');
        grid.className = 'pokemon-grid';

        this.pokemon.forEach((p) => {
            const card = document.createElement('div');
            card.className = 'pokemon-card';
            card.innerHTML = `
                <img class="pokemon-card__img" src="${p.image}" alt="${p.name}" loading="lazy">
                <p class="pokemon-card__name">${p.name}</p>
                <p class="pokemon-card__type">${p.types.join(', ')}</p>
            `;
            grid.appendChild(card);
        });

        body.innerHTML = '';
        body.appendChild(grid);
    }
}
