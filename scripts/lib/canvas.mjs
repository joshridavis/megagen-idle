import { PNG } from 'pngjs';
import { hexToRgba } from './palette.mjs';

/** Minimal pixel canvas for drawing deterministic pixel-art stand-ins. */
export class Canvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }

  set(x, y, hex, alpha = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const [r, g, b, a] = hexToRgba(hex, alpha);
    const i = (y * this.width + x) * 4;
    this.data[i] = r;
    this.data[i + 1] = g;
    this.data[i + 2] = b;
    this.data[i + 3] = a;
  }

  alphaAt(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return 0;
    return this.data[(y * this.width + x) * 4 + 3];
  }

  rect(x, y, w, h, hex, alpha = 255) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, hex, alpha);
  }

  /** Rectangle with a 1px border. */
  box(x, y, w, h, fill, border) {
    this.rect(x, y, w, h, border);
    this.rect(x + 1, y + 1, w - 2, h - 2, fill);
  }

  line(x0, y0, x1, y1, hex, alpha = 255) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let s = 0; s <= steps; s++) {
      this.set(x0 + ((x1 - x0) * s) / steps, y0 + ((y1 - y0) * s) / steps, hex, alpha);
    }
  }

  /** Fill a polygon by testing pixel centers. points: [[x,y],...] */
  polygon(points, hex, alpha = 255) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (pointInPolygon(x + 0.5, y + 0.5, points)) this.set(x, y, hex, alpha);
      }
    }
  }

  circle(cx, cy, r, hex, alpha = 255) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        if (dx * dx + dy * dy <= r * r) this.set(x, y, hex, alpha);
      }
    }
  }

  /** Draw a 1px outline around every opaque pixel, on transparent neighbours. */
  outline(hex) {
    const marks = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.alphaAt(x, y) !== 0) continue;
        const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => this.alphaAt(x + dx, y + dy) > 0);
        if (near) marks.push([x, y]);
      }
    }
    for (const [x, y] of marks) this.set(x, y, hex);
  }

  toPNG() {
    const png = new PNG({ width: this.width, height: this.height });
    png.data = Buffer.from(this.data);
    return PNG.sync.write(png, { colorType: 6 });
  }
}

function pointInPolygon(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
