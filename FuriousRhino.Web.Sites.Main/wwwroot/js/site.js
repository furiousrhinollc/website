// =============================================================
// Furious Rhino — site.js
// Loaded via <script> in index.html. Called from Blazor via
// IJSRuntime where interaction with the DOM is required.
// =============================================================

window.FuriousRhino = window.FuriousRhino || {};

// ---- THEME -------------------------------------------------------
FuriousRhino.Theme = {
    _key: 'fr-theme',

    init() {
        const saved = localStorage.getItem(this._key);
        // Respect saved preference; fall back to system preference
        if (saved) {
            this.apply(saved);
        } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            this.apply('light');
        } else {
            this.apply('dark');
        }

        // Listen for OS-level changes when no preference saved
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
            if (!localStorage.getItem(this._key)) {
                this.apply(e.matches ? 'light' : 'dark');
            }
        });
    },

    apply(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        this._updateToggleIcon(theme);
    },

    toggle() {
        const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        localStorage.setItem(this._key, next);
        this.apply(next);
        return next;
    },

    getCurrent() {
        return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    },

    _updateToggleIcon(theme) {
        const btn = document.querySelector('.theme-toggle');
        if (btn) btn.textContent = theme === 'light' ? '☾' : '☀︎';
    }
};

// ---- NAV ---------------------------------------------------------
FuriousRhino.Nav = {
    _menuOpen: false,

    init() {
        const nav = document.getElementById('fr-nav');
        if (!nav) return;

        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 10);
        }, { passive: true });
    },

    toggleMenu() {
        const links = document.getElementById('fr-nav-links');
        const btn = document.getElementById('fr-hamburger');
        if (!links || !btn) return;

        this._menuOpen = !this._menuOpen;
        links.classList.toggle('open', this._menuOpen);
        btn.classList.toggle('open', this._menuOpen);
        btn.setAttribute('aria-expanded', String(this._menuOpen));
    },

    closeMenu() {
        const links = document.getElementById('fr-nav-links');
        const btn = document.getElementById('fr-hamburger');
        if (!links || !btn) return;
        this._menuOpen = false;
        links.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
    }
};

// ---- SCROLL REVEAL -----------------------------------------------
FuriousRhino.Reveal = {
    _observer: null,

    init() {
        if (this._observer) this._observer.disconnect();

        this._observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    const siblings = Array.from(
                        entry.target.parentElement?.querySelectorAll('.reveal:not(.visible)') ?? []
                    );
                    const delay = siblings.indexOf(entry.target) * 80;
                    setTimeout(() => entry.target.classList.add('visible'), delay);
                    this._observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        // rAF ensures layout is complete before observing —
        // without this, elements already in the viewport on fresh navigation
        // can miss their initial intersection event.
        requestAnimationFrame(() => {
            document.querySelectorAll('.reveal').forEach(el => this._observer.observe(el));
        });
    },

    // Re-run after Blazor renders new content
    refresh() {
        document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
            this._observer?.observe(el);
        });
    }
};

// ---- SCROLL TO SECTION -------------------------------------------
FuriousRhino.scrollTo = function (selector) {
    const el = document.querySelector(selector);
    if (el) {
        const offset = 72; // nav height + a little breathing room
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }
};

// ---- ACTIVE NAV LINK TRACKING ------------------------------------
FuriousRhino.NavHighlight = {
    _observer: null,

    init() {
        if (this._observer) this._observer.disconnect();

        const sections = document.querySelectorAll('section[id], div[id]');
        if (!sections.length) return;

        this._observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
                if (link) link.classList.toggle('active', entry.isIntersecting);
            });
        }, { rootMargin: '-40% 0px -55% 0px' });

        sections.forEach(s => this._observer.observe(s));
    }
};

// ---- INIT (called once Blazor is ready) --------------------------
FuriousRhino.init = function () {
    FuriousRhino.Theme.init();
    FuriousRhino.Nav.init();
    FuriousRhino.Reveal.init();
    FuriousRhino.NavHighlight.init();
};

// Also run on plain DOM load for the index.html shell
document.addEventListener('DOMContentLoaded', () => {
    FuriousRhino.Theme.init();
});
