# Release Notes: Pulse v2.0: The Multi-Platform & Visual Fusion Release

We are excited to announce the release of **samdev-pulse v2.0.0**! Since the release of `v1.5.0`, the project has undergone substantial growth with **224 commits**, introducing robust multi-platform capabilities, enhanced design options, optimized performance, and solid security features.

---

## 📊 Release Statistics

- **Total Commits**: 224
- **Files Touched**: 89 files
- **Line Modifications**:
  - **With lockfiles & snapshots**: 28,884 insertions (+), 1,170 deletions (-)
  - **Core Codebase (excluding lockfiles & snapshots)**: 12,026 insertions (+), 758 deletions (-)

---

## 🚀 Key Features Added

### 1. 🏆 Multi-Platform Competitive Programming Integration
- **Codeforces Integration**: Render real-time Codeforces stats directly in your profile dashboard, showing current rating, current rank, and solved problem counts (via user status lookup).
- **CodeChef Integration**: Displays current rating, star ratings, global rank, and calculated division layout directly in a dedicated competitive programming section.
- **Adaptive CP Cards Section**: Automatically restructures and sizes platform cards based on which parameters are provided, preventing clutter and keeping layouts clean.

### 2. 🎨 Theme Exploration & Gallery UI
- **Searchable & Filterable Theme Gallery**: Filter themes by category chips and search by theme name with autocomplete suggestions.
- **Clickable Theme Cards**: Selecting themes from the gallery scrolls directly to the live preview and updates setup configs instantly.
- **Theme Comparison Page**: Compare different themes side-by-side on a dedicated comparison dashboard layout at `/theme-comparison.html`.
- **Theme Preview Gallery**: A visual preview showcase gallery displaying dashboard samples on the landing page.

### 🖌️ 3. Themes & Customizations
- **20+ New Dashboard Themes**: Added Cobalt2, One Dark, GitHub Light, AI/ML, Android Studio, Ember Glow, Forest Night, Game Dev, Material, Midnight Neon, Monokai, Nord, Oceanic Next, One Dark Pro, Pastel Dream, Synthwave '84, Tokyo Night, Web Dev, Xcode, and more.
- **Developer Persona Themes**: Handcrafted profile themes tailored for specific engineering domains (e.g., AI/ML, Game Dev, Web Dev).
- **Dynamic Custom Themes**: Support for defining your own custom themes on-the-fly using query parameters directly in the URL.
- **Light/Dark Mode**: A modern toggle for switching the landing page between light and dark visual aesthetics.

### 🛠️ 4. Customization & Interactive Tools
- **Trophy Customizability**: Added the `hide_trophies` query parameter to allow hiding individual trophies in both the backend and frontend generator UI, as well as a new Pull Request reviews trophy.
- **Reset Form Functionality**: Added a dedicated button to instantly clear/reset user configuration inputs in the generator.
- **Quick Start Copy Buttons**: One-click copy buttons in the integration guide to copy Markdown snippets.
- **Download PNG & SVG Buttons**: Dedicated download buttons to save generated SVGs or convert and download them to PNG files.
- **Semantic SVG Accessibility (A11y)**: Built-in screen reader support, descriptions, roles, and accessible labels for all generated dashboard SVGs.
- **Graceful Failures with Error SVGs**: Returns clean, styled Error SVG cards when external APIs fail rather than failing the request or returning empty pages.

### 📱 5. UI/UX & Responsive Layouts
- **Responsive Mobile Navbar**: Smooth hamburger menu for small screen devices.
- **Mobile Optimizations**: Cap avatar sizes, wrap code blocks with horizontal overflow, and remove hardcoded table widths to ensure the README generator is 100% responsive.
- **Interactive Enhancements**: Animated underline transitions on navbar links and smooth scroll-to-top buttons.
- **Visual Indicators**: Live loading spinner indicates preview generation states.

### ⚡ 6. Performance & Security Hardening
- **Size-Limited LRU Cache**: Replaced standard cache implementation with a strict LRU eviction cache to completely eliminate memory leak risks.
- **Fetch Timeouts**: Implemented a hard 8-second fetch timeout for Codeforces, CodeChef, GitHub, and LeetCode API requests to prevent server hang-ups.
- **MongoDB Connection Breaker**: Integrated a circuit breaker on MongoDB logger connection logic to prevent repeating 10s connection timeouts from blocking request execution.
- **Content Security Policy (CSP)**: Fully implemented CSP headers and input hardening on endpoints.
- **Query Validation & Normalization**: Centralized input sanitization and strict validation regex rules to defend against injection and ReDoS vulnerabilities.
- **Anonymization**: Masks the last octet of user IP addresses before writing logs to MongoDB.

---

## 🧪 Developer Experience & Testing

- **Unified Test Framework**: Converted all existing tests to Jest, providing a unified test running suite (`npm run check`).
- **API & SVG Render Unit Tests**: Added coverage for external API service modules (GitHub, LeetCode, Codeforces, CodeChef) and SVG render templates.
- **Visual Regression Snapshots**: Integrated Jest visual regression snapshots to keep SVG structures consistent and prevent unintended visual layout shifts.
- **Lightweight CI Check Pipeline**: Configured linting, formatting check, unit tests, coverage, and issue auto-labelers as automated GitHub Actions.
