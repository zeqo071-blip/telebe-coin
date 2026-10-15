/* interactions.js – yalnız maqnit düymələr (xüsusi kursor çıxarılıb).
   Yalnız (hover: hover) and (pointer: fine) və "hərəkəti azalt" söndürülü olanda işləyir. */
(() => {
  'use strict';

  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const MAGNET_MAX = 8;      // px
  const MAGNET_PULL = 0.12;

  let ac = null;

  function enable() {
    ac = new AbortController();
    const { signal } = ac;

    document.querySelectorAll('.btn-primary').forEach((btn) => {
      let ox = 0, oy = 0;
      btn.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2 - ox);
        const dy = e.clientY - (r.top + r.height / 2 - oy);
        let mx = dx * MAGNET_PULL, my = dy * MAGNET_PULL;
        const len = Math.hypot(mx, my);
        if (len > MAGNET_MAX) { mx *= MAGNET_MAX / len; my *= MAGNET_MAX / len; }
        ox = mx; oy = my;
        btn.style.translate = `${mx.toFixed(2)}px ${my.toFixed(2)}px`;
      }, { passive: true, signal });
      btn.addEventListener('pointerleave', () => { ox = oy = 0; btn.style.translate = ''; }, { signal });
      signal.addEventListener('abort', () => { btn.style.translate = ''; });
    });
  }

  function disable() {
    if (ac) { ac.abort(); ac = null; }
  }

  function sync() {
    try {
      const ok = fine.matches && !calm.matches;
      if (ok && !ac) enable();
      else if (!ok && ac) disable();
    } catch {
      disable();
    }
  }

  sync();
  fine.addEventListener('change', sync);
  calm.addEventListener('change', sync);
})();
