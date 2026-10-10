import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contentType, isExternalLink, isSaveKey, resolveAppFile, saveFileName, saveFilePath, START_URL } from './files';

describe('desktop app file helpers (1.96)', () => {
  it('accepts only the game save keys', () => {
    expect(isSaveKey('megagen-idle-save')).toBe(true);
    expect(isSaveKey('megagen-idle-save:savedAt')).toBe(true);
    for (const bad of ['', '../x', 'a/b', 'a\\b', 'x'.repeat(121), 42, null]) expect(isSaveKey(bad)).toBe(false);
  });

  it('keeps saves in the user data folder, with Windows-safe names', () => {
    expect(saveFileName('megagen-idle-save:savedAt')).toBe('megagen-idle-save~savedAt.json');
    expect(saveFilePath('/data', 'megagen-idle-save')).toBe(join('/data', 'saves', 'megagen-idle-save.json'));
  });

  it('serves the game from its folder only', () => {
    const root = join('/app', 'dist-desktop');
    expect(START_URL).toBe('app://megagen/play/');
    expect(resolveAppFile(root, START_URL)).toBe(join(root, 'play', 'index.html'));
    expect(resolveAppFile(root, 'app://megagen/assets/index-1.js')).toBe(join(root, 'assets', 'index-1.js'));
    // the URL parser drops leading ..: the file stays inside the game folder
    expect(resolveAppFile(root, 'app://megagen/../../etc/passwd')).toBe(join(root, 'etc', 'passwd'));
    // an encoded slash that would climb out after decoding is refused
    expect(resolveAppFile(root, 'app://megagen/%2e%2e%2f%2e%2e%2fsecret')).toBeNull();
    expect(resolveAppFile(root, 'app://other/play/')).toBeNull();
    expect(resolveAppFile(root, 'https://megagen/play/')).toBeNull();
  });

  it('knows the file types the game uses, and which links leave the game', () => {
    expect(contentType('a/index.html')).toContain('text/html');
    expect(contentType('x.JS')).toContain('javascript');
    expect(contentType('x.png')).toBe('image/png');
    expect(isExternalLink('https://megagenidle.com/privacy.html')).toBe(true);
    expect(isExternalLink('mailto:hi@example.com')).toBe(true);
    expect(isExternalLink('file:///c:/windows')).toBe(false);
    expect(isExternalLink('javascript:alert(1)')).toBe(false);
  });
});
