import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const dir = '.github/workflows';
const load = (f: string) => parse(readFileSync(`${dir}/${f}`, 'utf8')) as Record<string, any>;

describe('GitHub Actions workflows', () => {
  it('every workflow is valid YAML with triggers and jobs that each run steps', () => {
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.yml'))) {
      const w = load(f);
      expect(w.name, f).toBeTruthy();
      expect(w.on, f).toBeTruthy();
      for (const [id, job] of Object.entries(w.jobs ?? {}) as [string, any][]) {
        expect(job['runs-on'], `${f} ${id}`).toBeTruthy();
        expect(Array.isArray(job.steps) && job.steps.length > 0, `${f} ${id}`).toBe(true);
        for (const s of job.steps) expect(Boolean(s.uses) !== Boolean(s.run), `${f} ${id}: a step has uses or run`).toBe(true);
      }
    }
  });

  it('the desktop build runs on Windows on tags and by hand, signs only with the owner secrets (1.96)', () => {
    const w = load('desktop.yml');
    expect(Object.keys(w.on)).toEqual(['push', 'workflow_dispatch']);
    expect(w.on.push.tags).toEqual(['v*']);
    const job = w.jobs.windows;
    expect(job['runs-on']).toBe('windows-latest');
    const build = job.steps.find((s: any) => s.run === 'npm run desktop:build');
    expect(build.env.CSC_LINK).toBe('${{ secrets.WIN_CSC_LINK }}');
    expect(build.env.CSC_KEY_PASSWORD).toBe('${{ secrets.WIN_CSC_KEY_PASSWORD }}');
    expect(job.steps.filter((s: any) => String(s.uses).startsWith('actions/upload-artifact'))).toHaveLength(2);
  });

  it('the desktop scripts exist and the web build is left as it was', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.scripts.build).toBe('tsc && vite build');
    for (const s of ['desktop:dev', 'desktop:build', 'desktop:web', 'desktop:compile']) expect(pkg.scripts[s]).toBeTruthy();
    expect(pkg.main).toBe('dist-electron/main.js');
  });
});
