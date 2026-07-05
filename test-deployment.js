/**
 * Deployment Verification Script
 * Run this to test your deployment before going live.
 *
 * Usage: node test-deployment.js https://your-project.vercel.app
 */

import https from 'https';
import http from 'http';

const baseUrl = process.argv[2] || 'http://localhost:3000';

console.log('Testing deployment at:', baseUrl);
console.log('='.repeat(50));

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  return fn()
    .then(() => {
      passedTests++;
      console.log(`PASS ${name}`);
    })
    .catch((err) => {
      console.log(`FAIL ${name}`);
      console.log(`   Error: ${err.message}`);
    });
}

function fetch(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl).toString();
    const httpModule = url.startsWith('https') ? https : http;
    const request = httpModule.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    request.on('error', (error) => {
      reject(new Error(`${url} request failed: ${error.message}`));
    });
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error(`${url} request timeout`));
    });
  });
}

function responseSummary(res) {
  const contentType = res.headers['content-type'] || 'missing';
  const snippet = res.body
    .replace(/\s+/g, ' ')
    .slice(0, 180);
  return `${res.url} returned status=${res.status}, content-type=${contentType}, body="${snippet}"`;
}

function assertStatus(res, expected = 200) {
  if (res.status !== expected) {
    throw new Error(responseSummary(res));
  }
}

function assertSvgResponse(res) {
  assertStatus(res);

  const contentType = String(res.headers['content-type'] || '').toLowerCase();
  const mediaType = contentType.split(';')[0].trim();

  if (mediaType !== 'image/svg+xml') {
    throw new Error(`Expected image/svg+xml. ${responseSummary(res)}`);
  }

  const trimmed = res.body.trim();
  const withoutXmlDeclaration = trimmed.replace(/^<\?xml[^>]*>\s*/i, '');

  if (/<!doctype\s+html|<html[\s>]/i.test(withoutXmlDeclaration)) {
    throw new Error(`Expected SVG, received HTML. ${responseSummary(res)}`);
  }

  if (
    !/^<svg[\s>]/i.test(withoutXmlDeclaration) ||
    !/<\/svg>\s*$/i.test(withoutXmlDeclaration)
  ) {
    throw new Error(`Response is not a complete SVG. ${responseSummary(res)}`);
  }
}

async function runTests() {
  await test('Health check endpoint', async () => {
    const res = await fetch('/health');
    assertStatus(res);

    let json;
    try {
      json = JSON.parse(res.body);
    } catch {
      throw new Error(`Health response is not JSON. ${responseSummary(res)}`);
    }

    if (json.status !== 'ok') {
      throw new Error(`Health check failed. ${responseSummary(res)}`);
    }
  });

  await test('Profile endpoint returns SVG', async () => {
    const res = await fetch('/api/profile?username=octocat');
    assertSvgResponse(res);
  });

  await test('Dark theme works', async () => {
    const res = await fetch('/api/profile?username=octocat&theme=dark');
    assertSvgResponse(res);
  });

  await test('Light theme works', async () => {
    const res = await fetch('/api/profile?username=octocat&theme=light');
    assertSvgResponse(res);
  });

  await test('Dracula theme works', async () => {
    const res = await fetch('/api/profile?username=octocat&theme=dracula');
    assertSvgResponse(res);
  });

  await test('Nord theme works', async () => {
    const res = await fetch('/api/profile?username=octocat&theme=nord');
    assertSvgResponse(res);
  });

  await test('Tokyo Night theme works', async () => {
    const res = await fetch('/api/profile?username=octocat&theme=tokyonight');
    assertSvgResponse(res);
  });

  await test('Monokai theme works', async () => {
    const res = await fetch('/api/profile?username=octocat&theme=monokai');
    assertSvgResponse(res);
  });

  await test('Gruvbox theme works', async () => {
    const res = await fetch('/api/profile?username=octocat&theme=gruvbox');
    assertSvgResponse(res);
  });

  await test('Aurora theme works', async () => {
    const res = await fetch('/api/profile?username=octocat&theme=aurora');
    assertSvgResponse(res);
  });

  await test('Midnight Sunset theme works', async () => {
    const res = await fetch('/api/profile?username=octocat&theme=midnight-sunset');
    assertSvgResponse(res);
  });

  await test('LeetCode parameter works', async () => {
    const res = await fetch('/api/profile?username=octocat&leetcode=uwi');
    assertSvgResponse(res);
  });

  await test('LeetCode=false works', async () => {
    const res = await fetch('/api/profile?username=octocat&leetcode=false');
    assertSvgResponse(res);
  });

  await test('Left alignment works', async () => {
    const res = await fetch('/api/profile?username=octocat&align=left');
    assertSvgResponse(res);
  });

  await test('Center alignment works', async () => {
    const res = await fetch('/api/profile?username=octocat&align=center');
    assertSvgResponse(res);
  });

  await test('Right alignment works', async () => {
    const res = await fetch('/api/profile?username=octocat&align=right');
    assertSvgResponse(res);
  });

  await test('Cache headers present', async () => {
    const res = await fetch('/api/profile?username=octocat');
    assertSvgResponse(res);
    if (!res.headers['cache-control']) {
      throw new Error(`No cache-control header. ${responseSummary(res)}`);
    }
  });

  await test('Complex query works', async () => {
    const res = await fetch(
      '/api/profile?username=octocat&theme=dracula&leetcode=false&align=center'
    );
    assertSvgResponse(res);
  });

  console.log('='.repeat(50));
  console.log(`\nResults: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('\nAll tests passed. Ready to deploy.\n');
    process.exit(0);
  }

  console.log(`\n${totalTests - passedTests} test(s) failed. Fix issues before deploying.\n`);
  process.exit(1);
}

runTests().catch((err) => {
  console.error('\nTest suite failed:', err.message);
  process.exit(1);
});
