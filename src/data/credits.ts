/**
 * In-game credits (0.67): art sources and the open-source libraries the
 * shipped game uses. Keep in step with package.json dependencies and
 * THIRD_PARTY_NOTICES.md. Build tools (Vite, Tailwind CSS, TypeScript) are
 * listed too, as thanks, though they are not shipped code.
 */
export interface Credit {
  name: string;
  what: string;
  license: string;
  url: string;
}

export const ART_CREDITS: Credit[] = [
  {
    name: 'AAP-64 palette',
    what: 'The 64 colors every sprite is drawn with, by Adigun A. Polack',
    license: 'Free to use',
    url: 'https://lospec.com/palette-list/aap-64',
  },
];

export const LIBRARY_CREDITS: Credit[] = [
  { name: 'React', what: 'User interface', license: 'MIT', url: 'https://react.dev' },
  { name: 'Zustand', what: 'Game state', license: 'MIT', url: 'https://github.com/pmndrs/zustand' },
  { name: 'localForage', what: 'Saving in the browser', license: 'Apache-2.0', url: 'https://github.com/localForage/localForage' },
  { name: 'Supabase', what: 'Accounts and cloud saves', license: 'MIT', url: 'https://github.com/supabase/supabase-js' },
  { name: 'Electron', what: 'The desktop app (with Chromium and Node.js, under their own licenses)', license: 'MIT', url: 'https://www.electronjs.org' },
  { name: 'Vite', what: 'Build tool', license: 'MIT', url: 'https://vite.dev' },
  { name: 'Tailwind CSS', what: 'Styling', license: 'MIT', url: 'https://tailwindcss.com' },
  { name: 'TypeScript', what: 'Language', license: 'Apache-2.0', url: 'https://www.typescriptlang.org' },
];
