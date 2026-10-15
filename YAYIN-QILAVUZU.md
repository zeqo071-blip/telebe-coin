# Tələbə Coin: yayın qılavuzu və yoxlama siyahıları

## A. Yayımdan əvvəl doldurulacaq yer tutucular
| Harada | Nə var | Nə etməli |
|---|---|---|
| haqqimizda.html | 3 ədəd `[BURAYA YAZ]` (məqsəd, komanda, tarixçə) | Doldur və ya həmin blokları sil |
| elaqe.html | `[E-POÇT]` | Ünvanı yaz, `<a href="mailto:...">` et və ya kartı sil |
| index.html | "Nümunə rəylər" bölməsi | Real rəy yoxdursa bölməni sil |
| index.html | CTA düyməsi "Əlaqə yollarına bax" | Qeydiyyat səhifəsi hazır olanda mətni "Başla", href-i həmin ünvan et |
| Bütün HTML, robots.txt, sitemap.xml | `https://DOMEN.az` | `./set-domain.sh https://sənin-domenin.az` |
| index.html | `integrity="SRI-GSAP"` və `SRI-ST` | İnternetli kompüterdə `./sri.sh` |

## B. Lighthouse (mobil)
Chrome inkoqnito > F12 > Lighthouse > Mobile > Navigation. Hər 3 səhifə üçün.
Və ya: `npx serve .` sonra `npx lighthouse http://localhost:3000/index.html --form-factor=mobile --view`
| | Əvvəl | Sonra |
|---|---|---|
| Performance / A11y / Best Pr. / SEO | (doldur) | (doldur) |

## C. CSP (meta) qiymətləndirməsi, hələ AKTİV DEYİL
Mümkündür, amma sınaqdan keçməyib. Sınamaq üçün `<head>`-ə əlavə et, konsolda "Refused to..." xətalarına bax:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net 'sha256-Du+OJKJSbdUgz5nrHeWWINvez6XKDDU/tyj/5c2uvwo='; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'none'">
```
- sha256 hash `<script>document.documentElement.classList.add('js')</script>` üçündür (mətn dəqiq belə qalmalıdır).
- 404.html-dəki inline `<base>` skripti üçün ayrıca hash lazımdır, ona görə 404-ə CSP qoyma.
- `frame-ancestors` meta ilə işləmir. GSAP-ın CSP altında işləməsi yoxlanmalıdır.
- three.js `import()` ilə yükləndiyi üçün SRI qoymaq olmur. Tam sabitlik üçün three.module.js-i repoya köçürüb `'self'`-dən yüklə.

## D. Ekran oxuyucu yoxlaması (NVDA / VoiceOver / TalkBack)
1. Səhifə açılanda ilk Tab "Məzmuna keç" göstərir və Enter ilə məzmuna aparır.
2. Başlıqlar (H düyməsi): hər səhifədə bir h1, sonra h2/h3.
3. Hamburger "Menyu, düymə, yığılıb/açılıb" oxunur. Açıqkən arxa məzmuna keçmək olmur. Escape bağlayır, fokus düyməyə qayıdır.
4. Aktiv link "cari səhifə" kimi oxunur.
5. TikTok/Instagram "(yeni pəncərədə açılır)" ilə oxunur.
6. 3D coin oxunmur (dekorativdir). "Coin animasiyasını dayandır" düyməsi işləyir.
7. Sistemdə "Hərəkəti azalt" açıq olanda coin fırlanmır, animasiyalar olmur.

## E. Yayın: GitHub Pages
1. **Hesab:** github.com > Sign up. E-poçtu təsdiqlə.
2. **Repo:** sağ yuxarı "+" > New repository. Ad: `telebe-coin`, Public, "Add a README" seçmə > Create.
3. **Fayllar:** repo səhifəsində "uploading an existing file" > bütün faylları və `css`, `js` qovluqlarını sürüklə > Commit changes.
   Və ya terminal:
   ```
   git init && git add . && git commit -m "ilk versiya"
   git branch -M main
   git remote add origin https://github.com/İSTİFADƏÇİ/telebe-coin.git
   git push -u origin main
   ```
   Minify istəyirsənsə `./build.sh` işlət və `dist/` içindəkiləri yüklə (yaxud yalnız mənbə faylları yüklə, sayt eyni işləyir).
4. **Pages:** Settings > Pages > Source: "Deploy from a branch" > Branch: `main`, qovluq `/ (root)` > Save. 1-3 dəqiqə sonra ünvan yuxarıda görünür: `https://İSTİFADƏÇİ.github.io/telebe-coin/`.
5. **Alt qovluq yolları:** bütün `href/src` nisbidir (`css/...`, `js/...`, `index.html`), `/` ilə başlayan yol yoxdur. Ona görə `/telebe-coin/` altında da işləyir. 404.html bunu kiçik skriptlə özü həll edir.
   Qeyd: canonical/og teqləri `https://DOMEN.az` göstərir. Domen bağlanana qədər paylaşım önizləməsi işləməyəcək.

## F. Öz domenin
1. **Domen almaq:** `.az` üçün Azərbaycanda akkreditə olunmuş registrar seçilir (məs. IntraNS, .az reyestrinin rəsmi siyahısına bax). Qiymət, sənəd tələbləri və DNS idarəetməsi dəyişə bilər, qeydiyyatdan əvvəl registrarın sayından yenidən yoxla. Registrarda DNS qeydlərini (A, AAAA, CNAME) özün dəyişə bildiyinə əmin ol.
2. `./set-domain.sh https://sənin-domenin.az` işlət, sonra yenidən yüklə.
3. Repo kökündə `CNAME` adlı fayl yarat, içində yalnız: `sənin-domenin.az`
4. GitHub: Settings > Pages > Custom domain > domeni yaz > Save.
5. **DNS (registrarda):**
   | Tip | Ad | Dəyər |
   |---|---|---|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | AAAA (istəyə görə) | @ | 2606:50c0:8000::153 |
   | AAAA | @ | 2606:50c0:8001::153 |
   | AAAA | @ | 2606:50c0:8002::153 |
   | AAAA | @ | 2606:50c0:8003::153 |
   | CNAME | www | İSTİFADƏÇİ.github.io |
   (IP-lər GitHub-ın rəsmi sənədindən bu gün yoxlanıb. Bağlayanda docs.github.com > "Managing a custom domain for your GitHub Pages site" səhifəsindən təkrar yoxla.)
6. **Gözləmə:** adətən dəqiqələr, bəzən 24-48 saat. Yoxlama:
   `nslookup sənin-domenin.az` və ya `dig sənin-domenin.az +short`, `dig www.sənin-domenin.az +short`.
7. Pages səhifəsində DNS yoxlaması keçəndə **Enforce HTTPS** qutusunu işarələ (sertifikat hazır olana qədər aktiv olmaya bilər).
8. www və www-suz: A qeydləri + www CNAME düzgün olanda GitHub biri digərinə avtomatik yönləndirir.

## G. Yayımdan sonra yoxlama
- [ ] https:// açılır, qıfıl işarəsi var, http avtomatik https-ə keçir
- [ ] index, haqqimizda, elaqe açılır; menyu işləyir
- [ ] Olmayan ünvan (məs. /yoxdur) 404 səhifəsini göstərir
- [ ] Telefonda: 320-414px üfüqi scroll yoxdur, notch zonası düzgündür
- [ ] Canlı URL-də Lighthouse mobil
- [ ] Google Search Console: Domain əlavə et, DNS TXT ilə təsdiqlə, sitemap.xml göndər
- [ ] Paylaşım önizləməsi: Facebook Sharing Debugger / LinkedIn Post Inspector ilə yoxla
- [ ] Konsolda xəta yoxdur
