export const APP_VERSION = __APP_VERSION__;

export default function VersionFooter() {
  return (
    <footer className="mt-auto pt-6 text-center text-[11px] text-slate-500" data-testid="version">
      MegaGen Idle v{APP_VERSION}
      {__APP_COMMIT__ && <span title="Build commit"> · {__APP_COMMIT__}</span>}
    </footer>
  );
}
