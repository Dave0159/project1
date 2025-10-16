document.addEventListener('DOMContentLoaded', () => {
    // Navigasi
    const menuBtn = document.getElementById('menu-btn');
    const sideNav = document.getElementById('side-nav');
    menuBtn.addEventListener('click', () => {
        const isNavOpen = sideNav.style.width === '200px';
        sideNav.style.width = isNavOpen ? '0' : '200px';
        document.body.style.marginLeft = isNavOpen ? '0' : '200px';
    });

    // Elemen Global
    const monsterContainer = document.getElementById('monster-container');
    const allSkills = JSON.parse(localStorage.getItem('skills')) || [];
    let currentEditingMonsterId = null;
    let newImageBase64 = null; // Variabel sementara untuk gambar baru

    // --- Modal 1: Pembuatan Monster ---
    const addMonsterBtn = document.getElementById('add-monster-btn');
    const createModal = document.getElementById('monster-create-modal');
    const closeCreateModalBtn = document.getElementById('close-create-modal-btn');
    const createForm = document.getElementById('create-monster-form');

    addMonsterBtn.addEventListener('click', () => createModal.classList.remove('hidden'));
    closeCreateModalBtn.addEventListener('click', () => createModal.classList.add('hidden'));

    createForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const imageFile = document.getElementById('monster-image').files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            const newMonster = {
                id: Date.now(),
                name: document.getElementById('monster-name').value,
                image: reader.result,
                skills: [],
                stats: {
                    hp: parseInt(document.getElementById('monster-hp').value),
                    mana: parseInt(document.getElementById('monster-mana').value),
                    str: parseInt(document.getElementById('monster-str').value),
                    agi: parseInt(document.getElementById('monster-agi').value),
                    dex: parseInt(document.getElementById('monster-dex').value),
                    def: parseInt(document.getElementById('monster-def').value),
                    con: parseInt(document.getElementById('monster-con').value),
                    int: parseInt(document.getElementById('monster-int').value)
                }
            };
            const monsters = JSON.parse(localStorage.getItem('monsters')) || [];
            monsters.push(newMonster);
            localStorage.setItem('monsters', JSON.stringify(monsters));
            loadMonsters();
            createModal.classList.add('hidden');
            createForm.reset();
        };
        if (imageFile) reader.readAsDataURL(imageFile);
    });

    // --- Modal 2: Detail & Edit Monster ---
    const detailModal = document.getElementById('monster-detail-modal');
    const closeDetailModalBtn = document.getElementById('close-detail-modal-btn');
    const saveChangesBtn = document.getElementById('save-monster-changes-btn');
    const addSkillBtn = document.getElementById('add-skill-btn');
    const detailImageUpload = document.getElementById('detail-image-upload');
    const detailImagePreview = document.getElementById('detail-monster-image');

    closeDetailModalBtn.addEventListener('click', () => detailModal.classList.add('hidden'));

    detailImageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            newImageBase64 = reader.result;
            detailImagePreview.src = newImageBase64;
        };
        reader.readAsDataURL(file);
    });

    function openDetailModal(monster) {
        currentEditingMonsterId = monster.id;
        newImageBase64 = null; // Reset gambar baru setiap kali modal dibuka
        
        document.getElementById('detail-monster-name').textContent = monster.name;
        detailImagePreview.src = monster.image;

        const statsGrid = document.getElementById('detail-stats-grid');
        statsGrid.innerHTML = '';
        for (const stat in monster.stats) {
            statsGrid.innerHTML += `<div><label>${stat.toUpperCase()}:</label><input type="number" data-stat="${stat}" value="${monster.stats[stat]}"></div>`;
        }
        renderDetailSkills(monster.skills);
        detailModal.classList.remove('hidden');
    }
    
    function renderDetailSkills(monsterSkills) {
        const skillsContainer = document.getElementById('detail-skills-container');
        skillsContainer.innerHTML = '';
        monsterSkills.forEach(skillInfo => {
            const node = document.createElement('div');
            node.className = 'skill-node';
            node.textContent = skillInfo.name;
            node.onclick = () => showSkillDetails(skillInfo.id);
            skillsContainer.appendChild(node);
        });
    }

    saveChangesBtn.addEventListener('click', () => {
        const monsters = JSON.parse(localStorage.getItem('monsters')) || [];
        const monsterIndex = monsters.findIndex(m => m.id === currentEditingMonsterId);
        if (monsterIndex === -1) return;

        if (newImageBase64) {
            monsters[monsterIndex].image = newImageBase64;
        }

        document.querySelectorAll('#detail-stats-grid input').forEach(input => {
            monsters[monsterIndex].stats[input.dataset.stat] = parseInt(input.value);
        });
        
        localStorage.setItem('monsters', JSON.stringify(monsters));
        loadMonsters();
        detailModal.classList.add('hidden');
    });

    // --- Modal 3: Pilihan Skill & Detail ---
    const skillModal = document.getElementById('skill-modal');
    const closeSkillModal = document.getElementById('close-skill-modal');
    const skillModalTitle = document.getElementById('skill-modal-title');
    const skillModalBody = document.getElementById('skill-modal-body');
    const confirmSkillBtn = document.getElementById('confirm-skill-btn');

    closeSkillModal.addEventListener('click', () => skillModal.classList.add('hidden'));
    
    // --- FUNGSI SHOW SKILL DETAIL DIPERBARUI ---
    function showSkillDetails(skillId) {
        const skill = allSkills.find(s => s.id === skillId);
        if (!skill) return;
        skillModalTitle.textContent = skill.name;
        
        let effectHtml = '';
        switch (skill.type) {
            case 'damage':
                effectHtml = `Damage: ${skill.effect.base} + ${skill.effect.percent}% ${skill.effect.stat?.toUpperCase() || ''}`;
                break;
            case 'buff':
                effectHtml = `Target: ${skill.effect.target}. Efek: `;
                if(skill.effect.type === 'stat_increase') effectHtml += `+${skill.effect.percent}% ${skill.effect.stat?.toUpperCase() || ''}`;
                else if(skill.effect.type === 'hp_recovery') effectHtml += `Pulihkan ${skill.effect.percent}% HP`;
                else if(skill.effect.type === 'debuff_removal') effectHtml += `Hilangkan Debuff`;
                break;
            case 'debuff':
                effectHtml = `Efek: `;
                if(skill.effect.type === 'stat_reduction') effectHtml += `-${skill.effect.percent}% ${skill.effect.stat?.toUpperCase() || ''}`;
                else if(skill.effect.type === 'dot') effectHtml += `-${skill.effect.percent}% HP/detik`;
                break;
        }

        skillModalBody.innerHTML = `
            <p><strong>${(skill.category || '').toUpperCase()} | ${skill.type.toUpperCase()}</strong></p>
            <p><em>${effectHtml}</em></p>
            <p>${skill.desc || 'No description.'}</p>
        `;
        confirmSkillBtn.classList.add('hidden');
        skillModal.classList.remove('hidden');
    }
    
    addSkillBtn.addEventListener('click', () => {
        const monsters = JSON.parse(localStorage.getItem('monsters')) || [];
        const currentMonster = monsters.find(m => m.id === currentEditingMonsterId);
        if (!currentMonster) return;

        skillModalTitle.textContent = "Add Monster Skill";
        const monsterSkillIds = new Set(currentMonster.skills.map(s => s.id));
        const learnableSkills = allSkills.filter(s => s.for === 'monster' && !monsterSkillIds.has(s.id));
        
        skillModalBody.innerHTML = '';
        if (learnableSkills.length > 0) {
            learnableSkills.forEach(skill => {
                skillModalBody.innerHTML += `<label><input type="checkbox" value="${skill.id}" data-name="${skill.name}"> ${skill.name}</label>`;
            });
            confirmSkillBtn.classList.remove('hidden');
        } else {
            skillModalBody.innerHTML = '<p style="text-align: center; color: #888;">All monster skills learned.</p>';
            confirmSkillBtn.classList.add('hidden');
        }
        skillModal.classList.remove('hidden');
    });

    confirmSkillBtn.addEventListener('click', () => {
        const monsters = JSON.parse(localStorage.getItem('monsters')) || [];
        const monsterIndex = monsters.findIndex(m => m.id === currentEditingMonsterId);
        if (monsterIndex === -1) return;

        skillModalBody.querySelectorAll('input:checked').forEach(checkbox => {
            monsters[monsterIndex].skills.push({ id: parseInt(checkbox.value), name: checkbox.dataset.name });
        });
        
        localStorage.setItem('monsters', JSON.stringify(monsters));
        renderDetailSkills(monsters[monsterIndex].skills);
        skillModal.classList.add('hidden');
    });

    // --- Fungsi Utama Load & Create Card ---
    function deleteMonster(monsterId) {
        const monsters = JSON.parse(localStorage.getItem('monsters')) || [];
        const updatedMonsters = monsters.filter(m => m.id !== monsterId);
        localStorage.setItem('monsters', JSON.stringify(updatedMonsters));
        loadMonsters();
    }

    function createMonsterCard(monster) {
        const card = document.createElement('div');
        card.className = 'monster-card';
        card.innerHTML = `
            <img src="${monster.image}" alt="${monster.name}">
            <h3>${monster.name}</h3>
            <div class="stats-display">
                HP: ${monster.stats.hp} | STR: ${monster.stats.str}
            </div>
            <button class="delete-btn" data-id="${monster.id}">&times;</button>`;
        
        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const isConfirmed = confirm(`Are you sure you want to delete ${monster.name}?`);
            if (isConfirmed) deleteMonster(monster.id);
        });
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-btn')) openDetailModal(monster);
        });
        return card;
    }

    function loadMonsters() {
        const monsters = JSON.parse(localStorage.getItem('monsters')) || [];
        monsterContainer.innerHTML = '';
        monsters.forEach(monster => monsterContainer.appendChild(createMonsterCard(monster)));
        monsterContainer.appendChild(addMonsterBtn);
    }

    loadMonsters();
});