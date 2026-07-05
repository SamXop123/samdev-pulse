import { describe, test, expect } from '@jest/globals';
import {
  buildDashboardAccessibility,
  buildContributionSummary,
  buildLanguageSummary,
  buildTrophySummary,
} from './svg-accessibility.js';

describe('svg-accessibility.js', () => {
  describe('buildDashboardAccessibility', () => {
    test('generates expected title and description', () => {
      const result = buildDashboardAccessibility({
        username: 'octocat',
        contributions: 120,
        prs: 15,
        issues: 5,
        currentStreak: 4,
        longestStreak: 10,
        languages: [{ label: 'JavaScript', percentage: 70 }, { label: 'HTML', percentage: 30 }],
      });

      expect(result.title).toBe('GitHub Dashboard for octocat');
      expect(result.description).toContain('120 contributions');
      expect(result.description).toContain('15 pull requests');
      expect(result.description).toContain('5 issues');
      expect(result.description).toContain('current streak 4');
      expect(result.description).toContain('longest streak 10');
      expect(result.description).toContain('JavaScript 70%, HTML 30%');
    });

    test('handles empty languages list gracefully', () => {
      const result = buildDashboardAccessibility({
        username: 'octocat',
        contributions: 0,
        prs: 0,
        issues: 0,
        currentStreak: 0,
        longestStreak: 0,
        languages: [],
      });

      expect(result.description).toContain('No language data available');
    });
  });

  describe('buildContributionSummary', () => {
    test('handles empty data', () => {
      expect(buildContributionSummary([])).toBe('Contribution activity chart.');
    });

    test('generates summary of contribution activity', () => {
      const summary = buildContributionSummary([2, 5, 0, 8, 3]);
      expect(summary).toBe(
        'Contribution activity chart showing 18 contributions over the displayed period with a peak of 8 contributions in a single day.'
      );
    });
  });

  describe('buildLanguageSummary', () => {
    test('handles empty data', () => {
      expect(buildLanguageSummary([])).toBe('Language distribution chart.');
    });

    test('generates language distribution text', () => {
      const summary = buildLanguageSummary([
        { label: 'JavaScript', value: 70 },
        { label: 'CSS', value: 30 },
      ]);
      expect(summary).toBe('JavaScript 70%, CSS 30%');
    });
  });

  describe('buildTrophySummary', () => {
    test('generates trophy summary text', () => {
      const summary = buildTrophySummary({
        commits: 50,
        prs: 5,
        reviews: 2,
        issues: 10,
        repos: 4,
        stars: 100,
        followers: 12,
      });

      expect(summary).toBe(
        'Achievement trophies. Commits 50, pull requests 5, reviews 2, issues 10, repositories 4, stars 100, followers 12.'
      );
    });
  });
});
