# Release Notes: Pulse v2.1.0 — Lifetime Activity, Performance & Accessibility

We are thrilled to release **samdev-pulse v2.1.0**! This update introduces full historical contribution analysis for GitHub profiles, major cold-start and network efficiency upgrades, high-contrast themes for enhanced accessibility, containerized development setups, and community integrations.

---

## 📊 Release Summary

- **Version**: `v2.1.0`
- **Previous Tag**: `v2.0`
- **Changes**: 37 files modified, 3,265+ insertions (+)
- **Full Test Suite**: 19 test suites, 325 tests passing cleanly

---

## 🚀 What's New in v2.1.0

### 1. 📈 Lifetime GitHub Activity & Historical Aggregation
- **Lifetime Activity Mode**: Added support for fetching and aggregating full historical contribution data across every year since account creation with `range=lifetime` / `activity=lifetime`.
- **Dynamic Year Slicing**: Dynamic GraphQL alias batching calculates streaks, totals, and contribution volumes across all years without truncating at 12 months.
- **Dynamic Title Badging**: Section headers dynamically render `ACTIVITY (ALL-TIME)` or `ACTIVITY (LAST 1 YEAR)` with sub-label styling.
- **Accurate Current-Year Boundaries**: Restricted GraphQL contribution queries to the current timestamp to avoid graphing empty post-date margins.

### 2. ⚡ Latency Reductions & Network Efficiency
- **In-Flight Request Deduplication**: Replaced redundant concurrent requests with deduplicated promise caching inside the HTTP client.
- **Parallelized Cold-Start Fetches**: Optimized avatar fetching and GitHub repository statistics retrieval to run concurrently, avoiding gateway timeouts on cold starts.
- **Extended Cache Revalidation**: Allows stale-while-revalidate serving for up to 24 hours while refreshing background caches.
- **Smoother SVG Graph Geometry**: Rounded area and line path coordinates to 1 decimal place, preventing browser rendering jitter.

### 3. 🎨 Design, Themes & Accessibility
- **High-Contrast WCAG AAA Themes**: Added `hc-dark` and `hc-light` theme variations optimized for maximum visual contrast and accessibility.
- **Favorite & Recently Used Themes**: Quick-access bookmarking and tracking for recently used profile themes directly in the generator interface.
- **Card Frame Architecture**: Consolidated SVG frame, border, gradient, and glow markup into a unified `renderCardFrame` renderer.

### 4. 🛡️ Security & Reliability
- **DoS Protection & Rate Limiting**: Added `express-rate-limit` guards to `/api/profile` to protect against amplification attacks (with automated CI test bypass).
- **Sanitized Service Error Handling**: Cleaned and sanitized error messages returned from Codeforces and CodeChef integrations.
- **Dependency Vulnerability Fixes**: Upgraded vulnerable dependencies via security audits (`body-parser`, `brace-expansion`, and `js-yaml`).

### 5. 🛠️ Developer Experience & DevOps
- **Docker Development Environment**: Added official `Dockerfile` and `docker-compose.yml` for turnkey containerized local setups.
- **Discord Release Webhook**: Added automated release notification workflow via GitHub Actions (`.github/workflows/discord-announce.yml`).
- **GitHub Sponsors Support**: Added official `FUNDING.yml` configuration.
- **Search & AI Discoverability**: Added `sitemap.xml`, `robots.txt`, and LLM indexing guides (`llms.txt`, `llms-full.txt`).
