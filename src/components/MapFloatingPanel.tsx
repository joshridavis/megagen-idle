import { useEffect, useRef, type ReactNode } from 'react';

/**
 * A panel floating over the map (1.47, 1.64, 1.65): docked bottom right on wide screens, a bottom sheet on
 * phones, never taller than the space under the pinned top bar. Not modal, so the map stays usable.
 * Focus moves into it when it opens.
 */
export default function MapFloatingPanel({
  id,
  title,
  subtitle,
  closeLabel,
  closeTestId,
  testId,
  wide = false,
  onClose,
  children,
}: {
  id: string;
  title: ReactNode;
  subtitle?: ReactNode;
  closeLabel: string;
  closeTestId: string;
  testId: string;
  /** A wider panel on computers (the legend). */
  wide?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    box.current?.focus();
  }, []);
  return (
    <div
      ref={box}
      id={id}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-title`}
      tabIndex={-1}
      className={`fixed inset-x-0 bottom-0 z-[44] max-h-[45vh] overflow-y-auto rounded-t-xl border border-slate-600 bg-slate-800/95 p-3 text-sm shadow-2xl shadow-black/60 backdrop-blur focus-visible:outline-2 focus-visible:outline-sky-400 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-h-[calc(100vh-10rem)] sm:rounded-xl ${wide ? 'sm:w-[30rem]' : 'sm:w-96'}`}
      data-testid={testId}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 id={`${id}-title`} className="font-semibold">
            {title}
          </h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          data-testid={closeTestId}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-lg hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-sky-400"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  );
}
