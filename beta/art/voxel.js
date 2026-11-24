// Tiny isometric voxel renderer -> SVG. Original art, reusable for all 10 pages.
const fs = require('fs');
function hash(x, y, z = 0) { let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function shade(c, f, tint) { let [r, g, b] = hex(c); r *= f; g *= f; b *= f; if (tint) { r = r * (1 - tint[3]) + tint[0] * tint[3]; g = g * (1 - tint[3]) + tint[1] * tint[3]; b = b * (1 - tint[3]) + tint[2] * tint[3]; } const k = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); return '#' + k(r) + k(g) + k(b); }
const C30 = Math.cos(Math.PI / 6), S30 = 0.5;
/* ---------- depth order ----------
   Layer model: every box is a solid block in one 3D space (terrain, water, items, characters, clouds).
   The camera looks from +x,+y,+z, so a box must be painted before any box it is behind.
   Two boxes only need an order when their screen shapes overlap. If they don't intersect in 3D,
   one of the x / y / z axes separates them, and that axis says which is behind (exact, no tuning).
   Characters are tagged with `grp`. When two characters stand inside each other (a dog against Ori's
   legs, a rider on a horse) each is painted whole: the one standing higher (rider) last, else the one
   further front last. Other boxes that really intersect (parts of one character, decals sunk into a
   block) fall back to the old hand-tuned key (`sort`, else the centre x+y), and so does a rare cycle. */
const EPS = 1e-6;
function oldKey(b) { return b.sort != null ? b.sort : (b.x + b.w / 2 + b.y + b.d / 2); }
function oldCmp(a, b) { return (oldKey(a) - oldKey(b)) || (a.z - b.z) || (a.i - b.i); }
// -1: a is behind b, 1: b is behind a, 0: they intersect (no separating axis)
function behind(a, b) {
  const ab = a.x + a.w <= b.x + EPS || a.y + a.d <= b.y + EPS || a.z + a.h <= b.z + EPS;
  const ba = b.x + b.w <= a.x + EPS || b.y + b.d <= a.y + EPS || b.z + b.h <= a.z + EPS;
  if (ab && !ba) return -1; if (ba && !ab) return 1; return 0;
}
// something poking up out of a water block (a boat hull) is painted after that water
function floats(a, w) { return w.unit && w.op != null && w.op < 1 && a.z + a.h > w.z + w.h + EPS; }
function depthOrder(boxes, stats) {
  const n = boxes.length; const B = boxes.map((b, i) => Object.assign(Object.create(b), { i }));
  // screen-space hexagon = intersection of three slabs: x-y, x-z, y-z
  const R = B.map(b => [b.x - b.y - b.d, b.x + b.w - b.y, b.x - b.z - b.h, b.x + b.w - b.z, b.y - b.z - b.h, b.y + b.d - b.z]);
  const idx = B.map((_, i) => i).sort((p, q) => R[p][0] - R[q][0]);
  const pairs = [];
  for (let a = 0; a < n; a++) { const i = idx[a], ri = R[i];
    for (let c = a + 1; c < n; c++) { const j = idx[c], rj = R[j]; if (rj[0] >= ri[1] - EPS) break;
      if (rj[2] >= ri[3] - EPS || ri[2] >= rj[3] - EPS || rj[4] >= ri[5] - EPS || ri[4] >= rj[5] - EPS) continue;
      pairs.push([i, j, behind(B[i], B[j])]); } }
  // characters (boxes sharing a `grp`) that stand inside each other are painted whole, one after the other,
  // by their footprint centre, so a dog's head can't poke through a leg
  const G = new Map(); for (const b of B) if (b.grp != null) { let g = G.get(b.grp); if (!g) G.set(b.grp, g = [1e9, 1e9, -1e9, -1e9, 1e9]);
    g[0] = Math.min(g[0], b.x); g[1] = Math.min(g[1], b.y); g[2] = Math.max(g[2], b.x + b.w); g[3] = Math.max(g[3], b.y + b.d); g[4] = Math.min(g[4], b.z); }
  const gkey = id => { const g = G.get(id); return (g[0] + g[2]) / 2 + (g[1] + g[3]) / 2; };
  const tied = new Set(), tkey = (p, q) => p < q ? p + '|' + q : q + '|' + p;
  for (const [i, j, r] of pairs) if (r === 0 && B[i].grp != null && B[j].grp != null && B[i].grp !== B[j].grp) tied.add(tkey(B[i].grp, B[j].grp));
  const out = B.map(() => []), indeg = new Array(n).fill(0); let cut = 0;
  for (let [i, j, r] of pairs) { const gi = B[i].grp, gj = B[j].grp;
    if (gi != null && gj != null && gi !== gj && tied.has(tkey(gi, gj))) { const dz = G.get(gi)[4] - G.get(gj)[4]; // a rider (feet clearly higher) goes on top of its mount
      r = (Math.abs(dz) > 0.5 ? dz : (gkey(gi) - gkey(gj) || dz)) < 0 ? -1 : 1; }
    else if (r === 0 && floats(B[i], B[j])) r = 1; else if (r === 0 && floats(B[j], B[i])) r = -1;
    else if (r === 0) { r = oldCmp(B[i], B[j]) < 0 ? -1 : 1; if (stats) stats.push([B[i], B[j]]); }
    if (r < 0) { out[i].push(j); indeg[j]++; } else { out[j].push(i); indeg[i]++; } }
  if (stats) stats.tied = tied;
  // Kahn's algorithm; among boxes that are free to go, the old key decides (keeps the look stable)
  const heap = [], push = v => { heap.push(v); let k = heap.length - 1; while (k) { const p = (k - 1) >> 1; if (oldCmp(B[heap[p]], B[heap[k]]) <= 0) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } },
    pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k;
      if (l < heap.length && oldCmp(B[heap[l]], B[heap[m]]) < 0) m = l; if (r < heap.length && oldCmp(B[heap[r]], B[heap[m]]) < 0) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
  const done = new Array(n).fill(false), res = [];
  for (let i = 0; i < n; i++) if (!indeg[i]) push(i);
  while (res.length < n) {
    if (!heap.length) { let best = -1; for (let i = 0; i < n; i++) if (!done[i] && (best < 0 || oldCmp(B[i], B[best]) < 0)) best = i; cut++; indeg[best] = 0; push(best); }
    const i = pop(); if (done[i]) continue; done[i] = true; res.push(boxes[i]);
    for (const j of out[i]) if (!done[j] && --indeg[j] === 0) push(j); }
  if (stats) stats.cycles = cut;
  return res;
}
class Scene {
  constructor() { this.boxes = []; this.grid = new Map(); }
  key(x, y, z) { return x + ',' + y + ',' + z; }
  vox(x, y, z, color, o = {}) { this.grid.set(this.key(x, y, z), 1); this.boxes.push(Object.assign({ x, y, z, w: 1, d: 1, h: 1, color, unit: true }, o)); }
  box(x, y, z, w, d, h, color, o = {}) { this.boxes.push(Object.assign({ x, y, z, w, d, h, color }, o)); }
  has(x, y, z) { return this.grid.has(this.key(x, y, z)); }
  render({ W, H, s, cx, cy, bg, light }) {
    const P = (x, y, z) => [cx + (x - y) * C30 * s, cy + (x + y) * S30 * s - z * s];
    const pts = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    const L = Object.assign({ top: 1.0, left: 0.8, right: 0.62, tintTop: [255, 214, 150, 0.10], tintSide: [60, 40, 90, 0.10] }, light || {});
    const bs = depthOrder(this.boxes);
    let out = '';
    const poly = (p, fill, op) => { out += `<polygon points="${pts(p)}" fill="${fill}" stroke="${fill}" stroke-width="0.7" stroke-linejoin="round"${op != null && op < 1 ? ` opacity="${op}"` : ''}/>`; };
    for (const b of bs) {
      const { x, y, z, w, d, h } = b; const j = b.nojit ? 1 : 0.955 + 0.09 * hash(Math.round(x * 7), Math.round(y * 7), Math.round(z * 7));
      const tb = b.shadow ? 0.74 : 1;
      const showTop = !(b.unit && this.has(x, y, z + 1)), showR = !(b.unit && this.has(x + 1, y, z)), showL = !(b.unit && this.has(x, y + 1, z));
      if (showL) { // +y face (faces lower-left)
        const p = [P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)];
        poly(p, shade(b.sideL || b.side || b.color, (b.fl || L.left) * j, L.tintSide), b.op);
        if (b.lip) { const lh = 0.24; poly([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z + h - lh), P(x, y + d, z + h - lh)], shade(b.color, L.left * j * tb, L.tintSide), b.op); }
        for (const dc of (b.decL || [])) { const [u, v, uw, vh, col] = dc; poly([P(x + u, y + d, z + v + vh), P(x + u + uw, y + d, z + v + vh), P(x + u + uw, y + d, z + v), P(x + u, y + d, z + v)], shade(col, b.fl || L.left, null)); }
      }
      if (showR) { // +x face (faces lower-right)
        const p = [P(x + w, y + d, z + h), P(x + w, y, z + h), P(x + w, y, z), P(x + w, y + d, z)];
        poly(p, shade(b.sideR || b.side || b.color, (b.fr || L.right) * j, L.tintSide), b.op);
        if (b.lip) { const lh = 0.24; poly([P(x + w, y + d, z + h), P(x + w, y, z + h), P(x + w, y, z + h - lh), P(x + w, y + d, z + h - lh)], shade(b.color, L.right * j * tb, L.tintSide), b.op); }
        for (const dc of (b.decR || [])) { const [u, v, uw, vh, col] = dc; poly([P(x + w, y + d - u, z + v + vh), P(x + w, y + d - u - uw, z + v + vh), P(x + w, y + d - u - uw, z + v), P(x + w, y + d - u, z + v)], shade(col, 0.9, null)); }
      }
      if (showTop) {
        const p = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
        poly(p, shade(b.top || b.color, L.top * j * tb, L.tintTop), b.op);
        for (const dc of (b.decT || [])) { const [u, v, uw, vh, col] = dc; poly([P(x + u, y + v, z + h), P(x + u + uw, y + v, z + h), P(x + u + uw, y + v + vh, z + h), P(x + u, y + v + vh, z + h)], shade(col, 1, null), dc[5]); }
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${bg || ''}${out}</svg>`;
  }
}
module.exports = { Scene, hash, shade, depthOrder };
