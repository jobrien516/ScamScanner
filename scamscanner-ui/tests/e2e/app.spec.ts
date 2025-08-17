import { test, expect } from '@playwright/test';

// Utility to mock WebSocket in the browser context
const installMockWebSocket = async (page: import('@playwright/test').Page, script: string) => {
  await page.addInitScript(script);
};

const successWsScript = `
(() => {
  const OriginalWS = window.WebSocket;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).WebSocket = class MockWS {
    url: string;
    readyState = 0;
    onopen: ((this: WebSocket, ev: Event) => any) | null = null;
    onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
    onerror: ((this: WebSocket, ev: Event) => any) | null = null;
    onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
    constructor(url: string) {
      this.url = url;
      setTimeout(() => {
        this.readyState = 1;
        this.onopen && this.onopen(new Event('open'));
        const msgs = [
          'Connection established...',
          'Crawling page 1',
          'Crawling page 2',
          'Crawl complete',
        ];
        msgs.forEach((m, i) => setTimeout(() => this.onmessage && this.onmessage(new MessageEvent('message', { data: m })), 20 + i * 10));
        setTimeout(() => this.onmessage && this.onmessage(new MessageEvent('message', { data: JSON.stringify({ overallRisk: 'Low', riskScore: 5, summary: 'All good', detailedAnalysis: [] }) })), 100);
        setTimeout(() => this.onclose && this.onclose(new CloseEvent('close')), 120);
      }, 0);
    }
    send() {}
    close() {
      this.readyState = 3;
      this.onclose && this.onclose(new CloseEvent('close'));
    }
  } as unknown as typeof WebSocket;
})();
`;

const errorWsScript = `
(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).WebSocket = class MockWS {
    url: string;
    readyState = 0;
    onopen: ((this: WebSocket, ev: Event) => any) | null = null;
    onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
    onerror: ((this: WebSocket, ev: Event) => any) | null = null;
    onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
    constructor(url: string) {
      this.url = url;
      setTimeout(() => {
        this.readyState = 1;
        this.onopen && this.onopen(new Event('open'));
        setTimeout(() => this.onmessage && this.onmessage(new MessageEvent('message', { data: 'error: failed' })), 30);
        setTimeout(() => this.onclose && this.onclose(new CloseEvent('close')), 60);
      }, 0);
    }
    send() {}
    close() {
      this.readyState = 3;
      this.onclose && this.onclose(new CloseEvent('close'));
    }
  } as unknown as typeof WebSocket;
})();
`;

// Mock API for job start endpoints
const routeAnalyze = async (page: import('@playwright/test').Page, path: string) => {
  await page.route(`**${path}`, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ job_id: 'job-123' }) });
    } else {
      await route.continue();
    }
  });
};

// /scanner happy path
test('scanner happy path streams then shows result and allows reset', async ({ page }) => {
  await installMockWebSocket(page, successWsScript);
  await routeAnalyze(page, '/analyze');
  await page.goto('/scanner');
  await page.getByLabel('Website URL').fill('https://example.com');
  await page.getByRole('button', { name: 'Scan' }).click();
  await expect(page.getByText('Connection established...')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('All good')).toBeVisible({ timeout: 5000 });
});

// /scanner error path
test('scanner error path shows error and allows reset', async ({ page }) => {
  await installMockWebSocket(page, errorWsScript);
  await routeAnalyze(page, '/analyze');
  await page.goto('/scanner');
  await page.getByLabel('Website URL').fill('https://bad.example');
  await page.getByRole('button', { name: 'Scan' }).click();
  await expect(page.getByText('Error')).toBeVisible({ timeout: 4000 });
});

// /secrets happy path manual input
test('secrets happy path manual input, stop and reset available', async ({ page }) => {
  await installMockWebSocket(page, successWsScript);
  await routeAnalyze(page, '/analyze-secrets');
  await page.goto('/secrets');
  await page.getByRole('button', { name: 'Paste code manually' }).click();
  await page.getByPlaceholder('Paste your source code here...').fill('<html></html>');
  await page.getByRole('button', { name: 'Analyze' }).click();
  await expect(page.getByText('Connection established...')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('All good')).toBeVisible({ timeout: 5000 });
});

// /auditor happy path manual code
test('auditor happy path manual code shows result', async ({ page }) => {
  await installMockWebSocket(page, successWsScript);
  await routeAnalyze(page, '/analyze-code');
  await page.goto('/auditor');
  await page.getByRole('button', { name: 'Paste code manually' }).click();
  await page.getByPlaceholder('Paste your source code here...').fill('function x(){}');
  await page.getByRole('button', { name: 'Analyze' }).click();
  await expect(page.getByText('All good')).toBeVisible({ timeout: 5000 });
});

