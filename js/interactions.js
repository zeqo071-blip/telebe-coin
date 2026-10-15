/* interactions.js – xüsusi kursor + maqnit düymələr.
   Yalnız (hover: hover) and (pointer: fine) və "hərəkəti azalt" söndürülü olanda işləyir.
   Standart kursor gizlədilmir. Xəta olarsa əlavə elementlər silinir, səhifə olduğu kimi qalır. */
(() => {
  'use strict';

  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const HOVER_SEL = 'a[href], button, [role="button"], .btn, summary';
  const MAGNET_MAX = 8;      // px
  const MAGNET_PULL = 0.12;

  let ac = null;             // aktiv olanda AbortController

  function enable() {
    ac = new AbortController();
    const { signal } = ac;

    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    dot.setAttribute('aria-hidden', 'true');
    ring.setAttribute('aria-hidden', 'true');
    document.body.append(dot, ring);

    let x = 0, y = 0, rx = 0, ry = 0, last = 0, raf = 0, shown = false;

    const place = (el, px, py) => { el.style.transform = `translate3d(${px}px, ${py}px, 0)`; };

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000 || 0, 0.05);
      last = now;
      const k = 1 - Math.exp(-dt * 14);          // kadr tezliyindən asılı olmayan gecikmə
      rx += (x - rx) * k;
      ry += (y - ry) * k;
      place(ring, rx, ry);
      raf = (Math.abs(x - rx) > 0.1 || Math.abs(y - ry) > 0.1) ? requestAnimationFrame(loop) : 0;
    };

    const show = () => { shown = true; dot.classList.add('is-visible'); ring.classList.add('is-visible'); };
    const hide = () => { shown = false; dot.classList.remove('is-visible'); ring.classList.remove('is-visible'); };

    document.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      x = e.clientX; y = e.clientY;
      place(dot, x, y);
      if (!shown) { rx = x; ry = y; place(ring, rx, ry); show(); }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    }, { passive: true, signal });

    document.addEventListener('pointerover', (e) => {
      ring.classList.toggle('is-hover', !!(e.target instanceof Element && e.target.closest(HOVER_SEL)));
    }, { passive: true, signal });

    document.addEventListener('pointerdown', () => ring.classList.add('is-down'), { passive: true, signal });
    document.addEventListener('pointerup', () => ring.classList.remove('is-down'), { passive: true, signal });
    document.documentElement.addEventListener('pointerleave', hide, { signal });
    window.addEventListener('blur', hide, { signal });

    // Maqnit düymələr
    document.querySelectorAll('.btn-primary').forEach((btn) => {
      let ox = 0, oy = 0;
      btn.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2 - ox);   // cari sürüşməni çıxırıq, əks əlaqə olmasın
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

    signal.addEventListener('abort', () => {
      cancelAnimationFrame(raf);
      dot.remove();
      ring.remove();
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
      disable();   // xəta: hər şey ilkin vəziyyətə qayıdır
    }
  }

  sync();
  fine.addEventListener('change', sync);
  calm.addEventListener('change', sync);
})();
