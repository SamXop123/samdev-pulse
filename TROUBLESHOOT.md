# Troubleshooting Guide

This document helps resolve common issues when setting up, running, and deploying samdev-pulse.

---

# Installation Issues

## npm install fails

### Symptoms

```bash
npm install
```

returns dependency or package resolution errors.

### Solutions

1. Verify Node.js version:

```bash
node -v
npm -v
```

Required:

```text
Node.js 18+
```

2. Remove existing dependencies and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

Windows:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

# Environment Variable Issues

## Missing GitHub Token

### Symptoms

* GitHub statistics not loading
* Empty SVG response
* API rate limit errors

### Solution

Create a `.env` file:

```env
GITHUB_TOKEN=your_github_token
DEFAULT_USERNAME=your_username
PORT=3000
NODE_ENV=development
```

Restart the server after updating environment variables.

---

## GitHub API Rate Limit Errors

### Symptoms

```text
API rate limit exceeded
```

### Solution

Generate a GitHub Personal Access Token and add:

```env
GITHUB_TOKEN=your_token
```

This increases API limits significantly.

---

# Development Server Issues

## Application Does Not Start

### Command

```bash
npm run dev
```

### Possible Causes

* Missing dependencies
* Incorrect environment variables
* Port already in use

### Solutions

Check dependencies:

```bash
npm install
```

Check environment variables:

```bash
cat .env
```

Verify port availability.

---

## Port Already In Use

### Symptoms

```text
EADDRINUSE
```

### Solution

Find the process:

Windows:

```powershell
netstat -ano | findstr :3000
```

Linux/macOS:

```bash
lsof -i :3000
```

Change:

```env
PORT=3001
```

or terminate the conflicting process.

---

# GitHub Data Issues

## Profile Statistics Not Appearing

### Possible Causes

* Incorrect username
* API limits
* GitHub API outage

### Verify

Open:

```text
/api/profile?username=YOUR_USERNAME
```

Confirm the username exists.

---

## Contribution Data Missing

### Possible Causes

* GitHub GraphQL authentication issue
* Invalid token
* Rate limiting

### Solution

Verify:

```env
GITHUB_TOKEN=valid_token
```

and restart the application.

---

# Competitive Programming Data Issues

## LeetCode Stats Not Loading

### Verify

```text
&leetcode=YOUR_LEETCODE_USERNAME
```

Make sure the username is valid and public.

---

## Codeforces Stats Missing

### Verify

```text
&codeforces=YOUR_CODEFORCES_USERNAME
```

Check the profile exists on Codeforces.

---

## CodeChef Stats Missing

### Verify

```text
&codechef=YOUR_CODECHEF_USERNAME
```

Confirm the profile is publicly accessible.

---

# SVG Rendering Issues

## Broken SVG Output

### Symptoms

* Browser shows raw errors
* Image does not render

### Solutions

Check API response:

```text
http://localhost:3000/api/profile?username=YOUR_USERNAME
```

Verify response header:

```text
Content-Type: image/svg+xml
```

---

## Theme Not Applied

### Verify

Theme exists:

```text
dark
light
dracula
tokyonight
catppuccin
synthwave84
forestnight
pasteldream
```

Check spelling in URL parameters.

---

# Deployment Issues

## Vercel Deployment Fails

### Solutions

Verify:

```bash
npm run build
```

passes locally.

Check environment variables in Vercel dashboard:

```text
GITHUB_TOKEN
DEFAULT_USERNAME
```

---

## Environment Variables Missing After Deployment

Re-add variables through deployment settings and redeploy.

---

# Cache Issues

## Old Statistics Continue Appearing

The API uses caching for performance.

Wait for cache expiration or refresh after several minutes.

---

# Health Check

Verify service availability:

```text
/health
```

Expected response:

```text
OK
```

---

# Common Contributor Questions

## How do I test changes locally?

```bash
npm run dev
```

Visit:

```text
http://localhost:3000/api/profile?username=YOUR_USERNAME
```

---

## How do I test a new theme?

Use:

```text
?username=YOUR_USERNAME&theme=THEME_NAME
```

---

## How do I verify my contribution before opening a PR?

Run:

```bash
npm install
npm run dev
```

Verify:

* API endpoints respond correctly
* SVG renders successfully
* No console errors appear

---

# Need More Help?

If the issue persists:

1. Check existing GitHub Issues.
2. Open a new issue with:

   * Steps to reproduce
   * Error logs
   * Environment details
   * Screenshots if applicable

Happy Contributing! 🚀
