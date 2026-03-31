// ── STATE ──────────────────────────────────────────────────────────────────────
const MAT = {
    steel: { E: 200e3, sy: 250, name: 'Structural Steel IS 2062', rho: 7850 },
    alum: { E: 69e3, sy: 276, name: 'Aluminium Alloy 6061-T6', rho: 2700 },
    ss: { E: 193e3, sy: 215, name: 'Stainless Steel 304', rho: 8000 },
    ci: { E: 100e3, sy: 180, name: 'Cast Iron (Grey)', rho: 7200 }
};
let loadType = 0;
let results = null;

function updateRange(id, vid) {
    const v = document.getElementById(id).value;
    const unit = id === 'LOAD' ? 'N' : 'mm';
    document.getElementById(vid).textContent = v + ' ' + unit;
    drawBracket();
}

function updateMat() { /* live */ }

function setLoad(n) {
    loadType = n;
    for (let i = 0; i < 4; i++) document.getElementById('lt' + i).classList.toggle('active', i === n);
}

function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + id).classList.add('active');
    event.target.classList.add('active');
}