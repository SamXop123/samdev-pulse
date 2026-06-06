import { beforeAll, describe, expect, jest, test } from '@jest/globals';

const mockMongoose = {
  Schema: class Schema {
    constructor(definition, options) {
      this.definition = definition;
      this.options = options;
    }
  },
  connection: {
    readyState: 0,
    db: { databaseName: 'test' },
    close: jest.fn(),
  },
  connect: jest.fn(),
  models: {},
  model: jest.fn(() => class ApiLog {
    constructor(payload) {
      this.payload = payload;
    }

    save() {
      return Promise.resolve(this.payload);
    }
  }),
};

jest.unstable_mockModule('mongoose', () => ({
  default: mockMongoose,
}));

let buildProfileAnalyticsPayload;
let isAnalyticsAvailable;
let trackProfileRequest;

beforeAll(async () => {
  ({
    buildProfileAnalyticsPayload,
    isAnalyticsAvailable,
    trackProfileRequest,
  } = await import('./analytics.service.js'));
});

describe('analytics.service.js', () => {
  test('buildProfileAnalyticsPayload includes supported profile query parameters', () => {
    const payload = buildProfileAnalyticsPayload({
      path: '/',
      ip: '203.0.113.42',
      headers: {
        referer: 'https://github.com/octocat',
        'user-agent': 'jest-agent',
      },
      query: {
        username: 'SamXop123',
        theme: 'dracula',
        leetcode: 'leet-user',
        codeforces: 'cf-user',
        codechef: 'chef-user',
        align: 'center',
        hide_trophies: 'true',
      },
    });

    expect(payload).toMatchObject({
      githubUsername: 'octocat',
      referer: 'https://github.com/octocat',
      userAgent: 'jest-agent',
      ip: '203.0.113.0',
      endpoint: '/',
      queryParams: {
        username: 'SamXop123',
        theme: 'dracula',
        leetcode: 'leet-user',
        codeforces: 'cf-user',
        codechef: 'chef-user',
        align: 'center',
        hide_trophies: 'true',
      },
    });
    expect(payload.timestamp).toBeInstanceOf(Date);
  });

  test('trackProfileRequest no-ops when MongoDB is not configured', async () => {
    const originalMongoUri = process.env.MONGODB_URI;
    delete process.env.MONGODB_URI;

    await expect(trackProfileRequest({
      path: '/',
      headers: {},
      query: { username: 'octocat' },
    })).resolves.toBeUndefined();
    expect(isAnalyticsAvailable()).toBe(false);
    expect(mockMongoose.connect).not.toHaveBeenCalled();

    if (originalMongoUri) {
      process.env.MONGODB_URI = originalMongoUri;
    }
  });
});
