import type { CSSProperties } from 'react';
import { sprites, type SpriteId } from '../assets';
import manifest from '../assets/sprite-manifest.json';
import { PUFF_LIGHT, type MachineAnimation } from '../data/machineAnimations';

const SIZE = manifest as Record<string, { width: number; height: number }>;

/**
 * A machine's picture on the map (1.71). Working, it moves: a second frame swaps with
 * the still sprite and/or a CSS effect plays on top (smoke, steam, a glint, a glow,
 * bubbles). Stopped, switched off or with Reduce motion on, it is completely
 * still. Never upscaled past the sprite's own size, as before.
 */
export default function MachineSprite({
  sprite,
  anim,
  animate,
  offset,
}: {
  sprite: SpriteId;
  anim: MachineAnimation;
  /** Working and motion allowed. */
  animate: boolean;
  /** Start offset in seconds (negative), so machines of one type do not move in lockstep. */
  offset: number;
}) {
  const { width, height } = SIZE[sprite];
  const timing = { ['--frame' as string]: `${anim.period}s`, ['--fx' as string]: `${anim.period}s`, animationDelay: `${offset}s` } as CSSProperties;
  const img = 'pixelated pointer-events-none absolute inset-0 h-full w-full object-contain';
  return (
    <span className="pointer-events-none flex h-full w-full items-center justify-center p-0.5">
      <span
        className="relative block h-full w-full"
        style={{ maxWidth: width, maxHeight: height }}
        data-anim={animate ? 'on' : 'still'}
        data-testid="machine-sprite"
      >
        <GroundShadow width={width} height={height} />
        {animate && anim.frame2 ? (
          <>
            <img src={sprites[sprite]} alt="" className={`${img} frame-a`} style={timing} />
            <img src={sprites[anim.frame2]} alt="" className={`${img} frame-b`} style={timing} data-frame2={anim.frame2} />
          </>
        ) : (
          <img src={sprites[sprite]} alt="" className={img} />
        )}
        {animate && anim.effect && <Effect sprite={sprite} anim={anim} timing={timing} width={width} height={height} />}
      </span>
    </span>
  );
}

/**
 * A flat dark ellipse under the machine's base (1.99), lit from the top left, so it
 * falls a little right. Drawn in the sprite's own pixels like the effect layer and
 * allowed to spill past the picture, so machines that fill their whole sprite
 * (Hydro Dam, Tidal Station) still show one. Never animated.
 */
/** 2.03 (playtest 31): a quarter lighter than the first 0.6. */
export const GROUND_SHADOW_OPACITY = 0.45;

function GroundShadow({ width, height }: { width: number; height: number }) {
  const rx = width * 0.46;
  const ry = Math.max(3, height * 0.12);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      aria-hidden="true"
      data-testid="ground-shadow"
    >
      <ellipse cx={width / 2 + width * 0.04} cy={height - ry * 0.1} rx={rx} ry={ry} fill="#000000" opacity={GROUND_SHADOW_OPACITY} />
    </svg>
  );
}

/** The effect layer: an SVG in the sprite's own pixels, laid over the image exactly as object-contain draws it. */
function Effect({ sprite, anim, timing, width, height }: { sprite: SpriteId; anim: MachineAnimation; timing: CSSProperties; width: number; height: number }) {
  const at = anim.at ?? { x: 50, y: 50 };
  const x = (at.x / 100) * width;
  const y = (at.y / 100) * height;
  const id = `fx-${sprite}`;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      aria-hidden="true"
      data-fx={anim.effect}
    >
      {anim.effect === 'glint' && (
        <>
          <defs>
            {/* the glint only shows on the machine itself, not the air around it */}
            <mask id={`${id}-mask`} style={{ maskType: 'alpha' }}>
              <image href={sprites[sprite]} width={width} height={height} />
            </mask>
            <linearGradient id={`${id}-band`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g mask={`url(#${id}-mask)`}>
            <rect className="machine-glint" x={-width * 0.4} y={-height * 0.2} width={width * 0.36} height={height * 1.4} fill={`url(#${id}-band)`} transform="skewX(-20)" style={timing} />
          </g>
        </>
      )}
      {(anim.effect === 'smoke' || anim.effect === 'steam') &&
        [0, 1, 2].map((i) => (
          <circle
            key={i}
            className="machine-puff"
            cx={x}
            cy={y}
            r={anim.puff?.r ?? (anim.effect === 'steam' ? 5 : 3)}
            fill={anim.puff?.color ?? (anim.effect === 'steam' ? '#ffffff' : PUFF_LIGHT)}
            style={{ ...timing, animationDelay: `${Number.parseFloat(String(timing.animationDelay)) - (i * anim.period) / 3}s` }}
          />
        ))}
      {anim.effect === 'bubbles' &&
        [0, 1, 2].map((i) => (
          <circle
            key={i}
            className="machine-bubble"
            cx={x + (i - 1) * 3}
            cy={y}
            r={1.5}
            fill="#a6fcdb"
            style={{ ...timing, animationDelay: `${Number.parseFloat(String(timing.animationDelay)) - (i * anim.period) / 3}s` }}
          />
        ))}
      {anim.effect === 'glow' && (
        <>
          <defs>
            <radialGradient id={`${id}-glow`}>
              <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="0.5" stopColor="#ffd541" stopOpacity="0.45" />
              <stop offset="1" stopColor="#ffd541" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle className="machine-glow" cx={x} cy={y} r={Math.min(width, height) * 0.3} fill={`url(#${id}-glow)`} style={timing} />
        </>
      )}
    </svg>
  );
}
