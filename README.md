# ChatGPT Conversation Explorer

**Created by [Alyssa Fu Ward](https://substack.com/@alyssafuward)**

A browser-based tool for exploring your ChatGPT conversation history. Upload your exported data and instantly get a searchable, visual breakdown of everything you've talked about — organized by topic, mapped across time, and fully readable.

**Your data never leaves your browser.** All processing happens locally. Nothing is sent to any server.

---

## Features

- **Overview** — monthly conversation volume and topic breakdown charts
- **Topics** — auto-classified conversations grouped into themes; click any topic to browse conversations, click any conversation to read the full thread
- **Search** — full-text search across titles and message content with highlighted snippets
- **Timeline** — line chart showing how your topics shifted month by month, with toggleable topic filters

---

## How to Use

### 1. Export your ChatGPT data

In ChatGPT: **Settings → Data Controls → Export Data**

You'll receive an email with a `.zip` file. Extract it — you're looking for either:
- A single `conversations.json` file, or
- Multiple numbered files: `conversations-000.json`, `conversations-001.json`, etc.

### 2. Open the app

Open `index.html` directly in any modern browser — no installation, no server needed.

Or visit the hosted version at: https://alyssafuward.github.io/chatgpt-explorer/

### 3. Upload your files

Drag and drop your JSON file(s) onto the upload area, or click to browse. Multiple files are supported. The app will process everything and display your dashboard immediately.

---

## Hosting

This is a static HTML file. You can host it anywhere:

- **GitHub Pages** — push to a repo and enable Pages in settings
- **Netlify / Vercel** — drag the folder into the dashboard
- **Locally** — just open `index.html` in a browser

No build step, no dependencies to install, no server required.

---

## Cloning & Developing

```bash
git clone https://github.com/alyssafuward/chatgpt-explorer.git
cd chatgpt-explorer
open index.html
```

Everything is in `index.html`. Topics are classified using TF-IDF scoring against the `TOPICS` object in the `<script>` block, which follows the [IAB Content Taxonomy 3.0](https://github.com/InteractiveAdvertisingBureau/Taxonomies) (25 categories). Classification uses conversation titles (weighted 3×) plus the first five user messages for context — so even vague titles get classified from content. You can edit the keyword lists in `TOPICS` to add or adjust categories, though note that individual keyword changes can have unintended side effects across the corpus.

---

## Security Assessment

A security review was conducted on this codebase. Here is the full assessment.

### Architecture

This is a **purely client-side application**. It loads one external script (Chart.js), reads local files via the browser's File API, and performs all analysis in memory. It makes zero network requests after the initial page load. There is no backend, no database, no authentication layer, and no analytics.

### Findings

#### ✅ No XSS vulnerability

All user-supplied data (conversation titles, message text) is inserted into the DOM using `textContent` — never `innerHTML`. This is the correct approach and eliminates the primary XSS attack surface. This applies consistently throughout the codebase including the conversation drawer, topic browser, search results, and search highlighting.

#### ✅ No data exfiltration

The codebase contains no `fetch()`, `XMLHttpRequest`, `navigator.sendBeacon()`, or any other mechanism that could transmit user data to an external server. No analytics libraries are loaded. Conversation data is held in a JavaScript variable for the duration of the browser session and discarded when the page is closed or reset.

#### ✅ No dynamic code execution

There is no use of `eval()`, `new Function()`, or `setTimeout`/`setInterval` with string arguments anywhere in the codebase.

#### ✅ Circular reference protection

The message traversal algorithm (which walks the ChatGPT conversation tree) uses a `Set` to track visited nodes, preventing infinite loops from malformed or circular JSON structures.

#### ✅ Versioned CDN dependency

Chart.js is loaded from a specific pinned version (`@4.4.0`), not `@latest`. This prevents unexpected breakage or behavior changes from upstream updates.

#### ✅ Subresource Integrity (SRI)

The Chart.js CDN script tag includes a cryptographic hash via the `integrity` attribute:

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
        integrity="sha384-e6nUZLBkQ86NJ6TVVKAeSaK8jWa3NhkYWZFomE39AvDbQWeie9PlQqM3pmYW5d1g"
        crossorigin="anonymous"></script>
```

If the CDN ever serves a tampered version of the file, the browser will refuse to execute it. This protects against supply chain attacks on the CDN.

#### ✅ File size limit

File uploads are capped at 100 MB per file. This prevents a malformed or oversized JSON from freezing the browser tab. The check happens before the file is read, with a clear error message to the user.

#### ⚠️ No Content Security Policy (CSP)

The app does not include a CSP header or meta tag. A CSP would provide an additional layer of protection by restricting which scripts and resources the browser is allowed to load.

**Why this is low risk here:** CSP only matters as a second line of defense if there is already an XSS vulnerability. Since user data is handled exclusively with `textContent`, there is no XSS path for CSP to protect against. Adding a strict CSP would require extracting all inline styles to a separate file, which adds complexity without meaningful security benefit at this threat level.

**If you fork this project and add dynamic HTML rendering** (e.g. Markdown rendering, `innerHTML` usage), implementing a strict CSP should be a priority at that point.

#### ⚠️ No JSON schema validation

The app performs basic structural checks on uploaded JSON (`c && c.create_time`) but does not validate the full schema of the ChatGPT export format. A malformed or unexpected JSON structure will fail silently — conversations with missing fields are skipped rather than crashing the app.

**Risk level:** Low. The app is designed for a specific, well-known export format. Silent failure on unexpected input is preferable to a confusing crash.

### Threat model summary

| Threat | Likelihood | Impact | Mitigated? |
|---|---|---|---|
| User uploads malicious JSON that executes code | Very low | High | ✅ Yes — `textContent` throughout, no `eval()` |
| CDN serves tampered Chart.js | Very low | High | ✅ Yes — SRI hash enforced |
| User data sent to third party | None | High | ✅ Yes — no network requests |
| Browser tab frozen by huge file | Low | Low | ✅ Yes — 100 MB limit |
| XSS via search input | Very low | Medium | ✅ Yes — regex-escaped, `textContent` used |
| Circular JSON causes infinite loop | Very low | Low | ✅ Yes — `Set`-based traversal guard |

### Scope of this assessment

This review covers the `index.html` file as of v2 (2026-03-20). It does not cover:
- Forks or modifications made after cloning
- The security of ChatGPT's export format itself
- Browser-level vulnerabilities or extensions
- The hosting environment (GitHub Pages, Netlify, etc.)

If you extend this project — particularly if you add server-side functionality, user accounts, or dynamic HTML rendering — a fresh security review is recommended.

---

## License & Copyright

Copyright © 2026 Alyssa Fu Ward

Released under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) (Creative Commons Attribution-NonCommercial 4.0 International).

You are free to share and adapt this project for **non-commercial purposes**, as long as you give credit and link back to the original. Commercial use is not permitted without explicit permission from the author.

If you'd like to use this commercially, reach out.
