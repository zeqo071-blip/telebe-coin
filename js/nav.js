/* nav.js – header scroll fonu + mobil menyu (aria-expanded, Escape, fokus tələsi, scroll kilidi). */
(() => {
  'use strict';

  const header = document.querySelector('[data-header]');
  if (!header) return;

  const root = document.documentElement;
  const toggle = header.querySelector('.nav-toggle');
  const nav = header.querySelector('.site-nav');

  // Scroll edəndə header fon alır (yalnız vəziyyət dəyişəndə class toggle olunur)
  let scrolled = false;
  const onScroll = () => {
    const s = window.scrollY > 8;
    if (s !== scrolled) { scrolled = s; header.classList.toggle('is-scrolled', s); }
  };
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  if (!toggle || !nav) return;

  const wide = matchMedia('(min-width: 48rem)');
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const focusables = () => [...header.querySelectorAll('a[href], button')].filter((el) => el.offsetParent !== null || el === toggle);

  function setOpen(open, restoreFocus = true) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menyunu bağla' : 'Menyunu aç');
    root.classList.toggle('nav-open', open);
    if (open) nav.querySelector('a[href]')?.focus();
    else if (restoreFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  // Link seçiləndə menyu bağlanır
  nav.addEventListener('click', (e) => {
    if (e.target instanceof Element && e.target.closest('a')) setOpen(false, false);
  });

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      return;
    }

    if (e.key !== 'Tab') return;

    // Fokus tələsi: Tab yalnız header daxilində dövr edir
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (!items.includes(active)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
  });

  // Geniş ekrana keçəndə və ya geri (bfcache) qayıdanda menyu bağlı olsun
  wide.addEventListener('change', (e) => { if (e.matches && isOpen()) setOpen(false, false); });
  addEventListener('pageshow', (e) => { if (e.persisted && isOpen()) setOpen(false, false); });
})();
