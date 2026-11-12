#!/usr/bin/env python3
"""Builds every page of pramodlama.com. Run `python3 build.py` after editing data/recipes.json."""
import html
import json
from pathlib import Path

ROOT = Path(__file__).parent
SITE = "https://pramodlama.com"
LINKEDIN = "https://www.linkedin.com/in/plama001/"
RECIPES = json.loads((ROOT / "data/recipes.json").read_text())
e = html.escape

ICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E"
        "%3Crect width='64' height='64' rx='16' fill='%23161616'/%3E%3Ctext x='32' y='42' "
        "font-family='-apple-system,Helvetica,Arial,sans-serif' font-size='28' font-weight='600' "
        "fill='white' text-anchor='middle'%3EPL%3C/text%3E%3C/svg%3E")
OUT = '<svg class="arrow" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5"/></svg>'
NEXT = '<svg class="arrow r" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>'
BACK = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 8H3M7 4 3 8l4 4"/></svg>'
CHECK = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2.5 6.2 2.3 2.3 4.7-5"/></svg>'
POT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11h18M5 11v6a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-6M1.5 11H3m18 0h1.5M9 7c0-1.5 1-1.5 1-3M13 7c0-1.5 1-1.5 1-3"/></svg>'


def page(path, title, desc, body, nav="", extra_head="", scripts="", home=False):
    url = f"{SITE}/{path}"
    full = "Pramod Lama" if not title else f"{title} · Pramod Lama"
    links = "".join(f'<a href="{h}"{" aria-current=\"page\"" if n == nav else ""}>{n}</a>'
                    for n, h in [("Tools", "/tools/")])
    doc = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<title>{e(full)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:title" content="{e(full)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/assets/headshot-sm.jpg">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#fcfcfb" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0e0e0e" media="(prefers-color-scheme: dark)">
<link rel="icon" href="{ICON}">
<link rel="apple-touch-icon" href="/assets/headshot-sm.jpg">
<link rel="stylesheet" href="/css/style.css">
{extra_head}</head>
<body>
<header class="top{' bare' if home else ''}">
  {'' if home else '<a class="brand" href="/"><img src="/assets/headshot-sm.jpg" alt="" width="26" height="26">Pramod Lama</a>'}
  <nav aria-label="Main">{links}</nav>
</header>
<main class="page">
{body}
</main>
<footer class="foot">
  <span>Charlotte, NC<span id="clock"></span></span>
  <a href="{LINKEDIN}" target="_blank" rel="noopener">LinkedIn</a>
</footer>
<script src="/js/site.js" defer></script>
{scripts}</body>
</html>
"""
    out = ROOT / path / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(doc)


def row(href, icon, t, d, m="", external=False):
    attrs = ' target="_blank" rel="noopener"' if external else ""
    return (f'<li><a class="row" href="{href}"{attrs}>{icon}<span><span class="t">{t}</span>'
            f'<span class="d" style="display:block">{d}</span></span>'
            f'<span class="m">{m}{OUT if external else NEXT}</span></a></li>')


def tile(svg):
    return f'<span class="tile">{svg}</span>'


def app_rows():
    return "\n".join([
        row("https://apps.apple.com/app/id6824646026",
            '<img class="ic" src="/assets/tuckleaf.png" alt="" width="40" height="40">',
            "Tuckleaf", "A notebook for the words you meet while reading.", "App Store", True),
        # TODO: direct link once Apple assigns the ID (american-accent-decoded-site/build.py APP_STORE_ID)
        row("https://apps.apple.com/search?term=American%20Accent%20Decoded",
            '<img class="ic" src="/assets/accent.png" alt="" width="40" height="40">',
            "American Accent Decoded", "The American accent as 69 patterns you can hear and say.", "App Store", True),
    ])


def tool_rows():
    n = len(RECIPES)
    return row("/tools/recipes/", tile(POT), "Recipes",
               "My recipes. Type how much meat you have and every amount re-works itself.",
               f"{n} recipes")


# The home page (index.html) is hand-written; it has its own stylesheet, css/home.css.

# ---------- Tools ----------
page("tools/", "Tools", "Small tools Pramod Lama builds for everyday problems.", f"""
<div class="head">
  <h1>Tools</h1>
  <p>Small things I built because I needed them. They run in your browser, nothing to install.</p>
</div>
<section class="block" style="margin-top:32px">
  <ul class="rows">
{tool_rows()}
  </ul>
  <p class="muted-note">More as I build them.</p>
</section>""", nav="Tools")

# ---------- Recipes ----------
def main_text(r):
    m = r["main"]
    g = m["grams"]
    if m["unit"] == "kg":
        return f'{float(f"{g / 1000:.3f}"):g} kg'
    lb, oz = divmod(round(g / 28.349523125), 16)
    return " ".join(x for x in [f"{lb} lb" if lb else "", f"{oz} oz" if oz else ""] if x)


rec_rows = "\n".join(
    row(f"/tools/recipes/{r['slug']}/", "", e(r["title"]), e(r["summary"]), e(f"{main_text(r)} {r['main']['name'].lower()}"))
    .replace('<a class="row"', '<a class="row" style="grid-template-columns:1fr auto"')
    for r in RECIPES)
page("tools/recipes/", "Recipes", "Pramod's recipes, scaled to however much you're cooking.", f"""
<a class="crumb" href="/tools/">{BACK}Tools</a>
<div class="head">
  <h1>Recipes</h1>
  <p>Pick one, then type how much meat you have. Every other amount follows.</p>
</div>
<section class="block" style="margin-top:32px">
  <ul class="rows">
{rec_rows}
  </ul>
</section>""", nav="Tools")

MULTS = [(0.5, "½×"), (1, "1×"), (1.5, "1½×"), (2, "2×"), (3, "3×")]
for r in RECIPES:
    m = r["main"]
    items = []
    for i, ing in enumerate(r["ingredients"]):
        sub = " · ".join(x for x in [ing.get("note", ""), f"≈ {ing['approx'][0]} {ing['approx'][1]}" if "approx" in ing else ""] if x)
        items.append(f'<li><button class="it" type="button" data-i="{i}" aria-pressed="false">'
                     f'<span class="box">{CHECK}</span><span class="n">{e(ing["name"])}'
                     f'{f"<small>{e(sub)}</small>" if sub else ""}</span><span class="q">{e(ing["t"])}</span></button></li>')
    main_note = f'<small>{e(m["note"])}</small>' if m.get("note") else ""
    data = json.dumps(r, ensure_ascii=False).replace("</", "<\\/")
    page(f"tools/recipes/{r['slug']}/", r["title"], f"{r['title']}: {r['summary']} Scales to any amount.", f"""
<a class="crumb" href="/tools/recipes/">{BACK}Recipes</a>
<div class="head">
  <h1>{e(r["title"])}</h1>
  <p>{e(r["summary"])}</p>
</div>
<div class="scaler">
  <label for="amt">{e(m["name"])} you have, by weight</label>
  <div class="amount">
    <input id="amt" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value="" aria-describedby="hint">
    <div class="seg" role="group" aria-label="Unit"><button type="button" data-u="kg">kg</button><button type="button" data-u="lb">lb</button></div>
  </div>
  <p class="hint" id="hint"></p>
  <div class="chips" role="group" aria-label="Quick amounts">
    {"".join(f'<button type="button" data-x="{x}">{lbl}</button>' for x, lbl in MULTS)}
    <span class="x" id="factor" aria-live="polite">1.00×</span>
  </div>
</div>
<div class="list-head">
  <h2>Ingredients</h2>
  <div class="tools"><button type="button" id="copy">Copy list</button><button type="button" id="clear">Untick all</button></div>
</div>
<ul class="ing">
  <li><button class="it main" type="button" aria-pressed="false"><span class="box">{CHECK}</span><span class="n">{e(m["name"])}{main_note}</span><span class="q" id="main-q">{main_text(r)}</span></button></li>
  {"".join(items)}
</ul>
<div class="extras">
  <span>Tap an ingredient to tick it off.</span>
  <button class="switch" id="awake" type="button" role="switch" aria-checked="false"><span class="k"></span>Keep screen on</button>
</div>
<div class="toast" id="toast" role="status"></div>
<script type="application/json" id="recipe-data">{data}</script>""",
         nav="Tools", scripts='<script src="/js/recipe.js" defer></script>\n')

print("Built", 2 + len(RECIPES), "pages")
