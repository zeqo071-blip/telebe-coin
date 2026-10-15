/* scroll.js – GSAP 3.12.5 + ScrollTrigger. Yalnız transform və opacity animasiya olunur.
   GSAP yüklənməyibsə və ya "hərəkəti azalt" açıqdırsa heç nə gizlədilmir. */
(() => {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });   // mobil ünvan çubuğu atlamasın

  const mm = gsap.matchMedia();

  mm.add(
    { motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 48rem)' },
    (ctx) => {
      const { motion, wide } = ctx.conditions;
      if (!motion || navigator.connection?.saveData) return;   // save-data: animasiyasız

      // 1) Bölmə başlıqları və son çağırış: yumşaq görünmə
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          opacity: 0, y: 28, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      // 2) Kartlar: ardıcıl (stagger)
      gsap.utils.toArray('[data-stagger]').forEach((group) => {
        gsap.from(Array.from(group.children), {
          opacity: 0, y: 32, duration: 0.7, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: group, start: 'top 85%', once: true },
        });
      });

      // 3) "Necə işləyir?": addımlar scroll ilə ardıcıl vurğulanır
      const wrap = document.querySelector('[data-steps]');
      if (wrap) {
        const steps = gsap.utils.toArray('.step', wrap);
        const fill = wrap.querySelector('.steps__fill');
        const axis = wide ? 'scaleX' : 'scaleY';

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: wrap, start: 'top 70%', end: 'bottom 40%', scrub: 0.6 },
        });

        tl.fromTo(fill, { [axis]: 0 }, { [axis]: 1, duration: 3 }, 0);

        steps.forEach((step, i) => {
          const at = i + 0.15;
          tl.fromTo(step, { opacity: 0.4, scale: 0.985 },
                          { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, at)
            .fromTo(step.querySelector('.step__glow'), { opacity: 0 }, { opacity: 1, duration: 0.5 }, at)
            .fromTo(step.querySelector('.step__dot'),  { opacity: 0 }, { opacity: 1, duration: 0.3 }, at);
        });
      }
    }
  );

  // Şrift yüklənəndən sonra mövqeləri yenilə
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
})();
