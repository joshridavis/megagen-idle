/** Saves text as a file in the browser's downloads (save export, crash recovery). */
export function downloadText(filename: string, text: string, type = 'application/json'): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** File name for an exported save, dated: megagen-idle-save-2026-10-04.json. */
export const saveFileName = (what = 'save', now = new Date()) => `megagen-idle-${what}-${now.toISOString().slice(0, 10)}.json`;
