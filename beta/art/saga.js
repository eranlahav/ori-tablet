// Saga episodes 4-9 (cave, sword, night in the village, diamonds, the dog, the portal). Same voxel style and engine as stories.js; original art only.
// Usage: node art/saga.js [s4..s9] [page]  -> writes art/s4/p{n}-{base|reveal}-{wide|tall}.svg
const { hash } = require('./voxel.js');
const T = require('./stories.js');
const { build, person, house, renderAll, islandH, N, STONE, pick, DARK } = T;

/* ---------- island for episodes 4-6: stone hill with a cave mouth at the back-left, village at the front-right ---------- */
const MT = { x1: 7, y0: 3, y1: 13 };
function hmSaga() { const H = [];
  for (let x = 0; x < N; x++) { H[x] = []; for (let y = 0; y < N; y++) { let h = islandH(x, y, 2.7);
    if (h >= 1 && x <= MT.x1 && y >= MT.y0 && y <= MT.y1) { const back = (MT.x1 - x) + Math.min(y - MT.y0, MT.y1 - y);
      h = Math.min(9, 5 + Math.floor(back * 0.6 + hash(x, y, 3) * 1.4)); if (y === MT.y0 || y === MT.y1) h = Math.min(h, 4 + Math.floor(hash(x, y, 6) * 2)); }
    H[x][y] = h; } } H.mt = true; return H; }
const IRONORE = '#D9A27E';
const CAVE_MOUTH = { y: 9, w: 3, z0: 3, z1: 5 };
const TREES = [[3, 16, 4, 1.8], [10, 2, 3, 1.5]];
const FLOW = [[12, 15, '#F2C94C'], [9, 16, '#F4E9D0'], [15, 15, '#E8732C'], [11, 9, '#F4E9D0']];
const VILLAGE = [{ x: 12, y: 3, w: 4, d: 3 }, { x: 15, y: 7, w: 3, d: 3 }];
const VPATH = [[8, 10], [9, 10], [10, 10], [11, 10], [12, 10], [13, 10], [14, 10], [14, 9], [13, 7], [13, 8], [13, 9], [12, 11], [12, 12], [12, 13]];

/* ---------- characters that only the saga needs ---------- */
function mobber(S, G, p) { const { x: ox, y: oy, kind } = p; const z0 = (p.z != null ? p.z : G(ox, oy)); const u = p.scale || 0.44; const k = ox + oy + 1.2; let n = 0;
  const B = (x, y, z, w, d, h, col, o) => S.box(ox + x * u, oy + y * u, z0 + z * u, w * u, d * u, h * u, col, Object.assign({ sort: k + (n++) * 0.001, nojit: true, fl: 0.9, fr: 0.78 }, o || {}));
  if (kind === 'skeleton') { const BN = '#E9E4D6', BN2 = '#C9C2AE', EYE = '#1E1822';
    B(0.6, 0.6, 0, 1.0, 1.0, 4.2, BN2); B(0.6, 3.0, 0, 1.0, 1.0, 4.2, BN2); // legs
    B(0.4, 0.2, 4.2, 1.4, 4.2, 4.6, BN, { decR: [[0, 0.9 * u, 1.4 * u, 0.5 * u, BN2], [0, 2.1 * u, 1.4 * u, 0.5 * u, BN2], [0, 3.3 * u, 1.4 * u, 0.5 * u, BN2]] }); // ribs
    B(0.6, -0.9, 5.2, 1.0, 1.0, 3.8, BN2); // far arm
    B(-0.5, 0.0, 8.8, 3.4, 4.4, 3.8, BN, { decR: [[0.7 * u, 1.6 * u, 1.0 * u, 1.0 * u, EYE], [2.7 * u, 1.6 * u, 1.0 * u, 1.0 * u, EYE], [1.3 * u, 0.4 * u, 1.8 * u, 0.4 * u, EYE]] });
    if (p.bow) { B(1.6, 4.4, 6.8, 2.6, 1.0, 1.0, BN2); B(3.8, 3.6, 3.6, 0.5, 0.5, 7.4, '#7A4E2B'); } else B(0.6, 4.4, 5.2, 1.0, 1.0, 3.8, BN2);
    return; }
  if (kind === 'zombie') { const SKIN = '#7FB35A', TOP = '#3E7F9A', TOP2 = '#346C84', PANTS = '#4B3F6B', EYE = '#1E1822', HAIR = '#4F7F3A';
    B(0, 0, 0, 2.3, 2, 1, '#3A3040'); B(0, 2.4, 0, 2.3, 2, 1, '#3A3040'); B(0, 0, 1, 2, 2, 3, PANTS); B(0, 2.4, 1, 2, 2, 3, PANTS);
    B(0.2, -1.5, 7.2, 4.5, 1.4, 1.5, SKIN);
    B(0, -0.1, 4, 2.2, 4.6, 5, TOP, { decR: [[1.0 * u, 0.6 * u, 1.4 * u, 1.2 * u, TOP2]] });
    B(-0.7, -0.1, 9, 3.6, 4.6, 4, SKIN, { decR: [[0, 3.1 * u, 4.6 * u, 0.9 * u, HAIR], [0.8 * u, 1.7 * u, 0.9 * u, 0.8 * u, EYE], [3.0 * u, 1.7 * u, 0.9 * u, 0.8 * u, EYE], [1.5 * u, 0.5 * u, 1.6 * u, 0.5 * u, '#2F4A22']] });
    B(-0.9, -0.3, 13, 4.0, 5.0, 0.6, HAIR);
    B(0.3, 4.5, 7.2, 4.5, 1.4, 1.5, SKIN); return; }
  if (kind === 'golem') { const I = '#B9BEC6', I2 = '#9DA3AD', I3 = '#D3D8DF', EYE = '#FFB54A';
    B(0, 0.2, 0, 2.4, 2.2, 5, I2); B(0, 3.0, 0, 2.4, 2.2, 5, I2);
    B(-0.4, -0.6, 5, 3.4, 6.6, 6.4, I, { top: I3, decR: [[0.6 * u, 2.4 * u, 2.2 * u, 2.2 * u, I2], [1.0 * u, 0.6 * u, 0.4 * u, 0.4 * u, '#7D838D'], [4.8 * u, 0.6 * u, 0.4 * u, 0.4 * u, '#7D838D']] });
    const up = p.arms === 'up';
    if (up) { B(0.2, -2.2, 9, 1.8, 1.6, 6.5, I2); B(0.2, 6.0, 9, 1.8, 1.6, 6.5, I2); }
    else { B(0.2, -2.2, 2.6, 1.8, 1.6, 8.4, I2); B(0.2, 6.0, 2.6, 1.8, 1.6, 8.4, I2); }
    B(-0.2, 1.0, 11.4, 3.0, 3.6, 3.4, I3, { decR: [[0.5 * u, 1.6 * u, 0.9 * u, 0.7 * u, EYE], [2.2 * u, 1.6 * u, 0.9 * u, 0.7 * u, EYE], [1.0 * u, 0.4 * u, 1.6 * u, 0.4 * u, '#7D838D']] });
    return; }
}
// the hero, with what he carries in this part of the saga
function hero(S, G, p) { const q = Object.assign({ kind: 'ori' }, p); const hold = p.hold; if (hold) q.arms = 'up';
  person(S, G, q);
  const ox = p.x, oy = p.y, z0 = (p.z != null ? p.z : G(ox, oy)), u = p.scale || 0.44, k = ox + oy + 1.2 + 0.05; let n = 0;
  const B = (x, y, z, w, d, h, col, o) => S.box(ox + x * u, oy + y * u, z0 + z * u, w * u, d * u, h * u, col, Object.assign({ sort: k + (n++) * 0.001, nojit: true, fl: 0.9, fr: 0.78 }, o || {}));
  if (hold === 'torch') { B(0.9, 5.1, 13.4, 0.8, 0.8, 3.0, '#7A4E2B'); B(0.7, 4.9, 16.4, 1.2, 1.2, 1.4, '#F2A541', { top: '#FFF2C4', fl: 1.1, fr: 1 }); }
  if (hold === 'pick') { B(0.9, 5.0, 12.4, 0.8, 0.8, 4.4, '#7A4E2B'); B(0.5, 3.0, 16.4, 1.6, 4.8, 1.1, '#9FB3C8', { top: '#C8D6E4' }); }
  if (hold === 'sword') { B(0.5, 4.5, 13.5, 1.6, 2.2, 0.5, '#F2C94C'); B(0.9, 5.2, 14.0, 0.8, 0.8, 6.6, '#C9D2DC', { top: '#E3E9F0', fl: 1.05, fr: 0.92 }); }
  if (hold === 'dpick') { B(0.9, 5.0, 12.4, 0.8, 0.8, 4.4, '#7A4E2B'); B(0.5, 3.0, 16.4, 1.6, 4.8, 1.1, '#56D6E2', { top: '#C4F6FA' }); }
  if (hold === 'flint') { B(1.0, 4.8, 13.0, 1.0, 1.6, 1.0, '#8792A0', { top: '#B9C3CF' }); B(1.0, 5.6, 14.0, 1.0, 0.8, 1.0, '#4A4652'); }
  if (hold === 'rod') { B(0.9, 5.0, 12.6, 0.8, 0.8, 5.2, '#F2A541', { top: '#FFE58A', fl: 1.1, fr: 1 }); B(0.7, 4.8, 17.6, 1.2, 1.2, 0.8, '#FFD27A', { top: '#FFF2C4', fl: 1.1, fr: 1 }); }
  if (hold === 'honey') { B(0.9, 4.6, 12.8, 1.6, 1.6, 2.0, '#F2A541', { top: '#FFD27A', op: 0.95 }); B(1.3, 5.0, 14.8, 0.8, 0.8, 0.6, '#E9E4D6'); }
  if (hold === 'bone') { B(1.0, 4.4, 13.2, 0.8, 2.8, 0.8, '#F1ECDD', { top: '#FFFFFF' }); }
  if (hold === 'map') { B(1.6, 4.0, 12.6, 0.4, 4.0, 3.4, '#EADBB0', { decR: [[0.6 * u, 0.8 * u, 1.2 * u, 1.2 * u, '#56D6E2'], [2.2 * u, 2.0 * u, 1.4 * u, 0.4 * u, '#A0703A']] }); }
  if (p.shield) { B(2.3, -1.2, 4.0, 0.6, 3.2, 4.6, '#8A5A2E', { decR: [[1.3 * u, 0, 0.6 * u, 4.6 * u, '#3D6FB0'], [0, 2.0 * u, 3.2 * u, 0.6 * u, '#3D6FB0'], [0, 4.2 * u, 3.2 * u, 0.4 * u, '#B9C3CF']] }); }
  if (p.helmet) { B(-0.95, -0.35, 12.0, 4.1, 5.1, 2.4, '#B9C3CF', { top: '#E3E9F0', decR: [[0, 0, 5.1 * u, 0.5 * u, '#8792A0']] }); }
}
function torchOnWall(S, x, y, z) { S.box(x + 0.4, y + 0.42, z, 0.18, 0.18, 0.55, '#7A4E2B', { nojit: true, sort: 50 }); S.box(x + 0.36, y + 0.38, z + 0.55, 0.26, 0.26, 0.24, '#FFD27A', { nojit: true, top: '#FFF2C4', fl: 1.1, fr: 1, sort: 50.01 }); }
function furnace(S, G, x, y, lit) { const z = G(x, y); S.vox(x, y, z, '#77747F', { decR: [[0.2, 0.15, 0.6, 0.35, lit ? '#F2A541' : '#2A2230'], [0.25, 0.2, 0.5, 0.15, lit ? '#FFD27A' : '#2A2230'], [0.15, 0.62, 0.7, 0.12, '#5A5862']], top: '#8F8C97', sort: x + y + 1 }); }
function ingots(S, G, x, y, hot, n) { const z = G(x, y); const c = hot ? '#F2A541' : '#C9D2DC', t = hot ? '#FFD27A' : '#E3E9F0'; const at = [[0.1, 0.15], [0.1, 0.55], [0.5, 0.35]];
  for (let i = 0; i < (n || 3); i++) S.box(x + at[i][0], y + at[i][1], z + (i === 2 ? 0.18 : 0), 0.7, 0.32, 0.18, c, { nojit: true, top: t, sort: x + y + 1.3 + i * 0.01 }); }
function bones(S, x, y, z) { [[0, 0, 0.9, 0.18], [0.3, 0.5, 0.18, 0.8], [0.7, 0.2, 0.6, 0.16], [-0.1, 0.9, 0.5, 0.5]].forEach(([a, b, w, d], i) => S.box(x + a, y + b, z, w, d, 0.16, '#E9E4D6', { nojit: true, top: '#F4F0E4', sort: x + y + 1.4 + i * 0.01 }));
  S.box(x + 0.6, y + 0.9, z, 0.5, 0.5, 0.45, '#E9E4D6', { nojit: true, decR: [[0.08, 0.2, 0.12, 0.12, '#1E1822'], [0.3, 0.2, 0.12, 0.12, '#1E1822']], sort: x + y + 1.5 }); }
function bowOnFloor(S, x, y, z) { for (let i = 0; i < 9; i++) { const t = i / 8, bx = x + t * 2.6, by = y + Math.sin(t * Math.PI) * 0.9; S.box(bx, by, z, 0.36, 0.36, 0.2, '#8A5A2E', { nojit: true, top: '#B07A42', sort: x + y + 1.6 + i * 0.001 }); }
  S.box(x + 0.15, y + 0.1, z, 2.6, 0.08, 0.12, '#E9E2CF', { nojit: true, sort: x + y + 1.59 }); }
function poof(S, x, y, z) { [[0, 0, 0, 0.6], [0.5, 0.3, 0.4, 0.5], [-0.3, 0.5, 0.3, 0.45], [0.2, -0.3, 0.7, 0.4]].forEach(([a, b, c, s], i) => S.box(x + a, y + b, z + c, s, s, s, '#EDE8F2', { nojit: true, op: 0.85, sort: x + y + 3 + i * 0.01 })); }

/* ---------- the cave interior: a stone room seen like a diorama ---------- */
const R0 = 3, R1 = 17, WALL_H = 6, SIDE = { x: 12, w: 2 };
function caveRoom(o) { return (S) => {
  const ore = o.ore || 'none';
  for (let x = R0; x <= R1; x++) for (let y = R0; y <= R1; y++) { S.vox(x, y, -1, '#4A4652'); S.vox(x, y, 0, pick(['#6E6B76', '#76737E', '#686570', '#7A7783'], hash(x, y, 1))); }
  for (let y = R0; y <= R1; y++) for (let z = 1; z <= WALL_H; z++) { const oo = {};
    if (y >= 8 && y <= 11 && z >= 2 && z <= 4 && (y + z) % 2 === 0) { if (ore === 'show') oo.decR = [[0.15, 0.2, 0.25, 0.25, IRONORE], [0.55, 0.55, 0.28, 0.25, IRONORE], [0.6, 0.12, 0.2, 0.2, IRONORE]]; if (ore === 'mined') oo.decR = [[0, 0, 1, 1, '#2A2430']]; }
    S.vox(R0, y, z, pick(['#6E6B76', '#76737E', '#686570', '#7A7783', '#615E69'], hash(R0, y, z)), oo); }
  for (let x = R0 + 1; x <= R1; x++) for (let z = 1; z <= WALL_H; z++) { const oo = {};
    if (x >= SIDE.x && x < SIDE.x + SIDE.w && z <= 2) oo.decL = [[0, 0, 1, 1, '#1A1620']];
    S.vox(x, R0, z, pick(['#6E6B76', '#76737E', '#686570', '#7A7783', '#615E69'], hash(x, R0, z + 4)), oo); }
  [[8, 14, 1], [15, 9, 1], [14, 15, 1]].forEach(([x, y, h]) => { for (let z = 1; z <= h; z++) S.vox(x, y, z, '#615E69'); });
  if (o.torch) torchOnWall(S, R0 + 1, 13, 3);
  if (o.loot === 'iron') { [[6, 9.2], [6.6, 10.4], [5.6, 10.8]].forEach(([x, y], i) => S.box(x, y, 1, 0.5, 0.5, 0.4, IRONORE, { nojit: true, top: '#EBC2A2', sort: x + y + 1 + i * 0.01 })); }
  if (o.arrow) { const ax = 10.9, ay = 6.4, az = 4.6, so = ax + ay + 2; S.box(ax, ay, az, 0.16, 2.4, 0.16, '#8A5A2E', { nojit: true, top: '#B07A42', sort: so });
    S.box(ax - 0.12, ay + 2.4, az - 0.12, 0.4, 0.42, 0.4, '#C9D2DC', { nojit: true, top: '#E3E9F0', sort: so + 0.01 }); S.box(ax - 0.18, ay - 0.1, az - 0.18, 0.52, 0.5, 0.52, '#F4F0E4', { nojit: true, op: 0.95, sort: so - 0.01 }); }
  if (o.bones) bones(S, 12.4, 6.2, 1);
  if (o.bow) bowOnFloor(S, 11.4, 11.6, 1);
  if (o.skel) mobber(S, () => 1, Object.assign({ kind: 'skeleton' }, o.skel));
  if (o.hero) hero(S, () => 1, o.hero);
}; }
function caveBg(dark) { return (v) => { const g = dark ? ['#0B0910', '#120F18', '#18141F'] : ['#171320', '#211B2C', '#2B2338']; return `<rect width="${v.W}" height="${v.H}" fill="${g[0]}"/><rect y="${v.H * 0.35}" width="${v.W}" height="${v.H * 0.4}" fill="${g[1]}"/><rect y="${v.H * 0.75}" width="${v.W}" height="${v.H * 0.25}" fill="${g[2]}"/>`; }; }
const DIM = { top: 0.5, left: 0.4, right: 0.3, tintTop: [40, 40, 90, 0.35], tintSide: [20, 20, 60, 0.4] };
const LIT = { top: 1.0, left: 0.78, right: 0.6, tintTop: [255, 190, 110, 0.16], tintSide: [120, 70, 60, 0.14] };
const darkVeil = (op) => (v) => `<rect width="${v.W}" height="${v.H}" fill="#05040A" opacity="${op}"/>`;
const cave = (o) => ({ noIsland: true, noClouds: true, sky: 'night', bg: caveBg(!o.torch), light: o.torch ? LIT : DIM, extra: caveRoom(o),
  glow: o.torch ? [R0 + 1.5, 13.5, 3.8, 6.5, '#FFB54A'] : (o.glow || null), glow2: o.glow2 || null, overlay: o.torch ? null : darkVeil(0.25), view: CAVE_VIEW });
const CAVE_VIEW = { wide: { s: 42, cx: 800, cy: 206 }, tall: { s: 38, cx: 500, cy: 384 } };

/* ---------- outdoor scenes on the saga island ---------- */
function outdoor(o) { const extra = (S, G, H) => {
    if (o.houses) o.houses.forEach(h => house(S, G, h, o.sky === 'night'));
    if (o.furnace) furnace(S, G, 10, 13, o.furnace === 'lit');
    if (o.ingots) ingots(S, G, 11, 14, o.ingots === 'hot', 3);
    (o.villagers || []).forEach(v => person(S, G, Object.assign({ kind: 'villager' }, v)));
    (o.mobs || []).forEach(m => mobber(S, G, m));
    if (o.poof) poof(S, o.poof[0], o.poof[1], G(o.poof[0], o.poof[1]) + 0.4);
    if (o.hero) hero(S, G, o.hero);
  };
  const view = o.houses ? VILLAGE_VIEW : undefined;
  return Object.assign({ sky: 'day', view, trees: TREES, flowers: FLOW, tunnels: o.cave === false ? [] : [CAVE_MOUTH], path: o.houses ? VPATH : [] }, o, { extra, houses: undefined, house: undefined }); }

const VILLAGE_VIEW = { wide: { s: 34, cx: 780, cy: 270 }, tall: { s: 32, cx: 490, cy: 500 } };
const HERO_C = { x: 9.4, y: 9.4 };       // in the cave room
const HERO_M = { x: 10.2, y: 7.4 };       // outside, at the cave mouth
const HERO_V = { x: 13.0, y: 12.4 };     // in the village
const VILL = [{ x: 17.4, y: 10.0 }, { x: 9.2, y: 12.0 }];
const VILL_UP = VILL.map(v => Object.assign({ arms: 'up' }, v));
const SKEL = { x: 12.6, y: 5.2 };
const ZS = [{ x: 17.2, y: 13.8 }, { x: 17.6, y: 10.4 }, { x: 18.4, y: 12.6 }];
const ZS_MORE = ZS.concat([{ x: 19.2, y: 11.0 }, { x: 16.4, y: 11.0 }]);
const ZS_MANY = ZS_MORE.concat([{ x: 18.6, y: 14.8 }, { x: 15.8, y: 13.4 }]);
const ZS_RUN = [{ x: 20.4, y: 10.0, scale: 0.36 }, { x: 20.8, y: 12.6, scale: 0.36 }, { x: 19.8, y: 8.2, scale: 0.36 }];
const GOLEM = { kind: 'golem', x: 9.4, y: 14.8 };
const VILL6 = [{ x: 10.0, y: 9.8 }, { x: 8.8, y: 12.0 }];
const VILL6_UP = VILL6.map(v => Object.assign({ arms: 'up' }, v));
const V = VILLAGE;

const S4 = {
  1: { base: outdoor({ noIsland: true, sky: 'morning', boat: [8.5, 11, 0.75, true], hero: { x: 9.5, y: 11.4, z: 1.05, scale: 0.36 } }),
       reveal: outdoor({ sky: 'morning', cave: false, boat: [14.6, 18.6, 0.75, true], hero: Object.assign({ arms: 'up' }, { x: 12.4, y: 14.4 }) }) },
  2: { base: outdoor({ cave: false, hero: { x: 12.4, y: 8.6 } }),
       reveal: outdoor({ hero: Object.assign({ arms: 'up' }, { x: 12.4, y: 8.6 }) }) },
  3: { base: outdoor({ hero: HERO_M }), reveal: cave({ hero: HERO_C }) },
  4: { base: cave({ hero: HERO_C }), reveal: cave({ torch: true, hero: Object.assign({ hold: 'torch' }, HERO_C) }) },
  5: { base: cave({ torch: true, hero: Object.assign({ hold: 'torch' }, HERO_C) }),
       reveal: cave({ torch: true, ore: 'show', hero: Object.assign({ hold: 'torch' }, HERO_C) }) },
  6: { base: cave({ torch: true, ore: 'show', hero: Object.assign({ hold: 'pick' }, HERO_C) }),
       reveal: cave({ torch: true, ore: 'mined', loot: 'iron', hero: Object.assign({ hold: 'pick' }, HERO_C) }) },
  7: { base: cave({ torch: true, ore: 'mined', hero: Object.assign({ hold: 'pick' }, HERO_C) }),
       reveal: cave({ torch: true, ore: 'mined', skel: Object.assign({ bow: true }, SKEL), hero: Object.assign({ hold: 'pick' }, HERO_C) }) },
  8: { base: cave({ torch: true, ore: 'mined', skel: Object.assign({ bow: true }, SKEL), hero: Object.assign({ hold: 'pick' }, HERO_C) }),
       reveal: cave({ torch: true, ore: 'mined', arrow: true, skel: Object.assign({ bow: true }, SKEL), hero: Object.assign({ hold: 'pick' }, HERO_C) }) },
  9: { base: cave({ torch: true, ore: 'mined', skel: Object.assign({ bow: true }, SKEL), hero: Object.assign({ hold: 'pick' }, HERO_C) }),
       reveal: cave({ torch: true, ore: 'mined', bones: true, hero: Object.assign({ hold: 'pick', x: 11.0, y: 7.6 }) }) },
  10: { base: cave({ torch: true, ore: 'mined', bones: true, hero: Object.assign({ arms: 'down' }, HERO_C) }),
       reveal: cave({ torch: true, ore: 'mined', bones: true, bow: true, glow2: [12.6, 12.4, 1.2, 2.6, '#FFE9B0'], hero: Object.assign({ arms: 'up' }, HERO_C) }) },
};
const S5 = {
  1: { base: cave({ torch: true, ore: 'mined', bones: true, hero: Object.assign({ arms: 'down' }, HERO_C) }), reveal: outdoor({ hero: Object.assign({ arms: 'up' }, HERO_M) }) },
  2: { base: outdoor({ hero: HERO_M }), reveal: outdoor({ houses: V, villagers: VILL, hero: Object.assign({ arms: 'up' }, HERO_M) }) },
  3: { base: outdoor({ houses: V, villagers: VILL, furnace: 'cold', hero: HERO_V }), reveal: outdoor({ houses: V, villagers: VILL, furnace: 'lit', hero: HERO_V, glow: [10.5, 13.6, 1.6, 3, '#FFB54A'] }) },
  4: { base: outdoor({ houses: V, villagers: VILL, furnace: 'lit', hero: HERO_V, glow: [10.5, 13.6, 1.6, 3, '#FFB54A'] }), reveal: outdoor({ houses: V, villagers: VILL, furnace: 'lit', ingots: 'hot', hero: HERO_V, glow: [11.4, 14.4, 1.4, 3.2, '#FF8A3A'] }) },
  5: { base: outdoor({ houses: V, villagers: VILL, furnace: 'lit', ingots: 'hot', hero: HERO_V, glow: [11.4, 14.4, 1.4, 3.2, '#FF8A3A'] }), reveal: outdoor({ houses: V, villagers: VILL, furnace: 'lit', ingots: 'hot', hero: Object.assign({ arms: 'up' }, HERO_V), glow: [11.4, 14.4, 1.4, 4.4, '#FF6A2A'] }) },
  6: { base: outdoor({ houses: V, villagers: VILL, furnace: 'lit', ingots: 'cold', hero: HERO_V }), reveal: outdoor({ houses: V, villagers: VILL, furnace: 'lit', ingots: 'cold', hero: Object.assign({ hold: 'sword' }, HERO_V), glow: [HERO_V.x + 0.6, HERO_V.y + 2.6, 9.4, 2.4, '#E3F2FF'] }) },
  7: { base: outdoor({ houses: V, villagers: VILL, furnace: 'lit', hero: Object.assign({ hold: 'sword' }, HERO_V) }), reveal: outdoor({ houses: V, villagers: VILL, furnace: 'lit', hero: Object.assign({ hold: 'sword', shield: true }, HERO_V), glow: [HERO_V.x + 1.2, HERO_V.y + 1, 3, 2.4, '#9CC9E6'] }) },
  8: { base: outdoor({ houses: V, villagers: VILL, furnace: 'lit', hero: Object.assign({ hold: 'sword', shield: true }, HERO_V) }), reveal: outdoor({ houses: V, villagers: VILL_UP, furnace: 'lit', hero: Object.assign({ hold: 'sword', shield: true, helmet: true }, HERO_V), glow: [HERO_V.x, HERO_V.y + 1, 6.4, 2.2, '#E3F2FF'] }) },
  9: { base: outdoor({ sky: 'sunset', houses: V, villagers: VILL, furnace: 'lit', hero: Object.assign({ hold: 'sword', shield: true, helmet: true }, HERO_V) }), reveal: outdoor({ sky: 'night', houses: V, villagers: VILL, furnace: 'lit', hero: Object.assign({ hold: 'sword', shield: true, helmet: true }, HERO_V), glow: [10.5, 13.6, 1.6, 3, '#FFB54A'] }) },
  10: { base: outdoor({ sky: 'night', houses: V, furnace: 'lit', hero: Object.assign({ shield: true, helmet: true }, HERO_V), glow: [10.5, 13.6, 1.6, 3, '#FFB54A'] }),
        reveal: outdoor({ sky: 'night', houses: V, furnace: 'lit', mobs: ZS.map(z => Object.assign({ kind: 'zombie' }, z)), hero: Object.assign({ shield: true, helmet: true }, HERO_V), glow: [10.5, 13.6, 1.6, 3, '#FFB54A'], glow2: [18, 12.4, 4, 4, '#7FB35A'] }) },
};
const NIGHT = (o) => outdoor(Object.assign({ sky: 'night', houses: V, furnace: 'lit', glow: [10.5, 13.6, 1.6, 3, '#FFB54A'] }, o));
const Z = (arr) => arr.map(z => Object.assign({ kind: 'zombie' }, z));
const ARMED = Object.assign({ hold: 'sword', shield: true, helmet: true }, HERO_V);
const S6 = {
  1: { base: NIGHT({ villagers: VILL6, hero: Object.assign({ shield: true, helmet: true }, HERO_V) }), reveal: NIGHT({ villagers: VILL6, mobs: Z(ZS), hero: Object.assign({ shield: true, helmet: true }, HERO_V) }) },
  2: { base: NIGHT({ mobs: Z(ZS), hero: Object.assign({ shield: true, helmet: true }, HERO_V) }), reveal: NIGHT({ villagers: VILL6_UP, mobs: Z(ZS), hero: Object.assign({ shield: true, helmet: true }, HERO_V) }) },
  3: { base: NIGHT({ villagers: VILL6_UP, mobs: Z(ZS), hero: Object.assign({ shield: true, helmet: true }, HERO_V) }), reveal: NIGHT({ villagers: VILL6_UP, mobs: Z(ZS), hero: ARMED, glow2: [HERO_V.x + 0.6, HERO_V.y + 2.6, 9.4, 2.6, '#E3F2FF'] }) },
  4: { base: NIGHT({ mobs: Z(ZS), hero: ARMED }), reveal: NIGHT({ mobs: Z(ZS), hero: ARMED, glow2: [HERO_V.x + 1.2, HERO_V.y + 1, 4, 3, '#9CC9E6'] }) },
  5: { base: NIGHT({ mobs: Z(ZS), hero: ARMED }), reveal: NIGHT({ mobs: Z(ZS.slice(1)), poof: [17.2, 13.8], hero: ARMED }) },
  6: { base: NIGHT({ mobs: Z(ZS.slice(1)), hero: ARMED }), reveal: NIGHT({ mobs: Z(ZS_MORE.slice(1)), hero: ARMED }) },
  7: { base: NIGHT({ mobs: Z(ZS_MORE.slice(1)), hero: ARMED }), reveal: NIGHT({ mobs: Z(ZS_MANY), hero: ARMED, glow2: [18, 12.4, 4, 6, '#7FB35A'] }) },
  8: { base: NIGHT({ mobs: Z(ZS_MANY), hero: ARMED }), reveal: NIGHT({ mobs: Z(ZS_MANY).concat([GOLEM]), hero: ARMED, glow2: [10, 15.4, 4, 3.6, '#E3F2FF'] }) },
  9: { base: NIGHT({ mobs: Z(ZS_MANY).concat([GOLEM]), hero: ARMED }), reveal: NIGHT({ mobs: Z(ZS_RUN).concat([Object.assign({ arms: 'up' }, GOLEM)]), poof: [17.2, 13.8], hero: ARMED }) },
  10: { base: outdoor({ sky: 'morning', houses: V, furnace: 'lit', villagers: VILL6, mobs: [GOLEM], hero: Object.assign({ shield: true, helmet: true }, HERO_V) }),
        reveal: outdoor({ sky: 'morning', houses: V, furnace: 'lit', villagers: VILL6_UP, mobs: [Object.assign({ arms: 'up' }, GOLEM)], hero: Object.assign({ hold: 'map', shield: true, helmet: true }, HERO_V), glow2: [HERO_V.x + 0.8, HERO_V.y + 2, 7.2, 2.4, '#C4F6FA'] }) },
};

/* ---------- episodes 7-9 (2026-11-17): deep mine with a lava river, diamonds, the trader, the dog, the portal ---------- */
const { ITEMS: ICONS } = require('./items.js');
const LAVA = ['#E8732C', '#F2853A', '#F09A3A', '#E06A28'], LAVA_TOP = '#FFB54A', OBS = ['#2A1E3C', '#35264C', '#2E2142'], DI = '#56D6E2', DI2 = '#C4F6FA';
const RIVER = { y0: 9, y1: 10 }, BRIDGE = { x0: 13, x1: 14 };
const inRiver = (x, y) => y >= RIVER.y0 && y <= RIVER.y1;
const OBS_CELLS = (x, y) => inRiver(x, y) && x >= 4 && x <= 7;
function mobber2(S, G, p) { const { x: ox, y: oy, kind } = p; const z0 = (p.z != null ? p.z : G(ox, oy)); const u = p.scale || (kind === 'dog' ? 0.5 : 0.44); const k = ox + oy + 1.2; let n = 0;
  const B = (x, y, z, w, d, h, col, o) => S.box(ox + x * u, oy + y * u, z0 + z * u, w * u, d * u, h * u, col, Object.assign({ sort: k + (n++) * 0.001, nojit: true, fl: 0.9, fr: 0.78 }, o || {}));
  if (kind === 'dog') { const W = '#F1ECE4', W2 = '#D9D2C6', NOSE = '#3A3040', EYE = '#1E1822';
    const sit = p.pose === 'sit';
    if (sit) { B(0, 0.2, 0, 2.0, 2.0, 2.2, W2); B(3.4, 0.4, 0, 1.0, 0.8, 2.6, W2); B(3.4, 1.6, 0, 1.0, 0.8, 2.6, W2); B(0, 0, 1.6, 4.2, 2.4, 3.0, W, { top: '#FFFFFF' }); }
    else { [[0.2, 0.1], [0.2, 1.5], [3.6, 0.1], [3.6, 1.5]].forEach(([x, y]) => B(x, y, 0, 0.8, 0.8, 2.0, W2)); B(0, 0, 2.0, 4.8, 2.4, 2.2, W, { top: '#FFFFFF' }); }
    const hz = sit ? 4.0 : 3.2;
    B(-1.0, 0.8, hz + (p.wag ? 1.6 : 0.6), 1.2, 0.8, 0.8, W2); // tail
    if (p.collar) B(4.0, -0.15, hz + 0.2, 0.6, 2.7, 1.0, '#D8323C');
    B(4.4, -0.2, hz, 2.6, 2.8, 2.6, W, { decR: [[0.4 * u, 1.4 * u, 0.5 * u, 0.5 * u, EYE], [1.9 * u, 1.4 * u, 0.5 * u, 0.5 * u, EYE]] });
    B(7.0, 0.5, hz, 1.2, 1.4, 1.2, W2, { decR: [[0.4 * u, 0.6 * u, 0.6 * u, 0.5 * u, NOSE]] });
    B(4.6, -0.2, hz + 2.6, 0.8, 0.8, 0.9, W2); B(4.6, 1.8, hz + 2.6, 0.8, 0.8, 0.9, W2);
    if (p.happy) B(7.2, 0.8, hz - 0.5, 0.8, 0.8, 0.6, '#E86A7A');
    return; }
  if (kind === 'trader') { const ROBE = '#3D6FB0', ROBE2 = '#2F5A92', TRIM = '#E3C46A', SKIN = '#D9A57A', EYE = '#2A2233';
    B(-0.1, -0.1, 0, 2.4, 4.8, 1, '#3A3040'); B(0, 0, 1, 2.2, 4.6, 3.2, ROBE);
    B(0, -0.1, 4, 2.2, 4.6, 5, ROBE, { decR: [[0.9 * u, 0, 2.8 * u, 4.6 * u, ROBE2], [0, 2.1 * u, 0.6 * u, 5 * u, TRIM]] });
    if (p.give) { B(0.6, 3.6, 6.4, 3.2, 1.6, 1.2, ROBE2); B(3.4, 3.8, 6.2, 1.2, 1.2, 1.4, SKIN); }
    else B(2.2, 0.4, 6.2, 1.2, 3.8, 1.4, ROBE2);
    B(-0.7, -0.1, 9, 3.6, 4.6, 4, SKIN, { decR: [[0.8 * u, 1.9 * u, 0.8 * u, 0.9 * u, EYE], [3.0 * u, 1.9 * u, 0.8 * u, 0.9 * u, EYE], [1.6 * u, 0.5 * u, 1.4 * u, 0.4 * u, '#9A5A3C']] });
    B(3.0, 1.9, 9.6, 1.2, 0.9, 2.2, '#C98A62');
    B(-1.0, -0.4, 12.6, 4.0, 5.4, 1.2, ROBE, { top: '#4F82C4' }); B(-1.0, -0.4, 9.0, 0.8, 5.4, 3.6, ROBE); B(-0.2, 1.4, 13.8, 2.2, 1.8, 0.8, ROBE2);
    return; }
}
function heroDog(S, G, o) { if (o.dog) mobber2(S, G, Object.assign({ kind: 'dog' }, o.dog)); if (o.hero) hero(S, G, o.hero); }
function lavaBlocks(S, o) {
  for (let x = R0 + 1; x <= R1; x++) for (let y = RIVER.y0; y <= RIVER.y1; y++) {
    const obs = o.obsidian && OBS_CELLS(x, y);
    if (obs) S.vox(x, y, 0, pick(OBS, hash(x, y, 4)), { top: pick(['#3B2A55', '#33264C'], hash(x, y, 5)), nojit: true });
    else S.vox(x, y, 0, pick(LAVA, hash(x, y, 2)), { top: hash(x, y, 7) > 0.6 ? '#FFD27A' : LAVA_TOP, fl: 1.05, fr: 0.95, nojit: true });
    if (o.water && OBS_CELLS(x, y)) S.box(x, y, 1, 1, 1, 0.35, '#3E8FD8', { op: 0.85, nojit: true, top: '#6FB3F0', sort: x + y + 0.9 });
  }
  if (o.bubbles) [[13.4, 9.3], [6.4, 10.2], [15.6, 10.0]].forEach(([x, y], i) => S.box(x, y, 1, 0.4, 0.4, 0.4, '#FFD27A', { nojit: true, top: '#FFF2C4', sort: x + y + 1 + i * 0.01 }));
  if (o.bridge) { for (let y = RIVER.y0 - 0.4; y < RIVER.y1 + 1.3; y += 0.5) S.box(BRIDGE.x0, y, 1, 2, 0.44, 0.4, '#6B4426', { nojit: true, top: y * 2 % 2 ? '#B07A42' : '#C08A4A', sort: BRIDGE.x0 + y + 1.6 });
    [0, 1.8].forEach(dx => { S.box(BRIDGE.x0 + dx, RIVER.y0 - 0.4, 1.4, 0.2, 3.0, 0.2, '#8A5A2E', { nojit: true, top: '#C08A4A', sort: BRIDGE.x0 + dx + RIVER.y1 + 2.4 });
      [RIVER.y0 - 0.4, RIVER.y1 + 1.4].forEach(y => S.box(BRIDGE.x0 + dx, y, 1.4, 0.2, 0.2, 0.0, '#8A5A2E')); [RIVER.y0 - 0.4, RIVER.y1 + 1.4].forEach(y => S.box(BRIDGE.x0 + dx, y - 0.2, 1, 0.2, 0.2, 0.6, '#6B4426', { nojit: true, sort: BRIDGE.x0 + dx + y + 1.7 })); }); }
}
function deepRoom(o) { return (S) => {
  for (let x = R0; x <= R1; x++) for (let y = R0; y <= R1; y++) { S.vox(x, y, -1, '#3A3642'); if (!(x > R0 && inRiver(x, y))) S.vox(x, y, 0, pick(['#5E5B66', '#66636E', '#58555F', '#6A6773'], hash(x, y, 11))); }
  for (let y = R0; y <= R1; y++) for (let z = 1; z <= WALL_H; z++) S.vox(R0, y, z, pick(['#5E5B66', '#66636E', '#58555F', '#6A6773', '#53505B'], hash(R0, y, z + 9)));
  for (let x = R0 + 1; x <= R1; x++) for (let z = 1; z <= WALL_H; z++) { const oo = {};
    if (x >= 5 && x <= 7 && z >= 1 && z <= 2 && o.ore) oo.decL = o.ore === 'mined' ? [[0, 0, 1, 1, '#1A1620']] : [[0.15, 0.2, 0.28, 0.28, DI], [0.55, 0.55, 0.3, 0.28, DI], [0.6, 0.12, 0.22, 0.22, DI2]];
    S.vox(x, R0, z, pick(['#5E5B66', '#66636E', '#58555F', '#6A6773', '#53505B'], hash(x, R0, z + 13)), oo); }
  lavaBlocks(S, o);
  torchOnWall(S, R0 + 1, 13, 3);
  if (o.loot) [[6.2, 4.4], [6.9, 5.0], [5.6, 5.2], [7.4, 4.2], [6.4, 5.8]].forEach(([x, y], i) => S.box(x, y, 1, 0.5, 0.5, 0.45, DI, { nojit: true, top: DI2, sort: x + y + 1 + i * 0.01 }));
  if (o.pile) [[6, 15, 1], [7, 15, 1], [6, 16, 1], [7, 16, 1], [6, 15, 2], [7, 16, 2]].slice(0, o.pile).forEach(([x, y, z]) => S.vox(x, y, z, pick(OBS, hash(x, y, z)), { top: '#3B2A55' }));
  if (o.portal) portalFrame(S, 4, 11, 1, o.portal === 'lit');
  if (o.steam) poof(S, 6, 9.4, 1.2);
  heroDog(S, () => 1, o);
}; }
function portalFrame(S, x, y, z, lit) { for (let j = 0; j < 4; j++) for (let k = 0; k < 5; k++) { const edge = j === 0 || j === 3 || k === 0 || k === 4; if (edge) S.vox(x, y + j, z + k, (j + k) % 2 ? OBS[0] : OBS[1], { sort: x + y + j + 0.2 }); }
  if (lit) S.box(x + 0.35, y + 1, z + 1, 0.3, 2, 3, '#A24BE0', { op: 0.88, nojit: true, top: '#C27BF0', sideR: '#9A3FD8', sideL: '#B460EA', sort: x + y + 2.1, decR: [[0.3, 0.4, 0.35, 0.35, '#D9A6FA'], [1.2, 1.5, 0.3, 0.3, '#D9A6FA'], [0.6, 2.3, 0.25, 0.25, '#E8C8FF']] }); }
const deep = (o) => ({ noIsland: true, noClouds: true, sky: 'night', bg: caveBg(false), light: LIT, extra: deepRoom(o), view: CAVE_VIEW,
  glow: [11, 10, 1.2, 9, '#FF7A2A'], glow2: o.glow2 || null, top: o.top || null });
// thought bubble with one of the item icons inside (16x16 sprite from items.js)
function iconBubble(at, id) { return (v) => { const [px, py] = T.P(v, at[0], at[1], at[2]); const s = v.s / 27; const bx = px + 70 * s, by = py - 95 * s, q = 5.2 * s;
  let g = `<g><circle cx="${(px + 18 * s).toFixed(0)}" cy="${(py - 22 * s).toFixed(0)}" r="${7 * s}" fill="#FFF8EA"/><circle cx="${(px + 38 * s).toFixed(0)}" cy="${(py - 48 * s).toFixed(0)}" r="${11 * s}" fill="#FFF8EA"/>`;
  g += `<rect x="${(bx - 62 * s).toFixed(0)}" y="${(by - 58 * s).toFixed(0)}" width="${124 * s}" height="${104 * s}" rx="${26 * s}" fill="#FFF8EA" stroke="#E7D9BC" stroke-width="${3 * s}"/>`;
  const grid = id === 'heart' ? HEART : ICONS[id];
  grid.forEach((r, y) => r.forEach((c, x) => { if (c) g += `<rect x="${(bx - 8 * q + x * q).toFixed(1)}" y="${(by - 6 * s - 8 * q + y * q).toFixed(1)}" width="${(q + 0.4).toFixed(1)}" height="${(q + 0.4).toFixed(1)}" fill="${c}"/>`; }));
  return g + '</g>'; }; }
const HEART = ['................', '................', '...KK.....KK....', '..KRRK...KRRK...', '.KRWRRK.KRRRRK..', '.KRWRRRKRRRRRK..', '.KRRRRRRRRRRRK..', '.KRRRRRRRRRRRK..', '..KRRRRRRRRRK...', '...KRRRRRRRK....', '....KRRRRRK.....', '.....KRRRK......', '......KRK.......', '.......K........', '................', '................']
  .map(r => [...r].map(ch => ({ K: '#241C2E', R: '#E8404E', W: '#FFB3BA' })[ch] || null));
function outdoor2(o) { const base = outdoor(o); const inner = base.extra;
  base.extra = (S, G, H) => { inner(S, G, H);
    if (o.pit) { const [x, y] = o.pit, z = G(x, y); S.box(x, y, z - 0.98, 1.6, 1.6, 0.99, '#1A1620', { nojit: true, top: '#0E0B12', sort: x + y + 3 }); }
    if (o.xmark) { const [x, y] = o.xmark, z = G(x, y); for (let i = 0; i < 5; i++) { S.box(x + i * 0.3, y + i * 0.3, z, 0.34, 0.34, 0.06, '#D8323C', { nojit: true, sort: x + y + 3 }); S.box(x + 1.2 - i * 0.3, y + i * 0.3, z, 0.34, 0.34, 0.06, '#D8323C', { nojit: true, sort: x + y + 3 }); } }
    (o.traders || []).forEach(t => mobber2(S, G, Object.assign({ kind: 'trader' }, t)));
    if (o.boneAt) { const [x, y] = o.boneAt; S.box(x, y, G(x, y), 1.2, 0.3, 0.3, '#F1ECDD', { nojit: true, top: '#FFFFFF', sort: x + y + 1.4 }); }
    if (o.dog) mobber2(S, G, Object.assign({ kind: 'dog' }, o.dog));
    if (o.hero2) hero(S, G, o.hero2);
  };
  base.top = o.top || null; base.glow2 = o.glow2 || null; return base; }
// the fire world: a dark red sky and a small netherrack island with lava
function fireWorld(o) { return { noIsland: true, noClouds: true, sky: 'night', view: CAVE_VIEW, light: { top: 1, left: 0.8, right: 0.62, tintTop: [255, 120, 80, 0.18], tintSide: [120, 30, 30, 0.2] },
  bg: (v) => `<rect width="${v.W}" height="${v.H}" fill="#3A0E12"/><rect y="${v.H * 0.3}" width="${v.W}" height="${v.H * 0.4}" fill="#5A1416"/><rect y="${v.H * 0.7}" width="${v.W}" height="${v.H * 0.3}" fill="#7A1E18"/>`,
  glow: [10, 10, 1, 10, '#FF6A2A'], glow2: [5.5, 13, 3, 3, '#C27BF0'],
  extra: (S) => { for (let x = 4; x <= 16; x++) for (let y = 4; y <= 16; y++) { const r = Math.hypot(x - 10, y - 10); if (r > 6.6 + hash(x, y, 3) * 1.2) continue;
      const lava = Math.hypot(x - 13, y - 7) < 2.4; S.vox(x, y, 0, lava ? pick(LAVA, hash(x, y, 2)) : pick(['#7A2A2A', '#8A3232', '#6E2424', '#93383A'], hash(x, y, 8)), lava ? { top: LAVA_TOP, nojit: true } : {}); }
    [[7, 6, 1], [7, 6, 2], [8, 5, 1], [15, 12, 1]].forEach(([x, y, z]) => S.vox(x, y, z, '#8A3232'));
    S.vox(8, 5, 2, '#F2C94C', { top: '#FFE58A' });
    portalFrame(S, 4, 11, 1, true); heroDog(S, () => 1, o); } }; }

const HF = { x: 12.6, y: 14.2 }, HB = { x: 11.8, y: 6.4 }, HP = { x: 8.2, y: 12.4 };
const DOGF = { x: 14.6, y: 15.4 }, DOGP = { x: 9.6, y: 14.6 };
const HM = Object.assign({ hold: 'map' }, HERO_V);
const S7 = {
  1: { base: outdoor2({ sky: 'morning', houses: V, furnace: 'lit', villagers: VILL6, hero: HM }),
       reveal: outdoor2({ sky: 'morning', houses: V, furnace: 'lit', villagers: VILL6, hero: HM, xmark: [10.6, 8.4], glow2: [HERO_V.x + 0.8, HERO_V.y + 2, 7.2, 2.4, '#C4F6FA'] }) },
  2: { base: outdoor2({ hero: Object.assign({ hold: 'pick' }, HERO_M), xmark: [11.4, 9.0] }), reveal: outdoor2({ hero: Object.assign({ hold: 'pick' }, HERO_M), pit: [11.4, 9.0] }) },
  3: { base: cave({ hero: HERO_C }), reveal: deep({ hero: Object.assign({ hold: 'torch' }, HF) }) },
  4: { base: deep({ hero: Object.assign({ hold: 'torch' }, HF) }), reveal: deep({ bubbles: true, hero: Object.assign({ arms: 'up' }, HF), glow2: [12, 10, 1, 4, '#FFD27A'] }) },
  5: { base: deep({ hero: HF }), reveal: deep({ bridge: true, hero: Object.assign({ arms: 'up' }, HF) }) },
  6: { base: deep({ bridge: true, hero: HF }), reveal: deep({ bridge: true, hero: Object.assign({ arms: 'up' }, HB) }) },
  7: { base: deep({ bridge: true, hero: HB }), reveal: deep({ bridge: true, ore: 'show', hero: HB, glow2: [6.5, 3.6, 1.6, 2.6, DI] }) },
  8: { base: deep({ bridge: true, ore: 'show', hero: HB }), reveal: deep({ bridge: true, ore: 'show', hero: Object.assign({ arms: 'up' }, HB), glow2: [6.5, 3.6, 1.6, 4.4, DI] }) },
  9: { base: deep({ bridge: true, ore: 'show', hero: Object.assign({ hold: 'pick' }, HB) }), reveal: deep({ bridge: true, ore: 'mined', loot: true, hero: Object.assign({ hold: 'pick' }, HB), glow2: [6.6, 5.0, 1, 3, DI] }) },
  10: { base: deep({ bridge: true, ore: 'mined', hero: HB }), reveal: deep({ bridge: true, ore: 'mined', hero: Object.assign({ hold: 'dpick' }, HB), glow2: [HB.x + 0.6, HB.y + 2.4, 9.4, 2.6, DI] }) },
};
const TR = { x: 16.4, y: 12.0 }, HV8 = { x: 12.6, y: 12.6 }, DOG8 = { x: 9.8, y: 14.6 };
const VIL8 = (o) => outdoor2(Object.assign({ houses: V, villagers: [VILL[0]], furnace: 'lit' }, o));
const S8 = {
  1: { base: outdoor2({ hero: Object.assign({ hold: 'dpick' }, HERO_M) }), reveal: VIL8({ hero: Object.assign({ hold: 'dpick' }, HV8) }) },
  2: { base: VIL8({ hero: HV8 }), reveal: VIL8({ traders: [TR], hero: HV8 }) },
  3: { base: VIL8({ traders: [TR], hero: HV8 }), reveal: VIL8({ traders: [TR], hero: HV8, top: iconBubble([TR.x, TR.y, 6.2], 'diamond') }) },
  4: { base: VIL8({ traders: [TR], hero: HV8 }), reveal: VIL8({ traders: [TR], hero: Object.assign({ arms: 'up' }, HV8), glow2: [HV8.x + 1.6, HV8.y + 0.4, 6.6, 1.6, DI] }) },
  5: { base: VIL8({ traders: [TR], hero: HV8 }), reveal: VIL8({ traders: [Object.assign({ give: true }, TR)], hero: Object.assign({ hold: 'flint' }, HV8), glow2: [HV8.x + 0.6, HV8.y + 2.2, 6.4, 1.8, '#FFE9B0'] }) },
  6: { base: VIL8({ hero: HV8 }), reveal: VIL8({ hero: HV8, dog: DOG8 }) },
  7: { base: VIL8({ hero: Object.assign({ hold: 'bone' }, HV8), dog: DOG8 }), reveal: VIL8({ hero: HV8, dog: Object.assign({ pose: 'sit' }, DOG8), boneAt: [11.6, 15.6] }) },
  8: { base: VIL8({ hero: HV8, dog: Object.assign({ pose: 'sit' }, DOG8) }), reveal: VIL8({ hero: Object.assign({ arms: 'up' }, HV8), dog: Object.assign({ pose: 'sit', collar: true, happy: true, wag: true }, DOG8), top: iconBubble([DOG8.x, DOG8.y, 3.2], 'heart') }) },
  9: { base: VIL8({ hero: HV8, dog: Object.assign({ collar: true }, DOG8) }), reveal: VIL8({ hero: Object.assign({ arms: 'up' }, HV8), dog: Object.assign({ collar: true, happy: true, wag: true }, DOG8), glow2: [DOG8.x + 1, DOG8.y + 0.6, 2, 2.4, '#FFE9B0'] }) },
  10: { base: VIL8({ hero: HV8, dog: Object.assign({ collar: true }, DOG8) }), reveal: outdoor2({ hero: Object.assign({ hold: 'dpick' }, HERO_M), dog: { x: 12.6, y: 8.6, collar: true, wag: true, happy: true } }) },
};
const HF9 = { x: 14.6, y: 13.8 }, DOGF9 = { x: 16.2, y: 15.2 };
const DOGC = { collar: true }, HD = (o) => Object.assign({}, HF9, o), DG = (o) => Object.assign({}, DOGC, DOGF9, o);
const S9 = {
  1: { base: outdoor2({ hero: Object.assign({ hold: 'dpick' }, HERO_M), dog: { x: 12.6, y: 8.6, collar: true } }), reveal: deep({ hero: HD({ hold: 'torch' }), dog: DG() }) },
  2: { base: deep({ hero: HF9, dog: DG() }), reveal: deep({ water: true, hero: HD({ arms: 'up' }), dog: DG() }) },
  3: { base: deep({ water: true, hero: HF9, dog: DG() }), reveal: deep({ obsidian: true, steam: true, hero: HF9, dog: DG({ pose: 'sit' }) }) },
  4: { base: deep({ obsidian: true, hero: HF9, dog: DG() }), reveal: deep({ obsidian: true, hero: HD({ arms: 'up' }), dog: DG({ wag: true }), glow2: [5.5, 10, 1, 3.4, '#9A4FD8'] }) },
  5: { base: deep({ obsidian: true, hero: HD({ hold: 'dpick' }), dog: DG() }), reveal: deep({ obsidian: true, pile: 6, hero: HD({ hold: 'dpick' }), dog: DG() }) },
  6: { base: deep({ obsidian: true, pile: 6, hero: HF9, dog: DG() }), reveal: deep({ obsidian: true, portal: 'frame', hero: HD({ arms: 'up' }), dog: DG() }) },
  7: { base: deep({ obsidian: true, portal: 'frame', hero: HF9, dog: DG() }), reveal: deep({ obsidian: true, portal: 'frame', hero: HD({ hold: 'flint' }), dog: DG(), glow2: [HF9.x + 0.6, HF9.y + 2.2, 6.4, 1.8, '#FFE9B0'] }) },
  8: { base: deep({ obsidian: true, portal: 'frame', hero: HD({ hold: 'flint' }), dog: DG() }), reveal: deep({ obsidian: true, portal: 'lit', hero: HD({ arms: 'up' }), dog: DG({ wag: true }), glow2: [4.6, 13, 3, 4.4, '#C27BF0'] }) },
  9: { base: deep({ obsidian: true, portal: 'lit', hero: HF9, dog: DG(), glow2: [4.6, 13, 3, 4.4, '#C27BF0'] }), reveal: deep({ obsidian: true, portal: 'lit', hero: Object.assign({ arms: 'up' }, HP), dog: Object.assign({}, DOGC, DOGP, { wag: true }), glow2: [4.6, 13, 3, 4.4, '#C27BF0'] }) },
  10: { base: deep({ obsidian: true, portal: 'lit', hero: HP, dog: Object.assign({}, DOGC, DOGP), glow2: [4.6, 13, 3, 4.4, '#C27BF0'] }), reveal: fireWorld({ hero: Object.assign({ arms: 'up' }, HP), dog: Object.assign({ wag: true }, DOGC, DOGP) }) },
};
const SAGA = { s4: { pages: S4, hm: hmSaga }, s5: { pages: S5, hm: hmSaga }, s6: { pages: S6, hm: hmSaga }, s7: { pages: S7, hm: hmSaga }, s8: { pages: S8, hm: hmSaga }, s9: { pages: S9, hm: hmSaga } };
module.exports = { SAGA, hero, outdoor, outdoor2, fireWorld, mobber, mobber2, heroDog, deep, cave, caveBg, iconBubble, poof, portalFrame, hmSaga, V, HERO_V, HERO_M, VILL, VILLAGE_VIEW, CAVE_VIEW, LAVA, LAVA_TOP, LIT, DI, DI2 };
if (require.main === module) { renderAll(SAGA, process.argv.slice(2), __dirname); console.log('done'); }
