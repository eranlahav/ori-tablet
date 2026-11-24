// Saga episodes 13-15 (2026-11-22): the desert (treasure map), the snow mountain, the horse. Same voxel engine, same hero and dog; original art only.
// Usage: node art/saga3.js [s13|s14|s15] [page]  -> writes art/s13/p{n}-{base|reveal}-{wide|tall}.svg
const { hash } = require('./voxel.js');
const T = require('./stories.js');
const { renderAll, pick, chest, N, islandH, STONE, WATER, SAND, GOLD } = T;
const A = require('./saga.js');
const { hero, outdoor2, mobber2, iconBubble, poof, hmSaga } = A;

/* ---------- shared: a ground made of blocks, with the sea around it (like the saga island) ---------- */
function ground(S, H, mat) {
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) { const h = H[x][y];
    S.vox(x, y, -2, pick(STONE, hash(x, y, 9)));
    if (h === 0) { S.vox(x, y, -1, '#2F7C9D'); S.vox(x, y, 0, pick(WATER, hash(x, y, 1)), { op: 0.93, decT: hash(x, y, 2) > 0.86 ? [[0.15, 0.4, 0.7, 0.14, '#BFE6F0', 0.7]] : [] }); continue; }
    for (let z = -1; z <= h; z++) { const [col, o] = mat(x, y, z, z === h, h); S.vox(x, y, z, col, o || {}); } } }
// the hero, plus the few things he holds only in these episodes
function heroX(S, G, p) { const q = Object.assign({}, p); const extra = p.hold3; if (extra) { q.arms = 'up'; delete q.hold; }
  if (p.z == null && p.ride) q.z = G(p.x, p.y) + 2.0;
  hero(S, G, q); if (!extra) return;
  const ox = p.x, oy = p.y, z0 = (q.z != null ? q.z : G(ox, oy)), u = p.scale || 0.44, k = ox + oy + 1.2 + 0.06; let n = 0;
  const B = (x, y, z, w, d, h, col, o) => S.box(ox + x * u, oy + y * u, z0 + z * u, w * u, d * u, h * u, col, Object.assign({ grp: ox + ',' + oy, sort: k + (n++) * 0.001, nojit: true, fl: 0.9, fr: 0.78 }, o || {}));
  if (extra === 'shovel') { B(0.9, 5.0, 11.0, 0.8, 0.8, 6.0, '#7A4E2B'); B(0.5, 4.6, 7.6, 1.6, 1.6, 3.4, '#9FB3C8', { top: '#C8D6E4' }); }
  if (extra === 'compass') { B(0.7, 4.6, 13.0, 1.8, 1.8, 0.7, '#8792A0', { top: '#E9E2CF', decT: [[0.35 * u, 0.75 * u, 1.1 * u, 0.3 * u, '#D8323C']] }); }
  if (extra === 'gold') { B(0.6, 4.4, 13.0, 2.2, 1.4, 0.9, GOLD, { top: '#FFE58A' }); B(0.9, 4.6, 13.9, 1.6, 1.0, 0.8, GOLD, { top: '#FFE58A' }); }
  if (extra === 'snowball') { B(0.7, 4.7, 13.0, 1.4, 1.4, 1.4, '#F4F6FA', { top: '#FFFFFF' }); }
  if (extra === 'ice') { B(0.4, 4.4, 13.0, 2.0, 2.0, 2.0, '#9CC9E6', { top: '#CFE8F7', op: 0.92 }); }
  if (extra === 'carrot') { B(1.0, 5.0, 12.2, 0.8, 0.8, 2.4, '#F08A24', { top: '#F6A45A' }); B(1.1, 5.1, 14.6, 0.6, 0.6, 1.0, '#4FA046'); }
  if (extra === 'berry') { B(0.9, 4.9, 13.0, 1.2, 1.2, 1.2, '#D8323C', { top: '#E8604E' }); B(1.1, 5.1, 14.2, 0.8, 0.8, 0.4, '#4FA046'); }
}
function dogX(S, G, d) { if (d) mobber2(S, G, Object.assign({ kind: 'dog' }, d)); }
function xmark(S, x, y, z) { for (let i = 0; i < 5; i++) { S.box(x + i * 0.3, y + i * 0.3, z, 0.34, 0.34, 0.06, '#D8323C', { nojit: true, sort: x + y + 3 }); S.box(x + 1.2 - i * 0.3, y + i * 0.3, z, 0.34, 0.34, 0.06, '#D8323C', { nojit: true, sort: x + y + 3 }); } }
const VIEW = { wide: { s: 54, cx: 848, cy: 40 }, tall: { s: 46, cx: 540, cy: 300 } };

/* ---------- episode 13: the desert (follow the treasure map) ---------- */
// a sand island: low beach, a high dune at the back with a small sandstone pyramid
function hmDesert() { const H = [];
  for (let x = 0; x < N; x++) { H[x] = []; for (let y = 0; y < N; y++) { let h = islandH(x, y, 3.4);
    if (h >= 2) { const back = Math.hypot(x - 4, y - 5); if (back < 5.5) h = 3; if (back < 3.4) h = 4; }
    H[x][y] = h; } } return H; }
const SANDSTONE = ['#D8BE84', '#D2B67A', '#DDC48C'], SAND_DEEP = '#C2A46A';
const desertMat = (x, y, z, top, h) => { if (z < 0) return [SAND_DEEP];
  if (top) return [pick(['#EED9A0', '#E8D195', '#F2DFA8', '#E6CD8E'], hash(x, y, 4)), { side: pick(SANDSTONE, hash(x, y, z)) }];
  return [pick(SANDSTONE, hash(x, y, z + 3)), { decR: z % 2 ? [] : [[0, 0.45, 1, 0.1, '#C7AA70']], decL: z % 2 ? [] : [[0, 0.45, 1, 0.1, '#C7AA70']] }]; };
function cactus(S, G, x, y, h, arm) { const z = G(x, y); const C = '#4F9A3A', C2 = '#3E7F2E';
  for (let i = 0; i < h; i++) S.box(x + 0.1, y + 0.1, z + i, 0.8, 0.8, 1, C, { nojit: true, top: '#6FB84E', decR: [[0.15, 0, 0.1, 1, C2], [0.55, 0, 0.1, 1, C2]], decL: [[0.3, 0, 0.1, 1, C2]], sort: x + y + 1 + i * 0.01 });
  if (arm) { S.box(x + 0.9, y + 0.3, z + 1.2, 0.6, 0.4, 0.4, C, { nojit: true, sort: x + y + 1.4 }); S.box(x + 1.3, y + 0.3, z + 1.2, 0.4, 0.4, 1.2, C, { nojit: true, top: '#6FB84E', sort: x + y + 1.45 }); } }
function deadBush(S, G, x, y) { const z = G(x, y); [[0.3, 0.3, 0.7], [0.6, 0.2, 0.5], [0.2, 0.6, 0.45]].forEach(([a, b, h], i) => S.box(x + a, y + b, z, 0.1, 0.1, h, '#8A6A3E', { nojit: true, sort: x + y + 1 + i * 0.01 })); }
function pyramid(S, G) { const x0 = 2, y0 = 3, z0 = G(4, 5); for (let s = 0; s < 3; s++) for (let i = s; i < 5 - s; i++) for (let j = s; j < 5 - s; j++) S.vox(x0 + i, y0 + j, z0 + s, pick(SANDSTONE, hash(i, j, s + 30)), { decR: [[0, 0.8, 1, 0.12, '#C7AA70']], decL: [[0, 0.8, 1, 0.12, '#C7AA70']] });
  S.vox(x0 + 2, y0 + 2, z0 + 3, '#E3C46A', { top: '#F2D768' }); }
const CACTI = [[15, 6, 3, true], [6, 15, 2, false], [17, 16, 2, false], [12, 4, 3, false]];
const DIG = [14.0, 11.2];
const desert = (o) => ({ noIsland: true, sky: 'day', view: o.view || VIEW, light: { top: 1.0, left: 0.8, right: 0.62, tintTop: [255, 220, 150, 0.14], tintSide: [150, 90, 60, 0.1] },
  glow2: o.glow2 || null, top: o.top || null, glow: o.heat ? [11, 11, 4, 12, '#FFE3A0'] : null,
  extra: (S, G, H) => { ground(S, H, desertMat); pyramid(S, G);
    CACTI.forEach(([x, y, h, arm]) => cactus(S, G, x, y, h, arm)); [[9, 16], [17, 9], [8, 8]].forEach(([x, y]) => deadBush(S, G, x, y));
    if (o.x) xmark(S, DIG[0], DIG[1], G(...DIG));
    const zD = G(...DIG), kD = DIG[0] + DIG[1] + 3;
    if (o.pit) { S.box(DIG[0] - 0.2, DIG[1] - 0.2, zD, 2.0, 2.0, 0.02, '#6B5030', { nojit: true, sort: kD }); S.box(DIG[0], DIG[1], zD, 1.6, 1.6, 0.03, '#3A2A18', { nojit: true, sort: kD + 0.01 }); }
    if (o.pile) [[0, 0, 0.8], [0.6, 0.4, 0.6], [0.2, 0.7, 0.5]].forEach(([a, b, s], i) => S.box(DIG[0] + 2.0 + a, DIG[1] - 1.4 + b, zD, s, s, s * 0.8, '#E8D195', { nojit: true, sort: kD - 0.5 + i * 0.01 }));
    if (o.chest) { const W = '#A06A2E', D = '#7A4E22', cx = DIG[0] + 0.2, cy = DIG[1] + 0.3, cz = zD - 0.2;
      S.box(cx, cy, cz, 1.6, 1.1, 0.9, W, { nojit: true, decR: [[0.4, 0.35, 0.28, 0.28, GOLD]], decL: [[0.65, 0.35, 0.28, 0.28, GOLD]], sort: kD + 0.1 });
      if (o.chest === 'closed') S.box(cx, cy, cz + 0.9, 1.6, 1.1, 0.4, D, { nojit: true, sort: kD + 0.11 });
      else { S.box(cx, cy - 0.2, cz + 0.9, 1.6, 0.25, 1.0, D, { nojit: true, sort: kD + 0.05 });
        [[0.15, 0.2], [0.75, 0.25], [0.4, 0.6], [1.0, 0.6]].forEach(([a, b], i) => S.box(cx + a, cy + b, cz + 0.9 + (i > 1 ? 0.12 : 0), 0.5, 0.34, 0.26, GOLD, { nojit: true, top: '#FFE58A', sort: kD + 0.2 + i * 0.01 }));
        if (o.chest === 'compass') S.box(cx + 0.55, cy + 0.15, cz + 1.25, 0.6, 0.6, 0.18, '#8792A0', { nojit: true, top: '#E9E2CF', decT: [[0.15, 0.25, 0.3, 0.1, '#D8323C']], sort: kD + 0.3 }); } }
    if (o.cactus) cactus(S, G, 13, 12, 3, true);
    if (o.sweat) [[-0.4, 1.2, 6.6], [-0.2, 2.6, 6.2]].forEach(([a, b, c], i) => S.box(o.hero.x + a, o.hero.y + b, G(o.hero.x, o.hero.y) + c, 0.22, 0.22, 0.34, '#6FC3F0', { nojit: true, top: '#BFE6F0', sort: 90 + i }));
    dogX(S, G, o.dog); if (o.hero) heroX(S, G, o.hero); } });
const HD = { x: 10.6, y: 11.0 }, DOGD = { x: 8.6, y: 12.8, collar: true };
const HDIG = { x: 11.4, y: 11.6 }, DOGX = { x: 9.4, y: 14.0, collar: true };
const S13 = {
  1: { base: outdoor2({ sky: 'morning', houses: A.V, hero: Object.assign({ arms: 'down' }, A.HERO_V), dog: { x: 15.2, y: 13.6, collar: true } }),
       reveal: outdoor2({ sky: 'morning', houses: A.V, hero: Object.assign({ hold: 'map' }, A.HERO_V), dog: { x: 15.2, y: 13.6, collar: true, wag: true }, glow2: [A.HERO_V.x + 0.8, A.HERO_V.y + 2, 7.2, 2.4, '#FFE9B0'] }) },
  2: { base: outdoor2({ sky: 'morning', houses: A.V, hero: Object.assign({ hold: 'map' }, A.HERO_V), dog: { x: 15.2, y: 13.6, collar: true } }),
       reveal: outdoor2({ sky: 'morning', houses: A.V, hero: Object.assign({ hold: 'map' }, A.HERO_V), dog: { x: 15.2, y: 13.6, collar: true }, top: iconBubble([A.HERO_V.x, A.HERO_V.y, 6.6], 'tmap') }) },
  3: { base: outdoor2({ hero: Object.assign({ hold: 'map' }, A.HERO_M), dog: { x: 12.6, y: 8.6, collar: true } }),
       reveal: desert({ hero: Object.assign({ hold: 'map' }, HD), dog: DOGD }) },
  4: { base: desert({ hero: HD, dog: DOGD }), reveal: desert({ hero: HD, dog: DOGD, heat: true, sweat: true }) },
  5: { base: desert({ hero: HD, dog: DOGD }), reveal: desert({ hero: Object.assign({ arms: 'up' }, HD), dog: DOGD, cactus: true, glow2: [13.5, 12.5, 2.2, 2.6, '#FF8A8A'] }) },
  6: { base: desert({ hero: HD, dog: DOGX }), reveal: desert({ hero: HD, dog: Object.assign({ wag: true, happy: true }, DOGX), x: true, glow2: [DIG[0] + 0.6, DIG[1] + 0.6, 1, 2.4, '#FF8A8A'] }) },
  7: { base: desert({ hero: Object.assign({ hold3: 'shovel' }, HDIG), dog: DOGX, x: true }), reveal: desert({ hero: Object.assign({ hold3: 'shovel' }, HDIG), dog: DOGX, pit: true, pile: true }) },
  8: { base: desert({ hero: Object.assign({ hold3: 'shovel' }, HDIG), dog: DOGX, pit: true, pile: true }), reveal: desert({ hero: Object.assign({ arms: 'up' }, HDIG), dog: Object.assign({ wag: true }, DOGX), pit: true, pile: true, chest: 'closed', glow2: [DIG[0] + 1, DIG[1] + 0.7, 1.4, 2.4, '#FFE9B0'] }) },
  9: { base: desert({ hero: HDIG, dog: DOGX, pit: true, pile: true, chest: 'closed' }), reveal: desert({ hero: Object.assign({ hold3: 'gold' }, HDIG), dog: DOGX, pit: true, pile: true, chest: 'gold', glow2: [DIG[0] + 1, DIG[1] + 0.7, 1.6, 2.8, '#FFE58A'] }) },
  10: { base: desert({ hero: Object.assign({ hold3: 'gold' }, HDIG), dog: DOGX, pit: true, pile: true, chest: 'compass' }), reveal: desert({ hero: Object.assign({ hold3: 'compass' }, HDIG), dog: Object.assign({ wag: true, happy: true }, DOGX), pit: true, pile: true, chest: 'gold', glow2: [HDIG.x + 0.6, HDIG.y + 2.2, 6.4, 2.2, '#FFE9B0'] }) },
};

/* ---------- episode 14: the snow mountain ---------- */
function hmSnow() { const H = [];
  for (let x = 0; x < N; x++) { H[x] = []; for (let y = 0; y < N; y++) { let h = islandH(x, y, 0.9);
    if (h >= 1 && x <= 8 && y <= 12) { const back = (8 - x) + (12 - y) * 0.7; h = Math.min(7, 3 + Math.floor(back * 0.6 + hash(x, y, 3) * 1.4)); }
    H[x][y] = h; } } return H; }
const SNOW = ['#F4F6FA', '#EBEFF6', '#F8F9FC', '#E6EBF3'];
const ICE = { x0: 13, x1: 16, y0: 13, y1: 15 };
const inIce = (x, y) => x >= ICE.x0 && x <= ICE.x1 && y >= ICE.y0 && y <= ICE.y1;
const snowMat = (o) => (x, y, z, top, h) => { if (z < 0) return ['#6B5A4A'];
  if (top && o.ice && inIce(x, y) && h === 2) return [pick(['#9CC9E6', '#A8D2EC', '#92C0E0'], hash(x, y, 6)), { top: pick(['#CFE8F7', '#BFE0F4'], hash(x, y, 7)), decT: [[0.2, 0.3, 0.5, 0.08, '#FFFFFF', 0.7]] }];
  if (top) return [pick(SNOW, hash(x, y, 4)), { side: h >= 4 ? pick(STONE, hash(x, y, z)) : '#8A6A4A' }];
  if (h >= 4) return [pick(STONE, hash(x, y, z))];
  return ['#8A6A4A']; };
function spruce(S, G, x, y, h) { const z = G(x, y); for (let i = 0; i < h; i++) S.vox(x, y, z + i, '#5A3E24');
  [[2, 1.4], [3.4, 1.0], [4.6, 0.6]].forEach(([dz, r], i) => { S.box(x + 0.5 - r - 0.5, y + 0.5 - r - 0.5, z + dz, 2 * r + 1, 2 * r + 1, 1, '#2F5E3A', { top: '#F4F6FA', nojit: true, sort: x + y + 1 + i * 0.01 }); });
  S.box(x + 0.25, y + 0.25, z + 5.6, 0.5, 0.5, 0.6, '#2F5E3A', { top: '#F4F6FA', nojit: true, sort: x + y + 1.05 }); }
const IG = { x: 8.4, y: 15.0 };
function igloo(S, G, lit) { const { x, y } = IG; const z = G(x, y);
  const rings = [[2.0, 1], [1.6, 1], [1.0, 1]]; rings.forEach(([r, h], k) => S.box(x - r, y - r, z + k, 2 * r, 2 * r, h, k === 2 ? '#F8F9FC' : '#EBEFF6', { top: '#FFFFFF', nojit: true, sort: x + y + 0.8 + k * 0.01,
    decR: k < 2 ? [[0.1, 0.48, 2 * r - 0.2, 0.06, '#C9D3E2']] : [], decL: k < 2 ? [[0.1, 0.48, 2 * r - 0.2, 0.06, '#C9D3E2']] : [] }));
  S.box(x - 0.6, y + 1.9, z, 1.2, 0.6, 1.4, '#EBEFF6', { nojit: true, top: '#FFFFFF', sort: x + y + 2.2, decL: [[0.25, 0, 0.7, 1.0, lit ? '#FFB54A' : '#2A3040']] }); }
function snowflakes(S) { for (let i = 0; i < 26; i++) { const x = 2 + hash(i, 1, 41) * 17, y = 2 + hash(i, 2, 42) * 17, z = 4 + hash(i, 3, 43) * 9; S.box(x, y, z, 0.22, 0.22, 0.22, '#FFFFFF', { nojit: true, op: 0.9, sort: 95 + i * 0.01 }); } }
function fox(S, G, p) { const { x: ox, y: oy } = p; const z0 = G(ox, oy); const u = 0.42; const k = ox + oy + 1.2; let n = 0;
  const B = (x, y, z, w, d, h, col, o) => S.box(ox + x * u, oy + y * u, z0 + z * u, w * u, d * u, h * u, col, Object.assign({ grp: ox + ',' + oy, sort: k + (n++) * 0.001, nojit: true, fl: 0.9, fr: 0.78 }, o || {}));
  const W = '#F4F2EE', W2 = '#D9D6D0', EYE = '#1E1822';
  [[0.3, 0.2], [0.3, 1.6], [3.4, 0.2], [3.4, 1.6]].forEach(([x, y]) => B(x, y, 0, 0.7, 0.7, 1.6, '#3A3040'));
  B(0, 0, 1.6, 4.4, 2.4, 1.8, W, { top: '#FFFFFF' });
  B(-2.0, 0.6, 2.4, 2.2, 1.2, 1.2, W2, { top: W }); B(-2.4, 0.7, 2.5, 0.6, 1.0, 1.0, '#FFFFFF'); // bushy tail
  B(4.0, -0.1, 2.6, 2.4, 2.6, 2.2, W, { decR: [[0.3 * u, 1.0 * u, 0.5 * u, 0.5 * u, EYE], [1.8 * u, 1.0 * u, 0.5 * u, 0.5 * u, EYE]] });
  B(6.4, 0.6, 2.6, 1.0, 1.2, 0.9, W2, { decR: [[0.35 * u, 0.4 * u, 0.5 * u, 0.4 * u, EYE]] });
  B(4.2, -0.1, 4.8, 0.7, 0.7, 0.9, W2, { decR: [[0.15 * u, 0.1 * u, 0.4 * u, 0.5 * u, '#E8A0A0']] }); B(4.2, 1.8, 4.8, 0.7, 0.7, 0.9, W2);
  if (p.happy) B(6.6, 0.8, 2.2, 0.6, 0.6, 0.5, '#E86A7A'); }
function golemSnow(S, G, p) { const { x, y } = p; const z = G(x, y);
  S.box(x, y, z, 1.4, 1.4, 1.4, '#F4F6FA', { top: '#FFFFFF', nojit: true, sort: x + y + 1.4 }); S.box(x + 0.1, y + 0.1, z + 1.4, 1.2, 1.2, 1.2, '#F4F6FA', { top: '#FFFFFF', nojit: true, sort: x + y + 1.41 });
  S.box(x + 0.1, y + 0.1, z + 2.6, 1.2, 1.2, 1.1, '#E8862C', { top: '#F2A541', nojit: true, sort: x + y + 1.42, decR: [[0.2, 0.55, 0.25, 0.25, '#4A2A10'], [0.75, 0.55, 0.25, 0.25, '#4A2A10'], [0.3, 0.2, 0.6, 0.15, '#4A2A10']] });
  S.box(x + 0.6, y - 0.6, z + 1.8, 0.15, 0.7, 0.15, '#6B4426', { nojit: true, sort: x + y + 1.3 }); S.box(x + 0.6, y + 1.3, z + 1.8, 0.15, 0.7, 0.15, '#6B4426', { nojit: true, sort: x + y + 1.5 }); }
const snow = (o) => ({ noIsland: true, sky: o.sky || 'morning', view: o.view || VIEW, light: { top: 1.0, left: 0.8, right: 0.64, tintTop: [220, 235, 255, 0.12], tintSide: [80, 100, 160, 0.14] },
  glow2: o.glow2 || null, top: o.top || null, glow: o.lit ? [IG.x, IG.y + 2, 1, 3, '#FFB54A'] : null,
  extra: (S, G, H) => { ground(S, H, snowMat(o));
    [[10, 3, 3], [17, 8, 2], [4, 13, 3]].forEach(([x, y, h]) => spruce(S, G, x, y, h));
    if (o.igloo) igloo(S, G, o.lit);
    if (o.golem) golemSnow(S, G, { x: 16.4, y: 9.0 });
    if (o.balls) o.balls.forEach(([x, y, z], i) => S.box(x, y, z, 0.6, 0.6, 0.6, '#FFFFFF', { nojit: true, sort: x + y + 4 + i * 0.01 }));
    if (o.puff) poof(S, ...o.puff);
    if (o.fox) fox(S, G, o.fox);
    if (o.flakes) snowflakes(S);
    dogX(S, G, o.dog); if (o.hero) heroX(S, G, o.hero); } });
const HS = { x: 11.2, y: 11.0 }, DOGS = { x: 9.4, y: 11.6, collar: true }, FOX = { x: 14.6, y: 11.6 }, HI = { x: 10.8, y: 11.4 }, HICE = { x: 12.0, y: 12.0 };
const S14 = {
  1: { base: outdoor2({ hero: Object.assign({ hold3: 'compass' }, A.HERO_M), dog: { x: 12.6, y: 8.6, collar: true } }),
       reveal: snow({ hero: Object.assign({ hold3: 'compass' }, HS), dog: DOGS }) },
  2: { base: snow({ hero: HS, dog: DOGS }), reveal: snow({ hero: Object.assign({ arms: 'up' }, HS), dog: Object.assign({ wag: true }, DOGS), flakes: true }) },
  3: { base: snow({ hero: Object.assign({ hold3: 'snowball' }, HS), dog: DOGS, flakes: true }), reveal: snow({ hero: Object.assign({ arms: 'up' }, HS), dog: Object.assign({ wag: true, happy: true }, DOGS), balls: [[13.4, 8.6, 5.2], [15.2, 7.0, 5.8]], puff: [16.4, 6.2, 5.6], flakes: true }) },
  4: { base: snow({ hero: HI, dog: DOGS }), reveal: snow({ hero: Object.assign({ arms: 'up' }, HI), dog: DOGS, igloo: true, glow2: [IG.x, IG.y, 2, 3.4, '#E3F2FF'] }) },
  5: { base: snow({ hero: HI, dog: DOGS, igloo: true, sky: 'sunset' }), reveal: snow({ hero: HI, dog: Object.assign({ pose: 'sit' }, DOGS), igloo: true, lit: true, sky: 'sunset' }) },
  6: { base: snow({ hero: HS, dog: DOGS, igloo: true }), reveal: snow({ hero: HS, dog: DOGS, igloo: true, fox: FOX }) },
  7: { base: snow({ hero: HS, dog: DOGS, igloo: true, fox: FOX }), reveal: snow({ hero: HS, dog: DOGS, igloo: true, fox: FOX, top: iconBubble([FOX.x + 1.6, FOX.y, 2.0], 'berry') }) },
  8: { base: snow({ hero: Object.assign({ hold3: 'berry' }, HS), dog: DOGS, igloo: true, fox: FOX }), reveal: snow({ hero: HS, dog: DOGS, igloo: true, fox: Object.assign({ happy: true }, FOX), glow2: [FOX.x + 1.4, FOX.y + 0.4, 1.2, 2.2, '#FFB3BA'] }) },
  9: { base: snow({ hero: HS, dog: DOGS, igloo: true, fox: FOX }), reveal: snow({ hero: Object.assign({ arms: 'up' }, HS), dog: Object.assign({ wag: true }, DOGS), igloo: true, fox: Object.assign({ happy: true }, FOX), top: iconBubble([FOX.x + 1.6, FOX.y, 2.0], 'heart') }) },
  10: { base: snow({ hero: HICE, dog: DOGS, igloo: true, fox: { x: 15.6, y: 11.2 }, ice: true }), reveal: snow({ hero: Object.assign({ hold3: 'ice' }, HICE), dog: DOGS, igloo: true, fox: { x: 15.6, y: 11.2, happy: true }, ice: true, glow2: [HICE.x + 0.6, HICE.y + 2.2, 6.6, 2.2, '#CFE8F7'] }) },
};

/* ---------- episode 15: the horse (on the saga island, near the house) ---------- */
function horse(S, G, p) { const { x: ox, y: oy } = p; const z0 = (p.z != null ? p.z : G(ox, oy)) + (p.jump ? 1.0 : 0); const u = 0.56; const k = ox + oy + 1.1; let n = 0;
  const B = (x, y, z, w, d, h, col, o) => S.box(ox + x * u, oy + y * u, z0 + z * u, w * u, d * u, h * u, col, Object.assign({ grp: ox + ',' + oy, sort: k + (n++) * 0.001, nojit: true, fl: 0.9, fr: 0.78 }, o || {}));
  const C = '#9A6438', C2 = '#80512C', M = '#3A2A20', EYE = '#1E1822';
  const legs = p.jump ? [[0.2, 0.2, 1.2], [0.2, 2.2, 1.2], [5.0, 0.2, 2.0], [5.0, 2.2, 2.0]] : [[0.2, 0.2, 0], [0.2, 2.2, 0], [5.0, 0.2, 0], [5.0, 2.2, 0]];
  legs.forEach(([x, y, z]) => { B(x, y, z, 1.0, 1.0, 3.6 - z, C2); B(x, y, z, 1.0, 1.0, 0.6, '#E9E2CF'); });
  B(-0.2, -0.1, 3.6, 7.0, 3.6, 3.0, C, { top: '#A86E40' });
  B(-1.2, 1.1, 3.6, 1.0, 1.2, 2.8, M); // tail
  if (p.saddle) { B(1.8, -0.3, 6.6, 2.4, 4.0, 0.5, '#6B3A22', { top: '#7A4428' }); B(2.8, -0.4, 4.6, 0.4, 0.3, 2.0, '#B9C3CF'); }
  B(5.8, 0.6, 5.8, 1.8, 2.2, 3.6, C); // neck
  B(5.4, 0.9, 6.4, 0.6, 1.6, 3.4, M); // mane
  B(6.2, 0.5, 8.4, 3.2, 2.4, 1.8, C, { decR: [[0.3 * u, 0.9 * u, 0.5 * u, 0.5 * u, EYE], [1.6 * u, 0.9 * u, 0.5 * u, 0.5 * u, EYE]], decL: [[2.2 * u, 0.2 * u, 0.6 * u, 0.4 * u, '#5A3A22']] });
  B(6.3, 0.6, 10.2, 0.6, 0.6, 0.8, C2); B(6.3, 1.9, 10.2, 0.6, 0.6, 0.8, C2);
  if (p.happy) B(9.3, 1.0, 8.4, 0.5, 0.8, 0.4, '#E86A7A'); }
const HORSE = { x: 13.4, y: 11.0 }, HH = { x: 11.0, y: 13.2 }, DOGH = { x: 9.2, y: 14.8, collar: true };
const RIDE = { x: HORSE.x + 1.3, y: HORSE.y + 0.2, ride: true };
const farm = (o) => { const b = outdoor2(Object.assign({ cave: false, houses: [], dog: o.dog === undefined ? DOGH : o.dog, view: VIEW }, o, { hero: undefined }));
  const inner = b.extra;
  b.extra = (S, G, H) => { inner(S, G, H);
    // a small fence and a carrot patch
    for (let i = 0; i < 5; i++) S.box(16.2, 13 + i * 0.9, G(16, 13 + i), 0.2, 0.2, 1.1, '#8A5A2E', { nojit: true, sort: 16 + 13 + i + 1 });
    S.box(16.2, 13, G(16, 13) + 0.7, 0.14, 4.0, 0.16, '#B07A42', { nojit: true, sort: 16 + 17 + 1.1 });
    [[17.2, 13.4], [17.2, 14.6], [17.2, 15.8]].forEach(([x, y], i) => { S.box(x, y, G(x, y), 0.6, 0.6, 0.06, '#6B4426', { nojit: true, sort: x + y + 0.9 }); S.box(x + 0.2, y + 0.2, G(x, y), 0.2, 0.2, 0.5, '#4FA046', { nojit: true, sort: x + y + 1 }); });
    if (o.puff) poof(S, o.puff[0], o.puff[1], G(o.puff[0], o.puff[1]) + 0.2);
    if (o.horse) horse(S, G, Object.assign({}, HORSE, o.horse));
    if (o.hero) heroX(S, G, o.hero.ride ? Object.assign({}, o.hero, { z: G(o.hero.x, o.hero.y) + (o.horse && o.horse.jump ? 1.0 : 0) + 3.0 }) : o.hero);
    if (o.carrots) o.carrots.forEach(([x, y], i) => { S.box(x, y, G(x, y), 0.3, 0.3, 0.8, '#F08A24', { nojit: true, top: '#F6A45A', sort: x + y + 1.3 + i * 0.01 }); }); };
  return b; };
const FALL = { x: 12.0, y: 14.6 };
const S15 = {
  1: { base: farm({ hero: HH }), reveal: farm({ hero: Object.assign({ arms: 'up' }, HH), horse: {} }) },
  2: { base: farm({ hero: HH, horse: {} }), reveal: farm({ hero: HH, horse: { x: 14.2, y: 8.2, jump: true }, puff: [12.6, 10.6] }) },
  3: { base: farm({ hero: HH, horse: {} }), reveal: farm({ hero: RIDE, horse: {} }) },
  4: { base: farm({ hero: RIDE, horse: {} }), reveal: farm({ hero: Object.assign({ arms: 'up' }, FALL), horse: { jump: true }, puff: [FALL.x + 0.4, FALL.y + 0.4] }) },
  5: { base: farm({ hero: FALL, horse: {} }), reveal: farm({ hero: Object.assign({ arms: 'up' }, HH), horse: {}, glow2: [HH.x + 0.6, HH.y + 1, 3.2, 3.2, '#FFE9B0'] }) },
  6: { base: farm({ hero: Object.assign({ hold3: 'carrot' }, HH), horse: {} }), reveal: farm({ hero: Object.assign({ hold3: 'carrot' }, { x: 12.0, y: 12.6 }), horse: {}, glow2: [12.6, 14.6, 6.2, 2, '#FFB54A'] }) },
  7: { base: farm({ hero: Object.assign({ hold3: 'carrot' }, { x: 12.0, y: 12.6 }), horse: {} }), reveal: farm({ hero: { x: 12.0, y: 12.6 }, horse: { happy: true }, top: iconBubble([HORSE.x + 3.4, HORSE.y + 0.8, 5.4], 'heart') }) },
  8: { base: farm({ hero: HH, horse: { happy: true } }), reveal: farm({ hero: RIDE, horse: { happy: true } }) },
  9: { base: farm({ hero: RIDE, horse: { happy: true } }), reveal: farm({ hero: Object.assign({ arms: 'up' }, RIDE), horse: { happy: true, jump: true }, puff: [HORSE.x - 0.6, HORSE.y + 1.2], glow2: [RIDE.x + 0.4, RIDE.y + 1, 5, 3, '#FFE9B0'] }) },
  10: { base: farm({ hero: RIDE, horse: { happy: true } }), reveal: farm({ hero: Object.assign({ arms: 'up' }, RIDE), horse: { happy: true, jump: true }, dog: { x: 10.0, y: 14.6, collar: true, wag: true, happy: true }, puff: [12.4, 11.6] }) },
};

const SAGA3 = { s13: { pages: S13, hm: hmSaga }, s14: { pages: S14, hm: hmSaga }, s15: { pages: S15, hm: hmSaga } };
// desert/snow pages draw their own ground from their own height map; outdoor pages use the saga island
const HMAP = { desert: hmDesert(), snow: hmSnow() };
for (const [sid, st] of Object.entries(SAGA3)) for (const pg of Object.values(st.pages)) for (const o of [pg.base, pg.reveal]) {
  const which = o.extra && o.noIsland && o.sky !== 'night' ? (sid === 's13' ? 'desert' : sid === 's14' ? 'snow' : null) : null;
  if (which) { const ex = o.extra; o.extra = (S, G0, H0) => { const H = HMAP[which]; const G = (x, y) => H[Math.floor(x)][Math.floor(y)] + 1; ex(S, G, H); }; } }
module.exports = { SAGA3 };
if (require.main === module) { renderAll(SAGA3, process.argv.slice(2), __dirname); console.log('done'); }
