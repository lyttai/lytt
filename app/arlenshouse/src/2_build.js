
// ===========================================================================
// Walls with openings (doors / windows / arches) in a local wall frame:
//   u = along the wall (0..L), v = world up, w = across (+w is the "+" side)
//   For a wall drawn west→east the "+" side is north; drawn south→north it is west.
// ===========================================================================
const doors = [], doorMeshes = [];
function wallBasis(ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
  const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(ux, 0, uz), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-uz, 0, ux));
  m.setPosition(ax, 0, az);
  return { m, L, ux, uz, nx: -uz, nz: ux, ax, az, alongX: Math.abs(uz) < 1e-6 };
}
function lgeo(W, g, m) { g.applyMatrix4(W.m); push(m, g); return g; }
function lbox(W, m, a0, a1, b0, b1, w0, w1, solid = false) {
  if (a1 - a0 < 1e-4 || b1 - b0 < 1e-4 || w1 - w0 < 1e-4) return;
  const g = new THREE.BoxGeometry(a1 - a0, b1 - b0, w1 - w0);
  g.translate((a0 + a1) / 2, (b0 + b1) / 2, (w0 + w1) / 2); g.applyMatrix4(W.m);
  if (m) push(m, g);
  if (solid) { g.computeBoundingBox(); const b = g.boundingBox; return col(b.min.x, b.max.x, b.min.y, b.max.y, b.min.z, b.max.z); }
}
function lcol(W, a0, a1, b0, b1, w0, w1) { return lbox(W, null, a0, a1, b0, b1, w0, w1, true); }
// rotated box inside the wall plane (for arch frames / sunbursts)
function lrot(W, m, cu, cv, cw, len, hh, dd, ang) {
  const g = new THREE.BoxGeometry(len, hh, dd); g.rotateZ(ang); g.translate(cu, cv, cw); g.applyMatrix4(W.m); push(m, g);
}
function splitRect(L, y0, y1, holes) {
  const xs = new Set([0, L]);
  for (const h of holes) { xs.add(Math.max(0, Math.min(L, h.a0))); xs.add(Math.max(0, Math.min(L, h.a1))); }
  const s = [...xs].sort((a, b) => a - b), out = [];
  for (let i = 0; i < s.length - 1; i++) {
    const a = s[i], b = s[i + 1]; if (b - a < 1e-5) continue;
    const mid = (a + b) / 2;
    const cov = holes.filter(h => h.a0 < mid && h.a1 > mid).map(h => [Math.max(y0, h.y0), Math.min(y1, h.y1)]).filter(q => q[1] > q[0]).sort((p, q) => p[0] - q[0]);
    let y = y0;
    for (const [p, q] of cov) { if (p > y) out.push([a, b, y, p]); y = Math.max(y, q); }
    if (y < y1) out.push([a, b, y, y1]);
  }
  const merged = [], last = new Map();
  for (const p of out) {
    const k = p[2].toFixed(4) + '|' + p[3].toFixed(4), l = last.get(k);
    if (l && Math.abs(l[1] - p[0]) < 1e-6) l[1] = p[1]; else { merged.push(p); last.set(k, p); }
  }
  return merged;
}
// openings are given in absolute world coords along the wall's axis
function normOps(W, ops) {
  return (ops || []).map(op => {
    const o = Object.assign({}, op);
    const base = W.alongX ? W.ax : W.az, sgn = W.alongX ? Math.sign(W.ux) : Math.sign(W.uz);
    if (op.at) { const p = (op.at[0] - base) * sgn, q = (op.at[1] - base) * sgn; o.a0 = Math.min(p, q); o.a1 = Math.max(p, q); }
    if (o.k === 'door' || o.k === 'open') { o.y1 = o.y0 + (o.h ?? 2.1); }
    return o;
  });
}

function wall(ax, az, bx, bz, y0, y1, o = {}) {
  const W = wallBasis(ax, az, bx, bz), t = o.t ?? 0.14, core = o.core ?? 'wall';
  const ops = normOps(W, o.ops);
  const holes = ops.map(op => ({ a0: op.a0, a1: op.a1, y0: op.y0, y1: op.y1 + (op.rise || 0) }));
  const pieces = splitRect(W.L, y0, y1, holes);
  for (const p of pieces) lbox(W, core, p[0], p[1], p[2], p[3], -t / 2, t / 2, o.solid !== false);
  for (const s of (o.skins || [])) {
    const w0 = s.side > 0 ? t / 2 : -t / 2 - 0.006, sa0 = s.a0 ?? 0, sa1 = s.a1 ?? W.L, sy0 = s.y0 ?? y0, sy1 = s.y1 ?? y1;
    const ab = s.at ? normOps(W, [{ at: s.at }])[0] : null;
    const A0 = ab ? ab.a0 : sa0, A1 = ab ? ab.a1 : sa1;
    for (const p of pieces) {
      const a0 = Math.max(p[0], A0), a1 = Math.min(p[1], A1), b0 = Math.max(p[2], sy0), b1 = Math.min(p[3], sy1);
      if (a1 > a0 && b1 > b0) lbox(W, s.mat, a0, a1, b0, b1, w0, w0 + 0.006);
    }
  }
  let ew0 = -t / 2, ew1 = t / 2;
  if (o.ext) {
    const sd = o.ext.side, et = o.ext.t ?? 0.1, w0 = sd > 0 ? t / 2 : -t / 2 - et;
    const ep = splitRect(W.L, o.ext.y0 ?? y0, o.ext.y1 ?? y1, holes);
    for (const p of ep) lbox(W, o.ext.mat, p[0], p[1], p[2], p[3], w0, w0 + et);
    if (sd > 0) ew1 = t / 2 + et; else ew0 = -t / 2 - et;
  }
  // baseboards
  if (o.base !== false) {
    const floors = o.floors || [y0];
    const sides = o.ext ? [-o.ext.side] : (o.baseSides || [-1, 1]);
    for (const fe of floors) {
      const f = fe.y ?? fe, fs = fe.sides ?? sides;
      const band = holes.filter(h => h.y0 < f + 0.12 && h.y1 > f);
      const segs = splitRect(W.L, f, f + 0.12, band).filter(p => p[2] <= f + 1e-4 && p[3] >= f + 0.11);
      for (const p of segs) for (const sd of fs) {
        const w0 = sd > 0 ? t / 2 + (o.skins?.some(s => s.side > 0) ? 0.006 : 0) : -t / 2 - 0.014 - (o.skins?.some(s => s.side < 0) ? 0.006 : 0);
        lbox(W, 'trim', p[0], p[1], f, f + 0.12, w0, w0 + 0.014);
      }
    }
  }
  for (const op of ops) buildOpening(W, op, t, ew0, ew1, o);
  return W;
}

function archCorners(W, a0, a1, ys, rise, w0, w1, m) {
  const w = a1 - a0, R = rise + 0.02, seg = 16;
  const L = new THREE.Shape(); L.moveTo(0, 0); L.lineTo(0, R); L.lineTo(w / 2, R);
  for (let i = 0; i <= seg; i++) { const ph = Math.PI / 2 + i / seg * Math.PI / 2; L.lineTo(w / 2 + w / 2 * Math.cos(ph), rise * Math.sin(ph)); }
  const Rr = new THREE.Shape(); Rr.moveTo(w / 2, R); Rr.lineTo(w, R); Rr.lineTo(w, 0);
  for (let i = 0; i <= seg; i++) { const ph = i / seg * Math.PI / 2; Rr.lineTo(w / 2 + w / 2 * Math.cos(ph), rise * Math.sin(ph)); }
  for (const s of [L, Rr]) { const g = shapeGeo(s, w1 - w0); g.translate(a0, ys, w0); lgeo(W, g, m); }
}
function archRing(W, m, a0, a1, ys, rise, cw, dd, thick = 0.06) {
  const w = a1 - a0, n = 14;
  for (let i = 0; i < n; i++) {
    const p0 = Math.PI * i / n, p1 = Math.PI * (i + 1) / n;
    const u0 = a0 + w / 2 + (w / 2 - thick / 2) * Math.cos(p0), v0 = ys + (rise - thick / 2) * Math.sin(p0);
    const u1 = a0 + w / 2 + (w / 2 - thick / 2) * Math.cos(p1), v1 = ys + (rise - thick / 2) * Math.sin(p1);
    lrot(W, m, (u0 + u1) / 2, (v0 + v1) / 2, cw, Math.hypot(u1 - u0, v1 - v0) + 0.01, thick, dd, Math.atan2(v1 - v0, u1 - u0));
  }
}

function buildOpening(W, op, t, ew0, ew1, o) {
  const { a0, a1, y0, y1 } = op, rise = op.rise || 0, w = a1 - a0, inner = o.ext ? -o.ext.side : 0;
  if (op.k === 'win') {
    const fd = 0.06;
    // lining
    lbox(W, 'trim', a0, a0 + fd, y0, y1, ew0, ew1); lbox(W, 'trim', a1 - fd, a1, y0, y1, ew0, ew1);
    lbox(W, 'trim', a0, a1, y0, y0 + fd, ew0, ew1);
    if (!rise) lbox(W, 'trim', a0, a1, y1 - fd, y1, ew0, ew1);
    else {
      lbox(W, 'trim', a0, a1, y1 - 0.025, y1 + 0.025, -0.04, 0.04);
      archCorners(W, a0, a1, y1, rise, -t / 2, t / 2, o.core ?? 'wall');
      if (o.ext) archCorners(W, a0, a1, y1, rise, o.ext.side > 0 ? t / 2 : -t / 2 - (o.ext.t ?? 0.1), o.ext.side > 0 ? t / 2 + (o.ext.t ?? 0.1) : -t / 2, o.ext.mat);
      archRing(W, 'trim', a0, a1, y1, rise, 0, Math.min(0.2, ew1 - ew0), 0.06);
      const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(w, 0); s.absellipse(w / 2, 0, w / 2, rise, 0, Math.PI, false);
      const g = shapeGeo(s, 0.01); g.translate(a0, y1, -0.005); lgeo(W, g, 'glass');
      for (const ang of [Math.PI / 3, Math.PI / 2, 2 * Math.PI / 3]) {
        const ex = w / 2 * Math.cos(ang), ey = rise * Math.sin(ang), len = Math.hypot(ex, ey);
        lrot(W, 'trim', a0 + w / 2 + ex / 2, y1 + ey / 2, 0, len, 0.025, 0.03, Math.atan2(ey, ex));
      }
      if (o.ext) { const sw = o.ext.side > 0 ? ew1 + 0.02 : ew0 - 0.02; archRing(W, 'stone', a0 - 0.06, a1 + 0.06, y1, rise + 0.06, sw, 0.05, 0.16); }
    }
    lbox(W, 'glass', a0 + fd, a1 - fd, y0 + fd, y1 - (rise ? 0 : fd), -0.005, 0.005);
    const [gc, gr] = op.grid || [1, 1];
    for (let i = 1; i < gc; i++) { const u = a0 + w * i / gc; lbox(W, 'trim', u - 0.015, u + 0.015, y0, y1, -0.025, 0.025); }
    for (let j = 1; j < gr; j++) { const v = y0 + (y1 - y0) * j / gr; lbox(W, 'trim', a0, a1, v - 0.015, v + 0.015, -0.025, 0.025); }
    // interior sill & exterior sill/header
    const iw = inner > 0 ? [t / 2, t / 2 + 0.05] : inner < 0 ? [-t / 2 - 0.05, -t / 2] : null;
    if (iw && y0 > -2.95 && op.sill !== false) lbox(W, 'trim', a0 - 0.05, a1 + 0.05, y0 - 0.03, y0, iw[0], iw[1]);
    if (o.ext) {
      const sw = o.ext.side > 0 ? [ew1, ew1 + 0.06] : [ew0 - 0.06, ew0];
      lbox(W, 'stone', a0 - 0.08, a1 + 0.08, y0 - 0.09, y0, sw[0], sw[1]);
      if (!rise) lbox(W, 'stone', a0 - 0.1, a1 + 0.1, y1, y1 + 0.16, sw[0] + (o.ext.side > 0 ? -0.04 : 0.02), sw[1] + (o.ext.side > 0 ? -0.02 : 0.04));
    }
    lcol(W, a0, a1, y0, y1 + rise, ew0, ew1);
    if (op.curtain) curtainsFor(W, op, inner > 0 ? t / 2 + 0.12 : -t / 2 - 0.12);
    if (op.blinds) blindsFor(W, op, inner > 0 ? t / 2 + 0.03 : -t / 2 - 0.03);
  } else if (op.k === 'oval') {
    const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(w, 0); s.lineTo(w, y1 - y0); s.lineTo(0, y1 - y0); s.lineTo(0, 0);
    const hole = new THREE.Path(); hole.absellipse(w / 2, (y1 - y0) / 2, w / 2 - 0.04, (y1 - y0) / 2 - 0.04, 0, Math.PI * 2, true); s.holes.push(hole);
    const g = shapeGeo(s, t); g.translate(a0, y0, -t / 2); lgeo(W, g, o.core ?? 'wall');
    if (o.ext) { const g2 = shapeGeo(s, ew1 - ew0 - t); g2.translate(a0, y0, o.ext.side > 0 ? t / 2 : ew0); lgeo(W, g2, o.ext.mat); }
    const e = new THREE.Shape(); e.absellipse(w / 2, (y1 - y0) / 2, w / 2 - 0.04, (y1 - y0) / 2 - 0.04, 0, Math.PI * 2, false);
    const ge = shapeGeo(e, 0.01); ge.translate(a0, y0, -0.005); lgeo(W, ge, 'glass');
    const n = 20;
    for (let i = 0; i < n; i++) {
      const p0 = i / n * Math.PI * 2, p1 = (i + 1) / n * Math.PI * 2, rx = w / 2 - 0.04, ry = (y1 - y0) / 2 - 0.04;
      const u0 = a0 + w / 2 + rx * Math.cos(p0), v0 = y0 + (y1 - y0) / 2 + ry * Math.sin(p0), u1 = a0 + w / 2 + rx * Math.cos(p1), v1 = y0 + (y1 - y0) / 2 + ry * Math.sin(p1);
      lrot(W, 'trim', (u0 + u1) / 2, (v0 + v1) / 2, 0, Math.hypot(u1 - u0, v1 - v0) + 0.01, 0.06, ew1 - ew0 + 0.02, Math.atan2(v1 - v0, u1 - u0));
      if (o.ext) lrot(W, 'stone', (u0 + u1) / 2 * 1, (v0 + v1) / 2, o.ext.side > 0 ? ew1 + 0.02 : ew0 - 0.02, Math.hypot(u1 - u0, v1 - v0) + 0.02, 0.18, 0.05, Math.atan2(v1 - v0, u1 - u0));
    }
    lbox(W, 'trim', a0 + w / 2 - 0.015, a0 + w / 2 + 0.015, y0, y1, -0.02, 0.02);
    lbox(W, 'trim', a0, a1, (y0 + y1) / 2 - 0.015, (y0 + y1) / 2 + 0.015, -0.02, 0.02);
    lcol(W, a0, a1, y0, y1, ew0, ew1);
  } else if (op.k === 'arch' || op.k === 'open') {
    if (op.k === 'arch' && rise) {
      archCorners(W, a0, a1, y1, rise, -t / 2, t / 2, o.core ?? 'wall');
      // soffit of the arch
      const n = 14;
      for (let i = 0; i < n; i++) {
        const p0 = Math.PI * i / n, p1 = Math.PI * (i + 1) / n;
        const u0 = a0 + w / 2 + w / 2 * Math.cos(p0), v0 = y1 + rise * Math.sin(p0), u1 = a0 + w / 2 + w / 2 * Math.cos(p1), v1 = y1 + rise * Math.sin(p1);
        lrot(W, 'wall', (u0 + u1) / 2, (v0 + v1) / 2, 0, Math.hypot(u1 - u0, v1 - v0) + 0.02, 0.02, t + 0.004, Math.atan2(v1 - v0, u1 - u0));
      }
    } else if (op.k === 'open' && op.cased !== false) {
      const c = 0.07, f = (o.ext ? [ew0, ew1] : [-t / 2, t / 2]);
      for (const sd of [-1, 1]) {
        const ww = sd > 0 ? [f[1], f[1] + 0.016] : [f[0] - 0.016, f[0]];
        lbox(W, 'trim', a0 - c, a0, y0, y1 + c, ww[0], ww[1]); lbox(W, 'trim', a1, a1 + c, y0, y1 + c, ww[0], ww[1]);
        lbox(W, 'trim', a0 - c, a1 + c, y1, y1 + c, ww[0], ww[1]);
      }
    }
    if (op.k === 'open') {
      lbox(W, 'trim', a0, a0 + 0.015, y0, y1, -t / 2, t / 2); lbox(W, 'trim', a1 - 0.015, a1, y0, y1, -t / 2, t / 2);
      lbox(W, 'trim', a0, a1, y1 - 0.015, y1, -t / 2, t / 2);
    }
  } else if (op.k === 'door') {
    const c = 0.075, f = (o.ext ? [ew0, ew1] : [-t / 2, t / 2]);
    for (const sd of [-1, 1]) {
      if (o.ext && sd === o.ext.side) continue;
      const ww = sd > 0 ? [f[1], f[1] + 0.016] : [f[0] - 0.016, f[0]];
      lbox(W, 'trim', a0 - c, a0, y0, y1 + c, ww[0], ww[1]); lbox(W, 'trim', a1, a1 + c, y0, y1 + c, ww[0], ww[1]);
      lbox(W, 'trim', a0 - c, a1 + c, y1, y1 + c, ww[0], ww[1]);
    }
    lbox(W, 'trim', a0, a0 + 0.02, y0, y1, f[0], f[1]); lbox(W, 'trim', a1 - 0.02, a1, y0, y1, f[0], f[1]);
    lbox(W, 'trim', a0, a1, y1 - 0.02, y1, f[0], f[1]);
    if (o.ext) { const sw = o.ext.side > 0 ? [ew1, ew1 + 0.05] : [ew0 - 0.05, ew0]; lbox(W, 'stone', a0 - 0.1, a1 + 0.1, y1, y1 + 0.18, sw[0], sw[1]); }
    makeDoor(W, op, t);
  }
}

// ------------------------------------------------------------------ doors
function leafGeometry(lw, h, style) {
  const parts = { body: [], glass: [] }, T = 0.042;
  const B = (arr, w, hh, d, x, y, z) => { const g = new THREE.BoxGeometry(w, hh, d); g.translate(x, y, z); arr.push(g); };
  if (style === 'panel' || style === 'closet') {
    B(parts.body, lw, h, T, lw / 2, h / 2, 0);
    const cols = lw > 0.55 ? 2 : 1, rows = 3, mx = 0.1, my = 0.12, gap = 0.08;
    const pw = (lw - 2 * mx - (cols - 1) * gap) / cols, hs = [0.38, 0.22, 0.4];
    let y = my;
    for (let r = 0; r < rows; r++) {
      const ph = (h - 2 * my - (rows - 1) * gap) * hs[r];
      for (let c = 0; c < cols; c++) for (const z of [T / 2 + 0.004, -T / 2 - 0.004]) B(parts.body, pw, ph, 0.008, mx + c * (pw + gap) + pw / 2, y + ph / 2, z);
      y += ph + gap;
    }
  } else { // glass / french / leaded / front
    const st = 0.11, rb = style === 'front' ? 0.9 : 0.22, top = 0.14;
    B(parts.body, st, h, T, st / 2, h / 2, 0); B(parts.body, st, h, T, lw - st / 2, h / 2, 0);
    B(parts.body, lw, rb, T, lw / 2, rb / 2, 0); B(parts.body, lw, top, T, lw / 2, h - top / 2, 0);
    if (style === 'front') { for (const z of [T / 2 + 0.004, -T / 2 - 0.004]) { B(parts.body, lw - 0.3, 0.6, 0.008, lw / 2, 0.45, z); } B(parts.body, lw, 0.08, T, lw / 2, h * 0.5, 0); }
    const g0 = style === 'front' ? h * 0.5 + 0.04 : rb, g1 = h - top;
    B(parts.glass, lw - 2 * st, g1 - g0, 0.012, lw / 2, (g0 + g1) / 2, 0);
    if (style === 'french') { for (let i = 1; i < 5; i++) B(parts.body, lw - 2 * st, 0.025, 0.03, lw / 2, g0 + (g1 - g0) * i / 5, 0); B(parts.body, 0.025, g1 - g0, 0.03, lw / 2, (g0 + g1) / 2, 0); }
    if (style === 'front') { const cx = lw / 2, cy = (g0 + g1) / 2; for (const [dx, dy, a] of [[0, 0.25, 0.8], [0, -0.25, -0.8], [0.12, 0, 0.8], [-0.12, 0, -0.8]]) { const g = new THREE.BoxGeometry(0.3, 0.012, 0.016); g.rotateZ(a); g.translate(cx + dx, cy + dy, 0); parts.body.push(g); } }
  }
  return parts;
}
function makeDoor(W, op, t) {
  const width = op.a1 - op.a0, h = op.y1 - op.y0 - 0.01, style = op.style || 'panel', theta = op.maxAngle ?? 1.62;
  const leaves = op.double ? [[op.a0, 1, width / 2], [op.a1, -1, width / 2]] : [[op.hinge === 'a1' ? op.a1 : op.a0, op.hinge === 'a1' ? -1 : 1, width]];
  const swing = op.swing ?? 1;
  const D = { pivots: [], t: op.open ? 1 : 0, target: op.open ? 1 : 0, locked: !!op.locked, name: op.name || 'Door' };
  for (const [aH, dirSign, lw] of leaves) {
    const P = new THREE.Vector3(aH, op.y0 + 0.005, 0).applyMatrix4(W.m);
    const d = new THREE.Vector3(W.ux * dirSign, 0, W.uz * dirSign), n = new THREE.Vector3(W.nx * swing, 0, W.nz * swing);
    const dOpen = d.clone().multiplyScalar(Math.cos(theta)).add(n.clone().multiplyScalar(Math.sin(theta)));
    const phiC = Math.atan2(-d.z, d.x), phiO = Math.atan2(-dOpen.z, dOpen.x);
    let delta = phiO - phiC; while (delta > Math.PI) delta -= 2 * Math.PI; while (delta < -Math.PI) delta += 2 * Math.PI;
    const pivot = new THREE.Group(); pivot.position.copy(P);
    const parts = leafGeometry(lw - 0.008, h, style);
    const bodyMat = M[op.mat || (style === 'closet' ? 'whiteMatte' : 'frontDoor')];
    const body = new THREE.Mesh(mergeGeometries(parts.body.map(g => normGeo(g))), bodyMat); body.position.x = 0.004; body.castShadow = true; body.receiveShadow = true;
    pivot.add(body);
    if (parts.glass.length) { const gm = new THREE.Mesh(mergeGeometries(parts.glass.map(g => normGeo(g))), M.glass); gm.position.x = 0.004; pivot.add(gm); }
    // handle
    if (style !== 'garage') {
      const hg = new THREE.Group();
      const kn = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.16, 12).rotateX(Math.PI / 2), M[op.handle || 'brass']);
      const lv = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.018, 0.018), M[op.handle || 'brass']);
      lv.position.set(-0.06, 0, 0.075); const lv2 = lv.clone(); lv2.position.z = -0.075;
      hg.add(kn, lv, lv2); hg.position.set(lw - 0.075, op.handleY ?? 0.95, 0); pivot.add(hg);
    }
    body.userData.door = D;
    doorMeshes.push(body);
    world.add(pivot);
    D.pivots.push({ pivot, phiC, delta });
    pivot.rotation.y = phiC + delta * D.t;
  }
  D.col = lcol(W, op.a0, op.a1, op.y0, op.y1, -t / 2 - 0.02, t / 2 + 0.02);
  D.col.on = D.t < 0.5;
  doors.push(D);
  return D;
}

// ------------------------------------------------------------------ floors
function slab(x0, x1, z0, z1, yTop, th = 0.3, under = 'ceiling') { box(under, x0, x1, yTop - th, yTop - 0.02, z0, z1); col(x0, x1, yTop - th, yTop, z0, z1); }
function finish(m, x0, x1, z0, z1, y, lift = 0) { box(m, x0, x1, y - 0.02 + lift, y + lift, z0, z1); }

// ------------------------------------------------------------------ the two staircases
// Not a spiral: one flight goes UP (it starts right in front of the foyer, runs back along
// the west side of the hall and curves right onto the upstairs hall) and a separate flight
// goes DOWN beside it, straight to the basement. Both have open railings, no walls.
const RAMPS = [];
function line(x0, z0, x1, z1, n = 20) { const p = []; for (let i = 0; i <= n; i++) p.push([x0 + (x1 - x0) * i / n, z0 + (z1 - z0) * i / n]); return p; }
function arc(cx, cz, r, t0, t1, n = 24) { const p = []; for (let i = 0; i <= n; i++) { const t = t0 + (t1 - t0) * i / n; p.push([cx + r * Math.cos(t), cz + r * Math.sin(t)]); } return p; }
function makeRamp(pts, w, h0, h1, n, o = {}) {
  const s = [0];
  for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const r = Object.assign({ pts, s, L: s[s.length - 1], w, h0, h1, n }, o); RAMPS.push(r); return r;
}
// position + left normal at distance d along the centreline
function rampAt(r, d) {
  d = Math.max(0, Math.min(r.L, d));
  let i = 1; while (i < r.s.length - 1 && r.s[i] < d) i++;
  const a = r.pts[i - 1], b = r.pts[i], seg = r.s[i] - r.s[i - 1] || 1, t = (d - r.s[i - 1]) / seg;
  const dx = (b[0] - a[0]) / seg, dz = (b[1] - a[1]) / seg;
  return { x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t, nx: -dz, nz: dx };
}
function rampProject(r, x, z) {
  let best = null;
  for (let i = 1; i < r.pts.length; i++) {
    const a = r.pts[i - 1], b = r.pts[i], ex = b[0] - a[0], ez = b[1] - a[1], L2 = ex * ex + ez * ez || 1;
    let t = ((x - a[0]) * ex + (z - a[1]) * ez) / L2; t = Math.max(0, Math.min(1, t));
    const px = a[0] + ex * t, pz = a[1] + ez * t, d = Math.hypot(x - px, z - pz);
    if (!best || d < best.d) best = { d, s: r.s[i - 1] + t * Math.sqrt(L2), endClamp: (i === 1 && t === 0) || (i === r.pts.length - 1 && t === 1) };
  }
  return best;
}
function rampH(r, d) { const lo = Math.min(r.h0, r.h1), hi = Math.max(r.h0, r.h1); return Math.min(hi, Math.max(lo, r.h0 + (r.h1 - r.h0) * d / r.L + (hi - lo) / r.n * 0.5)); }
function stairH(x, z, feet) {
  let best = null;
  for (const r of RAMPS) {
    const q = rampProject(r, x, z);
    if (!q || q.endClamp || q.d > r.w / 2 + 0.03) continue;
    const h = rampH(r, q.s);
    if (h <= feet + 0.43 && (best === null || h > best)) best = h;
  }
  return best;
}
function stepShape(r, d0, d1, inset0, inset1) {
  const s = new THREE.Shape(), n = 4, L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const p = rampAt(r, d0 + (d1 - d0) * i / n);
    L.push([p.x + p.nx * (r.w / 2 - inset0), -(p.z + p.nz * (r.w / 2 - inset0))]);
    R.push([p.x - p.nx * (r.w / 2 - inset1), -(p.z - p.nz * (r.w / 2 - inset1))]);
  }
  s.moveTo(...L[0]); for (const p of L.slice(1)) s.lineTo(...p); for (const p of R.reverse()) s.lineTo(...p); s.lineTo(...L[0]);
  return s;
}
function stepSolid(r, d0, d1, y0, y1, m, inset = 0) { const g = shapeGeo(stepShape(r, d0, d1, inset, inset), y1 - y0); g.rotateX(-Math.PI / 2); g.translate(0, y0, 0); push(m, g); }
function buildFlight(r) {
  const riseAbs = Math.abs(r.h1 - r.h0) / r.n, run = r.L / r.n, base = Math.min(r.h0, r.h1);
  for (let i = 0; i < r.n; i++) {
    const d0 = i * run, d1 = (i + 1) * run;
    const hs = r.h0 + (r.h1 - r.h0) * i / r.n, he = r.h0 + (r.h1 - r.h0) * (i + 1) / r.n, top = Math.max(hs, he);
    stepSolid(r, d0 - 0.005, d1 + 0.005, top - riseAbs - 0.22, top - 0.045, 'wallWarm', 0.02);
    stepSolid(r, d0 - 0.02, d1 + 0.005, top - 0.045, top, 'oak', 0);
    stepSolid(r, d0 - 0.02, d1 + 0.005, top, top + 0.014, 'carpet', 0.22);
    // stringers (curved oak skirts on both sides)
    for (const sd of [-1, 1]) {
      const pa = rampAt(r, d0), pb = rampAt(r, d1);
      beam('oak', [pa.x + sd * pa.nx * (r.w / 2 + 0.02), hs + riseAbs * 0.5 - 0.12, pa.z + sd * pa.nz * (r.w / 2 + 0.02)], [pb.x + sd * pb.nx * (r.w / 2 + 0.02), he + riseAbs * 0.5 - 0.12, pb.z + sd * pb.nz * (r.w / 2 + 0.02)], 0.03, false);
    }
    // open railings (iron balusters + oak handrail) on the sides that are open
    for (const sd of r.rails || [-1, 1]) {
      const pm = rampAt(r, (d0 + d1) / 2), pa = rampAt(r, d0), pb = rampAt(r, d1), off = r.w / 2 - 0.04;
      const x = pm.x + sd * pm.nx * off, z = pm.z + sd * pm.nz * off;
      cyl('iron', 0.011, 0.011, 0.9, x, top, z, 6);
      if (i % 2 === 0) sph('iron', 0.03, x, top + 0.45, z, 1, 1.6, 1, 8);
      beam('oak', [pa.x + sd * pa.nx * off, hs + riseAbs / 2 + 0.93, pa.z + sd * pa.nz * off], [pb.x + sd * pb.nx * off, he + riseAbs / 2 + 0.93, pb.z + sd * pb.nz * off], 0.035, false);
      col(x - 0.07, x + 0.07, top - riseAbs + 0.45, top + 1.0, z - 0.07, z + 0.07);
      const pe = rampAt(r, d1), xe = pe.x + sd * pe.nx * off, ze = pe.z + sd * pe.nz * off;
      col(xe - 0.07, xe + 0.07, top - riseAbs + 0.45, top + 1.0, ze - 0.07, ze + 0.07);
    }
    // you can't walk underneath where there isn't headroom
    if (r.blockUnder) {
      const hb = top - riseAbs - 0.22, room = hb - base;
      if (room > 0.45 && room < 2.0) { const pm = rampAt(r, (d0 + d1) / 2); col(pm.x - r.w / 2 * 0.8, pm.x + r.w / 2 * 0.8, base, hb, pm.z - r.w / 2 * 0.8, pm.z + r.w / 2 * 0.8); }
    }
  }
  // newel posts at the bottom
  const bot = r.h1 < r.h0 ? r.L - 0.05 : 0.05, pb = rampAt(r, bot);
  for (const sd of r.rails || [-1, 1]) { const x = pb.x + sd * pb.nx * (r.w / 2 - 0.04), z = pb.z + sd * pb.nz * (r.w / 2 - 0.04); box('oak', x - 0.07, x + 0.07, base, base + 1.15, z - 0.07, z + 0.07, true); box('oak', x - 0.09, x + 0.09, base + 1.15, base + 1.21, z - 0.09, z + 0.09); }
}
// stair geometry (plan coordinates)
// One curved stairwell against a plain wall. Standing in the hall facing it (west, towards the
// garage hallway) the flight going UP is on the left: you walk straight onto it, it turns right
// through a half circle and you step off facing back east onto the upstairs hall. The flight
// going DOWN is on the right and is its mirror image (turns left), landing you facing east in the
// basement. The up flight passes over the down flight. Rails only.
const UP = makeRamp([...line(6.4, 10.5, 5.4, 10.5, 8), ...arc(5.4, 11.4, 0.9, -Math.PI / 2, -Math.PI * 1.5).slice(1), ...line(5.4, 12.3, 6.4, 12.3, 8).slice(1)], 1.0, L_M, L_U, 18);
const DOWN = makeRamp([...line(6.4, 12.3, 5.4, 12.3, 8), ...arc(5.4, 11.4, 0.9, Math.PI / 2, Math.PI * 1.5).slice(1), ...line(5.4, 10.5, 6.4, 10.5, 8).slice(1)], 1.0, L_M, L_B, 15, { blockUnder: true });
function buildStairs() {
  buildFlight(UP); buildFlight(DOWN);
  // the plain wall behind the stairs (all three floors)
  wall(3.9, 9.9, 3.9, 12.9, L_B, CEIL_U, { core: 'wall', base: false });
  // main floor: rails round the opening (you step on from the hall side)
  railX(3.95, 6.4, 9.93, L_M); railX(3.95, 6.4, 12.87, L_M); railZ(11.02, 11.78, 6.42, L_M);
  // upstairs: rail on the hall side, open where you step off at the top
  railZ(10.0, 11.76, 6.42, L_U);
  wall(3.9, 10.0, 6.4, 10.0, L_U, CEIL_U, { core: 'wall' });
  // basement: the stairs land you facing the corridor
  wall(3.9, 10.0, 6.4, 10.0, L_B, CEIL_B, { core: 'wallWarm', baseSides: [1] });
  // lantern chandelier hanging in the middle of the curve
  const cx = 5.4, cz = 11.4, ly = 3.95;
  cyl('iron', 0.008, 0.008, CEIL_U - ly - 1.1, cx, ly + 1.1, cz, 6);
  for (const [y, r] of [[ly, 0.32], [ly + 1.05, 0.34]]) torus('iron', r, 0.018, cx, y, cz, Math.PI / 2, 6);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; beam('iron', [cx + 0.32 * Math.cos(a), ly, cz + 0.32 * Math.sin(a)], [cx + 0.34 * Math.cos(a), ly + 1.05, cz + 0.34 * Math.sin(a)], 0.012); cone('iron', 0.03, 0.12, cx + 0.34 * Math.cos(a), ly + 1.07, cz + 0.34 * Math.sin(a), 6); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.5; cyl('cream', 0.018, 0.018, 0.2, cx + 0.16 * Math.cos(a), ly + 0.35, cz + 0.16 * Math.sin(a), 8); sph('bulb', 0.022, cx + 0.16 * Math.cos(a), ly + 0.58, cz + 0.16 * Math.sin(a), 1, 1.6, 1, 8); }
  cyl('iron', 0.05, 0.12, 0.08, cx, ly + 0.25, cz, 12);
  fixture(cx, ly + 0.5, cz, 55, 0xffd09a, 9);
  fixture(6.0, -1.0, 11.4, 25, 0xffe3bd, 7);
}
