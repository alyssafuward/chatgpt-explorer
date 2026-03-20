const { test, expect } = require('@playwright/test');
const path = require('path');

const INDEX = `file://${path.resolve(__dirname, '../index.html')}`;
const FIXTURE = path.resolve(__dirname, 'fixtures/conversations.json');

test.describe('Upload screen', () => {
  test('shows drop zone on load', async ({ page }) => {
    await page.goto(INDEX);
    await expect(page.locator('#drop-zone')).toBeVisible();
    await expect(page.locator('text=Drag & drop')).toBeVisible();
  });
});

test.describe('After uploading a JSON file', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(INDEX);
    await page.locator('#file-input').setInputFiles(FIXTURE);
    await page.waitForSelector('#dashboard', { state: 'visible', timeout: 10000 });
  });

  test('dashboard is visible', async ({ page }) => {
    await expect(page.locator('#dashboard')).toBeVisible();
    await expect(page.locator('#upload-screen')).toBeHidden();
  });

  test('stats bar shows conversation count', async ({ page }) => {
    const stats = page.locator('#stats-bar');
    await expect(stats).toBeVisible();
    await expect(stats).toContainText('5');
  });

  test('Overview tab renders charts', async ({ page }) => {
    await page.locator('[data-tab="overview"]').click();
    await expect(page.locator('#tab-overview')).toBeVisible();
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('Topics tab shows topic chips', async ({ page }) => {
    await page.locator('[data-tab="topics"]').click();
    await expect(page.locator('#tab-topics')).toBeVisible();
    await expect(page.locator('.topic-chip').first()).toBeVisible();
  });

  test('Search tab returns results', async ({ page }) => {
    await page.locator('[data-tab="search"]').click();
    await page.locator('#search-input').fill('Python');
    await expect(page.locator('.result-item').first()).toBeVisible();
  });

  test('Timeline tab renders chart', async ({ page }) => {
    await page.locator('[data-tab="timeline"]').click();
    await expect(page.locator('#tab-timeline')).toBeVisible();
    await expect(page.locator('#timeline-chart')).toBeVisible();
  });

  test('reset returns to upload screen with drop zone restored', async ({ page }) => {
    await page.locator('#reset-btn').click();
    await expect(page.locator('#upload-screen')).toBeVisible();
    await expect(page.locator('#dashboard')).toBeHidden();
    await expect(page.locator('#drop-zone')).toBeVisible();
    await expect(page.locator('text=Drag & drop')).toBeVisible();
  });
});
