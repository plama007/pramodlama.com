// Recipe scaler. The page already lists every amount at 1×; this script re-works them
// when the main ingredient changes, in measures you can actually use in a kitchen.
(() => {
  const R = JSON.parse(document.getElementById('recipe-data').textContent);
  const $ = s => document.querySelector(s);
  const G = { kg: 1000, lb: 453.59237 };

  /* ---------- Formatting ---------- */
  const GLYPH = { 0.125: '⅛', 0.25: '¼', 0.333: '⅓', 0.5: '½', 0.667: '⅔', 0.75: '¾' };
  // Nearest kitchen fraction from the allowed steps, e.g. 1.27 -> "1¼".
  function frac(x, steps) {
    let w = Math.floor(x), f = x - w, best = 0, d = f;
    for (const s of [...steps, 1]) if (Math.abs(f - s) < d) { d = Math.abs(f - s); best = s; }
    if (best === 1) { w += 1; best = 0; }
    const g = best ? GLYPH[Math.round(best * 1000) / 1000] : '';
    return (w || !g ? String(w) : '') + g;
  }
  const P = (n, u) => ({ n, u });

  // Volume, given in teaspoons. Returns parts like [{n:'½', u:'cup'}, {n:'1', u:'tbsp'}].
  function vol(tsp) {
    if (tsp < 0.09) return [P('a pinch', '')];
    if (tsp < 2.9) return [P(frac(tsp, tsp < 1 ? [0.125, 0.25, 0.5, 0.75] : [0.25, 0.5, 0.75]), 'tsp')];
    if (tsp < 11.6) {
      let T = Math.floor(tsp / 3), r = Math.round((tsp - T * 3) * 4) / 4;
      if (r >= 2.875) { T += 1; r = 0; }
      if (r === 1.5) return [P(frac(T + 0.5, [0.5]), 'tbsp')];
      return r ? [P(String(T), 'tbsp'), P(frac(r, [0.25, 0.5, 0.75]), 'tsp')] : [P(String(T), 'tbsp')];
    }
    // Cups: try the cup sizes people own (quarters and thirds) and keep the simplest result.
    const cups = tsp / 48, opts = [];
    for (let k = 0; k <= Math.ceil(cups); k++)
      for (const s of [0, 0.25, 1 / 3, 0.5, 2 / 3, 0.75]) {
        const c = k + s;
        if (c < 0.25 || c > cups + 0.02) continue;
        const rem = Math.max(0, tsp - c * 48);
        const tiny = rem < (cups >= 2 ? 3 : 0.75);
        const parts = [P(frac(c, [0.25, 1 / 3, 0.5, 2 / 3, 0.75]), c > 1 ? 'cups' : 'cup'), ...(tiny ? [] : vol(rem))];
        opts.push({ parts, c, err: tiny ? rem : 0 });
      }
    opts.sort((a, b) => a.parts.length - b.parts.length || a.err - b.err || b.c - a.c);
    return opts[0].parts;
  }
  function grams(g) {
    if (g >= 1000) return [P(String(+(g / 1000).toFixed(2)), 'kg')];
    const r = g < 10 ? Math.round(g * 2) / 2 : g < 100 ? Math.round(g) : Math.round(g / 5) * 5;
    return [P(String(r), 'g')];
  }
  const fmt = (q, u) => u === 'tsp' ? vol(q) : u === 'g' ? grams(q) : [P(String(Math.max(1, Math.round(q))), '')];
  const join = ps => ps.map(p => (p.n + ' ' + p.u).trim()).join(' + ');
  const sing = u => u.replace(/s$/, '');

  function amount(ing, f) {
    if (!Array.isArray(ing.q)) return join(fmt(ing.q * f, ing.u));
    const a = fmt(ing.q[0] * f, ing.u), b = fmt(ing.q[1] * f, ing.u);
    if (join(a) === join(b)) return join(b);
    if (a.length === 1 && b.length === 1 && sing(a[0].u) === sing(b[0].u)) return `${a[0].n}–${b[0].n} ${b[0].u}`.trim();
    return `${join(a)} – ${join(b)}`;
  }
  const approx = (ing, f) => ing.approx ? `≈ ${join(fmt(ing.approx[0] * f, ing.approx[1] === 'g' ? 'g' : 'pc'))}${ing.approx[1] === 'g' ? '' : ' ' + ing.approx[1]}` : '';

  function weight(g, unit) {
    if (unit === 'kg') return `${+(g / 1000).toFixed(3)} kg`;
    let lb = Math.floor(g / G.lb), oz = Math.round((g - lb * G.lb) / 28.349523125);
    if (oz === 16) { lb += 1; oz = 0; }
    return [lb && `${lb} lb`, oz && `${oz} oz`].filter(Boolean).join(' ') || '0 oz';
  }
  const asInput = (g, unit) => String(+(g / G[unit]).toFixed(unit === 'kg' ? 3 : 2));

  /* ---------- State ---------- */
  const input = $('#amt'), hint = $('#hint'), xOut = $('#factor');
  const qs = new URLSearchParams(location.search);
  let unit = qs.get('unit') in G ? qs.get('unit') : R.main.unit;
  let g = R.main.grams;
  if (parseFloat(qs.get('amount')) > 0) g = parseFloat(qs.get('amount')) * G[unit];

  const rows = [...document.querySelectorAll('.it[data-i]')];
  let last = rows.map(r => r.querySelector('.q').textContent);

  function render(fromInput) {
    const f = g / R.main.grams, base = Math.abs(f - 1) < 1e-6;
    if (!fromInput) input.value = asInput(g, unit);
    hint.textContent = unit === 'kg' ? `${weight(g, 'lb')} · ${Math.round(g).toLocaleString()} g` : `${weight(g, 'lb')} · ${+(g / 1000).toFixed(2)} kg`;
    xOut.textContent = `${f.toFixed(2)}×`;
    document.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.u === unit));
    document.querySelectorAll('.chips button').forEach(b => b.setAttribute('aria-pressed', Math.abs(+b.dataset.x - f) < 0.005));
    $('#main-q').textContent = weight(g, unit);

    rows.forEach((row, k) => {
      const ing = R.ingredients[+row.dataset.i];
      const text = base ? ing.t : amount(ing, f);
      const q = row.querySelector('.q');
      if (text !== last[k]) { q.textContent = text; q.classList.remove('flash'); void q.offsetWidth; q.classList.add('flash'); last[k] = text; }
      const s = row.querySelector('small');
      if (s && ing.approx) s.textContent = [ing.note, approx(ing, f)].filter(Boolean).join(' · ');
    });

    const url = new URL(location);
    if (base && unit === R.main.unit) { url.searchParams.delete('amount'); url.searchParams.delete('unit'); }
    else { url.searchParams.set('amount', asInput(g, unit)); url.searchParams.set('unit', unit); }
    history.replaceState(null, '', url);
  }

  input.addEventListener('input', () => {
    const v = parseFloat(input.value.replace(',', '.'));
    if (v > 0 && v < 1000) { g = v * G[unit]; render(true); }
  });
  input.addEventListener('blur', () => render());
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const step = (unit === 'kg' ? 0.1 : 0.25) * (e.shiftKey ? 10 : 1) * (e.key === 'ArrowUp' ? 1 : -1);
      const v = Math.max(step > 0 ? 0 : 0.05, +(g / G[unit] + step).toFixed(3));
      if (v > 0) { g = v * G[unit]; render(); }
    }
  });
  document.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => { unit = b.dataset.u; render(); }));
  document.querySelectorAll('.chips button').forEach(b => b.addEventListener('click', () => { g = R.main.grams * +b.dataset.x; render(); }));

  /* ---------- Ticking off while cooking ---------- */
  const KEY = `recipe:${R.slug}:ticks`;
  const all = [...document.querySelectorAll('.it')];
  let ticks = [];
  try { ticks = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(ticks)); } catch {} };
  all.forEach(b => {
    const id = b.dataset.i ?? 'main';
    b.setAttribute('aria-pressed', ticks.includes(id));
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on);
      ticks = on ? [...ticks, id] : ticks.filter(t => t !== id);
      save();
    });
  });
  $('#clear').addEventListener('click', () => { ticks = []; save(); all.forEach(b => b.setAttribute('aria-pressed', 'false')); });

  /* ---------- Copy ---------- */
  const toast = $('#toast');
  const say = msg => { toast.textContent = msg; toast.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('on'), 1600); };
  $('#copy').addEventListener('click', async () => {
    const lines = all.map(b => `• ${b.querySelector('.n').firstChild.textContent.trim()}: ${b.querySelector('.q').textContent}`);
    const text = `${R.title}\n${lines.join('\n')}\n${location.href}`;
    try { await navigator.clipboard.writeText(text); say('Copied'); } catch { say('Could not copy'); }
  });

  /* ---------- Keep the screen awake ---------- */
  const sw = $('#awake');
  if (!('wakeLock' in navigator)) sw.hidden = true;
  let lock = null;
  async function wake(on) {
    try {
      if (on) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { if (document.visibilityState === 'visible' && sw.getAttribute('aria-checked') !== 'true') lock = null; }); }
      else if (lock) { await lock.release(); lock = null; }
      sw.setAttribute('aria-checked', on);
    } catch { sw.setAttribute('aria-checked', 'false'); }
  }
  sw.addEventListener('click', () => wake(sw.getAttribute('aria-checked') !== 'true'));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && sw.getAttribute('aria-checked') === 'true') wake(true); });

  render();
})();
