# samdev-pulse

> A personalized GitHub profile README generator that makes your profile stand out.


## Features

- 📊 **GitHub Stats** - Followers, repositories, and total stars
- 🔥 **Streak Stats** - Current streak, longest streak, and total contribution days
- 💻 **LeetCode Integration** - Problems solved and ranking
- 📈 **Contribution Graph** - Visual activity chart
- 🍩 **Top Languages** - Donut chart of your most used languages
- 🎨 **Theme Support** - Dark and light themes

## Usage

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

