// Saga episodes 10-12 (2026-11-18): the fire world, the bees, the turtles. Same voxel engine and saga island; original art only.
// Usage: node art/saga2.js [s10|s11|s12] [page]  -> writes art/s10/p{n}-{base|reveal}-{wide|tall}.svg
const { hash } = require('./voxel.js');
const T = require('./stories.js');
const { renderAll, pick, house, chest, N } = T;
const A = require('./saga.js');
const { hero, outdoor2, fireWorld, mobber2, iconBubble, poof, hmSaga, LAVA, CAVE_VIEW } = A;

/* ---------- episode 10: the fire world ---------- */
// a floating fire monster (original design): glowing block head, rods turning round it, smoke under it
function blaze(S, p) { const { x: ox, y: oy } = p; const z0 = p.z != null ? p.z : 2.0; const u = 0.62; const k = ox + oy + 1.4; let n = 0;
  const B = (x, y, z, w, d, h, col, o) => S.box(ox + x * u, oy + y * u, z0 + z * u, w * u, d * u, h * u, col, Object.assign({ sort: k + (n++) * 0.001, nojit: true, fl: 1.05, fr: 0.92 }, o || {}));
  [[-2.4, -1.6, 0], [2.8, -1.4, 1.2], [-1.8, 3.6, 0.6], [3.2, 3.4, 1.8]].forEach(([x, y, z]) => B(x, y, z, 1.0, 1.0, 3.6, '#F2A541', { top: '#FFE58A' }));
  B(0.2, 0.4, 1.0, 1.6, 1.6, 2.4, '#5A4A40', { op: 0.75 });
  B(-0.6, -0.4, 3.6, 3.4, 3.4, 3.2, '#F2C94C', { top: '#FFE58A', decR: [[0.6 * u, 1.4 * u, 0.8 * u, 0.7 * u, '#3A1E10'], [2.0 * u, 1.4 * u, 0.8 * u, 0.7 * u, '#3A1E10'], [0.9 * u, 0.4 * u, 1.6 * u, 0.4 * u, '#C9781E']] });
  if (!p.calm) [[-2.0, 1.2, 4.6], [3.6, 0.8, 5.4]].forEach(([x, y, z]) => B(x, y, z, 1.0, 1.0, 3.2, '#F2A541', { top: '#FFE58A' })); }
function fireball(S, x, y, z) { S.box(x, y, z, 0.7, 0.7, 0.7, '#E8732C', { nojit: true, top: '#FFD27A', fl: 1.1, fr: 1, sort: x + y + 3 }); S.box(x + 0.7, y - 0.4, z + 0.2, 0.4, 0.4, 0.4, '#F2A541', { nojit: true, op: 0.8, sort: x + y + 3 }); }
function rods(S, x, y, n) { for (let i = 0; i < n; i++) S.box(x + i * 0.6, y + i * 0.3, 1, 1.2, 0.26, 0.26, '#F2A541', { nojit: true, top: '#FFE58A', fl: 1.1, fr: 1, sort: x + y + 2 + i * 0.01 }); }
const FIRE_VIEW = { wide: { s: 56, cx: 800, cy: 60 }, tall: { s: 44, cx: 500, cy: 300 } };
const HP = { x: 8.2, y: 12.4 }, DOGP = { x: 9.6, y: 14.6, collar: true }, HS10 = { x: 9.4, y: 11.2 }, BL = { x: 14.4, y: 8.0 };
const ARM = (o) => Object.assign({ hold: 'sword', helmet: true }, HS10, o);
const fire = (o) => { const f = fireWorld(Object.assign({ dog: DOGP }, o)); const inner = f.extra;
  f.extra = (S, G, H) => { inner(S, G, H);
    if (o.blaze) blaze(S, Object.assign({}, BL, o.blaze));
    if (o.ball) fireball(S, ...o.ball);
    if (o.rods) rods(S, 11.6, 9.6, o.rods);
    if (o.puff) poof(S, o.puff[0], o.puff[1], o.puff[2]);
    if (o.bubbles) [[12.4, 6.4, 1.2], [13.8, 7.6, 1.5], [12.9, 8.0, 2.1], [14.2, 6.2, 1.8]].forEach(([x, y, z], i) => S.box(x, y, z, 0.45, 0.45, 0.45, '#FFD27A', { nojit: true, top: '#FFF2C4', fl: 1.1, fr: 1, sort: x + y + 2 + i * 0.01 })); };
  f.view = FIRE_VIEW;
  if (o.top) f.top = o.top; if (o.glow3) f.glow2 = o.glow3; return f; };
const S10 = {
  1: { base: fire({ hero: HP }), reveal: fire({ hero: Object.assign({ arms: 'up' }, HP), glow3: [10, 10, 1, 8, '#FF3A2A'] }) },
  2: { base: fire({ hero: HP }), reveal: fire({ hero: Object.assign({ arms: 'up' }, HP), dog: Object.assign({ wag: true }, DOGP), glow3: [13, 7, 1, 5, '#FF7A2A'] }) },
  3: { base: fire({ hero: HS10 }), reveal: fire({ hero: HS10, bubbles: true, glow3: [13, 7, 1, 6, '#FFB54A'] }) },
  4: { base: fire({ hero: ARM() }), reveal: fire({ hero: ARM(), blaze: {}, glow3: [BL.x, BL.y, 3.6, 4, '#FFD27A'] }) },
  5: { base: fire({ hero: ARM(), blaze: {} }), reveal: fire({ hero: ARM(), blaze: {}, ball: [12.0, 9.6, 3.2], glow3: [11.2, 10.4, 3, 3, '#FF8A3A'] }) },
  6: { base: fire({ hero: ARM(), blaze: {}, ball: [12.0, 9.6, 3.2] }), reveal: fire({ hero: ARM({ shield: true }), blaze: {}, puff: [10.4, 10.0, 2.2], glow3: [HS10.x + 1.2, HS10.y + 1, 3, 2.6, '#9CC9E6'] }) },
  7: { base: fire({ hero: ARM({ shield: true }), blaze: {} }), reveal: fire({ hero: ARM({ shield: true, arms: 'up' }), blaze: { calm: true }, puff: [14.0, 7.8, 3.6], glow3: [BL.x, BL.y, 3.6, 3, '#E3F2FF'] }) },
  8: { base: fire({ hero: ARM({ shield: true }), blaze: { calm: true } }), reveal: fire({ hero: ARM({ shield: true }), rods: 2, puff: [14.0, 7.8, 1.4] }) },
  9: { base: fire({ hero: ARM({ shield: true }), rods: 2 }), reveal: fire({ hero: Object.assign({ hold: 'rod', helmet: true, shield: true }, HS10), glow3: [HS10.x + 0.6, HS10.y + 2.4, 9, 2.6, '#FFD27A'] }) },
  10: { base: fire({ hero: HP }), reveal: outdoor2({ sky: 'morning', houses: A.V, furnace: 'lit', villagers: [A.VILL[0]], hero: Object.assign({ arms: 'up', hold: 'rod' }, A.HERO_V), dog: { x: 15.2, y: 13.6, collar: true, wag: true, happy: true } }) },
};

/* ---------- episode 11: the new house, flowers and bees ---------- */
const GARDEN_VIEW = { wide: { s: 58, cx: 700, cy: -40 }, tall: { s: 48, cx: 417, cy: 200 } };
const BIG = { x: 11, y: 3, w: 5, d: 4 };
const FL = [[12.2, 13.2, '#E8604E'], [13.4, 13.6, '#F2C94C'], [14.6, 13.0, '#C27BF0'], [12.6, 14.6, '#F4E9D0'], [14.0, 14.8, '#E8604E'], [15.2, 14.2, '#F2C94C'], [13.2, 15.8, '#C27BF0'], [11.4, 15.0, '#E8604E'], [11.0, 13.8, '#F2C94C']];
const NEST = { x: 16.6, y: 11.6 };
const BEES = [[12.8, 13.0, 3.6], [14.4, 13.8, 3.9], [13.0, 15.0, 3.4], [16.0, 12.4, 5.2], [15.0, 12.0, 4.4]];
const ANGRY = [[12.4, 11.4, 4.6], [13.4, 11.0, 5.4], [11.8, 12.0, 5.0], [13.8, 10.4, 6.0], [12.0, 10.2, 6.4]];
function bee(S, x, y, z) { S.box(x, y, z, 0.5, 0.36, 0.36, '#F2C94C', { nojit: true, top: '#FFE58A', decR: [[0.08, 0, 0.08, 0.3, '#2A2233'], [0.2, 0, 0.08, 0.3, '#2A2233']], sort: x + y + 4 });
  S.box(x + 0.1, y + 0.05, z + 0.3, 0.22, 0.2, 0.12, '#FFFFFF', { nojit: true, op: 0.8, sort: x + y + 4.01 }); }
function nest(S, G, honey) { const { x, y } = NEST; const z = G(x, y);
  S.box(x + 0.4, y + 0.4, z, 0.3, 0.3, 2.2, '#7A4E2B', { nojit: true, sort: x + y + 1 });
  S.box(x - 0.1, y - 0.1, z + 2.2, 1.3, 1.3, 1.2, '#E3C04A', { nojit: true, top: '#F2D768', decR: [[0.2, 0.3, 0.3, 0.25, '#8A5A2E'], [0.7, 0.6, 0.3, 0.25, '#8A5A2E']], decL: [[0.3, 0.4, 0.3, 0.25, '#8A5A2E']], sort: x + y + 1.2 });
  if (honey) S.box(x + 0.2, y + 1.2, z + 1.6, 0.3, 0.12, 0.6, '#F2A541', { nojit: true, top: '#FFD27A', sort: x + y + 1.3 }); }
function campfire(S, G, x, y, lit, smoke) { const z = G(x, y);
  S.box(x, y + 0.2, z, 1, 0.3, 0.3, '#7A4E2B', { nojit: true, sort: x + y + 1 }); S.box(x + 0.2, y, z + 0.2, 0.3, 1, 0.3, '#6B4426', { nojit: true, sort: x + y + 1.01 });
  if (lit) { S.box(x + 0.25, y + 0.25, z + 0.4, 0.5, 0.5, 0.5, '#F2A541', { nojit: true, top: '#FFE58A', fl: 1.1, fr: 1, sort: x + y + 1.02 }); S.box(x + 0.38, y + 0.38, z + 0.9, 0.24, 0.24, 0.3, '#FFD27A', { nojit: true, sort: x + y + 1.03 }); }
  if (smoke) [[0.2, 0.2, 1.4, 0.6], [0.6, -0.2, 2.2, 0.7], [1.0, -0.6, 3.1, 0.8], [1.3, -0.9, 4.0, 0.7]].forEach(([a, b, c, s], i) => S.box(x + a, y + b, z + c, s, s, s, '#C9C4D2', { nojit: true, op: 0.6, sort: x + y + 5 + i * 0.01 })); }
const HV = { x: 12.6, y: 10.4 }, DOGH = { x: 10.2, y: 12.0, collar: true };
const garden = (o) => { const b = outdoor2(Object.assign({ cave: false, houses: o.house === false ? [] : [BIG], dog: DOGH }, o));  const inner = b.extra;
  b.extra = (S, G, H) => { inner(S, G, H);
    if (o.fl) FL.forEach(([x, y, col], i) => { const z = G(x, y); S.box(x + 0.2, y + 0.2, z, 0.14, 0.14, 0.6, '#3F8F3C', { nojit: true, sort: x + y + 1 + i * 0.001 }); S.box(x, y, z + 0.6, 0.54, 0.54, 0.34, col, { nojit: true, top: col, sort: x + y + 1.01 + i * 0.001, decR: [[0.18, 0.08, 0.18, 0.18, '#F2C94C']] }); });
    if (o.nest) nest(S, G, o.nest === 'honey');
    if (o.fire) campfire(S, G, 15.4, 11.0, true, o.fire === 'smoke');
    (o.bees || []).forEach(q => bee(S, ...q)); };
  b.view = GARDEN_VIEW; return b; };
const S11 = {
  1: { base: garden({ house: false, hero: HV, view: A.VILLAGE_VIEW }), reveal: garden({ hero: Object.assign({ arms: 'up' }, HV) }) },
  2: { base: garden({ hero: HV }), reveal: garden({ fl: true, hero: HV }) },
  3: { base: garden({ fl: true, hero: HV }), reveal: garden({ fl: true, bees: BEES, hero: HV }) },
  4: { base: garden({ fl: true, bees: BEES, hero: HV }), reveal: garden({ fl: true, bees: BEES, nest: true, hero: HV, glow2: [NEST.x + 0.5, NEST.y + 0.5, 3.6, 2.4, '#FFE58A'] }) },
  5: { base: garden({ fl: true, bees: BEES, nest: true, hero: HV }), reveal: garden({ fl: true, bees: BEES, nest: 'honey', hero: HV, glow2: [NEST.x + 0.5, NEST.y + 0.5, 3.4, 2.8, '#F2A541'] }) },
  6: { base: garden({ fl: true, nest: 'honey', bees: BEES, hero: HV }), reveal: garden({ fl: true, nest: 'honey', bees: ANGRY, hero: Object.assign({ arms: 'up' }, HV) }) },
  7: { base: garden({ fl: true, nest: 'honey', bees: BEES, hero: HV }), reveal: garden({ fl: true, nest: 'honey', bees: BEES, fire: 'lit', hero: HV, glow2: [15.9, 11.5, 2, 2.6, '#FFB54A'] }) },
  8: { base: garden({ fl: true, nest: 'honey', bees: BEES, fire: 'lit', hero: HV }), reveal: garden({ fl: true, nest: 'honey', bees: BEES.slice(0, 2), fire: 'smoke', hero: HV }) },
  9: { base: garden({ fl: true, nest: 'honey', fire: 'smoke', hero: HV }), reveal: garden({ fl: true, nest: true, fire: 'smoke', hero: Object.assign({ hold: 'honey' }, HV), glow2: [HV.x + 0.6, HV.y + 2.2, 6.6, 2, '#FFD27A'] }) },
  10: { base: garden({ fl: true, nest: true, bees: BEES, hero: Object.assign({ hold: 'honey' }, HV) }), reveal: garden({ fl: true, nest: true, bees: BEES, hero: Object.assign({ hold: 'honey', arms: 'up' }, HV), dog: Object.assign({ wag: true, happy: true }, DOGH), top: iconBubble([HV.x, HV.y, 4.2], 'heart') }) },
};

/* ---------- episode 12: the turtles: a wide beach at the front of the island, then under the sea ---------- */
function hmBeach() { const H = hmSaga(); for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) if (H[x][y] >= 1 && x + y >= 24 && !(x <= 7)) H[x][y] = 1; H.mt = true; return H; }
function turtle(S, G, p) { const { x: ox, y: oy } = p; const u = p.baby ? 0.3 : 0.55; const z0 = p.z != null ? p.z : G(ox, oy); const k = ox + oy + 1.2; let n = 0;
  const B = (x, y, z, w, d, h, col, o) => S.box(ox + x * u, oy + y * u, z0 + z * u, w * u, d * u, h * u, col, Object.assign({ sort: k + (n++) * 0.001, nojit: true, fl: 0.9, fr: 0.78 }, o || {}));
  [[0, 0], [0, 3.4], [3.6, 0], [3.6, 3.4]].forEach(([x, y]) => B(x - 0.4, y - 0.4, 0, 1.2, 1.2, 0.6, '#8FD07A'));
  B(-0.4, -0.2, 0.4, 5.2, 4.8, 1.8, '#3E8F4A', { top: '#4FA058', decR: [[1.2 * u, 0.4 * u, 1.4 * u, 0.6 * u, '#6FBF6A']] }); B(0.6, 0.8, 2.2, 3.2, 2.8, 1.0, '#357A3E', { top: '#5DAA5E', decR: [[0.8 * u, 0.2 * u, 1.0 * u, 0.4 * u, '#6FBF6A']] });
  B(4.6, 1.0, 1.0, 2.0, 2.2, 1.8, '#8FD07A', { decR: [[0.3 * u, 1.0 * u, 0.4 * u, 0.4 * u, '#241C2E'], [1.3 * u, 1.0 * u, 0.4 * u, 0.4 * u, '#241C2E']] }); }
function eggs(S, G, x, y) { [[0, 0], [0.5, 0.3], [0.2, 0.7], [0.7, 0.8]].forEach(([a, b], i) => S.box(x + a * 1.4, y + b * 1.4, G(x, y), 0.46, 0.46, 0.56, '#F4F0E4', { nojit: true, top: '#FFFFFF', decR: [[0.08, 0.14, 0.08, 0.08, '#8FD07A']], sort: x + y + 1 + i * 0.01 })); }
const EGG = [15.6, 13.6], HB = { x: 13.6, y: 12.0 }, DOGB = { x: 11.6, y: 13.6, collar: true };
const T1 = { x: 16.6, y: 11.2 }, T2 = { x: 12.4, y: 16.6, baby: false };
const BABY = [{ x: 15.2, y: 15.4, baby: true }, { x: 16.4, y: 14.8, baby: true }, { x: 14.8, y: 16.2, baby: true }];
const BABY_SEA = [{ x: 18.6, y: 16.2, baby: true, z: 0.8 }, { x: 17.4, y: 18.0, baby: true, z: 0.8 }, { x: 19.2, y: 14.4, baby: true, z: 0.8 }];
const ZB = { kind: 'zombie', x: 17.4, y: 12.2 };
const BEACH_VIEW = { wide: { s: 56, cx: 746, cy: -150 }, tall: { s: 46, cx: 457, cy: 90 } };
const beach = (o) => { const b = outdoor2(Object.assign({ cave: false, dog: DOGB, flowers: [] }, o)); const inner = b.extra;
  b.extra = (S, G, H) => { inner(S, G, H);
    if (o.eggs) eggs(S, G, ...EGG);
    (o.turtles || []).forEach(t => turtle(S, G, t));
    if (o.zombie) A.mobber(S, G, o.zombie); };
  b.view = BEACH_VIEW; return b; };
// under the sea: sand floor, seaweed, an old ship lying on its side, a chest
function underSea(o) { return { noIsland: true, noClouds: true, sky: 'day', view: FIRE_VIEW, light: { top: 0.95, left: 0.78, right: 0.6, tintTop: [80, 160, 220, 0.3], tintSide: [30, 70, 130, 0.3] },
  bg: (v) => `<rect width="${v.W}" height="${v.H}" fill="#123A5E"/><rect y="${v.H * 0.3}" width="${v.W}" height="${v.H * 0.4}" fill="#164A72"/><rect y="${v.H * 0.7}" width="${v.W}" height="${v.H * 0.3}" fill="#1B5A86"/>`,
  glow: [10, 10, 8, 10, '#6FC3F0'], glow2: o.glow2 || null, top: o.top || null,
  extra: (S) => { const G = () => 1;
    for (let x = 3; x <= 17; x++) for (let y = 3; y <= 17; y++) S.vox(x, y, 0, pick(['#D9C38A', '#E6CE93', '#CFB87E'], hash(x, y, 3)));
    [[5, 15, 3], [6, 16, 2], [15, 5, 4], [16, 7, 3], [12, 16, 2]].forEach(([x, y, h]) => { for (let i = 0; i < h; i++) S.box(x + 0.3 + (i % 2) * 0.1, y + 0.3, 1 + i, 0.3, 0.3, 1, i % 2 ? '#3E8F4A' : '#4FA058', { nojit: true, sort: x + y + 1 }); });
    if (o.ship) { const W = '#6B4426', W2 = '#8A5A2E'; for (let x = 5; x <= 12; x++) for (let z = 1; z <= 3; z++) { if (z === 3 && (x === 5 || x === 12)) continue; S.vox(x, 5, z, (x + z) % 2 ? W : W2, { decR: x === 9 && z === 2 ? [[0.2, 0.2, 0.6, 0.6, '#1A1620']] : [] }); }
      for (let x = 6; x <= 11; x++) S.vox(x, 6, 1, W2); S.box(8.4, 5.3, 4, 0.4, 0.4, 4.5, '#6B4426', { nojit: true, sort: 14.5 }); S.box(8.6, 5.4, 6.5, 2.4, 0.2, 1.8, '#E9E2CF', { nojit: true, op: 0.85, sort: 14.6 }); }
    if (o.chest) chest(S, G, { x: 12, y: 8, open: o.chest === 'open', map: o.chest === 'open' });
    (o.turtles || []).forEach(t => turtle(S, G, t));
    [[7, 12, 2.4], [13, 7, 3.4], [11, 14, 4.2], [15, 11, 2.8]].forEach(([x, y, z], i) => S.box(x, y, z, 0.25, 0.25, 0.25, '#BFE6F0', { nojit: true, op: 0.6, sort: 60 + i }));
    if (o.hero) hero(S, G, o.hero); } }; }
const SWIM = { x: 9.0, y: 12.0, z: 1.6 };
const S12 = {
  1: { base: beach({ hero: HB }), reveal: beach({ hero: Object.assign({ arms: 'up' }, HB), dog: Object.assign({ wag: true }, DOGB) }) },
  2: { base: beach({ hero: HB }), reveal: beach({ hero: HB, turtles: [T1, T2] }) },
  3: { base: beach({ hero: HB, turtles: [T1] }), reveal: beach({ hero: HB, turtles: [T1, Object.assign({}, T2, { baby: true })], glow2: [T2.x, T2.y, 1, 2, '#BFF2C8'] }) },
  4: { base: beach({ hero: HB, turtles: [T1] }), reveal: beach({ hero: HB, turtles: [T1], eggs: true, glow2: [EGG[0] + 0.4, EGG[1] + 0.4, 1.2, 2.2, '#FFF6D8'] }) },
  5: { base: beach({ hero: HB, eggs: true }), reveal: beach({ hero: Object.assign({ arms: 'up' }, HB), turtles: BABY }) },
  6: { base: beach({ hero: HB, turtles: BABY, zombie: ZB }), reveal: beach({ hero: Object.assign({ hold: 'sword', shield: true }, HB), turtles: BABY, top: iconBubble([BABY[1].x, BABY[1].y, 1.6], 'heart') }) },
  7: { base: beach({ hero: HB, turtles: BABY }), reveal: beach({ hero: Object.assign({ arms: 'up' }, HB), turtles: BABY_SEA }) },
  8: { base: beach({ hero: HB, turtles: BABY_SEA }), reveal: underSea({ hero: Object.assign({ arms: 'up' }, SWIM), turtles: [{ x: 7, y: 9, z: 2.6, baby: true }] }) },
  9: { base: underSea({ hero: SWIM }), reveal: underSea({ ship: true, chest: 'closed', hero: SWIM, glow2: [8.5, 5.5, 2, 4, '#BFE6F0'] }) },
  10: { base: underSea({ ship: true, chest: 'closed', hero: SWIM }), reveal: underSea({ ship: true, chest: 'open', hero: Object.assign({ hold: 'map' }, SWIM), glow2: [10.5, 9.5, 1.4, 3, '#FFE9B0'] }) },
};

const SAGA2 = { s10: { pages: S10, hm: hmSaga }, s11: { pages: S11, hm: hmSaga }, s12: { pages: S12, hm: hmBeach } };
module.exports = { SAGA2 };
if (require.main === module) { renderAll(SAGA2, process.argv.slice(2), __dirname); console.log('done'); }
