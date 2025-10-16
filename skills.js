// File: skills.js (Perbaikan Final untuk Data Lama & Baru)

document.addEventListener('DOMContentLoaded', () => {

    // --- Navigation Logic ---
    const menuBtn = document.getElementById('menu-btn');
    const sideNav = document.getElementById('side-nav');
    let isNavOpen = false;
    menuBtn.addEventListener('click', () => {
        if (isNavOpen) {
            sideNav.style.width = '0';
            document.body.style.marginLeft = '0';
        } else {
            sideNav.style.width = '200px';
            document.body.style.marginLeft = '200px';
        }
        isNavOpen = !isNavOpen;
    });
    
    // --- Elemen-elemen utama ---
    const addBtn = document.getElementById('add-skill-btn');
    const modal = document.getElementById('skill-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const form = document.getElementById('skill-form');
    
    // --- Elemen-elemen Tab ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    let activeTab = 'player';

    // --- Elemen-elemen Form Dinamis ---
    const skillTypeSelect = document.getElementById('skill-type');
    const dynamicOptionsContainer = document.getElementById('dynamic-options');
    const buffEffectType = document.getElementById('buff-effect-type');
    const debuffEffectType = document.getElementById('debuff-effect-type');

    // --- LOGIKA TAB ---
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            activeTab = button.dataset.tab;
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach(content => {
                content.classList.toggle('active', content.id.includes(activeTab));
            });
        });
    });

    // --- LOGIKA FORM DINAMIS ---
    function updateDynamicOptions() {
        dynamicOptionsContainer.querySelectorAll('.options-wrapper').forEach(w => w.classList.add('hidden'));
        const selectedType = skillTypeSelect.value;
        const targetOptions = document.getElementById(`${selectedType}-options`);
        if (targetOptions) {
            targetOptions.classList.remove('hidden');
        } else {
            return;
        }

        if (selectedType === 'buff') {
            const buffDetailsContainer = document.getElementById('buff-details');
            const effect = buffEffectType.value;
            let html = '';
            if (effect === 'stat_increase') {
                html = `<input type="number" id="buff-percent" placeholder="% Stat"><span>% of</span><select id="buff-stat"><option value="str">STR</option><option value="agi">AGI</option><option value="dex">DEX</option><option value="def">DEF</option><option value="con">CON</option><option value="int">INT</option></select>`;
            } else if (effect === 'hp_recovery') {
                html = `<input type="number" id="buff-percent" placeholder="% HP Pulih">`;
            }
            buffDetailsContainer.innerHTML = html;
        }
        if (selectedType === 'debuff') {
            const debuffDetailsContainer = document.getElementById('debuff-details');
            const effect = debuffEffectType.value;
            let html = '';
             if (effect === 'stat_reduction') {
                html = `<input type="number" id="debuff-percent" placeholder="% Stat"><span>% of</span><select id="debuff-stat"><option value="str">STR</option><option value="agi">AGI</option><option value="dex">DEX</option><option value="def">DEF</option><option value="con">CON</option><option value="int">INT</option></select>`;
            } else if (effect === 'dot') {
                html = `<input type="number" id="debuff-percent" placeholder="% HP/detik">`;
            }
            debuffDetailsContainer.innerHTML = html;
        }
    }

    skillTypeSelect.addEventListener('change', updateDynamicOptions);
    buffEffectType.addEventListener('change', updateDynamicOptions);
    debuffEffectType.addEventListener('change', updateDynamicOptions);

    // --- LOGIKA MODAL ---
    addBtn.addEventListener('click', () => { form.reset(); updateDynamicOptions(); modal.classList.remove('hidden'); });
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    window.addEventListener('click', (e) => { if (e.target == modal) modal.classList.add('hidden'); });

    // --- LOGIKA PENYIMPANAN DATA ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
            const skillType = skillTypeSelect.value;
            let effectData = {};

            switch (skillType) {
                case 'damage':
                    effectData = { base: parseInt(document.getElementById('damage-base').value) || 0, percent: parseInt(document.getElementById('damage-percent').value) || 0, stat: document.getElementById('damage-stat').value };
                    break;
                case 'buff':
                    const buffEffect = buffEffectType.value;
                    effectData = { target: form.querySelector('input[name="buff-target"]:checked').value, type: buffEffect };
                    if (buffEffect === 'stat_increase') {
                        effectData.percent = parseInt(document.getElementById('buff-percent').value) || 0;
                        effectData.stat = document.getElementById('buff-stat').value;
                    } else if (buffEffect === 'hp_recovery') {
                        effectData.percent = parseInt(document.getElementById('buff-percent').value) || 0;
                    }
                    break;
                case 'debuff':
                     const debuffEffect = debuffEffectType.value;
                     effectData = { type: debuffEffect };
                     if (debuffEffect === 'stat_reduction') {
                        effectData.percent = parseInt(document.getElementById('debuff-percent').value) || 0;
                        effectData.stat = document.getElementById('debuff-stat').value;
                    } else if (debuffEffect === 'dot') {
                        effectData.percent = parseInt(document.getElementById('debuff-percent').value) || 0;
                    }
                    break;
            }

            const newSkill = { id: Date.now(), for: activeTab, name: document.getElementById('skill-name').value, category: form.querySelector('input[name="category"]:checked').value, type: skillType, effect: effectData, desc: document.getElementById('skill-desc').value };
            saveSkill(newSkill);
            loadSkills();
            modal.classList.add('hidden');

        } catch (error) {
            alert(`Error Terdeteksi!\n\nNama Error: ${error.name}\n\nPesan: ${error.message}`);
        }
    });

    // --- Fungsi lainnya ---
    function saveSkill(skill) { const skills = JSON.parse(localStorage.getItem('skills')) || []; skills.push(skill); localStorage.setItem('skills', JSON.stringify(skills)); }
    function deleteSkill(skillId) { let skills = JSON.parse(localStorage.getItem('skills')) || []; skills = skills.filter(s => s.id !== skillId); localStorage.setItem('skills', JSON.stringify(skills)); loadSkills(); }
    
    // --- FUNGSI DENGAN PERBAIKAN FINAL ---
    function createSkillCard(skill) {
        const card = document.createElement('div');
        card.className = 'skill-card';
        card.dataset.type = skill.type;
        let effectHtml = '';

        // Helper function yang aman untuk stat
        const statToUpper = (stat) => stat ? stat.toUpperCase() : '';
        
        // PERBAIKAN KEDUA & FINAL: Menangani 'category' yang mungkin tidak ada di data lama
        const category = skill.category || 'unknown'; // Memberi nilai default jika tidak ada

        switch (skill.type) {
            case 'damage':
                effectHtml = `Damage: ${skill.effect.base || 0} + ${skill.effect.percent || 0}% ${statToUpper(skill.effect.stat)}`;
                break;
            case 'buff':
                effectHtml = `Target: ${skill.effect.target}. Efek: `;
                if(skill.effect.type === 'stat_increase') effectHtml += `+${skill.effect.percent || 0}% ${statToUpper(skill.effect.stat)}`;
                else if(skill.effect.type === 'hp_recovery') effectHtml += `Pulihkan ${skill.effect.percent || 0}% HP`;
                else if(skill.effect.type === 'debuff_removal') effectHtml += `Hilangkan Debuff`;
                break;
            case 'debuff':
                effectHtml = `Efek: `;
                if(skill.effect.type === 'stat_reduction') effectHtml += `-${skill.effect.percent || 0}% ${statToUpper(skill.effect.stat)}`;
                else if(skill.effect.type === 'dot') effectHtml += `-${skill.effect.percent || 0}% HP/detik`;
                break;
            default:
                effectHtml = `Efek tidak diketahui.`; // Menangani skill lama yang mungkin tidak punya 'type'
        }
        
        card.innerHTML = `<button class="delete-btn" data-id="${skill.id}">&times;</button><div class="skill-header"><h3>${skill.name}</h3><span class="skill-tag ${category}">${category.toUpperCase()}</span></div><div class="effect-display">${effectHtml}</div><p>${skill.desc}</p>`;
        card.querySelector('.delete-btn').addEventListener('click', (e) => { e.stopPropagation(); deleteSkill(parseInt(e.target.dataset.id)); });
        return card;
    }

    function loadSkills() {
        const skills = JSON.parse(localStorage.getItem('skills')) || [];
        const playerContainer = document.getElementById('player-skills-container');
        const monsterContainer = document.getElementById('monster-skills-container');
        playerContainer.innerHTML = ''; monsterContainer.innerHTML = '';
        skills.forEach(skill => {
            const card = createSkillCard(skill);
            if (skill.for === 'player') playerContainer.appendChild(card);
            else if (skill.for === 'monster') monsterContainer.appendChild(card);
            else playerContainer.appendChild(card); // Default untuk skill sangat lama
        });
    }

    // --- Initial Load ---
    updateDynamicOptions();
    loadSkills();
});