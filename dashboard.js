// File: dashboard.js (Firebase Version)
import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Logic ---
    const menuBtn = document.getElementById('menu-btn');
    const sideNav = document.getElementById('side-nav');
    menuBtn.addEventListener('click', () => {
        const isNavOpen = sideNav.style.width === '200px';
        sideNav.style.width = isNavOpen ? '0' : '200px';
        document.body.style.marginLeft = isNavOpen ? '0' : '200px';
    });
    
    let powerRankingChartInstance, statDistributionChartInstance, playerPowerChartInstance, dropRateChartInstance;

    // --- Kalkulasi Power ---
    function calculatePlayerPower(player) { /* ... (sama seperti sebelumnya) ... */ }
    
    // --- Render Functions ---
    async function renderPlayerPowerChart(players) { /* ... (sama seperti sebelumnya) ... */ }
    function renderDropRateChart() { /* ... (sama seperti sebelumnya) ... */ }
    function updateMonsterCharts(monsters) { /* ... (sama seperti sebelumnya) ... */ }

    // --- Main Async Function to Load All Data ---
    async function initializeDashboard() {
        console.log("Fetching data from Firebase...");
        const monstersSnapshot = await getDocs(collection(db, "monsters"));
        const playersSnapshot = await getDocs(collection(db, "players"));

        const monsters = monstersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const players = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Data fetched:", { monsters, players });

        updateMonsterCharts(monsters);
        renderPlayerPowerChart(players);
        renderDropRateChart();
    }

    // --- Panggil semua fungsi render saat halaman dimuat ---
    initializeDashboard();

    // --- Salin fungsi-fungsi render lengkap dari file Anda sebelumnya ke sini ---
    // (Agar tidak ada yang terlewat, saya sertakan versi lengkapnya)
    function calculatePlayerPower(player) { let power = 0; for (const stat in player.stats) { power += player.stats[stat]; } power += player.level * 10; power += (player.skills?.length || 0) * 15; let equipBonus = 0; for (const slot in player.equipment) { const item = player.equipment[slot]; if (item && item.stats) { item.stats.forEach(s => { equipBonus += s.value; }); } } power += equipBonus * 2; return Math.floor(power); }
    function renderPlayerPowerChart(players) { const container = document.getElementById('player-power-container'); const canvas = document.getElementById('playerPowerChart'); const message = document.getElementById('no-player-message'); if (players.length === 0) { canvas.style.display = 'none'; message.classList.remove('hidden'); return; } canvas.style.display = 'block'; message.classList.add('hidden'); const sortedPlayers = [...players].sort((a, b) => calculatePlayerPower(b) - calculatePlayerPower(a)); const playerNames = sortedPlayers.map(p => p.name); const playerPowers = sortedPlayers.map(p => calculatePlayerPower(p)); const ctx = canvas.getContext('2d'); if (playerPowerChartInstance) playerPowerChartInstance.destroy(); playerPowerChartInstance = new Chart(ctx, { type: 'bar', data: { labels: playerNames, datasets: [{ label: 'Power Level', data: playerPowers, backgroundColor: 'rgba(255, 159, 64, 0.6)', borderColor: 'rgba(255, 159, 64, 1)', borderWidth: 1 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } }); }
    function renderDropRateChart() { const ctx = document.getElementById('dropRateChart').getContext('2d'); if (dropRateChartInstance) dropRateChartInstance.destroy(); dropRateChartInstance = new Chart(ctx, { type: 'doughnut', data: { labels: ['Common', 'Rare', 'Epic', 'Legendary'], datasets: [{ label: 'Drop Rate %', data: [65, 25, 8, 2], backgroundColor: ['#6c757d', '#007bff', '#6f42c1', '#fd7e14'], borderColor: '#fff', borderWidth: 2, hoverOffset: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } } }); }
    function updateMonsterCharts(monsters) { if (monsters.length > 0) { const monsterPower = monsters.map(m => ({ name: m.name, power: Object.values(m.stats).reduce((s, v) => s + v, 0) })).sort((a, b) => b.power - a.power).slice(0, 5); const powerRankingCtx = document.getElementById('powerRankingChart').getContext('2d'); if (powerRankingChartInstance) powerRankingChartInstance.destroy(); powerRankingChartInstance = new Chart(powerRankingCtx, { type: 'bar', data: { labels: monsterPower.map(m => m.name), datasets: [{ label: 'Monster Total Stats', data: monsterPower.map(m => m.power), backgroundColor: 'rgba(54, 162, 235, 0.6)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false } }); } if (monsters.length > 0) { const totalStats = monsters.reduce((acc, m) => { acc.str += m.stats.str; acc.agi += m.stats.agi; acc.dex += m.stats.dex; acc.def += m.stats.def; acc.con += m.stats.con; acc.int += m.stats.int; return acc; }, { str: 0, agi: 0, dex: 0, def: 0, con: 0, int: 0 }); const statDistributionCtx = document.getElementById('statDistributionChart').getContext('2d'); if (statDistributionChartInstance) statDistributionChartInstance.destroy(); statDistributionChartInstance = new Chart(statDistributionCtx, { type: 'doughnut', data: { labels: Object.keys(totalStats).map(s => s.toUpperCase()), datasets: [{ label: 'Total Stats', data: Object.values(totalStats), backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(201, 203, 207, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)'] }] }, options: { responsive: true, maintainAspectRatio: false } }); } }
});