import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

// ---------------------------------------------------------------------------
// Coordinate system (metres, 1:1):
//   +X = east (right when standing on the street facing the house)
//   +Z = north (towards the backyard), front of house faces the street at z≈0
//   +Y = up. Main floor = 0, upstairs = 3.3, basement = -3.0
// ---------------------------------------------------------------------------
const L_B = -3.0, L_M = 0, L_U = 3.3, CEIL_M = 3.0, CEIL_U = 6.05, CEIL_B = -0.3;

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x070b16, 0.018);
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.05, 400);
// The floor plan is authored with +X = east and +Z = north, which is a mirror image of the real
// world, so everything lives under a root that flips X. Gameplay code works in plan coordinates.
const world = new THREE.Group(); world.name = 'World'; world.scale.x = -1; scene.add(world);

// ---------------------------------------------------------------- random
let _seed = 1337;
function rnd() { _seed |= 0; _seed = (_seed + 0x6D2B79F5) | 0; let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
const rr = (a, b) => a + (b - a) * rnd();

// ---------------------------------------------------------------- textures
const maxAniso = renderer.capabilities.getMaxAnisotropy();
function canvasTex(size, draw, metres, srgb = true) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); draw(g, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (metres) t.repeat.set(1 / metres, 1 / metres);
  t.anisotropy = Math.min(8, maxAniso);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function noise(g, s, n, alpha, light = true) {
  for (let i = 0; i < n; i++) {
    const v = light ? 255 : 0;
    g.fillStyle = `rgba(${v},${v},${v},${rnd() * alpha})`;
    g.fillRect(rnd() * s, rnd() * s, rr(1, 3), rr(1, 3));
  }
}
function shade(hex, f) { const c = new THREE.Color(hex); c.offsetHSL(0, 0, f); return '#' + c.getHexString(); }

const TX = {
  cherry: canvasTex(1024, (g, s) => planks(g, s, ['#7a3a1c', '#8d4523', '#9b5229', '#6e3218', '#a45a2e', '#843f20']), 2.4),
  maple: canvasTex(1024, (g, s) => planks(g, s, ['#c58d4e', '#b97e40', '#d29a5a', '#bf8546', '#a8703a', '#cf9450']), 2.4),
  oakStair: canvasTex(512, (g, s) => planks(g, s, ['#a5642c', '#b06d32', '#9b5d28']), 1.2),
  tileBeige: canvasTex(512, (g, s) => tiles(g, s, 4, '#e3d6c0', '#cbbfa8', 0.06), 1.6),
  tileWhite: canvasTex(512, (g, s) => tiles(g, s, 4, '#ecebe6', '#c9c7c0', 0.04), 1.6),
  tileDark: canvasTex(512, (g, s) => tiles(g, s, 3, '#25272b', '#151618', 0.07), 1.5),
  tileShower: canvasTex(512, (g, s) => tiles(g, s, 12, '#d8d0c2', '#bdb4a5', 0.04), 1.2),
  tileSlate: canvasTex(512, (g, s) => tiles(g, s, 4, '#3b4048', '#2a2e33', 0.08), 1.2),
  wallTileBeige: canvasTex(512, (g, s) => tiles(g, s, 4, '#cdbfa8', '#b6a88f', 0.08), 1.4),
  brick: canvasTex(1024, (g, s) => bricks(g, s), 2.0),
  stone: canvasTex(1024, (g, s) => ashlar(g, s), 2.6),
  grass: canvasTex(512, (g, s) => { g.fillStyle = '#2e4a22'; g.fillRect(0, 0, s, s); for (let i = 0; i < 9000; i++) { g.fillStyle = `hsl(${rr(80, 110)},${rr(30, 55)}%,${rr(14, 30)}%)`; g.fillRect(rnd() * s, rnd() * s, 1.5, rr(2, 6)); } }, 3),
  asphalt: canvasTex(512, (g, s) => { g.fillStyle = '#26272a'; g.fillRect(0, 0, s, s); noise(g, s, 14000, 0.18); noise(g, s, 6000, 0.3, false); }, 3),
  concrete: canvasTex(512, (g, s) => { g.fillStyle = '#9a9790'; g.fillRect(0, 0, s, s); noise(g, s, 9000, 0.12); noise(g, s, 6000, 0.12, false); }, 3),
  pavers: canvasTex(512, (g, s) => pavers(g, s), 2.0),
  granite: canvasTex(512, (g, s) => { g.fillStyle = '#5c5f63'; g.fillRect(0, 0, s, s); for (let i = 0; i < 16000; i++) { const v = rnd(); g.fillStyle = v < .45 ? '#2a2b2e' : v < .8 ? '#9a9da2' : '#d8d6d2'; g.fillRect(rnd() * s, rnd() * s, rr(1, 3.5), rr(1, 3.5)); } }, 1.2),
  graniteDark: canvasTex(512, (g, s) => { g.fillStyle = '#26282b'; g.fillRect(0, 0, s, s); for (let i = 0; i < 12000; i++) { const v = rnd(); g.fillStyle = v < .6 ? '#141516' : v < .9 ? '#55585c' : '#c9c9c4'; g.fillRect(rnd() * s, rnd() * s, rr(1, 3), rr(1, 3)); } }, 1.2),
  marble: canvasTex(512, (g, s) => marble(g, s, '#ecebe7', 'rgba(110,112,118,0.35)'), 1.4),
  marbleBeige: canvasTex(512, (g, s) => marble(g, s, '#e5dccb', 'rgba(150,130,100,0.25)'), 1.4),
  shingle: canvasTex(512, (g, s) => shingles(g, s), 2.0),
  deck: canvasTex(512, (g, s) => { g.fillStyle = '#7d6253'; g.fillRect(0, 0, s, s); const n = 8; for (let i = 0; i < n; i++) { g.fillStyle = shade('#806455', rr(-0.05, 0.04)); g.fillRect(0, i * s / n + 2, s, s / n - 4); } noise(g, s, 5000, 0.08, false); }, 1.1),
  cork: canvasTex(512, (g, s) => { g.fillStyle = '#c9a477'; g.fillRect(0, 0, s, s); for (let i = 0; i < 12000; i++) { g.fillStyle = `hsl(32,${rr(30, 55)}%,${rr(40, 70)}%)`; g.fillRect(rnd() * s, rnd() * s, rr(1, 4), rr(1, 4)); } }, 1.0),
  carpet: canvasTex(256, (g, s) => { g.fillStyle = '#d8d0c2'; g.fillRect(0, 0, s, s); noise(g, s, 7000, 0.15); noise(g, s, 7000, 0.1, false); }, 0.6),
  boucle: canvasTex(256, (g, s) => { g.fillStyle = '#ebe5d8'; g.fillRect(0, 0, s, s); for (let i = 0; i < 2500; i++) { g.strokeStyle = `rgba(${rnd() < .5 ? '255,255,255' : '160,150,135'},.5)`; g.beginPath(); g.arc(rnd() * s, rnd() * s, rr(1, 3), 0, 6.3); g.stroke(); } }, 0.25),
  walnut: canvasTex(512, (g, s) => veneer(g, s, '#6b3a22', '#4e2816'), 1.4),
  darkWood: canvasTex(512, (g, s) => veneer(g, s, '#3a2418', '#24150d'), 1.4),
  bark: canvasTex(256, (g, s) => { g.fillStyle = '#3b2e24'; g.fillRect(0, 0, s, s); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(0,0,0,${rr(.1, .4)})`; g.fillRect(rnd() * s, 0, rr(1, 4), s); } }, 1),
  lawnStripe: null,
};

function planks(g, s, cols) {
  const rows = 8, h = s / rows;
  for (let r = 0; r < rows; r++) {
    let x = -rnd() * s * 0.5;
    while (x < s) {
      const w = rr(s * 0.25, s * 0.7), c = cols[(rnd() * cols.length) | 0];
      g.fillStyle = c; g.fillRect(x, r * h, w, h);
      for (let k = 0; k < 14; k++) { g.strokeStyle = `rgba(30,12,4,${rr(.05, .18)})`; g.lineWidth = rr(.5, 2); g.beginPath(); const yy = r * h + rnd() * h; g.moveTo(x, yy); g.bezierCurveTo(x + w * .3, yy + rr(-4, 4), x + w * .6, yy + rr(-4, 4), x + w, yy + rr(-3, 3)); g.stroke(); }
      g.fillStyle = 'rgba(20,8,2,.55)'; g.fillRect(x, r * h, 2, h);
      x += w;
    }
    g.fillStyle = 'rgba(20,8,2,.5)'; g.fillRect(0, r * h, s, 2);
  }
  // wrap copy of first columns so tiling is seamless enough
}
function veneer(g, s, a, b) { g.fillStyle = a; g.fillRect(0, 0, s, s); for (let i = 0; i < 220; i++) { g.strokeStyle = `rgba(20,8,3,${rr(.05, .25)})`; g.lineWidth = rr(.5, 3); g.beginPath(); const x = rnd() * s; g.moveTo(x, 0); g.bezierCurveTo(x + rr(-8, 8), s * .3, x + rr(-8, 8), s * .7, x + rr(-6, 6), s); g.stroke(); } g.fillStyle = b; g.globalAlpha = .15; g.fillRect(0, 0, s, s); g.globalAlpha = 1; }
function tiles(g, s, n, c, grout, varr) {
  const t = s / n; g.fillStyle = grout; g.fillRect(0, 0, s, s);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = shade(c, rr(-varr, varr * .5)); g.fillRect(i * t + 1.5, j * t + 1.5, t - 3, t - 3); }
  noise(g, s, 3000, 0.06, false);
}
function bricks(g, s) {
  g.fillStyle = '#cfc2a8'; g.fillRect(0, 0, s, s);
  const rows = 26, bh = s / rows, bw = s / 6;
  const cols = ['#b39069', '#a8835c', '#bf9c73', '#9c7b56', '#c4a47c', '#ad8a63', '#8f6f4f'];
  for (let r = 0; r < rows; r++) { const off = (r % 2) * bw / 2; for (let c = -1; c < 7; c++) { g.fillStyle = cols[(rnd() * cols.length) | 0]; g.fillRect(c * bw + off + 2, r * bh + 2, bw - 4, bh - 3); } }
  noise(g, s, 16000, 0.12, false); noise(g, s, 6000, 0.1);
}
function ashlar(g, s) {
  g.fillStyle = '#d7cdb8'; g.fillRect(0, 0, s, s);
  const cols = ['#cdbb98', '#c3ae88', '#d6c6a4', '#bba57f', '#c9b48d', '#b59e78'];
  let y = 0;
  while (y < s) { const h = [s / 9, s / 12, s / 7][(rnd() * 3) | 0]; let x = 0; while (x < s) { const w = rr(s / 7, s / 3.2); g.fillStyle = cols[(rnd() * cols.length) | 0]; g.fillRect(x + 3, y + 3, Math.min(w, s - x) - 6, h - 6); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x + 3, y + 3, Math.min(w, s - x) - 6, 3); x += w; } y += h; }
  noise(g, s, 24000, 0.14, false); noise(g, s, 8000, 0.1);
}
function pavers(g, s) { g.fillStyle = '#7d766b'; g.fillRect(0, 0, s, s); const n = 8, t = s / n; for (let i = 0; i < n; i++) for (let j = 0; j < n * 2; j++) { g.fillStyle = shade('#b4aa98', rr(-.08, .05)); const off = (i % 2) * t / 2; g.fillRect(j * t / 2 * 2 / 2 + off + 2, i * t + 2, t - 4, t - 4); } noise(g, s, 8000, 0.12, false); }
function marble(g, s, base, vein) { g.fillStyle = base; g.fillRect(0, 0, s, s); for (let i = 0; i < 26; i++) { g.strokeStyle = vein; g.lineWidth = rr(.5, 2.5); g.beginPath(); let x = rnd() * s, y = 0; g.moveTo(x, y); while (y < s) { x += rr(-25, 25); y += rr(10, 40); g.lineTo(x, y); } g.stroke(); } }
function shingles(g, s) { g.fillStyle = '#3e2a20'; g.fillRect(0, 0, s, s); const rows = 12, h = s / rows; for (let r = 0; r < rows; r++) { let x = (r % 2) * 20 - 20; while (x < s) { const w = rr(28, 52); g.fillStyle = `hsl(${rr(12, 22)},${rr(25, 40)}%,${rr(22, 34)}%)`; g.fillRect(x + 1, r * h + 1, w - 2, h - 2); x += w; } g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, r * h + h - 3, s, 3); } noise(g, s, 9000, 0.12, false); }

function rugTex(draw, size = 512) { const t = canvasTex(size, draw); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; }

// ---------------------------------------------------------------- materials
const M = {};
function mat(name, o) { M[name] = new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.85, metalness: 0 }, o)); M[name].name = name; return M[name]; }
mat('wall', { color: 0xeeece6, roughness: 0.92 });
mat('wallWarm', { color: 0xe6e0d4, roughness: 0.92 });
mat('wallGrey', { color: 0xd9dcdc, roughness: 0.92 });
mat('ceiling', { color: 0xf4f3ef, roughness: 0.95 });
mat('trim', { color: 0xf7f6f2, roughness: 0.45 });
mat('purple', { color: 0x4a2348, roughness: 0.9 });
mat('plum', { color: 0x5b2a5c, roughness: 0.9 });
mat('navy', { color: 0x1a2236, roughness: 0.9 });
mat('teal', { color: 0x1f5a60, roughness: 0.9 });
mat('slateGreen', { color: 0x3f4b48, roughness: 0.9 });
mat('pwdGreen', { color: 0x163b3a, roughness: 0.75 });
mat('gymGreen', { color: 0xcfe0c8, roughness: 0.9 });
mat('blackPanel', { color: 0x141416, roughness: 0.7 });
mat('beigeWall', { color: 0xd8d0bf, roughness: 0.9 });
mat('cherry', { map: TX.cherry, roughness: 0.42 });
mat('maple', { map: TX.maple, roughness: 0.45 });
mat('oak', { map: TX.oakStair, roughness: 0.4 });
mat('tileBeige', { map: TX.tileBeige, roughness: 0.3 });
mat('tileWhite', { map: TX.tileWhite, roughness: 0.3 });
mat('tileDark', { map: TX.tileDark, roughness: 0.3 });
mat('tileShower', { map: TX.tileShower, roughness: 0.35 });
mat('tileSlate', { map: TX.tileSlate, roughness: 0.4 });
mat('wallTile', { map: TX.wallTileBeige, roughness: 0.35 });
mat('brick', { map: TX.brick, roughness: 0.95 });
mat('stone', { map: TX.stone, roughness: 0.95 });
mat('grass', { map: TX.grass, roughness: 1 });
mat('asphalt', { map: TX.asphalt, roughness: 0.95 });
mat('concrete', { map: TX.concrete, roughness: 0.95 });
mat('pavers', { map: TX.pavers, roughness: 0.95 });
mat('granite', { map: TX.granite, roughness: 0.18 });
mat('graniteDark', { map: TX.graniteDark, roughness: 0.18 });
mat('marble', { map: TX.marble, roughness: 0.2 });
mat('marbleBeige', { map: TX.marbleBeige, roughness: 0.25 });
mat('shingle', { map: TX.shingle, roughness: 0.95 });
mat('deck', { map: TX.deck, roughness: 0.9 });
mat('cork', { map: TX.cork, roughness: 0.8 });
mat('carpet', { map: TX.carpet, roughness: 1 });
mat('boucle', { map: TX.boucle, roughness: 1 });
mat('walnut', { map: TX.walnut, roughness: 0.5 });
mat('darkWood', { map: TX.darkWood, roughness: 0.5 });
mat('bark', { map: TX.bark, roughness: 1 });
mat('whiteGloss', { color: 0xf3f1ec, roughness: 0.25 });
mat('whiteMatte', { color: 0xeeebe4, roughness: 0.7 });
mat('cream', { color: 0xe8dfcc, roughness: 0.75 });
mat('creamLeather', { color: 0xe9dfc9, roughness: 0.45 });
mat('greyFabric', { color: 0xa9a6a6, roughness: 1 });
mat('taupeFabric', { color: 0x8f8072, roughness: 1 });
mat('velvetBeige', { color: 0xcfc4b5, roughness: 0.9 });
mat('pinkVelvet', { color: 0xd9a6a6, roughness: 0.8 });
mat('plumVelvet', { color: 0x5c2c3a, roughness: 0.8 });
mat('redPillow', { color: 0x8f2b22, roughness: 0.9 });
mat('purplePillow', { color: 0x6a2a8a, roughness: 0.7 });
mat('bedding', { color: 0xf1efea, roughness: 0.95 });
mat('beddingTaupe', { color: 0x8c7c6b, roughness: 0.95 });
mat('beddingGreen', { color: 0x234a35, roughness: 0.95 });
mat('silverLeather', { color: 0xb8b9bc, roughness: 0.35, metalness: 0.3 });
mat('goldLeather', { color: 0x7d6a48, roughness: 0.35, metalness: 0.4 });
mat('gold', { color: 0xc8a24f, roughness: 0.3, metalness: 1 });
mat('brass', { color: 0xa88445, roughness: 0.35, metalness: 1 });
mat('chrome', { color: 0xdddddd, roughness: 0.12, metalness: 1 });
mat('steel', { color: 0xb9bcc0, roughness: 0.28, metalness: 1 });
mat('iron', { color: 0x1d1c1b, roughness: 0.55, metalness: 0.6 });
mat('black', { color: 0x111112, roughness: 0.5 });
mat('blackGloss', { color: 0x0b0b0c, roughness: 0.15 });
mat('screenOff', { color: 0x050607, roughness: 0.08, metalness: 0.2 });
mat('mirror', { color: 0xc9d2d8, roughness: 0.02, metalness: 1 });
mat('glass', { color: 0x9fb4c4, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.18, depthWrite: false });
mat('crystal', { color: 0xffffff, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.55, emissive: 0xfff2d8, emissiveIntensity: 0.6 });
mat('porcelain', { color: 0xf6f6f4, roughness: 0.15 });
mat('curtainGold', { color: 0x9c8551, roughness: 0.85, side: THREE.DoubleSide });
mat('curtainTaupe', { color: 0x6e6152, roughness: 0.85, side: THREE.DoubleSide });
mat('curtainCream', { color: 0xe7dcc4, roughness: 0.9, side: THREE.DoubleSide });
mat('curtainBlush', { color: 0xb59e94, roughness: 0.9, side: THREE.DoubleSide });
mat('sheer', { color: 0xf6f4ef, roughness: 0.9, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false });
mat('shade', { color: 0xf2e6cc, roughness: 0.9, emissive: 0xffd9a0, emissiveIntensity: 0.9, side: THREE.DoubleSide });
mat('bulb', { color: 0xffffff, emissive: 0xffe2b0, emissiveIntensity: 6 });
mat('bulbCool', { color: 0xffffff, emissive: 0xfff5e8, emissiveIntensity: 4 });
mat('lanternGlass', { color: 0xffe6b0, emissive: 0xffc56e, emissiveIntensity: 1.4, roughness: 0.3 });
mat('glowScreen', { color: 0x050608, emissive: 0x4a5a70, emissiveIntensity: 0.08, roughness: 0.1 });
mat('fireGlow', { color: 0x000000, emissive: 0xff7a2a, emissiveIntensity: 2.5 });
mat('wicker', { color: 0x4b3424, roughness: 1 });
mat('cushion', { color: 0xcdbb9b, roughness: 1 });
mat('playWood', { color: 0x6b5442, roughness: 1 });
mat('slideGreen', { color: 0x1f6d55, roughness: 0.5 });
mat('leaf', { color: 0x1f3a1c, roughness: 1 });
mat('leafDark', { color: 0x15281a, roughness: 1 });
mat('leafRed', { color: 0x3b1a1d, roughness: 1 });
mat('shrub', { color: 0x223d1f, roughness: 1 });
mat('rock', { color: 0x8a8378, roughness: 1 });
mat('garageDoor', { color: 0xe6e1d6, roughness: 0.6 });
mat('frontDoor', { color: 0xf5f4f0, roughness: 0.4 });
mat('appliance', { color: 0xbfc2c5, roughness: 0.3, metalness: 0.85 });
mat('washer', { color: 0xe9e6dd, roughness: 0.35 });
mat('cabWhite', { color: 0xf2efe8, roughness: 0.45 });
mat('cabMaple', { color: 0xd8b98a, roughness: 0.5 });
mat('cabCherry', { color: 0x5c2418, roughness: 0.45 });
mat('cabEspresso', { color: 0x2b1d17, roughness: 0.4 });
mat('backsplash', { color: 0x3a2620, roughness: 0.4 });
mat('rubber', { color: 0x1a1a1a, roughness: 0.9 });
mat('redMetal', { color: 0xb3171c, roughness: 0.4, metalness: 0.5 });
mat('gymMat', { color: 0x2a7fd0, roughness: 0.8 });
mat('yellowBag', { color: 0xe9cf2a, roughness: 0.6 });
mat('soil', { color: 0x2c2117, roughness: 1 });
mat('neighbour', { color: 0x9a8a72, roughness: 1 });
mat('neighbourRoof', { color: 0x2d2a2a, roughness: 1 });
mat('litWindow', { color: 0x000000, emissive: 0xffc77a, emissiveIntensity: 1.2 });
mat('darkWindow', { color: 0x10141c, roughness: 0.1, metalness: 0.5 });
mat('art1', { color: 0x2b3f6b, roughness: 0.6 });
mat('art2', { color: 0x777777, roughness: 0.6 });
mat('canvasBW', { color: 0x9a9a9a, roughness: 0.7 });
mat('pinkBox', { color: 0xc98fa0, roughness: 0.8 });
mat('fridge', { color: 0xc7c9cc, roughness: 0.25, metalness: 0.9 });

// ---------------------------------------------------------------- geometry buckets
const buckets = new Map();        // material -> [geometries]
const colliders = [];             // {x0,x1,y0,y1,z0,z1,on}
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();

function normGeo(g) {
  if (g.index) g = g.toNonIndexed();
  for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
  if (!g.attributes.normal) g.computeVertexNormals();
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
  return g;
}
function worldUV(g) {
  const p = g.attributes.position, n = g.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    let u, v;
    if (ay >= ax && ay >= az) { u = p.getX(i); v = p.getZ(i); }
    else if (ax >= az) { u = p.getZ(i); v = p.getY(i); }
    else { u = p.getX(i); v = p.getY(i); }
    uv[i * 2] = u; uv[i * 2 + 1] = v;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}
function push(m, g, keepUV = false) {
  if (typeof m === 'string') m = M[m];
  g = normGeo(g);
  if (!keepUV) worldUV(g);
  if (!buckets.has(m)) buckets.set(m, []);
  buckets.get(m).push(g);
}
function col(x0, x1, y0, y1, z0, z1) { const c = { x0: Math.min(x0, x1), x1: Math.max(x0, x1), y0: Math.min(y0, y1), y1: Math.max(y0, y1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), on: true }; colliders.push(c); return c; }

// axis-aligned box from min/max corners
function box(m, x0, x1, y0, y1, z0, z1, solid = false) {
  const g = new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0));
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  push(m, g);
  if (solid) col(x0, x1, y0, y1, z0, z1);
}
// oriented box: size w,h,d centred at x,y,z rotated by ry (and optional rx, rz)
function obox(m, w, h, d, x, y, z, ry = 0, rx = 0, rz = 0, solid = false) {
  const g = new THREE.BoxGeometry(w, h, d);
  _e.set(rx, ry, rz, 'YXZ'); _q.setFromEuler(_e); _m4.compose(_v.set(x, y, z), _q, _s.set(1, 1, 1));
  g.applyMatrix4(_m4); push(m, g);
  if (solid) solidSeg(w, d, x, z, ry, y - h / 2, y + h / 2);
}
// thin rotated collider made of small AABBs so diagonal walls don't get fat
function solidSeg(w, d, x, z, ry, y0, y1) {
  const n = Math.max(1, Math.ceil(w / 0.3)), ux = Math.cos(ry), uz = -Math.sin(ry);
  for (let i = 0; i < n; i++) {
    const t = -w / 2 + (i + 0.5) * w / n, cx = x + ux * t, cz = z + uz * t, hw = Math.max(d, 0.08) / 2 + w / n / 2 * 0.7;
    col(cx - hw, cx + hw, y0, y1, cz - hw, cz + hw);
  }
}
function cyl(m, rt, rb, h, x, y, z, seg = 18, solid = false, open = false) {
  const g = new THREE.CylinderGeometry(rt, rb, h, seg, 1, open); g.translate(x, y + h / 2, z); push(m, g);
  if (solid) { const r = Math.max(rt, rb); col(x - r, x + r, y, y + h, z - r, z + r); }
}
function sph(m, r, x, y, z, sx = 1, sy = 1, sz = 1, seg = 16) { const g = new THREE.SphereGeometry(r, seg, Math.max(6, seg * 0.6 | 0)); g.scale(sx, sy, sz); g.translate(x, y, z); push(m, g); }
function cone(m, r, h, x, y, z, seg = 12) { const g = new THREE.ConeGeometry(r, h, seg); g.translate(x, y + h / 2, z); push(m, g); }
function torus(m, R, r, x, y, z, rx = Math.PI / 2, seg = 32) { const g = new THREE.TorusGeometry(R, r, 8, seg); g.rotateX(rx); g.translate(x, y, z); push(m, g); }
// beam (round or square) between two points
function beam(m, a, b, r, round = true) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), len = A.distanceTo(B);
  const g = round ? new THREE.CylinderGeometry(r, r, len, 6) : new THREE.BoxGeometry(r * 2, len, r * 2);
  _q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  _m4.compose(A.clone().add(B).multiplyScalar(0.5), _q, _s.set(1, 1, 1)); g.applyMatrix4(_m4); push(m, g);
}
// flat textured rug (keeps its own 0..1 UVs)
function rug(tex, w, d, x, y, z, ry = 0, round = false) {
  const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 1 });
  const g = round ? new THREE.CircleGeometry(0.5, 48) : new THREE.PlaneGeometry(1, 1);
  if (round) { const uv = g.attributes.uv; } // circle uvs already 0..1
  g.scale(w, d, 1); g.rotateX(-Math.PI / 2); g.rotateY(ry); g.translate(x, y + 0.012, z);
  push(m, g, true);
}
// extruded 2D shape placed in a vertical plane. pts are [u,v] in the plane; map(u,v,w) -> world
function shapeGeo(shape, depth) { return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 20 }); }
function placePlanar(g, ox, oy, oz, ry) { _e.set(0, ry, 0); _q.setFromEuler(_e); _m4.compose(_v.set(ox, oy, oz), _q, _s.set(1, 1, 1)); g.applyMatrix4(_m4); return g; }

// ---------------------------------------------------------------- lights (fixtures)
const fixtures = [];   // {p:Vector3, color, intensity, dist, ext, lvl}
function fixture(x, y, z, intensity = 40, color = 0xffd6a0, dist = 9, ext = false) {
  const lvl = y < -0.2 ? 0 : y < 3.25 ? 1 : 2;
  fixtures.push({ p: new THREE.Vector3(x, y, z), color, intensity, dist, ext, lvl });
}

// rooms for the HUD
const rooms = [];
function room(name, lvl, x0, x1, z0, z1) { rooms.push({ name, lvl, x0, x1, z0, z1 }); }
