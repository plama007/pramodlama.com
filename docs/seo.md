# SEO plan: pramodlama.com

Review date: 2026-11-14. Method: the `seo` skill (purpose → ground → audit → plan → implement → verify).
Baseline snapshots: `docs/seo/baseline-2026-11-14-site.json` (`seo_probe.py site`) and
`docs/seo/baseline-2026-11-14-home.json` (`seo_probe.py page` on the home page), taken against the live site before any change.

Note: GitHub Pages serves this whole repo (`.nojekyll`), so this file and `docs/seo/` are publicly reachable, like
`build.py` and `data/` already are. Nothing in them is private; nothing links to them.

## 1. Purpose brief

| Field | Answer (from the repo's own files) |
|---|---|
| What the site is for | The personal home of Pramod Lama: who he is, the two apps he has built, what he is working on, and a way to send him a message. |
| Who it serves | People who already know the name (colleagues, recruiters, friends, people who met his apps) and want the right person and a way to reach him. Not a blog, not a service business. |
| Business goal SEO supports | Reputation: a search for the name returns this site with the right title, description, photo and favicon. Secondary: visitors click through to Tuckleaf and American Accent Decoded, and send postcards (Formspree form). |
| Success measure | Search Console: impressions/clicks and CTR for name queries ("pramod lama", with variants such as "+ charlotte", "+ microsoft", "+ tuckleaf"); home page indexed with the correct site name and favicon. Outbound app clicks and postcards are not measurable in-repo (no analytics in the repo; not adding any). |
| Site type | Personal / portfolio (one indexable page). |
| Markets and languages | US, English. |
| Constraints | Visual design stays as is. No invented facts. Tools/recipes are described in the launch commit as "private recipe tools" and every built tool page carries `noindex`: treated as intentionally unlisted. |
| Current state (2026-11-14) | Launched 2026-11-12 on GitHub Pages. Search Console / Bing status unknown (no access; owner to set up, §6). |

**Entity sentence:** Pramod Lama, a senior software engineer in Charlotte, NC, who builds small apps (Tuckleaf and
American Accent Decoded) that solve problems he has run into himself.

### Query-to-page map

| Query cluster (intent) | Priority | Target URL | Status | Gap |
|---|---|---|---|---|
| "pramod lama" and variants (navigational / name) | High | `/` | Live, indexable, self-canonical | Title was the bare name; no WebSite/ProfilePage data; favicon was a data: URI. Fixed below. |
| "tuckleaf", "american accent decoded" (brand) | Owned elsewhere | tuckleaf.com, americanaccentdecoded.com | Linked from home | Out of scope here (those sites and the `aso` skill own them). |
| Recipe queries ("pork momo filling", "chicken quarters marinade") | Dropped | `/tools/recipes/…` | Intentionally `noindex` | Ingredient lists only (no method), competing with large recipe sites; owner treats them as private. See owner decision D1. |

## 2. Where the site stands (verified 2026-11-14)

- Live HTML of `/`, `/tools/`, `robots.txt`, `sitemap.xml` and `404.html` is byte-identical to `main` (deployed = repo).
- Hosts: http, www and https-www all 301 to `https://pramodlama.com/` in one hop. Unknown URLs return a real 404.
- Home: 200, self-canonical, `lang="en"`, one H1, 587 words in server HTML, Person JSON-LD parses, OG image 1200×630.
- Home seen as Bingbot and as the Facebook preview bot: same title, description and OG tags (static HTML, no JS rendering needed).
- robots.txt allows every search and AI crawler on `/`; sitemap lists `/` only; `/llms.txt` absent.
- Performance: static HTML on GitHub's CDN (TTFB ~0.25 s measured by the probe), system fonts only, one stylesheet,
  one small inline script, all below-fold images lazy with width/height. PageSpeed Insights API was rate-limited (429)
  from here and local Lighthouse needs a newer Node, so no lab score was taken; no CrUX field data is expected for a
  two-day-old personal site.

## 3. Blockers (fixed)

**B1. `/tools/` was both disallowed in robots.txt and `noindex`.** Evidence: `seo_probe.py page https://pramodlama.com/tools/`
→ `FAIL noindex AND robots.txt disallow`. The home footer links to `/tools/`, so Google could index the bare URL
(no snippet) without ever seeing the noindex. Purpose: the tools are private/unlisted, so they should stay out of
results. Fix: remove `Disallow: /tools/` so crawlers can read the `noindex`; keep `noindex` on every tool page.
Confidence: Google-documented. Verify: probe shows `/tools/` fetchable and noindex; later, Search Console shows the
tools URLs as "Excluded by noindex tag".

## 4. Recommendations, ranked (impact × confidence ÷ effort)

| # | Finding (evidence) | Outcome | Effort | Confidence | Status |
|---|---|---|---|---|---|
| R1 | B1 above | Tools crawlable and noindexed | XS | Google-documented | Done |
| R2 | Favicon is an inline `data:` SVG on every page (`index.html` head); Google needs a crawlable favicon file (square, > 48 px, ICO/PNG; SVG not in its list). Browsers' `/favicon.ico` request also 404s. | `/favicon.ico` (16/32/48), `/favicon-192.png` and `/favicon.svg` with the identical "PL" navy mark, declared on the home page | S | Google-documented (data: URI unsupported is a heuristic) | Done |
| R3 | Home `<title>` is "Pramod Lama" only (11 chars): says nothing about who this Pramod Lama is, so it can't be told apart from namesakes. | Title: `Pramod Lama · Software Engineer & App Maker in Charlotte, NC` (60 chars; every claim is on the page: "Senior Software Engineer", "I make small apps", "Charlotte, NC") | XS | Google-documented (title links) | Done |
| R4 | JSON-LD is a lone Person; no WebSite (site-name source) or ProfilePage. | One `@graph`: WebSite (`name` "Pramod Lama", `alternateName` "pramodlama.com") + ProfilePage (`mainEntity` → Person) + the existing Person facts with an `@id` and a `description` taken from the meta description | S | Google-documented (site names, profile page) | Done |
| R5 | OG tags lack `og:site_name`, `og:locale`, `og:image:alt`; no `twitter:image:alt`. | Added, alt text describes `assets/og.jpg` as it is | XS | ogp.me / X docs | Done |
| R6 | Hero headshot is preloaded but at default (low) image priority. | `fetchpriority="high"` on the preload and the `<img>` (no visual change) | XS | web.dev | Done |
| R7 | `apple-touch-icon` is `headshot-sm.jpg` (466×700, not square). Google may consider it a favicon candidate; iOS crops it. | A square 180×180 icon. Not changed: it alters the home-screen icon (a design choice). | S | Heuristic | Owner decision D2 |
| R8 | American Accent Decoded links go to an App Store *search* URL (`index.html`, `build.py`, marked TODO). | Exact `apps.apple.com/app/id…` link once Apple assigns the ID. | XS | — | Owner/`aso`, pending ID |
| R9 | H1 is the tagline ("I love building things…"); the name is in a `<p>` above it. | Acceptable: the title, Person/WebSite data, alt text and footer carry the name. Changing the H1 would change the design. | — | Opinion | No change |

## 5. Content plan

One indexable page is the right size for the purpose. No new pages are justified by a real query cluster today.
If the owner later wants recipe or app-story traffic, see D1; otherwise the best levers are off-site (consistent
LinkedIn/Facebook profiles that link back, app sites linking to `https://pramodlama.com/` as the maker).

## 6. Owner decisions and owner-only steps

- **D1. Recipes in search?** Currently private (noindex). Indexing them would need method steps, photos and
  Recipe markup to compete; not recommended unless the owner wants that. Kept as is.
- **D2. Square apple-touch-icon** (R7): yes/no.
- **D3. AI crawlers:** all allowed today (search and training). That is fine for a reputation site; blocking training
  crawlers (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot) would not affect search. Owner's call; no change made.

**Search Console (owner signs in):**
1. https://search.google.com/search-console → Add property → **Domain** → `pramodlama.com` → copy the TXT record.
2. At the DNS host for pramodlama.com add a TXT record on `@` with that value; click Verify. Leave it in place.
3. Sitemaps → submit `https://pramodlama.com/sitemap.xml`.
4. URL Inspection → `https://pramodlama.com/` → Test live URL → check the rendered HTML/screenshot, then Request indexing.
5. URL Inspection → `https://pramodlama.com/tools/` → confirm "Excluded by 'noindex' tag" (no request).
6. Settings → Search generative AI: confirm inclusion is on.
7. Add an annotation dated the deploy day: "SEO fixes: robots /tools/, favicon, title, structured data".

**Bing Webmaster Tools:** https://www.bing.com/webmasters → Import from Google Search Console → select pramodlama.com
→ confirm the sitemap is listed (submit `https://pramodlama.com/sitemap.xml` if not).

**After deploy (merging `seo/2026-11-14` to `main`):**
- Rich Results Test https://search.google.com/test/rich-results and https://validator.schema.org/ on `https://pramodlama.com/`.
- Facebook Sharing Debugger https://developers.facebook.com/tools/debug/ and LinkedIn Post Inspector
  https://www.linkedin.com/post-inspector/ on the home URL (also refreshes cached previews).
- PageSpeed Insights (mobile) https://pagespeed.web.dev/ on the home URL; record LCP/CLS/INP here.
- `python3 -I ~/.claude/skills/seo/scripts/seo_probe.py site https://pramodlama.com/ --json` and compare with the baseline.

## 7. Measurement

| Change | KPI | Before | Judge after |
|---|---|---|---|
| R1 | Tools URLs "Excluded by noindex", none indexed | Unknown (no GSC) | 2–4 weeks after deploy |
| R2 | Favicon shown next to the result in mobile search | Unknown | Weeks (Google refreshes favicons slowly) |
| R3–R5 | Name-query impressions, CTR; correct site name "Pramod Lama" | No data yet | 28 days vs following 28 days, from the GSC annotation |

Cadence: weekly GSC coverage check for the first two months, then monthly; full checklist re-walk quarterly.

## 8. Checklist (every item, 2026-11-14)

### 1. Purpose and grounding
- Done: purpose brief; entity sentence (now consistent in title, description and Person/WebSite data).
- Done: repo rules read (no CLAUDE.md/ADRs in repo; launch commit message and build.py read; "private recipe tools" respected).
- Done: live site fetched with mobile UA plus bingbot and facebook; live = repo.
- Done: query clusters and query-to-page map; recipe cluster dropped (private).
- Done: baseline (probe JSON). Gap (owner): no Search Console/Bing numbers yet.
- Done: privacy — no searches made with the owner's name, domain or apps.

### 2. Crawl and index
- Done: indexable page returns 200; unknown URLs 404; no soft 404s seen.
- Done: one https origin; http/www → 301 in one hop.
- Done: no redirects/old URLs to maintain (new site).
- Done (after R1): robots.txt reachable, tiny, blocks nothing needed for rendering, lists the sitemap.
- Gap → fixed (R1): `/tools/` disallowed and noindexed.
- Done: noindex only on tools pages and 404; home indexable; noindex is in server HTML, not JS.
- Done: absolute self-canonical on every page; trailing-slash style consistent.
- Done: sitemap lists only `/` (the only indexable 200 URL); no lastmod (no true date) — fine. Gap (owner): submit in GSC/Bing.
- Done: server HTML has title, description, canonical, content, links, JSON-LD (static site).
- Done: real `<a href>` links; home links to `/tools/` in the footer.
- Done: responsive single URL, viewport set.
- n/a: hreflang (English only).
- n/a: no staging/previews.

### 3. On-page and content
- Gap → fixed (R3): home title. Tool page titles unique ("Recipes · Pramod Lama" etc.).
- Done: unique meta descriptions.
- Done: one H1 per page, `lang="en"`, text content. R9 noted, no change.
- Done: home content is first-hand and specific (apps, why built, travel). No templated pages.
- Done: spam-policy check clean (no hidden text, stuffing, fake reviews).
- Done: new text (title, alt, JSON-LD description) uses only facts already on the page.
- Done: images have alt (decorative icons `alt=""`), width/height, below-fold lazy. JPG/PNG, not WebP/AVIF — low priority at these sizes.
- n/a: no video.
- Gap → fixed (R5): OG/X tags complete on home; tools pages use a summary card with the headshot (noindexed, fine).
- Gap → fixed (R2, R4): crawlable favicon; WebSite data for site name. R7 owner decision.
- Done: tiny site; navigation covers all sections.

### 4. Structured data
- Done: JSON-LD in server HTML, valid JSON, visible true facts.
- Gap → fixed (R4): WebSite + ProfilePage + Person.
- Done: no ratings/reviews marked up.
- Done: no FAQPage/HowTo/SearchAction added.
- Gap (owner, after deploy): Rich Results Test / Schema validator; local parse check passes (§9).

### 5. Performance
- Gap: no field data (new, low-traffic site) and no lab run (PSI 429, Node 18.15 too old for Lighthouse 12/13). Owner runs PSI after deploy.
- Likely fine by construction: static HTML, CDN, no web fonts, no third-party JS on load (Formspree only on submit).
- Improved (R6): LCP candidate image prioritised. Hero text uses a 0.9 s fade-in (`.rise`); worth watching in PSI, not changed (design).
- Done: images sized; no late-inserted content above the fold.
- Done: GitHub Pages compresses and caches (max-age=600).

### 6. Off-page, local, AI
- n/a: local SEO (not a local business; city appears only as personal location).
- Done: no link schemes; external links are the owner's own profiles/apps.
- Done: `sameAs` LinkedIn + Facebook, both linked from the footer. Owner: make sure those profiles link back to https://pramodlama.com/.
- n/a: app landing pages live on the apps' own sites; R8 for the exact App Store link.
- Done: Googlebot, Bingbot and AI search crawlers allowed; training crawlers decision D3. Gap (owner): GSC AI-inclusion check.
- Done: llms.txt considered — skipped (one-page personal site, not used by Google Search).

### 7. Measurement
- Gap (owner): GSC Domain property + Bing; sitemap submission (§6). IndexNow not worth it for one page.
- Done: success measure defined; no analytics added (none in repo).
- Done: KPIs and windows in §7.

### 8. Plan and verification
- Done: ranked, blockers first; owner decisions separated.
- Done pre-deploy (§9); post-deploy steps listed in §6 for the owner.

## 9. Verification log

2026-11-14, pre-deploy, branch `seo/2026-11-14` (not pushed, not deployed):

- `python3 build.py` → "Built 5 pages", no diff in generated tool pages (build.py itself unchanged).
- `seo_probe.py file index.html --base https://pramodlama.com/` → title 60 chars as planned; self-canonical OK;
  JSON-LD parses: WebSite, ProfilePage, Person (+ Organization, PostalAddress); every `@id` reference resolves.
- `seo_probe.py file` on `/tools/`, `/tools/recipes/`, `/tools/recipes/pork-momo/` → noindex (intended), self-canonical OK.
- Local server + `seo_probe.py page http://127.0.0.1:8765/tools/` → "Googlebot may fetch /tools/" and noindex
  present: the disallow + noindex contradiction is gone (https/canonical warnings there are only because of localhost).
- `/favicon.ico` (image/x-icon, 16/32/48), `/favicon.svg`, `/favicon-192.png` (192×192) served with status 200.
- Skill probe self-tests (`test_seo_probe.py`) pass.
- Not done here (needs deploy or owner accounts): live probe re-run vs baseline, Rich Results Test, Schema validator,
  sharing debuggers, URL Inspection, sitemap submission, PageSpeed Insights. Steps in §6.
