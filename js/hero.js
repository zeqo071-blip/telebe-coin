/* Hero – 3D coin. Three.js r160 CDN-dən, boş vaxtda yüklənir.
   Xəta, zəif cihaz və ya WebGL yoxdursa statik coin qalır. */
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const hero = document.querySelector('.hero');
const stage = document.querySelector('[data-coin-stage]');
const canvas = stage?.querySelector('canvas');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function isWeakDevice() {
  const n = navigator;
  return n.connection?.saveData === true ||
         (n.hardwareConcurrency ?? 8) <= 2 ||
         (n.deviceMemory ?? 8) <= 2;
}

/* 'Hərəkəti azalt' açıqdırsa three.js heç yüklənmir, statik coin qalır */
if (stage && canvas && !isWeakDevice() && !reduceMotion.matches) {
  const start = () => initCoin().catch(() => { /* statik coin qalır */ });
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1500 });
  else setTimeout(start, 200);
}

async function fontReady() {
  try {
    await Promise.race([
      document.fonts.load('800 64px Manrope', '100'),
      new Promise((r) => setTimeout(r, 1500)),
    ]);
  } catch { /* şrift gəlməsə fallback ilə çəkilir */ }
}

// "100" yazılı üz teksturu, rənglər yalnız CSS dəyişənlərindən
function makeFaceTexture(THREE, renderer) {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');

  const bg = g.createRadialGradient(S * 0.38, S * 0.32, S * 0.04, S / 2, S / 2, S * 0.62);
  bg.addColorStop(0, css('--gold-300'));
  bg.addColorStop(0.65, css('--gold-500'));
  bg.addColorStop(1, css('--gold-700'));
  g.fillStyle = bg;
  g.fillRect(0, 0, S, S);

  g.lineWidth = 14; g.strokeStyle = css('--gold-700');
  g.beginPath(); g.arc(S / 2, S / 2, S * 0.44, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 4; g.strokeStyle = css('--gold-300');
  g.beginPath(); g.arc(S / 2, S / 2, S * 0.39, 0, Math.PI * 2); g.stroke();

  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${S * 0.33}px ${css('--font-display')}`;
  g.fillStyle = css('--gold-300');  g.fillText('100', S / 2 + 3, S / 2 + 7);   // həkk effekti
  g.fillStyle = css('--violet-700'); g.fillText('100', S / 2, S / 2 + 4);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

async function initCoin() {
  const THREE = await import(THREE_URL);
  await fontReady();

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
  camera.position.z = 4.3;

  // Cəmi 2 işıq
  scene.add(new THREE.HemisphereLight(css('--on-primary'), css('--violet-500'), 1.1));
  const key = new THREE.DirectionalLight(css('--gold-300'), 2.4);
  key.position.set(2.5, 3, 4);
  scene.add(key);

  // Coin: yuvarlaq halqa + iki üz (~1.3k üçbucaq)
  const R = 1, TUBE = 0.085, FACE_Z = 0.078;
  const tex = makeFaceTexture(THREE, renderer);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(R - 0.03, TUBE, 10, 56),
    new THREE.MeshStandardMaterial({ color: css('--gold-500'), metalness: 0.75, roughness: 0.32 })
  );
  const faceMat = new THREE.MeshStandardMaterial({
    map: tex, emissiveMap: tex, emissive: css('--on-primary'), emissiveIntensity: 0.16,  // hafif parıltı
    metalness: 0.35, roughness: 0.4,
  });
  const faceGeo = new THREE.CircleGeometry(R - 0.015, 48);
  const front = new THREE.Mesh(faceGeo, faceMat);
  front.position.z = FACE_Z;
  const back = new THREE.Mesh(faceGeo, faceMat);
  back.position.z = -FACE_Z;
  back.rotation.y = Math.PI;

  const spin = new THREE.Group();       // fırlanma
  spin.add(rim, front, back);
  const tiltGroup = new THREE.Group();  // əyilmə + yüngül üzmə
  tiltGroup.add(spin);
  scene.add(tiltGroup);

  let t = 0, last = 0, raf = 0, visible = true, running = false, userPaused = false;
  const target = { x: 0, y: 0 };
  const tilt = { x: 0, y: 0 };
  const render = () => renderer.render(scene, camera);

  function update(dt) {
    t += dt;
    const k = 1 - Math.exp(-dt * 6);                  // hamar izləmə
    tilt.x += (target.x - tilt.x) * k;
    tilt.y += (target.y - tilt.y) * k;
    const p = Math.min(1, t / 1.4);
    const e = 1 - Math.pow(1 - p, 3);                 // giriş: bir dəfəlik fırlanma
    spin.rotation.y = -(1 - e) * Math.PI * 2.5 + t * 0.55;
    tiltGroup.rotation.y = tilt.x * 0.4;
    tiltGroup.rotation.x = tilt.y * 0.4;
    tiltGroup.position.y = Math.sin(t * 1.4) * 0.04;
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000 || 0, 0.05);
    last = now;
    update(dt);
    render();
    raf = requestAnimationFrame(frame);
  }

  function staticPose() {                              // "hərəkəti azalt" üçün
    spin.rotation.y = 0.4;
    tiltGroup.rotation.set(0.08, 0, 0);
    tiltGroup.position.y = 0;
    render();
  }

  function sync() {
    const shouldRun = visible && !document.hidden && !reduceMotion.matches && !userPaused;
    if (shouldRun && !running) {
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!shouldRun && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
    if (reduceMotion.matches) staticPose();
  }

  function resize() {
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (!running) render();
  }

  // Siçan / barmaq izləmə
  const onMove = (e) => {
    if (reduceMotion.matches) return;
    const r = stage.getBoundingClientRect();
    target.x = clamp((e.clientX - (r.left + r.width / 2)) / (innerWidth / 2), -1, 1);
    target.y = clamp((e.clientY - (r.top + r.height / 2)) / (innerHeight / 2), -1, 1);
  };
  const onLeave = () => { target.x = target.y = 0; };
  hero.addEventListener('pointerdown', onMove, { passive: true });
  hero.addEventListener('pointermove', onMove, { passive: true });
  hero.addEventListener('pointerleave', onLeave);
  hero.addEventListener('pointercancel', onLeave);
  hero.addEventListener('pointerup', (e) => { if (e.pointerType === 'touch') onLeave(); });

  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(stage);
  new ResizeObserver(resize).observe(stage);
  document.addEventListener('visibilitychange', sync);
  reduceMotion.addEventListener('change', sync);
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    running = false;
    cancelAnimationFrame(raf);
    stage.classList.remove('is-3d');                   // statik coin geri qayıdır
    toggle.remove();
  });

  // WCAG 2.2.2: avtomatik hərəkəti dayandırma düyməsi
  const LABEL_STOP = 'Coin animasiyasını dayandır', LABEL_PLAY = 'Coin animasiyasını davam etdir';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'coin-toggle';
  toggle.textContent = LABEL_STOP;
  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    toggle.textContent = userPaused ? LABEL_PLAY : LABEL_STOP;
    sync();
  });
  (hero.querySelector('.hero__copy') || hero).append(toggle);

  resize();
  render();                                            // ilk kadr hazır olmadan göstərmirik
  stage.classList.add('is-3d');
  sync();
}
