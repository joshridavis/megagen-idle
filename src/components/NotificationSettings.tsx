import { useState } from 'react';
import { DEFAULT_NOTIFY, MAX_PER_HOUR, NOTIFY_LABELS, type NotifyType } from '../data/notifyRules';
import { platform } from '../platform';
import { useStore } from '../store';

const TYPES = Object.keys(NOTIFY_LABELS) as NotifyType[];

/**
 * Settings → Notifications (1.07): off by default. Turning it on asks the
 * browser for permission at that moment, never on load.
 */
export default function NotificationSettings() {
  const notify = useStore((s) => s.settings.notifications) ?? DEFAULT_NOTIFY;
  const setNotifications = useStore((s) => s.setNotifications);
  const [problem, setProblem] = useState<string | null>(null);
  const supported = platform.notifyPermission() !== 'unsupported';

  const toggle = async (on: boolean) => {
    setProblem(null);
    if (!on) return setNotifications({ enabled: false });
    const ok = platform.notifyPermission() === 'granted' || (await platform.requestNotifyPermission());
    if (ok) setNotifications({ enabled: true });
    else setProblem('The browser did not allow notifications. You can allow them in its site settings, then try again.');
  };

  return (
    <div className="panel" data-testid="notification-settings">
      <h2 className="mb-2 panel-title">Notifications</h2>
      {!supported ? (
        <p className="text-sm text-slate-400">This browser cannot show notifications.</p>
      ) : (
        <>
          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={notify.enabled}
              onChange={(e) => void toggle(e.target.checked)}
              className="h-5 w-5 accent-sky-400"
              data-testid="notify-enabled"
            />
            <span>
              Notify me while the game is in the background
              <span className="block text-xs text-slate-400">
                Never while you are looking, at most {MAX_PER_HOUR} an hour, several at once as one summary. A closed tab cannot notify.
              </span>
            </span>
          </label>
          {problem && (
            <p role="alert" className="mt-1 text-sm text-red-300">
              {problem}
            </p>
          )}
          <fieldset disabled={!notify.enabled} className="mt-2 grid gap-1 sm:grid-cols-2 disabled:opacity-50">
            <legend className="sr-only">Which events</legend>
            {TYPES.map((t) => (
              <label key={t} className="flex min-h-11 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={notify.types[t]}
                  onChange={(e) => setNotifications({ types: { [t]: e.target.checked } })}
                  className="h-5 w-5 accent-sky-400"
                  data-testid={`notify-${t}`}
                />
                <span>{NOTIFY_LABELS[t]}</span>
              </label>
            ))}
          </fieldset>
        </>
      )}
    </div>
  );
}
