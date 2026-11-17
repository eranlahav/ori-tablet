// Collectible item icons: original 16x16 pixel sprites (drawn here from simple shapes, auto-outlined).
// Usage: node art/items.js  -> writes art/items/{id}.svg
const fs = require('fs'); const path = require('path');
const K = '#241C2E';
function sprite(draw) { const g = Array.from({ length: 16 }, () => Array(16).fill(null));
  const px = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < 16 && y < 16) g[y][x] = c; };
  const rect = (x, y, w, h, c) => { for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) px(x + i, y + j, c); };
  const line = (x0, y0, x1, y1, c) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) px(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, c); };
  const rows = (x, y, arr, pal) => arr.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.') px(x + i, y + j, pal[ch]); }));
  draw({ px, rect, line, rows });
  // outline: every empty pixel touching a filled one (4-neighbour) becomes dark
  const o = g.map(r => r.slice());
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (!g[y][x] && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => g[y + b] && g[y + b][x + a] && g[y + b][x + a] !== K)) o[y][x] = K;
  return o; }
function svg(grid, sil) { let s = '';
  grid.forEach((r, y) => r.forEach((c, x) => { if (c) s += `<rect x="${x}" y="${y}" width="1.04" height="1.04" fill="${sil ? (c === K ? '#140F1C' : '#2E2640') : c}"/>`; }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">${s}</svg>`; }
const WOOD = '#8A5A2E', WOOD2 = '#B07A42', WOOD3 = '#6B4422', IRON = '#B9C3CF', IRON2 = '#E3E9F0', IRON3 = '#8792A0', GOLD = '#F2C94C', GOLD2 = '#FFE58A', GOLD3 = '#C08E22';
const EM = '#2FBF71', EM2 = '#8BEBB0', EM3 = '#1C8A50', DI = '#56D6E2', DI2 = '#C4F6FA', DI3 = '#2B9BB0';
const tool = (head) => sprite(({ line, px, rect, rows }) => { line(2, 13, 10, 5, WOOD); line(3, 13, 11, 5, WOOD3); px(2, 13, WOOD2); head({ line, px, rect, rows }); });
const ITEMS = {
  log: sprite(({ rect, px, line }) => { rect(2, 4, 12, 8, '#7A4E2B'); for (let x = 2; x < 14; x += 3) line(x, 4, x, 11, '#5E3B1F'); rect(11, 4, 3, 8, '#C9A26B'); rect(12, 6, 1, 4, '#A57C46'); px(12, 5, '#E0BE86'); }),
  lantern: sprite(({ rect, px }) => { rect(6, 1, 4, 1, '#3A3040'); px(7, 2, '#3A3040'); px(8, 2, '#3A3040'); rect(4, 3, 8, 2, '#3A3040'); rect(4, 5, 8, 7, '#FFD27A'); rect(6, 6, 4, 5, '#FFF2C4'); rect(4, 5, 1, 7, '#5A4A60'); rect(11, 5, 1, 7, '#5A4A60'); rect(4, 12, 8, 2, '#3A3040'); }),
  treasure: sprite(({ rect, px }) => { rect(2, 9, 12, 5, GOLD3); rect(3, 8, 10, 2, GOLD); rect(5, 6, 6, 2, GOLD); rect(7, 4, 3, 2, GOLD2); [[4, 9], [8, 7], [10, 10], [6, 11], [12, 11]].forEach(([x, y]) => px(x, y, GOLD2)); px(9, 9, '#5FD3E0'); px(5, 10, '#E8604E'); px(11, 8, EM); }),
  pickaxe: tool(({ line, px }) => { line(3, 3, 7, 1, IRON); line(8, 1, 12, 3, IRON); line(12, 3, 14, 7, IRON); line(4, 4, 8, 2, IRON3); line(9, 2, 12, 4, IRON3); line(12, 4, 13, 8, IRON3); px(8, 1, IRON2); px(9, 1, IRON2); px(10, 4, WOOD); px(11, 4, WOOD); }),
  chest: sprite(({ rect, px }) => { rect(2, 5, 12, 9, '#A06A2E'); rect(2, 5, 12, 3, '#7A4E22'); rect(2, 8, 12, 1, '#5E3B1A'); rect(7, 7, 2, 3, GOLD); px(7, 9, GOLD3); rect(2, 13, 12, 1, '#7A4E22'); }),
  map: sprite(({ rect, px, line }) => { rect(2, 3, 12, 10, '#EADBB0'); rect(2, 3, 12, 1, '#D2BE88'); rect(2, 12, 12, 1, '#D2BE88'); line(4, 10, 7, 7, '#A0703A'); line(7, 7, 10, 8, '#A0703A'); rect(4, 5, 3, 2, '#4F8F3A'); px(11, 6, '#C9483A'); px(10, 5, '#C9483A'); px(12, 5, '#C9483A'); px(10, 7, '#C9483A'); px(12, 7, '#C9483A'); }),
  emerald: sprite(({ rect, px }) => { rect(5, 2, 6, 12, EM); rect(3, 4, 10, 8, EM); rect(6, 3, 2, 4, EM2); px(5, 5, EM2); rect(9, 9, 3, 3, EM3); rect(7, 12, 4, 1, EM3); px(8, 5, '#FFFFFF'); }),
  wheat: sprite(({ line, px }) => { [[4, 0], [7, -1], [10, 0]].forEach(([x, d]) => { line(x, 14, x, 6 + d, '#8DBA48'); for (let y = 2 + d; y < 8 + d; y++) { px(x - 1 + (y % 2), y, y % 2 ? GOLD : '#E3C04A'); px(x, y, GOLD2); } }); line(3, 11, 11, 11, '#B88A52'); }),
  boat: sprite(({ rect, line }) => { rect(1, 9, 14, 2, '#9A6A35'); rect(2, 11, 12, 2, '#7A5228'); rect(4, 13, 8, 1, '#5E3B1A'); line(8, 1, 8, 9, '#6B4426'); rect(9, 2, 4, 5, '#F4EAD6'); rect(9, 7, 3, 1, '#F4EAD6'); rect(10, 4, 2, 1, '#E8732C'); }),
  torch: sprite(({ rect, px }) => { rect(7, 6, 2, 9, WOOD); rect(8, 6, 1, 9, WOOD3); rect(6, 2, 4, 4, '#F2A541'); rect(7, 1, 2, 2, '#FFD27A'); rect(7, 3, 2, 2, '#FFF2C4'); px(6, 1, '#E8732C'); px(9, 0, '#E8732C'); }),
  iron: sprite(({ rect, px }) => { rect(2, 8, 12, 4, IRON); rect(3, 6, 10, 2, IRON2); rect(2, 11, 12, 1, IRON3); px(4, 6, '#FFFFFF'); px(5, 6, '#FFFFFF'); rect(12, 8, 2, 4, IRON3); }),
  arrow: sprite(({ line, px, rect }) => { line(3, 12, 11, 4, WOOD); line(2, 11, 3, 13, '#F4EAD6'); line(1, 12, 3, 14, '#F4EAD6'); line(2, 10, 4, 12, '#E3DCC8'); rect(11, 2, 3, 3, IRON); px(14, 1, IRON2); px(13, 1, IRON2); px(14, 2, IRON2); px(11, 4, IRON3); px(10, 3, IRON3); px(12, 5, IRON3); }),
  bone: sprite(({ line, px }) => { line(4, 11, 11, 4, '#F1ECDD'); line(5, 11, 11, 5, '#DCD3BC'); [[3, 11], [4, 12], [3, 12], [11, 3], [12, 4], [12, 3]].forEach(([x, y]) => px(x, y, '#F1ECDD')); px(2, 11, '#F1ECDD'); px(4, 13, '#F1ECDD'); px(11, 2, '#F1ECDD'); px(13, 4, '#F1ECDD'); }),
  bow: sprite(({ line, px }) => { line(3, 2, 7, 1, WOOD); line(8, 1, 11, 3, WOOD); line(11, 3, 13, 6, WOOD); line(13, 7, 14, 11, WOOD); px(12, 4, WOOD3); px(13, 8, WOOD3); line(3, 2, 14, 12, '#E9E2CF'); line(2, 3, 2, 3, WOOD); }),
  sword: sprite(({ line, px, rect }) => { line(5, 10, 13, 2, IRON2); line(6, 10, 13, 3, IRON); line(6, 11, 14, 3, IRON3); px(14, 1, IRON2); px(13, 1, IRON2); px(14, 2, IRON); line(2, 8, 7, 13, GOLD3); line(3, 8, 7, 12, GOLD); line(2, 13, 4, 11, WOOD); px(3, 13, WOOD3); px(1, 14, GOLD); }),
  shield: sprite(({ rect, px, line }) => { rect(3, 2, 10, 8, '#8A5A2E'); rect(4, 10, 8, 2, '#8A5A2E'); rect(5, 12, 6, 1, '#8A5A2E'); rect(6, 13, 4, 1, '#8A5A2E'); rect(3, 2, 10, 1, IRON); rect(3, 2, 1, 8, IRON); rect(12, 2, 1, 8, IRON); line(7, 3, 7, 12, '#3D6FB0'); line(8, 3, 8, 12, '#3D6FB0'); rect(4, 6, 8, 2, '#3D6FB0'); px(7, 6, GOLD); px(8, 6, GOLD); px(7, 7, GOLD); px(8, 7, GOLD); }),
  helmet: sprite(({ rect, px }) => { rect(4, 3, 8, 2, IRON); rect(3, 5, 10, 4, IRON); rect(3, 9, 3, 4, IRON); rect(10, 9, 3, 4, IRON); rect(6, 9, 4, 1, IRON3); rect(5, 4, 3, 2, IRON2); px(4, 6, IRON2); rect(3, 12, 3, 1, IRON3); rect(10, 12, 3, 1, IRON3); }),
  dmap: sprite(({ rect, px, line }) => { rect(2, 3, 12, 10, '#EADBB0'); rect(2, 3, 12, 1, '#D2BE88'); rect(2, 12, 12, 1, '#D2BE88'); for (let i = 0; i < 6; i++) px(4 + i, 10 - (i % 2), '#A0703A'); rect(10, 5, 3, 3, DI); px(10, 5, DI2); px(12, 7, DI3); rect(4, 4, 2, 2, '#8F8C97'); }),
  diamond: sprite(({ rect, px }) => { rect(4, 3, 8, 2, DI2); rect(2, 5, 12, 2, DI); rect(3, 7, 10, 2, DI); rect(5, 9, 6, 2, DI3); rect(7, 11, 2, 2, DI3); px(5, 5, '#FFFFFF'); px(6, 4, '#FFFFFF'); rect(10, 5, 2, 2, DI3); }),
  dpick: tool(({ line, px }) => { line(3, 3, 7, 1, DI); line(8, 1, 12, 3, DI); line(12, 3, 14, 7, DI); line(4, 4, 8, 2, DI3); line(9, 2, 12, 4, DI3); line(12, 4, 13, 8, DI3); px(8, 1, DI2); px(9, 1, DI2); px(10, 4, WOOD); px(11, 4, WOOD); }),
  flint: sprite(({ rect, px, line }) => { rect(2, 7, 6, 6, '#4A4652'); rect(3, 8, 3, 2, '#6A6773'); px(3, 8, '#8F8C97'); line(9, 3, 13, 3, IRON); line(9, 4, 9, 9, IRON); line(13, 4, 13, 9, IRON); line(10, 9, 12, 9, IRON3); px(13, 3, IRON2); px(8, 6, '#FFD27A'); px(7, 5, '#F2A541'); px(9, 11, '#FFD27A'); }),
  dog: sprite(({ rect, px }) => { rect(3, 3, 10, 9, '#F1ECE4'); rect(2, 2, 3, 4, '#D9D2C6'); rect(11, 2, 3, 4, '#D9D2C6'); rect(5, 6, 2, 2, '#241C2E'); rect(9, 6, 2, 2, '#241C2E'); px(5, 6, '#FFFFFF'); px(9, 6, '#FFFFFF'); rect(6, 9, 4, 2, '#D9D2C6'); rect(7, 9, 2, 1, '#3A3040'); rect(3, 12, 10, 2, '#D8323C'); px(8, 13, GOLD); }),
  obsidian: sprite(({ rect, px }) => { rect(2, 2, 12, 12, '#2A1E3C'); rect(3, 3, 4, 3, '#3B2A55'); rect(8, 8, 4, 3, '#3B2A55'); px(4, 4, '#7A4FB0'); px(10, 9, '#7A4FB0'); px(11, 4, '#4A3570'); px(5, 11, '#4A3570'); }),
  firerod: sprite(({ line, px }) => { line(4, 12, 11, 5, '#F2A541'); line(5, 12, 12, 5, '#E8732C'); line(3, 12, 10, 5, '#FFD27A'); px(12, 4, '#FFF2C4'); px(13, 3, '#FFD27A'); px(11, 3, '#F2A541'); px(13, 5, '#F2A541'); }),
  eye: sprite(({ rect, px }) => { rect(4, 3, 8, 10, '#2E9B8F'); rect(3, 5, 10, 6, '#2E9B8F'); rect(5, 5, 6, 6, '#B8F2D8'); rect(6, 6, 4, 4, '#1E5E58'); rect(7, 7, 2, 2, '#0E1E20'); px(5, 4, '#7FE0C8'); }),
  egg: sprite(({ rect, px }) => { rect(6, 1, 4, 1, '#2A1E3C'); rect(5, 2, 6, 2, '#2A1E3C'); rect(4, 4, 8, 4, '#2A1E3C'); rect(3, 8, 10, 4, '#2A1E3C'); rect(4, 12, 8, 2, '#2A1E3C'); rect(6, 14, 4, 1, '#2A1E3C'); [[6, 4], [9, 6], [5, 9], [10, 10], [7, 12], [8, 8]].forEach(([x, y]) => px(x, y, '#9A4FD8')); px(6, 3, '#4A3570'); px(5, 5, '#4A3570'); }),
};
module.exports = { ITEMS, svg };
if (require.main === module) { const dir = path.join(__dirname, 'items'); fs.mkdirSync(dir, { recursive: true });
  for (const [id, g] of Object.entries(ITEMS)) { fs.writeFileSync(path.join(dir, id + '.svg'), svg(g)); fs.writeFileSync(path.join(dir, id + '-locked.svg'), svg(g, true)); }
  console.log(Object.keys(ITEMS).length + ' icons'); }
