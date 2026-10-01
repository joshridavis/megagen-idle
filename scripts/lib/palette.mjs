// AAP-64 palette (Adigun A. Polack), https://lospec.com/palette-list/aap-64
export const AAP64 = [
  '060608', '141013', '3b1725', '73172d', 'b4202a', 'df3e23', 'fa6a0a', 'f9a31b',
  'ffd541', 'fffc40', 'd6f264', '9cdb43', '59c135', '14a02e', '1a7a3e', '24523b',
  '122020', '143464', '285cc4', '249fde', '20d6c7', 'a6fcdb', 'ffffff', 'fef3c0',
  'fad6b8', 'f5a097', 'e86a73', 'bc4a9b', '793a80', '403353', '242234', '221c1a',
  '322b28', '71413b', 'bb7547', 'dba463', 'f4d29c', 'dae0ea', 'b3b9d1', '8b93af',
  '6d758d', '4a5462', '333941', '422433', '5b3138', '8e5252', 'ba756a', 'e9b5a3',
  'e3e6ff', 'b9bffb', '849be4', '588dbe', '477d85', '23674e', '328464', '5daf8d',
  '92dcba', 'cdf7e2', 'e4d2aa', 'c7b08b', 'a08662', '796755', '5a4e44', '423934',
];

/** Named picks from AAP-64 used by the sprite scripts. */
export const C = {
  black: '060608',
  ink: '141013',
  darkRed: '73172d',
  red: 'b4202a',
  orange: 'fa6a0a',
  amber: 'f9a31b',
  yellow: 'ffd541',
  lemon: 'fffc40',
  lime: '9cdb43',
  green: '59c135',
  darkGreen: '1a7a3e',
  forest: '24523b',
  navy: '143464',
  blue: '285cc4',
  sky: '249fde',
  cyan: '20d6c7',
  mint: 'a6fcdb',
  white: 'ffffff',
  cream: 'fef3c0',
  grey1: 'dae0ea',
  grey2: 'b3b9d1',
  grey3: '8b93af',
  grey4: '6d758d',
  grey5: '4a5462',
  grey6: '333941',
  brown1: 'f4d29c',
  brown2: 'dba463',
  brown3: 'bb7547',
  brown4: '71413b',
  brown5: '322b28',
  sand: 'e4d2aa',
  khaki: 'a08662',
  mud: '5a4e44',
  purple: '793a80',
  plum: '403353',
  teal: '477d85',
  steel: '588dbe',
};

export function hexToRgba(hex, alpha = 255) {
  if (!AAP64.includes(hex)) throw new Error(`Color ${hex} is not in AAP-64`);
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16), alpha];
}

const RGB = AAP64.map((h) => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]);

/** Nearest AAP-64 colour to an arbitrary RGB triple. */
export function nearestPaletteRgb([r, g, b]) {
  let best = RGB[0];
  let bestD = Infinity;
  for (const c of RGB) {
    const d = (c[0] - r) ** 2 + (c[1] - g) ** 2 + (c[2] - b) ** 2;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}
