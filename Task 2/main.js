import { Dashboard } from './js/Dashboard.js';

// ===== Theme Toggle =====
const STORAGE_KEY = 'dashboard-theme';
const themeToggle = document.getElementById('themeToggle');

function setTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }
    localStorage.setItem(STORAGE_KEY, theme);
}

const savedTheme = localStorage.getItem(STORAGE_KEY) || 'dark';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const current = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    setTheme(current === 'dark' ? 'light' : 'dark');
});

// ===== Dashboard =====
const dashboardContainer = document.getElementById('dashboard');
const dashboard = new Dashboard(dashboardContainer);

// Add widget buttons
document.querySelectorAll('[data-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.add;
        dashboard.addWidget(type);
    });
});

// Initialize with default widgets
dashboard.addWidget('todo');
dashboard.addWidget('notes');
dashboard.addWidget('quote');
dashboard.addWidget('pokemon');
dashboard.addWidget('users');
