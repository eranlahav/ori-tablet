// Stories 2 and 3: same voxel style as scenes.js (story 1). Original art only, no game characters copied.
// Usage: node art/stories.js [s2|s3] [page]  -> writes art/s2/p{n}-{base|reveal}-{wide|tall}.svg
const fs = require('fs'); const path = require('path'); const { Scene, hash } = require('./voxel.js');
const N = 21, c = (N - 1) / 2;
const pick = (arr, r) => arr[Math.floor(r * arr.length) % arr.length];
const GRASS = ['#7DB24A', '#86BA52', '#74A944', '#7FB64E'], SAND = ['#E6CE93', '#DEC587', '#EAD49C'], WATER = ['#3E8FB0', '#4698B8', '#3987A8', '#4FA3C2'], DIRT = '#8A5A3A', STONE = ['#8F8C97', '#9A97A2', '#84818C'];
const LEAF = ['#3F8F3C', '#4FA046', '#357A33', '#479A42', '#5BAA4C'], JLEAF = ['#2E7A34', '#2A6E2F', '#368A3A', '#25652B', '#3E9440'];
const GOLD = '#F2C94C', DIAM = '#5FD3E0', EMER = '#2FBF71', EMER2 = '#8BEBB0', DARK = '#1E1822';

/* ---------- terrain ---------- */
function islandH(x, y, seed) {
  const dx = x - c, dy = (y - c) * 1.08, ang = Math.atan2(dy, dx);
  const r = Math.sqrt(dx * dx + dy * dy) + 1.1 * Math.sin(ang * 3 + seed) + 0.7 * Math.sin(ang * 5 + 2 + seed) + (hash(x, y, 5 + seed) - 0.5) * 0.8;
  let h = 0; if (r < 9.3) h = 1; if (r < 8.0) h = 2; return h;
}
// story 2: a stone mountain at the back-left, its cliff face (x = 7) looking towards the viewer's right
const MT = { x1: 7, y0: 3, y1: 13 };
function hmMountain() { const H = [];
  for (let x = 0; x < N; x++) { H[x] = []; for (let y = 0; y < N; y++) { let h = islandH(x, y, 0.6);
    if (h >= 1 && x <= MT.x1 && y >= MT.y0 && y <= MT.y1) { const back = (MT.x1 - x) + Math.min(y - MT.y0, MT.y1 - y);
      h = Math.min(11, 7 + Math.floor(back * 0.7 + hash(x, y, 2) * 1.2)); if (y === MT.y0 || y === MT.y1) h = Math.min(h, 5 + Math.floor(hash(x, y, 4) * 2)); }
    H[x][y] = h; } } return H; }
// story 3: a flat green island, with a gentle hill at the back
function hmVillage() { const H = [];
  for (let x = 0; x < N; x++) { H[x] = []; for (let y = 0; y < N; y++) { let h = islandH(x, y, 1.9);
    const hx = x - 4, hy = y - 4, hr = Math.sqrt(hx * hx + hy * hy); if (h >= 2 && hr < 3.2) h = 3; if (h >= 2 && hr < 1.8) h = 4;
    H[x][y] = h; } } return H; }

function build(o, Hm) {
  const S = new Scene(); const night = o.sky === 'night';
  const H = (x, y) => (x < 0 || y < 0 || x >= N || y >= N) ? 0 : Hm[x][y];
  const G = (x, y) => H(Math.floor(x), Math.floor(y)) + 1;
  const leafAt = new Set(), leaves = [];
  if (o.noIsland) { o = Object.assign({}, o, { trees: [], bamboo: [], flowers: [] }); }
  for (const [tx, ty, th, rad, jungle] of (o.trees || [])) { const base = H(tx, ty) + 1, cz = base + th + rad * 0.55;
    for (let x = Math.floor(tx - rad - 1); x <= tx + rad + 1; x++) for (let y = Math.floor(ty - rad - 1); y <= ty + rad + 1; y++) for (let z = Math.floor(cz - rad); z <= cz + rad + 1; z++) {
      const dx = x - tx, dy = y - ty, dz = (z - cz) * (jungle ? 1.6 : 1.25); const dd = Math.sqrt(dx * dx + dy * dy + dz * dz) + (hash(x, y, z) - 0.5) * 0.9;
      if (dd <= rad) { leaves.push([x, y, z, jungle]); leafAt.add(x + ',' + y); } } }
  const tunnels = o.tunnels || [], ores = o.ores || [], field = o.field, path_ = o.path || [];
  if (o.noIsland) { /* sea only */ } else for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) {
    const h = H(x, y);
    S.vox(x, y, -2, pick(STONE, hash(x, y, 9)));
    if (h === 0) { S.vox(x, y, -1, '#2F7C9D'); S.vox(x, y, 0, pick(WATER, hash(x, y, 1)), { op: 0.93, decT: hash(x, y, 2) > 0.86 ? [[0.15, 0.4, 0.7, 0.14, '#BFE6F0', 0.7]] : [] }); continue; }
    S.vox(x, y, -1, DIRT);
    const inMt = Hm.mt && x <= MT.x1 && y >= MT.y0 && y <= MT.y1;
    const inField = field && x >= field.x0 && x <= field.x1 && y >= field.y0 && y <= field.y1;
    const onPath = path_.some(([px, py]) => px === x && py === y);
    for (let z = 0; z <= h; z++) { const topv = z === h;
      if (h === 1) { S.vox(x, y, z, pick(SAND, hash(x, y, z))); continue; }
      if (inMt && z >= 2) { const oo = {};
        if (x === MT.x1) { const t = tunnels.find(t => y >= t.y && y < t.y + (t.w || 2) && z >= (t.z0 || 3) && z <= (t.z1 || 4)); if (t) oo.decR = [[0, 0, 1, 1, DARK]];
          const ore = ores.find(q => q[0] === y && q[1] === z); if (ore) oo.decR = [[0.2, 0.25, 0.25, 0.25, ore[2]], [0.55, 0.55, 0.25, 0.25, ore[2]], [0.6, 0.15, 0.2, 0.2, ore[2]]]; }
        if (topv && h >= 9 && hash(x, y, 7) > 0.35) S.vox(x, y, z, '#F1F1F4', { side: pick(STONE, hash(x, y, z)) });
        else S.vox(x, y, z, pick(STONE, hash(x, y, z)), oo); continue; }
      if (topv && inField) { S.vox(x, y, z, '#6B4426', { decT: [[0.05, 0.1, 0.9, 0.12, '#5A381E'], [0.05, 0.55, 0.9, 0.12, '#5A381E']] }); continue; }
      if (topv && onPath) { S.vox(x, y, z, '#B8946A', { side: DIRT, lip: true }); continue; }
      if (topv) S.vox(x, y, z, pick(GRASS, hash(x, y, 4)), { side: DIRT, lip: true, shadow: leafAt.has(x + ',' + y) || leafAt.has((x - 1) + ',' + (y - 1)) });
      else S.vox(x, y, z, DIRT); } }
  // dug-out tunnel floor: a dark slot in front of the cliff
  for (const t of tunnels) for (let j = 0; j < (t.w || 2); j++) S.box(MT.x1 + 1, t.y + j, G(MT.x1 + 1, t.y + j) - 0.02, 0.35, 1, 0.04, '#3A2E2A', { nojit: true });
  for (const [tx, ty, th, , jungle] of (o.trees || [])) for (let i = 1; i <= th + 1; i++) S.vox(tx, ty, H(tx, ty) + i, jungle ? (i % 2 ? '#6B5A2E' : '#7A6634') : (i % 2 ? '#7A4E2B' : '#845630'));
  for (const [x, y, z, jungle] of leaves) { if (S.has(x, y, z)) continue; S.vox(x, y, z, pick(jungle ? JLEAF : LEAF, hash(x, y, z + 11))); }
  for (const [bx, by, bh] of (o.bamboo || [])) for (let i = 0; i < bh; i++) S.box(bx + 0.35, by + 0.35, G(bx, by) + i, 0.3, 0.3, 1, i % 2 ? '#7FB83E' : '#6EA634', { nojit: true, sort: bx + by + 1 });
  if (field) for (let x = field.x0; x <= field.x1; x++) for (let y = field.y0; y <= field.y1; y++) {
    if ((field.cut || []).some(([a, b]) => a === x && b === y)) continue;
    for (const [u, v] of [[0.15, 0.1], [0.55, 0.1], [0.15, 0.55], [0.55, 0.55]]) S.box(x + u, y + v, G(x, y), 0.25, 0.25, 0.9, field.ripe ? '#E3C04A' : '#8DBA48', { nojit: true, top: field.ripe ? '#F2D768' : '#A6CF5C', sort: x + y + 1 + u + v });
  }
  if (!o.noIsland) {
    const flower = (x, y, col) => { S.box(x + 0.42, y + 0.42, G(x, y), 0.16, 0.16, 0.34, '#3F8F3C', { nojit: true }); S.box(x + 0.3, y + 0.3, G(x, y) + 0.34, 0.4, 0.4, 0.22, col, { nojit: true }); };
    (o.flowers || []).forEach(f => { if (H(f[0], f[1]) >= 2 && !leafAt.has(f[0] + ',' + f[1])) flower(...f); });
  }
  if (o.house) house(S, G, o.house, night);
  if (o.boat) boat(S, ...o.boat);
  if (o.chest) chest(S, G, o.chest);
  if (o.portal) portal(S, G, o.portal);
  if (o.gems) o.gems.forEach(([x, y, k]) => gem(S, x, y, G(x, y), k || 1));
  if (o.panda) panda(S, G, o.panda);
  if (o.villager) person(S, G, Object.assign({ kind: 'villager' }, o.villager));
  if (o.ori) person(S, G, Object.assign({ kind: 'ori' }, o.ori));
  if (o.extra) o.extra(S, G, H);
  if (!night && !o.noClouds) { cloud(S, -2, 6, 17, 1); cloud(S, 16, -3, 15.5, 0.8); cloud(S, -6, 17, 12, 0.7); }
  return S;
}
function cloud(S, x, y, z, sc) { const o = { op: 0.92, nojit: true, top: '#FFF6E6', sideL: '#EBD9D2', sideR: '#D9C2C6' }; S.box(x, y, z, 4 * sc, 2 * sc, 0.9 * sc, '#FFF6E6', Object.assign({ sort: 100 }, o)); S.box(x + 1 * sc, y + 0.3 * sc, z + 0.9 * sc, 2.2 * sc, 1.4 * sc, 0.8 * sc, '#FFF6E6', Object.assign({ sort: 100.1 }, o)); S.box(x - 1.2 * sc, y + 0.4 * sc, z + 0.1 * sc, 1.6 * sc, 1.2 * sc, 0.6 * sc, '#FFF6E6', Object.assign({ sort: 99.9 }, o)); }
function boat(S, bx, by, z, sail) { z = z == null ? 0.75 : z; const W = '#9A6A35', D = '#7A5228';
  S.box(bx, by, z, 3.2, 1.6, 0.5, D, { sort: bx + by + 2.4 }); S.box(bx, by, z + 0.5, 3.2, 0.25, 0.45, W, { sort: bx + by + 2.41 }); S.box(bx, by + 1.35, z + 0.5, 3.2, 0.25, 0.45, W, { sort: bx + by + 2.6 });
  S.box(bx, by + 0.25, z + 0.5, 0.25, 1.1, 0.45, W, { sort: bx + by + 2.42 }); S.box(bx + 2.95, by + 0.25, z + 0.5, 0.25, 1.1, 0.45, W, { sort: bx + by + 2.62 });
  S.box(bx + 1.3, by + 0.25, z + 0.5, 0.5, 1.1, 0.2, '#B88A52', { sort: bx + by + 2.5 });
  if (sail) { S.box(bx + 2.1, by + 0.7, z + 0.5, 0.2, 0.2, 4.2, '#6B4426', { sort: bx + by + 2.55, nojit: true }); S.box(bx + 2.3, by + 0.75, z + 1.6, 0.08, 0.1, 2.8, '#F4EAD6', { sort: bx + by + 2.56, nojit: true });
    S.box(bx + 0.6, by + 0.8, z + 1.4, 1.5, 0.08, 2.9, '#F4EAD6', { sort: bx + by + 2.57, nojit: true, decL: [[0.2, 1.2, 1.1, 0.5, '#E8732C']] }); } }
function house(S, G, h, night) { const { x, y, w, d } = h; const z0 = G(x, y); const WALL = '#E9DFC8', WALL2 = '#DCD0B4', LOG = '#7A4E2B', ROOF = '#3F6F9A', ROOF2 = '#4D80AC';
  const WIN = night ? '#FFD27A' : '#9CC9E6';
  for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) for (let k = 0; k < 3; k++) {
    const edge = (i === 0 || i === w - 1) && (j === 0 || j === d - 1); const o = {};
    if (i === w - 1 && j === 1 && k <= 1) o.decR = [[0.15, 0, 0.7, k ? 0.6 : 1, '#6B4426']];
    if (i === w - 1 && j === d - 1 && k === 1) o.decR = [[0.2, 0.2, 0.6, 0.55, WIN]];
    if (j === d - 1 && k === 1 && i === 1) o.decL = [[0.2, 0.2, 0.6, 0.55, WIN]];
    if (j === d - 1 && k === 0 && i === 1) o.decL = [[0.1, 0.0, 0.8, 0.25, '#C9483A']];
    S.vox(x + i, y + j, z0 + k, edge ? LOG : ((i + j + k) % 2 ? WALL : WALL2), o); }
  for (let s = 0; s < 2; s++) for (let i = -1 + s; i <= w - s; i++) for (let j = -1 + s; j <= d - s; j++) S.vox(x + i, y + j, z0 + 3 + s, (i + j) % 2 ? ROOF : ROOF2, { sort: x + i + y + j + 0.5 });
  S.vox(x + 1, y + 1, z0 + 5, '#8F8C97'); S.vox(x + 1, y + 1, z0 + 6, '#84818C');
}
function chest(S, G, { x, y, open, map }) { const z = G(x, y); const W = '#A06A2E', D = '#7A4E22';
  S.box(x, y, z, 2, 1.4, 1.1, W, { decR: [[0.55, 0.45, 0.3, 0.3, GOLD]], decL: [[0.85, 0.55, 0.3, 0.3, GOLD]], sort: x + y + 1.5 });
  if (!open) S.box(x, y, z + 1.1, 2, 1.4, 0.5, D, { sort: x + y + 1.6 });
  else { S.box(x, y - 0.2, z + 1.1, 2, 0.3, 1.2, D, { sort: x + y + 0.6 });
    if (map) { S.box(x + 0.25, y + 0.25, z + 1.12, 1.5, 1.0, 0.08, '#EADBB0', { nojit: true, sort: x + y + 1.63, decT: [[0.15, 0.2, 0.5, 0.12, '#A0703A'], [0.5, 0.45, 0.6, 0.12, '#A0703A'], [0.95, 0.15, 0.25, 0.25, '#C9483A'], [0.2, 0.65, 0.35, 0.2, '#4F8F3A']] });
      S.box(x + 0.1, y + 0.2, z + 1.1, 0.25, 1.1, 0.22, '#C9A26B', { nojit: true, sort: x + y + 1.64 }); S.box(x + 1.65, y + 0.2, z + 1.1, 0.25, 1.1, 0.22, '#C9A26B', { nojit: true, sort: x + y + 1.65 }); }
  } }
function portal(S, G, { x, y }) { const z = G(x, y); const OB = '#2A1E3C', OB2 = '#35264C';
  for (let j = 0; j < 4; j++) for (let k = 0; k < 5; k++) { const edge = j === 0 || j === 3 || k === 0 || k === 4; if (edge) S.vox(x, y + j, z + k, (j + k) % 2 ? OB : OB2, { sort: x + y + j + 0.2 }); }
  S.box(x + 0.35, y + 1, z + 1, 0.3, 2, 3, '#A24BE0', { op: 0.88, nojit: true, top: '#C27BF0', sideR: '#9A3FD8', sideL: '#B460EA', sort: x + y + 2.1,
    decR: [[0.3, 0.4, 0.35, 0.35, '#D9A6FA'], [1.2, 1.5, 0.3, 0.3, '#D9A6FA'], [0.6, 2.3, 0.25, 0.25, '#E8C8FF']] }); }
function gem(S, x, y, z, k) { const s = 0.5 * k; S.box(x, y, z, s, s, s * 1.3, EMER, { nojit: true, top: EMER2, sort: x + y + 1.4, fl: 0.85, fr: 0.7, decR: [[s * 0.2, s * 0.6, s * 0.25, s * 0.35, EMER2]] }); }
function panda(S, G, p) { const { x: ox, y: oy, pose } = p; const z0 = G(ox, oy); const u = 0.42; const k = ox + oy + 1.3; let n = 0;
  const B = (x, y, z, w, d, h, col, o) => S.box(ox + x * u, oy + y * u, z0 + z * u, w * u, d * u, h * u, col, Object.assign({ sort: k + (n++) * 0.001, nojit: true, fl: 0.9, fr: 0.78 }, o || {}));
  const W = '#F4F1EA', K = '#262230';
  const face = [[0.6 * u, 1.4 * u, 1.3 * u, 1.2 * u, K], [2.9 * u, 1.4 * u, 1.3 * u, 1.2 * u, K], [2.0 * u, 0.5 * u, 0.9 * u, 0.6 * u, K]];
  const eyesOpen = [[0.95 * u, 1.9 * u, 0.4 * u, 0.4 * u, '#FFFFFF'], [3.25 * u, 1.9 * u, 0.4 * u, 0.4 * u, '#FFFFFF']];
  if (pose === 'sleep') { // lying on its side
    B(0, 0, 0, 7, 4.4, 3.4, W, { decL: [[2.2 * u, 0, 2.6 * u, 3.4 * u, K]] }); B(0.6, 4.4, 0, 1.8, 1.0, 1.4, K); B(4.6, 4.4, 0, 1.8, 1.0, 1.4, K);
    B(7, 0.2, 0, 4, 4, 3.4, W, { decR: [[0.6 * u, 1.2 * u, 1.3 * u, 0.4 * u, K], [2.4 * u, 1.2 * u, 1.3 * u, 0.4 * u, K], [1.6 * u, 0.3 * u, 0.8 * u, 0.5 * u, K]] });
    B(7.6, 0.2, 3.4, 1.0, 1.0, 0.8, K); B(7.6, 3.2, 3.4, 1.0, 1.0, 0.8, K);
    [[9, 2, 6, 1.0], [10.6, 1.4, 8.4, 1.3], [12.4, 0.8, 11.2, 1.6]].forEach(([x, y, z, s]) => B(x, y, z, s, 0.3, s, '#F4F1EA', { op: 0.9 }));
  } else { // sitting up, paws raised when happy
    B(0, 0, 0, 5, 5, 6, W, { decR: [[0, 1.4 * u, 5 * u, 1.6 * u, K]], decL: [[0, 1.4 * u, 5 * u, 1.6 * u, K]] });
    B(3.6, 0.2, 0, 2.2, 1.6, 1.2, K); B(3.6, 3.2, 0, 2.2, 1.6, 1.2, K);
    if (pose === 'happy') { B(1.2, -1.4, 4.4, 1.6, 1.4, 4, K); B(1.2, 5, 4.4, 1.6, 1.4, 4, K); }
    else { B(2.6, -0.8, 2.2, 1.6, 1.2, 3.2, K); B(2.6, 4.6, 2.2, 1.6, 1.2, 3.2, K); }
    B(0.2, 0.3, 6, 4.6, 4.4, 4, W, { decR: face.concat(eyesOpen).concat(pose === 'happy' ? [[1.7 * u, 0.0, 1.5 * u, 0.35 * u, '#C9483A']] : []) });
    B(0.6, 0, 10, 1.3, 1.3, 1.1, K); B(0.6, 3.4, 10, 1.3, 1.3, 1.1, K);
  } }
function person(S, G, p) { const { x: ox, y: oy, kind } = p; const z0 = (p.z != null ? p.z : G(ox, oy)); const u = p.scale || 0.44; const k = ox + oy + 1.2; let n = 0;
  const B = (x, y, z, w, d, h, col, o) => S.box(ox + x * u, oy + y * u, z0 + z * u, w * u, d * u, h * u, col, Object.assign({ sort: k + (n++) * 0.001, nojit: true, fl: 0.9, fr: 0.78 }, o || {}));
  const V = kind === 'villager';
  const SKIN = V ? '#D9A57A' : '#EDBE94', TOP = V ? '#7A5230' : '#E8732C', TOP2 = V ? '#4F8F3A' : '#F6A45A', PANTS = V ? '#6B4426' : '#3D5A8C', SHOE = V ? '#4A3020' : '#F4EAD6', HAIR = V ? '#5A3A1C' : '#33263A', EYE = '#2A2233';
  const arms = p.arms || 'down';
  if (!V) B(-1.7, 0.3, 4.4, 1.7, 3.8, 4.2, '#2FA39A');
  if (arms === 'both' || arms === 'emerald') { B(0.2, -1.5, 9, 1.4, 1.3, 3.4, TOP); B(0.2, -1.5, 12.4, 1.4, 1.3, 1.2, SKIN); }
  else { B(0.2, -1.5, 5, 1.6, 1.4, 4, TOP); B(0.2, -1.5, 4, 1.6, 1.4, 1, SKIN); }
  if (V) { B(-0.1, -0.1, 0, 2.4, 4.8, 1, SHOE); B(0, 0, 1, 2.2, 4.6, 3.2, TOP); }
  else { B(0, 0, 0, 2.3, 2, 1, SHOE); B(0, 2.4, 0, 2.3, 2, 1, SHOE); B(0, 0, 1, 2, 2, 3, PANTS); B(0, 2.4, 1, 2, 2, 3, PANTS); }
  B(0, -0.1, 4, 2.2, 4.6, 5, TOP, { decR: V ? [[0.9 * u, 0, 2.8 * u, 4.6 * u, TOP2]] : [[1.5 * u, 0.5 * u, 1.6 * u, 1.3 * u, TOP2]], decL: [[0, 0, 2.2 * u, 0.5 * u, TOP2]] });
  const face = V ? [[0.8 * u, 1.9 * u, 0.8 * u, 0.9 * u, EYE], [3.0 * u, 1.9 * u, 0.8 * u, 0.9 * u, EYE], [1.6 * u, 0.5 * u, 1.4 * u, 0.4 * u, '#9A5A3C'], [0.5 * u, 2.95 * u, 3.6 * u, 0.35 * u, '#7A5230']]
    : [[0, 3.1 * u, 4.6 * u, 0.9 * u, HAIR], [0.8 * u, 1.7 * u, 0.8 * u, 1.0 * u, EYE], [3.0 * u, 1.7 * u, 0.8 * u, 1.0 * u, EYE], [0.85 * u, 2.3 * u, 0.3 * u, 0.3 * u, '#FFFFFF'], [3.05 * u, 2.3 * u, 0.3 * u, 0.3 * u, '#FFFFFF'], [1.7 * u, 0.6 * u, 1.2 * u, 0.35 * u, '#B5563C'], [1.4 * u, 0.95 * u, 0.3 * u, 0.3 * u, '#B5563C'], [2.9 * u, 0.95 * u, 0.3 * u, 0.3 * u, '#B5563C']];
  B(-0.7, -0.1, 9, 3.6, 4.6, 4, SKIN, { decR: face, decL: V ? [] : [[0, 1.6 * u, 3.6 * u, 2.4 * u, HAIR], [0, 0.6 * u, 1.4 * u, 1.0 * u, HAIR]] });
  if (V) { B(-1.6, -1.1, 12.6, 5.4, 6.8, 0.5, '#E3C46A', { top: '#EBD27E' }); B(-0.6, 0.0, 13.1, 3.4, 4.4, 1.4, '#E3C46A', { top: '#EBD27E', decR: [[0, 0.2 * u, 4.4 * u, 0.4 * u, '#C9483A']] }); }
  else { B(-0.9, -0.3, 13, 4.0, 5.0, 0.9, HAIR); B(-0.4, 0.5, 13.9, 1.4, 1.4, 0.7, HAIR); B(1.0, 2.4, 13.9, 1.5, 1.6, 0.6, HAIR); B(-0.6, 3.0, 13.9, 1.2, 1.2, 0.9, HAIR); }
  // near arm + held items
  if (arms === 'up' || arms === 'both') { B(0.3, 4.5, 6.8, 1.6, 1.4, 2.2, TOP); B(0.6, 4.9, 9, 1.4, 1.3, 3.4, TOP); B(0.6, 4.9, 12.4, 1.4, 1.3, 1.2, SKIN); }
  else if (arms === 'emerald') { B(0.3, 4.5, 6.8, 1.6, 1.4, 2.2, TOP); B(0.6, 4.9, 9, 1.4, 1.3, 3.4, TOP); B(0.6, 4.9, 12.4, 1.4, 1.3, 1.2, SKIN);
    B(0.2, 1.4, 14.4, 2.2, 2.2, 2.8, EMER, { top: EMER2, fl: 0.95, fr: 0.8, decR: [[0.4 * u, 1.4 * u, 0.5 * u, 0.8 * u, EMER2]] }); }
  else if (arms === 'pick') { B(0.3, 4.5, 6.8, 1.6, 1.4, 2.2, TOP); B(0.6, 4.9, 9, 1.4, 1.3, 3.0, TOP); B(0.6, 4.9, 12.0, 1.4, 1.3, 1.2, SKIN);
    B(0.9, 5.0, 12.4, 0.8, 0.8, 4.4, '#7A4E2B'); B(0.5, 3.0, 16.4, 1.6, 4.8, 1.1, '#9FB3C8', { top: '#C8D6E4' }); }
  else if (arms === 'map') { B(1.8, -0.6, 6.4, 0.5, 5.8, 4.2, '#EADBB0', { decR: [[0.6 * u, 1.0 * u, 2.4 * u, 0.4 * u, '#A0703A'], [2.6 * u, 2.4 * u, 2.2 * u, 0.4 * u, '#A0703A'], [3.6 * u, 0.6 * u, 1.0 * u, 1.0 * u, '#C9483A'], [0.8 * u, 2.8 * u, 1.2 * u, 0.8 * u, '#4F8F3A']] });
    B(0.3, 4.5, 6.2, 2.0, 1.4, 2.4, TOP); B(1.6, 4.6, 6.4, 0.7, 1.2, 1.2, SKIN); }
  else if (arms === 'wheat' || arms === 'giveWheat') { const fx = arms === 'giveWheat' ? 1.6 : 0;
    B(0.3 + fx * 0.3, 4.5, 6.2, 2.4 + fx, 1.4, 2.4, TOP);
    for (let i = 0; i < 6; i++) B(2.0 + fx + (i % 3) * 0.7, 0.6 + i * 0.7, 5.0, 0.5, 0.5, 6.5 + (i % 2), '#E3C04A', { top: '#F2D768' });
    B(1.8 + fx, 0.4, 7.6, 2.4, 4.6, 0.8, '#B88A52'); }
  else { B(0.3, 4.5, 5, 1.6, 1.4, 4, TOP); B(0.3, 4.5, 4, 1.6, 1.4, 1, SKIN); }
}
/* ---------- skies (same as story 1) ---------- */
function sky(kind, W, H, horizon, sunX) {
  const B = { sunset: [['#1F1A30', 0], ['#2A2140', 0.18], ['#3B2A4E', 0.34], ['#5A3552', 0.5], ['#8A4A50', 0.64], ['#C06B4A', 0.76], ['#E39A55', 0.87], ['#F2C27A', 0.95]],
    night: [['#0F0D1C', 0], ['#141226', 0.3], ['#1A1830', 0.55], ['#211F3B', 0.75], ['#2A2846', 0.9]],
    morning: [['#5C7FB8', 0], ['#7495C4', 0.25], ['#93ACCF', 0.45], ['#B9C4D6', 0.62], ['#E3CDB8', 0.78], ['#F4D9A8', 0.9]],
    day: [['#4F86C6', 0], ['#5E93CF', 0.25], ['#77A6D8', 0.5], ['#95BCE0', 0.72], ['#C4D8E6', 0.9]] }[kind];
  let s = `<rect width="${W}" height="${H}" fill="${B[0][0]}"/>`;
  B.forEach(([col, t], i) => { const y0 = t * horizon, y1 = (i + 1 < B.length ? B[i + 1][1] : 1) * horizon; s += `<rect x="0" y="${y0.toFixed(1)}" width="${W}" height="${(y1 - y0 + 1).toFixed(1)}" fill="${col}"/>`; });
  const q = Math.round(W / 60), R = kind === 'night' ? 3 : 5;
  const sx = (kind === 'morning' || kind === 'day') ? W - sunX : sunX, sy = kind === 'night' ? horizon * 0.28 : kind === 'day' ? horizon * 0.3 : horizon - q * 3.5;
  for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) if (i * i + j * j <= R * R + 1) {
    let col = i * i + j * j <= 9 ? '#FFE9B0' : '#FFD98A';
    if (kind === 'night') { col = (i - 1) * (i - 1) + (j + 1) * (j + 1) <= 2 ? '#D8CFA8' : '#F4ECC8'; }
    s += `<rect x="${sx + i * q}" y="${(sy + j * q).toFixed(1)}" width="${q + 0.5}" height="${q + 0.5}" fill="${col}"/>`; }
  const ns = kind === 'night' ? 110 : kind === 'sunset' ? 46 : 0;
  for (let i = 0; i < ns; i++) { const x = hash(i, 3, 1) * W, y = hash(i, 7, 2) * horizon * (kind === 'night' ? 0.85 : 0.42), z = 2 + Math.round(hash(i, 1, 9) * 3); s += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${z}" height="${z}" fill="#F4EAD6" opacity="${(0.35 + 0.6 * hash(i, 5, 5)).toFixed(2)}"/>`; }
  const sea = { sunset: '#24304F', night: '#141A30', morning: '#3F6C9A', day: '#3A72A6' }[kind];
  s += `<rect x="0" y="${horizon}" width="${W}" height="${H - horizon}" fill="${sea}"/>`;
  for (let i = 0; i < 70; i++) { const y = horizon + 6 + hash(i, 2, 8) * (H - horizon - 12), x = hash(i, 4, 6) * W, w = 30 + hash(i, 9, 3) * 90; const hi = hash(i, 8, 8) > 0.5; const lightSea = kind === 'morning' || kind === 'day'; s += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="4" fill="${hi ? (lightSea ? '#6E95BE' : '#3A4A72') : (kind === 'night' ? '#F4ECC8' : lightSea ? '#CFE3F2' : '#F2C27A')}" opacity="${hi ? 0.7 : (kind === 'night' ? 0.12 : 0.22)}"/>`; }
  return s;
}
const LIGHT = { night: { top: 0.84, left: 0.68, right: 0.55, tintTop: [90, 100, 170, 0.24], tintSide: [40, 40, 100, 0.28] }, morning: { tintTop: [255, 236, 200, 0.10], tintSide: [80, 90, 130, 0.08] }, day: { tintTop: [255, 250, 230, 0.06], tintSide: [80, 90, 130, 0.06] } };
const variants = { wide: { W: 1600, H: 1000, s: 27, cx: 800, cy: 350, horizon: 385, sunX: 1250 }, tall: { W: 1000, H: 1300, s: 26.5, cx: 500, cy: 600, horizon: 610, sunX: 770 } };
const P = (v, x, y, z) => [v.cx + (x - y) * Math.cos(Math.PI / 6) * v.s, v.cy + (x + y) * 0.5 * v.s - z * v.s];
function glow(v, [x, y, z, r, col], id) { const [px, py] = P(v, x, y, z); col = col || '#FFD27A'; return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${col}" stop-opacity=".55"/><stop offset=".5" stop-color="${col}" stop-opacity=".18"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs><circle cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" r="${r * v.s}" fill="url(#${id})"/>`; }
// thought bubble with a wheat icon, above the villager's head
function bubble(v, [x, y, z]) { const [px, py] = P(v, x, y, z); const s = v.s / 27; const bx = px + 70 * s, by = py - 95 * s;
  let g = `<g><circle cx="${(px + 18 * s).toFixed(0)}" cy="${(py - 22 * s).toFixed(0)}" r="${7 * s}" fill="#FFF8EA"/><circle cx="${(px + 38 * s).toFixed(0)}" cy="${(py - 48 * s).toFixed(0)}" r="${11 * s}" fill="#FFF8EA"/>`;
  g += `<rect x="${(bx - 62 * s).toFixed(0)}" y="${(by - 58 * s).toFixed(0)}" width="${124 * s}" height="${104 * s}" rx="${26 * s}" fill="#FFF8EA" stroke="#E7D9BC" stroke-width="${3 * s}"/>`;
  const q = 8 * s; const stalks = [[-3, 0], [-1, -1], [1, 0], [3, -1]];
  for (const [i, j] of stalks) { for (let k = 0; k < 5; k++) g += `<rect x="${(bx + i * q * 1.1 - q / 2).toFixed(1)}" y="${(by + (j - k - 1) * q).toFixed(1)}" width="${q}" height="${q}" fill="${k < 2 ? '#8DBA48' : (k % 2 ? '#E3C04A' : '#F2D768')}"/>`; }
  g += `<rect x="${(bx - 4 * q).toFixed(0)}" y="${(by - 1.3 * q).toFixed(0)}" width="${8 * q}" height="${q * 0.9}" fill="#B88A52"/></g>`;
  return g; }

/* ---------- story 2: אוֹרִי וְהַפַּנְדָּה (mountain + jungle) ---------- */
const S2trees = [[15, 4, 6, 2.6, true], [18, 8, 5, 2.3, true], [13, 2, 5, 2.0, true]];
const S2bam = [[16, 11, 4], [17, 12, 5], [18, 11, 3], [15, 13, 4]];
const s2flow = [[11, 10, '#F2C94C'], [10, 13, '#F4E9D0'], [13, 11, '#E8732C'], [9, 15, '#F2C94C'], [14, 16, '#F4E9D0']];
const s2 = (o) => Object.assign({ sky: 'day', trees: S2trees, bamboo: S2bam, flowers: s2flow }, o);
const T1 = { y: 8 }, T2 = { y: 11 };
const ORES = [[10, 5, GOLD], [11, 6, DIAM], [6, 4, EMER], [9, 6, GOLD], [7, 3, DIAM]];
const ORI_M = { x: 10.4, y: 7.0 }, ORI_J = { x: 13.2, y: 12.6 }, PANDA_J = { x: 15.4, y: 14.2 };
const STORY2 = {
  1: { base: s2({ noIsland: true, sky: 'day', boat: [8.5, 11, 0.75], ori: { x: 9.5, y: 11.4, z: 1.05, scale: 0.36, arms: 'up' } }),
       reveal: s2({ boat: [14.6, 18.6], ori: Object.assign({ arms: 'up' }, ORI_M) }) },
  2: { base: s2({ ori: Object.assign({ arms: 'pick' }, ORI_M) }),
       reveal: s2({ tunnels: [T1], ores: ORES, ori: Object.assign({ arms: 'pick' }, ORI_M) }) },
  3: { base: s2({ tunnels: [T1], ores: ORES, ori: Object.assign({ arms: 'down' }, ORI_M) }),
       reveal: s2({ tunnels: [T1], ores: ORES, chest: { x: 9.2, y: 9.4 }, ori: Object.assign({ arms: 'up' }, ORI_M), glow: [10.2, 10.2, 2.2, 2.4] }) },
  4: { base: s2({ tunnels: [T1], ores: ORES, chest: { x: 9.2, y: 9.4 }, ori: Object.assign({ arms: 'down' }, ORI_M) }),
       reveal: s2({ tunnels: [T1], ores: ORES, chest: { x: 9.2, y: 9.4, open: true, map: true }, ori: Object.assign({ arms: 'both' }, ORI_M), glow: [10.2, 10.2, 2.6, 2.6] }) },
  5: { base: s2({ tunnels: [T1], ores: ORES, chest: { x: 9.2, y: 9.4, open: true }, ori: Object.assign({ arms: 'map' }, ORI_M) }),
       reveal: s2({ tunnels: [T1], ores: ORES, chest: { x: 9.2, y: 9.4, open: true }, ori: Object.assign({ arms: 'map' }, ORI_J) }) },
  6: { base: s2({ tunnels: [T1], ores: ORES, chest: { x: 9.2, y: 9.4, open: true }, ori: Object.assign({ arms: 'map' }, ORI_J) }),
       reveal: s2({ tunnels: [T1], ores: ORES, chest: { x: 9.2, y: 9.4, open: true }, ori: Object.assign({ arms: 'map' }, ORI_J), panda: Object.assign({ pose: 'sleep' }, PANDA_J) }) },
  7: { base: s2({ tunnels: [T1], ores: ORES, chest: { x: 9.2, y: 9.4, open: true }, ori: Object.assign({ arms: 'down' }, ORI_J), panda: Object.assign({ pose: 'sleep' }, PANDA_J) }),
       reveal: s2({ tunnels: [T1], ores: ORES, chest: { x: 9.2, y: 9.4, open: true }, ori: Object.assign({ arms: 'up' }, ORI_J), panda: Object.assign({ pose: 'happy' }, PANDA_J) }) },
  8: { base: s2({ tunnels: [T1], ores: ORES, chest: { x: 9.2, y: 9.4, open: true }, ori: Object.assign({ arms: 'pick' }, ORI_M), panda: { x: 12.0, y: 9.4, pose: 'sit' } }),
       reveal: s2({ tunnels: [T1, T2], ores: ORES, chest: { x: 9.2, y: 9.4, open: true }, ori: Object.assign({ arms: 'pick' }, ORI_M), panda: { x: 12.0, y: 9.4, pose: 'happy' }, gems: [[10.4, 7.6], [11.2, 7.9, 0.8], [10.6, 8.6, 0.9]] }) },
  9: { base: s2({ sky: 'sunset', tunnels: [T1, T2], ores: ORES, chest: { x: 9.2, y: 9.4, open: true }, ori: Object.assign({ arms: 'down' }, ORI_M), panda: { x: 12.0, y: 9.4, pose: 'sit' } }),
       reveal: s2({ sky: 'sunset', tunnels: [T1, T2], ores: ORES, chest: { x: 9.2, y: 9.4, open: true }, portal: { x: 13, y: 13 }, ori: Object.assign({ arms: 'both' }, ORI_M), panda: { x: 12.0, y: 9.4, pose: 'happy' }, glow: [13.5, 15, 3.5, 5, '#C27BF0'] }) },
  10: { base: s2({ sky: 'sunset', tunnels: [T1, T2], ores: ORES, portal: { x: 13, y: 13 }, ori: Object.assign({ arms: 'down' }, ORI_M), glow: [13.5, 15, 3.5, 5, '#C27BF0'] }),
       reveal: s2({ sky: 'sunset', tunnels: [T1, T2], ores: ORES, portal: { x: 13, y: 13 }, ori: { x: 15.4, y: 12.6, arms: 'up' }, panda: { x: 14.8, y: 15.2, pose: 'happy' }, glow: [13.5, 15, 3.5, 5.5, '#C27BF0'] }) },
};
/* ---------- story 3: אוֹרִי וְהַכַּפְרִי (village, wheat, emeralds) ---------- */
const HS = { x: 5, y: 9, w: 4, d: 3 };
const FIELD = { x0: 11, x1: 14, y0: 4, y1: 7, ripe: true };
const FIELD_CUT = Object.assign({}, FIELD, { cut: [[11, 6], [11, 7], [12, 6], [12, 7], [13, 7]] });
const PATH = [[9, 10], [10, 10], [10, 9], [10, 8], [11, 8], [12, 8], [10, 11], [10, 12], [10, 13], [11, 13], [11, 14], [12, 14], [12, 15]];
const S3trees = [[3, 4, 4, 2.0], [6, 15, 4, 1.9], [16, 2, 4, 1.8]];
const s3flow = [[8, 13, '#F2C94C'], [13, 11, '#F4E9D0'], [14, 13, '#E8732C'], [9, 15, '#F4E9D0'], [7, 7, '#F2C94C']];
const s3 = (o) => Object.assign({ sky: 'day', trees: S3trees, flowers: s3flow, field: FIELD, path: PATH }, o);
const VIL = { x: 9.4, y: 10.6 }, ORI_V = { x: 12.6, y: 10.8 }, ORI_F = { x: 12.4, y: 9.0 };
const STORY3 = {
  1: { base: s3({ ori: Object.assign({ arms: 'down' }, ORI_V) }),
       reveal: s3({ house: HS, ori: Object.assign({ arms: 'up' }, ORI_V) }) },
  2: { base: s3({ house: HS, ori: Object.assign({ arms: 'down' }, ORI_V) }),
       reveal: s3({ house: HS, villager: VIL, ori: Object.assign({ arms: 'up' }, ORI_V) }) },
  3: { base: s3({ house: HS, villager: VIL, ori: Object.assign({ arms: 'down' }, ORI_V) }),
       reveal: s3({ house: HS, villager: VIL, ori: Object.assign({ arms: 'down' }, ORI_V), bubble: [VIL.x, VIL.y, 9.6] }) },
  4: { base: s3({ house: HS, villager: VIL, ori: Object.assign({ arms: 'down' }, ORI_V), bubble: [VIL.x, VIL.y, 9.6] }),
       reveal: s3({ house: HS, villager: VIL, ori: Object.assign({ arms: 'up' }, ORI_F), glow: [13, 6, 4, 4] }) },
  5: { base: s3({ house: HS, villager: VIL, ori: Object.assign({ arms: 'down' }, ORI_F) }),
       reveal: s3({ house: HS, villager: VIL, field: FIELD_CUT, ori: Object.assign({ arms: 'wheat' }, ORI_F) }) },
  6: { base: s3({ house: HS, villager: VIL, field: FIELD_CUT, ori: Object.assign({ arms: 'wheat' }, ORI_V) }),
       reveal: s3({ house: HS, villager: Object.assign({ arms: 'wheat' }, VIL), field: FIELD_CUT, ori: Object.assign({ arms: 'up' }, ORI_V) }) },
  7: { base: s3({ house: HS, villager: Object.assign({ arms: 'wheat' }, VIL), field: FIELD_CUT, ori: Object.assign({ arms: 'down' }, ORI_V) }),
       reveal: s3({ house: HS, villager: Object.assign({ arms: 'wheat' }, VIL), field: FIELD_CUT, ori: Object.assign({ arms: 'emerald' }, ORI_V), glow: [ORI_V.x + 0.6, ORI_V.y + 1, 8.6, 2.6, '#8BEBB0'] }) },
  8: { base: s3({ house: HS, villager: VIL, field: FIELD_CUT, ori: Object.assign({ arms: 'emerald' }, ORI_V) }),
       reveal: s3({ house: HS, villager: Object.assign({ arms: 'up' }, VIL), field: FIELD_CUT, ori: Object.assign({ arms: 'both' }, ORI_V),
         gems: [[13.2, 13.2], [13.8, 13.6], [13.4, 14.1], [14.2, 13.0, 0.8], [12.9, 14.2, 0.8], [14.3, 14.3, 0.9], [13.7, 14.6, 0.7]], glow: [14, 14, 2.2, 3, '#8BEBB0'] }) },
  9: { base: s3({ house: HS, villager: VIL, field: FIELD_CUT, ori: Object.assign({ arms: 'down' }, ORI_V), gems: [[13.2, 13.2], [13.8, 13.6], [13.4, 14.1]] }),
       reveal: s3({ house: HS, villager: Object.assign({ arms: 'up' }, VIL), field: FIELD_CUT, ori: Object.assign({ arms: 'both' }, ORI_V), boat: [13.6, 18.4, 0.75, true] }) },
  10: { base: s3({ sky: 'sunset', house: HS, villager: VIL, field: FIELD_CUT, ori: Object.assign({ arms: 'down' }, ORI_V), boat: [13.6, 18.4, 0.75, true] }),
       reveal: s3({ sky: 'sunset', house: HS, villager: Object.assign({ arms: 'up' }, VIL), field: FIELD_CUT, boat: [16.2, 18.4, 0.75, true], ori: { x: 16.8, y: 18.8, z: 1.05, scale: 0.36, arms: 'up' } }) },
};

const STORIES = { s2: { pages: STORY2, hm: () => { const h = hmMountain(); h.mt = true; return h; } }, s3: { pages: STORY3, hm: hmVillage } };
function renderAll(STORIES, args, baseDir, buildFn) { buildFn = buildFn || build;
const [onlyStory, onlyPage] = args;
for (const [sid, st] of Object.entries(STORIES)) { if (onlyStory && onlyStory !== sid) continue;
  const Hm = st.hm(); const dir = path.join(baseDir || __dirname, sid); fs.mkdirSync(dir, { recursive: true });
  for (const [n, pg] of Object.entries(st.pages)) { if (onlyPage && onlyPage !== n) continue;
    for (const stage of ['base', 'reveal']) { const o = pg[stage]; const S = buildFn(o, Hm);
      for (const [name, v0] of Object.entries(variants)) { const v = Object.assign({}, v0, o.view ? o.view[name] : {});
        let svg = S.render(Object.assign({ bg: o.bg ? o.bg(v) : sky(o.sky, v.W, v.H, v.horizon, v.sunX), light: o.light || LIGHT[o.sky] }, v));
        let extra = ''; if (o.glow) extra += glow(v, o.glow, 'gl'); if (o.bubble) extra += bubble(v, o.bubble);
        if (extra) svg = svg.replace('</svg>', extra + '</svg>');
        fs.writeFileSync(path.join(dir, `p${n}-${stage}-${name}.svg`), svg);
      } } } }
}

module.exports = { build, person, house, chest, portal, gem, boat, cloud, sky, LIGHT, variants, P, glow, islandH, renderAll, N, c, pick, GRASS, SAND, WATER, DIRT, STONE, LEAF, GOLD, DIAM, EMER, EMER2, DARK };
if (require.main === module) { renderAll(STORIES, process.argv.slice(2)); console.log('done'); }
