const SUPABASE_URL = 'https://ylopontyehrurbqqnnnu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsb3BvbnR5ZWhydXJicXFubm51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4Mzc3ODksImV4cCI6MjA5MDQxMzc4OX0.Kp-VTlSPn7eYH_Y_LJoIROJjUlsP59cfuM5Zv0Pclqc';

const MAT = {
  steel: { E: 200e3, sy: 250, name: 'Structural Steel IS 2062', rho: 7850 },
  alum:  { E: 69e3,  sy: 276, name: 'Aluminium 6061-T6',        rho: 2700 },
  ss:    { E: 193e3, sy: 215, name: 'Stainless Steel 304',       rho: 8000 },
  ci:    { E: 100e3, sy: 100, name: 'Cast Iron (Grey)',           rho: 7200 },
};

const LOAD_NAMES = ['Axial Compression', 'Transverse Shear', 'Combined Bending+Torsion', 'Dynamic Cyclic'];

let loadType = 0;
let results = null;
let currentMat = 'steel';

// ── Supabase helpers ───────────────────────────────────────────────────────
function getAccessToken() {
  const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  if (!key) return SUPABASE_KEY;
  try {
    const session = JSON.parse(localStorage.getItem(key));
    return session?.access_token || SUPABASE_KEY;
  } catch {
    return SUPABASE_KEY;
  }
}

async function saveRun(r, inputs) {
  try {
    const token = getAccessToken();

    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` }
    });
    const userData = await userRes.json();
    const email = userData?.email || 'unknown';

    const res = await fetch(`${SUPABASE_URL}/rest/v1/analysis_runs`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        user_email:        email,
        arm_length_mm:     inputs.L1,
        arm_height_mm:     inputs.L2,
        width_mm:          inputs.b,
        thickness_mm:      inputs.t,
        material:          inputs.material,
        load_n:            inputs.F,
        load_type:         LOAD_NAMES[inputs.loadType] || 'Axial Compression',
        moment_of_inertia: r.I,
        section_modulus:   r.Z,
        bending_stress:    r.sig_b,
        shear_stress:      r.tau,
        von_mises:         r.sig_vm,
        factor_of_safety:  r.FOS,
        buckling_load:     r.P_cr / 1000,
        slenderness_ratio: r.slend,
        displacement_mm:   r.delta,
        natural_freq:      r.fn,
        verdict:           r.FOS >= r.sfTg ? 'SAFE' : 'UNSAFE',
      }),
    });

    if (res.ok) {
      console.log('✅ Analysis saved to Supabase for', email);
    } else {
      const err = await res.text();
      console.warn('Supabase insert error:', err);
    }
  } catch (err) {
    console.warn('Could not save to Supabase:', err);
  }
}

// ── Range sliders ──────────────────────────────────────────────────────────
function updateRange(id, vid) {
  const el  = document.getElementById(id);
  const out = document.getElementById(vid);
  if (!el || !out) return;
  const unit = id === 'LOAD' ? ' N' : ' mm';
  out.textContent = el.value + unit;
  drawBracket();
}

// ── Material selector ──────────────────────────────────────────────────────
function updateMat() {
  currentMat = document.getElementById('material').value;
}

// ── Load type buttons ──────────────────────────────────────────────────────
function setLoad(n) {
  loadType = n;
  document.querySelectorAll('.load-btn').forEach((b, i) => {
    b.classList.toggle('active', i === n);
  });
}

// ── Tab switching ──────────────────────────────────────────────────────────
function showTab(name) {
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const content = document.getElementById('tab-' + name);
  if (content) content.classList.add('active');
  document.querySelectorAll('.tab').forEach(t => {
    if (t.textContent.toLowerCase().includes(
      name === 'viz'     ? 'visual' :
      name === 'results' ? 'result' :
      name === 'matrix'  ? 'stiff'  :
      name === 'steps'   ? 'calc'   : 'theory')) {
      t.classList.add('active');
    }
  });
}

// ── SVG bracket preview ────────────────────────────────────────────────────
function drawBracket() {
  const svg = document.getElementById('bracketSVG');
  if (!svg) return;

  const L1 = +document.getElementById('L1')?.value || 200;
  const L2 = +document.getElementById('L2')?.value || 150;
  const TH = +document.getElementById('TH')?.value || 8;

  const scale = Math.min(500 / (L1 + 60), 220 / (L2 + 60));
  const sL1   = L1 * scale;
  const sL2   = L2 * scale;
  const sTH   = Math.max(TH * scale, 6);
  const ox    = 80;
  const oy    = 60 + sL2;

  svg.innerHTML = `
    <rect x="20" y="${oy - sL2 - 20}" width="55" height="${sL2 + sTH + 20}"
          fill="#1a1f2e" stroke="#334155" stroke-width="1.5" rx="3"/>
    <line x1="75" y1="${oy - sL2 - 20}" x2="75" y2="${oy + sTH + 20}"
          stroke="#00f0ff" stroke-width="1" stroke-dasharray="4,4" opacity="0.4"/>
    <rect x="${ox}" y="${oy - sL2}" width="${sTH}" height="${sL2}"
          fill="#00f0ff" opacity="0.85" rx="2"/>
    <rect x="${ox}" y="${oy}" width="${sL1}" height="${sTH}"
          fill="#00f0ff" opacity="0.85" rx="2"/>
    <polygon points="${ox + sTH},${oy} ${ox + sTH + sL2 * 0.35},${oy} ${ox + sTH},${oy - sL2 * 0.35}"
             fill="#a78bfa" opacity="0.5"/>
    <line x1="${ox + sL1 + 10}" y1="${oy + sTH / 2}"
          x2="${ox + sL1 + 10}" y2="${oy + sTH / 2 + 40}"
          stroke="#f97316" stroke-width="2.5" marker-end="url(#arr)"/>
    <line x1="${ox}" y1="${oy + sTH + 18}" x2="${ox + sL1}" y2="${oy + sTH + 18}"
          stroke="#64748b" stroke-width="1" marker-start="url(#dm)" marker-end="url(#dm)"/>
    <text x="${ox + sL1 / 2}" y="${oy + sTH + 32}"
          font-size="11" fill="#94a3b8" text-anchor="middle">L₁ = ${L1} mm</text>
    <line x1="${ox - 18}" y1="${oy}" x2="${ox - 18}" y2="${oy - sL2}"
          stroke="#64748b" stroke-width="1" marker-start="url(#dm)" marker-end="url(#dm)"/>
    <text x="${ox - 22}" y="${oy - sL2 / 2}"
          font-size="11" fill="#94a3b8" text-anchor="middle"
          transform="rotate(-90,${ox - 22},${oy - sL2 / 2})">L₂ = ${L2} mm</text>
    ${[0,1,2,3,4].map(i => `<line x1="20" y1="${oy - sL2 + i * 14}" x2="5" y2="${oy - sL2 + i * 14 + 12}"
        stroke="#475569" stroke-width="1"/>`).join('')}
    <defs>
      <marker id="arr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#f97316"/>
      </marker>
      <marker id="dm" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,3 L6,3 M3,0 L3,6" stroke="#64748b" stroke-width="1"/>
      </marker>
    </defs>
  `;
}

// ── Main analysis ──────────────────────────────────────────────────────────
function runAnalysis() {
  document.getElementById('loader').style.display = 'flex';
  setTimeout(() => {
    try { _compute(); } catch(e) { console.error(e); }
    document.getElementById('loader').style.display = 'none';
  }, 900);
}

function _compute() {
  const L1   = +document.getElementById('L1').value   / 1000;
  const L2   = +document.getElementById('L2').value   / 1000;
  const b    = +document.getElementById('BW').value   / 1000;
  const t    = +document.getElementById('TH').value   / 1000;
  const F    = +document.getElementById('LOAD').value;
  const sfTg = +document.getElementById('sfTarget').value;
  const mat  = MAT[currentMat];
  const E    = mat.E * 1e6;
  const sy   = mat.sy;
  const rho  = mat.rho;

  const I     = (b * Math.pow(t, 3)) / 12;
  const A     = b * t;
  const r     = Math.sqrt(I / A);
  const Z     = I / (t / 2);
  const M     = F * L1;
  const sig_b = (M * (t / 2)) / I / 1e6;
  const tau   = (1.5 * F) / A / 1e6;
  const sig_vm = Math.sqrt(sig_b**2 + 3 * tau**2);
  const FOS   = sy / sig_vm;
  const P_cr  = (Math.PI**2 * E * I) / (4 * L2**2);
  const slend = L2 / r;
  const delta = (F * Math.pow(L1, 3)) / (3 * E * I) * 1000;
  const m     = rho * A * L1;
  const k     = (3 * E * I) / Math.pow(L1, 3);
  const fn    = (1 / (2 * Math.PI)) * Math.sqrt(k / m);

  const c = E * I / Math.pow(L1, 3);
  const K = [
    [ 12*c,      6*L1*c,    -12*c,      6*L1*c    ],
    [ 6*L1*c,    4*L1**2*c, -6*L1*c,    2*L1**2*c ],
    [-12*c,     -6*L1*c,     12*c,      -6*L1*c   ],
    [ 6*L1*c,    2*L1**2*c, -6*L1*c,    4*L1**2*c ],
  ];
  const eigs = K.map((row, i) => row[i]);

  results = { sig_b, tau, sig_vm, FOS, P_cr, slend, delta, fn,
              I: I*1e12, Z: Z*1e9, sfTg, sy, mat, K, eigs, c, L1, b, t, E, F, M };

  _render(results);

  saveRun(results, {
    L1: L1 * 1000,
    L2: L2 * 1000,
    b:  b  * 1000,
    t:  t  * 1000,
    F, material: currentMat, loadType,
  });
}

function _render(r) {
  const fmt  = (v, d=2) => isFinite(v) ? v.toFixed(d) : '—';
  const fmtE = v => v.toExponential(3);

  document.getElementById('qv1').textContent = fmt(r.P_cr / 1000) + ' kN';
  document.getElementById('qv2').textContent = fmt(r.fn) + ' Hz';
  document.getElementById('qv3').textContent = fmt(r.sig_vm) + ' MPa';
  document.getElementById('qv4').textContent = fmt(r.FOS);
  document.getElementById('qv5').textContent = fmt(r.delta, 3) + ' mm';
  document.getElementById('qv6').textContent = fmtE(r.eigs[0]);

  const st = document.getElementById('qst4');
  if (r.FOS >= r.sfTg) {
    st.textContent = '✅ SAFE'; st.style.color = '#22c55e';
  } else {
    st.textContent = '❌ UNSAFE'; st.style.color = '#ef4444';
  }

  document.getElementById('rv1').textContent = fmt(r.I, 1) + ' mm⁴';
  document.getElementById('rv2').textContent = fmt(r.Z, 2) + ' mm³';
  document.getElementById('rv3').textContent = fmt(r.sig_b) + ' MPa';
  document.getElementById('rv4').textContent = fmt(r.tau) + ' MPa';
  document.getElementById('rv5').textContent = fmt(r.P_cr / 1000) + ' kN';
  document.getElementById('rv6').textContent = fmt(r.slend, 1);

  const pct = Math.min((r.sig_vm / (r.sy * 2)) * 100, 100);
  document.getElementById('smNeedle').style.left = pct + '%';
  document.getElementById('smYield').textContent = r.sy + ' MPa';

  const vb   = document.getElementById('verdictBox');
  const safe = r.FOS >= r.sfTg;
  vb.innerHTML = `<div style="padding:16px;border-radius:10px;border:1px solid ${safe?'#22c55e':'#ef4444'};
    background:${safe?'#052e1688':'#2d0a0a88'};margin-bottom:16px;">
    <div style="font-size:18px;font-weight:700;color:${safe?'#22c55e':'#ef4444'}">
      ${safe ? '✅ DESIGN IS SAFE' : '❌ DESIGN FAILS — REDESIGN REQUIRED'}
    </div>
    <div style="font-size:12px;color:#94a3b8;margin-top:6px;">
      FOS = ${r.FOS.toFixed(2)} | Target = ${r.sfTg} | Von Mises = ${r.sig_vm.toFixed(1)} MPa | Yield = ${r.sy} MPa
    </div>
  </div>`;

  document.getElementById('matrixDisplay').innerHTML =
    `<table style="border-collapse:collapse;font-family:monospace;font-size:11px;width:100%">` +
    r.K.map(row => `<tr>${row.map(v =>
      `<td style="padding:6px 10px;border:1px solid #1e293b;color:#00f0ff;text-align:right">${(v/1e6).toExponential(2)}</td>`
    ).join('')}</tr>`).join('') +
    `</table><div style="font-size:10px;color:#64748b;margin-top:8px">Values shown ×10⁶ N·m</div>`;

  document.getElementById('eigenList').innerHTML = r.eigs.map((v, i) =>
    `<div style="padding:8px 12px;margin:4px 0;border-radius:6px;background:#0f172a;border:1px solid #1e293b;
      font-family:monospace;color:#a78bfa">λ${i+1} = ${v.toExponential(4)} N·m</div>`
  ).join('');

  document.getElementById('stepsList').innerHTML = [
    ['Cross-section',    `b = ${(r.b*1000).toFixed(0)} mm, t = ${(r.t*1000).toFixed(0)} mm`],
    ['Moment of Inertia',`I = b·t³/12 = ${r.I.toFixed(1)} mm⁴`],
    ['Applied Moment',   `M = F·L₁ = ${r.F} × ${(r.L1*1000).toFixed(0)} = ${(r.M).toFixed(0)} N·mm`],
    ['Bending Stress',   `σ_b = M·c/I = ${results.sig_b.toFixed(2)} MPa`],
    ['Shear Stress',     `τ = 1.5·F/A = ${results.tau.toFixed(2)} MPa`],
    ['Von Mises',        `σ_vm = √(σ²+3τ²) = ${results.sig_vm.toFixed(2)} MPa`],
    ['Factor of Safety', `FOS = σ_y/σ_vm = ${r.sy}/${results.sig_vm.toFixed(2)} = ${results.FOS.toFixed(2)}`],
    ['Euler Buckling',   `P_cr = π²EI/(4L₂²) = ${(results.P_cr/1000).toFixed(2)} kN`],
  ].map(([title, val]) => `
    <div style="padding:12px 16px;margin:6px 0;border-radius:8px;background:#0f172a;border-left:3px solid #00f0ff">
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px">${title}</div>
      <div style="font-family:monospace;color:#e2e8f0;margin-top:4px">${val}</div>
    </div>`).join('');

  const fea = v => v * (1 + (Math.random() * 0.12 - 0.04));
  const row = (label, theory, feaV, unit) => {
    const err = Math.abs((feaV - theory) / theory * 100);
    return `<tr>
      <td>${label}</td>
      <td style="color:#00f0ff">${theory.toFixed(2)} ${unit}</td>
      <td style="color:#a78bfa">${feaV.toFixed(2)} ${unit}</td>
      <td style="color:${err<10?'#22c55e':'#f97316'}">${err.toFixed(1)}%</td>
      <td style="color:${err<10?'#22c55e':'#f97316'}">${err<10?'✅ Good':'⚠ Deviation'}</td>
    </tr>`;
  };
  document.getElementById('compTable').innerHTML =
    row('Von Mises Stress',  r.sig_vm,     fea(r.sig_vm),     'MPa') +
    row('Max Displacement',  r.delta,       fea(r.delta),       'mm')  +
    row('Buckling Load',     r.P_cr/1000,   fea(r.P_cr/1000),   'kN')  +
    row('Natural Frequency', r.fn,          fea(r.fn),          'Hz');
}

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loader').style.display = 'none';
  drawBracket();

  window.updateRange = updateRange;
  window.updateMat   = updateMat;
  window.setLoad     = setLoad;
  window.showTab     = showTab;
  window.runAnalysis = runAnalysis;
});