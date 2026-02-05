# 🚀 samdev-pulse

### Project Unified Live Stats Engine
> A **uniquely styled** GitHub profile README generator with personal branding, dynamic stats, contribution graphs, and achievement trophies—all in beautiful SVG format.


---

## ✨ Features

### 📊 **GitHub Activity Stats**
- Total contributions this year
- Pull requests opened
- Issues opened
- Real-time data via GitHub API

### 🔥 **Streak Statistics**
- Current active streak
- Longest streak ever
- Total contribution days
- Powered by GitHub GraphQL API

### 💻 **LeetCode Integration** *(Optional)*
- Total problems solved
- Easy / Medium / Hard breakdown
- Contest rating with fallback to ranking
- Toggle on/off with `&leetcode=false`

### 📈 **Contribution Activity Graph**
- Smooth SVG line chart
- Last 30 days of contributions
- Auto-scaled Y-axis
- Gradient fill styling

### 🍩 **Top Languages Donut Chart**
- Top 5 most-used languages
- Percentage-based slices
- Legend with color indicators
- Calculated from your public repositories

### 🏆 **Trophy System**
Unique achievement badges showcasing your GitHub milestones:

| Trophy | Description | Tiers |
|--------|-------------|-------|
| 💪 **Commits** | Total contributions this year | Bronze → Silver → Gold → Diamond |
| 🔀 **Pull Requests** | PRs opened | Bronze → Silver → Gold → Diamond |
| 🐛 **Issues** | Issues opened | Bronze → Silver → Gold → Diamond |
| 📦 **Repositories** | Public repos created | Bronze → Silver → Gold → Diamond |
| ⭐ **Stars** | Total stars across repos | Bronze → Silver → Gold → Diamond |
| 👥 **Followers** | GitHub followers | Bronze → Silver → Gold → Diamond |

**Tier Requirements:**
- 🥉 Bronze: Entry level (1+)
- 🥈 Silver: 100+ (500+ for stars)
- 🥇 Gold: 500+ (1000+ for stars)
- 💎 Diamond: 1000+ (5000+ for stars)

### 🎨 **Multi-Theme Support**
Choose from 7 beautiful themes:
- `dark` (default) - Purple accents on dark background
- `light` - Clean and minimal
- `dracula` - Popular Dracula color scheme
- `nord` - Arctic, north-bluish palette
- `tokyonight` - Night-inspired Tokyo theme
- `monokai` - Classic Monokai Pro colors
- `gruvbox` - Retro groove warm scheme

### 🔧 **Customization Options**
- Header alignment (`left`, `center`, `right`)
- Conditional LeetCode stats
- Fallback to Repository Stats when LeetCode is disabled
- 30-minute caching for optimal performance

---


Add this to your GitHub profile README:

### Basic Usage

```markdown
![samdev-pulse](https://samdev-pulse.vercel.app/api/profile?username=YOUR_GITHUB_USERNAME)
```

### With Theme

```markdown
<!-- Dark theme (default) -->
![samdev-pulse](https://samdev-pulse.vercel.app/api/profile?username=YOUR_GITHUB_USERNAME&theme=dark)

<!-- Light theme -->
![samdev-pulse](https://samdev-pulse.vercel.app/api/profile?username=YOUR_GITHUB_USERNAME&theme=light)
```

### With LeetCode Stats

```markdown
![samdev-pulse](https://samdev-pulse.vercel.app/api/profile?username=YOUR_GITHUB_USERNAME&leetcode=YOUR_LEETCODE_USERNAME)
```

### Full Example

```markdown
![samdev-pulse](https://samdev-pulse.vercel.app/api/profile?username=octocat&theme=dark&leetcode=uwi)
```

## Query Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `username` | No | `octocat` | Your GitHub username |
| `theme` | No | `dark` | Theme: `dark` or `light` |
| `leetcode` | No | - | Your LeetCode username (optional) |

## Self-Hosting

### Prerequisites

- Node.js 18+
- GitHub Personal Access Token (for streak stats)

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | Recommended | GitHub PAT for contribution data |
| `DEFAULT_USERNAME` | No | Fallback username (default: `octocat`) |
| `PORT` | No | Server port (default: `3000`) |
| `NODE_ENV` | No | Set to `production` for production mode |

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/samdev-pulse.git
cd samdev-pulse

# Install dependencies
npm install

# Set environment variables
export GITHUB_TOKEN=your_github_token

# Start development server
npm run dev
```

### Deploy to Vercel

1. Fork this repository
2. Import to Vercel
3. Add environment variables:
   - `GITHUB_TOKEN`: Your GitHub Personal Access Token
   - `NODE_ENV`: `production`
4. Deploy!

## API Endpoints

### `GET /api/profile`

Returns an SVG image of the profile dashboard.

### `GET /health`

Health check endpoint returning JSON:

```json
{
  "status": "ok",
  "timestamp": "2026-02-01T00:00:00.000Z"
}
```

## License

MIT

