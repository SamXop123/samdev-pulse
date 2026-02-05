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

## 📖 Usage

Add this to your GitHub profile README:

### Basic Usage

```markdown
![samdev-pulse](https://samdev-pulse.vercel.app/api/profile?username=YOUR_GITHUB_USERNAME)
```

### With Theme

```markdown
<!-- Dark theme (default) -->
![samdev-pulse](https://samdev-pulse.vercel.app/api/profile?username=YOUR_GITHUB_USERNAME&theme=dark)

<!-- Dracula theme -->
![samdev-pulse](https://samdev-pulse.vercel.app/api/profile?username=YOUR_GITHUB_USERNAME&theme=dracula)

<!-- Nord theme -->
![samdev-pulse](https://samdev-pulse.vercel.app/api/profile?username=YOUR_GITHUB_USERNAME&theme=nord)
```

### With LeetCode Stats

```markdown
![samdev-pulse](https://samdev-pulse.vercel.app/api/profile?username=YOUR_GITHUB_USERNAME&leetcode=YOUR_LEETCODE_USERNAME)
```

### Without LeetCode (Show Repository Stats Instead)

```markdown
![samdev-pulse](https://samdev-pulse.vercel.app/api/profile?username=YOUR_GITHUB_USERNAME&leetcode=false)
```

### With Custom Alignment

```markdown
<!-- Center-aligned header -->
![samdev-pulse](https://samdev-pulse.vercel.app/api/profile?username=YOUR_GITHUB_USERNAME&align=center)

<!-- Right-aligned header -->
![samdev-pulse](https://samdev-pulse.vercel.app/api/profile?username=YOUR_GITHUB_USERNAME&align=right)
```

### Full Example

```markdown
![samdev-pulse](https://samdev-pulse.vercel.app/api/profile?username=SamXop123&theme=tokyonight&leetcode=Dot_NotSam&align=center)
```

---

## ⚙️ Query Parameters

| Parameter | Type | Default     | Description |
|-----------|------|-------------|-------------|
| `username` | string | `SamXop123` | Your GitHub username |
| `theme` | string | `dark`      | Theme name: `dark`, `light`, `dracula`, `nord`, `tokyonight`, `monokai`, `gruvbox` |
| `leetcode` | string | -           | Your LeetCode username (or `false` to disable) |
| `align` | string | `left`      | Header alignment: `left`, `center`, `right` |

---


## 🛠️ Local Development

### Prerequisites

- Node.js 18+ installed
- GitHub Personal Access Token (see Vercel step 2 above)

### Setup

```bash
# Clone the repository
git clone https://github.com/SamXop123/samdev-pulse.git
cd samdev-pulse

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
GITHUB_TOKEN=your_github_personal_access_token_here
DEFAULT_USERNAME=octocat
PORT=3000
NODE_ENV=development
```

### Run Development Server

```bash
# Start the server
npm run dev
```

The server will start at `http://localhost:3000`

### Test Locally

Open in browser:
```
http://localhost:3000/api/profile?username=octocat
http://localhost:3000/api/profile?username=YOUR_USERNAME&theme=dracula
http://localhost:3000/api/profile?username=YOUR_USERNAME&leetcode=YOUR_LEETCODE_USERNAME
```

---

## 🔍 API Endpoints

### `GET /api/profile`

Returns an SVG image of the profile dashboard.

**Query Parameters:**
- `username` - GitHub username (default: `octocat`)
- `theme` - Theme name (default: `dark`)
- `leetcode` - LeetCode username or `false` to disable
- `align` - Header alignment: `left`, `center`, `right`

**Response:**
- Content-Type: `image/svg+xml`
- Cache-Control: `public, max-age=1800` (30 minutes)

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-04T00:00:00.000Z"
}
```

---

## 📁 Project Structure

```
samdev-pulse/
├── src/
│   ├── server.js                      # Express app entry point
│   ├── routes/
│   │   └── profile.route.js           # Main API route handler
│   ├── services/
│   │   ├── github.service.js          # GitHub REST API
│   │   ├── github-graphql.service.js  # GitHub GraphQL API (streaks)
│   │   └── leetcode.service.js        # LeetCode API integration
│   ├── renderers/
│   │   ├── svg.renderer.js            # SVG layout & cards
│   │   └── chart.renderer.js          # Graphs & charts
│   ├── themes/
│   │   ├── dark.theme.js
│   │   ├── light.theme.js
│   │   ├── dracula.theme.js
│   │   ├── nord.theme.js
│   │   ├── tokyonight.theme.js
│   │   ├── monokai.theme.js
│   │   └── gruvbox.theme.js
│   └── utils/
│       └── cache.js                   # In-memory TTL cache
├── package.json
├── vercel.json                        # Vercel configuration
└── README.md
```

---

## 🐛 Troubleshooting

### SVG not showing in README
- Ensure the URL is correct and accessible
- Check that your deployment is live
- Verify environment variables are set correctly
- Clear GitHub's cache by appending `?v=1` to URL

### Data not updating
- GitHub caches images for ~5-10 minutes
- Cache-Control is set to 30 minutes on the API
- Try appending a query param like `&v=2` to force refresh

### LeetCode stats not showing
- Verify your LeetCode username is correct
- LeetCode API may be rate-limited or down
- The dashboard will gracefully fallback to showing placeholders

### Contribution graph shows fake data
- Ensure `GITHUB_TOKEN` is set with correct scopes
- Token needs `public_repo` and `read:user` permissions
- Check if token has expired


MIT

