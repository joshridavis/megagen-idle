import './site.css';
import { launchLine } from './pages-runtime';

// The site's only script (2.05): the launch line turns to "Out now" on launch
// day without a rebuild, and the trailer loads YouTube only when clicked.
const line = document.querySelector('[data-launch]');
if (line) line.textContent = launchLine();

for (const b of document.querySelectorAll<HTMLButtonElement>('button[data-youtube]')) {
  b.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(b.dataset.youtube!)}?autoplay=1`;
    frame.title = 'MegaGen Idle trailer';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture';
    frame.allowFullscreen = true;
    frame.className = 'trailer';
    b.replaceWith(frame);
  });
}
