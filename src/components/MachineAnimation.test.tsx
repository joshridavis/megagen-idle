import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { sprites } from '../assets';
import generic from '../assets/generic-assets.json';
import manifest from '../assets/sprite-manifest.json';
import { GENERATOR_ANIMATIONS, PRODUCER_ANIMATIONS } from '../data/machineAnimations';
import { createInitialState } from '../data/initialState';
import { PRODUCER_IDS } from '../data/producers';
import { useStore } from '../store';
import { GeneratorType, type Generator } from '../types/generator';
import { animationOffset, isMachineWorking } from '../utils/machineAnimation';
import { deriveRates } from '../utils/simulation';
import MapPanel from './MapPanel';

afterEach(cleanup);

const gen = (id: string, type: GeneratorType, extra: Partial<Generator> = {}): Generator => ({ id, type, isActive: true, level: 1, ...extra });
const setup = (generators: Generator[], extra: Record<string, unknown> = {}) =>
  useStore.setState(
    deriveRates({
      ...createInitialState(0),
      roomCapacity: 80,
      activeGenerators: generators,
      ...extra,
    }),
  );
const spriteOf = (key: string) => screen.getByTestId(`map-${key}`).querySelector('[data-testid="machine-sprite"]') as HTMLElement;

describe('working machines animate on the map (1.71)', () => {
  it('every generator and producer type has an animation or effect', () => {
    for (const t of Object.values(GeneratorType)) {
      const a = GENERATOR_ANIMATIONS[t];
      expect(a, t).toBeTruthy();
      expect(!!a.frame2 || !!a.effect, t).toBe(true);
      expect(a.period).toBeGreaterThan(0);
    }
    for (const id of PRODUCER_IDS) {
      const a = PRODUCER_ANIMATIONS[id];
      expect(!!a.frame2 || !!a.effect, id).toBe(true);
    }
  });

  it('the new frames are generic sprites listed in generic-assets.json', () => {
    const frames = [...Object.values(GENERATOR_ANIMATIONS), ...Object.values(PRODUCER_ANIMATIONS)].flatMap((a) => (a.frame2 ? [a.frame2] : []));
    expect(frames.length).toBeGreaterThanOrEqual(2);
    const files = manifest as Record<string, { file: string }>;
    for (const f of frames) {
      expect(sprites[f], f).toBeTruthy();
      expect(generic.generic, f).toContain(`sprites/${files[f].file}`);
    }
  });

  it('a generator works when switched on; out of fuel or off it does not; producers always work', () => {
    const gens = [gen('a', GeneratorType.COAL), gen('b', GeneratorType.COAL, { isActive: false, outOfFuel: true }), gen('c', GeneratorType.SOLAR, { isActive: false })];
    expect(isMachineWorking({ kind: 'generator', id: 'a' }, gens)).toBe(true);
    expect(isMachineWorking({ kind: 'generator', id: 'b' }, gens)).toBe(false);
    expect(isMachineWorking({ kind: 'generator', id: 'c' }, gens)).toBe(false);
    expect(isMachineWorking({ kind: 'producer', id: 'quarry' }, gens)).toBe(true);
  });

  it('machines of one type start at different points of their cycle', () => {
    const offsets = ['gen-1', 'gen-2', 'gen-3', 'gen-4'].map((k) => animationOffset(k, 2));
    expect(new Set(offsets).size).toBe(4);
    for (const o of offsets) expect(o).toBeLessThanOrEqual(0), expect(o).toBeGreaterThan(-2);
    expect(animationOffset('gen-1', 2)).toBe(offsets[0]);
  });

  it('a working machine is drawn animated; an off or out-of-fuel one is still', () => {
    setup([gen('w', GeneratorType.WIND), gen('s', GeneratorType.SOLAR, { isActive: false }), gen('c', GeneratorType.COAL, { isActive: false, outOfFuel: true }), gen('k', GeneratorType.COAL)]);
    render(<MapPanel onSelect={() => {}} />);
    const wind = spriteOf('w');
    expect(wind.dataset.anim).toBe('on');
    expect(wind.querySelector('.frame-b')?.getAttribute('data-frame2')).toBe('wind_turbine_2');
    expect(spriteOf('k').querySelector('[data-fx="smoke"]')).toBeTruthy();
    for (const k of ['s', 'c']) {
      expect(spriteOf(k).dataset.anim).toBe('still');
      expect(spriteOf(k).querySelector('.frame-a, .frame-b, svg, .machine-shake')).toBeNull();
    }
    // producers work: the quarry shakes
    cleanup();
    setup([], { producers: { ...createInitialState(0).producers, quarry: 1 } });
    render(<MapPanel onSelect={() => {}} />);
    expect(spriteOf('quarry-1').querySelector('.machine-shake')).toBeTruthy();
  });

  it('switching a machine off stops it at once, and on starts it again', () => {
    setup([gen('w', GeneratorType.WIND)]);
    render(<MapPanel onSelect={() => {}} />);
    expect(spriteOf('w').dataset.anim).toBe('on');
    act(() => {
      useStore.getState().toggleGenerator('w');
    });
    expect(spriteOf('w').dataset.anim).toBe('still');
    expect(spriteOf('w').querySelector('.frame-b')).toBeNull();
    act(() => {
      useStore.getState().toggleGenerator('w');
    });
    expect(spriteOf('w').dataset.anim).toBe('on');
  });

  it('Reduce motion keeps working machines still, on their first frame', () => {
    setup([gen('w', GeneratorType.WIND), gen('n', GeneratorType.NUCLEAR)]);
    useStore.getState().setReduceMotion(true);
    render(<MapPanel onSelect={() => {}} />);
    for (const k of ['w', 'n']) {
      expect(spriteOf(k).dataset.anim).toBe('still');
      expect(spriteOf(k).querySelectorAll('img')).toHaveLength(1);
      expect(spriteOf(k).querySelector('svg')).toBeNull();
    }
    expect(spriteOf('w').querySelector('img')!.getAttribute('src')).toBe(sprites.wind_turbine);
    useStore.getState().setReduceMotion(false);
  });
});
