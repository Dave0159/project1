// File: skills.js (Firebase Version)
import { db } from './firebase-config.js';
import { collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // Navigasi, Elemen Modal, & Logika Tab (Sama seperti sebelumnya)
    // ...
    
    // --- LOGIKA FORM DINAMIS (Sama seperti sebelumnya) ---
    // ...

    // --- LOGIKA PENYIMPANAN DATA (DIUBAH) ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        // ... (Logika pengambilan data form sama seperti sebelumnya)

        const newSkill = { /* ... (objek skill sama seperti sebelumnya) ... */ };

        try {
            await addDoc(collection(db, "skills"), newSkill);
            console.log("Skill saved to Firebase");
            loadSkills();
            modal.classList.add('hidden');
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    });

    // --- FUNGSI CREATE, SAVE, DELETE, LOAD (DIRUBAH) ---
    async function deleteSkill(skillId) {
        try {
            await deleteDoc(doc(db, "skills", skillId));
            console.log("Skill deleted from Firebase");
            loadSkills();
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    }
    
    function createSkillCard(skill) { /* ... (sama seperti sebelumnya) ... */ }
    
    async function loadSkills() {
        const querySnapshot = await getDocs(collection(db, "skills"));
        const skills = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const playerContainer = document.getElementById('player-skills-container');
        const monsterContainer = document.getElementById('monster-skills-container');
        playerContainer.innerHTML = '';
        monsterContainer.innerHTML = '';

        skills.forEach(skill => {
            const card = createSkillCard(skill);
            if (skill.for === 'player') playerContainer.appendChild(card);
            else monsterContainer.appendChild(card);
        });
    }

    // --- Panggil Fungsi Muat Awal ---
    loadSkills();
    // ... (Sisa kode lengkap disertakan di bawah)
    const menuBtn = document.getElementById('menu-btn'); const sideNav = document.getElementById('side-nav'); menuBtn.addEventListener('click', () => { const isNavOpen = sideNav.style.width === '200px'; sideNav.style.width = isNavOpen ? '0' : '200px'; document.body.style.marginLeft = isNavOpen ? '0' : '200px'; }); const addBtn = document.getElementById('add-skill-btn'); const modal = document.getElementById('skill-modal'); const closeModalBtn = document.getElementById('close-modal-btn'); const form = document.getElementById('skill-form'); const tabButtons = document.querySelectorAll('.tab-btn'); const tabContents = document.querySelectorAll('.tab-content'); let activeTab = 'player'; const skillTypeSelect = document.getElementById('skill-type'); const dynamicOptionsContainer = document.getElementById('dynamic-options'); const buffEffectType = document.getElementById('buff-effect-type'); const debuffEffectType = document.getElementById('debuff-effect-type'); tabButtons.forEach(button => { button.addEventListener('click', () => { activeTab = button.dataset.tab; tabButtons.forEach(btn => btn.classList.remove('active')); button.classList.add('active'); tabContents.forEach(content => { content.classList.toggle('active', content.id.includes(activeTab)); }); }); }); function updateDynamicOptions() { dynamicOptionsContainer.querySelectorAll('.options-wrapper').forEach(w => w.classList.add('hidden')); const selectedType = skillTypeSelect.value; const targetOptions = document.getElementById(`${selectedType}-options`); if (targetOptions) { targetOptions.classList.remove('hidden'); } else { return; } if (selectedType === 'buff') { const buffDetailsContainer = document.getElementById('buff-details'); const effect = buffEffectType.value; let html = ''; if (effect === 'stat_increase') { html = `<input type="number" id="buff-percent" placeholder="% Stat"><span>% of</span><select id="buff-stat"><option value="str">STR</option><option value="agi">AGI</option><option value="dex">DEX</option><option value="def">DEF</option><option value="con">CON</option><option value="int">INT</option></select>`; } else if (effect === 'hp_recovery') { html = `<input type="number" id="buff-percent" placeholder="% HP Pulih">`; } buffDetailsContainer.innerHTML = html; } if (selectedType === 'debuff') { const debuffDetailsContainer = document.getElementById('debuff-details'); const effect = debuffEffectType.value; let html = ''; if (effect === 'stat_reduction') { html = `<input type="number" id="debuff-percent" placeholder="% Stat"><span>% of</span><select id="debuff-stat"><option value="str">STR</option><option value="agi">AGI</option><option value="dex">DEX</option><option value="def">DEF</option><option value="con">CON</option><option value="int">INT</option></select>`; } else if (effect === 'dot') { html = `<input type="number" id="debuff-percent" placeholder="% HP/detik">`; } debuffDetailsContainer.innerHTML = html; } } skillTypeSelect.addEventListener('change', updateDynamicOptions); buffEffectType.addEventListener('change', updateDynamicOptions); debuffEffectType.addEventListener('change', updateDynamicOptions); addBtn.addEventListener('click', () => { form.reset(); updateDynamicOptions(); modal.classList.remove('hidden'); }); closeModalBtn.addEventListener('click', () => modal.classList.add('hidden')); window.addEventListener('click', (e) => { if (e.target == modal) modal.classList.add('hidden'); }); form.addEventListener('submit', async (e) => { e.preventDefault(); const skillType = skillTypeSelect.value; let effectData = {}; switch (skillType) { case 'damage': effectData = { base: parseInt(document.getElementById('damage-base').value) || 0, percent: parseInt(document.getElementById('damage-percent').value) || 0, stat: document.getElementById('damage-stat').value }; break; case 'buff': const buffEffect = buffEffectType.value; effectData = { target: form.querySelector('input[name="buff-target"]:checked').value, type: buffEffect }; if (buffEffect === 'stat_increase') { effectData.percent = parseInt(document.getElementById('buff-percent').value) || 0; effectData.stat = document.getElementById('buff-stat').value; } else if (buffEffect === 'hp_recovery') { effectData.percent = parseInt(document.getElementById('buff-percent').value) || 0; } break; case 'debuff': const debuffEffect = debuffEffectType.value; effectData = { type: debuffEffect }; if (debuffEffect === 'stat_reduction') { effectData.percent = parseInt(document.getElementById('debuff-percent').value) || 0; effectData.stat = document.getElementById('debuff-stat').value; } else if (debuffEffect === 'dot') { effectData.percent = parseInt(document.getElementById('debuff-percent').value) || 0; } break; } const newSkill = { id: Date.now(), for: activeTab, name: document.getElementById('skill-name').value, category: form.querySelector('input[name="category"]:checked').value, type: skillType, effect: effectData, desc: document.getElementById('skill-desc').value }; try { await addDoc(collection(db, "skills"), newSkill); loadSkills(); modal.classList.add('hidden'); } catch (error) { console.error("Error adding document: ", error); } }); function createSkillCard(skill) { const card = document.createElement('div'); card.className = 'skill-card'; card.dataset.type = skill.type; const statToUpper = (stat) => stat ? stat.toUpperCase() : ''; const category = skill.category || 'unknown'; let effectHtml = ''; switch (skill.type) { case 'damage': effectHtml = `Damage: ${skill.effect.base || 0} + ${skill.effect.percent || 0}% ${statToUpper(skill.effect.stat)}`; break; case 'buff': effectHtml = `Target: ${skill.effect.target}. Efek: `; if (skill.effect.type === 'stat_increase') effectHtml += `+${skill.effect.percent || 0}% ${statToUpper(skill.effect.stat)}`; else if (skill.effect.type === 'hp_recovery') effectHtml += `Pulihkan ${skill.effect.percent || 0}% HP`; else if (skill.effect.type === 'debuff_removal') effectHtml += `Hilangkan Debuff`; break; case 'debuff': effectHtml = `Efek: `; if (skill.effect.type === 'stat_reduction') effectHtml += `-${skill.effect.percent || 0}% ${statToUpper(skill.effect.stat)}`; else if (skill.effect.type === 'dot') effectHtml += `-${skill.effect.percent || 0}% HP/detik`; break; default: effectHtml = `Efek tidak diketahui.`; } card.innerHTML = `<button class="delete-btn" data-id="${skill.id}">&times;</button><div class="skill-header"><h3>${skill.name}</h3><span class="skill-tag ${category}">${category.toUpperCase()}</span></div><div class="effect-display">${effectHtml}</div><p>${skill.desc}</p>`; card.querySelector('.delete-btn').addEventListener('click', (e) => { e.stopPropagation(); deleteSkill(skill.id); }); return card; } updateDynamicOptions();
});