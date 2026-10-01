// Verifies every sprite in src/assets/sprite-manifest.json exists, is a PNG and
// has the manifest size, and lists which are still generic stand-ins.
// Exits non-zero only for missing or malformed files.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = resolve(root, 'src/assets');
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Reads width and height from a PNG's IHDR chunk, or returns null if not a PNG. */
export function readPngSize(buf) {
  if (buf.length < 24 || !buf.subarray(0, 8).equals(PNG_SIGNATURE)) return null;
  if (buf.toString('ascii', 12, 16) !== 'IHDR') return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

export function checkAssets() {
  const manifest = JSON.parse(readFileSync(resolve(assetsDir, 'sprite-manifest.json'), 'utf8'));
  const generic = new Set(JSON.parse(readFileSync(resolve(assetsDir, 'generic-assets.json'), 'utf8')).generic);
  const problems = [];
  const genericIds = [];
  const realIds = [];
  for (const [id, e] of Object.entries(manifest)) {
    const path = resolve(assetsDir, 'sprites', e.file);
    if (!existsSync(path)) {
      problems.push(`${id}: missing file sprites/${e.file}`);
      continue;
    }
    const size = readPngSize(readFileSync(path));
    if (!size) problems.push(`${id}: sprites/${e.file} is not a valid PNG`);
    else if (size.width !== e.width || size.height !== e.height) {
      problems.push(`${id}: sprites/${e.file} is ${size.width}x${size.height}, expected ${e.width}x${e.height}`);
    } else (generic.has(`sprites/${e.file}`) ? genericIds : realIds).push(id);
  }
  return { problems, genericIds, realIds, total: Object.keys(manifest).length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { problems, genericIds, realIds, total } = checkAssets();
  console.log(`${total} sprites in manifest: ${realIds.length} real art, ${genericIds.length} generic stand-ins.`);
  if (genericIds.length) console.log(`Still generic: ${genericIds.join(', ')}`);
  if (problems.length) {
    console.error(`\n${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
    process.exit(1);
  }
  console.log('All sprites present with correct sizes.');
}
