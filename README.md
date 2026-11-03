# Lift Commerce website

The source for www.liftcommerce.io. It is plain static HTML with no build step and no framework.
Cloudflare Pages publishes the `site/` folder.

> **If you are Claude (or another AI assistant) editing this repo:** read this whole file first.
> The "Rules for editing" and "Content and positioning" sections apply to every change.

## How changes go live

```
edit files → commit → push to GitHub → Cloudflare Pages publishes (about a minute)
```

| Branch | Where it goes |
|---|---|
| `main` | The live site (production) |
| any other branch | Its own preview link, e.g. `my-change.<project>.pages.dev`. Use this to check a change before it goes live. |

Cloudflare Pages settings: framework preset **None**, build command **empty**, build output
directory **`site`**, production branch **`main`**. The `functions/` folder is picked up
automatically.

## Folder layout

```
site/                         everything that gets published
  index.html                  homepage (uses assets/css/site.css and assets/js/site.js)
  shipping-calculator.html    FedEx Ground shipping cost calculator
  contact.html, shipping-scorecard.html, 404.html
  *-shipping-integration.html one page per platform (Shopify, Amazon, ...), flat at the root
  services/                   4 service pages
  resources/                  4 explainer pages (dimensional weight, additional handling, ...)
  industries/                 10 industry pages
  assets/css/site.css         homepage styles only
  assets/js/site.js           homepage navigation script
  assets/js/shipping-calculator.js   calculator logic and all FedEx rate data
  assets/img/                 logos, payment badges, share image, integration logos
  sitemap.xml, robots.txt, _headers
functions/api/fedex-fuel.js   Cloudflare Pages Function: live weekly FedEx fuel surcharge
```

## Preview on your own computer

You need Node.js. From the repo folder:

```
cd site
npx serve@14 . -l 3000
```

Then open http://localhost:3000. Clean URLs like `/contact` work the same as on Cloudflare.
`/api/fedex-fuel` only runs on Cloudflare. Locally, the calculator uses its built-in fuel figure.

## Rules for editing

1. **Pull before you start** (`git pull`). More than one person (and their Claude) pushes to
   this repo.
2. **Use a preview branch for anything bigger than a typo.** Check the preview link, then merge to `main`.
3. **Every page except the homepage is self-contained.** Its CSS is in a `<style>` block in its
   own `<head>`, and its menu script is inline at the bottom. A style change on one page does not
   affect the others.
4. **The header menu and footer are copied into every page.** To add, rename or remove a menu
   or footer link, change it in **all** `.html` files (search the whole `site/` folder) so the
   menus stay identical.
5. **Links:** internal links are root-relative without `.html` (`/contact`,
   `/resources/dimensional-weight`). Image and CSS paths are relative to the page's own folder
   (`assets/...` at the root, `../assets/...` inside `services/`, `resources/`, `industries/`).
   This lets pages open straight from disk as well as on the server. `404.html` is the exception
   and uses `/assets/...`.
6. **Each page has SEO tags in its `<head>`:** `<title>`, meta description, canonical URL,
   Open Graph tags and JSON-LD structured data. Canonical, `og:url` and schema URLs are
   absolute (`https://www.liftcommerce.io/...`). When you change a page's headline or FAQ text,
   update the matching tags and JSON-LD too.
7. **New page:** copy the closest existing page as a template, then add the URL to
   `site/sitemap.xml` and link to it from somewhere (menu, footer or a related page).
8. **Keep the URLs.** Integration pages match the old live site's URLs (e.g.
   `/shopify-shipping-integration`). Changing a URL loses its search ranking unless a redirect is added.
9. **Images:** put them in `site/assets/img/`, prefer `.avif` or `.webp`, and set `width`,
   `height` and a descriptive `alt`.
10. **Don't commit secrets or private files:** no API keys, rate agreements, client invoices or
    meeting notes. **This repository is public.**

## Shipping cost calculator

Page: `site/shipping-calculator.html`. Logic and data: `site/assets/js/shipping-calculator.js`.

All FedEx figures are in the `FEDEX` object at the top of the JS file, with their sources:

- **Base rates:** FedEx Standard List Rates 2026, FedEx Ground, 1–150 lb, zones 2–8.
- **Minimum charge:** $11.99 (the 2026 Zone 2, 1 lb rate). Editable on the page.
- **Additional handling** (weight / dimension / packaging) and **Oversize**, by zone.
  FedEx charges only the highest additional handling charge, and Oversize replaces additional handling.
- **Peak (demand) surcharges:** amounts and date ranges.
- **Fuel:** a fallback percentage and its week. The live figure comes from
  `/api/fedex-fuel`, which reads fedex.com's fuel page and caches it for 6 hours. If that
  fails, the page uses the fallback, so update `FEDEX.fuel` now and then.

The trigger thresholds (50 lb, 48 in, 105 in, 96 in, 130 in, cubic limits, minimum billable
weights) are in the `RULE` object.

**Every January**, when FedEx publishes new rates, replace the `FEDEX` values (base rate table,
minimum, surcharges) and update the peak dates when FedEx announces them (usually summer).
Then change "2026" in the page title, description and text.

The calculator does not include residential, delivery area or other surcharges. A UPS
version is planned. Keep the page URL `/shipping-calculator` carrier-neutral so UPS can be added to it.

## Content and positioning

- Lift Commerce is **software plus expertise**: free multi-carrier shipping software, plus
  people who negotiate and audit carrier contracts. Do not present it as a pure parcel reseller.
- **There is no single "Lift Commerce rate."** Discounts depend on each customer's industry,
  volume and current carrier. Never publish or imply one rate or one guaranteed saving.
- Write for the person who lands on the page and their actual problem (e.g. an Amazon seller
  shipping large items who is being hit by additional handling fees), not generic platform copy.
- Calls to action go to `/shipping-scorecard` (free invoice analysis) or `/contact`.
- Contact details used across the site: +1 (203) 601-6208, Team@LiftCommerce.net,
  55 Post Road West, Westport, CT 06880.

## Known to-dos

- Body copy on `/resources/shipping-large-boxes` and `/resources/additional-handling` still
  quotes an old $1,950 over-maximum charge and "both carriers". It needs a rewrite against
  current FedEx figures.
- Rewrite the integration pages around who lands there and why.
- Add photos (people using the software, warehouse imagery).
- New logo (keep the flying box, slightly simplified). Then redo `assets/img/og-default.jpg`,
  which still shows the old "Stop overpaying..." headline.
- Contact form posts to FormSubmit (team@liftcommerce.net) and needs a one-time activation from that inbox, if not done yet.
