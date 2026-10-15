/* nav.js – header scroll fonu + mobil menyu (aria-expanded, Escape, fokus tələsi, scroll kilidi, inert). */
(() => {
  'use strict';

  const header = document.querySelector('[data-header]');
  if (!header) return;

  const root = document.documentElement;
  const toggle = header.querySelector('.nav-toggle');
  const nav = header.querySelector('.site-nav');

  let scrolled = false;
  const onScroll = () => {
    const s = window.scrollY > 8;
    if (s !== scrolled) { scrolled = s; header.classList.toggle('is-scrolled', s); }
  };
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  if (!toggle || !nav) return;

  const wide = matchMedia('(min-width: 48rem)');
  const behind = document.querySelectorAll('main, footer, .skip-link');   // menyu açıqkən arxa plan
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const focusables = () => [...header.querySelectorAll('a[href], button')].filter((el) => el.offsetParent !== null || el === toggle);

  function setOpen(open, restoreFocus = true) {
    toggle.setAttribute('aria-expanded', String(open));   // ad sabitdir ("Menyu"), vəziyyəti aria-expanded deyir
    root.classList.toggle('nav-open', open);
    behind.forEach((el) => { el.inert = open; });           // ekran oxuyucu və fokus arxaya keçməsin
    if (open) nav.querySelector('a[href]')?.focus();
    else if (restoreFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  nav.addEventListener('click', (e) => {
    if (e.target instanceof Element && e.target.closest('a')) setOpen(false, false);
  });

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;

    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return; }
    if (e.key !== 'Tab') return;

    const items = focusables();
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1], active = document.activeElement;

    if (!items.includes(active)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
  });

  wide.addEventListener('change', (e) => { if (e.matches && isOpen()) setOpen(false, false); });
  addEventListener('pageshow', (e) => { if (e.persisted && isOpen()) setOpen(false, false); });
})();
