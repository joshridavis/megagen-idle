import { describe, expect, it } from 'vitest';
// @ts-expect-error: a plain JS module
import { drawSprite, GROUND_SHADOW_ALPHA, groundShadowOffset, withShadow } from '../../scripts/generate-generic-assets.mjs';
// @ts-expect-error: a plain JS module
import { Canvas } from '../../scripts/lib/canvas.mjs';
// @ts-expect-error: a plain JS module
import { C } from '../../scripts/lib/palette.mjs';

type Px = [number, number, number, number];
type Sprite = { width: number; height: number; getRGBA: (x: number, y: number) => Px; alphaAt: (x: number, y: number) => number };

const INK = [0x14, 0x10, 0x13];

/** Pixels that are only shadow: the ink color at the shadow alpha. */
const shadowPixels = (c: Sprite, alpha: number) => {
  let n = 0;
  for (let y = 0; y < c.height; y++)
    for (let x = 0; x < c.width; x++) {
      const [r, g, b, a] = c.getRGBA(x, y);
      if (a === alpha && r === INK[0] && g === INK[1] && b === INK[2]) n++;
    }
  return n;
};

describe('sprite shadows are visible at map size (1.99)', () => {
  it('a ground shadow is about 45% ink (2.03), 4 px on 48 px and larger sprites, 2 px on 16 px ones', () => {
    expect(GROUND_SHADOW_ALPHA).toBe(115);
    expect(GROUND_SHADOW_ALPHA / 255).toBeGreaterThanOrEqual(0.4);
    expect(GROUND_SHADOW_ALPHA / 255).toBeLessThanOrEqual(0.5);
    expect(groundShadowOffset(64)).toBe(4);
    expect(groundShadowOffset(48)).toBe(4);
    expect(groundShadowOffset(16)).toBe(2);
  });

  it('a lone opaque pixel casts its shadow at the new offset and alpha', () => {
    const src = new Canvas(48, 48);
    src.set(10, 10, C.white);
    const c = withShadow(src, groundShadowOffset(48), GROUND_SHADOW_ALPHA) as Sprite;
    expect(c.getRGBA(14, 14)).toEqual([...INK, GROUND_SHADOW_ALPHA]);
    expect(c.alphaAt(12, 12)).toBe(0);
    expect(c.alphaAt(10, 10)).toBe(255);
  });

  it('generators, producers and standing details carry the stronger shadow', () => {
    for (const id of ['wind_turbine', 'coal_plant', 'solar_panel', 'producer_quarry', 'producer_coal_mine', 'deco_rock', 'decor_tree']) {
      const c = drawSprite(id) as Sprite;
      expect(shadowPixels(c, GROUND_SHADOW_ALPHA), id).toBeGreaterThan(c.width / 2);
    }
    // the wind turbine's mast casts its shadow 4 px right of itself
    const wind = drawSprite('wind_turbine') as Sprite;
    let found = false;
    for (let y = 30; y < 60 && !found; y++)
      for (let x = 0; x + 4 < wind.width; x++)
        if (wind.alphaAt(x, y) === 255 && wind.alphaAt(x + 1, y) === 0 && wind.getRGBA(x + 4, y + 4)[3] === GROUND_SHADOW_ALPHA) found = true;
    expect(found).toBe(true);
  });

  it('things in the air have no shadow baked in (2.02: the map draws it far below them); flat things have none', () => {
    for (const id of ['map_bird_1', 'map_bird_2', 'map_star']) {
      const c = drawSprite(id) as Sprite;
      let translucent = 0;
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (c.alphaAt(x, y) > 0 && c.alphaAt(x, y) < 255) translucent++;
      expect(translucent, id).toBe(0);
    }
    expect(shadowPixels(drawSprite('deco_lily') as Sprite, GROUND_SHADOW_ALPHA)).toBe(0);
    expect(shadowPixels(drawSprite('tile_ground') as Sprite, GROUND_SHADOW_ALPHA)).toBe(0);
  });
});
