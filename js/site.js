// site.js — thème clair/sombre + sélecteur de langue (partagé entre toutes les pages)
(function () {

    // ── Constantes ────────────────────────────────────────────────
    const THEME_KEY = '7ds_theme';
    const LANG_KEY  = '7ds_lang';
    const LANGS = [
        { code:'fr',      flag:'🇫🇷', name:'Français' },
        { code:'en',      flag:'🇬🇧', name:'English' },
        { code:'de',      flag:'🇩🇪', name:'Deutsch' },
        { code:'es',      flag:'🇪🇸', name:'Español' },
        { code:'it',      flag:'🇮🇹', name:'Italiano' },
        { code:'pt',      flag:'🇧🇷', name:'Português' },
        { code:'ru',      flag:'🇷🇺', name:'Русский' },
        { code:'ja',      flag:'🇯🇵', name:'日本語' },
        { code:'ko',      flag:'🇰🇷', name:'한국어' },
        { code:'zh-hans', flag:'🇨🇳', name:'简体中文' },
        { code:'zh-hant', flag:'🇹🇼', name:'繁體中文' },
        { code:'id',      flag:'🇮🇩', name:'Indonesia' },
        { code:'th',      flag:'🇹🇭', name:'ภาษาไทย' },
    ];

    // ── Thème ─────────────────────────────────────────────────────
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.dataset.theme = savedTheme;

    function toggleTheme() {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        localStorage.setItem(THEME_KEY, next);
        updateThemeBtn();
    }

    function updateThemeBtn() {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        const isLight = document.documentElement.dataset.theme === 'light';
        btn.textContent = isLight ? '🌙' : '☀️';
        btn.title = isLight
            ? (window.LANG_PACK ? LANG_PACK.ui.theme_dark  : 'Mode nuit')
            : (window.LANG_PACK ? LANG_PACK.ui.theme_light : 'Mode jour');
    }

    // ── Langue ────────────────────────────────────────────────────
    let currentLang = localStorage.getItem(LANG_KEY) || 'fr';
    const loadedLangs = {};

    function loadLang(code, callback) {
        if (loadedLangs[code]) { window.LANG_PACK = loadedLangs[code]; callback(); return; }
        // fr est souvent déjà chargée via cooking_recipes — on charge quand même le pack UI
        const s = document.createElement('script');
        s.src = 'data/lang/' + code + '.js?' + Date.now();
        s.onload = () => {
            loadedLangs[code] = window.LANG_PACK;
            callback();
        };
        s.onerror = () => {
            // fallback sur fr
            if (code !== 'fr') { loadLang('fr', callback); }
        };
        document.head.appendChild(s);
    }

    function applyI18n() {
        const pack = window.LANG_PACK;
        if (!pack) return;
        // Appliquer les data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const keys = el.dataset.i18n.split('.');
            let val = pack;
            for (const k of keys) val = val && val[k];
            if (typeof val === 'string') {
                if (el.tagName === 'INPUT') el.placeholder = val;
                else el.textContent = val;
            }
        });
        // Mettre à jour le label de langue dans le sélecteur
        const sel = document.getElementById('lang-select');
        if (sel) sel.value = pack.code;
        updateThemeBtn();
        // Événement pour les pages qui re-rendent du contenu
        document.dispatchEvent(new CustomEvent('langchange', { detail: pack }));
        // Direction RTL si besoin (aucune des 13 langues n'est RTL ici)
        document.documentElement.lang = pack.code;
    }

    function switchLang(code) {
        currentLang = code;
        localStorage.setItem(LANG_KEY, code);
        loadLang(code, applyI18n);
    }

    // ── Injection des contrôles dans la nav ───────────────────────
    function injectControls() {
        return; // Temporarily disabled by user request
        const nav = document.querySelector('nav ul');
        if (!nav) return;

        // Bouton thème
        const themeItem = document.createElement('li');
        themeItem.style.cssText = 'margin-left:auto;display:flex;align-items:center;gap:0.5rem;';
        const themeBtn = document.createElement('button');
        themeBtn.id = 'theme-toggle';
        themeBtn.style.cssText = 'background:none;border:1px solid rgba(255,255,255,0.2);border-radius:6px;cursor:pointer;font-size:1.1rem;padding:0.2rem 0.5rem;color:inherit;transition:border-color 0.2s;';
        themeBtn.addEventListener('click', toggleTheme);
        themeItem.appendChild(themeBtn);

        // Sélecteur de langue
        const sel = document.createElement('select');
        sel.id = 'lang-select';
        sel.style.cssText = 'background:rgba(20,28,55,0.9);color:inherit;border:1px solid rgba(255,255,255,0.2);border-radius:6px;padding:0.2rem 0.4rem;font-size:0.82rem;cursor:pointer;';
        for (const l of LANGS) {
            const opt = document.createElement('option');
            opt.value = l.code;
            opt.textContent = l.flag + ' ' + l.name;
            if (l.code === currentLang) opt.selected = true;
            sel.appendChild(opt);
        }
        sel.addEventListener('change', () => switchLang(sel.value));
        themeItem.appendChild(sel);
        nav.appendChild(themeItem);

        updateThemeBtn();
    }

    // ── Init au chargement ────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        injectControls();
        if (currentLang !== 'fr') {
            switchLang(currentLang);
        } else {
            loadLang('fr', applyI18n);
        }
    }

    // Exposer pour debug
    window.site = { switchLang, toggleTheme, applyI18n };

})();
