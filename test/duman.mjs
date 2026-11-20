// Duman testi (hizli kontrol): sayfa aciliyor mu, konsol temiz mi, oyun basliyor mu,
// bir etkilesim durumu degistiriyor mu, telefonda tasma var mi.
//
// Kullanim:  node test/duman.mjs [--url http://localhost:8000/] [--desktop-only]
// Gerekli:   `playwright` ya da `playwright-core` paketi (depoya kurulmaz; ust klasorden de bulunabilir).
//            Tarayici icin istege bagli PW_CHROMIUM=<chrome.exe yolu>; yoksa Playwright'in kendi Chromium'u.
// Url verilmezse depo klasorunu kendi icinde sunar (dis sunucu gerekmez).
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const argVal = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
let pw; try { pw = await import('playwright'); } catch { pw = await import('playwright-core'); }
const chromium = pw.chromium || pw.default.chromium;

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.glb': 'model/gltf-binary', '.md': 'text/plain' };
let server = null, url = argVal('--url');
if (!url) {
  server = createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f = normalize(join(root, p));
    if (!f.startsWith(root) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); res.end('yok'); return; }
    res.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream' }); res.end(readFileSync(f));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  url = `http://127.0.0.1:${server.address().port}/`;
}

let failed = false;
const ok = m => console.log('ok   ' + m);
const bad = m => { failed = true; console.log('FAIL ' + m); };
const info = m => console.log('not  ' + m);
const IGNORE = /fonts\.googleapis\.com|fonts\.gstatic\.com|gc\.zgo\.at|goatcounter/;
const launchOpts = { headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };
if (process.env.PW_CHROMIUM) launchOpts.executablePath = process.env.PW_CHROMIUM;
const browser = await chromium.launch(launchOpts);

async function run(tag, ctxOpts) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  const errs = [], fails = []; let bytes = 0;
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !IGNORE.test(m.text())) errs.push('console: ' + m.text().slice(0, 160)); });
  page.on('requestfailed', r => { if (!IGNORE.test(r.url())) fails.push(r.url() + ' ' + (r.failure() || {}).errorText); });
  page.on('response', async r => { if (r.status() >= 400 && !IGNORE.test(r.url())) fails.push(r.status() + ' ' + r.url()); try { const b = await r.body(); bytes += b.length; } catch { /* yok */ } });
  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  try { await page.waitForFunction(() => window.__dolmusReady === true, null, { timeout: 90000 }); ok(`${tag}: oyun hazir (${((Date.now() - t0) / 1000).toFixed(1)} sn, ${(bytes / 1048576).toFixed(2)} MB)`); }
  catch { bad(`${tag}: oyun hazir olmadi`); }
  const overflow = () => page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
  let o = await overflow();
  (o.sw <= o.iw + 1 ? ok : bad)(`${tag}: acilis ekraninda yatay tasma ${o.sw <= o.iw + 1 ? 'yok' : 'VAR'} (${o.sw}/${o.iw})`);
  const st0 = await page.evaluate(() => window.dolmus && window.dolmus.state);
  (st0 === 'title' ? ok : bad)(`${tag}: ilk durum "${st0}"`);
  // yeni ozellikler (varsa): Yenilikler penceresi
  if (await page.$('#bNews')) {
    await page.click('#bNews');
    const vis = await page.evaluate(() => document.getElementById('sNews').classList.contains('show'));
    (vis ? ok : bad)(`${tag}: Yenilikler penceresi aciliyor`);
    const txt = await page.evaluate(() => document.getElementById('sNews').innerText);
    (/v\d+\.\d+/.test(txt) ? ok : bad)(`${tag}: surum etiketi gorunuyor`);
    o = await overflow(); (o.sw <= o.iw + 1 ? ok : bad)(`${tag}: Yenilikler penceresinde tasma ${o.sw <= o.iw + 1 ? 'yok' : 'VAR'}`);
    const clipped = await page.evaluate(() => { const c = document.querySelector('#sNews .card'); const r = c.getBoundingClientRect(); return r.left >= -1 && r.right <= innerWidth + 1; });
    (clipped ? ok : bad)(`${tag}: Yenilikler kartı ekran içinde`);
    await page.click('#bNewsBack');
  } else info(`${tag}: Yenilikler dugmesi yok (eski surum)`);
  // oyunu baslat
  await page.click('#bPlay', { timeout: 120000 });
  try { await page.waitForFunction(() => ['countdown', 'play', 'route'].includes(window.dolmus.state), null, { timeout: 15000 }); } catch { /* asagida bakilir */ }
  let st = await page.evaluate(() => window.dolmus.state);
  if (st === 'route') { await page.click('#bHatGo'); st = await page.evaluate(() => window.dolmus.state); }
  (st === 'countdown' || st === 'play' ? ok : bad)(`${tag}: Oyna sonrasi durum "${st}"`);
  try { await page.waitForFunction(() => window.dolmus.state === 'play', null, { timeout: 80000 }); ok(`${tag}: geri sayim bitti, surus basladi`); } catch { bad(`${tag}: surus baslamadi`); }
  // gaz ver: sure ilerlemeli, hiz artmali
  const t1 = await page.evaluate(() => window.dolmus.time);
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(300);
  // yazilim render'inda kare hizi dusuk: oyunu kendi hizlandirma kancasiyla ilerlet (en fazla 3 parca, yuklu makinede gecikme olabilir)
  const r1 = await page.evaluate(() => { let v = 0; for (let i = 0; i < 3 && v < 0.5; i++) { window.dolmusSim(4); v = Math.abs(window.dolmus.speed); } return { t: window.dolmus.time, v }; });
  await page.keyboard.up('KeyW');
  (r1.t > t1 ? ok : bad)(`${tag}: oyun saati ilerliyor (${t1.toFixed(1)} -> ${r1.t.toFixed(1)})`);
  (r1.v > 0.5 ? ok : bad)(`${tag}: gaza basinca arac hizlaniyor (hiz ${r1.v.toFixed(1)})`);
  if (tag.startsWith('telefon')) {
    const tc = await page.evaluate(() => { const e = document.getElementById('touch'); const r = e.getBoundingClientRect(); const kids = [...e.children].filter(k => k.getBoundingClientRect().width > 0); return { shown: r.width > 0 && getComputedStyle(e).display !== 'none', n: kids.length, inside: kids.every(k => { const q = k.getBoundingClientRect(); return q.left >= -1 && q.right <= innerWidth + 1 && q.bottom <= innerHeight + 1; }) }; });
    (tc.shown && tc.inside ? ok : bad)(`${tag}: dokunmatik denetimler gorunur ve ekran icinde (${tc.n} oge)`);
  }
  // duraklat / surdur
  await page.keyboard.press('Escape');
  let ps = await page.evaluate(() => window.dolmus.state);
  (ps === 'paused' ? ok : bad)(`${tag}: Esc ile duraklatma ("${ps}")`);
  await page.keyboard.press('Escape');
  ps = await page.evaluate(() => window.dolmus.state);
  (ps === 'play' ? ok : bad)(`${tag}: Esc ile devam ("${ps}")`);
  // sekme arka plana gidince
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(500);
  const hs = await page.evaluate(() => window.dolmus.state);
  info(`${tag}: sekme gizlenince durum "${hs}"`);
  // arayuz tasmasi / dokunmatik hedefler (oyun icinde)
  o = await overflow(); (o.sw <= o.iw + 1 ? ok : bad)(`${tag}: oyun icinde yatay tasma ${o.sw <= o.iw + 1 ? 'yok' : 'VAR'}`);
  const small = await page.evaluate(() => [...document.querySelectorAll('#touch > *, #topbar button, .screen.show .btn')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.width < 36 || r.height < 36); }).map(e => e.id || e.className).slice(0, 6));
  info(`${tag}: 36 px alti hedefler: ${small.length ? small.join(', ') : 'yok'}`);
  // kayit anahtarlari bozulmamis mi
  const keys = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('arena.dolmus')));
  info(`${tag}: kayit anahtarlari: ${keys.join(', ') || '(yok)'}`);
  (errs.length === 0 ? ok : bad)(`${tag}: konsol/sayfa hatasi ${errs.length}${errs.length ? ' -> ' + errs.slice(0, 3).join(' | ') : ''}`);
  (fails.length === 0 ? ok : bad)(`${tag}: basarisiz/404 istek ${fails.length}${fails.length ? ' -> ' + fails.slice(0, 3).join(' | ') : ''}`);
  await ctx.close();
}

// tam tur: bot bir vardiyayi bitirir (kazanma yolu), bitis ekrani gelir, kayit yazilir
async function tamTur() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(url + '?auto&lang=tr', { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => window.__dolmusReady === true, null, { timeout: 90000 });
  await page.evaluate(() => { window.dolmusSim(6); });
  const nlog = await page.evaluate(() => { for (let i = 0; i < 12 && window.dolmus.log.length < 1; i++) window.dolmusSim(30); return window.dolmus.log.length; });
  (nlog >= 1 ? ok : bad)(`tam tur: bot bir vardiyayi bitirdi (${nlog} kayit)`);
  const log = await page.evaluate(() => window.dolmus.log.map(l => l.stars + '/' + l.net));
  info(`tam tur: vardiya kaydi ${log.join(', ')}`);
  const sv = await page.evaluate(() => ({ board: localStorage.getItem('arena.dolmus.board'), save: localStorage.getItem('arena.dolmus.save') }));
  info(`tam tur: kayit ${sv.save ? 'var' : 'yok'}, rekor tablosu ${sv.board || '(yok / eski surum)'}`);
  const ov = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  (ov ? ok : bad)('tam tur: bitis ekraninda yatay tasma yok');
  if (process.env.DUMAN_SHOTS) await page.screenshot({ path: process.env.DUMAN_SHOTS + '/bitis-telefon.png' });
  (errs.length === 0 ? ok : bad)(`tam tur: sayfa hatasi ${errs.length}${errs.length ? ' -> ' + errs[0] : ''}`);
  await ctx.close();
}
try {
  await run('masaustu', { viewport: { width: 1366, height: 768 } });
  if (!args.includes('--desktop-only')) await tamTur();
  if (!args.includes('--desktop-only')) await run('telefon', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
} catch (e) { bad('beklenmedik hata: ' + (e && e.stack || e)); }
await browser.close();
if (server) server.close();
console.log(failed ? 'SONUC: BASARISIZ' : 'SONUC: TAMAM');
process.exit(failed ? 1 : 0);
