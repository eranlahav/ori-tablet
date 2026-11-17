// Tiny isometric voxel renderer -> SVG. Original art, reusable for all 10 pages.
const fs = require('fs');
function hash(x, y, z = 0) { let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function shade(c, f, tint) { let [r, g, b] = hex(c); r *= f; g *= f; b *= f; if (tint) { r = r * (1 - tint[3]) + tint[0] * tint[3]; g = g * (1 - tint[3]) + tint[1] * tint[3]; b = b * (1 - tint[3]) + tint[2] * tint[3]; } const k = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); return '#' + k(r) + k(g) + k(b); }
const C30 = Math.cos(Math.PI / 6), S30 = 0.5;
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
    const bs = this.boxes.slice().sort((a, b) => {
      const ka = (a.sort != null ? a.sort : (a.x + a.w / 2 + a.y + a.d / 2)), kb = (b.sort != null ? b.sort : (b.x + b.w / 2 + b.y + b.d / 2));
      return (ka - kb) || (a.z - b.z);
    });
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
module.exports = { Scene, hash, shade };
