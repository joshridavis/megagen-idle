// Part of npm run desktop:compile (1.96): after tsc has compiled electron/*.ts
// to dist-electron/ as CommonJS (Electron's sandboxed preload needs it), marks
// the folder as CommonJS, since the repository's package.json says "type": "module".
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const out = resolve(import.meta.dirname, '..', 'dist-electron');
mkdirSync(out, { recursive: true });
writeFileSync(resolve(out, 'package.json'), JSON.stringify({ type: 'commonjs' }, null, 2) + '\n');
console.log('dist-electron/ ready');
