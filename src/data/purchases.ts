/**
 * The business model (1.95, CLAUDE.md): a free part, a one-time "Full Game"
 * unlock and a cosmetic "Supporter Pack". Never pay-to-win, no ads, no premium
 * currency. Prices come from each store, never from here.
 */
export type ProductId = 'full_game' | 'supporter_pack';

export interface ProductDef {
  id: ProductId;
  name: string;
  description: string;
}

export const PRODUCTS: ProductDef[] = [
  {
    id: 'full_game',
    name: 'Full Game',
    description: 'Unlocks all research past the free part, and with it every machine up to the micro supernova. One payment, yours for good.',
  },
  {
    id: 'supporter_pack',
    name: 'Supporter Pack',
    description: 'A thank-you for supporting the game: the Supporter title and accent color, and your thanks in the credits. Cosmetic only; it changes nothing in play.',
  },
];

export const PRODUCTS_BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p])) as Record<ProductId, ProductDef>;

/**
 * Where the free part ends (owner decision pending; this is the proposal in
 * BACKLOG.md 1.95): every research that needs research level 9 or lower is
 * free, which covers everything up to and including the Natural Gas Plant and
 * the Oil Rig; in the simulator the first research past it (Oil Refining) comes
 * at about 58 hours of play. Research that needs a higher level needs the Full
 * Game. Nothing already built or researched ever stops working.
 */
export const FREE_MAX_RESEARCH_LEVEL = 9;

/** The Supporter Pack's cosmetics (AAP-64 mint; at least 4.5:1 on the top bar, checked by a test). */
export const SUPPORTER_COLOR = '#a6fcdb';
export const SUPPORTER_ACCENT = { id: 'supporter', name: 'Supporter', color: SUPPORTER_COLOR } as const;
export const SUPPORTER_TITLE = { id: 'supporter', name: 'Supporter', color: SUPPORTER_COLOR } as const;
