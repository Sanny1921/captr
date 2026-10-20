# CAPTR - website

Clipping & influencer marketing agency, Patna. One-page static site (no build step).

- `index.html` home (hero, what we do, why CAPTR, brands, creator types, creators + join form, FAQ)
- `privacy.html`, `404.html`, `style.css`, `app.js`, `config.js`
- Creator applications post to a Google Apps Script web app (URL in `config.js`) -> Google Sheet + Drive uploads + email notification
- Deployed on Vercel (static). Preview carries `noindex`; remove it and set the live domain in canonical/OG/sitemap at go-live.
