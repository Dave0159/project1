document.addEventListener('DOMContentLoaded', () => {
    // Navigasi
    const menuBtn = document.getElementById('menu-btn');
    const sideNav = document.getElementById('side-nav');
    menuBtn.addEventListener('click', () => {
        const isNavOpen = sideNav.style.width === '200px';
        sideNav.style.width = isNavOpen ? '0' : '200px';
        document.body.style.marginLeft = isNavOpen ? '0' : '200px';
    });

    // Elemen Utama
    const addBtn = document.getElementById('add-player-btn');
    const modal = document.getElementById('player-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const form = document.getElementById('player-form');
    const playerContainer = document.getElementById('player-container');
    const skillSearchInput = document.getElementById('skill-search-input');
    const skillsDropdown = document.getElementById('skills-dropdown');
    const selectedSkillsDisplay = document.getElementById('selected-skills-display');

    // --- Logika Skill Select ---
    function populateSkillSelection() {
        const allSkills = JSON.parse(localStorage.getItem('skills')) || [];
        const playerSkills = allSkills.filter(s => s.for === 'player');
        skillsDropdown.innerHTML = '';
        if (playerSkills.length === 0) {
            skillsDropdown.innerHTML = '<p style="padding:10px; color: #888;">Buat skill player dulu di halaman Skills.</p>';
            return;
        }
        playerSkills.forEach(skill => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = skill.id;
            checkbox.dataset.name = skill.name;
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) createSkillTag(skill.id, skill.name);
                else document.querySelector(`.skill-tag[data-skill-id="${skill.id}"]`).remove();
            });
            label.append(checkbox, ` ${skill.name}`);
            skillsDropdown.appendChild(label);
        });
    }

    function createSkillTag(id, name) {
        const tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.dataset.skillId = id;
        tag.innerHTML = `${name} <span class="remove-tag" data-id="${id}">&times;</span>`;
        tag.querySelector('.remove-tag').addEventListener('click', () => {
            document.querySelector(`input[type="checkbox"][value="${id}"]`).checked = false;
            tag.remove();
        });
        selectedSkillsDisplay.appendChild(tag);
    }

    skillSearchInput.addEventListener('focus', () => skillsDropdown.classList.remove('hidden'));
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select-wrapper')) skillsDropdown.classList.add('hidden');
    });

    // --- Logika Modal ---
    addBtn.addEventListener('click', () => {
        selectedSkillsDisplay.innerHTML = '';
        form.reset();
        populateSkillSelection();
        modal.classList.remove('hidden');
    });
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

    // --- Simpan & Muat Data Player ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const imageFile = document.getElementById('player-image').files[0];
        const reader = new FileReader();
        
        reader.onloadend = () => {
            const selectedSkills = [];
            skillsDropdown.querySelectorAll('input:checked').forEach(cb => {
                selectedSkills.push({ id: parseInt(cb.value), name: cb.dataset.name });
            });

            const newPlayer = {
                id: Date.now(),
                name: document.getElementById('player-name').value,
                image: imageFile ? reader.result : 'https://via.placeholder.com/150.png?text=No+Image',
                level: parseInt(document.getElementById('player-level').value),
                skills: selectedSkills,
                stats: {
                    str: parseInt(document.getElementById('player-str').value),
                    agi: parseInt(document.getElementById('player-agi').value),
                    dex: parseInt(document.getElementById('player-dex').value),
                    def: parseInt(document.getElementById('player-def').value),
                    con: parseInt(document.getElementById('player-con').value),
                    int: parseInt(document.getElementById('player-int').value),
                },
                // Data default untuk halaman detail agar tidak error saat pertama kali dibuka
                description: "A new adventurer.",
                equipment: { helmet: null, armor: null, shoulder: null, weapon: null, leggings: null, shoes: null },
                equipmentInventory: [],
                inventory: { gold: 0, items: [] },
            };

            const players = JSON.parse(localStorage.getItem('players')) || [];
            players.push(newPlayer);
            localStorage.setItem('players', JSON.stringify(players));
            loadPlayers();
            modal.classList.add('hidden');
        };
        
        if (imageFile) reader.readAsDataURL(imageFile);
        else reader.dispatchEvent(new Event('loadend')); // Trigger manual jika tidak ada gambar
    });

    function loadPlayers() {
        const players = JSON.parse(localStorage.getItem('players')) || [];
        playerContainer.innerHTML = '';

        // Fungsi untuk kalkulasi Power Level
        function calculatePlayerPower(player) {
            let power = 0;
            // 1. Power dari Base Stats
            for (const stat in player.stats) {
                power += player.stats[stat];
            }
            // 2. Power dari Level (1 level = 10 power)
            power += player.level * 10;
            // 3. Power dari jumlah Skill (1 skill = 15 power)
            power += (player.skills?.length || 0) * 15;
            // 4. Power dari Equipment (1 poin stat bonus = 2 power)
            let equipBonus = 0;
            for (const slot in player.equipment) {
                const item = player.equipment[slot];
                if (item && item.stats) {
                    item.stats.forEach(s => { equipBonus += s.value; });
                }
            }
            power += equipBonus * 2;
            return Math.floor(power);
        }

        players.forEach(player => {
            const card = document.createElement('div');
            card.className = 'player-card';
            const playerPower = calculatePlayerPower(player);

            card.innerHTML = `
                <img src="${player.image}" alt="${player.name}">
                <h3>${player.name}</h3>
                <p class="player-level">Level ${player.level}</p>
                <div class="player-power">
                    <span>⚡</span> ${playerPower}
                </div>
                <button class="delete-btn" data-id="${player.id}">&times;</button>
            `;
            // Event listener untuk navigasi ke halaman detail
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-btn')) {
                    window.location.href = `player-detail.html?id=${player.id}`;
                }
            });
            // Event listener untuk tombol hapus
            card.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation(); // Mencegah navigasi saat menghapus
                const isConfirmed = confirm(`Are you sure you want to delete ${player.name}?`);
                if (isConfirmed) {
                    const currentPlayers = JSON.parse(localStorage.getItem('players')) || [];
                    const updatedPlayers = currentPlayers.filter(p => p.id !== player.id);
                    localStorage.setItem('players', JSON.stringify(updatedPlayers));
                    loadPlayers(); // Muat ulang daftar player
                }
            });
            playerContainer.appendChild(card);
        });
        playerContainer.appendChild(addBtn); // Selalu tampilkan tombol '+' di akhir
    }

    // Memuat semua karakter saat halaman pertama kali dibuka
    loadPlayers();
});