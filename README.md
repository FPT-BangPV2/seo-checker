# SEO Tag Inspector - Chrome & Edge Extension ✨

<img src="https://FPT-BangPV2.github.io/seo-checker/extension/icons/icon-512.png" align="right" width="128px"/>

Instantly detect critical SEO issues in the `<head>` section and heading structure of any webpage.

✔ Ideal for SEO Specialists, Front-end Developers, Content Editors, and Agencies performing quick website audits.

## Overview

```js

Popup (UI) ----→ chrome.storage.local (Save last scan) ----→ Export (JSON / CSV)
    ↓
Background Service Worker
    ↓
Content Script
    ↓
DOM Analysis


```

- Popup: Displays results, triggers scans
- Background: Handles messaging and storage
- Content Script: Scans <head> tags and headings directly in the page
- Storage: Keeps last scan for quick reload

## 🎥 Demo (GIF/Video)

![Demo](assets/demo.gif)

---

## ✅ Features

- [x] Detect duplicate tags in `<head>`
      (title, meta description, canonical, robots, Open Graph tags, etc.)

- [x] Validate heading structure
      (multiple `<h1>` tags, missing `<h1>`, skipped heading levels)

- [x] Basic hreflang validation

- [x] Detailed popup with error and warning counts

- [x] Copy JSON results

- [x] Export CSV reports

> Works on any website (including localhost and staging environments)

> 100% privacy – No data sent externally

---

## ⚡ Quick Installation (Developer Mode)

1. **Clone or download** this repository

2. Open **Chrome** → navigate to `chrome://extensions`

3. Enable **Developer mode**

4. Click **Load unpacked** → select the project folder

5. Done! The extension icon will appear in your toolbar

> For **Microsoft Edge**, follow the same steps at `edge://extensions`

---

## 🚀 Upcoming Features

- [ ] Compare `<head>` tags between two URLs (ideal for staging vs production checks)

- [ ] Advanced PDF/CSV report export

- [ ] Tag loading performance checks (e.g., oversized og:image, favicon 404)

- [ ] Dark mode for popup

- [ ] AI-powered meta description suggestions

- [ ] Basic structured data validation (JSON-LD, microdata)

- [ ] Scan history for previously checked pages

- [ ] Domain whitelist/blacklist

- [ ] On-page highlighting (red = critical error, yellow = warning)

---

## 🤝 Contribute

We welcome contributions:

- Add new languages (i18n) – currently supports English and Vietnamese
- Add new SEO validation rules
- Improve UI/UX

---

## License

MIT © 2025 by Bang Developer

---

⭐ If you find this useful, give it a `Star` to support further development!
For issues or feature requests → `open an issue` or contact the maintainer.

**Happy SEO!** 🚀
