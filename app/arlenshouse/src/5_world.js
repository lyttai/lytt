
// ===========================================================================
// OUTSIDE — lot, driveway, deck, patio, backyard (night), neighbours, street
// ===========================================================================
function inFootprint(x, z) { return (x > 0 && x < 6.4 && z > 0 && z < 6.0) || (x > 0 && x < 15 && z > 1.6 && z < 17.6) || (x > 6.6 && x < 8.8 && z > 17.6 && z < 18.8); }
function terrainH(x, z) {
  let h;
  if (z < 0) h = -0.55 + z * 0.032;
  else if (z < 9) h = -0.55;
  else if (z < 17) h = -0.55 - 2.5 * (z - 9) / 8;
  else h = -3.05;
  if (z < -11) h = -0.95;
  return h;
}
function buildTerrain() {
  const key = [0, 1.6, 6.0, 6.4, 6.6, 8.8, 15, 17.6, 18.8, 9, 17, -11];
  const xs = new Set(key.filter(v => v !== 9 && v !== 17 && v !== -11)), zs = new Set(key);
  for (let v = -60; v <= 75; v += 1) xs.add(v);
  for (let v = -60; v <= 80; v += 1) zs.add(v);
  const X = [...xs].sort((a, b) => a - b), Z = [...zs].filter(z => z >= -11).sort((a, b) => a - b);
  const pos = [];
  for (let i = 0; i < X.length - 1; i++) for (let j = 0; j < Z.length - 1; j++) {
    const x0 = X[i], x1 = X[i + 1], z0 = Z[j], z1 = Z[j + 1];
    if (inFootprint((x0 + x1) / 2, (z0 + z1) / 2)) continue;
    const p = (x, z) => [x, terrainH(x, z), z];
    pos.push(...p(x0, z0), ...p(x0, z1), ...p(x1, z0), ...p(x1, z0), ...p(x0, z1), ...p(x1, z1));
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  push('grass', g);
  // street, curb, sidewalk
  box('asphalt', -60, 75, -1.0, -0.95, -24, -11.6);
  box('concrete', -60, 75, -0.95, -0.82, -11.6, -11.45);
  box('concrete', -60, 75, -0.95, -0.86, -11.0, -9.6);
  for (let x = -58; x < 75; x += 6) box('trim', x, x + 3, -0.95, -0.948, -17.9, -17.75);
  // driveway (follows the slope)
  stripOnGround('asphalt', -0.3, 6.7, -11.45, 0.0, 0.025);
  // front walk: porch → walkway → driveway
  box('stone', 6.5, 9.5, -0.62, -0.12, 0.05, 1.5, true);
  box('stone', 6.6, 9.4, -0.62, -0.36, -0.42, 0.05, true);
  stripOnGround('pavers', 6.7, 9.3, -2.2, -0.42, 0.03);
  stripOnGround('pavers', 6.7, 7.4, -9.6, -2.2, 0.03);
  railZ(0.1, 1.45, 9.45, -0.12, true, 'iron', 'iron');
  // front planting
  for (let x = 9.9; x < 14.9; x += 0.55) sph('shrub', rr(0.35, 0.5), x, terrainH(x, 0.9) + 0.25, rr(0.8, 1.05), 1, 0.8, 1, 10);
  for (let z = 1.8; z < 8; z += 0.8) sph('shrub', rr(0.3, 0.45), 15.6, terrainH(15.6, z) + 0.2, z, 1, 0.9, 1, 10);
  for (const [x, z, r] of [[16.6, -4.6, 0.65], [18.0, -5.0, 0.45]]) sph('rock', r, x, terrainH(x, z) + r * 0.3, z, 1.3, 0.7, 1, 10);
  sph('shrub', 0.5, -0.8, -0.3, -1.2, 1, 0.9, 1, 10); sph('shrub', 0.55, 9.9, -0.3, 0.5, 1, 1, 1, 10);
  tree(15.9, -0.6, 'poplar', 11); tree(19.5, -5.5, 'maple', 7.5); tree(-1.8, -3.5, 'maple', 5.5);
  tree(-6, -12.5, 'maple', 7); tree(26, -12.5, 'maple', 7);
  // street lamps
  for (const x of [-7, 24]) { cyl('iron', 0.07, 0.09, 4.2, x, -0.86, -10.3, 10); box('iron', x - 0.03, x + 0.03, 3.3, 3.36, -10.3, -9.4); box('lanternGlass', x - 0.12, x + 0.12, 3.05, 3.3, -9.55, -9.25); fixture(x, 2.9, -9.4, 90, 0xffb46a, 20, true); }
  // house lanterns
  for (const [x, y, z] of [[1.95, 2.2, -0.3], [4.45, 2.2, -0.3], [9.75, 1.9, 1.33]]) lantern(x, y, z);
  for (const [x, y, z] of [[6.88, -1.0, 19.05], [8.52, -1.0, 19.05]]) lantern(x, y, z);
  lantern(13.25, 1.6, 17.85);
}
function stripOnGround(m, x0, x1, z0, z1, lift) {
  const pos = [], step = 0.5;
  for (let z = z0; z < z1 - 1e-6; z += step) {
    const za = z, zb = Math.min(z1, z + step), ha = terrainH(0, za) + lift, hb = terrainH(0, zb) + lift;
    pos.push(x0, ha, za, x0, hb, zb, x1, ha, za, x1, ha, za, x0, hb, zb, x1, hb, zb);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); push(m, g);
}
function lantern(x, y, z) {
  box('iron', x - 0.13, x + 0.13, y + 0.42, y + 0.47, z - 0.13, z + 0.13);
  cone('iron', 0.17, 0.16, x, y + 0.47, z, 6);
  box('lanternGlass', x - 0.1, x + 0.1, y, y + 0.42, z - 0.1, z + 0.1);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box('iron', x + a * 0.11 - 0.012, x + a * 0.11 + 0.012, y, y + 0.42, z + b * 0.11 - 0.012, z + b * 0.11 + 0.012);
  box('iron', x - 0.08, x + 0.08, y - 0.05, y, z - 0.08, z + 0.08);
  fixture(x, y + 0.15, z + (z > 15 ? 0.6 : -0.6), 6, 0xffbf73, 9, true);
}
function tree(x, z, kind, h) {
  const y = terrainH(x, z);
  if (kind === 'spruce') {
    cyl('bark', 0.12, 0.18, h * 0.3, x, y, z, 8);
    for (let i = 0; i < 5; i++) { const t = i / 5; cone(i % 2 ? 'leafDark' : 'leaf', (1 - t) * h * 0.22 + 0.3, h * 0.35, x, y + h * 0.15 + t * h * 0.6, z, 10); }
  } else if (kind === 'poplar') {
    cyl('bark', 0.1, 0.16, h * 0.4, x, y, z, 8);
    for (let i = 0; i < 6; i++) sph('leaf', rr(0.7, 0.95), x + rr(-0.25, 0.25), y + h * 0.3 + i * h * 0.11, z + rr(-0.25, 0.25), 0.9, 1.6, 0.9, 10);
  } else {
    cyl('bark', 0.14, 0.22, h * 0.5, x, y, z, 8);
    const m = kind === 'red' ? 'leafRed' : 'leaf';
    for (let i = 0; i < 9; i++) sph(i % 3 ? m : 'leafDark', rr(h * 0.16, h * 0.25), x + rr(-h * 0.22, h * 0.22), y + h * rr(0.55, 0.92), z + rr(-h * 0.22, h * 0.22), 1, 0.8, 1, 10);
  }
  col(x - 0.25, x + 0.25, y, y + 3, z - 0.25, z + 0.25);
}
function buildBackyard() {
  const g = -3.05;
  // deck off the breakfast area (white railings)
  box('deck', 9.0, 13.4, -0.06, 0, 17.6, 20.8, true);
  for (let x = 9.2; x < 13.4; x += 0.4) box('deck', x, x + 0.05, -0.3, -0.06, 17.6, 20.8);
  box('trim', 9.0, 13.4, -0.45, -0.06, 20.65, 20.8);
  for (const x of [9.15, 13.25]) box('trim', x - 0.08, x + 0.08, g, -0.06, 20.6, 20.76, true);
  for (const [x0, x1, z0, z1] of [[9.0, 13.4, 20.72, 20.8], [9.0, 9.08, 17.75, 20.8], [13.32, 13.4, 17.75, 20.8]]) {
    box('trim', x0, x1, 0.92, 1.0, z0, z1); box('trim', x0, x1, 0.05, 0.1, z0, z1); col(x0, x1, 0, 1.0, z0, z1);
    const alongX = x1 - x0 > z1 - z0, L = alongX ? x1 - x0 : z1 - z0;
    for (let s = 0.05; s < L; s += 0.11) { const px = alongX ? x0 + s : (x0 + x1) / 2, pz = alongX ? (z0 + z1) / 2 : z0 + s; box('trim', px - 0.022, px + 0.022, 0.1, 0.92, pz - 0.022, pz + 0.022); }
  }
  // patio under the deck
  box('pavers', 4.4, 14.6, g - 0.1, g + 0.03, 17.6, 22.2, true);
  // wicker sofa, swivel chair, fire-pit table
  { const P = at(11.3, 18.3, Math.PI); P.box('wicker', 0, g, 0, 2.1, 0.45, 0.85, true); P.box('cushion', 0, g + 0.45, -0.05, 1.8, 0.12, 0.7); P.box('wicker', 0, g + 0.45, 0.35, 2.1, 0.5, 0.18); for (const s of [-1, 1]) P.box('wicker', s * 1.0, g + 0.45, 0, 0.16, 0.25, 0.85); for (let i = 0; i < 3; i++) P.tilt('cushion', -0.6 + i * 0.6, g + 0.6, 0.22, 0.55, 0.45, 0.12, -0.2, 0); }
  { const P = at(13.0, 19.2, Math.PI + 0.6); P.cyl('wicker', 0, g, 0, 0.3, 0.35, 0.3, 10); P.box('wicker', 0, g + 0.3, 0, 0.8, 0.2, 0.75); P.box('cushion', 0, g + 0.5, -0.03, 0.62, 0.1, 0.6); P.box('wicker', 0, g + 0.5, 0.3, 0.8, 0.55, 0.15); for (const s of [-1, 1]) P.box('wicker', s * 0.36, g + 0.5, 0, 0.1, 0.25, 0.7); }
  { box('black', 10.8, 11.8, g + 0.38, g + 0.44, 18.95, 19.75, true); for (const [a, b] of [[10.85, 19.0], [11.75, 19.0], [10.85, 19.7], [11.75, 19.7]]) box('black', a - 0.03, a + 0.03, g, g + 0.38, b - 0.03, b + 0.03); cone('iron', 0.38, 0.25, 11.3, g + 0.44, 19.35, 4); }
  // round table + chairs on the patio
  { cyl('whiteGloss', 0.25, 0.3, 0.04, 5.6, g + 0.03, 20.4, 16); cyl('whiteGloss', 0.05, 0.05, 0.7, 5.6, g + 0.03, 20.4, 8); cyl('whiteMatte', 0.55, 0.62, 0.3, 5.6, g + 0.48, 20.4, 24, false, true); cyl('whiteMatte', 0.55, 0.55, 0.02, 5.6, g + 0.76, 20.4, 24); col(5.0, 6.2, g, g + 0.8, 19.8, 21.0); }
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; slatChair(5.6 + 0.8 * Math.cos(a), g + 0.03, 20.4 + 0.8 * Math.sin(a), Math.atan2(Math.cos(a), Math.sin(a))); }
  // rain barrel
  cyl('rubber', 0.32, 0.32, 0.95, 9.55, g, 17.95, 14);
  // playset (swings + fort + green slide)
  { const P = at(3.4, 27.0, 0.15), h = g;
    for (const s of [-1, 1]) { P.tilt('playWood', -2.4 + 0.45 * s, h, 0, 0.1, 2.5, 0.1, 0, s * 0.2); P.tilt('playWood', -2.4, h, 0.45 * s * 0, 0.1, 0.1, 0.1); }
    P.box('playWood', -1.0, h + 2.35, 0, 3.0, 0.12, 0.12);
    for (const s of [-1, 1]) { P.tilt('playWood', -2.4, h, s * 0.45, 0.1, 2.45, 0.1, s * -0.2, 0); }
    for (const sx of [-1.9, -1.3, -0.7]) { for (const s of [-1, 1]) P.box('iron', sx + s * 0.2, h + 0.5, 0, 0.01, 1.85, 0.01); P.box(sx === -1.3 ? 'yellowBag' : 'rubber', sx, h + 0.45, 0, 0.45, 0.04, 0.16); }
    for (const [a, b] of [[0, -0.8], [1.6, -0.8], [0, 0.8], [1.6, 0.8]]) P.box('playWood', a, h, b, 0.12, 2.9, 0.12);
    P.box('playWood', 0.8, h + 1.5, 0, 1.75, 0.08, 1.75);
    for (let i = 0; i < 6; i++) P.box('playWood', 0.8, h + 1.6 + i * 0.12, -0.85, 1.75, 0.08, 0.04);
    P.tilt('playWood', 0.8, h + 2.6, -0.4, 1.9, 0.06, 1.0, 0.5, 0); P.tilt('playWood', 0.8, h + 2.6, 0.4, 1.9, 0.06, 1.0, -0.5, 0);
    P.tilt('slideGreen', 0.8, h + 0.75, 1.85, 0.5, 0.06, 2.3, -0.62, 0);
    for (const s of [-1, 1]) P.tilt('slideGreen', 0.8 + s * 0.25, h + 0.82, 1.85, 0.04, 0.16, 2.3, -0.62, 0);
    for (let i = 0; i < 5; i++) P.tilt('playWood', 2.45, h + 0.3 * i, 0.0, 0.5, 0.04, 0.1, 0, 0);
    P.col(0.8, 0, 2.0, 2.0, h, h + 3); P.col(-1.0, 0, 3.0, 1.0, h, h + 2.5); }
  // fence (black iron) all round the backyard
  ironFence(-2.5, 8.5, -2.5, 34); ironFence(17.5, 8.5, 17.5, 34); ironFence(-2.5, 34, 17.5, 34);
  ironFence(-2.5, 8.5, -0.2, 8.5); ironFence(15.2, 8.5, 17.5, 8.5);
  // trees
  for (const [x, z] of [[-1.2, 32.5], [2.5, 33.0], [6.2, 32.6], [10.2, 33.0], [13.8, 32.5], [16.5, 31.5], [16.6, 28.0]]) tree(x, z, 'spruce', rr(6, 8.5));
  tree(-1.4, 23.5, 'maple', 8); tree(16.0, 23.5, 'red', 6.5);
  // light strip on the deck (fairy lights in the photo)
  for (let x = 9.1; x < 13.4; x += 0.22) sph('bulb', 0.012, x, -0.32 - 0.06 * Math.sin((x - 9.1) / 4.3 * Math.PI), 20.83, 1, 1, 1, 6);
}
function ironFence(x0, z0, x1, z1) {
  const L = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(L / 0.13), ux = (x1 - x0) / L, uz = (z1 - z0) / L;
  for (let i = 0; i <= n; i++) {
    const x = x0 + ux * L * i / n, z = z0 + uz * L * i / n, y = terrainH(x, z), post = i % 15 === 0;
    box('iron', x - (post ? 0.035 : 0.009), x + (post ? 0.035 : 0.009), y, y + (post ? 1.55 : 1.45), z - (post ? 0.035 : 0.009), z + (post ? 0.035 : 0.009));
    if (!post) cone('iron', 0.022, 0.07, x, y + 1.45, z, 4);
  }
  for (let i = 0; i < n; i++) {
    const xa = x0 + ux * L * i / n, za = z0 + uz * L * i / n, xb = x0 + ux * L * (i + 1) / n, zb = z0 + uz * L * (i + 1) / n;
    for (const yy of [0.12, 1.3]) beam('iron', [xa, terrainH(xa, za) + yy, za], [xb, terrainH(xb, zb) + yy, zb], 0.014, false);
  }
  for (let s = 0; s < L; s += 0.5) { const x = x0 + ux * s, z = z0 + uz * s, y = terrainH(x, z); col(x - 0.1, x + 0.1 + ux * 0.5, y - 1, y + 1.6, z - 0.1, z + 0.1 + uz * 0.5); }
}
function neighbour(x0, x1, z0, z1, y, h, litRatio = 0.35) {
  box('neighbour', x0, x1, y, y + h, z0, z1);
  const W = x1 - x0, D = z1 - z0;
  roofFacesNeighbour(x0 - 0.4, x1 + 0.4, z0 - 0.4, z1 + 0.4, y + h, 3.2);
  for (const zf of [z0, z1]) for (let fl = 0; fl < 2; fl++) for (let x = x0 + 1.2; x < x1 - 1; x += 2.2) {
    const yy = y + 1.0 + fl * 3.1, lit = rnd() < litRatio, s = zf === z0 ? -1 : 1;
    box(lit ? 'litWindow' : 'darkWindow', x, x + 1.1, yy, yy + 1.5, zf + s * 0.01, zf + s * 0.03);
    if (lit) fixture(x + 0.55, yy + 0.7, zf + s * 0.8, 8, 0xffc27a, 6, true);
  }
  for (const xf of [x0, x1]) for (let fl = 0; fl < 2; fl++) for (let z = z0 + 2; z < z1 - 1; z += 4) {
    const yy = y + 1.0 + fl * 3.1, s = xf === x0 ? -1 : 1; box(rnd() < litRatio * 0.6 ? 'litWindow' : 'darkWindow', xf + s * 0.01, xf + s * 0.03, yy, yy + 1.4, z, z + 1.0);
  }
  col(x0, x1, y - 2, y + h, z0, z1);
}
function roofFacesNeighbour(X0, X1, Z0, Z1, y, h) {
  const W = X1 - X0, D = Z1 - Z0, Y = y + h;
  const q = W >= D ? [[[X0, y, Z0], [X1, y, Z0], [X1 - D / 2, Y, (Z0 + Z1) / 2], [X0 + D / 2, Y, (Z0 + Z1) / 2]], [[X1, y, Z1], [X0, y, Z1], [X0 + D / 2, Y, (Z0 + Z1) / 2], [X1 - D / 2, Y, (Z0 + Z1) / 2]], [[X0, y, Z1], [X0, y, Z0], [X0 + D / 2, Y, (Z0 + Z1) / 2]], [[X1, y, Z0], [X1, y, Z1], [X1 - D / 2, Y, (Z0 + Z1) / 2]]]
    : [[[X1, y, Z0], [X1, y, Z1], [(X0 + X1) / 2, Y, Z1 - W / 2], [(X0 + X1) / 2, Y, Z0 + W / 2]], [[X0, y, Z1], [X0, y, Z0], [(X0 + X1) / 2, Y, Z0 + W / 2], [(X0 + X1) / 2, Y, Z1 - W / 2]], [[X0, y, Z0], [X1, y, Z0], [(X0 + X1) / 2, Y, Z0 + W / 2]], [[X1, y, Z1], [X0, y, Z1], [(X0 + X1) / 2, Y, Z1 - W / 2]]];
  const pos = [];
  for (const f of q) { const P = f.length === 4 ? [f[0], f[1], f[2], f[0], f[2], f[3]] : f; for (const p of P) pos.push(...p); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); push('neighbourRoof', g);
}
function buildNeighbourhood() {
  neighbour(-16, -5, 1, 17, -0.6, 6.4, 0.3);
  neighbour(20, 31, 0.5, 16, -0.6, 6.4, 0.4);
  neighbour(-10, 4, 42, 54, -3.0, 6.4, 0.3);
  neighbour(8, 22, 41, 53, -3.0, 6.4, 0.35);
  neighbour(-30, -19, 0, 15, -0.6, 6.2, 0.25);
  neighbour(34, 46, 0, 16, -0.6, 6.4, 0.25);
  neighbour(-14, 0, -40, -27, -0.95, 6.4, 0.35);
  neighbour(4, 18, -40, -27, -0.95, 6.4, 0.3);
  neighbour(22, 36, -40, -27, -0.95, 6.4, 0.3);
  for (const x of [-12, 9, 29]) { tree(x, -24.5, 'maple', 7); }
  for (const [x, z] of [[-8, 36], [24, 36], [-12, 20], [26, 20]]) tree(x, z, 'spruce', 8);
}

// ---------------------------------------------------------------- night sky
function buildSky() {
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(0x02040b) }, mid: { value: new THREE.Color(0x0a1430) }, hor: { value: new THREE.Color(0x1d2a46) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 hor; varying vec3 vP; void main(){ float h = max(vP.y, -0.2); vec3 c = h < 0.15 ? mix(hor, mid, smoothstep(-0.05, 0.15, h)) : mix(mid, top, smoothstep(0.15, 0.8, h)); gl_FragColor = vec4(c, 1.0); }',
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(320, 32, 16), skyMat); sky.name = 'sky'; sky.userData.noExport = true; scene.add(sky);
  const n = 2600, p = new Float32Array(n * 3), cl = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const u = rnd(), v = rr(0.04, 1), th = u * Math.PI * 2, r = 300; const y = v; const k = Math.sqrt(1 - y * y); p[i * 3] = Math.cos(th) * k * r; p[i * 3 + 1] = y * r; p[i * 3 + 2] = Math.sin(th) * k * r; const b = rr(0.5, 1); cl[i * 3] = b; cl[i * 3 + 1] = b; cl[i * 3 + 2] = b * rr(0.9, 1.1); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(p, 3)); sg.setAttribute('color', new THREE.BufferAttribute(cl, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.4, sizeAttenuation: false, vertexColors: true, fog: false, transparent: true, opacity: 0.85 })); stars.userData.noExport = true; scene.add(stars);
  const moonDir = new THREE.Vector3(-0.45, 0.62, 0.65).normalize();
  const moon = new THREE.Mesh(new THREE.SphereGeometry(7, 24, 16), new THREE.MeshBasicMaterial({ color: 0xf2efe6, fog: false })); moon.position.copy(moonDir).multiplyScalar(290); moon.userData.noExport = true; world.add(moon);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(128, (g, s) => { const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); gr.addColorStop(0, 'rgba(210,220,255,0.55)'); gr.addColorStop(1, 'rgba(210,220,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, s, s); }), fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending }));
  halo.scale.set(70, 70, 1); halo.position.copy(moon.position); halo.userData.noExport = true; world.add(halo);
  return moonDir;
}

// ---------------------------------------------------------------- lighting
const POOL = [], POOL_N = 14, POOL_SHADOW = 4;
let moonLight, hemi, flash;
function buildLights(moonDir) {
  hemi = new THREE.HemisphereLight(0x2a3658, 0x0c0d10, 0.32); world.add(hemi);
  moonLight = new THREE.DirectionalLight(0xa8bbff, 0.55);
  moonLight.position.copy(moonDir).multiplyScalar(60).add(new THREE.Vector3(7.5, 0, 12));
  moonLight.target.position.set(7.5, 0, 12); world.add(moonLight.target);
  moonLight.castShadow = true; moonLight.shadow.mapSize.set(4096, 4096);
  Object.assign(moonLight.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 140 });
  moonLight.shadow.bias = -0.0004; moonLight.shadow.normalBias = 0.03;
  world.add(moonLight);
  for (let i = 0; i < POOL_N; i++) {
    const l = new THREE.PointLight(0xffd6a0, 0, 9, 2);
    if (i < POOL_SHADOW) { l.castShadow = true; l.shadow.mapSize.set(512, 512); l.shadow.camera.near = 0.08; l.shadow.camera.far = 14; l.shadow.bias = -0.003; l.shadow.normalBias = 0.02; }
    l.userData.noExport = true; world.add(l); POOL.push(l);
  }
  flash = new THREE.SpotLight(0xfff4e0, 0, 28, 0.42, 0.45, 1.6); flash.userData.noExport = true; camera.add(flash); flash.position.set(0.15, -0.15, 0); flash.target.position.set(0, -0.2, -5); camera.add(flash.target);
  scene.add(camera);
}
const LIGHT_GAIN = 0.13;
let poolKey = '';
function updatePool(p, lvl, inside) {
  const scored = fixtures.map(f => {
    let s = f.p.distanceTo(p);
    if (!f.ext && f.lvl !== lvl) s += 7;
    if (f.ext && inside) s += 9;
    if (!f.ext && !inside) s += 4;
    return [s, f];
  }).sort((a, b) => a[0] - b[0]).slice(0, POOL_N);
  // shadow slots go to the nearest few interior lights
  const key = scored.map(s => fixtures.indexOf(s[1])).join(',');
  if (key === poolKey) return false;
  poolKey = key;
  for (let i = 0; i < POOL_N; i++) {
    const l = POOL[i], f = scored[i]?.[1];
    if (!f) { l.intensity = 0; continue; }
    l.position.copy(f.p); l.color.set(f.color); l.intensity = f.intensity * LIGHT_GAIN; l.distance = f.dist;
  }
  return true;
}
