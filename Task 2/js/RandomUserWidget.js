import { UIComponent } from './UIComponent.js';

export class RandomUserWidget extends UIComponent {
    constructor(config) {
        super({ ...config, title: config.title || 'Users' });
        this.users = [];
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
        this._refreshHandler = () => this.fetchUsers();
        refreshBtn.addEventListener('click', this._refreshHandler);
        this._eventListeners.push({ el: refreshBtn, event: 'click', handler: this._refreshHandler });

        this.fetchUsers();
        return el;
    }

    async fetchUsers() {
        const body = this.getBody();
        if (!body) return;

        body.innerHTML = `<div class="loading">Загрузка...</div>`;

        try {
            const res = await fetch('https://randomuser.me/api/?results=20');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            this.users = data.results
                .filter((u) => u.location.country !== 'Ukraine')
                .slice(0, 10)
                .map((u) => ({
                    name: `${u.name.first} ${u.name.last}`,
                    avatar: u.picture.medium,
                    location: `${u.location.city}, ${u.location.country}`,
                    email: u.email,
                }));

            this._renderUsers();
        } catch (err) {
            body.innerHTML = `<p class="error-msg">Ошибка загрузки: ${err.message}</p>`;
        }
    }

    _renderUsers() {
        const body = this.getBody();
        if (!body) return;

        const list = document.createElement('ul');
        list.className = 'users-list';

        this.users.forEach((u) => {
            const li = document.createElement('li');
            li.className = 'user-card';
            li.innerHTML = `
                <img class="user-card__avatar" src="${u.avatar}" alt="${u.name}" loading="lazy">
                <div class="user-card__info">
                    <p class="user-card__name">${u.name}</p>
                    <p class="user-card__location">${u.location}</p>
                    <p class="user-card__email">${u.email}</p>
                </div>
            `;
            list.appendChild(li);
        });

        body.innerHTML = '';
        body.appendChild(list);
    }
}
