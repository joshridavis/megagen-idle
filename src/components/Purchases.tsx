import { useEffect, useRef } from 'react';
import { sprites, type SpriteId } from '../assets';
import { edition } from '../data/edition';
import { FREE_MAX_RESEARCH_LEVEL, FULL_GAME_PREVIEW, PRODUCTS, type ProductId } from '../data/purchases';
import { platform, type PlatformName } from '../platform';
import { clearTestStore, TEST_STORE_SWITCH_KEY, testStoreOn } from '../platform/purchases';
import { KOFI_URL, LAUNCH_DATE_TEXT, STORES, type StorePage } from '../site/links';
import { useStore } from '../store';
import { atFreeBoundary, canBuyFullGame, hasFullGame } from '../utils/purchases';
import { useFocusTrap } from './useFocusTrap';

const owns = (e: { fullGame: boolean; supporter: boolean }, id: ProductId) => (id === 'full_game' ? e.fullGame : e.supporter);

function BuyButton({ id }: { id: ProductId }) {
  const entitlements = useStore((s) => s.entitlements);
  const products = useStore((s) => s.storeProducts);
  const busy = useStore((s) => s.purchaseBusy);
  const buy = useStore((s) => s.buyProduct);
  const def = PRODUCTS.find((p) => p.id === id)!;
  const price = products.find((p) => p.id === id)?.price;
  if (owns(entitlements, id)) {
    return (
      <span className="inline-flex min-h-11 items-center rounded bg-emerald-900/50 px-4 font-semibold text-emerald-200" data-testid={`owned-${id}`}>
        ✓ {def.name} owned
      </span>
    );
  }
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void buy(id)}
      className="min-h-11 rounded bg-aap-yellow px-4 font-semibold text-aap-ink hover:brightness-110 disabled:opacity-50"
      data-testid={`buy-${id}`}
    >
      Get the {def.name}
      {price ? ` · ${price}` : ''}
    </button>
  );
}

function RestoreButton() {
  const busy = useStore((s) => s.purchaseBusy);
  const restore = useStore((s) => s.restorePurchases);
  return (
    <button type="button" disabled={busy} onClick={() => void restore()} className="min-h-11 rounded bg-slate-700 px-4 hover:bg-slate-600 disabled:opacity-50" data-testid="restore-purchases">
      Restore purchases
    </button>
  );
}

function Message() {
  const message = useStore((s) => s.purchaseMessage);
  return message ? (
    <p className="text-sm text-slate-300" role="status" data-testid="purchase-message">
      {message}
    </p>
  ) : null;
}

/** The stores the Full Game is sold in, for this platform: the Steam page in the Steam demo, every store with a page on the web. */
export function fullGameStores(platformName: PlatformName = platform.name): StorePage[] {
  const stores = platformName === 'desktop' ? STORES.filter((s) => s.id === 'steam') : STORES;
  return stores.filter((s) => s.url);
}

/**
 * The "Get the Full Game" panel (2.04, docs/RELEASE_DECISIONS.md "Upsell"): what comes next, that
 * the save carries over, and how to get it in this edition. The demo links to the stores; the
 * mobile edition (and the development test store) buys in the game. Calm, never pushy: it opens by
 * itself at most once per session (store `offerFullGame`), and closes with ✕, Escape or a tap outside.
 */
export function FullGameDialog() {
  const open = useStore((s) => s.fullGameOpen);
  const close = useStore((s) => s.closeFullGame);
  const buyHere = useStore((s) => canBuyFullGame(s));
  const owned = useStore((s) => hasFullGame(s));
  const boxRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useFocusTrap(boxRef, open);
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [open, close]);
  if (!open) return null;
  const stores = fullGameStores();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={close}>
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="full-game-title"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-lg border border-aap-yellow/50 bg-slate-800 p-4 text-sm text-slate-200 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        data-testid="full-game-panel"
        data-edition={edition()}
      >
        <div className="mb-2 flex items-start gap-3">
          <h2 id="full-game-title" className="flex-1 text-lg font-semibold text-aap-yellow">
            {owned ? 'You have the Full Game' : 'Get the Full Game'}
          </h2>
          <button ref={closeRef} type="button" onClick={close} aria-label="Close" className="min-h-11 min-w-11 rounded hover:bg-slate-700">
            ✕
          </button>
        </div>
        <p className="mb-2">
          The free part goes up to research level {FREE_MAX_RESEARCH_LEVEL}. Everything you build keeps working, and your machines keep making energy while you are away. The
          Full Game adds:
        </p>
        <ul className="mb-3 space-y-2" data-testid="full-game-preview">
          {FULL_GAME_PREVIEW.map((p) => (
            <li key={p.name} className="flex items-center gap-3">
              <img src={sprites[p.sprite as SpriteId]} alt="" width={32} height={32} className="pixelated shrink-0" />
              <span>
                <strong className="text-slate-100">{p.name}.</strong> {p.text}.
              </span>
            </li>
          ))}
        </ul>
        <p className="mb-1 font-semibold text-slate-100">Your save carries over.</p>
        <p className="mb-3 text-slate-300">Buy once. No ads. No pay-to-win.</p>
        {buyHere ? (
          <div className="flex flex-wrap items-center gap-2" data-testid="full-game-buy">
            <BuyButton id="full_game" />
            <RestoreButton />
          </div>
        ) : stores.length > 0 ? (
          <div className="flex flex-wrap gap-2" data-testid="full-game-stores">
            {stores.map((st) => (
              <a
                key={st.id}
                href={st.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded bg-aap-yellow px-4 font-semibold text-aap-ink hover:brightness-110"
                data-testid={`full-game-store-${st.id}`}
              >
                {st.id === 'steam' ? 'Get it on Steam' : `Get it on ${st.name}`}
              </a>
            ))}
          </div>
        ) : (
          <p className="text-slate-300" data-testid="full-game-coming">
            Coming {LAUNCH_DATE_TEXT} to Steam, Google Play and the App Store.
          </p>
        )}
        <div className="mt-2">
          <Message />
        </div>
      </div>
    </div>
  );
}

/** The small "Full Game" button by the top bar (2.04): in the demo, and in the mobile edition until the Full Game is owned. */
export function FullGameButton({ compact = false }: { compact?: boolean }) {
  const show = useStore((s) => !hasFullGame(s) && (edition() !== 'full' || !!s.storeActive));
  const offer = useStore((s) => s.offerFullGame);
  if (!show) return null;
  // a round ⭐ like the cloud button on phones (it must fit beside the stat box), with its words from sm up
  return (
    <button
      type="button"
      onClick={() => offer('button')}
      aria-label="Get the Full Game"
      title="Get the Full Game"
      className={`flex h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-full border-2 border-aap-yellow/70 bg-slate-800/95 text-sm font-semibold text-aap-yellow shadow-lg shadow-black/40 hover:bg-slate-700 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${compact ? '' : 'sm:px-3'}`}
      data-testid="full-game-button"
    >
      <span aria-hidden="true">⭐</span>
      {!compact && <span className="hidden sm:inline">Full Game</span>}
    </button>
  );
}

/**
 * The end of the free part (1.95, slimmer since 2.04): one line above the research tree with a
 * button for the panel, which also opens by itself here once per session.
 */
export function FullGameBanner() {
  const show = useStore((s) => atFreeBoundary(s));
  const offer = useStore((s) => s.offerFullGame);
  useEffect(() => {
    if (show) offer('boundary');
  }, [show, offer]);
  if (!show) return null;
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-aap-yellow/40 bg-slate-800 p-3 text-sm text-slate-200" data-testid="full-game-banner">
      <span className="flex-1">You have reached the end of the free part. Everything you built keeps working.</span>
      <button type="button" onClick={() => offer('button')} className="min-h-11 rounded bg-aap-yellow px-4 font-semibold text-aap-ink hover:brightness-110">
        See the Full Game
      </button>
    </div>
  );
}

/** A locked card for a machine of the Full Game, in the demo's build list (2.04): its name and picture, and the panel on tap. */
export function FullGameLockedCard({ name, sprite, testId }: { name: string; sprite: SpriteId; testId: string }) {
  const offer = useStore((s) => s.offerFullGame);
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-aap-yellow/40 bg-slate-800/50 p-3" data-testid={testId}>
      <div className="flex items-center gap-3">
        <img src={sprites[sprite]} alt="" width={48} height={48} className="pixelated opacity-60 grayscale" />
        <div>
          <h3 className="font-semibold">{name}</h3>
          <div className="text-xs font-semibold text-aap-yellow">Full Game</div>
        </div>
      </div>
      <button type="button" onClick={() => offer('button')} className="mt-auto min-h-11 rounded bg-slate-700 px-3 py-2 font-semibold text-slate-100 hover:bg-slate-600">
        What is in the Full Game?
      </button>
    </div>
  );
}

/** "Support the developer" (2.04): a small Ko-fi link, in the web demo only (the web never sells the Full Game). */
export function SupportLink() {
  if (edition() !== 'demo' || platform.name !== 'web' || !KOFI_URL) return null;
  return (
    <p className="text-sm text-slate-300" data-testid="support-link">
      Enjoying the free part?{' '}
      <a href={KOFI_URL} target="_blank" rel="noopener noreferrer" className="text-sky-300 underline hover:text-sky-200">
        Support the developer on Ko-fi
      </a>
      .
    </p>
  );
}

/** Settings → Purchases (1.95): both products and restore. Shown only where a store exists. */
export function PurchasesSettings() {
  const active = useStore((s) => s.storeActive);
  if (!active) return null;
  return (
    <div className="panel text-sm text-slate-300" data-testid="purchases-settings">
      <h2 className="mb-2 panel-title">Purchases</h2>
      <ul className="mb-3 space-y-3">
        {PRODUCTS.map((p) => (
          <li key={p.id} className="flex flex-col gap-2">
            <span>
              <strong className="text-slate-100">{p.name}.</strong> {p.description}
            </span>
            <span>
              <BuyButton id={p.id} />
            </span>
          </li>
        ))}
      </ul>
      <RestoreButton />
      <div className="mt-2">
        <Message />
      </div>
    </div>
  );
}

/** Development builds only: switches the test store on or off (1.95). Never in a production build. */
export function TestStoreSwitch() {
  if (!import.meta.env.DEV) return null;
  const on = testStoreOn();
  const flip = (value: boolean) => {
    try {
      if (value) localStorage.setItem(TEST_STORE_SWITCH_KEY, 'on');
      else {
        localStorage.removeItem(TEST_STORE_SWITCH_KEY);
        clearTestStore(localStorage);
      }
    } catch {
      return;
    }
    window.location.reload();
  };
  return (
    <div className="rounded-lg border border-dashed border-slate-600 p-4 text-sm text-slate-300" data-testid="test-store-switch">
      <h2 className="mb-1 panel-title">Developer: test store</h2>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={on} onChange={(e) => flip(e.target.checked)} />
        Use the test store (purchases are free and stay in this browser; turning it off forgets them). Reloads the page.
      </label>
    </div>
  );
}
