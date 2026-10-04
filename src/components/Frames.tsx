import { sprites, type SpriteId } from '../assets';

/**
 * Two sprite frames that swap for wing flaps and flames (playtest 19).
 * `still` shows only the first frame (Reduce motion).
 */
export default function Frames({ a, b, still, period, delay }: { a: SpriteId; b: SpriteId; still: boolean; period: string; delay?: string }) {
  if (still) return <img src={sprites[a]} alt="" className="pixelated h-full w-full" />;
  return (
    <span className="relative block h-full w-full" style={{ ['--frame' as string]: period }}>
      <img src={sprites[a]} alt="" className="pixelated frame-a absolute inset-0 h-full w-full" style={{ animationDelay: delay }} />
      <img src={sprites[b]} alt="" className="pixelated frame-b absolute inset-0 h-full w-full" style={{ animationDelay: delay }} />
    </span>
  );
}
