import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { GENERATOR_ANIMATIONS } from '../data/machineAnimations';
import MachineSprite, { GROUND_SHADOW_OPACITY } from './MachineSprite';

afterEach(cleanup);

describe('a ground shadow under every machine on the map (1.99)', () => {
  it('draws a dark ellipse under the base, behind the picture, spilling past full-size sprites', () => {
    const { container } = render(<MachineSprite sprite="hydro_dam" anim={GENERATOR_ANIMATIONS.hydro} animate={false} offset={0} />);
    const shadow = container.querySelector('[data-testid="ground-shadow"]') as SVGElement;
    expect(shadow).not.toBeNull();
    expect(shadow.getAttribute('class')).toContain('overflow-visible');
    // behind the sprite: the first child of the sprite box
    expect(container.querySelector('[data-testid="machine-sprite"]')!.firstElementChild).toBe(shadow);
    const e = shadow.querySelector('ellipse')!;
    expect(Number(e.getAttribute('opacity'))).toBe(GROUND_SHADOW_OPACITY);
    expect(GROUND_SHADOW_OPACITY).toBe(0.45); // 2.03: a quarter lighter than 0.6
    // the Hydro Dam fills its 80x64 picture: the ellipse reaches below it
    expect(Number(e.getAttribute('cy')) + Number(e.getAttribute('ry'))).toBeGreaterThan(64);
    // lit from the top left: it falls a little right of center
    expect(Number(e.getAttribute('cx'))).toBeGreaterThan(40);
  });

  it('stays the same whether the machine animates or not', () => {
    const { container } = render(<MachineSprite sprite="coal_plant" anim={GENERATOR_ANIMATIONS.coal} animate offset={0} />);
    expect(container.querySelectorAll('[data-testid="ground-shadow"]')).toHaveLength(1);
  });
});
