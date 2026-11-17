// Draws all 10 pages (base + reveal), wide + tall, in the handoff's voxel style. Original art only.
const fs = require('fs'); const { Scene, hash } = require('./voxel.js');
const N = 21, c = (N - 1) / 2;
const pick = (arr, r) => arr[Math.floor(r * arr.length) % arr.length];
const GRASS = ['#7DB24A', '#86BA52', '#74A944', '#7FB64E'], SAND = ['#E6CE93', '#DEC587', '#EAD49C'], WATER = ['#3E8FB0', '#4698B8', '#3987A8', '#4FA3C2'], DIRT = '#8A5A3A', STONE = ['#8F8C97', '#9A97A2', '#84818C'];
const LEAF = ['#3F8F3C', '#4FA046', '#357A33', '#479A42', '#5BAA4C'];
const Hm = [];
for (let x = 0; x < N; x++) { Hm[x] = []; for (let y = 0; y < N; y++) {
  const dx = x - c, dy = (y - c) * 1.08, ang = Math.atan2(dy, dx);
  const r = Math.sqrt(dx * dx + dy * dy) + 1.1 * Math.sin(ang * 3 + 0.6) + 0.7 * Math.sin(ang * 5 + 2) + (hash(x, y, 5) - 0.5) * 0.8;
  let h = 0; if (r < 9.0) h = 1; if (r < 7.7) h = 2; if (r < 4.6) h = 3;
  const hx = x - 4.5, hy = y - 9.5, hr = Math.sqrt(hx * hx + hy * hy);
  if (h >= 2) { if (hr < 3.6) h = Math.max(h, 4); if (hr < 2.3) h = 5; if (hr < 1.2) h = 6; }
  Hm[x][y] = h;
} }
const HOUSE = { x: 12, y: 6, w: 5, d: 4 };
function build(o) {
  const S = new Scene(); const night = o.sky === 'night';
  const H = (x, y) => { let h = Hm[x][y]; if (o.house && x >= HOUSE.x - 1 && x < HOUSE.x + HOUSE.w + 1 && y >= HOUSE.y - 1 && y < HOUSE.y + HOUSE.d + 1 && h >= 2) h = 3; return h; };
  const G = (x, y) => H(Math.floor(x), Math.floor(y)) + 1;
  const TREES = (o.trees || []);
  const leafAt = new Set(), leaves = [];
  for (const [tx, ty, th, rad] of TREES) { const base = H(tx, ty) + 1, cz = base + th + rad * 0.55;
    for (let x = Math.floor(tx - rad - 1); x <= tx + rad + 1; x++) for (let y = Math.floor(ty - rad - 1); y <= ty + rad + 1; y++) for (let z = Math.floor(cz - rad); z <= cz + rad + 1; z++) {
      const dx = x - tx, dy = y - ty, dz = (z - cz) * 1.25; const dd = Math.sqrt(dx * dx + dy * dy + dz * dz) + (hash(x, y, z) - 0.5) * 0.9;
      if (dd <= rad) { leaves.push([x, y, z]); leafAt.add(x + ',' + y); } } }
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) {
    if (o.noIsland) continue;
    const h = o.noIsland ? 0 : H(x, y);
    S.vox(x, y, -2, pick(STONE, hash(x, y, 9)));
    if (h === 0) { S.vox(x, y, -1, '#2F7C9D'); S.vox(x, y, 0, pick(WATER, hash(x, y, 1)), { op: 0.93, decT: hash(x, y, 2) > 0.86 ? [[0.15, 0.4, 0.7, 0.14, '#BFE6F0', 0.7]] : [] }); continue; }
    S.vox(x, y, -1, DIRT);
    for (let z = 0; z <= h; z++) { const topv = z === h;
      if (h === 1) S.vox(x, y, z, pick(SAND, hash(x, y, z)));
      else if (h >= 5 && hash(x, y, 3) > 0.45) S.vox(x, y, z, pick(STONE, hash(x, y, z)));
      else if (topv) S.vox(x, y, z, pick(GRASS, hash(x, y, 4)), { side: DIRT, lip: true, shadow: leafAt.has(x + ',' + y) || leafAt.has((x - 1) + ',' + (y - 1)) });
      else S.vox(x, y, z, DIRT); } }
  for (const [tx, ty, th] of TREES) for (let i = 1; i <= th + 1; i++) S.vox(tx, ty, H(tx, ty) + i, i % 2 ? '#7A4E2B' : '#845630');
  for (const [x, y, z] of leaves) { if (S.has(x, y, z)) continue; S.vox(x, y, z, pick(LEAF, hash(x, y, z + 11))); }
  for (const [sx, sy] of (o.stumps || [])) { S.vox(sx, sy, H(sx, sy) + 1, '#845630', { top: '#C9A26B' }); }
  if (!o.noIsland) {
    const flower = (x, y, col) => { S.box(x + 0.42, y + 0.42, G(x, y), 0.16, 0.16, 0.34, '#3F8F3C', { nojit: true }); S.box(x + 0.3, y + 0.3, G(x, y) + 0.34, 0.4, 0.4, 0.22, col, { nojit: true }); };
    [[11, 12, '#F4E9D0'], [10, 15, '#F2C94C'], [15, 14, '#E8732C'], [9, 13, '#F2C94C'], [12, 17, '#E8732C'], [8, 16, '#F4E9D0'], [16, 15, '#F2C94C'], [11, 16, '#F4E9D0']].forEach(f => { if (H(f[0], f[1]) >= 2 && !leafAt.has(f[0] + ',' + f[1])) flower(...f); });
    S.box(10.2, 17.2, G(10, 17), 0.9, 0.8, 0.6, '#9A97A2'); S.box(10.9, 16.9, G(10, 17), 0.5, 0.5, 0.35, '#84818C');
  }
  if (o.house) house(S, G, night);
  if (o.boat) boat(S, ...o.boat);
  if (o.chest) chest(S, G, o.chest);
  if (o.ori) person(S, G, Object.assign({ kind: 'ori' }, o.ori));
  if (o.zombie) person(S, G, Object.assign({ kind: 'zombie' }, o.zombie));
  if (!night) { cloud(S, -2, 6, 15, 1); cloud(S, 16, -3, 13.5, 0.8); cloud(S, -6, 17, 10, 0.7); }
  return S;
}
function cloud(S, x, y, z, sc) { const o = { op: 0.92, nojit: true, top: '#FFF6E6', sideL: '#EBD9D2', sideR: '#D9C2C6' }; S.box(x, y, z, 4 * sc, 2 * sc, 0.9 * sc, '#FFF6E6', Object.assign({ sort: 100 }, o)); S.box(x + 1 * sc, y + 0.3 * sc, z + 0.9 * sc, 2.2 * sc, 1.4 * sc, 0.8 * sc, '#FFF6E6', Object.assign({ sort: 100.1 }, o)); S.box(x - 1.2 * sc, y + 0.4 * sc, z + 0.1 * sc, 1.6 * sc, 1.2 * sc, 0.6 * sc, '#FFF6E6', Object.assign({ sort: 99.9 }, o)); }
function boat(S, bx, by, z) { z = z == null ? 0.75 : z; const W = '#9A6A35', D = '#7A5228';
  S.box(bx, by, z, 3.2, 1.6, 0.5, D, { sort: bx + by + 2.4 }); S.box(bx, by, z + 0.5, 3.2, 0.25, 0.45, W, { sort: bx + by + 2.41 }); S.box(bx, by + 1.35, z + 0.5, 3.2, 0.25, 0.45, W, { sort: bx + by + 2.6 });
  S.box(bx, by + 0.25, z + 0.5, 0.25, 1.1, 0.45, W, { sort: bx + by + 2.42 }); S.box(bx + 2.95, by + 0.25, z + 0.5, 0.25, 1.1, 0.45, W, { sort: bx + by + 2.62 });
  S.box(bx + 1.3, by + 0.25, z + 0.5, 0.5, 1.1, 0.2, '#B88A52', { sort: bx + by + 2.5 }); }
function house(S, G, night) { const { x, y, w, d } = HOUSE; const z0 = 4; const PL = '#B88A52', PL2 = '#A87A45', LOG = '#7A4E2B', ROOF = '#9A3B2B', ROOF2 = '#B14A35';
  const WIN = night ? '#FFD27A' : '#9CC9E6';
  for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) for (let k = 0; k < 4; k++) {
    const edge = (i === 0 || i === w - 1) && (j === 0 || j === d - 1);
    const o = {};
    if (i === w - 1 && k === 1 && j === 1) o.decR = [[0.15, 0, 0.7, 0.95, '#5A3A1C']];
    if (i === w - 1 && k === 2 && j === 1) o.decR = [[0.15, 0, 0.7, 0.6, '#5A3A1C']];
    if (i === w - 1 && k === 2 && j === 3 - 1) o.decR = [[0.15, 0.2, 0.7, 0.6, WIN]];
    if (j === d - 1 && k === 2 && (i === 1 || i === 3)) o.decL = [[0.15, 0.2, 0.7, 0.6, WIN]];
    S.vox(x + i, y + j, z0 + k, edge ? LOG : ((i + j + k) % 2 ? PL : PL2), o);
  }
  for (let s = 0; s < 3; s++) for (let i = -1 + s; i <= w - s; i++) for (let j = -1; j <= d; j++) S.vox(x + i, y + j, z0 + 4 + s, (i + j) % 2 ? ROOF : ROOF2, { sort: x + i + y + j + 0.5 });
}
function chest(S, G, { x, y, open }) { const z = G(x, y); const W = '#A06A2E', D = '#7A4E22', GOLD = '#F2C94C';
  S.box(x, y, z, 2, 1.4, 1.1, W, { decR: [[0.55, 0.45, 0.3, 0.3, GOLD]], decL: [[0.85, 0.55, 0.3, 0.3, GOLD]], sort: x + y + 1.5 });
  if (!open) S.box(x, y, z + 1.1, 2, 1.4, 0.5, D, { sort: x + y + 1.6 });
  else { S.box(x, y - 0.2, z + 1.1, 2, 0.3, 1.2, D, { sort: x + y + 0.6 });
    [[0.2, 0.2, GOLD], [0.8, 0.5, GOLD], [1.3, 0.3, '#5FD3E0'], [0.5, 0.8, '#E8732C'], [1.2, 0.9, GOLD]].forEach(([u, v, col], i) => S.box(x + u, y + v, z + 1.1, 0.45, 0.45, 0.35 + (i % 2) * 0.15, col, { nojit: true, sort: x + y + 1.62 + i * 0.001 }));
  } }
function person(S, G, p) { const { x: ox, y: oy, kind } = p; const z0 = (p.z != null ? p.z : G(ox, oy)); const u = p.scale || 0.44; const k = ox + oy + 1.2; let n = 0;
  const B = (x, y, z, w, d, h, col, o) => S.box(ox + x * u, oy + y * u, z0 + z * u, w * u, d * u, h * u, col, Object.assign({ sort: k + (n++) * 0.001, nojit: true, fl: 0.9, fr: 0.78 }, o || {}));
  const Z = kind === 'zombie';
  const SKIN = Z ? '#7FB35A' : '#EDBE94', TOP = Z ? '#6A4C9C' : '#E8732C', TOP2 = Z ? '#57407F' : '#F6A45A', PANTS = Z ? '#5B4A3A' : '#3D5A8C', SHOE = Z ? '#3A3040' : '#F4EAD6', HAIR = Z ? '#4F7F3A' : '#33263A', EYE = Z ? '#E84A3A' : '#2A2233';
  const arms = p.arms || 'down';
  if (!Z) B(-1.7, 0.3, 4.4, 1.7, 3.8, 4.2, '#2FA39A');
  // far arm
  if (Z) B(0.2, -1.5, 7.2, 4.5, 1.4, 1.5, SKIN); else if (arms === 'both') { B(0.2, -1.5, 9, 1.4, 1.3, 3.4, TOP); B(0.2, -1.5, 12.4, 1.4, 1.3, 1.2, SKIN); } else { B(0.2, -1.5, 5, 1.6, 1.4, 4, TOP); B(0.2, -1.5, 4, 1.6, 1.4, 1, SKIN); }
  B(0, 0, 0, 2.3, 2, 1, SHOE); B(0, 2.4, 0, 2.3, 2, 1, SHOE);
  B(0, 0, 1, 2, 2, 3, PANTS); B(0, 2.4, 1, 2, 2, 3, PANTS);
  B(0, -0.1, 4, 2.2, 4.6, 5, TOP, { decR: [[1.5 * u, 0.5 * u, 1.6 * u, 1.3 * u, TOP2]], decL: [[0, 0, 2.2 * u, 0.5 * u, TOP2]] });
  const face = Z ? [[0, 3.1 * u, 4.6 * u, 0.9 * u, HAIR], [0.8 * u, 1.7 * u, 0.9 * u, 0.8 * u, EYE], [3.0 * u, 1.7 * u, 0.9 * u, 0.8 * u, EYE], [1.5 * u, 0.5 * u, 1.6 * u, 0.5 * u, '#2F4A22']]
    : [[0, 3.1 * u, 4.6 * u, 0.9 * u, HAIR], [0.8 * u, 1.7 * u, 0.8 * u, 1.0 * u, EYE], [3.0 * u, 1.7 * u, 0.8 * u, 1.0 * u, EYE], [0.85 * u, 2.3 * u, 0.3 * u, 0.3 * u, '#FFFFFF'], [3.05 * u, 2.3 * u, 0.3 * u, 0.3 * u, '#FFFFFF'], [1.7 * u, 0.6 * u, 1.2 * u, 0.35 * u, '#B5563C'], [1.4 * u, 0.95 * u, 0.3 * u, 0.3 * u, '#B5563C'], [2.9 * u, 0.95 * u, 0.3 * u, 0.3 * u, '#B5563C']];
  B(-0.7, -0.1, 9, 3.6, 4.6, 4, SKIN, { decR: face, decL: [[0, 1.6 * u, 3.6 * u, 2.4 * u, HAIR], [0, 0.6 * u, 1.4 * u, 1.0 * u, HAIR]] });
  if (Z) { B(-0.9, -0.3, 13, 4.0, 5.0, 0.6, HAIR); B(0.3, 0.6, 13.6, 1.2, 1.0, 0.5, '#3E6A2C'); }
  else { B(-0.9, -0.3, 13, 4.0, 5.0, 0.9, HAIR); B(-0.4, 0.5, 13.9, 1.4, 1.4, 0.7, HAIR); B(1.0, 2.4, 13.9, 1.5, 1.6, 0.6, HAIR); B(-0.6, 3.0, 13.9, 1.2, 1.2, 0.9, HAIR); }
  // near arm + held items
  if (Z) B(0.3, 4.5, 7.2, 4.5, 1.4, 1.5, SKIN);
  else if (arms === 'up' || arms === 'both') { B(0.3, 4.5, 6.8, 1.6, 1.4, 2.2, TOP); B(0.6, 4.9, 9, 1.4, 1.3, 3.4, TOP); B(0.6, 4.9, 12.4, 1.4, 1.3, 1.2, SKIN); }
  else if (arms === 'log') { B(2.0, -1.8, 6.2, 2.0, 8.4, 2.0, '#845630', { top: '#7A4E2B', decL: [[0, 0, 2 * u, 2 * u, '#C9A26B']] }); B(0.3, 4.5, 6.2, 2.4, 1.4, 2.6, TOP); }
  else if (arms === 'lantern') { B(0.3, 4.5, 5.5, 1.6, 1.4, 3.5, TOP); B(1.0, 4.6, 4.2, 1.4, 1.3, 1.3, SKIN); B(2.2, 4.5, 1.2, 1.6, 1.6, 2.4, '#FFD27A', { top: '#FFE9B0', fl: 1.1, fr: 1.0 }); B(2.0, 4.3, 3.6, 2.0, 2.0, 0.5, '#3A3040'); }
  else { B(0.3, 4.5, 5, 1.6, 1.4, 4, TOP); B(0.3, 4.5, 4, 1.6, 1.4, 1, SKIN); }
}
// skies
function sky(kind, W, H, horizon, sunX) {
  const B = { sunset: [['#1F1A30', 0], ['#2A2140', 0.18], ['#3B2A4E', 0.34], ['#5A3552', 0.5], ['#8A4A50', 0.64], ['#C06B4A', 0.76], ['#E39A55', 0.87], ['#F2C27A', 0.95]],
    night: [['#0F0D1C', 0], ['#141226', 0.3], ['#1A1830', 0.55], ['#211F3B', 0.75], ['#2A2846', 0.9]],
    morning: [['#5C7FB8', 0], ['#7495C4', 0.25], ['#93ACCF', 0.45], ['#B9C4D6', 0.62], ['#E3CDB8', 0.78], ['#F4D9A8', 0.9]] }[kind];
  let s = `<rect width="${W}" height="${H}" fill="${B[0][0]}"/>`;
  B.forEach(([col, t], i) => { const y0 = t * horizon, y1 = (i + 1 < B.length ? B[i + 1][1] : 1) * horizon; s += `<rect x="0" y="${y0.toFixed(1)}" width="${W}" height="${(y1 - y0 + 1).toFixed(1)}" fill="${col}"/>`; });
  const q = Math.round(W / 60), R = kind === 'night' ? 3 : 5;
  const sx = kind === 'morning' ? W - sunX : sunX, sy = kind === 'night' ? horizon * 0.28 : horizon - q * 3.5;
  for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) if (i * i + j * j <= R * R + 1) {
    let col = i * i + j * j <= 9 ? '#FFE9B0' : '#FFD98A';
    if (kind === 'night') { col = (i - 1) * (i - 1) + (j + 1) * (j + 1) <= 2 ? '#D8CFA8' : '#F4ECC8'; }
    s += `<rect x="${sx + i * q}" y="${(sy + j * q).toFixed(1)}" width="${q + 0.5}" height="${q + 0.5}" fill="${col}"/>`; }
  const ns = kind === 'night' ? 110 : kind === 'sunset' ? 46 : 0;
  for (let i = 0; i < ns; i++) { const x = hash(i, 3, 1) * W, y = hash(i, 7, 2) * horizon * (kind === 'night' ? 0.85 : 0.42), z = 2 + Math.round(hash(i, 1, 9) * 3); s += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${z}" height="${z}" fill="#F4EAD6" opacity="${(0.35 + 0.6 * hash(i, 5, 5)).toFixed(2)}"/>`; }
  const sea = { sunset: '#24304F', night: '#141A30', morning: '#3F6C9A' }[kind];
  s += `<rect x="0" y="${horizon}" width="${W}" height="${H - horizon}" fill="${sea}"/>`;
  for (let i = 0; i < 70; i++) { const y = horizon + 6 + hash(i, 2, 8) * (H - horizon - 12), x = hash(i, 4, 6) * W, w = 30 + hash(i, 9, 3) * 90; const hi = hash(i, 8, 8) > 0.5; s += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="4" fill="${hi ? (kind === 'morning' ? '#6E95BE' : '#3A4A72') : (kind === 'night' ? '#F4ECC8' : '#F2C27A')}" opacity="${hi ? 0.7 : (kind === 'night' ? 0.12 : 0.22)}"/>`; }
  return s;
}
const LIGHT = { night: { top: 0.84, left: 0.68, right: 0.55, tintTop: [90, 100, 170, 0.24], tintSide: [40, 40, 100, 0.28] }, morning: { tintTop: [255, 236, 200, 0.10], tintSide: [80, 90, 130, 0.08] } };
const variants = { wide: { W: 1600, H: 1000, s: 27, cx: 800, cy: 350, horizon: 385, sunX: 1250 }, tall: { W: 1000, H: 1300, s: 26.5, cx: 500, cy: 600, horizon: 610, sunX: 770 } };
const P = (v, x, y, z) => [v.cx + (x - y) * Math.cos(Math.PI / 6) * v.s, v.cy + (x + y) * 0.5 * v.s - z * v.s];
function glow(v, x, y, z, r) { const [px, py] = P(v, x, y, z); return `<defs><radialGradient id="gl"><stop offset="0" stop-color="#FFD27A" stop-opacity=".55"/><stop offset=".5" stop-color="#FFB54A" stop-opacity=".18"/><stop offset="1" stop-color="#FFB54A" stop-opacity="0"/></radialGradient></defs><circle cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" r="${r * v.s}" fill="url(#gl)"/>`; }
// page definitions: base, reveal
const T2 = [[9, 8, 7, 3.3], [15, 6, 6, 2.7], [6, 14, 5, 2.4], [17, 9, 4, 2.1], [11, 3, 4, 2.0]];
const T3 = [[9, 8, 7, 3.3], [6, 14, 5, 2.4], [17, 9, 4, 2.1], [11, 3, 4, 2.0]];
const TH = [[6, 14, 5, 2.4], [9, 3, 5, 2.2]]; // trees left once the house is built
const ORI = { x: 11.8, y: 13.6 };
const PAGES = {
  1: { base: { sky: 'sunset', noIsland: true, boat: [8.5, 11, 0.75], ori: { x: 9.5, y: 11.4, z: 1.05, scale: 0.36, arms: 'up' } },
       reveal: { sky: 'sunset', trees: [], boat: [15.6, 18.3], ori: Object.assign({ arms: 'up' }, ORI) } },
  2: { base: { sky: 'sunset', trees: [], boat: [15.6, 18.3], ori: Object.assign({ arms: 'up' }, ORI) },
       reveal: { sky: 'sunset', trees: T2, boat: [15.6, 18.3], ori: Object.assign({ arms: 'up' }, ORI) } },
  3: { base: { sky: 'sunset', trees: T3, stumps: [[15, 6]], ori: Object.assign({ arms: 'down' }, ORI) },
       reveal: { sky: 'sunset', trees: T3, stumps: [[15, 6]], ori: Object.assign({ arms: 'log' }, ORI) } },
  4: { base: { sky: 'sunset', trees: TH, stumps: [[15, 6], [9, 8]], ori: Object.assign({ arms: 'down' }, ORI) },
       reveal: { sky: 'sunset', trees: TH, house: true, ori: Object.assign({ arms: 'up' }, ORI) } },
  5: { base: { sky: 'sunset', trees: TH, house: true, ori: Object.assign({ arms: 'down' }, ORI) },
       reveal: { sky: 'night', trees: TH, house: true, ori: Object.assign({ arms: 'down' }, ORI) } },
  6: { base: { sky: 'night', trees: TH, house: true, ori: Object.assign({ arms: 'down' }, ORI) },
       reveal: { sky: 'night', trees: TH, house: true, ori: Object.assign({ arms: 'down' }, ORI), zombie: { x: 15.6, y: 15.4 } } },
  7: { base: { sky: 'night', trees: TH, house: true, ori: Object.assign({ arms: 'down' }, ORI), zombie: { x: 15.6, y: 15.4 } },
       reveal: { sky: 'night', trees: TH, house: true, ori: Object.assign({ arms: 'both' }, ORI), zombie: { x: 15.6, y: 15.4 } } },
  8: { base: { sky: 'night', trees: TH, house: true, ori: Object.assign({ arms: 'both' }, ORI), zombie: { x: 15.6, y: 15.4 } },
       reveal: { sky: 'night', trees: TH, house: true, ori: Object.assign({ arms: 'lantern' }, ORI), zombie: { x: 15.6, y: 15.4 }, glow: [ORI.x + 1.2, ORI.y + 2.2, 6, 5.5] } },
  9: { base: { sky: 'night', trees: TH, house: true, ori: Object.assign({ arms: 'lantern' }, ORI), zombie: { x: 15.6, y: 15.4 }, glow: [ORI.x + 1.2, ORI.y + 2.2, 6, 5.5] },
       reveal: { sky: 'night', trees: TH, house: true, ori: Object.assign({ arms: 'lantern' }, ORI), zombie: { x: 18.2, y: 16.4, z: 1.0, scale: 0.4 }, glow: [ORI.x + 1.2, ORI.y + 2.2, 6, 5.5] } },
  10: { base: { sky: 'morning', trees: TH, house: true, ori: Object.assign({ arms: 'down' }, ORI), chest: { x: 14, y: 14, open: false } },
       reveal: { sky: 'morning', trees: TH, house: true, ori: Object.assign({ arms: 'both' }, ORI), chest: { x: 14, y: 14, open: true }, glow: [15, 14.7, 5.5, 3.5] } },
};
const only = process.argv[2];
for (const [n, pg] of Object.entries(PAGES)) { if (only && only !== n) continue;
  for (const st of ['base', 'reveal']) { const o = pg[st]; const S = build(o);
    for (const [name, v] of Object.entries(variants)) {
      let svg = S.render(Object.assign({ bg: sky(o.sky, v.W, v.H, v.horizon, v.sunX), light: LIGHT[o.sky] }, v));
      if (o.glow) svg = svg.replace('</svg>', glow(v, ...o.glow) + '</svg>');
      fs.writeFileSync(`out/p${n}-${st}-${name}.svg`, svg);
    } } }
console.log('done');
