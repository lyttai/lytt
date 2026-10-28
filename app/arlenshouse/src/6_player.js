
// ===========================================================================
// BUILD + PLAYER + LOOP
// ===========================================================================
let composer, staticGroup;
function buildAll() {
  buildShell(); buildRoof(); buildFurniture(); buildTerrain(); buildBackyard(); buildNeighbourhood();
  const moonDir = buildSky(); buildLights(moonDir);
  staticGroup = new THREE.Group(); staticGroup.name = 'ArlensHouse'; world.add(staticGroup);
  const noShadow = new Set([M.glass, M.sheer, M.crystal, M.bulb, M.bulbCool, M.shade, M.lanternGlass, M.litWindow, M.glowScreen, M.fireGlow, M.mirror]);
  for (const [m, geos] of buckets) {
    const g = mergeGeometries(geos, false); if (!g) continue;
    g.computeBoundingSphere();
    const mesh = new THREE.Mesh(g, m); mesh.name = m.name || 'rug';
    mesh.castShadow = !noShadow.has(m); mesh.receiveShadow = !(m.transparent);
    if (m.transparent) mesh.renderOrder = 2;
    staticGroup.add(mesh);
  }
  buckets.clear();
  buildGrid();
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.38, 0.45, 0.93));
  composer.addPass(new OutputPass());
}

// ---------------------------------------------------------------- collision grid
const GRID = new Map(), GS = 1.0;
function gk(i, j) { return i * 100003 + j; }
function buildGrid() {
  for (const c of colliders) {
    for (let i = Math.floor(c.x0 / GS); i <= Math.floor(c.x1 / GS); i++) for (let j = Math.floor(c.z0 / GS); j <= Math.floor(c.z1 / GS); j++) {
      const k = gk(i, j); if (!GRID.has(k)) GRID.set(k, []); GRID.get(k).push(c);
    }
  }
}
function near(x, z) {
  const out = new Set(), i0 = Math.floor(x / GS), j0 = Math.floor(z / GS);
  for (let i = i0 - 1; i <= i0 + 1; i++) for (let j = j0 - 1; j <= j0 + 1; j++) { const a = GRID.get(gk(i, j)); if (a) for (const c of a) out.add(c); }
  return out;
}
const R = 0.27, STEP = 0.43, HEIGHT = 1.72, EYE = 1.6;
function pushOut(p, feet) {
  for (let it = 0; it < 3; it++) {
    for (const c of near(p.x, p.z)) {
      if (!c.on || c.y1 <= feet + STEP || c.y0 >= feet + HEIGHT) continue;
      const cx = Math.max(c.x0, Math.min(p.x, c.x1)), cz = Math.max(c.z0, Math.min(p.z, c.z1));
      const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
      if (d2 >= R * R) continue;
      if (d2 > 1e-10) { const d = Math.sqrt(d2); p.x += dx / d * (R - d); p.z += dz / d * (R - d); }
      else {
        const pen = [[p.x - c.x0 + R, -1, 0], [c.x1 - p.x + R, 1, 0], [p.z - c.z0 + R, 0, -1], [c.z1 - p.z + R, 0, 1]].sort((a, b) => a[0] - b[0])[0];
        p.x += pen[1] * pen[0]; p.z += pen[2] * pen[0];
      }
    }
  }
}
function groundAt(x, z, feet) {
  let g = inFootprint(x, z) ? -99 : terrainH(x, z);
  if (g > feet + STEP) g = -99;
  for (const c of near(x, z)) {
    if (!c.on || x < c.x0 || x > c.x1 || z < c.z0 || z > c.z1) continue;
    if (c.y1 <= feet + STEP + 1e-3 && c.y1 > g) g = c.y1;
  }
  const s = stairH(x, z, feet); if (s !== null && s > g) g = s;
  return g;
}

// ---------------------------------------------------------------- player
const player = { p: new THREE.Vector3(8.0, 0, -7.0), yaw: Math.PI, pitch: 0.02, vy: 0, noclip: false };
player.p.y = terrainH(8, -7);
const keys = {};
let locked = false, started = false;
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (!started) return;
  if (e.code === 'KeyE') interact();
  if (e.code === 'KeyF') { flash.intensity = flash.intensity > 0 ? 0 : 90; }
  if (e.code === 'KeyN') { player.noclip = !player.noclip; toast(player.noclip ? 'Noclip on' : 'Noclip off', '#234'); }
  const tp = { Digit1: [7.2, L_B, 13.6, -Math.PI / 2], Digit2: [8.0, L_M, 2.6, Math.PI], Digit3: [5.0, L_U, 6.3, Math.PI / 2 + 0.6], Digit4: [7.7, -3.05, 27, 0], Digit5: [8.0, terrainH(8, -7), -7, Math.PI] }[e.code];
  if (tp) { player.p.set(tp[0], tp[1], tp[2]); player.yaw = -tp[3]; player.pitch = 0; player.vy = 0; }
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('mousemove', e => {
  if (!locked) return;
  player.yaw -= e.movementX * 0.0022; player.pitch -= e.movementY * 0.0022;
  player.pitch = Math.max(-1.5, Math.min(1.5, player.pitch));
});
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === canvas;
  document.getElementById('overlay').style.display = locked ? 'none' : 'flex';
  if (!locked && started) document.getElementById('go').textContent = 'Resume';
});
document.getElementById('go').addEventListener('click', () => { started = true; canvas.requestPointerLock(); });
canvas.addEventListener('click', () => { if (started && !locked) canvas.requestPointerLock(); });

// ---------------------------------------------------------------- doors
const ray = new THREE.Raycaster(); ray.far = 2.8;
function lookDoor() {
  ray.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hit = ray.intersectObjects(doorMeshes, false)[0];
  return hit ? hit.object.userData.door : null;
}
let toastT = 0;
function toast(msg, bg = 'rgba(120,20,20,.85)') { const t = document.getElementById('toast'); t.textContent = msg; t.style.background = bg; t.style.display = 'block'; toastT = 1.8; }
function interact() {
  const d = lookDoor(); if (!d) return;
  if (d.locked) { toast(d.name + ' is locked'); return; }
  d.target = d.target > 0.5 ? 0 : 1;
}
let shadowDirty = true;
function updateDoors(dt) {
  for (const d of doors) {
    if (Math.abs(d.t - d.target) < 1e-3) continue;
    d.t += Math.sign(d.target - d.t) * Math.min(Math.abs(d.target - d.t), dt * 1.8);
    const e = d.t * d.t * (3 - 2 * d.t);
    for (const pv of d.pivots) pv.pivot.rotation.y = pv.phiC + pv.delta * e;
    d.col.on = d.t < 0.5;
    shadowDirty = true;
  }
}

// ---------------------------------------------------------------- HUD
const LVL = ['Basement', 'Main floor', 'Upstairs'];
function levelOf(y) { return y < -1.4 ? 0 : y < 1.9 ? 1 : 2; }
function roomName(x, z, lvl) {
  if (stairH(x, z, 99) !== null && inFootprint(x, z)) return 'Staircase';
  for (const r of rooms) if (r.lvl === lvl && x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) return r.name;
  if (z > 17.6) return 'Backyard';
  if (z < 1.6) return 'Front yard';
  return 'Side yard';
}

// ---------------------------------------------------------------- loop
const clock = new THREE.Clock();
let poolTimer = 0, hudTimer = 0;
const fwd = new THREE.Vector3(), right = new THREE.Vector3();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (started && locked) move(dt);
  updateDoors(dt);
  placeCamera();
  poolTimer -= dt;
  if (poolTimer <= 0) {
    poolTimer = 0.25;
    const lvl = levelOf(player.p.y), inside = inFootprint(player.p.x, player.p.z);
    if (updatePool(eyePlan(), lvl, inside)) shadowDirty = true;
  }
  hudTimer -= dt;
  if (hudTimer <= 0) {
    hudTimer = 0.15;
    const lvl = levelOf(player.p.y), inside = inFootprint(player.p.x, player.p.z);
    document.getElementById('room').textContent = roomName(player.p.x, player.p.z, lvl);
    document.getElementById('lvl').textContent = inside ? LVL[lvl] : 'Outside · night';
    const d = started && locked ? lookDoor() : null, hint = document.getElementById('hint');
    if (d) { hint.style.display = 'block'; hint.textContent = d.locked ? `🔒 ${d.name} — locked` : `E — ${d.target > 0.5 ? 'Close' : 'Open'} ${d.name.toLowerCase()}`; } else hint.style.display = 'none';
  }
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) document.getElementById('toast').style.display = 'none'; }
  if (shadowDirty) { renderer.shadowMap.needsUpdate = true; shadowDirty = false; }
  composer.render();
}
// camera lives in real-world space (x mirrored); the player is tracked in plan space
function placeCamera() { camera.position.set(-player.p.x, player.p.y + EYE, player.p.z); camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ'); }
function eyePlan() { return new THREE.Vector3(player.p.x, player.p.y + EYE, player.p.z); }
function move(dt) {
  const run = keys.ShiftLeft || keys.ShiftRight, sp = player.noclip ? (run ? 12 : 5) : (run ? 5.5 : 2.8);
  fwd.set(Math.sin(player.yaw), 0, -Math.cos(player.yaw)); right.set(-Math.cos(player.yaw), 0, -Math.sin(player.yaw));
  let mx = 0, mz = 0;
  if (keys.KeyW || keys.ArrowUp) { mx += fwd.x; mz += fwd.z; }
  if (keys.KeyS || keys.ArrowDown) { mx -= fwd.x; mz -= fwd.z; }
  if (keys.KeyD || keys.ArrowRight) { mx += right.x; mz += right.z; }
  if (keys.KeyA || keys.ArrowLeft) { mx -= right.x; mz -= right.z; }
  const l = Math.hypot(mx, mz); if (l > 0) { mx /= l; mz /= l; }
  const p = player.p;
  if (player.noclip) {
    p.x += mx * sp * dt; p.z += mz * sp * dt;
    if (keys.Space) p.y += sp * dt; if (keys.KeyC || keys.ControlLeft) p.y -= sp * dt;
    return;
  }
  const n = Math.ceil(sp * dt / 0.1);
  for (let i = 0; i < n; i++) {
    p.x += mx * sp * dt / n; p.z += mz * sp * dt / n;
    pushOut(p, p.y);
  }
  const g = groundAt(p.x, p.z, p.y);
  if (p.y > g + 0.02) { player.vy -= 22 * dt; p.y += player.vy * dt; if (p.y < g) { p.y = g; player.vy = 0; } }
  else { p.y += (g - p.y) * Math.min(1, dt * 18); player.vy = 0; }
  if (p.y < -20) { p.set(8, terrainH(8, -7), -7); }
}
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
});

// ---------------------------------------------------------------- export for Unreal Engine
document.getElementById('glb').addEventListener('click', () => {
  const btn = document.getElementById('glb'); btn.disabled = true; btn.textContent = 'Exporting…';
  setTimeout(() => {
    const root = new THREE.Group(); root.name = 'ArlensHouse_Night';
    const flip = new THREE.Matrix4().makeScale(-1, 1, 1);
    const bake = (obj) => {
      obj.updateWorldMatrix(true, true);
      obj.traverse(o => {
        if (!o.isMesh) return;
        const g = o.geometry.clone().applyMatrix4(new THREE.Matrix4().copy(world.matrixWorld).invert().multiply(o.matrixWorld)).applyMatrix4(flip);
        const P = g.attributes.position.array, N = g.attributes.normal.array, U = g.attributes.uv?.array;
        for (let i = 0; i < P.length; i += 9) for (const A of [P, N]) for (let k = 0; k < 3; k++) { const t = A[i + 3 + k]; A[i + 3 + k] = A[i + 6 + k]; A[i + 6 + k] = t; }
        if (U) for (let i = 0; i < U.length; i += 6) for (let k = 0; k < 2; k++) { const t = U[i + 2 + k]; U[i + 2 + k] = U[i + 4 + k]; U[i + 4 + k] = t; }
        const m = new THREE.Mesh(g, o.material); m.name = o.name; root.add(m);
      });
    };
    bake(staticGroup);
    for (const d of doors) for (const pv of d.pivots) bake(pv.pivot);
    for (const f of fixtures) { const l = new THREE.PointLight(f.color, f.intensity, f.dist, 2); l.position.set(-f.p.x, f.p.y, f.p.z); root.add(l); }
    const sun = new THREE.DirectionalLight(0xa8bbff, 0.5); sun.position.set(-moonLight.position.x, moonLight.position.y, moonLight.position.z); root.add(sun);
    new GLTFExporter().parse(root, buf => {
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([buf], { type: 'model/gltf-binary' })); a.download = 'arlens-house.glb'; a.click();
      btn.disabled = false; btn.textContent = 'Download .glb for Unreal Engine';
    }, err => { console.error(err); btn.disabled = false; btn.textContent = 'Export failed — see console'; }, { binary: true, maxTextureSize: 1024 });
  }, 50);
});

// ---------------------------------------------------------------- go
const loading = document.getElementById('loading');
loading.textContent = 'Building the house…';
setTimeout(() => {
  try {
    const t0 = performance.now();
    buildAll();
    renderer.shadowMap.autoUpdate = false;
    placeCamera();
    updatePool(eyePlan(), 1, false);
    renderer.shadowMap.needsUpdate = true;
    composer.render();
    const tris = staticGroup.children.reduce((s, m) => s + m.geometry.attributes.position.count / 3, 0);
    loading.textContent = `Built in ${((performance.now() - t0) / 1000).toFixed(1)} s · ${(tris / 1e6).toFixed(2)} M triangles · ${colliders.length} colliders`;
    const go = document.getElementById('go'); go.disabled = false; go.textContent = 'Enter the house';
    window.__house = { scene, camera, player, doors, colliders, fixtures, renderer,
      // debug helper: hold keys for a while and simulate walking (used for testing collisions)
      sim(k, secs, yaw) { if (yaw !== undefined) player.yaw = yaw; Object.assign(keys, k); for (let t = 0; t < secs; t += 1 / 60) move(1 / 60); for (const q in k) keys[q] = false; return [player.p.x.toFixed(2), player.p.y.toFixed(2), player.p.z.toFixed(2)].join(','); },
      // debug helper: jump somewhere and render one frame immediately (used for testing)
      snap(x, y, z, yaw, pitch = 0) {
        player.p.set(x, y, z); player.yaw = yaw; player.pitch = pitch; placeCamera();
        const lvl = levelOf(y), inside = inFootprint(x, z); updatePool(eyePlan(), lvl, inside);
        document.getElementById('room').textContent = roomName(x, z, lvl);
        renderer.shadowMap.needsUpdate = true; composer.render();
      } };
    frame();
  } catch (e) { console.error(e); loading.textContent = 'Error: ' + e.message; }
}, 30);
