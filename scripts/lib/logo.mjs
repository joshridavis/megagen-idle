// The MegaGen Idle wordmark: a bold pixel font in electric yellow with a bevel,
// a dark outline and a drop shadow, in AAP-64 colors. Shared by the store images
// (generate-brand.mjs, item 1.52) and the in-game logo sprites
// (generate-generic-assets.mjs, item 1.50), so both always look the same.
import { Canvas } from './canvas.mjs';
import { C } from './palette.mjs';

// Bold pixel font: caps 7 rows, lowercase x-height 5 (rows 2-6), descender rows 7-8.
export const GLYPHS = {
  M: ['XX...XX', 'XXX.XXX', 'XXXXXXX', 'XX.X.XX', 'XX.X.XX', 'XX...XX', 'XX...XX'],
  G: ['.XXXXX', 'XX..XX', 'XX....', 'XX.XXX', 'XX..XX', 'XX..XX', '.XXXXX'],
  I: ['XXXX', '.XX.', '.XX.', '.XX.', '.XX.', '.XX.', 'XXXX'],
  e: ['......', '......', '.XXXX.', 'XX..XX', 'XXXXXX', 'XX....', '.XXXX.'],
  g: ['......', '......', '.XXXXX', 'XX..XX', 'XX..XX', 'XX..XX', '.XXXXX', '....XX', '.XXXX.'],
  a: ['......', '......', '.XXXX.', '....XX', '.XXXXX', 'XX..XX', '.XXXXX'],
  n: ['......', '......', 'XXXXX.', 'XX..XX', 'XX..XX', 'XX..XX', 'XX..XX'],
  d: ['....XX', '....XX', '.XXXXX', 'XX..XX', 'XX..XX', 'XX..XX', '.XXXXX'],
  l: ['XX', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
  bolt: ['....XXX', '...XXX.', '..XXX..', '.XXXXXX', 'XXXXXX.', '...XXX.', '..XXX..', '..XX...', '.XX....'],
};

export const LINE_1 = ['M', 'e', 'g', 'a', 'G', 'e', 'n'];
export const LINE_2 = ['I', 'd', 'l', 'e', 'bolt'];

/** Lay out a line of glyphs; returns filled font cells. */
export function layoutLine(names, gap = 1) {
  const cells = [];
  let x = 0;
  names.forEach((n, i) => {
    if (i > 0) x += n === 'bolt' ? gap + 1 : gap;
    const g = GLYPHS[n];
    const dy = n === 'bolt' ? -1 : 0; // the bolt rises one row into the line gap
    g.forEach((row, y) => [...row].forEach((ch, dx) => ch === 'X' && cells.push([x + dx, y + dy])));
    x += g[0].length;
  });
  return { cells, width: x, height: Math.max(...cells.map(([, y]) => y)) + 1 };
}

/**
 * Draws lines of glyphs on a transparent canvas of `width`×`height`, inside a
 * one-pixel outline. Each line is `{ names, unit, x, y, shadeRows }`: `unit` is
 * image pixels per font pixel, (x, y) the top left of the line's font row 0 in
 * image pixels (inside the outline), and `shadeRows` the font rows the two-tone
 * fill spreads over.
 */
export function drawWordmark(width, height, lines) {
  const pad = 1; // outline
  const owner = new Map(); // image pixel -> index of the line that fills it
  lines.forEach((line, i) => {
    const { cells } = layoutLine(line.names);
    cells.forEach(([cx, cy]) => {
      for (let py = 0; py < line.unit; py++) {
        for (let px = 0; px < line.unit; px++) {
          owner.set(`${pad + line.x + cx * line.unit + px},${pad + line.y + cy * line.unit + py}`, i);
        }
      }
    });
  });
  const c = new Canvas(width, height);
  const isFill = (x, y) => owner.has(`${x},${y}`);
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (!isFill(x, y)) continue;
      // Two-tone fill per line, with a light top edge and an amber bottom edge.
      // Rows belong to the lowest line starting at or above them (a bolt rising
      // into the gap shades with the line above, as the store logo always has).
      const line = lines.reduce((best, l) => (pad + l.y <= y && (!best || l.y > best.y) ? l : best), null) ?? lines[owner.get(`${x},${y}`)];
      const top = pad + line.y;
      const mid = top + line.shadeRows * line.unit * 0.45;
      let color = y < mid ? C.lemon : C.yellow;
      if (!isFill(x, y - 1)) color = C.cream;
      else if (!isFill(x, y + 1)) color = C.amber;
      c.set(x, y, color);
    }
  }
  c.outline(C.ink);
  // Narrow gaps between strokes (the inside of M, the counter of G) fill with ink too.
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (c.alphaAt(x, y) > 0) continue;
      const h = c.alphaAt(x - 1, y) > 0 && c.alphaAt(x + 1, y) > 0;
      const v = c.alphaAt(x, y - 1) > 0 && c.alphaAt(x, y + 1) > 0;
      if (h || v) c.set(x, y, C.ink);
    }
  }
  // Corner pixels of the outline, so the letters read as solid chunky blocks.
  const corners = [];
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (c.alphaAt(x, y) > 0) continue;
      if ([[1, 1], [-1, 1], [1, -1], [-1, -1]].some(([dx, dy]) => isFill(x + dx, y + dy))) corners.push([x, y]);
    }
  }
  corners.forEach(([x, y]) => c.set(x, y, C.ink));
  // Drop shadow: one pixel down and right of the outline.
  const shadow = [];
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (c.alphaAt(x, y) === 0 && c.alphaAt(x - 1, y - 1) > 0) shadow.push([x, y]);
    }
  }
  shadow.forEach(([x, y]) => c.set(x, y, '3b1725'));
  return c;
}

/**
 * The store wordmark at one logo pixel per image pixel: "MegaGen" over "Idle"
 * and a small bolt, both centered. Tight bounds; scale it up for the stores.
 */
export function drawStoreLogo() {
  const UNIT = 3;
  const line1 = layoutLine(LINE_1);
  const line2 = layoutLine(LINE_2);
  const gridW = Math.max(line1.width, line2.width);
  const line2Y = 10; // one empty font row under the "g" descender
  return drawWordmark(gridW * UNIT + 3, (line2Y + line2.height) * UNIT + 3, [
    { names: LINE_1, unit: UNIT, x: Math.floor((gridW - line1.width) / 2) * UNIT, y: 0, shadeRows: 9 },
    { names: LINE_2, unit: UNIT, x: Math.floor((gridW - line2.width) / 2) * UNIT, y: line2Y * UNIT, shadeRows: 7 },
  ]);
}
