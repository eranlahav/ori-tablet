// Saga episodes 16-18 (2026-11-24): the furnace (cooking recipes), the night of the skeleton and the creeper, the zoo.
// Same voxel engine, same saga island, same hero and dog (Charlie). Original block art only.
// Usage: node art/saga4.js [s16|s17|s18] [page]  -> writes art/s16/p{n}-{base|reveal}-{wide|tall}.svg
const T = require('./stories.js');
const { renderAll, P } = T;
const A = require('./saga.js');
const { hero, outdoor2, mobber, mobber2, iconBubble, poof, hmSaga } = A;
const { turtle, bee } = require('./saga2.js');
const { fox, horse } = require('./saga3.js');
const { ITEMS: ICONS } = require('./items.js');

const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
const VIEW = { wide: { s: 54, cx: 848, cy: 40 }, tall: { s: 46, cx: 540, cy: 300 } };

/* ---------- the hero, plus what he holds only in these episodes ---------- */
function heroX(S, G, p) { const q = Object.assign({}, p); const extra = p.hold3; if (extra) { q.arms = 'up'; delete q.hold; }
  hero(S, G, q); if (!extra) return;
  const ox = p.x, oy = p.y, z0 = (p.z != null ? p.z : G(ox, oy)), u = p.scale || 0.44, k = ox + oy + 1.2 + 0.06; let n = 0;
  const B = (x, y, z, w, d, h, col, o) => S.box(ox + x * u, oy + y * u, z0 + z * u, w * u, d * u, h * u, col, Object.assign({ grp: ox + ',' + oy, sort: k + (n++) * 0.001, nojit: true, fl: 0.9, fr: 0.78 }, o || {}));
  const fish = (c1, c2, c3) => { B(0.6, 4.0, 13.0, 1.4, 3.2, 1.2, c1, { top: c2, decR: [[0.4 * u, 0.5 * u, 0.4 * u, 0.4 * u, '#241C2E']] }); B(0.8, 7.2, 12.8, 1.0, 1.0, 1.6, c3); };
  if (extra === 'fish') fish('#6FA8C8', '#A8D2E6', '#4F86A8');
  if (extra === 'cfish') fish('#C9813E', '#E8A65A', '#9A5E2A');
  if (extra === 'potato') { B(0.6, 4.4, 13.0, 1.8, 2.4, 1.6, '#C99A52', { top: '#E3B66A', decR: [[0.6 * u, 0.6 * u, 0.4 * u, 0.3 * u, '#8A6434']] }); }
  if (extra === 'recipe') { B(1.6, 3.8, 12.6, 0.4, 4.2, 3.6, '#F4EAD6', { decR: [[0.5 * u, 2.3 * u, 1.3 * u, 1.0 * u, '#6FA8C8'], [2.3 * u, 2.3 * u, 1.3 * u, 1.0 * u, '#C99A52'], [0.5 * u, 0.6 * u, 3.0 * u, 0.3 * u, '#A0703A'], [0.5 * u, 1.3 * u, 2.4 * u, 0.3 * u, '#A0703A']] }); }
  if (extra === 'rod') { // a fishing rod pointing out to sea, the line dropping into the water
    for (let i = 0; i < 7; i++) B(1.6 + i * 1.1, 4.8, 12.8 + i * 0.7, 1.2, 0.6, 0.6, i % 2 ? '#8A5A2E' : '#7A4E2B');
    for (let i = 0; i < 13; i++) B(9.4, 5.0, 16.6 - i * 1.25, 0.18, 0.18, 1.25, '#E9E2CF'); }
}
const dogX = (S, G, d) => { if (d) mobber2(S, G, Object.assign({ kind: 'dog' }, d)); };

/* a speech bubble that shows a furnace recipe: food on top, fire in the middle, wood below -> the cooked food */
const FLAME = ['................', '................', '.......O........', '......OO........', '......OYO.......', '.....OYYO..O....', '....OOYYOO.O....', '...OOYYWYOOO....', '...OYYWWWYYO....', '..OOYWWWWWYOO...', '..OYYWWWWWYYO...', '..OYYYWWWYYYO...', '...OYYYYYYYO....', '....OOOOOOO.....', '................', '................']
  .map(r => [...r].map(ch => ({ O: '#E8732C', Y: '#F2C94C', W: '#FFF2C4' })[ch] || null));
const ARROW = ['................', '................', '................', '................', '.........K......', '.........KK.....', '..KKKKKKKKWK....', '..KWWWWWWWWWK...', '..KWWWWWWWWWWK..', '..KWWWWWWWWWK...', '..KKKKKKKKWK....', '.........KK.....', '.........K......', '................', '................', '................']
  .map(r => [...r].map(ch => ({ K: '#5A4A60', W: '#8E8099' })[ch] || null));
function recipeBubble(at, inId, outId) { return (v) => { const [px, py] = P(v, at[0], at[1], at[2]); const s = v.s / 27; const q = 3.6 * s;
  const W = 190 * s, H = 176 * s, bx = Math.max(16 * s, Math.min(v.W - W - 16 * s, px - W / 2)), by = Math.max(H / 2 + 16 * s, py - 160 * s);
  let g = `<g><circle cx="${(px + 14 * s).toFixed(0)}" cy="${(py - 22 * s).toFixed(0)}" r="${7 * s}" fill="#FFF8EA"/><circle cx="${(px + 8 * s).toFixed(0)}" cy="${(py - 50 * s).toFixed(0)}" r="${10 * s}" fill="#FFF8EA"/>`;
  g += `<rect x="${bx.toFixed(0)}" y="${(by - H / 2).toFixed(0)}" width="${W.toFixed(0)}" height="${H.toFixed(0)}" rx="${22 * s}" fill="#FFF8EA" stroke="#E7D9BC" stroke-width="${3 * s}"/>`;
  const icon = (grid, cx, cy, qq) => { grid.forEach((r, y) => r.forEach((c, x) => { if (c) g += `<rect x="${(cx - 8 * qq + x * qq).toFixed(1)}" y="${(cy - 8 * qq + y * qq).toFixed(1)}" width="${(qq + 0.4).toFixed(1)}" height="${(qq + 0.4).toFixed(1)}" fill="${c}"/>`; })); };
  const slot = (cx, cy) => { g += `<rect x="${(cx - 30 * s).toFixed(0)}" y="${(cy - 30 * s).toFixed(0)}" width="${60 * s}" height="${60 * s}" rx="${6 * s}" fill="#D9CDB4" stroke="#B8A888" stroke-width="${2 * s}"/>`; };
  const c1 = bx + 46 * s, c2 = bx + W - 46 * s;
  slot(c1, by - 50 * s); icon(ICONS[inId], c1, by - 50 * s, q);
  icon(FLAME, c1, by + 6 * s, 2.6 * s);
  slot(c1, by + 56 * s); icon(ICONS.log, c1, by + 56 * s, q);
  icon(ARROW, bx + W / 2 + 2 * s, by + 6 * s, 2.4 * s);
  slot(c2, by + 6 * s); icon(ICONS[outId], c2, by + 6 * s, q);
  return g + '</g>'; }; }

/* ---------- episode 16: the furnace ---------- */
const FURN = [14, 11];
function oven(S, G, state) { const [x, y] = FURN; const z = G(x, y); const lit = state !== 'off';
  const face = [[0.18, 0.12, 0.64, 0.4, lit ? '#F2A541' : '#2A2230'], [0.26, 0.18, 0.48, 0.18, lit ? '#FFD27A' : '#2A2230'], [0.12, 0.64, 0.76, 0.1, '#5A5862'], [0.12, 0.8, 0.76, 0.08, '#5A5862']];
  const k = 1.4, sc = (d) => d.map(([u, v, w, h, c]) => [u * k, v * k, w * k, h * k, c]);
  S.box(x - 0.2, y - 0.2, z, k, k, k, '#77747F', { nojit: true, decR: sc(face), decL: sc([[0.12, 0.64, 0.76, 0.1, '#5A5862'], [0.12, 0.8, 0.76, 0.08, '#5A5862']]), top: '#8F8C97', decT: sc([[0.2, 0.2, 0.6, 0.6, '#5A5862']]), sort: x + y + 1.3 });
  if (state === 'cook') [[0.3, 0.3, 1.2, 0.5], [0.5, 0.0, 1.9, 0.6], [0.8, -0.3, 2.7, 0.7]].forEach(([a, b, c, s], i) => S.box(x + a, y + b, z + 0.5 + c, s, s, s, '#D9D4E2', { nojit: true, op: 0.7, sort: x + y + 5 + i * 0.01 })); }
function logPile(S, G) { const x = 14.2, y = 12.6, z = G(x, y);
  [[0, 0, 0], [0, 0.55, 0], [0, 0.28, 0.5]].forEach(([a, b, c], i) => S.box(x + a, y + b, z + c, 1.3, 0.5, 0.5, '#7A4E2B', { nojit: true, top: '#8A5A2E', decR: [[0.1, 0.1, 0.3, 0.3, '#C9A26B']], sort: x + y + 1.4 + i * 0.01 })); }
function stonePile(S, G) { const x = 13.6, y = 10.4, z = G(x, y);
  [[0, 0, 0, 0.6], [0.7, 0.2, 0, 0.55], [0.3, 0.6, 0, 0.5], [0.35, 0.25, 0.5, 0.5]].forEach(([a, b, c, s], i) => S.box(x + a, y + b, z + c, s, s, s, ['#8F8C97', '#9A97A2', '#84818C', '#8F8C97'][i], { nojit: true, sort: x + y + 1.2 + i * 0.01 })); }
const HK = { x: 11.8, y: 12.4 }, DOGK = { x: 8.4, y: 14.0, collar: true }, HFISH = { x: 17.4, y: 12.4 };
const kitchen = (o) => { const b = outdoor2(clean({ cave: false, view: VIEW, sky: o.sky, top: o.top, glow2: o.glow2 }));
  const inner = b.extra;
  b.extra = (S, G, H) => { inner(S, G, H);
    if (o.stones) stonePile(S, G);
    if (o.oven) { oven(S, G, o.oven); logPile(S, G); }
    if (o.puff) poof(S, o.puff[0], o.puff[1], G(o.puff[0], o.puff[1]) + 0.4);
    dogX(S, G, o.dog === undefined ? DOGK : o.dog);
    if (o.hero) heroX(S, G, o.hero); };
  if (o.glowOven) b.glow = [FURN[0] + 0.5, FURN[1] + 1.2, 1.2, 3.2, '#FFB54A'];
  return b; };
const H = (o) => Object.assign({}, HK, o);
const S16 = {
  1: { base: kitchen({ hero: H({ arms: 'down' }) }), reveal: kitchen({ hero: H({ arms: 'down' }), top: iconBubble([HK.x, HK.y, 6.6], 'rawfish') }) },
  2: { base: kitchen({ hero: H({}), stones: true }), reveal: kitchen({ hero: H({ arms: 'up' }), oven: 'off', glow2: [FURN[0] + 0.5, FURN[1] + 0.5, 1.2, 2.6, '#FFE9B0'] }) },
  3: { base: kitchen({ hero: H({}), oven: 'off' }), reveal: kitchen({ hero: H({ arms: 'up' }), oven: 'lit', glowOven: true }) },
  4: { base: kitchen({ hero: Object.assign({ hold3: 'rod' }, HFISH), oven: 'lit', dog: { x: 14.2, y: 11.4, collar: true } }),
       reveal: kitchen({ hero: Object.assign({ hold3: 'fish' }, HFISH), oven: 'lit', dog: { x: 14.2, y: 11.4, collar: true, wag: true }, puff: [20.0, 12.8] }) },
  5: { base: kitchen({ hero: H({ hold3: 'fish' }), oven: 'lit' }), reveal: kitchen({ hero: H({ hold3: 'fish' }), oven: 'lit', top: recipeBubble([FURN[0] + 0.5, FURN[1] + 0.5, 2.2], 'rawfish', 'fish') }) },
  6: { base: kitchen({ hero: H({ hold3: 'fish' }), oven: 'lit' }), reveal: kitchen({ hero: H({ arms: 'down' }), oven: 'cook', glowOven: true }) },
  7: { base: kitchen({ hero: H({ arms: 'down' }), oven: 'cook' }), reveal: kitchen({ hero: H({ hold3: 'cfish' }), oven: 'lit', glow2: [HK.x + 0.6, HK.y + 2.2, 6.4, 2.2, '#FFE9B0'] }) },
  8: { base: kitchen({ hero: H({ hold3: 'cfish' }), oven: 'lit' }),
       reveal: kitchen({ hero: H({ arms: 'down' }), oven: 'lit', dog: { x: 8.4, y: 14.0, collar: true, wag: true, happy: true }, top: iconBubble([DOGK.x + 1.2, DOGK.y, 2.6], 'heart') }) },
  9: { base: kitchen({ hero: H({}), oven: 'cook' }), reveal: kitchen({ hero: H({ hold3: 'potato' }), oven: 'lit', glow2: [HK.x + 0.6, HK.y + 2.2, 6.4, 2.2, '#FFE9B0'] }) },
  10: { base: kitchen({ hero: H({}), oven: 'lit', dog: { x: 8.4, y: 14.0, collar: true, wag: true } }),
        reveal: kitchen({ hero: H({ hold3: 'recipe' }), oven: 'lit', dog: { x: 8.4, y: 14.0, collar: true, wag: true, happy: true }, top: recipeBubble([FURN[0] + 0.5, FURN[1] + 0.5, 2.2], 'rawpotato', 'potato') }) },
};

/* ---------- episode 17: the night of the skeleton and the creeper ---------- */
// the creeper: original block mob, a tall mottled green body on four short legs
function creeper(S, G, p) { const { x: ox, y: oy } = p; const z0 = G(ox, oy); const u = 0.44; const k = ox + oy + 1.2; let n = 0;
  const B = (x, y, z, w, d, h, col, o) => S.box(ox + x * u, oy + y * u, z0 + z * u, w * u, d * u, h * u, col, Object.assign({ grp: ox + ',' + oy, sort: k + (n++) * 0.001, nojit: true, fl: 0.9, fr: 0.78 }, o || {}));
  const flash = p.flash; const G1 = flash ? '#E9F5E4' : '#5DA33E', G2 = flash ? '#FFFFFF' : '#4A8C30', G3 = flash ? '#D2EAC8' : '#77BB55', EYE = '#1E1822';
  const spots = (w, h) => [[0.3 * u, 0.6 * u, 0.6 * u, 0.6 * u, G2], [w * 0.55 * u, h * 0.45 * u, 0.7 * u, 0.6 * u, G3], [w * 0.2 * u, h * 0.7 * u, 0.6 * u, 0.6 * u, G2]];
  [[0.6, 0.0], [0.6, 2.4], [2.6, 0.0], [2.6, 2.4]].forEach(([x, y]) => B(x, y, 0, 1.6, 1.6, 1.8, G2, { top: G1 }));
  B(1.0, 0.6, 1.8, 2.4, 3.2, 6.4, G1, { top: G3, decR: spots(3.2, 6.4), decL: spots(2.4, 6.4) });
  B(0.6, 0.2, 8.2, 3.2, 4.0, 4.0, G1, { top: G3, decL: spots(3.2, 4.0),
    decR: [[0.6 * u, 2.3 * u, 1.0 * u, 1.0 * u, EYE], [2.4 * u, 2.3 * u, 1.0 * u, 1.0 * u, EYE], [1.6 * u, 0.4 * u, 0.8 * u, 1.9 * u, EYE], [1.1 * u, 0.4 * u, 0.5 * u, 1.0 * u, EYE], [2.4 * u, 0.4 * u, 0.5 * u, 1.0 * u, EYE]] }); }
function arrowFly(S, x, y, z) { // flies toward the hero (-x)
  S.box(x, y, z, 2.0, 0.22, 0.22, '#8A5A2E', { nojit: true, top: '#B07A42', sort: x + y + 6 }); S.box(x - 0.36, y - 0.1, z - 0.1, 0.42, 0.42, 0.42, '#C9D2DC', { nojit: true, top: '#E3E9F0', sort: x + y + 6.01 });
  S.box(x + 1.7, y - 0.16, z - 0.16, 0.5, 0.54, 0.54, '#F4EAD6', { nojit: true, sort: x + y + 6.02 });
  [[2.6, 0.3], [3.4, 0.5], [4.2, 0.7]].forEach(([a, c], i) => S.box(x + a, y, z + c * 0.2, 0.3, 0.1, 0.1, '#E9E2CF', { nojit: true, op: 0.6, sort: x + y + 6.03 + i * 0.01 })); }
function arrowsDown(S, G, x, y) { [[0, 0], [0.5, 0.4], [-0.2, 0.7]].forEach(([a, b], i) => S.box(x + a, y + b, G(x + a, y + b), 0.16, 1.2, 0.12, '#8A5A2E', { nojit: true, top: '#B07A42', sort: x + y + 1.5 + i * 0.01 })); }
function crater(S, G, x, y) { const z = G(x, y); S.box(x - 0.4, y - 0.4, z, 2.2, 2.2, 0.03, '#6B4426', { nojit: true, sort: x + y + 1.8 }); S.box(x, y, z, 1.4, 1.4, 0.04, '#2A1E18', { nojit: true, sort: x + y + 1.81 }); }
function bang(S, G, x, y) { const z = G(x, y);
  [[-0.4, -0.4, 0.2, 2.0], [1.2, 0.8, 0.6, 1.5], [-1.2, 1.2, 0.8, 1.4], [0.8, -1.2, 1.2, 1.4], [0.0, 0.4, 2.0, 1.8], [-1.0, -0.6, 2.6, 1.2], [1.4, 0.0, 2.8, 1.0], [0.2, -0.2, 3.8, 1.2], [-0.6, 1.0, 3.4, 0.9], [1.0, 1.4, 2.0, 0.9]]
    .forEach(([a, b, c, s], i) => S.box(x + a, y + b, z + c, s, s, s, ['#FFF2C4', '#F2A541', '#FFFFFF', '#E8732C', '#FFD27A'][i % 5], { nojit: true, op: 0.94, sort: x + y + 8 + i * 0.01 }));
  [[-3.0, 0.4, 1.4], [3.2, -1.0, 2.0], [0.4, 3.2, 1.6], [-1.0, -3.2, 2.4]].forEach(([a, b, c], i) => S.box(x + a, y + b, z + c, 0.34, 0.34, 0.34, '#6B4426', { nojit: true, sort: x + y + 8.5 + i * 0.01 })); }
const ARMED = { hold: 'sword', shield: true, helmet: true };
const HN = { x: 11.0, y: 12.6 }, DOGN = { x: 8.0, y: 14.6, collar: true }, SK = { kind: 'skeleton', x: 15.4, y: 10.2, bow: true }, CR = { x: 14.8, y: 14.0 }, HRUN = { x: 8.8, y: 16.4 };
const night = (o) => { const b = outdoor2(clean({ cave: false, view: VIEW, sky: o.sky || 'night', top: o.top, glow2: o.glow2 }));
  const inner = b.extra;
  b.extra = (S, G, H) => { inner(S, G, H);
    if (o.crater) crater(S, G, CR.x, CR.y);
    if (o.bones) { const [x, y] = [SK.x + 0.2, SK.y + 0.6]; S.box(x, y, G(x, y), 1.2, 0.3, 0.3, '#F1ECDD', { nojit: true, top: '#FFFFFF', sort: x + y + 1.4 }); S.box(x + 0.4, y + 0.6, G(x, y), 0.3, 1.0, 0.3, '#E9E4D6', { nojit: true, top: '#FFFFFF', sort: x + y + 1.41 }); }
    if (o.skel) mobber(S, G, SK);
    if (o.creeper) creeper(S, G, Object.assign({}, o.creeperAt || CR, { flash: o.creeper === 'flash' }));
    if (o.arrowsDown) arrowsDown(S, G, HN.x + 1.8, HN.y + 0.2);
    if (o.puff) poof(S, o.puff[0], o.puff[1], G(o.puff[0], o.puff[1]) + 0.4);
    dogX(S, G, o.dog === undefined ? DOGN : o.dog);
    if (o.hero) heroX(S, G, o.hero);
    if (o.arrow) arrowFly(S, ...o.arrow);
    if (o.bang) bang(S, G, CR.x, CR.y); };
  if (o.glow) b.glow = o.glow;
  return b; };
const HA = (o) => Object.assign({}, ARMED, HN, o);
const S17 = {
  1: { base: night({ sky: 'sunset', hero: HA({}) }), reveal: night({ hero: HA({}), glow: [HN.x + 0.5, HN.y + 0.5, 3, 3.6, '#FFE9B0'] }) },
  2: { base: night({ hero: HA({}) }), reveal: night({ hero: HA({}), skel: true, glow2: [SK.x + 0.6, SK.y + 1, 3, 3.2, '#C9C2E0'] }) },
  3: { base: night({ hero: HA({}), skel: true }), reveal: night({ hero: HA({}), skel: true, arrow: [12.8, 11.4, 4.6] }) },
  4: { base: night({ hero: HA({}), skel: true, arrow: [12.8, 11.4, 4.6] }), reveal: night({ hero: HA({}), skel: true, arrowsDown: true, puff: [HN.x + 1.6, HN.y - 0.2], glow2: [HN.x + 1.2, HN.y + 0.4, 2.6, 2.6, '#FFE9B0'] }) },
  5: { base: night({ hero: HA({}), skel: true }), reveal: night({ hero: HA({ x: 13.4, y: 11.4 }), bones: true, puff: [SK.x + 0.6, SK.y + 0.4] }) },
  6: { base: night({ hero: HA({}) }), reveal: night({ hero: HA({}), creeper: true, glow2: [CR.x + 0.8, CR.y + 1, 3, 3.2, '#B8F0A0'] }) },
  7: { base: night({ hero: HA({}), creeper: true }), reveal: night({ hero: HA({}), creeper: 'flash', glow2: [CR.x + 0.8, CR.y + 1, 3, 3.6, '#FFFFFF'] }) },
  8: { base: night({ hero: HA({}), creeper: 'flash' }), reveal: night({ hero: HA({ x: HRUN.x, y: HRUN.y, arms: 'up' }), dog: { x: 6.2, y: 14.0, collar: true }, creeper: 'flash', glow2: [CR.x + 0.8, CR.y + 1, 3, 3.6, '#FFFFFF'] }) },
  9: { base: night({ hero: HA(HRUN), dog: { x: 6.2, y: 14.0, collar: true }, creeper: 'flash' }),
       reveal: night({ hero: HA({ x: HRUN.x, y: HRUN.y, arms: 'up' }), dog: { x: 6.2, y: 14.0, collar: true }, crater: true, bang: true, glow2: [CR.x + 0.8, CR.y + 0.8, 2, 7, '#FFE9B0'] }) },
  10: { base: night({ hero: HA(HRUN), dog: { x: 6.2, y: 14.0, collar: true }, crater: true }),
        reveal: night({ sky: 'morning', hero: HA({ x: HRUN.x, y: HRUN.y, arms: 'up' }), dog: { x: 10.4, y: 14.6, collar: true, wag: true, happy: true }, crater: true, top: iconBubble([HRUN.x, HRUN.y, 6.6], 'heart') }) },
};

/* ---------- episode 18: the zoo (a pen for every animal he met) ---------- */
function fence(S, G, x0, y0, x1, y1) { // posts and two rails between two points on the ground
  const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 0.9));
  for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
    S.box(x, y, G(x, y), 0.24, 0.24, 1.25, '#7A4E2B', { nojit: true, top: '#B07A42', sort: x + y + 1.3 });
    if (i < n) { const xx = x0 + (x1 - x0) * (i + 1) / n, yy = y0 + (y1 - y0) * (i + 1) / n;
      [0.45, 0.95].forEach((h, j) => S.box(Math.min(x, xx), Math.min(y, yy), G(x, y) + h, Math.abs(xx - x) + 0.2, Math.abs(yy - y) + 0.2, 0.16, '#B07A42', { nojit: true, top: '#C9955A', sort: (x + xx) / 2 + (y + yy) / 2 + 1.31 + j * 0.001 })); } } }
function pen(S, G, x0, y0, x1, y1) { fence(S, G, x0, y0, x1, y0); fence(S, G, x0, y0, x0, y1); fence(S, G, x1, y0, x1, y1); fence(S, G, x0, y1, x1, y1); }
function pond(S, G, x0, y0, x1, y1) { for (let x = x0; x < x1; x++) for (let y = y0; y < y1; y++) S.box(x, y, G(x, y), 1, 1, 0.04, ['#3E8FB0', '#4698B8'][(x + y) % 2], { nojit: true, top: ['#4FA3C2', '#5AAFCD'][(x + y) % 2], sort: x + y + 1.05, decT: (x + y) % 3 ? [] : [[0.2, 0.4, 0.6, 0.1, '#BFE6F0', 0.7]] }); }
function hive(S, G, x, y) { const z = G(x, y);
  S.box(x + 0.4, y + 0.4, z, 0.3, 0.3, 1.6, '#7A4E2B', { nojit: true, sort: x + y + 1 });
  S.box(x - 0.1, y - 0.1, z + 1.6, 1.3, 1.3, 1.1, '#E3C04A', { nojit: true, top: '#F2D768', decR: [[0.2, 0.3, 0.3, 0.25, '#8A5A2E'], [0.7, 0.6, 0.3, 0.25, '#8A5A2E']], decL: [[0.3, 0.4, 0.3, 0.25, '#8A5A2E']], sort: x + y + 1.2 }); }
function sign(S, G, x, y) { const z = G(x, y); // a wooden sign with the four animal colours
  S.box(x + 0.5, y + 0.4, z, 0.26, 0.26, 2.0, '#7A4E2B', { nojit: true, sort: x + y + 1.4 });
  S.box(x + 0.5, y - 0.9, z + 1.6, 0.22, 2.8, 1.3, '#C9A26B', { nojit: true, top: '#E0BE86', sort: x + y + 1.41,
    decR: [[0.3, 0.35, 0.45, 0.6, '#2F5E3A'], [0.9, 0.35, 0.45, 0.6, '#E8604E'], [1.5, 0.35, 0.45, 0.6, '#3D6FB0'], [2.1, 0.35, 0.45, 0.6, '#F2C94C']] }); }
const PANDA_PEN = [8.3, 7.0, 11.2, 10.2], FOX_PEN = [8.3, 12.4, 11.2, 15.0], POND_PEN = [14.6, 12.4, 18.4, 15.0], HORSE_PEN = [12.8, 8.0, 17.8, 10.8];
const BAMBOO = [[10, 7, 4], [10, 8, 3], [10, 9, 4], [8, 9, 3]];
const HZ = { x: 9.0, y: 17.0 }, DOGZ = { x: 7.6, y: 16.4, collar: true }, GATE_DOG = { x: 11.4, y: 10.8, collar: true, pose: 'sit' }, HIVE = [12.4, 12.8], BEESZ = [[12.0, 13.6, 3.4], [13.2, 12.6, 3.8], [12.6, 14.2, 3.0]];
const PANDA = { x: 9.4, y: 8.2 }, TURT = { x: 15.8, y: 13.0 }, FOXZ = { x: 8.9, y: 13.2 }, HORSEZ = { x: 13.2, y: 8.6 }, SIGN = [15.2, 16.4];
const zoo = (o) => { const has = (k) => o.n >= k;
  const b = outdoor2(clean({ cave: false, view: VIEW, sky: o.sky, top: o.top, glow2: o.glow2, flowers: [] }));
  if (has(3)) b.bamboo = BAMBOO;
  if (has(2)) b.panda = Object.assign({ pose: o.n === 2 || o.n === 3 ? 'happy' : 'sit' }, PANDA);
  const inner = b.extra;
  b.extra = (S, G, H) => { inner(S, G, H);
    if (has(1)) { pen(S, G, ...PANDA_PEN); pen(S, G, ...POND_PEN); pen(S, G, ...FOX_PEN); pen(S, G, ...HORSE_PEN); }
    if (has(4)) { pond(S, G, 15, 13, 18, 15); turtle(S, G, TURT); }
    if (has(5)) { fox(S, G, Object.assign({}, FOXZ, o.n === 5 ? { happy: true } : {})); S.box(10.4, 14.2, G(10.4, 14.2), 0.4, 0.4, 0.4, '#D8323C', { nojit: true, top: '#E8604E', sort: 10.4 + 14.2 + 1.2 }); }
    if (has(6)) { horse(S, G, Object.assign({}, HORSEZ, o.n === 6 ? { happy: true } : {})); [[17.0, 10.0], [16.6, 10.3]].forEach(([x, y], i) => S.box(x, y, G(x, y), 0.3, 0.3, 0.7, '#F08A24', { nojit: true, top: '#F6A45A', sort: x + y + 1.3 + i * 0.01 })); }
    if (has(7)) { hive(S, G, ...HIVE); BEESZ.forEach(q => bee(S, ...q)); }
    if (has(9)) sign(S, G, ...SIGN);
    if (o.visitors) o.visitors.forEach(v => T.person(S, G, Object.assign({ kind: 'villager' }, v)));
    dogX(S, G, o.dog === undefined ? DOGZ : o.dog);
    if (o.hero) heroX(S, G, o.hero); };
  return b; };
const HZU = Object.assign({ arms: 'up' }, HZ);
const S18 = {
  1: { base: zoo({ n: 0, hero: HZ }), reveal: zoo({ n: 1, hero: HZU, glow2: [13, 11, 2, 7, '#FFE9B0'] }) },
  2: { base: zoo({ n: 1, hero: HZ }), reveal: zoo({ n: 2, hero: HZ, glow2: [PANDA.x + 1, PANDA.y + 1, 2.4, 3, '#FFE9B0'] }) },
  3: { base: zoo({ n: 2, hero: HZ }), reveal: zoo({ n: 3, hero: HZ, glow2: [8.6, 7.6, 2.6, 3, '#C8F0A0'] }) },
  4: { base: zoo({ n: 3, hero: HZ }), reveal: zoo({ n: 4, hero: HZ, glow2: [16.4, 13.8, 1.4, 3, '#BFE6F0'] }) },
  5: { base: zoo({ n: 4, hero: HZ }), reveal: zoo({ n: 5, hero: HZ, glow2: [FOXZ.x + 1.2, FOXZ.y + 0.6, 1.4, 2.6, '#FFB3BA'] }) },
  6: { base: zoo({ n: 5, hero: HZ }), reveal: zoo({ n: 6, hero: HZ, glow2: [HORSEZ.x + 2, HORSEZ.y + 1, 2.6, 3.4, '#FFE9B0'] }) },
  7: { base: zoo({ n: 6, hero: HZ }), reveal: zoo({ n: 7, hero: HZ, glow2: [HIVE[0] + 0.5, HIVE[1] + 0.5, 2.6, 2.6, '#FFE58A'] }) },
  8: { base: zoo({ n: 7, hero: HZ }), reveal: zoo({ n: 7, hero: HZ, dog: Object.assign({ wag: true }, GATE_DOG), glow2: [GATE_DOG.x + 1.6, GATE_DOG.y + 0.6, 1.6, 2.6, '#FFE9B0'] }) },
  9: { base: zoo({ n: 8, hero: HZ, dog: GATE_DOG }), reveal: zoo({ n: 9, hero: HZU, dog: GATE_DOG, glow2: [SIGN[0] + 0.6, SIGN[1], 2.4, 2.4, '#FFE9B0'] }) },
  10: { base: zoo({ n: 9, hero: HZ, dog: GATE_DOG }), reveal: zoo({ n: 9, hero: HZU, dog: Object.assign({ wag: true, happy: true }, GATE_DOG), top: iconBubble([HZ.x, HZ.y, 6.6], 'heart') }) },
};

const SAGA4 = { s16: { pages: S16, hm: hmSaga }, s17: { pages: S17, hm: hmSaga }, s18: { pages: S18, hm: hmSaga } };
module.exports = { SAGA4 };
if (require.main === module) { renderAll(SAGA4, process.argv.slice(2), __dirname); console.log('done'); }
