import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScrapButton } from './Scrap';
import FloatingTip from './FloatingTip';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** Places the pinned bar (bottom at 90 px) and every other element at `anchorTop`. */
function layout(anchorTop: number) {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const bar = this.getAttribute('data-testid') === 'top-bar';
    const top = bar ? 10 : anchorTop;
    const height = bar ? 80 : 40;
    return { top, bottom: top + height, left: 0, right: 100, width: 100, height, x: 0, y: top, toJSON: () => ({}) } as DOMRect;
  });
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(60);
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div data-testid="top-bar" />
      {children}
    </>
  );
}

describe('tooltips keep clear of the pinned top bar (playtest 20 bug)', () => {
  it('a hover tooltip opens above when there is room under the bar', () => {
    layout(400);
    render(<Page><ScrapButton id="g1" name="Coal Plant #1" what="generator" onClick={() => {}} /></Page>);
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Scrap Coal Plant #1' }).parentElement!);
    expect(screen.getByRole('tooltip', { hidden: true }).dataset.side).toBe('above');
  });

  it('it opens below when it would reach the bar', () => {
    layout(120); // 120 - 60 - 8 < 90 + 8
    render(<Page><ScrapButton id="g1" name="Coal Plant #1" what="generator" onClick={() => {}} /></Page>);
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Scrap Coal Plant #1' }).parentElement!);
    const tip = screen.getByRole('tooltip', { hidden: true });
    expect(tip.dataset.side).toBe('below');
    expect(tip.className).toContain('top-full');
  });

  it('a floating tip goes below its anchor instead of over the bar', () => {
    layout(120);
    render(<Page><FloatingTip text="Help" testId="pin">📍</FloatingTip></Page>);
    fireEvent.mouseEnter(screen.getByTestId('pin'));
    expect(parseFloat(screen.getByRole('tooltip').style.top)).toBe(120 + 40 + 8);
  });
});
