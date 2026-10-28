
// ===========================================================================
// FURNITURE — only real furniture / fixtures from the photos (no suitcases,
// clothes, bottles or clutter).
// ===========================================================================

// local placer: origin (x0,z0) rotated by ry; ly is the bottom of each piece
function at(x0, z0, ry = 0) {
  const c = Math.cos(ry), s = Math.sin(ry);
  const T = (lx, lz) => [x0 + lx * c + lz * s, z0 - lx * s + lz * c];
  const P = {
    box(m, lx, ly, lz, w, h, d, solid = false) { const [x, z] = T(lx, lz); obox(m, w, h, d, x, ly + h / 2, z, ry); if (solid) P.col(lx, lz, w, d, ly, ly + h); return P; },
    tilt(m, lx, ly, lz, w, h, d, rx = 0, rz = 0) { const [x, z] = T(lx, lz); obox(m, w, h, d, x, ly + h / 2, z, ry, rx, rz); return P; },
    cyl(m, lx, ly, lz, rt, rb, h, seg = 16) { const [x, z] = T(lx, lz); cyl(m, rt, rb, h, x, ly, z, seg); return P; },
    sph(m, lx, ly, lz, r, sx = 1, sy = 1, sz = 1, seg = 16) { const [x, z] = T(lx, lz); sph(m, r, x, ly, z, sx, sy, sz, seg); return P; },
    col(lx, lz, w, d, y0, y1) {
      const pts = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(([a, b]) => T(lx + a, lz + b));
      const xs = pts.map(p => p[0]), zs = pts.map(p => p[1]);
      col(Math.min(...xs), Math.max(...xs), y0, y1, Math.min(...zs), Math.max(...zs)); return P;
    },
    w: T,
  };
  return P;
}

// ---------------------------------------------------------------- window dressing
function floorFor(y) { return y < -0.2 ? L_B : y < 3.25 ? L_M : L_U; }
function ceilFor(y) { return y < -0.2 ? CEIL_B : y < 3.25 ? CEIL_M : CEIL_U; }
function curtainsFor(W, op, wOff) {
  const sg = Math.sign(wOff), fl = floorFor(op.y0) + 0.02;
  let top = Math.min(op.y1 + (op.rise || 0) + 0.18, ceilFor(op.y0) - 0.05);
  if (op.y1 + (op.rise || 0) > 3.2 && op.y0 < 3) top = op.y1 + (op.rise || 0) + 0.25;
  const m = { gold: 'curtainGold', taupe: 'curtainTaupe', cream: 'curtainCream', sheerCream: 'curtainCream', blush: 'curtainBlush' }[op.curtain] || 'curtainCream';
  for (const [s0, dir] of [[op.a0 - 0.08, -1], [op.a1 + 0.08, 1]]) {
    for (let i = 0; i < 6; i++) {
      const a = s0 + dir * i * 0.085, w = wOff + sg * (i % 2 ? 0.035 : 0);
      lbox(W, m, Math.min(a, a + dir * 0.09), Math.max(a, a + dir * 0.09), fl, top, Math.min(w, w + sg * 0.02), Math.max(w, w + sg * 0.02));
    }
  }
  if (op.curtain === 'sheerCream' || op.curtain === 'taupe') lbox(W, 'sheer', op.a0 - 0.05, op.a1 + 0.05, fl + 0.03, top - 0.02, wOff - sg * 0.05, wOff - sg * 0.045);
  lbox(W, 'iron', op.a0 - 0.65, op.a1 + 0.65, top, top + 0.03, wOff - 0.015 + sg * 0.01, wOff + 0.015 + sg * 0.01);
  for (const a of [op.a0 - 0.68, op.a1 + 0.68]) lbox(W, 'iron', a - 0.04, a + 0.04, top - 0.03, top + 0.06, wOff - 0.03 + sg * 0.01, wOff + 0.03 + sg * 0.01);
}
function blindsFor(W, op, wOff) {
  const y1 = op.y1 - 0.04, y0 = op.y0 + (op.y1 - op.y0) * 0.35;
  for (let y = y1; y > y0; y -= 0.05) lbox(W, 'whiteMatte', op.a0 + 0.04, op.a1 - 0.04, y - 0.005, y, Math.min(wOff, wOff + Math.sign(wOff) * 0.04), Math.max(wOff, wOff + Math.sign(wOff) * 0.04));
  lbox(W, 'whiteMatte', op.a0 + 0.02, op.a1 - 0.02, y0 - 0.03, y0, Math.min(wOff, wOff + Math.sign(wOff) * 0.05), Math.max(wOff, wOff + Math.sign(wOff) * 0.05));
}

// ---------------------------------------------------------------- rugs (textures)
const RUG = {
  foyer: rugTex((g, s) => { g.fillStyle = '#c9c7c4'; g.fillRect(0, 0, s, s); for (let i = 0; i < 40; i++) for (let j = 0; j < 40; j++) { g.fillStyle = ((i + j) % 4 < 2) ? 'rgba(255,255,255,.18)' : 'rgba(120,118,118,.18)'; const v = (Math.floor(i / 4) + Math.floor(j / 4)) % 2; g.fillRect(i * s / 40, j * s / 40 + (v ? 0 : 2), s / 40 - 1, v ? s / 40 - 2 : 3); } noise(g, s, 8000, 0.08); }),
  oval: rugTex((g, s) => { g.fillStyle = '#e1ddd6'; g.fillRect(0, 0, s, s); g.strokeStyle = 'rgba(180,170,155,.6)'; g.lineWidth = 10; g.beginPath(); g.ellipse(s / 2, s / 2, s / 2 - 18, s / 2 - 18, 0, 0, 7); g.stroke(); for (let i = 0; i < 30; i++) { g.strokeStyle = 'rgba(190,185,175,.25)'; g.lineWidth = 3; g.beginPath(); g.arc(rnd() * s, rnd() * s, rr(10, 60), 0, 6); g.stroke(); } noise(g, s, 6000, 0.08); }),
  bands: rugTex((g, s) => { const c = ['#a39a8c', '#c4bcae', '#8f8678', '#c9c1b2', '#a59c8e']; for (let i = 0; i < 5; i++) { g.fillStyle = c[i]; const m = i * s * 0.09; g.fillRect(m, m, s - 2 * m, s - 2 * m); } noise(g, s, 16000, 0.12, false); noise(g, s, 9000, 0.08); }),
  arcs: rugTex((g, s) => { g.fillStyle = '#e8e6e2'; g.fillRect(0, 0, s, s); g.strokeStyle = 'rgba(205,190,165,.8)'; g.lineWidth = 4; g.beginPath(); g.ellipse(s * .5, s * .55, s * .38, s * .3, 0, 0, 7); g.stroke(); g.fillStyle = 'rgba(150,150,155,.35)'; g.fillRect(0, s * .45, s, s * .04); g.fillRect(s * .2, s * .7, s * .6, s * .03); noise(g, s, 7000, 0.07, false); }),
  teal: rugTex((g, s) => { g.fillStyle = '#5f8d93'; g.fillRect(0, 0, s, s); g.fillStyle = '#9fc4c8'; g.fillRect(0, 0, s, s * .38); noise(g, s, 9000, 0.1, false); }),
  ornate: rugTex((g, s) => { g.fillStyle = '#e4dccd'; g.fillRect(0, 0, s, s); for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(${rnd() < .5 ? '170,140,90' : '120,130,150'},.35)`; g.lineWidth = rr(1, 3); g.beginPath(); const x = rnd() * s, y = rnd() * s; g.arc(x, y, rr(6, 30), rr(0, 3), rr(3, 6)); g.stroke(); } g.strokeStyle = 'rgba(170,140,90,.6)'; g.lineWidth = 8; g.strokeRect(14, 14, s - 28, s - 28); }),
  abstract: rugTex((g, s) => { g.fillStyle = '#9aa5ad'; g.fillRect(0, 0, s, s); for (let i = 0; i < 160; i++) { g.fillStyle = ['rgba(240,240,240,.5)', 'rgba(60,75,90,.4)', 'rgba(150,170,185,.5)'][(rnd() * 3) | 0]; g.beginPath(); g.ellipse(rnd() * s, rnd() * s, rr(4, 50), rr(2, 12), rnd() * 3, 0, 7); g.fill(); } }),
  purple: rugTex((g, s) => { g.fillStyle = '#8f7f98'; g.fillRect(0, 0, s, s); for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${rnd() < .5 ? '255,255,255' : '60,40,70'},.12)`; g.fillRect(rnd() * s, rnd() * s, 2, rr(3, 10)); } }),
  elephant: rugTex((g, s) => { g.fillStyle = '#ede8dd'; g.fillRect(0, 0, s, s); g.fillStyle = '#6f6f78'; g.fillRect(0, s * .82, s, s * .18); g.beginPath(); g.ellipse(s * .45, s * .35, s * .2, s * .16, 0, 0, 7); g.fill(); g.fillRect(s * .3, s * .35, s * .07, s * .35); g.fillRect(s * .48, s * .4, s * .06, s * .3); g.beginPath(); g.ellipse(s * .66, s * .55, s * .12, s * .1, 0, 0, 7); g.fill(); g.fillRect(s * .6, s * .55, s * .04, s * .2); g.fillRect(s * .7, s * .55, s * .04, s * .2); g.strokeStyle = '#6f6f78'; g.lineWidth = 12; g.beginPath(); g.moveTo(s * .3, s * .3); g.quadraticCurveTo(s * .18, s * .55, s * .24, s * .62); g.stroke(); noise(g, s, 7000, 0.08, false); }),
  swirl: rugTex((g, s) => { g.fillStyle = '#e9e9ea'; g.fillRect(0, 0, s, s); g.strokeStyle = 'rgba(110,112,118,.55)'; g.lineWidth = 5; for (let i = 0; i < 26; i++) { const x = rnd() * s, y = rnd() * s; for (let r = 6; r < rr(25, 55); r += 9) { g.beginPath(); g.arc(x, y, r, 0, 5.4); g.stroke(); } } }),
  stripe: rugTex((g, s) => { g.fillStyle = '#ecebe8'; g.fillRect(0, 0, s, s); const c = ['#2d5aa8', '#9aa0a8', '#c9ccd0', '#2d5aa8', '#7a7f86']; for (let i = 0; i < 5; i++) { g.fillStyle = c[i]; g.fillRect(0, s * (.12 + i * .17), s, s * .07); } }),
  geo: rugTex((g, s) => { g.fillStyle = '#f2f2f0'; g.fillRect(0, 0, s, s); const n = 10, t = s / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? '#1f2d4d' : '#8c95a8'; g.beginPath(); g.moveTo(i * t, j * t); g.lineTo(i * t + t / 2, j * t + t / 2); g.lineTo(i * t, j * t + t); g.fill(); } }),
  bath: rugTex((g, s) => { g.fillStyle = '#9b9b9e'; g.fillRect(0, 0, s, s); noise(g, s, 9000, 0.15); }),
  sheep: rugTex((g, s) => { g.fillStyle = '#f2ede2'; g.fillRect(0, 0, s, s); noise(g, s, 9000, 0.2, false); }),
};

// ---------------------------------------------------------------- lights
function chandelier(x, y, z, arms = 5, r = 0.35, tiers = 1, metal = 'brass', inten = 45) {
  cyl(metal, 0.012, 0.012, 0.6, x, y + 0.35, z, 6);
  cyl(metal, 0.04, 0.07, 0.35, x, y, z, 10);
  for (let t = 0; t < tiers; t++) {
    const rr2 = r * (1 - t * 0.35), yy = y + 0.1 + t * 0.32, n = arms - t * 2;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + t * 0.4, ex = x + rr2 * Math.cos(a), ez = z + rr2 * Math.sin(a);
      beam(metal, [x, yy - 0.05, z], [ex, yy, ez], 0.009);
      cyl(metal, 0.025, 0.02, 0.05, ex, yy, ez, 8);
      cyl('shade', 0.05, 0.075, 0.12, ex, yy + 0.08, ez, 12, false, true);
      sph('bulb', 0.018, ex, yy + 0.1, ez, 1, 1, 1, 6);
    }
  }
  fixture(x, y + 0.1, z, inten);
}
function crystalRing(x, y, z, R = 0.45, n = 40) {
  torus('black', R, 0.035, x, y, z, Math.PI / 2, 40);
  for (let i = 0; i < 3; i++) beam('chrome', [x + R * Math.cos(i * 2.1), y, z + R * Math.sin(i * 2.1)], [x, CEIL_M - 0.02, z], 0.004);
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; obox('crystal', 0.025, 0.2, 0.012, x + (R + 0.02) * Math.cos(a), y - 0.06, z + (R + 0.02) * Math.sin(a), -a); }
  torus('bulbCool', R - 0.03, 0.01, x, y - 0.03, z, Math.PI / 2, 40);
  cyl('black', 0.1, 0.1, 0.04, x, CEIL_M - 0.04, z, 16);
  fixture(x, y - 0.1, z, 60, 0xfff0dd);
}
function crystalBar(x, y, z, len = 1.3, ry = 0) {
  const P = at(x, z, ry);
  P.box('brass', 0, y, 0, len, 0.05, 0.16);
  for (let i = 0; i < 28; i++) for (const s of [-1, 1]) P.box('crystal', -len / 2 + i * len / 27, y - 0.17, s * 0.09, 0.025, 0.19, 0.02);
  P.box('bulbCool', 0, y - 0.01, 0, len - 0.05, 0.015, 0.1);
  for (const s of [-1, 1]) beam('chrome', [P.w(s * len / 2.5, 0)[0], y + 0.05, P.w(s * len / 2.5, 0)[1]], [x, CEIL_M - 0.32, z], 0.004);
  P.box('brass', 0, CEIL_M - 0.34, 0, 0.3, 0.04, 0.1);
  fixture(x, y - 0.2, z, 55, 0xfff0dd);
}
function bubbleChandelier(x, y, z, ceil, n = 10, R = 0.45) {
  cyl('gold', 0.012, 0.012, ceil - y, x, y, z, 6);
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, rr2 = R * (0.6 + 0.4 * (i % 2)), yy = y + (i % 3) * 0.06;
    const ex = x + rr2 * Math.cos(a), ez = z + rr2 * Math.sin(a);
    beam('gold', [x, y, z], [ex, yy, ez], 0.008);
    sph('crystal', 0.075, ex, yy - 0.04, ez, 1, 0.85, 1, 10);
    sph('bulb', 0.02, ex, yy - 0.04, ez, 1, 1, 1, 6);
  }
  fixture(x, y - 0.1, z, 50);
}
function drumLight(x, y, z, r = 0.25) { cyl('shade', r, r, 0.18, x, y - 0.18, z, 24, false, true); cyl('bulbCool', r - 0.01, r - 0.01, 0.01, x, y - 0.18, z, 24); cyl('chrome', 0.03, 0.03, 0.05, x, y - 0.05, z, 8); torus('trim', 0.4, 0.04, x, y - 0.01, z); fixture(x, y - 0.3, z, 40); }
function bowlLight(x, y, z) { cyl('iron', 0.006, 0.006, 0.35, x, y - 0.35, z, 4); sph('shade', 0.22, x, y - 0.42, z, 1, 0.35, 1, 18); fixture(x, y - 0.5, z, 38); }
function flushLight(x, y, z) { sph('shade', 0.16, x, y - 0.02, z, 1, 0.4, 1, 14); fixture(x, y - 0.25, z, 32); }
function potLight(x, y, z, light = false) { cyl('bulbCool', 0.05, 0.05, 0.01, x, y - 0.012, z, 12); cyl('trim', 0.07, 0.07, 0.008, x, y - 0.006, z, 12); if (light) fixture(x, y - 0.2, z, 22, 0xfff1df, 6); }
function sconce(x, y, z, ry, two = false) {
  const P = at(x, z, ry);
  P.box('brass', 0, y - 0.1, 0.03, 0.08, 0.16, 0.03);
  for (const s of two ? [-0.12, 0.12] : [0]) { P.cyl('brass', s, y - 0.02, 0.12, 0.012, 0.012, 0.08, 6); P.cyl('shade', s, y + 0.05, 0.13, 0.04, 0.07, 0.11, 10); }
  const [wx, wz] = P.w(0, 0.25); fixture(wx, y, wz, 14, 0xffd39a, 5);
}
function tableLamp(x, y, z, shadeMat = 'shade', base = 'gold') { cyl(base, 0.06, 0.08, 0.04, x, y, z, 12); cyl(base, 0.012, 0.012, 0.38, x, y, z, 6); cyl(shadeMat, 0.12, 0.15, 0.22, x, y + 0.34, z, 18, false, true); fixture(x, y + 0.4, z, 16, 0xffd29a, 5); }
function floorLamp(x, y, z) { cyl('gold', 0.14, 0.14, 0.02, x, y, z, 16); for (const a of [0, 2.1, 4.2]) cyl('gold', 0.008, 0.008, 1.45, x + 0.03 * Math.cos(a), y, z + 0.03 * Math.sin(a), 4); box('shade', x - 0.2, x + 0.2, y + 1.45, y + 1.72, z - 0.13, z + 0.13); fixture(x, y + 1.5, z, 20, 0xffd29a, 6); }

// ---------------------------------------------------------------- furniture pieces
function armchair(x, y, z, ry, m = 'greyFabric', leg = 'gold', w = 0.72) {
  const P = at(x, z, ry);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) P.tilt(leg, a * (w / 2 - 0.08), y, b * 0.28, 0.025, 0.4, 0.025, b * 0.15, -a * 0.15);
  P.box(m, 0, y + 0.36, 0.02, w, 0.14, 0.66);
  P.tilt(m, 0, y + 0.42, 0.33, w, 0.5, 0.12, -0.22, 0);
  for (const s of [-1, 1]) P.box(m, s * (w / 2 - 0.05), y + 0.42, 0.08, 0.1, 0.24, 0.5);
}
function boucleChair(x, y, z, ry) {
  const P = at(x, z, ry);
  P.cyl('black', 0, y, 0, 0.22, 0.24, 0.06, 18);
  P.sph('boucle', 0, y + 0.3, 0, 0.42, 1, 0.55, 1, 18);
  P.sph('boucle', 0, y + 0.55, 0.22, 0.38, 1.05, 0.65, 0.5, 16);
}
function diningChairTall(x, y, z, ry) {
  const P = at(x, z, ry);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) P.tilt('whiteGloss', a * 0.2, y, b * 0.2, 0.035, 0.47, 0.035, b * -0.08, 0);
  P.box('velvetBeige', 0, y + 0.45, 0, 0.5, 0.08, 0.5);
  P.tilt('velvetBeige', 0, y + 0.5, 0.25, 0.52, 0.95, 0.06, -0.06, 0);
  P.tilt('whiteGloss', 0, y + 0.5, 0.285, 0.56, 0.98, 0.02, -0.06, 0);
}
function tuftedChair(x, y, z, ry) {
  const P = at(x, z, ry);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) P.box('cabEspresso', a * 0.2, y, b * 0.2, 0.04, 0.45, 0.04);
  P.box('velvetBeige', 0, y + 0.43, 0, 0.5, 0.1, 0.52);
  P.tilt('velvetBeige', 0, y + 0.5, 0.26, 0.56, 0.6, 0.1, -0.12, 0);
  for (const s of [-1, 1]) P.tilt('velvetBeige', s * 0.27, y + 0.48, 0.12, 0.08, 0.5, 0.3, 0, 0);
}
function slatChair(x, y, z, ry, m = 'whiteGloss', seat = 'cushion') {
  const P = at(x, z, ry);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) P.box(m, a * 0.19, y, b * 0.19, 0.035, 0.45, 0.035);
  P.box(seat, 0, y + 0.43, 0, 0.44, 0.05, 0.44);
  for (const s of [-1, 1]) P.box(m, s * 0.19, y + 0.45, 0.2, 0.035, 0.5, 0.035);
  P.box(m, 0, y + 0.9, 0.2, 0.42, 0.06, 0.03);
  for (let i = -2; i <= 2; i++) P.box(m, i * 0.07, y + 0.5, 0.2, 0.025, 0.4, 0.02);
}
function sofa(x, y, z, ry, len = 2.2, m = 'creamLeather', d = 0.95) {
  const P = at(x, z, ry);
  P.box(m, 0, y + 0.08, 0, len, 0.32, d, true);
  for (let i = 0; i < 3; i++) P.box(m, -len / 2 + 0.2 + (len - 0.4) * (i + 0.5) / 3, y + 0.4, -0.05, (len - 0.4) / 3 - 0.02, 0.12, d - 0.25);
  P.tilt(m, 0, y + 0.35, d / 2 - 0.13, len - 0.3, 0.5, 0.24, -0.1, 0);
  for (const s of [-1, 1]) P.box(m, s * (len / 2 - 0.13), y + 0.08, 0, 0.26, 0.55, d);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) P.box('darkWood', a * (len / 2 - 0.1), y, b * (d / 2 - 0.1), 0.05, 0.08, 0.05);
}
function curvySofa(cx, y, cz, R, t0, t1, m = 'boucle') {
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = t0 + (t1 - t0) * (i + 0.5) / n, len = Math.abs(t1 - t0) * R / n + 0.04;
    const ry = Math.atan2(-Math.cos(a), -Math.sin(a));
    const sx = cx + R * Math.cos(a), sz = cz + R * Math.sin(a), bx = cx + (R + 0.42) * Math.cos(a), bz = cz + (R + 0.42) * Math.sin(a);
    obox(m, len, 0.42, 0.85, (sx + bx) / 2 - 0.0, y + 0.21, (sz + bz) / 2, ry, 0, 0, true);
    obox(m, len + 0.02, 0.5, 0.28, cx + (R + 0.7) * Math.cos(a), y + 0.55, cz + (R + 0.7) * Math.sin(a), ry);
  }
  for (const a of [t0, t1]) sph(m, 0.32, cx + (R + 0.42) * Math.cos(a), y + 0.4, cz + (R + 0.42) * Math.sin(a), 1, 0.9, 1, 14);
}
function bed(x, y, z, ry, w = 1.9, l = 2.15, o = {}) {
  const P = at(x, z, ry); // headboard at local +z
  const fh = o.platform ? 0.22 : 0.32, frame = o.frame || 'whiteGloss';
  P.box(frame, 0, y + (o.platform ? 0.08 : 0.1), 0, w + (o.platform ? 0.35 : 0.08), fh, l + (o.platform ? 0.3 : 0.05));
  P.col(0, 0, w + 0.05, l, y, y + 0.7);
  P.box('bedding', 0, y + 0.32, -0.02, w - 0.04, 0.25, l - 0.08);
  P.box(o.duvet || 'bedding', 0, y + 0.55, -0.12, w + 0.02, 0.07, l - 0.4);
  for (const s of [-1, 1]) { P.box('bedding', s * w * 0.25, y + 0.57, l / 2 - 0.3, w * 0.42, 0.16, 0.38); if (o.pillow) P.box(o.pillow, s * w * 0.22, y + 0.62, l / 2 - 0.5, w * 0.28, 0.2, 0.12); }
  if (o.head !== false) P.box(o.headMat || frame, 0, y, l / 2 + 0.03, o.headW || w + 0.12, o.headH || 1.35, 0.08, true);
  if (o.foot) P.box(frame, 0, y, -l / 2 - 0.03, w + 0.12, 0.6, 0.06);
  return P;
}
function nightstand(x, y, z, ry, m = 'whiteGloss', h = 0.6) { const P = at(x, z, ry); P.box(m, 0, y + 0.08, 0, 0.55, h - 0.08, 0.42, true); for (const s of [0.18, 0.4]) P.box('trim', 0, y + s, -0.215, 0.48, 0.01, 0.01); P.cyl('chrome', 0, y + 0.3, -0.22, 0.015, 0.015, 0.02, 6); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) P.box(m, a * 0.24, y, b * 0.17, 0.04, 0.08, 0.04); }
function dresser(x, y, z, ry, w = 1.6, h = 0.8, d = 0.5, m = 'whiteGloss') { const P = at(x, z, ry); P.box(m, 0, y, 0, w, h, d, true); for (let i = 1; i < 3; i++) P.box('trim', 0, y + h * i / 3, -d / 2 - 0.004, w - 0.04, 0.008, 0.008); P.box('trim', 0, y + 0.02, -d / 2 - 0.004, 0.008, h - 0.04, 0.008); return P; }
function art(x, y, z, ry, w, h, m = 'art1', frame = 'black') { const P = at(x, z, ry); P.box(frame, 0, y - h / 2, 0, w + 0.06, h + 0.06, 0.03); P.box(m, 0, y - h / 2 + 0.03, -0.018, w, h, 0.01); }
function mirrorW(x, y, z, ry, w, h, frame = 'brass') { const P = at(x, z, ry); P.box(frame, 0, y - h / 2, 0, w + 0.08, h + 0.08, 0.03); P.box('mirror', 0, y - h / 2 + 0.04, -0.018, w, h, 0.01); }
function tv(x, y, z, ry, w = 1.45) { const P = at(x, z, ry); P.box('black', 0, y, 0, w, w * 0.57, 0.05); P.box('glowScreen', 0, y + 0.02, -0.027, w - 0.04, w * 0.57 - 0.04, 0.005); }
function toilet(x, y, z, ry) { const P = at(x, z, ry); P.box('porcelain', 0, y, 0.25, 0.42, 0.75, 0.2); P.box('porcelain', 0, y + 0.75, 0.25, 0.44, 0.03, 0.22); P.cyl('porcelain', 0, y, -0.02, 0.17, 0.12, 0.38, 16); P.sph('porcelain', 0, y + 0.38, -0.05, 0.2, 1, 0.12, 1.25, 16); }
function tub(x0, x1, z0, z1, y, deck = 'porcelain', apron = 'porcelain') { box(apron, x0, x1, y, y + 0.55, z0, z1, true); const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; const g = new THREE.SphereGeometry(0.5, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2); g.scale((x1 - x0) / 2 - 0.12, 0.42, (z1 - z0) / 2 - 0.12); g.translate(cx, y + 0.555, cz); push('porcelain', g); box(deck, x0, x1, y + 0.55, y + 0.56, z0, z1); }
function vanity(x0, x1, z0, z1, y, cab = 'cabWhite', top = 'marbleBeige', sinks = [], vessel = false) {
  box(cab, x0, x1, y + 0.1, y + 0.82, z0, z1, true); box('blackGloss', x0 + 0.02, x1 - 0.02, y, y + 0.1, z0 + 0.02, z1 - 0.02);
  box(top, x0 - 0.02, x1 + 0.02, y + 0.82, y + 0.86, z0 - 0.02, z1 + 0.02);
  for (const [sx, sz] of sinks) { if (vessel) { const g = new THREE.SphereGeometry(0.2, 18, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2); g.scale(1, 0.6, 1); g.rotateX(Math.PI); g.translate(sx, y + 0.98, sz); push('porcelain', g); } else box('porcelain', sx - 0.22, sx + 0.22, y + 0.86, y + 0.865, sz - 0.17, sz + 0.17); cyl('chrome', 0.015, 0.015, 0.22, sx, y + 0.86, sz + (z1 > z0 ? 0 : 0), 8); }
}
function showerGlass(x0, x1, z0, z1, y, h = 2.0) { box('glass', x0, x1, y, y + h, z0, z1); box('chrome', x0, x1, y + h - 0.02, y + h, z0, z1); col(x0, x1, y, y + h, z0, z1); }
function shelfTower(x, y, z, ry, h = 2.0) { const P = at(x, z, ry); for (const s of [-1, 1]) P.box('whiteMatte', s * 0.2, y, 0, 0.02, h, 0.35); for (let i = 0; i <= 6; i++) P.box('whiteMatte', 0, y + i * h / 6.2, 0, 0.4, 0.02, 0.35); P.box('whiteMatte', 0, y, 0.17, 0.42, h, 0.01); }
function rod(x0, x1, z, y) { box('chrome', x0, x1, y - 0.012, y + 0.012, z - 0.012, z + 0.012); box('whiteMatte', x0, x1, y + 0.2, y + 0.22, z - 0.18, z + 0.18); }
function cabRun(x0, x1, z0, z1, y, top = 'granite', m = 'cabWhite', handles = 'brass') {
  box(m, x0, x1, y + 0.1, y + 0.88, z0, z1, true); box('blackGloss', x0 + 0.03, x1 - 0.03, y, y + 0.1, z0 + 0.03, z1 - 0.03);
  box(top, x0 - 0.02, x1 + 0.02, y + 0.88, y + 0.92, z0 - 0.02, z1 + 0.02);
  // door seams on the long, exposed face
  const alongX = (x1 - x0) > (z1 - z0), L = alongX ? x1 - x0 : z1 - z0, n = Math.max(1, Math.round(L / 0.5));
  return { alongX, n };
}
function cabFront(x0, x1, z0, z1, y, h, face, m = 'trim', handle = 'brass') { // face: 'n','s','e','w'
  const alongX = face === 'n' || face === 's', L = alongX ? x1 - x0 : z1 - z0, n = Math.max(1, Math.round(L / 0.5));
  for (let i = 0; i < n; i++) {
    const a = (alongX ? x0 : z0) + L * (i + 0.5) / n, w = L / n - 0.04;
    const fz = face === 'n' ? z1 : face === 's' ? z0 : null, fx = face === 'e' ? x1 : face === 'w' ? x0 : null, sg = (face === 'n' || face === 'e') ? 1 : -1;
    if (alongX) { box(m, a - w / 2, a + w / 2, y + 0.04, y + h - 0.04, fz, fz + sg * 0.012); box(handle, a - 0.008, a + 0.008, y + h - 0.25, y + h - 0.1, fz + sg * 0.02, fz + sg * 0.032); }
    else { box(m, fx, fx + sg * 0.012, y + 0.04, y + h - 0.04, a - w / 2, a + w / 2); box(handle, fx + sg * 0.02, fx + sg * 0.032, y + h - 0.25, y + h - 0.1, a - 0.008, a + 0.008); }
  }
}
function upperCab(x0, x1, z0, z1, y0, y1, face) { box('cabWhite', x0, x1, y0, y1, z0, z1, false); cabFront(x0, x1, z0, z1, y0, y1 - y0, face); box('trim', x0 - 0.02, x1 + 0.02, y1, y1 + 0.08, z0 - 0.02, z1 + 0.02); }

// ---------------------------------------------------------------- rooms
function buildFurniture() {
  const y = L_M;
  // ===== FOYER
  rug(RUG.foyer, 2.1, 2.5, 8.0, y, 5.2);
  chandelier(8.0, 3.9, 4.0, 9, 0.62, 3, 'gold', 90);
  { const P = at(6.75, 3.6, -Math.PI / 2); P.box('whiteGloss', 0, y, 0, 1.4, 0.82, 0.38); P.box('whiteGloss', 0, y + 0.82, 0, 1.5, 0.04, 0.42); P.box('cream', 0, y, 0.6, 1.0, 0.42, 0.42); P.col(0, 0.3, 1.5, 1.0, 0, 0.9); }
  mirrorW(6.49, 2.1, 3.6, -Math.PI / 2, 0.9, 1.1, 'gold');
  for (const z of [3.2, 5.6]) potLight(8.0, CEIL_U - 0.15, z);
  // ===== LIVING ROOM (2 storey)
  rug(RUG.oval, 3.7, 2.9, 12.3, y, 4.4, 0, true);
  curvySofa(12.0, y, 4.3, 1.5, -0.55, 1.3);
  { const P = at(12.1, 4.3); P.box('whiteGloss', 0, y, 0, 1.0, 0.36, 0.5, true); P.box('blackGloss', 0, y + 0.08, 0, 0.8, 0.22, 0.52); }
  for (const x of [11.75, 12.85]) { const P = at(x, 2.0); P.box('whiteGloss', 0, y + 0.58, 0, 0.62, 0.05, 0.42); for (const s of [-1, 1]) P.box('whiteGloss', s * 0.29, y, 0, 0.04, 0.6, 0.42); P.box('blackGloss', 0, y, 0, 0.5, 0.56, 0.02); tableLamp(x, y + 0.63, 2.0, 'shade', 'gold'); }
  boucleChair(10.55, y, 2.45, Math.PI + 0.4); boucleChair(14.15, y, 2.45, Math.PI - 0.4);
  mirrorW(14.92, 2.3, 4.6, Math.PI / 2, 0.7, 0.9, 'chrome'); mirrorW(14.92, 2.3, 3.4, Math.PI / 2, 0.55, 0.7, 'chrome');
  sconce(14.93, 2.0, 5.5, -Math.PI / 2); sconce(14.93, 2.0, 2.5, -Math.PI / 2);
  { const P = at(10.25, 6.3); P.box('gold', 0, y, 0, 0.4, 0.04, 0.4); for (const s of [-1, 1]) P.tilt('gold', s * 0.0, y + 0.02, s * 0.15, 0.02, 0.6, 0.02, s * 0.5, 0); P.box('cream', 0, y + 0.6, 0, 0.42, 0.03, 0.42); }
  for (const [x, z] of [[11, 3], [13.6, 3], [11, 5.6], [13.6, 5.6]]) potLight(x, CEIL_U - 0.15, z, true);
  // ===== DINING ROOM
  { const P = at(12.3, 8.9); P.box('whiteGloss', 0, y + 0.72, 0, 2.3, 0.07, 1.1, false); P.box('mirror', 0, y + 0.79, 0, 1.0, 0.002, 0.3);
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) P.tilt('whiteGloss', a * 0.95, y, b * 0.42, 0.12, 0.74, 0.1, 0, a * -0.12);
    P.col(0, 0, 2.3, 1.1, 0, 0.8); }
  for (const dx of [-0.75, 0, 0.75]) { diningChairTall(12.3 + dx, y, 8.25, Math.PI); diningChairTall(12.3 + dx, y, 9.55, 0); }
  diningChairTall(10.95, y, 8.9, -Math.PI / 2); diningChairTall(13.65, y, 8.9, Math.PI / 2);
  crystalBar(12.3, 2.15, 8.9, 1.3);
  for (const x of [13.4, 14.25]) diningChairTall(x, y, 10.6, 0);
  art(13.8, 2.5, 10.92, 0, 0.9, 0.7, 'canvasBW', 'chrome');
  // ===== BUTLER'S PANTRY
  cabRun(13.6, 14.15, 11.05, 12.35, y, 'granite'); cabFront(13.6, 14.15, 11.05, 12.35, y + 0.1, 0.78, 'w');
  for (const h of [1.45, 1.8, 2.15]) box('cabEspresso', 13.85, 14.15, y + h, y + h + 0.05, 11.05, 12.35);
  potLight(13.3, CEIL_M, 11.7, true);
  // ===== KITCHEN
  // back run along the rear wall (sink under the window)
  cabRun(10.2, 14.95, 17.0, 17.5, y); cabFront(10.2, 14.95, 17.0, 17.5, y + 0.1, 0.78, 's');
  box('steel', 13.75, 14.45, y + 0.86, y + 0.925, 17.08, 17.4); box('blackGloss', 13.8, 14.4, y + 0.7, y + 0.93, 17.12, 17.36);
  cyl('chrome', 0.015, 0.015, 0.35, 14.1, y + 0.92, 17.45, 8); beam('chrome', [14.1, y + 1.27, 17.45], [14.1, y + 1.2, 17.25], 0.015);
  box('steel', 12.6, 13.2, y + 0.1, y + 0.86, 16.98, 17.0);
  // range wall (east): range + hood + microwave
  cabRun(14.4, 14.95, 12.5, 17.0, y); cabFront(14.4, 14.95, 12.5, 14.4, y + 0.1, 0.78, 'w'); cabFront(14.4, 14.95, 15.2, 17.0, y + 0.1, 0.78, 'w');
  box('appliance', 14.35, 14.95, y, y + 0.93, 14.42, 15.18, true); box('blackGloss', 14.34, 14.36, y + 0.2, y + 0.7, 14.5, 15.1); box('black', 14.4, 14.95, y + 0.93, y + 0.95, 14.45, 15.15);
  for (const [dz, dx] of [[-0.18, -0.12], [0.18, -0.12], [-0.18, 0.12], [0.18, 0.12]]) torus('iron', 0.08, 0.012, 14.67 + dx, y + 0.96, 14.8 + dz);
  box('backsplash', 14.93, 14.95, y + 0.92, y + 1.6, 12.5, 17.5); box('backsplash', 10.2, 14.95, y + 0.92, y + 1.55, 17.48, 17.5);
  box('steel', 14.5, 14.95, y + 1.62, y + 1.72, 14.4, 15.2); { const g = new THREE.CylinderGeometry(0.12, 0.42, 0.35, 4, 1, true); g.rotateY(Math.PI / 4); g.scale(1, 1, 1.4); g.translate(14.72, y + 1.9, 14.8); push('steel', g); } box('steel', 14.62, 14.84, y + 2.07, CEIL_M, 14.68, 14.92);
  upperCab(14.6, 14.95, 12.5, 14.35, y + 1.55, y + 2.6, 'w'); upperCab(14.6, 14.95, 15.25, 17.0, y + 1.55, y + 2.6, 'w');
  box('appliance', 14.58, 14.62, y + 1.35, y + 1.7, 15.3, 16.0); box('blackGloss', 14.57, 14.58, y + 1.38, y + 1.67, 15.35, 15.85);
  upperCab(10.2, 13.5, 17.25, 17.5, y + 1.55, y + 2.6, 's');
  // fridge first (coming from the hall), then cabinets, then the doorway to the butler's pantry
  box('fridge', 10.2, 11.1, y, y + 1.8, 12.5, 13.25, true); box('black', 10.64, 10.66, y + 0.6, y + 1.8, 13.25, 13.26); for (const x of [10.58, 10.72]) box('chrome', x - 0.012, x + 0.012, y + 0.95, y + 1.5, 13.27, 13.3); box('fridge', 10.22, 11.08, y + 0.05, y + 0.58, 13.25, 13.27);
  upperCab(10.2, 11.1, 12.5, 12.9, y + 1.85, y + 2.6, 'n');
  cabRun(11.1, 12.5, 12.5, 13.1, y); cabFront(11.1, 12.5, 12.5, 13.1, y + 0.1, 0.78, 'n'); upperCab(11.1, 12.5, 12.5, 12.85, y + 1.55, y + 2.6, 'n');
  box('backsplash', 11.1, 12.5, y + 0.92, y + 1.55, 12.48, 12.5);
  cabRun(13.7, 14.4, 12.5, 13.1, y); cabFront(13.7, 14.4, 12.5, 13.1, y + 0.1, 0.78, 'n'); upperCab(13.7, 14.4, 12.5, 12.85, y + 1.55, y + 2.6, 'n');
  box('backsplash', 13.7, 14.4, y + 0.92, y + 1.55, 12.48, 12.5);
  // island
  cabRun(11.85, 12.95, 14.0, 16.0, y); cabFront(11.85, 12.95, 14.0, 16.0, y + 0.1, 0.78, 'w'); cabFront(11.85, 12.95, 14.0, 16.0, y + 0.1, 0.78, 'e');
  chandelier(12.4, 2.2, 15.0, 3, 0.28, 1, 'brass', 45);
  for (const [x, z] of [[11, 13.2], [11, 16.5], [13.8, 13.8], [13.8, 16.4]]) potLight(x, CEIL_M, z, true);
  // ===== BREAKFAST AREA
  rug(RUG.bands, 2.7, 3.4, 7.8, y, 16.4);
  { const P = at(7.75, 16.5); P.box('cabEspresso', 0, y + 0.7, 0, 1.0, 0.06, 1.8, false); P.box('cabEspresso', 0, y, 0, 0.6, 0.7, 0.14); P.box('cabEspresso', 0, y, 0, 0.12, 0.7, 1.3); P.box('cabEspresso', 0, y, 0, 0.8, 0.06, 1.5); P.col(0, 0, 1.0, 1.8, 0, 0.78); }
  for (const dz of [-0.45, 0.45]) { tuftedChair(7.05, y, 16.5 + dz, -Math.PI / 2); tuftedChair(8.45, y, 16.5 + dz, Math.PI / 2); }
  tuftedChair(7.75, y, 15.3, Math.PI); tuftedChair(7.75, y, 17.7, 0);
  chandelier(7.75, 2.2, 16.5, 5, 0.38, 1, 'brass', 50);
  sconce(6.45, 1.9, 17.48, Math.PI, true); sconce(9.05, 1.9, 17.48, Math.PI, true);
  // ===== FAMILY ROOM
  // fireplace on the west wall
  box('graniteDark', 0.1, 0.42, y, y + 1.25, 14.45, 16.25, true); box('black', 0.1, 0.44, y + 0.2, y + 0.95, 14.85, 15.85); box('fireGlow', 0.12, 0.43, y + 0.25, y + 0.45, 14.95, 15.75);
  box('brass', 0.43, 0.45, y + 0.95, y + 1.0, 14.85, 15.85); box('brass', 0.43, 0.45, y + 0.2, y + 0.25, 14.85, 15.85);
  for (let i = 0; i < 4; i++) obox('darkWood', 0.6, 0.09, 0.09, 0.3, y + 0.33 + (i % 2) * 0.08, 15.0 + i * 0.18, 0.3 * (i - 1.5));
  box('trim', 0.1, 0.52, y, y + 1.35, 14.25, 14.45); box('trim', 0.1, 0.52, y, y + 1.35, 16.25, 16.45); box('trim', 0.1, 0.62, y + 1.33, y + 1.45, 14.15, 16.55); box('trim', 0.1, 0.55, y + 1.18, y + 1.33, 14.25, 16.45);
  box('graniteDark', 0.1, 0.9, y, y + 0.03, 14.4, 16.3);
  box('blackPanel', 0.1, 0.16, y + 1.6, y + 2.85, 14.25, 16.45); for (let i = 0; i < 9; i++) for (let j = 0; j < 5; j++) obox('blackPanel', 0.05, 0.12, 0.12, 0.18, y + 1.7 + j * 0.24, 14.45 + i * 0.24, 0, Math.PI / 4, 0);
  tv(0.22, y + 1.75, 15.35, -Math.PI / 2, 1.5);
  box('plum', 0.1, 0.12, y + 0.1, y + 2.7, 16.6, 17.4);
  { const P = at(0.42, 17.0, -Math.PI / 2); for (let i = 0; i < 12; i++) { const k = 0.08 * Math.abs(Math.sin(i * 0.9)); for (const s of [-1, 1]) P.box('whiteGloss', s * (0.3 + k), y + 0.25 + i * 0.15, 0, 0.08, 0.15, 0.4); } for (let i = 0; i < 6; i++) P.box('whiteGloss', 0, y + 0.25 + i * 0.35, 0, 0.62, 0.025, 0.38); P.box('whiteGloss', 0, y + 0.25, 0.18, 0.62, 2.0, 0.02); P.box('purple', -0.15, y + 0.95, -0.05, 0.25, 0.14, 0.3); P.col(0, 0, 0.8, 0.45, 0, 2.3); for (const s of [-1, 1]) P.tilt('plum', s * 0.25, y, 0, 0.04, 0.26, 0.04, 0, s * 0.2); }
  armchair(1.3, y, 16.9, -0.5, 'greyFabric'); armchair(4.9, y, 16.9, 0.55, 'greyFabric');
  for (const [x, z, r, h] of [[2.35, 17.05, 0.27, 0.55], [2.75, 16.85, 0.24, 0.45]]) { cyl('gold', r, r, h, x, y, z, 20, false, true); cyl('cream', r, r, 0.03, x, y + h, z, 20); }
  rug(RUG.arcs, 3.4, 3.0, 2.8, y, 15.1);
  curvySofa(2.2, y, 15.25, 1.8, -0.75, 0.75);
  floorLamp(5.5, y, 17.15);
  crystalRing(2.8, 2.45, 15.3, 0.45);
  for (const [x, z] of [[1.2, 13.6], [4.6, 13.6]]) potLight(x, CEIL_M, z, false);
  // ===== OFFICE (folding table + chairs)
  rug(RUG.teal, 2.0, 2.4, 1.9, y, 9.1);
  { const P = at(0.6, 9.1); P.box('whiteMatte', 0, y + 0.72, 0, 0.76, 0.04, 1.8); for (const s of [-1, 1]) { P.tilt('iron', 0, y, s * 0.75, 0.6, 0.03, 0.03, 0, 0); P.tilt('iron', 0.0, y, s * 0.75, 0.03, 0.74, 0.03, 0, 0.0); } P.col(0, 0, 0.76, 1.8, 0, 0.76); }
  slatChair(1.35, y, 8.6, Math.PI / 2); slatChair(1.35, y, 9.6, Math.PI / 2);
  flushLight(2.2, CEIL_M, 9.1);
  // ===== HALL TO THE GARAGE: 3 steps down, garage door on the left, powder room ahead
  beam('oak', [3.1, 0.92, 7.3], [2.35, 0.47, 7.3], 0.03, false);
  for (const x of [2.9, 2.5]) beam('iron', [x, 0.92 - (3.1 - x) * 0.6, 7.3], [x, 0.92 - (3.1 - x) * 0.6, 7.36], 0.012);
  rug(RUG.bath, 0.7, 0.5, 2.0, -0.45, 6.6);
  flushLight(2.0, CEIL_M, 6.7); flushLight(4.2, CEIL_M, 6.7);
  // ===== POWDER ROOM (dark green, gold trim, black door)
  { const yb = -0.45; cyl('porcelain', 0.22, 0.2, 0.86, 0.45, yb, 6.7, 24); cyl('porcelain', 0.19, 0.19, 0.02, 0.45, yb + 0.86, 6.7, 24); box('chrome', 0.1, 0.16, yb + 1.0, yb + 1.05, 6.68, 6.72);
    toilet(0.95, yb, 6.25, Math.PI);
    mirrorW(0.12, yb + 1.95, 6.7, -Math.PI / 2, 0.5, 0.8, 'gold');
    box('crystal', 0.1, 0.16, yb + 1.55, yb + 1.95, 7.05, 7.12); fixture(0.8, yb + 1.9, 6.7, 14, 0xffd39a, 3.5);
    for (const [z0, z1, y0, y1] of [[6.15, 6.45, 0.3, 1.0], [6.15, 6.45, 1.2, 2.6], [6.95, 7.25, 0.3, 1.0], [6.95, 7.25, 1.2, 2.6]]) { const x = 0.11, a = yb + y0, c = yb + y1; box('gold', x, x + 0.015, a, c, z0, z0 + 0.02); box('gold', x, x + 0.015, a, c, z1 - 0.02, z1); box('gold', x, x + 0.015, a, a + 0.02, z0, z1); box('gold', x, x + 0.015, c - 0.02, c, z0, z1); }
    potLight(0.8, CEIL_M, 6.7); }
  // ===== MAIN HALL
  flushLight(8.6, CEIL_M, 8.0); flushLight(8.6, CEIL_M, 11.8);

  // ===================================================== UPSTAIRS
  const u = L_U;
  // ===== BIG BEDROOM (over the garage)
  rug(RUG.ornate, 3.0, 2.4, 3.8, u, 2.6);
  bed(5.25, u, 2.6, Math.PI / 2, 1.95, 2.15, { headMat: 'whiteGloss', headH: 1.6, foot: true, pillow: 'purplePillow' });
  box('mirror', 6.3, 6.31, u + 0.6, u + 1.55, 1.55, 3.65);
  nightstand(6.05, u, 1.25, Math.PI / 2); nightstand(6.05, u, 3.95, Math.PI / 2);
  { const P = at(3.2, 0.55); P.box('whiteGloss', 0, u + 0.72, 0, 1.5, 0.05, 0.6); for (const s of [-1, 1]) P.box('whiteGloss', s * 0.95, u, 0, 0.42, 0.6, 0.5, true); P.box('cabCherry', 0, u, 0.1, 1.2, 0.72, 0.04); }
  { const P = at(3.2, 1.2, Math.PI); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) P.box('cabCherry', a * 0.2, u, b * 0.2, 0.04, 0.47, 0.04); P.box('velvetBeige', 0, u + 0.45, 0, 0.5, 0.06, 0.48); P.tilt('cabCherry', 0, u + 0.5, 0.24, 0.42, 0.6, 0.04, -0.1, 0); P.tilt('velvetBeige', 0, u + 0.55, 0.22, 0.32, 0.45, 0.02, -0.1, 0); }
  drumLight(3.2, CEIL_U, 2.6, 0.27);
  art(6.3, u + 1.9, 0.7, Math.PI / 2, 0.45, 0.55, 'canvasBW'); art(6.3, u + 1.9, 4.5, Math.PI / 2, 0.45, 0.55, 'canvasBW');
  // big bedroom's walk-in closet
  rod(2.95, 4.45, 7.45, u + 1.75); rod(2.95, 4.45, 7.45, u + 1.0); shelfTower(3.2, u, 5.4, Math.PI, 2.0); flushLight(3.7, CEIL_U, 6.4);
  flushLight(5.5, CEIL_U, 6.4);
  // ===== JACK & JILL BATHROOM (connects the big bedroom and the bedroom)
  vanity(0.1, 0.65, 5.3, 6.7, u, 'cabEspresso', 'marble', [[0.38, 5.65], [0.38, 6.35]]);
  mirrorW(0.12, u + 1.95, 6.0, -Math.PI / 2, 1.25, 0.85, 'black');
  sconce(0.12, u + 2.2, 6.0, Math.PI / 2, true);
  toilet(1.3, u, 5.48, Math.PI);
  flushLight(1.4, CEIL_U, 6.0);
  // ===== BEDROOM (teal accent wall, floating bed)
  rug(RUG.abstract, 2.4, 2.0, 1.9, u, 10.0);
  bed(1.9, u, 11.75, 0, 1.6, 2.05, { platform: true, headMat: 'silverLeather', headH: 1.45, headW: 1.6, duvet: 'beddingGreen' });
  box('whiteGloss', 2.85, 3.0, u, u + 1.6, 12.65, 12.73);
  dresser(0.35, u, 10.3, -Math.PI / 2, 0.9, 1.1, 0.45, 'whiteGloss');
  mirrorW(3.55, u + 2.0, 12.7, 0, 0.5, 0.9, 'whiteGloss');
  bowlLight(1.9, CEIL_U, 10.2);
  // bedroom walk-in closet (left, right beside the door)
  rod(4.0, 6.25, 7.75, u + 1.75); rod(4.0, 5.2, 7.75, u + 1.0); shelfTower(4.2, u, 8.6, -Math.PI / 2, 2.0); flushLight(5.1, CEIL_U, 8.25);
  // ===== MY BEDROOM (east, front)
  rug(RUG.elephant, 2.4, 1.9, 12.0, u, 9.3);
  bed(12.0, u, 7.9, Math.PI, 1.55, 2.05, { platform: true, headMat: 'goldLeather', headH: 1.5, headW: 1.4, duvet: 'beddingTaupe', pillow: 'plumVelvet' });
  { box('whiteGloss', 12.75, 13.55, u, u + 1.5, 6.88, 6.95); box('gold', 13.0, 13.08, u, u + 1.5, 6.95, 6.97); box('gold', 13.18, 13.26, u, u + 1.5, 6.95, 6.97); }
  for (const [x0, x1, z0, z1] of [[14.3, 14.95, 7.3, 9.1], [13.4, 14.3, 6.92, 7.5]]) { box('blackGloss', x0, x1, u + 0.72, u + 0.75, z0, z1); col(x0, x1, u, u + 0.75, z0, z1); for (const [a, b] of [[x0 + 0.05, z0 + 0.05], [x1 - 0.05, z1 - 0.05]]) { beam('iron', [a, u, b], [x1 - 0.05, u + 0.72, z0 + 0.05], 0.015); beam('iron', [a, u, z1 - 0.05], [x0 + 0.05, u + 0.72, z0 + 0.05], 0.015); } }
  tv(14.75, u + 0.78, 8.2, Math.PI / 2, 0.65); tv(13.85, u + 0.78, 7.05, Math.PI, 0.6);
  { const P = at(13.9, 8.1, -Math.PI / 4); P.cyl('black', 0, u, 0, 0.3, 0.3, 0.04, 5); P.cyl('chrome', 0, u + 0.04, 0, 0.03, 0.03, 0.4, 8); P.box('black', 0, u + 0.44, 0, 0.55, 0.1, 0.52); P.box('redMetal', 0, u + 0.54, 0, 0.3, 0.02, 0.4); P.tilt('black', 0, u + 0.5, 0.3, 0.5, 0.85, 0.1, -0.12, 0); P.tilt('redMetal', 0, u + 0.7, 0.27, 0.22, 0.5, 0.02, -0.12, 0); }
  chandelier(12.2, u + 2.1, 8.6, 3, 0.2, 1, 'brass', 40);
  art(14.93, u + 2.2, 7.4, Math.PI / 2, 0.5, 0.6, 'canvasBW'); art(14.93, u + 1.6, 7.4, Math.PI / 2, 0.5, 0.55, 'canvasBW');
  // ===== MY CLOSET (dark green) — now next to the laundry
  box('whiteGloss', 11.55, 12.1, u, u + 0.6, 12.3, 12.9, true); box('whiteGloss', 11.55, 12.1, u + 0.6, u + 1.2, 12.3, 12.9);
  shelfTower(12.6, u, 12.75, 0, 2.0); rod(11.5, 12.9, 11.0, u + 1.75);
  flushLight(12.2, CEIL_U, 11.8);
  // ===== MY WASHROOM (vanity on the left, toilet, tub straight ahead with the striped curtain)
  vanity(13.05, 13.6, 10.75, 11.6, u, 'cabCherry', 'cream', [[13.33, 11.18]]);
  mirrorW(13.07, u + 1.9, 11.18, -Math.PI / 2, 0.55, 0.7, 'chrome');
  toilet(13.33, u, 11.95, -Math.PI / 2);
  tub(13.75, 14.95, 12.2, 12.95, u); box('wallTile', 13.75, 14.95, u + 0.55, u + 2.1, 12.92, 12.95); box('wallTile', 14.92, 14.95, u + 0.55, u + 2.1, 12.2, 12.95);
  for (let i = 0; i < 6; i++) box(i % 2 ? 'black' : 'whiteMatte', 13.75 + i * 0.2, 13.95 + i * 0.2, u + 0.6, u + 2.05, 12.18, 12.2);
  box('chrome', 13.75, 14.95, u + 2.08, u + 2.1, 12.18, 12.21);
  rug(RUG.bath, 0.8, 0.5, 14.1, u, 11.4);
  flushLight(14.0, CEIL_U, 11.6);
  // ===== LAUNDRY (across the hall from where the stairs come up)
  for (const z of [11.35, 12.1]) { box('washer', 10.8, 11.35, u, u + 0.32, z - 0.34, z + 0.34, true); box('washer', 10.8, 11.35, u + 0.32, u + 1.3, z - 0.34, z + 0.34, true); torus('steel', 0.22, 0.04, 10.79, u + 0.78, z, 0, 24); box('screenOff', 10.78, 10.79, u + 0.6, u + 0.96, z - 0.18, z + 0.18); }
  cabRun(9.7, 10.75, 12.4, 12.95, u, 'marbleBeige', 'cabMaple'); cabFront(9.7, 10.75, 12.4, 12.95, u + 0.1, 0.78, 's', 'cabMaple', 'chrome'); box('porcelain', 9.9, 10.5, u + 0.92, u + 0.93, 12.5, 12.85);
  upperCab(9.7, 11.3, 12.65, 12.95, u + 1.6, u + 2.4, 's');
  flushLight(10.5, CEIL_U, 11.8);
  // ===== ENSUITE (walk in: shower + sink on the left, tub on the right)
  showerGlass(1.5, 1.53, 12.9, 14.4, u, 2.0); showerGlass(1.53, 2.7, 14.37, 14.4, u, 2.0);
  box('wallTile', 1.53, 2.73, u, u + 2.1, 12.87, 12.9); box('wallTile', 2.7, 2.73, u, u + 2.1, 12.9, 14.4); box('tileShower', 1.53, 2.7, u, u + 0.02, 12.9, 14.37);
  cyl('chrome', 0.1, 0.1, 0.02, 2.1, u + 1.95, 13.6, 16);
  vanity(0.1, 0.65, 14.1, 16.3, u, 'cabWhite', 'marbleBeige', [[0.38, 14.65], [0.38, 15.75]]);
  for (const z of [14.65, 15.75]) { mirrorW(0.12, u + 2.0, z, -Math.PI / 2, 0.6, 0.75, 'darkWood'); sconce(0.12, u + 2.2, z, Math.PI / 2, true); }
  toilet(0.42, u, 13.55, -Math.PI / 2);
  tub(0.4, 2.7, 16.7, 17.5, u, 'wallTile', 'wallTile'); box('wallTile', 0.4, 2.7, u + 0.55, u + 0.85, 17.45, 17.5);
  rug(RUG.bath, 0.9, 0.55, 1.4, u, 15.0);
  potLight(1.4, CEIL_U, 13.8, true); potLight(1.4, CEIL_U, 16.0, true);
  // ===== CLOSETS (dad's is a proper walk-in)
  shelfTower(4.0, u, 13.0, Math.PI, 2.0); shelfTower(5.0, u, 13.8, -Math.PI / 2, 2.0);
  rod(2.95, 3.75, 13.05, u + 1.75); rod(2.95, 3.75, 13.05, u + 1.0); rod(2.95, 4.6, 14.35, u + 1.75); rod(4.25, 4.85, 13.05, u + 1.75);
  box('whiteGloss', 2.95, 3.4, u, u + 0.85, 13.4, 14.3, true);
  shelfTower(4.0, u, 17.42, 0, 2.0); rod(2.95, 3.75, 17.2, u + 1.75); rod(4.25, 5.05, 17.2, u + 1.75); rod(2.95, 5.05, 15.65, u + 1.75);
  mirrorW(5.12, u + 1.9, 16.5, Math.PI / 2, 0.6, 1.5, 'mirror'); rug(RUG.sheep, 0.7, 0.5, 4.5, u, 16.5, 0.3);
  flushLight(4.0, CEIL_U, 13.7); flushLight(4.0, CEIL_U, 16.5); flushLight(4.0, CEIL_U, 15.0);
  // ===== MASTER BEDROOM
  rug(RUG.purple, 2.6, 1.7, 7.7, u, 17.4);
  armchair(7.0, u, 17.85, -0.25, 'pinkVelvet'); armchair(8.45, u, 17.85, 0.25, 'plumVelvet');
  box('pinkVelvet', 7.55, 7.9, u + 0.06, u + 0.42, 17.75, 18.1); for (const [a, b] of [[7.57, 17.77], [7.88, 17.77], [7.57, 18.08], [7.88, 18.08]]) box('gold', a - 0.01, a + 0.01, u, u + 0.06, b - 0.01, b + 0.01);
  bubbleChandelier(7.7, u + 2.0, 17.9, CEIL_U, 8, 0.5);
  bubbleChandelier(11.0, u + 2.05, 15.3, CEIL_U, 12, 0.6); torus('trim', 0.45, 0.05, 11.0, CEIL_U - 0.02, 15.3);
  bed(13.6, u, 15.3, Math.PI / 2, 2.0, 2.2, { platform: true, head: false, pillow: 'purplePillow' });
  box('whiteGloss', 14.75, 14.93, u + 0.3, u + 1.15, 13.5, 17.1); box('whiteGloss', 14.6, 14.93, u + 0.3, u + 0.55, 13.3, 14.1); box('whiteGloss', 14.6, 14.93, u + 0.3, u + 0.55, 16.5, 17.3);
  for (const [z0, z1] of [[13.15, 14.1], [14.35, 16.25], [16.5, 17.45]]) { const y0 = u + 1.35, y1 = u + 2.5; box('plum', 14.91, 14.93, y0, y0 + 0.03, z0, z1); box('plum', 14.91, 14.93, y1 - 0.03, y1, z0, z1); box('plum', 14.91, 14.93, y0, y1, z0, z0 + 0.03); box('plum', 14.91, 14.93, y0, y1, z1 - 0.03, z1); }
  box('plum', 14.9, 14.94, CEIL_U - 0.35, CEIL_U - 0.3, 13.05, 17.55);
  art(14.9, u + 2.35, 15.5, Math.PI / 2, 1.2, 0.8, 'art1', 'blackPanel'); art(14.9, u + 2.4, 13.7, Math.PI / 2, 0.3, 0.9, 'art2');
  for (const z of [13.7, 16.9]) { cyl('iron', 0.004, 0.004, CEIL_U - u - 1.3, 14.3, u + 1.3, z, 4); sph('mirror', 0.1, 14.3, u + 1.25, z); fixture(14.2, u + 1.2, z, 10, 0xffd39a, 4); }
  dresser(5.52, u, 16.4, -Math.PI / 2, 1.6, 0.85, 0.5); mirrorW(5.3, u + 2.25, 16.4, -Math.PI / 2, 1.2, 0.85, 'whiteGloss');
  { const P = at(10.3, 13.35); P.box('whiteGloss', 0, u + 0.72, 0, 1.2, 0.04, 0.45); P.tilt('whiteGloss', -0.55, u, 0, 0.04, 0.74, 0.4, 0, 0.1); P.tilt('whiteGloss', 0.55, u, 0, 0.04, 0.74, 0.4, 0, -0.25); P.box('whiteGloss', 0, u + 0.76, 0.1, 0.5, 0.14, 0.2); }
  { cyl('whiteGloss', 0.18, 0.06, 0.22, 10.3, u, 13.8, 18); cyl('gold', 0.06, 0.06, 0.06, 10.3, u + 0.22, 13.8, 12); cyl('whiteGloss', 0.06, 0.18, 0.2, 10.3, u + 0.28, 13.8, 18); }
  dresser(12.4, u, 13.32, Math.PI, 1.6, 0.8, 0.5); mirrorW(12.4, u + 2.4, 13.09, Math.PI, 1.2, 0.75, 'whiteGloss');
  // ===== UPSTAIRS HALL
  flushLight(8.0, CEIL_U, 8.2); flushLight(8.0, CEIL_U, 11.6); flushLight(5.6, CEIL_U, 6.2);
  for (const [x, z] of [[7.0, 7.2], [9.0, 9.8], [7.0, 12.4]]) potLight(x, CEIL_U, z, false);
  art(9.53, u + 2.0, 9.4, Math.PI / 2, 0.55, 0.7, 'art2', 'gold');
  { const P = at(9.35, 10.6, Math.PI / 2); P.box('whiteGloss', 0, u, 0, 1.0, 0.8, 0.4, true); }

  // ===================================================== BASEMENT (from the sketch)
  const b = L_B;
  // ===== BAR (small east-west galley behind the wall next to the stairs; opens to the rec room past a rail + columns)
  cabRun(0.7, 3.75, 10.1, 10.65, b, 'graniteDark', 'walnut'); cabFront(0.7, 3.75, 10.1, 10.65, b + 0.1, 0.78, 'n', 'walnut', 'chrome');
  for (const h of [1.45, 1.85]) box('cabEspresso', 0.9, 3.6, b + h, b + h + 0.04, 10.1, 10.4);
  box('walnut', 0.95, 3.1, b, b + 1.0, 11.25, 11.7, true); box('graniteDark', 0.9, 3.15, b + 1.0, b + 1.05, 11.2, 11.75); box('graniteDark', 0.9, 3.15, b + 1.1, b + 1.14, 11.6, 11.9); box('walnut', 0.95, 3.1, b + 1.05, b + 1.1, 11.65, 11.75);
  for (let i = 0; i < 3; i++) box('cabEspresso', 0.95, 3.1, b + 0.25 + i * 0.3, b + 0.26 + i * 0.3, 11.7, 11.71);
  box('steel', 1.3, 1.9, b + 0.1, b + 0.85, 11.22, 11.25); box('blackGloss', 2.1, 2.7, b + 0.1, b + 0.85, 11.22, 11.25);
  box('walnut', 0.15, 0.6, b, CEIL_B, 10.15, 11.9, true);
  for (let i = 0; i < 9; i++) box('cabEspresso', 0.58, 0.61, b + 0.15 + i * 0.25, b + 0.17 + i * 0.25, 10.2, 11.85);
  for (let j = 0; j < 7; j++) box('cabEspresso', 0.58, 0.61, b + 0.15, b + 2.2, 10.2 + j * 0.25, 10.22 + j * 0.25);
  for (const x of [1.3, 2.9]) potLight(x, CEIL_B, 11.0, true);
  // rail + curved walnut columns between the bar and the rec room
  for (const [x0, x1] of [[0.15, 0.6], [3.45, 3.85]]) { box('walnut', x0, x1, b, b + 0.95, 12.33, 12.47, true); box('graniteDark', x0 - 0.02, x1 + 0.02, b + 0.95, b + 1.0, 12.3, 12.5); }
  for (const x of [0.85, 3.2]) { cyl('walnut', 0.24, 0.24, CEIL_B - b, x, b, 12.4, 24); for (let i = 0; i < 3; i++) cyl('cabEspresso', 0.32, 0.32, 0.03, x, b + 1.0 + i * 0.45, 12.4, 24); col(x - 0.24, x + 0.24, b, CEIL_B, 12.16, 12.64); }
  // ===== REC ROOM / THEATRE (back, walk-out)
  box('walnut', 0.15, 0.62, b, b + 0.55, 13.2, 17.2, true);
  box('walnut', 0.15, 0.3, b, CEIL_B, 13.2, 13.55); box('walnut', 0.15, 0.3, b, CEIL_B, 16.85, 17.2);
  for (const z of [13.37, 17.02]) box('black', 0.3, 0.32, b + 0.6, b + 2.2, z - 0.13, z + 0.13);
  box('walnut', 0.15, 0.2, b + 0.55, CEIL_B, 13.55, 16.85); for (let i = 0; i < 6; i++) box('cabEspresso', 0.2, 0.21, b + 0.6 + i * 0.38, b + 0.62 + i * 0.38, 13.55, 16.85);
  box('black', 0.21, 0.28, b + 0.75, b + 2.2, 13.75, 16.65); box('glowScreen', 0.28, 0.29, b + 0.8, b + 2.15, 13.8, 16.6);
  for (const z of [14.3, 15.7]) box('black', 0.62, 0.63, b + 0.12, b + 0.45, z - 0.5, z + 0.5);
  { box('black', 5.4, 5.75, CEIL_B - 0.25, CEIL_B - 0.08, 15.0, 15.4); cyl('black', 0.02, 0.02, 0.1, 5.57, CEIL_B - 0.1, 15.2, 6); cyl('screenOff', 0.06, 0.06, 0.04, 5.38, CEIL_B - 0.2, 15.2, 12); }
  rug(RUG.swirl, 2.2, 2.4, 2.9, b, 15.2);
  sofa(4.3, b, 15.2, Math.PI / 2, 2.3, 'creamLeather', 0.95);
  sofa(2.9, b, 16.95, 0, 2.0, 'creamLeather', 0.95);
  { const P = at(2.9, 15.2, Math.PI / 2); P.box('darkWood', 0, b + 0.42, 0, 1.0, 0.04, 0.6); P.box('wicker', 0, b, 0, 0.95, 0.42, 0.55); P.col(0, 0, 1.0, 0.6, 0, 0.46); }
  boucleChair(1.45, b, 14.6, -Math.PI / 2 + 0.3); boucleChair(1.45, b, 15.8, -Math.PI / 2 - 0.3);
  rug(RUG.bath, 1.6, 0.8, 7.7, b, 18.1);
  { box('iron', 7.2, 8.2, CEIL_B - 0.04, CEIL_B - 0.01, 17.4, 17.44); for (const x of [7.3, 7.7, 8.1]) { cyl('iron', 0.004, 0.004, 0.5, x, CEIL_B - 0.5, 17.42, 4); cyl('shade', 0.03, 0.09, 0.12, x, CEIL_B - 0.62, 17.42, 12, false, true); fixture(x, CEIL_B - 0.7, 17.42, 14, 0xffe0b0, 5); } }
  { cyl('iron', 0.03, 0.25, 0.04, 9.4, b, 14.4, 16); cyl('iron', 0.04, 0.04, 0.72, 9.4, b, 14.4, 8); cyl('whiteGloss', 0.5, 0.5, 0.04, 9.4, b + 0.72, 14.4, 24); col(8.9, 9.9, b, b + 0.76, 13.9, 14.9); }
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.6; slatChair(9.4 + 0.72 * Math.cos(a), b, 14.4 + 0.72 * Math.sin(a), Math.atan2(Math.cos(a), Math.sin(a))); }
  bowlLight(9.4, CEIL_B, 14.4);
  for (const [x, z] of [[2.5, 13.2], [5.0, 16.6], [7.2, 13.8], [9.8, 16.6], [3.0, 17.0]]) potLight(x, CEIL_B, z, x > 4 && x < 9);
  // ===== BASEMENT BEDROOM / OFFICE (back-east, open to the rec room)
  box('walnut', 11.6, 14.9, b + 0.72, b + 0.76, 16.95, 17.5, true); box('walnut', 14.4, 14.95, b + 0.72, b + 0.76, 14.6, 17.5, true);
  { const g = new THREE.CylinderGeometry(0.45, 0.45, 0.04, 24, 1, false, Math.PI, Math.PI); g.translate(11.65, b + 0.74, 16.95); push('walnut', g); cyl('iron', 0.02, 0.02, 0.72, 11.8, b, 16.75, 8); }
  for (const h of [1.3, 1.75]) box('cabEspresso', 14.55, 14.95, b + h, b + h + 0.04, 12.0, 14.4);
  { const P = at(13.2, 16.4, Math.PI); P.cyl('black', 0, b, 0, 0.3, 0.3, 0.03, 5); P.cyl('chrome', 0, b + 0.03, 0, 0.03, 0.03, 0.42, 8); P.box('black', 0, b + 0.45, 0, 0.5, 0.08, 0.5); P.tilt('walnut', 0, b + 0.55, 0.25, 0.5, 0.6, 0.05, -0.15, 0); }
  tableLamp(12.0, b + 0.76, 17.25, 'shade', 'iron');
  bed(13.95, b, 12.2, Math.PI / 2, 1.45, 2.0, { platform: true, head: false, duvet: 'greyFabric' });
  rug(RUG.stripe, 1.8, 2.4, 13.1, b, 14.8);
  box('cabEspresso', 11.3, 11.8, b, CEIL_B, 11.2, 12.8, true);
  for (const [x, z] of [[13.2, 12.4], [13.2, 15.6]]) flushLight(x, CEIL_B, z);
  // ===== GYM (front)
  box('mirror', 7.2, 11.8, b + 0.1, b + 2.2, 1.71, 1.72); box('walnut', 7.1, 7.2, b, CEIL_B, 1.7, 1.8); box('walnut', 11.8, 11.9, b, CEIL_B, 1.7, 1.8);
  { const P = at(10.9, 3.3); P.box('rubber', 0, b, 0, 0.8, 0.22, 1.9, true); P.box('black', 0, b + 0.22, 0, 0.6, 0.01, 1.6); for (const s of [-1, 1]) P.tilt('steel', s * 0.35, b + 0.2, -0.75, 0.06, 1.1, 0.06, -0.2, 0); P.box('black', 0, b + 1.25, -0.95, 0.85, 0.3, 0.12); P.box('glowScreen', 0, b + 1.3, -0.89, 0.6, 0.18, 0.01); }
  { const P = at(7.6, 3.6, Math.PI / 2); P.box('redMetal', 0, b, 0, 1.4, 0.06, 0.12); P.box('black', 0.55, b, 0, 0.2, 2.05, 0.2, true); P.box('redMetal', 0.15, b + 2.0, 0, 1.0, 0.08, 0.1); P.box('black', -0.2, b + 0.5, 0, 0.6, 0.08, 0.3); P.tilt('black', -0.1, b + 0.6, 0, 0.08, 0.7, 0.3, 0, 0.1); P.box('black', -0.35, b + 0.35, 0, 0.1, 0.1, 0.5); }
  { cyl('iron', 0.006, 0.006, 0.4, 12.0, CEIL_B - 0.4, 5.8, 4); cyl('yellowBag', 0.17, 0.17, 1.0, 12.0, b + 1.0, 5.8, 16); sph('redMetal', 0.3, 11.4, b + 0.3, 5.9, 1, 1, 1, 16); }
  { box('gymMat', 8.8, 9.8, b, b + 0.01, 2.3, 3.9); for (let i = 0; i < 4; i++) cyl('black', 0.04, 0.04, 0.2, 12.3, b + 0.1 + i * 0.12, 3.2 + i * 0.05, 8); }
  tv(6.6, b + 1.6, 4.6, -Math.PI / 2, 1.0);
  for (const [x, z] of [[8, 2.8], [11, 2.8], [8, 5.4], [11, 5.4]]) potLight(x, CEIL_B, z, true);
  // ===== BASEMENT BATH
  vanity(10.0, 11.1, 8.4, 8.75, b, 'walnut', 'cream', [[10.55, 8.58]], true);
  box('mirror', 10.0, 11.1, b + 1.1, b + 2.2, 8.71, 8.72); box('walnut', 11.1, 11.25, b, CEIL_B, 8.4, 8.75);
  toilet(11.7, b, 8.45, 0);
  box('tileSlate', 13.6, 14.93, b, b + 0.02, 6.5, 8.7); box('tileSlate', 14.9, 14.93, b, CEIL_B, 6.5, 8.7); box('tileSlate', 13.6, 14.93, b, CEIL_B, 6.5, 6.53);
  showerGlass(13.58, 13.6, 6.5, 8.7, b, 2.2);
  cyl('chrome', 0.12, 0.12, 0.02, 14.25, CEIL_B - 0.3, 7.6, 16);
  sconce(10.55, b + 1.95, 8.7, Math.PI, false); potLight(11.4, CEIL_B, 7.4, true);
  // ===== CORRIDOR (gym -> rec room, stairs on the left)
  box('walnut', 9.37, 9.73, b, CEIL_B - 0.1, 10.6, 12.2, true); box('cabEspresso', 9.36, 9.37, b + 1.6, b + 1.62, 10.6, 12.2); box('cabEspresso', 9.36, 9.37, b, CEIL_B - 0.1, 11.39, 11.41);
  rug(RUG.geo, 0.9, 2.2, 8.8, b, 8.8);
  for (const [x, z] of [[8.8, 7.2], [8.8, 10.0], [8.8, 12.4]]) potLight(x, CEIL_B, z, true);
}
