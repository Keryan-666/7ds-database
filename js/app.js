// 7DS Database Application — powered by GameDB

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initFilters();
    initMonsterFilters();
    initModal();
    initMonsterModal();
    initLootModal();
    renderHome();
    renderPvp();

    // Activate section from URL param (e.g. index.html?section=monsters)
    const urlSection = new URLSearchParams(window.location.search).get('section');
    if (urlSection) {
        const link = document.querySelector('nav a[data-section="' + urlSection + '"]');
        if (link) link.click();
    }
});

// Navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const section = link.dataset.section;
            if (!section) return;
            e.preventDefault();

            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show section
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById(section).classList.add('active');

            // Render section content
            switch(section) {
                case 'home':
                    renderHome();
                    break;
                case 'characters':
                    renderCharacters();
                    break;
                case 'monsters':
                    renderMonsters();
                    break;
                case 'stats':
                    renderStats();
                    break;
                case 'costumes':
                    renderCostumes();
                    break;
                case 'pvp':
                    renderPvp();
                    break;
                case 'loot':
                    renderLoot();
                    break;
            }
        });
    });
}

// Home section
function renderHome() {
    const meta = GameDB.meta;
    document.getElementById('total-characters').textContent = meta.total_characters;
    document.getElementById('total-costumes').textContent = meta.total_costumes;
    document.getElementById('total-weapons').textContent = meta.weapon_types.length;
    document.getElementById('total-elements').textContent = meta.elements.length;
    document.getElementById('total-monsters').textContent = meta.total_monsters;

    const sinsList = document.getElementById('sins-list');
    sinsList.innerHTML = GameDB.getCharacters({ special: true })
        .map(char => createCharacterCard(char)).join('');
    attachCardListeners();
}

// Characters section
function renderCharacters(filter = {}) {
    const list = document.getElementById('characters-list');
    list.innerHTML = GameDB.getCharacters(filter).map(char => createCharacterCard(char)).join('');
    attachCardListeners();
}

// Create character card HTML
function createCharacterCard(char) {
    const maxAtk = 300;
    const maxDef = 300;
    const maxHp = 2500;

    const atkPercent = (char.stats.attack / maxAtk * 100).toFixed(0);
    const defPercent = (char.stats.defense / maxDef * 100).toFixed(0);
    const hpPercent = (char.stats.maxHp / maxHp * 100).toFixed(0);

    const weaponTags = char.weapons.map(w =>
        `<span class="weapon-tag ${w.element.toLowerCase()}">${w.type} (${w.element})</span>`
    ).join('');

    return `
        <div class="character-card" data-id="${char.id}">
            <div class="character-header">
                <div class="character-avatar">
                    ${char.portrait
                        ? `<img src="${char.portrait}" alt="${char.name}" onerror="this.parentElement.innerHTML='${char.name.charAt(0)}'">`
                        : char.name.charAt(0)
                    }
                </div>
                <div class="character-name">${char.name}</div>
            </div>
            <div class="character-stats">
                <div class="stat-bar">
                    <div class="stat-bar-label">
                        <span>ATK</span>
                        <span>${char.stats.attack}</span>
                    </div>
                    <div class="stat-bar-fill">
                        <span class="stat-atk" style="width: ${atkPercent}%"></span>
                    </div>
                </div>
                <div class="stat-bar">
                    <div class="stat-bar-label">
                        <span>DEF</span>
                        <span>${char.stats.defense}</span>
                    </div>
                    <div class="stat-bar-fill">
                        <span class="stat-def" style="width: ${defPercent}%"></span>
                    </div>
                </div>
                <div class="stat-bar">
                    <div class="stat-bar-label">
                        <span>HP</span>
                        <span>${char.stats.maxHp}</span>
                    </div>
                    <div class="stat-bar-fill">
                        <span class="stat-hp" style="width: ${hpPercent}%"></span>
                    </div>
                </div>
            </div>
            <div class="character-weapons">
                ${weaponTags}
            </div>
        </div>
    `;
}

// Stats section
function renderStats() {
    const all = GameDB.getCharacters();
    const top = (key) => [...all].sort((a, b) => b.stats[key] - a.stats[key]).slice(0, 5);
    document.getElementById('top-attack').innerHTML  = top('attack').map((c,i) => createRankingItem(i+1, c.name, c.stats.attack)).join('');
    document.getElementById('top-defense').innerHTML = top('defense').map((c,i) => createRankingItem(i+1, c.name, c.stats.defense)).join('');
    document.getElementById('top-hp').innerHTML      = top('maxHp').map((c,i) => createRankingItem(i+1, c.name, c.stats.maxHp)).join('');
    document.getElementById('top-crit').innerHTML    = top('criticalRate').map((c,i) => createRankingItem(i+1, c.name, c.stats.criticalRate)).join('');
}

function createRankingItem(rank, name, value) {
    return `
        <div class="ranking-item">
            <span class="rank">${rank}</span>
            <span class="ranking-name">${name}</span>
            <span class="ranking-value">${value}</span>
        </div>
    `;
}

// Monsters section
function renderMonsters(filter = {}) {
    const monsters = GameDB.getMonsters(filter);
    document.getElementById('monster-count-display').textContent = monsters.length;
    document.getElementById('monsters-list').innerHTML = monsters.map(createMonsterCard).join('');
    attachMonsterCardListeners();
}

// Create monster card HTML
function createMonsterCard(monster) {
    const gradeClass = monster.grade ? monster.grade.toLowerCase() : 'normal';
    const catchableClass = monster.catchable ? 'catchable' : '';

    const displayName = monster.name;
    const iconPath = monster.icon;

    // Format tribe name
    const tribeName = monster.tribe ? formatTribeName(monster.tribe) : 'Unknown';

    return `
        <div class="monster-card ${gradeClass} ${catchableClass}" data-id="${monster.id}">
            <div class="monster-header">
                <div class="monster-avatar">
                    ${iconPath
                        ? `<img src="${iconPath}" alt="${displayName}" onerror="this.parentElement.innerHTML='${monster.job ? monster.job.charAt(0).toUpperCase() : 'M'}'"/>`
                        : (monster.job ? monster.job.charAt(0).toUpperCase() : 'M')
                    }
                </div>
                <div class="monster-name">${displayName}</div>
                <div class="monster-id">ID: ${monster.id}</div>
            </div>
            <div class="monster-info">
                <p><span class="label">Actor ID</span><span>${monster.actor_id}</span></p>
                <p><span class="label">Tribu</span><span>${tribeName}</span></p>
                <p><span class="label">IA</span><span>${monster.ai || 'N/A'}</span></p>
                <p><span class="label">Detection</span><span>${monster.detect_distance}</span></p>
            </div>
            <div class="monster-tags">
                <span class="monster-tag grade-${gradeClass}">${monster.grade || 'Normal'}</span>
                ${monster.tribe ? `<span class="monster-tag tribe">${tribeName}</span>` : ''}
                ${monster.monster_group ? `<span class="monster-tag group">${monster.monster_group}</span>` : ''}
            </div>
        </div>
    `;
}

function formatTribeName(tribe) {
    if (!tribe || tribe.startsWith('-')) return 'Unknown';
    return tribe.charAt(0).toUpperCase() + tribe.slice(1);
}

// Monster filters
function initMonsterFilters() {
    const meta = GameDB.meta;

    const tribeSelect = document.getElementById('filter-tribe');
    if (tribeSelect) {
        meta.tribes.forEach(tribe => {
            tribeSelect.innerHTML += `<option value="${tribe}">${formatTribeName(tribe)}</option>`;
        });
    }

    const gradeSelect = document.getElementById('filter-grade');
    if (gradeSelect) {
        meta.grades.forEach(grade => {
            gradeSelect.innerHTML += `<option value="${grade}">${grade}</option>`;
        });
    }

    const groupSelect = document.getElementById('filter-group');
    if (groupSelect) {
        meta.groups.forEach(group => {
            groupSelect.innerHTML += `<option value="${group}">${formatTribeName(group)}</option>`;
        });
    }

    // Add event listeners
    document.getElementById('search-monster')?.addEventListener('input', applyMonsterFilters);
    document.getElementById('filter-tribe')?.addEventListener('change', applyMonsterFilters);
    document.getElementById('filter-grade')?.addEventListener('change', applyMonsterFilters);
    document.getElementById('filter-group')?.addEventListener('change', applyMonsterFilters);
    document.getElementById('filter-catchable')?.addEventListener('change', applyMonsterFilters);
}

function applyMonsterFilters() {
    const filter = {
        search: document.getElementById('search-monster')?.value || '',
        tribe: document.getElementById('filter-tribe')?.value || '',
        grade: document.getElementById('filter-grade')?.value || '',
        group: document.getElementById('filter-group')?.value || '',
        catchable: document.getElementById('filter-catchable')?.checked || false
    };
    renderMonsters(filter);
}

// Monster modal
function initMonsterModal() {
    const modal = document.getElementById('monster-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.close-btn');

    closeBtn?.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

const BUFF_NAMES = {
    '304100001': 'Immunité aux contrôles',
    '304100002': 'Super armure',
    '304100004': 'Immunité aux effets de statut',
    '304100005': 'Buff de tutoriel',
    '304100006': 'Immunité aux contrôles',
    '304101000': 'Immunité totale aux CC',
    '304101001': 'Immunité aux étourdissements',
    '304101002': 'Immunité à la paralysie (Foudre)',
    '304101003': 'Immunité au gel (Glace)',
    '304101004': 'Immunité à la pétrification (Terre)',
    '309000313': "Immunité à l'évanouissement",
    '307800106': 'Immunité aux débuffs',
    '307800010': 'Augmentation ATK',
    '305001001': 'Insensible aux coups',
    '305001003': 'Immunité bête scorpion',
    '305020001': 'Invincible',
    '308000203': 'Invincible',
    '308000204': 'Invincible',
    '308000205': 'Invincible',
    '308000270': 'Invincible',
    '308000304': "Phase d'apparition",
    '308000314': 'Furtivité',
    '309001504': 'Insensible aux coups',
    '309001508': 'Immunité fleur veneneuse',
    '309001517': 'Immunité bête scorpion',
    '309001518': 'Immunité aux contrôles',
    '309001524': 'Dissimulé',
    '309999023': 'Immunité aux contrôles',
    '304080010': 'Buff de spawn',
    '304080011': 'Buff de spawn',
    '304080139': 'Buff de spawn',
    '304080149': 'Buff de spawn',
    '304090010': 'Buff de spawn',
    '305002000': 'Buff de phase',
    '305002001': 'Buff de phase',
    '305002002': 'Buff de phase',
    '305002003': 'Buff de phase',
    '305002004': 'Buff de phase',
    '305002008': 'Buff de phase',
    '305013001': 'Buff de combat',
    '305019002': 'Buff de combat',
    '306000009': 'Buff de combat',
    '306000022': 'Buff de combat',
    '306000024': 'Buff de combat',
    '306000025': 'Buff de combat',
    '309001521': 'Buff système',
};

function showMonsterModal(monsterId) {
    const monster = GameDB.getMonster(monsterId);
    if (!monster) return;

    const modal = document.getElementById('monster-modal');
    const body = document.getElementById('monster-modal-body');

    const displayName = monster.name;

    const gradeColor = monster.grade === 'Boss' ? '#ff6b6b' : monster.grade === 'Elite' ? '#ffd700' : '#aaa';

    body.innerHTML = `
        <div class="modal-header" style="background: linear-gradient(135deg, #2d1f3d, #4a2545); min-height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; position: relative;">
            ${monster.icon ? `
            <div class="modal-header-portrait" style="opacity: 0.5;">
                <img src="${monster.icon}" alt="${displayName}" style="height: 100%; max-width: 200px; object-fit: contain; image-rendering: pixelated;">
            </div>` : ''}
            <h2 style="position:relative; z-index:1; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">${displayName}</h2>
            <p style="position:relative; z-index:1; color:${gradeColor};">${monster.grade || 'Normal'} · ${formatTribeName(monster.tribe) || '—'}</p>
            <a href="map.html?monster=${monster.id}" style="position:relative;z-index:1;margin-top:0.4rem;padding:0.25rem 0.8rem;background:rgba(160,96,255,0.25);border:1px solid rgba(160,96,255,0.6);border-radius:5px;color:#c090ff;font-size:0.8rem;text-decoration:none;">🗺 Voir sur la carte</a>
        </div>
        <div class="modal-body">
            <div class="modal-section">
                <h3>Informations</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${monster.type || '—'}</div>
                        <div class="stat-name">Type</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${formatTribeName(monster.tribe) || '—'}</div>
                        <div class="stat-name">Tribu</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" style="color:${gradeColor};">${monster.grade || 'Normal'}</div>
                        <div class="stat-name">Grade</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" style="color:${monster.catchable ? '#4CAF50' : '#888'};">${monster.catchable ? 'Oui' : 'Non'}</div>
                        <div class="stat-name">Capturable</div>
                    </div>
                </div>
            </div>

            <details class="modal-section modal-collapsible">
                <summary><h3>Combat</h3></summary>
                <div class="stats-grid" style="margin-top:0.5rem;">
                    <div class="stat-item">
                        <div class="stat-value stat-value-small">${monster.ai || 'N/A'}</div>
                        <div class="stat-name">IA</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value stat-value-small">${monster.skill_key || 'N/A'}</div>
                        <div class="stat-name">Skill Key</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${monster.detect_distance}</div>
                        <div class="stat-name">Détection</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${monster.trace_distance}</div>
                        <div class="stat-name">Poursuite</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${monster.faction || 'N/A'}</div>
                        <div class="stat-name">Faction</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${monster.team || 'N/A'}</div>
                        <div class="stat-name">Team</div>
                    </div>
                </div>
            </details>

            <details class="modal-section modal-collapsible">
                <summary><h3>Hitbox</h3></summary>
                <div class="stats-grid" style="margin-top:0.5rem;">
                    <div class="stat-item">
                        <div class="stat-value">${monster.hitbox.type || 'N/A'}</div>
                        <div class="stat-name">Type</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${monster.hitbox.width}</div>
                        <div class="stat-name">Largeur</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${monster.hitbox.height}</div>
                        <div class="stat-name">Hauteur</div>
                    </div>
                </div>
            </details>

            ${monster.drops && monster.drops.length > 0 ? (() => {
                const maxLvl = Math.max(...monster.drops.map(d => d.levels ? d.levels.length : 1));
                const qtyStr = (d, i) => {
                    if (!d.levels || i >= d.levels.length) return '<span class="drop-lvl-empty">—</span>';
                    const lv = d.levels[i];
                    const q = lv.min === lv.max ? lv.min : lv.min + '–' + lv.max;
                    return '<span class="drop-lvl">' + q + '</span>';
                };
                const hdrs = Array.from({length: maxLvl}, (_, i) =>
                    '<span class="drop-hdr-lvl">N' + (i+1) + '</span>').join('');
                const rows = monster.drops.map(d => {
                    const icon = d.type === 'Gold'
                        ? '<img src="data/pvp_icons/100000101.png" class="drop-item-icon" alt="Gold">'
                        : (d.icon ? '<img src="' + d.icon + '" class="drop-item-icon" alt="">' : '');
                    return '<div class="drop-row">' +
                    '<span class="drop-name">' + icon + d.name + '</span>' +
                    '<span class="drop-rate">' + d.rate_pct + '%</span>' +
                    Array.from({length: maxLvl}, (_, i) => qtyStr(d, i)).join('') +
                    '</div>';
                }).join('');
                return '<div class="modal-section"><h3>Butin (' + monster.drops.length + ' items)</h3>' +
                    '<div class="drop-table">' +
                    '<div class="drop-header"><span class="drop-name"></span><span class="drop-rate">Taux</span>' + hdrs + '</div>' +
                    rows + '</div></div>';
            })() : ''}

            ${monster.catchable ? `
            <div class="modal-section">
                <h3>Capture</h3>
                ${monster.catch_drops && monster.catch_drops.length > 0 ? (() => {
                    const drops = monster.catch_drops;
                    const maxLvl = Math.max(...drops.map(d => d.levels ? d.levels.length : 1));
                    const qtyStr = (d, i) => {
                        if (!d.levels || i >= d.levels.length) return '<span class="drop-lvl-empty">—</span>';
                        const lv = d.levels[i];
                        return '<span class="drop-lvl">' + (lv.min === lv.max ? lv.min : lv.min + '–' + lv.max) + '</span>';
                    };
                    const hdrs = Array.from({length: maxLvl}, (_, i) => '<span class="drop-hdr-lvl">N' + (i+1) + '</span>').join('');
                    const rows = drops.map(d => {
                        const icon = d.type === 'Gold'
                            ? '<img src="data/pvp_icons/100000101.png" class="drop-item-icon" alt="Gold">'
                            : (d.icon ? '<img src="' + d.icon + '" class="drop-item-icon" alt="">' : '');
                        return '<div class="drop-row"><span class="drop-name">' + icon +
                        d.name + '</span><span class="drop-rate">' + d.rate_pct + '%</span>' +
                        Array.from({length: maxLvl}, (_, i) => qtyStr(d, i)).join('') + '</div>';
                    }).join('');
                    return '<div class="drop-table"><div class="drop-header"><span class="drop-name"></span><span class="drop-rate">Taux</span>' + hdrs + '</div>' + rows + '</div>';
                })() : ''}
            </div>
            ` : ''}

            ${monster.spawning_buffs && monster.spawning_buffs.length > 0 ? `
            <div class="modal-section">
                <h3>Buffs au spawn</h3>
                <div class="character-weapons" style="justify-content: flex-start; padding: 0;">
                    ${monster.spawning_buffs.map(buff => `
                        <span class="weapon-tag" style="border-color: #9370db; color: #bb99ff;">
                            ${BUFF_NAMES[buff] || 'Buff #' + buff}
                        </span>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    `;

    modal.classList.add('active');
}

function attachMonsterCardListeners() {
    document.querySelectorAll('.monster-card').forEach(card => {
        card.addEventListener('click', () => {
            showMonsterModal(card.dataset.id);
        });
    });
}

// Costumes section
function renderCostumes(charFilter = '') {
    const costumes = GameDB.getCostumes(charFilter || null);
    document.getElementById('costumes-list').innerHTML = costumes.map(costume => `
        <div class="costume-card">
            <div class="costume-icon">
                ${costume.icon
                    ? `<img src="${costume.icon}" alt="${costume.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                       <span class="costume-fallback" style="display:none">${costume.char_name.charAt(0)}</span>`
                    : costume.char_name.charAt(0)
                }
            </div>
            <div class="costume-name">${costume.name}</div>
            <div class="costume-char">${costume.char_name}</div>
            <div class="costume-id" style="font-size: 0.75rem; color: #666; margin-top: 0.5rem;">ID: ${costume.id}</div>
        </div>
    `).join('');
}

// Filters
function initFilters() {
    const meta = GameDB.meta;

    const elementSelect = document.getElementById('filter-element');
    meta.elements.forEach(el => {
        elementSelect.innerHTML += `<option value="${el}">${el}</option>`;
    });

    const roleSelect = document.getElementById('filter-role');
    meta.roles.forEach(role => {
        roleSelect.innerHTML += `<option value="${role}">${role}</option>`;
    });

    const costumeCharSelect = document.getElementById('filter-costume-char');
    GameDB.getCharacters().forEach(char => {
        costumeCharSelect.innerHTML += `<option value="${char.id}">${char.name}</option>`;
    });

    // Search filter
    document.getElementById('search-char').addEventListener('input', (e) => {
        applyFilters();
    });

    // Gender filter
    document.getElementById('filter-gender').addEventListener('change', () => {
        applyFilters();
    });

    // Element filter
    document.getElementById('filter-element').addEventListener('change', () => {
        applyFilters();
    });

    // Role filter
    document.getElementById('filter-role').addEventListener('change', () => {
        applyFilters();
    });

    // Costume character filter
    document.getElementById('filter-costume-char').addEventListener('change', (e) => {
        renderCostumes(e.target.value);
    });
}

function applyFilters() {
    const filter = {
        search: document.getElementById('search-char').value,
        gender: document.getElementById('filter-gender').value,
        element: document.getElementById('filter-element').value,
        role: document.getElementById('filter-role').value
    };
    renderCharacters(filter);
}

// Modal
function initModal() {
    const modal = document.getElementById('character-modal');
    const closeBtn = modal.querySelector('.close-btn');

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

const CHAR_ID_TO_KEY = {
    '1001':'tristan','1002':'tioreh','1003':'dreydrin','1004':'howzer',
    '1005':'meliodas','1006':'gilthunder','1009':'elaine','1010':'king',
    '1011':'dreyfus','1012':'hendrickson','1013':'slader','1014':'griamore',
    '1015':'bug','1016':'jericho','1018':'guila','1019':'diane',
    '1025':'manny','1026':'drake','1027':'klotho','1028':'daisy',
};

function buildPassifsSection(charId) {
    if (typeof ENGRAVINGS === 'undefined') return '';
    const key = CHAR_ID_TO_KEY[String(charId)];
    if (!key) return '';
    const passifs = ENGRAVINGS.filter(e => e.cat === 'char' && e.char === key);
    if (passifs.length === 0) return '';

    const cards = passifs.map(eng => {
        const icon = eng.icon
            ? `<img src="${eng.icon}" alt="" style="width:36px;height:36px;border-radius:8px;object-fit:contain;background:#0f0f23;flex-shrink:0">`
            : `<div style="width:36px;height:36px;border-radius:8px;background:#0f0f23;flex-shrink:0;display:flex;align-items:center;justify-content:center">🛡️</div>`;
        const maxDesc = eng.levels.find(l => l.lv === eng.maxLv);
        const cos = (typeof COSTUME_MAP !== 'undefined') ? COSTUME_MAP[eng.id] : null;
        const cosBadge = cos
            ? `<div style="display:flex;align-items:center;gap:.3rem;padding:.2rem .4rem;background:rgba(255,215,0,0.07);border:1px solid rgba(255,215,0,0.15);border-radius:6px;flex-shrink:0">
                ${cos.icon ? `<img src="${cos.icon}" style="width:24px;height:24px;border-radius:4px;object-fit:cover">` : ''}
                <span style="font-size:.65rem;color:#ffd700;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${cos.name}</span>
              </div>`
            : '';
        return `<div style="display:flex;gap:.6rem;align-items:flex-start;padding:.5rem;background:#0f0f23;border-radius:8px;border:1px solid rgba(255,255,255,0.06)">
            ${icon}
            <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;margin-bottom:.15rem">
                    <span style="font-size:.82rem;font-weight:600;color:#eaeaea">${eng.name}</span>
                    <span style="font-size:.65rem;color:#a0a0a0">Max Lv${eng.maxLv}</span>
                    ${cosBadge}
                </div>
                ${maxDesc ? `<div style="font-size:.75rem;color:#ccc;line-height:1.4;white-space:pre-line">${maxDesc.desc}</div>` : ''}
            </div>
        </div>`;
    }).join('');

    return `<div class="modal-section">
        <h3>Passifs d'armure (${passifs.length})</h3>
        <div style="display:flex;flex-direction:column;gap:.5rem">${cards}</div>
    </div>`;
}

function showCharacterModal(charId) {
    const char = GameDB.getCharacter(charId);
    if (!char) return;
    const charCostumes = GameDB.getCostumes(charId);

    const modal = document.getElementById('character-modal');
    const body = document.getElementById('modal-body');

    body.innerHTML = `
        <div class="modal-header" style="${char.portrait ? `background-image: linear-gradient(to bottom, rgba(20,20,40,0.6), rgba(20,20,40,0.95)), url('${char.portrait}'); background-size: cover; background-position: top center;` : ''}">
            <div class="modal-header-portrait">
                ${char.portrait ? `<img src="${char.portrait}" alt="${char.name}">` : ''}
            </div>
            <h2>${char.name}</h2>
            <p>${char.description || ''}</p>
        </div>
        <div class="modal-body">

            <div class="modal-section">
                <h3>Statistiques</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${char.stats.attack}</div>
                        <div class="stat-name">Attaque</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${char.stats.defense}</div>
                        <div class="stat-name">Defense</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${char.stats.maxHp}</div>
                        <div class="stat-name">HP Max</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${char.stats.accuracy}</div>
                        <div class="stat-name">Precision</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${char.stats.block}</div>
                        <div class="stat-name">Blocage</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${char.stats.criticalRate}</div>
                        <div class="stat-name">Taux Critique</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${char.stats.criticalDamage}</div>
                        <div class="stat-name">Degats Critique</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${char.stats.moveSpeed}</div>
                        <div class="stat-name">Vitesse</div>
                    </div>
                </div>
            </div>

            <div class="modal-section">
                <h3>Armes</h3>
                <div class="character-weapons" style="justify-content: flex-start; padding: 0;">
                    ${char.weapons.map(w => `
                        <span class="weapon-tag ${w.element.toLowerCase()}">
                            ${w.type} - ${w.element} (${w.role})
                        </span>
                    `).join('')}
                </div>
            </div>

            ${buildPassifsSection(char.id)}

            <div class="modal-section">
                <h3>Costumes (${charCostumes.length})</h3>
                <div class="costume-grid" style="grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));">
                    ${charCostumes.map(c => `
                        <div class="costume-card" style="padding: 0.75rem;">
                            <div class="costume-icon" style="width: 80px; height: 80px; border-radius: 8px; overflow: hidden; background: #1a1a2e;">
                                ${c.icon
                                    ? `<img src="${c.icon}" alt="${c.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'">`
                                    : char.name.charAt(0)
                                }
                            </div>
                            <div class="costume-name" style="font-size: 0.85rem; margin-top: 0.4rem;">${c.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function attachCardListeners() {
    document.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', () => {
            showCharacterModal(card.dataset.id);
        });
    });
}

// ── PVP ───────────────────────────────────────────────────────────────────────
function renderPvp() {
    const container = document.getElementById('pvp-tiers');
    if (!container) return;

    const ranks = GameDB.getPvpRanks();

    // Group by tier
    const tiers = {};
    ranks.forEach(r => {
        if (!tiers[r.tier]) tiers[r.tier] = [];
        tiers[r.tier].push(r);
    });

    const TIER_ORDER = ['Gold', 'Platinum', 'Master', 'Champion', 'Challenger'];
    const TIER_FR    = {'Gold': 'Or', 'Platinum': 'Platine', 'Master': 'Maître', 'Champion': 'Champion', 'Challenger': 'Challenger'};

    const REWARD_IMG = {
        'Or':                              'data/pvp_icons/100000101.png',
        'Gemmes':                          'data/pvp_icons/100000103.png',
        'Ticket de convocation':           'data/pvp_icons/100000105.png',
        'Pierre de renforcement':          'data/pvp_icons/101060101.png',
        'Pierre de renforcement supérieure':'data/pvp_icons/101060102.png',
        'Pierre de renforcement suprême':  'data/pvp_icons/101060103.png',
        'Pierre de renforcement spéciale': 'data/pvp_icons/101060104.png',
        'Pierre de raffinement':           'data/pvp_icons/101060201.png',
        'Pierre de raffinement supérieure':'data/pvp_icons/101060202.png',
        'Pierre de raffinement suprême':   'data/pvp_icons/101060203.png',
        'Pierre de raffinement spéciale':  'data/pvp_icons/101060204.png',
        "Pierre d'élévation":              'data/pvp_icons/101061201.png',
        "Pierre d'élévation peu commune":  'data/pvp_icons/101061202.png',
        "Pierre d'élévation supérieure":   'data/pvp_icons/101061203.png',
        "Pierre d'élévation suprême":      'data/pvp_icons/101061204.png',
    };

    const RANK_IMG = {
        'gold5':'data/pvp_icons/gold5.png','gold4':'data/pvp_icons/gold4.png',
        'gold3':'data/pvp_icons/gold3.png','gold2':'data/pvp_icons/gold2.png',
        'gold1':'data/pvp_icons/gold1.png',
        'platinum5':'data/pvp_icons/platinum5.png','platinum4':'data/pvp_icons/platinum4.png',
        'platinum3':'data/pvp_icons/platinum3.png','platinum2':'data/pvp_icons/platinum2.png',
        'platinum1':'data/pvp_icons/platinum1.png',
        'master5':'data/pvp_icons/master5.png','master4':'data/pvp_icons/master4.png',
        'master3':'data/pvp_icons/master3.png','master2':'data/pvp_icons/master2.png',
        'master1':'data/pvp_icons/master1.png',
        'champion5':'data/pvp_icons/champion5.png','champion4':'data/pvp_icons/champion4.png',
        'champion3':'data/pvp_icons/champion3.png','champion2':'data/pvp_icons/champion2.png',
        'champion1':'data/pvp_icons/champion1.png',
        'challenger':'data/pvp_icons/challenger.png',
    };

    function fmtQty(qty) {
        if (qty >= 1000000) return (qty / 1000000).toFixed(1).replace('.0','') + 'M';
        if (qty >= 1000)    return (qty / 1000).toFixed(0) + 'k';
        return String(qty);
    }

    function rewardBadge(r) {
        const imgSrc = REWARD_IMG[r.name];
        const iconHtml = imgSrc
            ? '<img src="' + imgSrc + '" class="pvp-reward-img" alt="' + r.name + '">'
            : '<span class="pvp-reward-fallback">' + r.name.charAt(0) + '</span>';
        return '<span class="pvp-reward-badge pvp-reward-' + r.type.toLowerCase().replace('_','-') + '">' +
               iconHtml + '<span class="pvp-reward-qty">×' + fmtQty(r.qty) + '</span></span>';
    }

    let html = '';
    TIER_ORDER.forEach(tier => {
        if (!tiers[tier]) return;
        const tierRanks = tiers[tier];
        const color = tierRanks[0].color;
        const tierName = TIER_FR[tier] || tier;

        html += '<div class="pvp-tier-block">';
        html += '<div class="pvp-tier-header" style="--tier-color:' + color + '">';
        html += '<span class="pvp-tier-title">' + tierName + '</span>';
        html += '</div>';
        html += '<div class="pvp-rank-list">';

        tierRanks.forEach(rank => {
            const hasRewards = rank.rewards && rank.rewards.length > 0;
            html += '<div class="pvp-rank-row">';
            const rankImg = RANK_IMG[rank.key];
            html += '<div class="pvp-rank-info">';
            html += '<span class="pvp-rank-badge">';
            if (rankImg) html += '<img src="' + rankImg + '" class="pvp-rank-img" alt="' + rank.name + '">';
            html += '<span class="pvp-rank-name" style="color:' + rank.color + '">' + rank.name + '</span>';
            html += '</span>';
            html += '<span class="pvp-rank-points">' + rank.points.toLocaleString('fr-FR') + ' pts</span>';
            html += '</div>';
            html += '<div class="pvp-rewards">';
            if (hasRewards) {
                rank.rewards.forEach(r => { html += rewardBadge(r); });
            } else {
                html += '<span class="pvp-no-reward">—</span>';
            }
            html += '</div>';
            html += '</div>';
        });

        html += '</div></div>';
    });

    container.innerHTML = html;
}

// ─── Loot Section ────────────────────────────────────────────────────────────

let _lootIndex = null; // {item_tid -> {tid, name, icon, grade, type, sources:[{monster,rate_pct}]}}

function buildLootIndex() {
    if (_lootIndex) return _lootIndex;
    const monsters = GameDB.getMonsters();
    const index = {};
    monsters.forEach(mon => {
        const allDrops = [...(mon.drops || []), ...(mon.catch_drops || [])];
        allDrops.forEach(drop => {
            const tid = drop.item_tid;
            if (!tid) return;
            if (!index[tid]) {
                index[tid] = {
                    tid,
                    name: drop.name,
                    icon: drop.icon || null,
                    grade: drop.grade || '',
                    type: drop.type || 'Item',
                    sources: []
                };
            }
            index[tid].sources.push({
                monster_id: mon.id,
                monster_name: mon.name,
                monster_icon: mon.icon || null,
                monster_tribe: mon.tribe,
                monster_grade: mon.grade,
                rate_pct: drop.rate_pct
            });
        });
    });
    // Sort sources by rate desc for each item
    Object.values(index).forEach(item => {
        item.sources.sort((a, b) => b.rate_pct - a.rate_pct);
    });
    _lootIndex = index;
    return index;
}

function renderLoot() {
    const index = buildLootIndex();
    const items = Object.values(index);

    // Populate type filter
    const typeSelect = document.getElementById('filter-loot-type');
    if (typeSelect.options.length <= 1) {
        const types = [...new Set(items.map(i => i.type).filter(Boolean))].sort();
        types.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            typeSelect.appendChild(opt);
        });
    }

    applyLootFilters();

    document.getElementById('search-loot').oninput = applyLootFilters;
    document.getElementById('filter-loot-grade').onchange = applyLootFilters;
    document.getElementById('filter-loot-type').onchange = applyLootFilters;
}

function applyLootFilters() {
    const index = buildLootIndex();
    const search = (document.getElementById('search-loot').value || '').toLowerCase();
    const grade = document.getElementById('filter-loot-grade').value;
    const type = document.getElementById('filter-loot-type').value;

    const items = Object.values(index).filter(item => {
        if (search && !item.name.toLowerCase().includes(search)) return false;
        if (grade && item.grade !== grade) return false;
        if (type && item.type !== type) return false;
        return true;
    });

    // Sort: grade desc then name
    const gradeOrder = {'grade4':4,'grade3':3,'grade2':2,'grade1':1,'':0};
    items.sort((a, b) => (gradeOrder[b.grade]||0) - (gradeOrder[a.grade]||0) || a.name.localeCompare(b.name));

    document.getElementById('loot-count-display').textContent = items.length;

    const grid = document.getElementById('loot-list');
    grid.innerHTML = items.map(item => `
        <div class="loot-card loot-${item.grade}" onclick="showItemSources('${item.tid}')">
            ${item.icon
                ? `<img src="${item.icon}" alt="${item.name}" class="loot-icon">`
                : `<div class="loot-icon loot-icon-placeholder"></div>`}
            <div class="loot-name">${item.name}</div>
            <div class="loot-sources-count">${item.sources.length} source${item.sources.length > 1 ? 's' : ''}</div>
        </div>
    `).join('');
}

function showItemSources(tid) {
    const index = buildLootIndex();
    const item = index[tid];
    if (!item) return;

    const modal = document.getElementById('loot-modal');
    const body = document.getElementById('loot-modal-body');

    const gradeColors = {'grade4':'#b87fff','grade3':'#4fc3f7','grade2':'#81c784','grade1':'#aaa'};
    const itemColor = gradeColors[item.grade] || '#eaeaea';

    body.innerHTML = `
        <div class="modal-header" style="background: linear-gradient(135deg, #1a2a1a, #2a3a2a); min-height:140px; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; position:relative; gap:0.5rem; padding-bottom:1.5rem;">
            ${item.icon ? `<img src="${item.icon}" alt="${item.name}" style="height:80px; object-fit:contain; image-rendering:pixelated; position:relative; z-index:1;">` : ''}
            <h2 style="position:relative; z-index:1; color:${itemColor};">${item.name}</h2>
            <p style="position:relative; z-index:1; color:#888;">${item.type} · ${item.grade || 'N/A'}</p>
        </div>
        <div class="modal-body">
            <div class="modal-section">
                <h3>Sources (${item.sources.length})</h3>
                <p style="color:#888; font-size:0.85rem; margin-bottom:1rem;">Trié par taux de drop décroissant</p>
                <div class="loot-sources-list">
                    ${item.sources.map((src, i) => `
                        <div class="loot-source-row" onclick="showMonsterModal('${src.monster_id}')">
                            <span class="loot-source-rank">#${i+1}</span>
                            ${src.monster_icon
                                ? `<img src="${src.monster_icon}" alt="${src.monster_name}" class="loot-source-icon">`
                                : `<div class="loot-source-icon loot-icon-placeholder"></div>`}
                            <div class="loot-source-info">
                                <div class="loot-source-name">${src.monster_name}</div>
                                <div class="loot-source-meta">${formatTribeName(src.monster_tribe) || '—'} · ${src.monster_grade || 'Normal'}</div>
                            </div>
                            <div class="loot-source-rate">${src.rate_pct}%</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function initLootModal() {
    const modal = document.getElementById('loot-modal');
    if (!modal) return;
    modal.querySelector('.close-btn').addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
}

