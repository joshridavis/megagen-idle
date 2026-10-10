import { FREE_MAX_RESEARCH_LEVEL, PRODUCTS, type ProductId } from '../data/purchases';
import { clearTestStore, TEST_STORE_SWITCH_KEY, testStoreOn } from '../platform/purchases';
import { useStore } from '../store';
import { atFreeBoundary } from '../utils/purchases';

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

/**
 * The end of the free part (1.95): a calm note above the research tree, never
 * a pop-up. Everything built keeps working and offline gains go on.
 */
export function FullGamePanel() {
  const show = useStore((s) => atFreeBoundary(s));
  if (!show) return null;
  return (
    <div className="mb-3 rounded-lg border border-aap-yellow/40 bg-slate-800 p-4 text-sm text-slate-200" data-testid="full-game-panel">
      <h3 className="mb-1 font-semibold text-aap-yellow">You have reached the end of the free part</h3>
      <p className="mb-1">
        Everything you have built keeps working, and your machines keep making energy while you are away. You can keep growing with all the research up to level{' '}
        {FREE_MAX_RESEARCH_LEVEL}.
      </p>
      <p className="mb-3">
        The <strong>Full Game</strong> opens the research after that: oil, nuclear fission, fusion and the micro supernova. It is one payment. There are no ads and nothing else to buy for play.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <BuyButton id="full_game" />
        <RestoreButton />
      </div>
      <div className="mt-2">
        <Message />
      </div>
    </div>
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
