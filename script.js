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

// ── BRACKET SVG ─────────────────────────────────────────────────────────────
function drawBracket() {
    const L1 = +document.getElementById('L1').value;
    const L2 = +document.getElementById('L2').value;
    const TH = +document.getElementById('TH').value;
    const LOAD = +document.getElementById('LOAD').value;
    const svg = document.getElementById('bracketSVG');

    const W = 700, H = 280;
    const scale = Math.min(240 / L1, 180 / L2, 1.2);
    const sL1 = L1 * scale, sL2 = L2 * scale, sTH = Math.max(4, TH * scale * 0.8);

    const ox = 120, oy = H / 2 + sL2 / 2;

    // stress color based on results
    let stressColor = '#00d4ff';
    if (results) {
        const ratio = results.vonMises / results.mat.sy;
        if (ratio > 0.9) stressColor = '#ff3b5c';
        else if (ratio > 0.6) stressColor = '#ffd60a';
        else stressColor = '#00ff88';
    }

    svg.innerHTML = `
  <defs>
    <linearGradient id="bracketGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${stressColor}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${stressColor}" stop-opacity="0.4"/>
    </linearGradient>
    <linearGradient id="wallGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e5e7eb"/>
      <stop offset="100%" stop-color="#f3f4f6"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#ff6b35"/>
    </marker>
    <marker id="arrowB" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#00d4ff"/>
    </marker>
  </defs>

  <!-- WALL -->
  <rect x="20" y="${oy - sL2 - sTH - 20}" width="60" height="${sL2 + sTH + 40}" fill="url(#wallGrad)" rx="4"/>
  <!-- wall hatching -->
  ${Array.from({ length: 8 }, (_, i) => `<line x1="20" y1="${oy - sL2 - sTH - 20 + i * 14}" x2="50" y2="${oy - sL2 - sTH - 20 + i * 14 + 30}" stroke="#2a3a5a" stroke-width="1.5"/>`).join('')}
  <text x="50" y="${oy - sL2 - sTH - 28}" text-anchor="middle" fill="#5a6a8a" font-size="10" font-family="JetBrains Mono">WALL</text>

  <!-- VERTICAL ARM -->
  <rect x="${ox}" y="${oy - sL2 - sTH}" width="${sTH}" height="${sL2 + sTH}" fill="url(#bracketGrad)" rx="3" filter="url(#glow)"/>

  <!-- HORIZONTAL ARM -->
  <rect x="${ox}" y="${oy - sTH}" width="${sL1}" height="${sTH}" fill="url(#bracketGrad)" rx="3" filter="url(#glow)"/>

  <!-- FILLET arc -->
  <path d="M${ox + sTH} ${oy - sTH} Q${ox + sTH} ${oy - sTH / 2} ${ox + sTH + sTH * 0.5} ${oy - sTH}" fill="none" stroke="${stressColor}" stroke-width="2" opacity="0.5"/>

  <!-- FIXED END markers (bolts) -->
  <circle cx="${ox + sTH / 2}" cy="${oy - sL2 * 0.3}" r="5" fill="none" stroke="#00d4ff" stroke-width="1.5"/>
  <circle cx="${ox + sTH / 2}" cy="${oy - sL2 * 0.7}" r="5" fill="none" stroke="#00d4ff" stroke-width="1.5"/>
  <text x="${ox + sTH + 8}" y="${oy - sL2 * 0.3 + 4}" fill="#5a6a8a" font-size="9" font-family="JetBrains Mono">M12</text>

  <!-- LOAD ARROW -->
  ${drawLoadArrow(ox, oy, sL1, sTH)}

  <!-- DIMENSION LINES -->
  <line x1="${ox}" y1="${oy + 25}" x2="${ox + sL1}" y2="${oy + 25}" stroke="#2a3a5a" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="${ox}" y1="${oy + 18}" x2="${ox}" y2="${oy + 32}" stroke="#2a3a5a" stroke-width="1"/>
  <line x1="${ox + sL1}" y1="${oy + 18}" x2="${ox + sL1}" y2="${oy + 32}" stroke="#2a3a5a" stroke-width="1"/>
  <text x="${ox + sL1 / 2}" y="${oy + 40}" text-anchor="middle" fill="#5a6a8a" font-size="10" font-family="JetBrains Mono">L₁ = ${L1} mm</text>

  <line x1="${ox - 30}" y1="${oy - sL2 - sTH}" x2="${ox - 30}" y2="${oy}" stroke="#2a3a5a" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="${ox - 37}" y1="${oy - sL2 - sTH}" x2="${ox - 23}" y2="${oy - sL2 - sTH}" stroke="#2a3a5a" stroke-width="1"/>
  <line x1="${ox - 37}" y1="${oy}" x2="${ox - 23}" y2="${oy}" stroke="#2a3a5a" stroke-width="1"/>
  <text x="${ox - 50}" y="${oy - sL2 / 2}" text-anchor="middle" fill="#5a6a8a" font-size="10" font-family="JetBrains Mono" transform="rotate(-90,${ox - 50},${oy - sL2 / 2})">L₂=${L2}mm</text>

  <!-- stress indicator dot at corner -->
  ${results ? `<circle cx="${ox + sTH}" cy="${oy - sTH}" r="6" fill="${stressColor}" opacity="0.9" filter="url(#glow)"/>
  <text x="${ox + sTH + 10}" y="${oy - sTH - 8}" fill="${stressColor}" font-size="9" font-family="JetBrains Mono">MAX STRESS ZONE</text>` : ''}

  <!-- LABEL -->
  <text x="${ox + sL1 + 14}" y="${oy - sTH / 2 + 4}" fill="#5a6a8a" font-size="10" font-family="JetBrains Mono">FREE END</text>
  `;
}

function drawLoadArrow(ox, oy, sL1, sTH) {
    const lx = ox + sL1, ly = oy - sTH / 2;
    const LOAD = +document.getElementById('LOAD').value;
    const arrowLen = 50;
    if (loadType === 0) return `
    <line x1="${lx}" y1="${ly - arrowLen}" x2="${lx}" y2="${ly - 8}" stroke="#ff6b35" stroke-width="2.5" marker-end="url(#arrow)"/>
    <text x="${lx + 8}" y="${ly - arrowLen / 2}" fill="#ff6b35" font-size="10" font-family="JetBrains Mono">F=${LOAD}N</text>`;
    if (loadType === 1) return `
    <line x1="${lx + arrowLen}" y1="${ly}" x2="${lx + 8}" y2="${ly}" stroke="#ff6b35" stroke-width="2.5" marker-end="url(#arrow)"/>
    <text x="${lx + arrowLen + 8}" y="${ly - 8}" fill="#ff6b35" font-size="10" font-family="JetBrains Mono">F=${LOAD}N</text>`;
    if (loadType === 2) return `
    <line x1="${lx}" y1="${ly - arrowLen}" x2="${lx}" y2="${ly - 8}" stroke="#ff6b35" stroke-width="2.5" marker-end="url(#arrow)"/>
    <path d="M${lx + 15},${ly} A20,20 0 1,1 ${lx + 15},${ly + 2}" fill="none" stroke="#a78bfa" stroke-width="2"/>
    <text x="${lx + 40}" y="${ly}" fill="#a78bfa" font-size="10" font-family="JetBrains Mono">M+T</text>`;
    return `
    <path d="M${lx},${ly - arrowLen} Q${lx + 30},${ly - arrowLen / 2} ${lx},${ly}" fill="none" stroke="#ff6b35" stroke-width="2" stroke-dasharray="5,3"/>
    <text x="${lx + 35}" y="${ly - arrowLen / 2}" fill="#ff6b35" font-size="10" font-family="JetBrains Mono">~F</text>`;
}

// ── CORE CALCULATION ─────────────────────────────────────────────────────────
function compute() {
    const L1 = +document.getElementById('L1').value / 1000; // m
    const L2 = +document.getElementById('L2').value / 1000;
    const b = +document.getElementById('BW').value / 1000;
    const t = +document.getElementById('TH').value / 1000;
    const F = +document.getElementById('LOAD').value;
    const mat = MAT[document.getElementById('material').value];
    const sfT = +document.getElementById('sfTarget').value;
    const E = mat.E * 1e6; // Pa (E in MPa → Pa)
    const L = L1;

    const I = (b * Math.pow(t, 3)) / 12;        // m⁴ (approx, simplified)
    const A = b * t;
    const Z = I / (t / 2);
    const r = Math.sqrt(I / A);

    // Bending stress at fixed end
    const M = F * L;
    const sigB = M / Z / 1e6;           // MPa

    // Shear stress
    const tau = (1.5 * F / A) / 1e6;    // MPa

    // Von Mises
    const vm = Math.sqrt(sigB * sigB + 3 * tau * tau);

    // Euler buckling (fixed-free)
    const Pcr = (Math.PI * Math.PI * E * I) / (4 * L * L);

    // Slenderness
    const Lr = L / r;

    // Stiffness (EI/L^3)
    const EIL3 = E * I / (L * L * L);
    const k = [
        [12 * EIL3, 6 * L * EIL3, -12 * EIL3, 6 * L * EIL3],
        [6 * L * EIL3, 4 * L * L * EIL3, -6 * L * EIL3, 2 * L * L * EIL3],
        [-12 * EIL3, -6 * L * EIL3, 12 * EIL3, -6 * L * EIL3],
        [6 * L * EIL3, 2 * L * L * EIL3, -6 * L * EIL3, 4 * L * L * EIL3]
    ];

    // Reduced 2x2 (after BC: node 1 fixed → DOF 1,2 = 0)
    const kr = [[k[2][2], k[2][3]], [k[3][2], k[3][3]]];
    // Eigenvalues of 2x2 symmetric matrix
    const a = kr[0][0], d = kr[1][1], bc = kr[0][1];
    const tr2 = (a + d) / 2, det2 = a * d - bc * bc;
    const disc = Math.sqrt(Math.max(0, tr2 * tr2 - det2));
    const lam1 = tr2 - disc, lam2 = tr2 + disc;

    // Natural frequency from smallest eigenvalue (modal: ω²=λ/m)
    const mass = mat.rho * A * L;
    const omega = Math.sqrt(Math.max(0, lam1 / mass));
    const fn = omega / (2 * Math.PI);

    // Deflection (cantilever: δ=FL³/3EI)
    const delta = (F * Math.pow(L, 3)) / (3 * E * I) * 1000; // mm

    const FOS = mat.sy / vm;

    return {
        L1, L2, b, t, F, mat, sfT, E, I, A, Z, r,
        sigB, tau, vonMises: vm, Pcr, Lr,
        k, lam1, lam2, fn, delta, FOS, mass, EIL3
    };
}

// ── RUN ANALYSIS ────────────────────────────────────────────────────────────
function runAnalysis() {
    const loader = document.getElementById('loader');
    loader.classList.add('show');
    setTimeout(() => {
        results = compute();
        renderAll();
        loader.classList.remove('show');
        drawBracket();
    }, 1200);
}

function fmt(v, d = 2) {
    if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(d) + 'M';
    if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(d) + 'k';
    return v.toFixed(d);
}

function renderAll() {
    const R = results;
    // Quick cards
    document.getElementById('qv1').textContent = fmt(R.Pcr);
    document.getElementById('qv2').textContent = R.fn.toFixed(2);
    document.getElementById('qv3').textContent = R.vonMises.toFixed(2);
    document.getElementById('qv4').textContent = R.FOS.toFixed(2);
    document.getElementById('qv5').textContent = R.delta.toFixed(3);
    document.getElementById('qv6').textContent = (R.lam1 / 1e6).toFixed(3);

    const s4 = document.getElementById('qst4');
    s4.className = 'rc-status ' + (R.FOS >= R.sfT ? 'safe' : R.FOS >= 1 ? 'warn' : 'danger');

    // Stress meter
    const ratio = Math.min(R.vonMises / (R.mat.sy * 2), 1) * 100;
    document.getElementById('smNeedle').style.left = ratio + '%';
    document.getElementById('smYield').textContent = R.mat.sy + ' MPa (Yield)';

    // Verdict
    let vclass, vicon, vtitle, vdesc;
    if (R.FOS >= R.sfT) {
        vclass = 'safe'; vicon = '✅'; vtitle = 'BRACKET IS SAFE';
        vdesc = `Factor of Safety = ${R.FOS.toFixed(2)} ≥ ${R.sfT} (target). Von Mises stress ${R.vonMises.toFixed(1)} MPa is within the yield limit of ${R.mat.sy} MPa for ${R.mat.name}.`;
    }
    else if (R.FOS >= 1) {
        vclass = 'warning'; vicon = '⚠️'; vtitle = 'MARGINAL — REDESIGN RECOMMENDED';
        vdesc = `FOS = ${R.FOS.toFixed(2)} is below target ${R.sfT} but above 1.0. Bracket may yield under repeated loading. Consider increasing thickness or reducing arm length.`;
    }
    else {
        vclass = 'danger'; vicon = '🚨'; vtitle = 'FAILURE PREDICTED';
        vdesc = `FOS = ${R.FOS.toFixed(2)} < 1.0. Von Mises stress ${R.vonMises.toFixed(1)} MPa exceeds yield strength ${R.mat.sy} MPa. Immediate redesign required.`;
    }

    document.getElementById('verdictBox').innerHTML = `
    <div class="verdict-box ${vclass} fade-in">
      <div class="verdict-icon">${vicon}</div>
      <div><div class="verdict-title">${vtitle}</div><div class="verdict-desc">${vdesc}</div></div>
    </div>`;

    // Detail cards
    document.getElementById('rv1').textContent = (R.I * 1e12).toFixed(2);
    document.getElementById('rv2').textContent = (R.Z * 1e9).toFixed(2);
    document.getElementById('rv3').textContent = R.sigB.toFixed(2);
    document.getElementById('rv4').textContent = R.tau.toFixed(2);
    document.getElementById('rv5').textContent = fmt(R.Pcr);
    document.getElementById('rv6').textContent = R.Lr.toFixed(1);
}

// ── INIT ────────────────────────────────────────────────────────────────────
drawBracket();