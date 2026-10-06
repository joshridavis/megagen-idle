/** Button styles shared by Settings → Account and the top-bar ☁️ menu (1.68), so the two cannot drift apart. */
export const CLOUD_BUTTON = 'min-h-11 rounded px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-sky-400';
/** The main action: Save to cloud now, Sign in. */
export const CLOUD_PRIMARY = `${CLOUD_BUTTON} bg-sky-700 text-white hover:bg-sky-600`;
/** Secondary actions: Load cloud save, Sign out, Cancel. */
export const CLOUD_SECONDARY = `${CLOUD_BUTTON} bg-slate-600 hover:bg-slate-500`;
