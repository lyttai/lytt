// ===========================================================================
// HOUSE SHELL — floor plan worked out from the photos and the owner's sketches
// (+X = east/right when facing the house, +Z = north/back)
//   Main floor: garage (front-left, locked); foyer + 2-storey living room; a wide hall
//   with the UP stairs first and the separate DOWN stairs beside/behind them; hall to the
//   garage: 3 steps down, garage door on the left, powder room straight ahead, office on the
//   right; dining, kitchen (fridge first, then the butler's pantry), breakfast, family room.
//   Upstairs (sketch): straight hall from the foyer overlook back to the master. West side:
//   big bedroom, jack-and-jill bath, bedroom, stairwell. East side: my bedroom, laundry.
//   Basement (sketch): gym -> corridor -> rec room; small bar behind a wall next to the stairs.
// ===========================================================================
function buildShell() {
  const ET = 0.2;
  const brickW = (side, extra = {}) => Object.assign({ t: ET, ext: { mat: 'brick', side, y0: -3.0 } }, extra);
  const stoneW = (side, extra = {}) => Object.assign({ t: ET, ext: { mat: 'stone', side, y0: -0.75 } }, extra);

  // ---------------------------------------------------------------- exterior walls
  wall(0, 0, 0, 6.0, -0.45, CEIL_U, brickW(1, { floors: [{ y: 3.3 }], ext: { mat: 'brick', side: 1, y0: -0.75 }, ops: [
    { k: 'win', at: [2.4, 3.6], y0: 4.1, y1: 5.5, grid: [2, 2] },
  ] }));
  wall(0, 6.0, 0, 17.6, L_B, CEIL_U, brickW(1, { floors: [L_B, L_M, L_U], skins: [{ side: -1, mat: 'pwdGreen', at: [6.0, 7.4], y0: -0.45, y1: CEIL_M }], ops: [
    { k: 'win', at: [8.3, 10.0], y0: 0.8, y1: 2.4, grid: [2, 2], blinds: true },
    { k: 'win', at: [7.9, 9.5], y0: 4.1, y1: 5.6, grid: [2, 1], curtain: 'taupe' },
    { k: 'win', at: [13.35, 13.95], y0: 4.45, y1: 5.25 },
    { k: 'win', at: [8.8, 9.8], y0: -1.05, y1: -0.5 },
  ] }));
  wall(0, 0, 6.4, 0, -0.45, CEIL_U, stoneW(-1, { floors: [{ y: 3.3 }], skins: [{ side: 1, mat: 'navy', y0: 3.3 }], ops: [
    { k: 'open', at: [0.4, 3.0], y0: -0.45, h: 2.3, cased: false },
    { k: 'open', at: [3.4, 6.0], y0: -0.45, h: 2.3, cased: false },
    { k: 'win', at: [2.6, 3.8], y0: 3.85, y1: 5.3, rise: 0.45, grid: [2, 3] },
    { k: 'win', at: [1.75, 2.45], y0: 3.85, y1: 5.3, grid: [1, 3] },
    { k: 'win', at: [3.95, 4.65], y0: 3.85, y1: 5.3, grid: [1, 3] },
  ] }));
  wall(6.4, 0, 6.4, 1.6, -0.45, CEIL_U, stoneW(-1, { base: false, floors: [{ y: 3.3, sides: [1] }] }));
  wall(6.4, 1.6, 15, 1.6, L_B, CEIL_U, stoneW(-1, { floors: [L_M], ops: [
    { k: 'door', at: [7.25, 8.85], y0: 0, h: 2.4, double: true, swing: 1, style: 'front', name: 'Front door', handle: 'chrome' },
    { k: 'win', at: [7.25, 8.85], y0: 2.45, y1: 2.6, rise: 0.42, grid: [5, 1] },
    { k: 'oval', at: [7.6, 8.5], y0: 4.15, y1: 5.35 },
    { k: 'win', at: [11.1, 13.5], y0: 0.35, y1: 5.0, rise: 0.55, grid: [4, 7], curtain: 'gold' },
  ] }));
  wall(15, 1.6, 15, 17.6, L_B, CEIL_U, brickW(-1, { floors: [L_B, L_M, L_U], skins: [{ side: 1, mat: 'purple', at: [13.0, 17.6], y0: L_U }], ops: [
    { k: 'win', at: [8.0, 10.4], y0: 0.45, y1: 2.6, grid: [3, 2], curtain: 'taupe' },
    { k: 'win', at: [7.9, 9.5], y0: 4.1, y1: 5.6, grid: [2, 1], curtain: 'cream' },
    { k: 'win', at: [13.2, 14.2], y0: -1.0, y1: -0.45 },
    { k: 'win', at: [3.4, 4.6], y0: 0.5, y1: 2.6, grid: [2, 2], curtain: 'gold' },
  ] }));
  wall(0, 17.6, 6.6, 17.6, L_B, CEIL_U, brickW(1, { floors: [L_B, L_M, L_U], ops: [
    { k: 'win', at: [0.7, 5.5], y0: 0.35, y1: 2.65, grid: [4, 2], curtain: 'sheerCream' },
    { k: 'win', at: [0.35, 2.65], y0: 4.15, y1: 5.35, grid: [3, 1] },
    { k: 'win', at: [5.4, 6.2], y0: 4.0, y1: 5.6 },
    { k: 'win', at: [1.0, 2.8], y0: -2.3, y1: -0.65, grid: [2, 1] },
    { k: 'win', at: [4.4, 6.2], y0: -2.45, y1: -0.65, grid: [3, 1] },
  ] }));
  wall(8.8, 17.6, 15, 17.6, L_B, CEIL_U, brickW(1, { floors: [L_B, L_M, L_U], ops: [
    { k: 'door', at: [9.15, 9.95], y0: 0, h: 2.3, swing: -1, style: 'glass', name: 'Deck door', handle: 'chrome' },
    { k: 'win', at: [13.6, 14.6], y0: 1.05, y1: 2.3 },
    { k: 'win', at: [9.6, 10.6], y0: 4.0, y1: 5.6 },
    { k: 'win', at: [12.6, 13.6], y0: 4.0, y1: 5.6 },
    { k: 'win', at: [9.4, 11.0], y0: -2.45, y1: -0.65, grid: [2, 1] },
    { k: 'win', at: [12.8, 14.4], y0: -2.45, y1: -0.65, grid: [2, 1] },
  ] }));
  wall(6.6, 17.6, 6.6, 18.8, L_B, CEIL_U, brickW(1, { floors: [L_B, L_M, L_U], skins: [{ side: -1, mat: 'purple', y0: L_U }], ops: [
    { k: 'win', at: [17.85, 18.55], y0: 0.35, y1: 2.6 }, { k: 'win', at: [17.9, 18.5], y0: 4.0, y1: 5.4 }, { k: 'win', at: [17.9, 18.5], y0: -2.6, y1: -0.8 },
  ] }));
  wall(8.8, 17.6, 8.8, 18.8, L_B, CEIL_U, brickW(-1, { floors: [L_B, L_M, L_U], skins: [{ side: 1, mat: 'purple', y0: L_U }], ops: [
    { k: 'win', at: [17.85, 18.55], y0: 0.35, y1: 2.6 }, { k: 'win', at: [17.9, 18.5], y0: 4.0, y1: 5.4 }, { k: 'win', at: [17.9, 18.5], y0: -2.6, y1: -0.8 },
  ] }));
  wall(6.6, 18.8, 8.8, 18.8, L_B, CEIL_U, brickW(1, { floors: [L_B, L_M, L_U], skins: [{ side: -1, mat: 'purple', y0: L_U }], ops: [
    { k: 'win', at: [6.85, 8.55], y0: 0.35, y1: 2.6, grid: [2, 2] },
    { k: 'win', at: [7.0, 8.4], y0: 4.0, y1: 5.1, rise: 0.55, grid: [2, 2] },
    { k: 'door', at: [7.15, 8.25], y0: L_B, h: 2.1, double: true, swing: -1, style: 'french', name: 'Patio doors', handle: 'chrome' },
  ] }));

  // ---------------------------------------------------------------- main floor interior walls
  // garage wall: coat closet near the hall, LOCKED garage door at the bottom of the 3 steps
  wall(0, 6.0, 6.4, 6.0, -0.45, CEIL_M, { t: 0.16, baseSides: [1], floors: [{ y: -0.45, sides: [1] }], skins: [{ side: 1, mat: 'pwdGreen', at: [0, 1.6], y0: -0.45 }], ops: [
    { k: 'door', at: [1.62, 2.37], y0: -0.45, h: 2.05, swing: -1, locked: true, name: 'Garage door' },
    { k: 'door', at: [3.55, 4.75], y0: 0, h: 2.0, double: true, swing: 1, style: 'closet', name: 'Closet' },
  ] });
  wall(3.5, 5.4, 4.8, 5.4, -0.45, CEIL_M, { base: false }); wall(3.5, 5.4, 3.5, 6.0, -0.45, CEIL_M, { base: false }); wall(4.8, 5.4, 4.8, 6.0, -0.45, CEIL_M, { base: false });
  box('whiteMatte', 3.55, 4.75, -0.45, 0, 5.45, 6.0, true);
  // powder room straight ahead at the bottom of the steps (black door)
  wall(1.6, 6.0, 1.6, 7.4, -0.45, CEIL_M, { skins: [{ side: 1, mat: 'pwdGreen' }], floors: [-0.45], ops: [{ k: 'door', at: [6.3, 7.1], y0: -0.45, swing: 1, open: true, mat: 'blackPanel', name: 'Powder room' }] });
  // office on the right (glass french door)
  wall(0, 7.4, 3.85, 7.4, -0.45, CEIL_M, { skins: [{ side: -1, mat: 'pwdGreen', at: [0, 1.6] }], floors: [{ y: 0, sides: [1] }], ops: [{ k: 'door', at: [3.0, 3.75], y0: 0, h: 2.1, swing: 1, style: 'french', open: true, name: 'Office door', handle: 'chrome' }] });
  wall(3.85, 7.4, 3.85, 9.9, L_M, CEIL_M, {});
  wall(0, 10.8, 3.9, 10.8, L_M, CEIL_M, {});
  // garage/foyer wall (full height: continues up as the big bedroom's east wall)
  wall(6.4, 1.6, 6.4, 6.0, -0.45, CEIL_U, { t: 0.16, floors: [{ y: 0, sides: [-1] }, { y: 3.3, sides: [1] }] });
  wall(6.4, 6.0, 6.4, 6.6, CEIL_M, CEIL_U, { t: 0.16, base: false });
  // family room / breakfast: arch with knee wall + columns
  wall(6.2, 13.0, 6.2, 17.6, L_M, CEIL_M, { ops: [{ k: 'arch', at: [13.15, 17.45], y0: 0, y1: 2.45, rise: 0.4 }] });
  box('wall', 6.13, 6.27, 0, 1.0, 14.3, 16.75, true); box('trim', 6.08, 6.32, 1.0, 1.05, 14.25, 16.8);
  for (const z of [14.35, 16.7]) { cyl('trim', 0.12, 0.12, 1.4, 6.2, 1.05, z, 20); cyl('trim', 0.16, 0.16, 0.06, 6.2, 1.05, z, 20); cyl('trim', 0.15, 0.15, 0.08, 6.2, 2.37, z, 20); }
  // dining / butler's pantry / kitchen  (fridge first, the pantry with the coffee machines to its left)
  wall(9.6, 11.0, 15, 11.0, L_M, CEIL_M, { ops: [{ k: 'open', at: [12.6, 13.6], y0: 0, h: 2.1 }] });
  wall(12.4, 11.0, 12.4, 12.4, L_M, CEIL_M, {}); wall(14.2, 11.0, 14.2, 12.4, L_M, CEIL_M, {});
  wall(9.6, 12.4, 15, 12.4, L_M, CEIL_M, { ops: [{ k: 'open', at: [12.6, 13.6], y0: 0, h: 2.1 }] });
  wall(9.6, 11.0, 9.6, 12.4, L_M, CEIL_M, {});
  // living / dining (living room is 2 storeys, so this wall goes all the way up)
  wall(9.6, 6.8, 15, 6.8, L_M, CEIL_U, { floors: [L_M, { y: L_U, sides: [1] }], skins: [{ side: 1, mat: 'slateGreen', y0: L_U }], ops: [{ k: 'arch', at: [10.3, 14.3], y0: 0, y1: 2.5, rise: 0.35 }] });
  for (const x of [10.45, 14.15]) { box('trim', x - 0.17, x + 0.17, 0, 0.95, 6.62, 6.98, true); cyl('trim', 0.11, 0.11, 1.5, x, 0.95, 6.8, 20); cyl('trim', 0.15, 0.15, 0.08, x, 2.42, 6.8, 20); }
  wall(9.6, 1.6, 9.6, 6.8, L_M, CEIL_U, { ops: [{ k: 'arch', at: [2.4, 6.1], y0: 0, y1: 2.55, rise: 0.6 }] });
  wall(9.6, 6.8, 9.6, 11.0, L_M, CEIL_M, { ops: [{ k: 'open', at: [7.25, 8.95], y0: 0, h: 2.45 }] });
  for (const z of [7.4, 8.8]) { cyl('trim', 0.1, 0.1, 2.3, 9.95, 0, z, 18); }

  // ---------------------------------------------------------------- upstairs walls (from the sketch)
  // ONE hall (x 6.4..9.6) running from the foyer overlook back to the master; every room opens off it.
  // west side, front to back: big bedroom (+ its walk-in), jack-and-jill, bedroom (+ walk-in), stairwell
  wall(0, 5.2, 4.6, 5.2, L_U, CEIL_U, { ops: [{ k: 'door', at: [1.9, 2.7], y0: L_U, swing: 1, open: true, name: 'Bathroom' }] });
  wall(2.8, 5.2, 2.8, 7.6, L_U, CEIL_U, {});
  wall(0, 6.8, 2.8, 6.8, L_U, CEIL_U, { ops: [{ k: 'door', at: [1.9, 2.7], y0: L_U, swing: -1, open: true, name: 'Bathroom' }] });
  wall(4.6, 5.2, 4.6, 7.6, L_U, CEIL_U, { ops: [{ k: 'door', at: [5.5, 6.3], y0: L_U, swing: 1, open: true, name: 'Walk-in closet' }] });
  wall(2.8, 7.6, 6.4, 7.6, L_U, CEIL_U, {});
  wall(6.4, 6.6, 6.4, 10.0, L_U, CEIL_U, { ops: [
    { k: 'door', at: [6.7, 7.5], y0: L_U, swing: 1, open: true, name: 'Big bedroom' },
    { k: 'door', at: [9.05, 9.85], y0: L_U, swing: 1, open: true, name: 'Bedroom' },
  ] });
  // bedroom: walk-in closet on the left right beside the door
  wall(3.85, 7.6, 3.85, 10.0, L_U, CEIL_U, { ops: [{ k: 'open', at: [9.0, 9.9], y0: L_U, h: 2.1 }] });
  wall(3.85, 8.9, 6.4, 8.9, L_U, CEIL_U, { ops: [{ k: 'door', at: [5.4, 6.2], y0: L_U, swing: -1, open: true, name: 'Walk-in closet' }] });
  // master suite: ensuite + his/hers walk-ins on the west, master bedroom across the back
  wall(0, 12.8, 3.9, 12.8, L_U, CEIL_U, { skins: [{ side: -1, mat: 'teal' }] });
  wall(3.9, 12.8, 6.4, 12.8, L_U, CEIL_U, {});
  wall(2.8, 12.8, 2.8, 17.6, L_U, CEIL_U, { ops: [{ k: 'door', at: [14.6, 15.4], y0: L_U, swing: 1, open: true, name: 'Ensuite' }] });
  wall(2.8, 14.6, 5.2, 14.6, L_U, CEIL_U, { ops: [{ k: 'door', at: [3.3, 4.1], y0: L_U, swing: -1, open: true, name: "Dad's closet" }] });
  wall(2.8, 15.4, 5.2, 15.4, L_U, CEIL_U, { ops: [{ k: 'door', at: [3.3, 4.1], y0: L_U, swing: 1, open: true, name: "Mom's closet" }] });
  wall(5.2, 12.8, 5.2, 17.6, L_U, CEIL_U, { ops: [{ k: 'open', at: [14.6, 15.4], y0: L_U, h: 2.1 }] });
  wall(5.2, 13.0, 15, 13.0, L_U, CEIL_U, { ops: [{ k: 'door', at: [7.3, 8.7], y0: L_U, h: 2.15, double: true, swing: 1, open: true, name: 'Master bedroom' }] });
  // east side: my bedroom (front), laundry (back); my closet + my washroom off my bedroom
  wall(9.6, 6.8, 9.6, 13.0, L_U, CEIL_U, { ops: [
    { k: 'door', at: [7.2, 8.05], y0: L_U, swing: -1, open: true, name: 'My bedroom' },
    { k: 'door', at: [11.2, 12.0], y0: L_U, swing: -1, open: true, name: 'Laundry room' },
  ] });
  wall(9.6, 10.6, 15, 10.6, L_U, CEIL_U, { ops: [
    { k: 'door', at: [11.8, 12.6], y0: L_U, swing: 1, open: true, name: 'My closet' },
    { k: 'door', at: [13.6, 14.4], y0: L_U, swing: 1, open: true, name: 'My washroom' },
  ] });
  wall(11.4, 10.6, 11.4, 13.0, L_U, CEIL_U, { skins: [{ side: -1, mat: 'slateGreen' }] }); wall(13.0, 10.6, 13.0, 13.0, L_U, CEIL_U, { skins: [{ side: 1, mat: 'slateGreen' }] });
  // hall railing over the foyer
  railX(6.45, 9.55, 6.6, L_U);

  // ---------------------------------------------------------------- basement walls (from the sketch)
  wall(0, 6.0, 6.4, 6.0, L_B, CEIL_B, { t: 0.25, core: 'wallWarm', baseSides: [1] });
  wall(6.4, 1.6, 6.4, 6.0, L_B, CEIL_B, { t: 0.25, core: 'wallWarm', baseSides: [-1], skins: [{ side: -1, mat: 'gymGreen' }] });
  wall(6.4, 6.4, 12.6, 6.4, L_B, CEIL_B, { core: 'wallWarm', skins: [{ side: -1, mat: 'gymGreen' }], ops: [{ k: 'door', at: [8.3, 9.2], y0: L_B, swing: -1, open: true, name: 'Gym' }] });
  wall(12.6, 1.6, 12.6, 6.4, L_B, CEIL_B, { core: 'wallWarm', skins: [{ side: 1, mat: 'gymGreen' }], ops: [
    { k: 'door', at: [2.6, 3.4], y0: L_B, swing: -1, name: 'Mechanical room' },
    { k: 'door', at: [4.4, 5.2], y0: L_B, swing: -1, name: 'Gym closet' },
  ] });
  wall(12.6, 6.4, 15, 6.4, L_B, CEIL_B, { core: 'wallWarm' });
  // storage (front-west) and the small bar behind the wall next to the stairs
  wall(6.4, 6.4, 6.4, 10.0, L_B, CEIL_B, { core: 'wallWarm', ops: [{ k: 'door', at: [8.0, 8.8], y0: L_B, swing: 1, name: 'Storage' }] });
  wall(0, 10.0, 3.9, 10.0, L_B, CEIL_B, { core: 'wallWarm' });
  // corridor east side: bath + storage, then the bedroom (open to the rec room past a post)
  wall(9.8, 6.4, 9.8, 11.0, L_B, CEIL_B, { core: 'wallWarm', ops: [
    { k: 'door', at: [7.2, 8.0], y0: L_B, swing: -1, open: true, name: 'Basement bathroom' },
    { k: 'door', at: [9.6, 10.4], y0: L_B, swing: -1, name: 'Storage' },
  ] });
  wall(9.8, 8.8, 15, 8.8, L_B, CEIL_B, { core: 'wallWarm' });
  wall(9.8, 11.0, 15, 11.0, L_B, CEIL_B, { core: 'wallWarm' });
  wall(11.2, 11.0, 11.2, 17.6, L_B, CEIL_B, { core: 'wallWarm', ops: [{ k: 'open', at: [13.6, 17.35], y0: L_B, h: 2.45, cased: false }] });
  box('walnut', 11.1, 11.3, L_B, CEIL_B, 15.3, 15.6, true);

  // ---------------------------------------------------------------- floors / ceilings
  for (const [x0, x1, z0, z1] of [[0, 6.4, 6.0, 17.6], [6.4, 15, 1.6, 17.6], [6.6, 8.8, 17.6, 18.8]]) { box('concrete', x0, x1, L_B - 0.3, L_B - 0.02, z0, z1, true); finish('cherry', x0, x1, z0, z1, L_B); }
  finish('cork', 6.4, 12.6, 1.6, 6.4, L_B, 0.003); finish('tileSlate', 9.8, 15, 6.4, 8.8, L_B, 0.003);
  for (const r of [[9.8, 15, 8.8, 11.0], [12.6, 15, 1.6, 6.4], [0, 6.6, 6.0, 10.0], [0, 2.0, 10.0, 12.4]]) finish('concrete', ...r, L_B, 0.003);
  // main floor (hole for the stairwell; the garage hall drops 3 steps)
  const mainRects = [[0, 3.0, 7.4, 17.6], [3.0, 3.95, 6.0, 17.6], [3.95, 6.4, 6.0, 9.95], [3.95, 6.4, 12.85, 17.6], [6.4, 15, 1.6, 17.6], [6.6, 8.8, 17.6, 18.8]];
  for (const [x0, x1, z0, z1] of mainRects) { slab(x0, x1, z0, z1, L_M); finish('cherry', x0, x1, z0, z1, L_M); }
  // sunken landing + powder room (garage level) and the 3 steps
  box('ceiling', 0, 2.4, -0.75, -0.47, 6.0, 7.4, true); finish('tileDark', 0, 2.4, 6.0, 7.4, -0.45);
  box('oak', 2.4, 2.7, -0.75, -0.30, 6.0, 7.4, true); box('oak', 2.7, 3.0, -0.75, -0.15, 6.0, 7.4, true);
  box('trim', 2.4, 3.0, -0.3, -0.29, 6.0, 6.02); box('ceiling', 2.4, 3.0, -0.75, -0.3, 7.38, 7.4);
  finish('tileBeige', 6.2, 10.0, 13.0, 17.6, L_M, 0.003); finish('tileBeige', 10.0, 15, 12.4, 17.6, L_M, 0.003); finish('tileBeige', 6.6, 8.8, 17.6, 18.8, L_M, 0.003);
  finish('tileBeige', 12.4, 14.2, 11.0, 12.4, L_M, 0.003);
  finish('tileBeige', 6.6, 9.4, 1.6, 4.0, L_M, 0.003);
  box('concrete', 0, 6.4, -0.75, -0.45, 0, 6.0, true);
  // upper floor (foyer + living room are open to the roof; hole for the stairwell)
  const upRects = [[0, 3.95, 0, 17.6], [3.95, 6.4, 0, 10.0], [3.95, 6.4, 12.8, 17.6], [6.4, 9.6, 6.6, 17.6], [9.6, 15, 6.8, 17.6], [6.6, 8.8, 17.6, 18.8]];
  for (const [x0, x1, z0, z1] of upRects) { slab(x0, x1, z0, z1, L_U); finish('cherry', x0, x1, z0, z1, L_U); }
  finish('maple', 5.2, 15, 13.0, 17.6, L_U, 0.003); finish('maple', 6.6, 8.8, 17.6, 18.8, L_U, 0.003);
  finish('tileBeige', 0, 2.8, 12.8, 17.6, L_U, 0.003); finish('tileBeige', 0, 2.8, 5.2, 6.8, L_U, 0.003);
  finish('tileWhite', 13.0, 15, 10.6, 13.0, L_U, 0.003); finish('tileWhite', 9.6, 11.4, 10.6, 13.0, L_U, 0.003);
  for (const [x0, x1, z0, z1] of [[0, 6.4, 0, 17.6], [6.4, 15, 1.6, 17.6], [6.6, 8.8, 17.6, 18.8]]) box('ceiling', x0, x1, CEIL_U, CEIL_U + 0.15, z0, z1);
  torus('trim', 1.9, 0.05, 12.3, CEIL_M - 0.32, 8.9, Math.PI / 2, 48);
  box('ceiling', 9.7, 14.9, CEIL_M - 0.3, CEIL_M, 6.9, 7.2); box('ceiling', 9.7, 14.9, CEIL_M - 0.3, CEIL_M, 10.6, 10.9);
  box('ceiling', 9.7, 10.2, CEIL_M - 0.3, CEIL_M, 6.9, 10.9); box('ceiling', 14.4, 14.9, CEIL_M - 0.3, CEIL_M, 6.9, 10.9);
  box('walnut', 6.45, 9.55, 3.0, 3.08, 6.45, 6.62);

  buildStairs();

  // ---------------------------------------------------------------- rooms (for the HUD)
  room('Garage (locked)', 1, 0, 6.4, 0, 6.0); room('Foyer', 1, 6.4, 9.6, 1.6, 6.6); room('Living room', 1, 9.6, 15, 1.6, 6.8);
  room('Dining room', 1, 9.6, 15, 6.8, 11.0); room("Butler's pantry", 1, 12.4, 14.2, 11.0, 12.4); room('Kitchen', 1, 10.0, 15, 12.4, 17.6);
  room('Breakfast area', 1, 6.2, 10.0, 13.0, 18.8); room('Office', 1, 0, 3.85, 7.4, 10.8); room('Family room', 1, 0, 6.2, 10.8, 17.6);
  room('Powder room', 1, 0, 1.6, 6.0, 7.4); room('Garage entrance', 1, 1.6, 3.9, 6.0, 7.4); room('Hallway', 1, 3.9, 9.6, 6.0, 13.0);
  room('Deck', 1, 9.0, 13.4, 17.6, 20.8);
  room('Big bedroom', 2, 0, 6.4, 0, 5.2); room('Big bedroom', 2, 4.6, 6.4, 5.2, 7.6); room('Jack & jill bathroom', 2, 0, 2.8, 5.2, 6.8);
  room("Big bedroom's closet", 2, 2.8, 4.6, 5.2, 7.6); room('Walk-in closet', 2, 3.85, 6.4, 7.6, 8.9); room('Bedroom', 2, 0, 6.4, 6.8, 12.8);
  room('Ensuite', 2, 0, 2.8, 12.8, 17.6); room("Dad's closet", 2, 2.8, 5.2, 12.8, 14.6); room('Closet hallway', 2, 2.8, 5.2, 14.6, 15.4);
  room("Mom's closet", 2, 2.8, 5.2, 15.4, 17.6); room('Master bedroom', 2, 5.2, 15, 13.0, 18.8); room('My bedroom', 2, 9.6, 15, 6.8, 10.6);
  room('Laundry room', 2, 9.6, 11.4, 10.6, 13.0); room('My closet', 2, 11.4, 13.0, 10.6, 13.0); room('My washroom', 2, 13.0, 15, 10.6, 13.0);
  room('Upstairs hall', 2, 6.4, 9.6, 5.2, 13.0);
  room('Gym', 0, 6.4, 12.6, 1.6, 6.4); room('Mechanical room', 0, 12.6, 15, 1.6, 6.4); room('Basement bathroom', 0, 9.8, 15, 6.4, 8.8);
  room('Storage', 0, 9.8, 15, 8.8, 11.0); room('Bar', 0, 0, 3.9, 10.0, 12.4); room('Storage', 0, 0, 6.4, 6.0, 10.0);
  room('Basement bedroom', 0, 11.2, 15, 11.0, 17.6); room('Rec room', 0, 0, 11.2, 12.4, 18.8); room('Basement corridor', 0, 6.4, 11.2, 6.4, 12.4);
}

// straight balustrades
function railX(x0, x1, z, y, solid = true) {
  box('oak', x0, x1, y + 0.9, y + 0.98, z - 0.045, z + 0.045); box('oak', x0, x1, y, y + 0.06, z - 0.035, z + 0.035);
  for (let x = x0 + 0.06; x < x1; x += 0.12) cyl('iron', 0.011, 0.011, 0.84, x, y + 0.06, z, 6);
  if (solid) col(x0, x1, y, y + 1.0, z - 0.06, z + 0.06);
}
function railZ(z0, z1, x, y, solid = true, m = 'oak', bm = 'iron') {
  box(m, x - 0.045, x + 0.045, y + 0.9, y + 0.98, z0, z1); box(m, x - 0.035, x + 0.035, y, y + 0.06, z0, z1);
  for (let z = z0 + 0.06; z < z1; z += 0.12) cyl(bm, 0.011, 0.011, 0.84, x, y + 0.06, z, 6);
  if (solid) col(x - 0.06, x + 0.06, y, y + 1.0, z0, z1);
}

// ---------------------------------------------------------------- roofs
function roofFaces(quads, m, ov) {
  const pos = [], uv = [];
  for (const q of quads) {
    const [A, B, C, D] = q.map(p => new THREE.Vector3(...p));
    const e = B.clone().sub(A).normalize(), up = new THREE.Vector3().crossVectors(e, (D || C).clone().sub(A)).cross(e).normalize();
    const P = q.length === 4 ? [A, B, C, A, C, D] : [A, B, C];
    for (const p of P) { pos.push(p.x, p.y, p.z); const r = p.clone().sub(A); uv.push(r.dot(e), r.dot(up)); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
  push(m, g, true);
  const g2 = g.clone(); const idx = g2.attributes.position.array; // underside (soffit colour)
  for (let i = 0; i < idx.length; i += 9) { for (let k = 0; k < 3; k++) { const t = idx[i + 3 + k]; idx[i + 3 + k] = idx[i + 6 + k]; idx[i + 6 + k] = t; } }
  for (let i = 1; i < idx.length; i += 3) idx[i] -= 0.04;
  g2.computeVertexNormals(); push('trim', g2);
}
function hipRoof(x0, x1, z0, z1, y, h, ov) {
  const X0 = x0 - ov, X1 = x1 + ov, Z0 = z0 - ov, Z1 = z1 + ov, W = X1 - X0, D = Z1 - Z0, Y = y + h;
  if (W >= D) {
    const zm = (Z0 + Z1) / 2, r0 = X0 + D / 2, r1 = X1 - D / 2;
    roofFaces([[[X0, y, Z0], [X1, y, Z0], [r1, Y, zm], [r0, Y, zm]], [[X1, y, Z1], [X0, y, Z1], [r0, Y, zm], [r1, Y, zm]], [[X0, y, Z1], [X0, y, Z0], [r0, Y, zm]], [[X1, y, Z0], [X1, y, Z1], [r1, Y, zm]]], 'shingle');
  } else {
    const xm = (X0 + X1) / 2, r0 = Z0 + W / 2, r1 = Z1 - W / 2;
    roofFaces([[[X1, y, Z0], [X1, y, Z1], [xm, Y, r1], [xm, Y, r0]], [[X0, y, Z1], [X0, y, Z0], [xm, Y, r0], [xm, Y, r1]], [[X0, y, Z0], [X1, y, Z0], [xm, Y, r0]], [[X1, y, Z1], [X0, y, Z1], [xm, Y, r1]]], 'shingle');
  }
  fascia(X0, X1, Z0, Z1, y);
}
function fascia(X0, X1, Z0, Z1, y) {
  box('trim', X0, X1, y - 0.2, y, Z0 - 0.03, Z0); box('trim', X0, X1, y - 0.2, y, Z1, Z1 + 0.03);
  box('trim', X0 - 0.03, X0, y - 0.2, y, Z0, Z1); box('trim', X1, X1 + 0.03, y - 0.2, y, Z0, Z1);
}
// front-facing gable: ridge runs along z, gable end at z0 (stone triangle)
function frontGable(x0, x1, z0, z1, y, h, ov, endMat = 'stone') {
  const X0 = x0 - ov, X1 = x1 + ov, Z0 = z0 - ov, xm = (x0 + x1) / 2, Y = y + h + ov * h / ((x1 - x0) / 2);
  const yE = y - ov * h / ((x1 - x0) / 2) * 0.0;
  roofFaces([[[X0, yE, Z0], [X0, yE, z1], [xm, Y, z1], [xm, Y, Z0]].reverse(), [[X1, yE, z1], [X1, yE, Z0], [xm, Y, Z0], [xm, Y, z1]].reverse()], 'shingle');
  // gable wall
  const s = new THREE.Shape(); s.moveTo(x0, 0); s.lineTo(x1, 0); s.lineTo(xm, h); s.lineTo(x0, 0);
  const g = shapeGeo(s, 0.3); g.translate(0, y - 0.15, z0 - 0.2); push(endMat, g);
  // rake trim
  const ang = Math.atan2(h, (x1 - x0) / 2), len = Math.hypot(h, (x1 - x0) / 2) + ov;
  obox('trim', len, 0.2, 0.06, (x0 + xm) / 2 - ov / 2 * Math.cos(ang), y + h / 2 - 0.05, Z0 - 0.02, 0, 0, ang);
  obox('trim', len, 0.2, 0.06, (x1 + xm) / 2 + ov / 2 * Math.cos(ang), y + h / 2 - 0.05, Z0 - 0.02, 0, 0, -ang);
  // louvred vent
  box('trim', xm - 0.3, xm + 0.3, y + h * 0.45, y + h * 0.45 + 0.7, z0 - 0.26, z0 - 0.2);
  for (let i = 0; i < 6; i++) box('whiteMatte', xm - 0.24, xm + 0.24, y + h * 0.45 + 0.08 + i * 0.1, y + h * 0.45 + 0.12 + i * 0.1, z0 - 0.3, z0 - 0.25);
}
function buildRoof() {
  const y = CEIL_U + 0.15;
  hipRoof(0, 15, 6.0, 17.6, y, 3.4, 0.45);
  hipRoof(6.6, 8.8, 17.6, 18.8, y, 1.0, 0.35);
  frontGable(0, 6.4, 0, 9.0, y, 3.9, 0.4);
  frontGable(6.4, 15, 1.6, 8.0, y, 3.4, 0.4);
  // small dormer gable over the oval window
  // pent roof over the garage doors
  roofFaces([[[ -0.35, 2.85, -0.75], [6.75, 2.85, -0.75], [6.75, 3.2, -0.12], [-0.35, 3.2, -0.12]]], 'shingle');
  box('trim', -0.35, 6.75, 2.7, 2.86, -0.78, -0.74);
  // garage overhead doors (closed)
  for (const x0 of [0.4, 3.4]) {
    box('garageDoor', x0, x0 + 2.6, -0.45, 1.85, -0.06, 0.02, true);
    for (let r = 0; r < 4; r++) {
      const y0 = -0.45 + 0.08 + r * 0.56;
      for (let c = 0; c < 4; c++) {
        const cx0 = x0 + 0.1 + c * 0.615;
        if (r === 3) { box('trim', cx0, cx0 + 0.56, y0, y0 + 0.44, -0.09, -0.06); box('darkWindow', cx0 + 0.04, cx0 + 0.52, y0 + 0.06, y0 + 0.38, -0.1, -0.09); for (let k = 1; k < 3; k++) box('trim', cx0 + 0.04 + k * 0.16 - 0.01, cx0 + 0.04 + k * 0.16 + 0.01, y0 + 0.06, y0 + 0.38, -0.105, -0.09); }
        else { box('garageDoor', cx0, cx0 + 0.56, y0, y0 + 0.46, -0.09, -0.06); box('garageDoor', cx0 + 0.05, cx0 + 0.51, y0 + 0.05, y0 + 0.41, -0.11, -0.09); }
      }
    }
    // stone arch trim over each garage door
    const W = wallBasis(x0, -0.22, x0 + 2.6, -0.22);
    archRing(W, 'stone', -0.08, 2.68, 1.62, 0.32, 0, 0.06, 0.2);
  }
}
