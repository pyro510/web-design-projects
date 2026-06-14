// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const STORAGE_KEY = 'portfolio-theme';

function setTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }
    localStorage.setItem(STORAGE_KEY, theme);
}

// Load saved theme
const savedTheme = localStorage.getItem(STORAGE_KEY) || 'dark';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// ===== Mobile Nav Toggle =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('nav__menu--open');
});

// Close menu when clicking a link
navMenu.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('nav__menu--open');
    });
});

// ===== Skills Filter =====
const filterBtns = document.querySelectorAll('.filter-btn');
const skillCards = document.querySelectorAll('.skill-card');

filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach((b) => b.classList.remove('filter-btn--active'));
        btn.classList.add('filter-btn--active');

        const filter = btn.dataset.filter;

        skillCards.forEach((card) => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.classList.remove('skill-card--hidden');
            } else {
                card.classList.add('skill-card--hidden');
            }
        });
    });
});

// ===== Scroll Animations (Intersection Observer) =====
const fadeElements = document.querySelectorAll('.fade-in');

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15,
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in--visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

fadeElements.forEach((el) => observer.observe(el));
