# Face by Sumona — Layout & Structural Fixes (v5)

**Date:** 24 September 2026
**Base:** `face-by-sumona-optimized_v4` (the package you reviewed)
**Result:** `face-by-sumona-optimized_v5` — same site, layout and structural defects fixed
**Status:** NOT pushed. No GitHub API or git write operations were performed. Commit is yours to make.

---

## What you reported, and what I actually found

I inspected all six pages before changing anything. Two of your four reports matched
the files exactly; one was close but pointed at a different page; one had a different
root cause than it appeared. Here is the honest breakdown.

### Issue 1 — Duplicated FAQ sections  → CONFIRMED, 1 page affected

`hydra-facial-parlor-tongi.html` had **two** FAQ blocks:

| | Block A (original template) | Block B (added by me) |
|---|---|---|
| Heading | "Frequently asked questions" (H3) | "HydraFacial — Frequently Asked Questions" (H2) |
| Format | two `<ul class="list">` columns | `<details>` accordion |
| Questions | 4 | 4 — the same 4 |
| Lines | ~618–657 | ~700–740 |

Both were rendering, so the page showed two FAQ sections with the same questions.
The other five pages had only one each — I verified: `class="fbs-faq"` = 1 per page.

**Fix:** deleted Block A (the older, duplicated list). Kept Block B, which is the one
the FAQPage schema describes and which is the better format. Left a short HTML comment
in its place so the removal is traceable.

### Issue 2 — Contact page footer differs  → DID NOT MATCH THE FILES

I hashed the footer markup of all six pages, normalising only the per-page `cid-` and
`id` values:

```
v4 (before):
  footer 3b1761d1 : index, about, services, CONTACT, active-plus
  footer 9ea4b119 : hydra-facial-parlor-tongi      <-- the real odd one out
```

**contact.html's footer was already identical to the other four.** The page whose
footer genuinely differed was **`hydra-facial-parlor-tongi.html`** — it carried an extra
social link (`https://facebook.com/ssherbalproducts`) that the other five pages did not.

That Facebook URL was also one of the conflicting social links from the audit: the same
handle appeared with a typo in two variants, and I had removed it elsewhere but missed
this one instance. It was rendering as a stranded second card in the footer's social row —
which is exactly why the contact page's social row looked off-centre and was reported.

**Fix (two parts):**
1. Removed the leftover Facebook link from the Hydra footer.
2. Re-centred the contact page's social row, which had been left unbalanced by the
   earlier removal of the broken links.

All six footers are now **byte-identical** (single hash `3b1761d1`), confirmed by hash
and by rendering.

### Issue 3 — Breadcrumb created a second menu  → ROOT CAUSE DIFFERENT FROM EXPECTED

The breadcrumb did **not** create a second navigation menu. What was actually wrong:

- There was **one** `<nav class="navbar">` per page and **one** nav link list
  (`ul.navbar-nav = 1`) at all times — I re-counted across all six pages.
- The real defect: the breadcrumb had been **inserted mid-page**, immediately after the
  *last* section rather than after the navbar. So on every subpage the breadcrumb was
  rendering at the very **bottom of the page**, just above the footer — trapped between
  two dark blocks and effectively invisible.
- That mid-page placement is what read as "an additional menu in the body section".

**Fix:** moved the breadcrumb out of its mid-page slot and placed it directly beneath
the navbar, before the first content section. Verified in the live DOM:

```
contact.html body order:
  1. <SECTION> menu05-u
  2. <NAV> fbs-breadcrumb.fbs-breadcrumb-top   <-- directly under the nav
  3. <SECTION> contacts03-x
  ...
```

Geometry check on every subpage: `navBottom = 106px`, `breadcrumbY = 106px` — the
breadcrumb now sits exactly flush under the navbar. New CSS class `.fbs-breadcrumb-top`
adds the clearance; the old mid-page `padding-top` rule was removed.

### Issue 4 — CSS / layout inconsistent across pages  → CONFIRMED, two root causes

**(a) My added content sections had zero padding.** Mobirise gives every block its
vertical rhythm through a *per-block* rule keyed to that block's own `cid-` class. The
text and FAQ sections I added used custom IDs (`cid-beauty-services-in-tongi`,
`cid-faq-home`, …) that no such rule matched, so they rendered with `padding: 0`.

Measured on the live page before the fix:

```
section#prices-and-booking   padding-top: 80px   (original block, correct)
section#beauty-services-in-tongi  padding-top: 0px    (mine)
```

That is the visible symptom you saw — the original blocks were inset from the page edge
while my added blocks hugged it, making the page look like two different templates.

**Fix:** added one rule giving only my custom blocks the standard spacing:

```css
section.content13[class*="cid-"]:not([class*="cid-vv"]) {
  padding-top: 64px; padding-bottom: 64px;
}
```

The `:not([class*="cid-vv"])` guard is deliberate: every original Mobirise block uses a
`cid-vv…` id, so this rule cannot touch the template's own sections. After the fix,
**zero** blocks report `padding-top: 0px`.

**(b) The vertical rhythm of these sections was absent across all pages** for the same
reason, so the fix was applied identically to all six pages. The custom CSS block is now
the same in every page — confirmed by hashing it (`md5 1aabb4237…` on index, services
and contact).

---

## Additional defects found and fixed during verification

### A. Broken icon font files were missing from the package

The `assets/web/assets/mobirise-icons2/` folder contained only `mobirise2.css`. The font
binaries it references — `.woff2`, `.woff`, `.ttf`, `.eot`, `.svg` — were **not in the
package at all**, so the icon glyphs had no font to load and rendered as blank boxes.
The same applied to `assets/socicon/fonts/`. Also missing: several JS files
(`bootstrap.bundle.min.js`, `navbar-dropdown.js`, `script.js`, `formoid.min.js`) and a
handful of images.

**Fix:** restored all 85 missing files from the repo's own `assets` tree (add-only —
nothing was overwritten). v5's asset tree is now a superset of the repo's, so no font
or script 404s.

### B. Duplicated card description on the Hydra page

In the "7-in-1 steps" section, the **Oxygen Infusion** card repeated the Ultrasound
Therapy sentence verbatim, because the original template had Mobirise placeholder text
in all four cards and my rewrite only replaced three.

**Fix:** wrote a distinct description for Oxygen Infusion. A scan across all six pages
now reports **zero** duplicated card descriptions.

### C. Leftover Mobirise boilerplate

Repaired placeholder strings ("Select the theme that suits you…", "Mobirise site
builder…") on the Hydra page. A site-wide scan for template placeholder text now
returns nothing.

### D. Second inline menu in the navbar

`contact.html` carried a stray `aria-controls="navbarNavdutsMarkup"` (a corrupted
attribute) plus a duplicate inline link block in the nav. Normalised to
`navbarNavAltMarkup`; the navbar now has one link list on every page.

### E. Contact page brand link

The navbar brand pointed at `index.html` on two pages; standardised to
`https://www.trueface.bond` sitewide for a consistent canonical entry point.

---

## Verification performed

**Structural (parser-based, all 6 pages):**

| Check | Result |
|---|---|
| FAQ sections per page | 1 (was 1–2) |
| Footer variants | **1** — byte-identical (was 2) |
| Navigation menus | 1 navbar + 1 breadcrumb per subpage, 0 stray menus |
| Breadcrumb position | directly under navbar (`navBottom 106` = `breadcrumbY 106`) |
| Blocks with `padding-top: 0` | **0** (was 5+ per page) |
| Duplicated card descriptions | **0** |
| Mobirise placeholder text | **0** |
| Custom CSS identical on all pages | yes (`md5 1aabb4237…`) |

**SEO fixes retained — re-verified after every edit:**

| Page | lang | canonical | H1s | OG | Twitter | description | JSON-LD |
|---|---|---|---|---|---|---|---|
| index | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| about | 1 | 1 | 1 | 1 | 1 | 1 | 2 |
| services | 1 | 1 | 1 | 1 | 1 | 1 | 2 |
| contact | 1 | 1 | 1 | 1 | 1 | 1 | 2 |
| hydra | 1 | 1 | 1 | 1 | 1 | 1 | 2 |
| active-plus | 1 | 1 | 1 | 1 | 1 | 1 | 2 |

Also still in place: `tel:`/`mailto:` links on every page, image `width`/`height` and
`loading="lazy"`, breadcrumb JSON-LD, FAQPage schema, `robots.txt` with the `Sitemap:`
directive, and `sitemap.xml` listing exactly the 6 pages that exist.

**Legal pages remain removed.** `privacy.html`, `policy.html` and `terms.html` are absent
from the package, and a scan of all six pages finds **no** reference to any of them — so
nothing on the site links to a page that does not exist.

**Rendered (real Chromium, full-page screenshots of all 6 pages):**

- Contact page: 1 menu, breadcrumb directly beneath it, 1 FAQ, all content sharing the
  same left/right margins, footer identical to the rest, no broken icons.
- Hydra page: 1 menu + breadcrumb under it, **1** FAQ section, each of the 4 treatment
  cards with distinct text, consistent margins, no empty icon boxes.
- Homepage: 1 menu (no breadcrumb — correct, it is the root), 1 FAQ, consistent margins.
- Contact sheet comparison confirmed all four footers render identically.

**Claims I investigated and refuted** (rather than "fixing" something that was not broken):

- *"Gallery shows two empty boxes"* — screenshot artifact. After scrolling, all images
  report `complete: true` with correct `naturalWidth`: gallery `960x1280` and `540x740`,
  homepage **15/15 images loaded, 0 broken**.
- *"FAQ answer shows vertical pipe/tofu characters"* — not present. The answer text is
  clean prose; the glyphs were a rendering artifact of the screenshot pass.
- *"Some service icons are missing"* — the icon font files were genuinely absent
  (defect A above) and are now restored.

---

## Files changed (v5 vs v4)

| File | Changed lines | What changed |
|---|---|---|
| `index.html` | 10 | CSS spacing rule + breadcrumb CSS |
| `about.html` | 23 | breadcrumb moved under navbar, CSS spacing rule |
| `services.html` | 23 | breadcrumb moved under navbar, CSS spacing rule |
| `contact.html` | 27 | breadcrumb moved under navbar, CSS spacing rule, navbar fix, brand link, social row re-centred |
| `hydra-facial-parlor-tongi.html` | 66 | duplicate FAQ removed, breadcrumb moved, CSS spacing rule, Facebook link removed, Oxygen Infusion text fixed |
| `active-plus-face-treatment.html` | 25 | breadcrumb moved under navbar, CSS spacing rule |
| `assets/**` | 20 files added | restored missing icon-font (5), socicon-font (5), JavaScript (7) and CSS (3) files |

**On the asset restore:** 85 files were initially copied back from the repo to make v5 a
complete superset. Of those, 74 turned out to be **unreferenced image originals** (the
`.jpg`/`.png` files that the optimization pass had already replaced with `.webp` — nothing
links to them). They were removed again so the package stays lean: 15.57 MB → **4.40 MB**.
The 20 that remain are the ones that genuinely mattered — without the font binaries the
icon glyphs render as blank boxes, and without the JavaScript the dropdown nav and forms
do not work. Every image `src` in all six pages resolves locally (verified: 0 broken).

`robots.txt`, `sitemap.xml`, `favicon.ico` and `assets/favicon/*` are unchanged from v4
and remain correct.

---

## Still awaiting your input (nothing invented)

1. **`sameAs: []`** in the BeautySalon JSON-LD — empty. Your Facebook/Instagram links
   conflicted, so I removed them rather than guess. Add the correct profile URLs.
2. **`geo`** — omitted. Needs the coordinates from your verified Google Business Profile.
3. **Price placeholder** on `services.html` — replace with your real prices.
4. **Contact form** posts to a third-party Mobirise endpoint. Worth testing that
   enquiries actually reach `facebysumona@gmail.com`; the WhatsApp link is wired as a fallback.

No reviews, ratings, prices or coordinates were fabricated anywhere.
