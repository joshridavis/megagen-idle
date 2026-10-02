import { GENERATORS } from '../data/generators';
import { ZONES } from '../data/map';
import { PRODUCERS } from '../data/producers';
import { zoneFor } from '../utils/mapTerrain';

/** Why a machine gets a placement bonus, for the ⭐ and 📍 tooltips (1.14). */
export function zoneTipText(type: string, bonus: number): string {
  const zone = zoneFor(type);
  const name = (GENERATORS as Record<string, { name: string } | undefined>)[type]?.name ?? (PRODUCERS as Record<string, { name: string } | undefined>)[type]?.name ?? 'machine';
  const pct = `+${Math.round(bonus * 100)}%`;
  if (!zone) return `${pct} from where it stands on the map.`;
  return `${ZONES[zone].name}: ${pct} output, because the whole ${name} stands on it.`;
}
