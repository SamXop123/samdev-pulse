import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  setTheme,
  SUPPORTED_THEME_NAMES,
  wrapSvg,
  renderBackground,
  renderCard,
  LAYOUT
} from '../src/renderers/svg.renderer.js';
import { renderLineChart } from '../src/renderers/chart.renderer.js';
import { renderCPSection } from '../src/renderers/cp-section.renderer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PREVIEW_DIR = path.join(__dirname, '..', 'previews');

if (!fs.existsSync(PREVIEW_DIR)) {
  fs.mkdirSync(PREVIEW_DIR);
}

const mockChartData = [10, 40, 20, 80, 50, 90, 70];
const mockLeetCode = {
  username: 'TestUser',
  rank: 12345,
  solved: 450,
  total: 3000,
  easy: 200,
  medium: 200,
  hard: 50,
  streak: 15,
  rating: 1850
};
const mockCodeforces = {
  username: 'CodeNinja',
  rank: 'Expert',
  rating: 1750,
  maxRating: 1800
};

console.log('🚀 Generating theme previews...');

SUPPORTED_THEME_NAMES.forEach(themeName => {
  setTheme(themeName);

  const chart = renderLineChart({
    x: LAYOUT.padding,
    y: 100,
    width: 400,
    height: 200,
    title: 'Activity',
    data: mockChartData
  });

  const cpSection = renderCPSection({
    x: LAYOUT.padding,
    y: 320,
    width: 900,
    leetcode: mockLeetCode,
    codeforces: mockCodeforces
  });

  const content = [
    renderBackground(960, 600),
    renderCard({ x: 50, y: 50, width: 200, height: 100, title: 'Test Card' }),
    chart,
    cpSection
  ].join('\n');

  const svg = wrapSvg(content, 960, 600);

  const filePath = path.join(PREVIEW_DIR, `${themeName}.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`✅ Generated: ${themeName}.svg`);
});

console.log(`\n✨ All previews generated in ${PREVIEW_DIR}`);
