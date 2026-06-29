# Contributing to samdev-pulse

Thanks for your interest in contributing to **samdev-pulse** 🚀

Whether you're fixing bugs, improving UI polish, adding new integrations, or refining the SVG renderer — every contribution helps make the project better.

---

# Before Contributing

Please:

* Check existing issues before creating a new one
* Keep PRs focused and scoped to a single issue
* Discuss large feature changes before implementation
* Test your changes locally before opening a PR
* Follow the existing visual/design language of the project

---

# Local Development Setup

## 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/samdev-pulse.git
cd samdev-pulse
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Create Environment File

Copy `.env.example` (in the project root) to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit the `.env` file and set at least your GitHub token:

```env
GITHUB_TOKEN=ghp_your_token_here
```

## 4. Start Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Project Structure

```text
src/
├── routes/        # API routes
├── services/      # External platform integrations
├── renderers/     # SVG rendering logic
├── themes/        # Dashboard themes
├── utils/         # Shared utilities/helpers
└── server.js      # Express entrypoint
```

---

# Contribution Guidelines

## UI / Design Contributions

samdev-pulse follows a:

* dark modern aesthetic
* soft gradients
* minimal visual noise
* compact but readable layout system

When working on UI:

* Preserve spacing consistency
* Avoid overcrowding sections
* Keep typography readable
* Match the existing visual language
* Ensure mobile responsiveness

For major UI redesigns, please share a mockup/screenshot before implementation.

---

## SVG Rendering Guidelines

The SVG renderer is the core of the project.

Please ensure:

* Dynamic content is sanitized properly
* SVG attributes are valid
* Text overflow is handled carefully
* Layout remains balanced across themes
* New sections scale properly on smaller widths

Avoid introducing unnecessary SVG complexity.

---

## Commit Message Style

Examples:

```bash
feat: add reviews trophy
fix: resolve navbar mobile overflow
refactor: simplify theme renderer
style: improve contribution graph spacing
```

---

# Pull Request Guidelines

Before opening a PR:

* Ensure the app runs correctly locally
* Test responsive behavior if UI changes are included
* Attach screenshots for visual/UI changes
* Keep PR descriptions clear and concise
* Link the related issue

Example:

```text
Closes #12
```

---

# Issue Guidelines

When creating issues:

* Explain the problem clearly
* Include reproduction steps if applicable
* Add screenshots when helpful
* Keep feature requests focused and realistic

---

# Good First Contributions

Some great starting areas:

* Theme improvements
* UI polish
* Accessibility fixes
* Mobile responsiveness
* Documentation improvements
* Tooltip additions
* SVG rendering cleanup

---

# Code Style

* Keep code modular and readable
* Reuse utilities when possible
* Avoid large monolithic renderer functions
* Prefer small reusable helpers/components

---

# Reporting Security Issues

If you discover a serious security issue or SVG injection vulnerability, please avoid opening a public issue immediately.

Instead, contact the maintainer privately first.

---

# Community

Be respectful and constructive.

Open source works best when contributors collaborate with clarity and kindness.

---

# Thank You

Thanks again for contributing to samdev-pulse 💜

Your contributions help make developer profiles more beautiful, unified, and expressive.
