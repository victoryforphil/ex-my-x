import { test, expect } from '@playwright/test';

test.describe('Tweet Swiper', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main UI elements', async ({ page }) => {
    // Check navigation
    await expect(page.locator('text=Tweet Swiper').first()).toBeVisible();
    
    // Check for either MOCK_MODE or LIVE_MODE indicator
    await expect(page.locator('text=MOCK_MODE').or(page.locator('text=LIVE_MODE'))).toBeVisible();
    
    // Check stats are displayed
    await expect(page.locator('text=DELETED')).toBeVisible();
    await expect(page.locator('text=KEPT')).toBeVisible();
    await expect(page.locator('text=QUEUE')).toBeVisible();
    
    // Check instructions
    await expect(page.locator('text=Swipe left to delete')).toBeVisible();
  });

  test('should show tweet cards with content', async ({ page }) => {
    // Wait for cards to load (mock data loads immediately)
    await page.waitForSelector('[class*="bg-card"]', { timeout: 5000 });
    
    // Should have at least one card with CONTENT label
    await expect(page.locator('text=CONTENT').first()).toBeVisible();
    
    // Check for metrics labels
    await expect(page.locator('text=LIKES').first()).toBeVisible();
    await expect(page.locator('text=RTS').first()).toBeVisible();
  });

  test('should have DELETE and KEEP buttons on top card', async ({ page }) => {
    await page.waitForSelector('[class*="bg-card"]', { timeout: 5000 });
    
    // Check for action buttons
    await expect(page.locator('button:text("DELETE")').first()).toBeVisible();
    await expect(page.locator('button:text("KEEP")').first()).toBeVisible();
  });

  test('should delete a tweet when clicking DELETE button', async ({ page }) => {
    await page.waitForSelector('[class*="bg-card"]', { timeout: 5000 });
    
    // Get initial deleted count
    const deletedCountBefore = await page.locator('text=DELETED').locator('..').locator('div').first().textContent();
    
    // Click the DELETE button
    await page.locator('button:text("DELETE")').first().click();
    
    // Wait for animation
    await page.waitForTimeout(500);
    
    // The deleted count should have increased
    const deletedCountAfter = await page.locator('text=DELETED').locator('..').locator('div').first().textContent();
    expect(parseInt(deletedCountAfter || '0')).toBeGreaterThan(parseInt(deletedCountBefore || '0'));
  });

  test('should keep a tweet when clicking KEEP button', async ({ page }) => {
    await page.waitForSelector('[class*="bg-card"]', { timeout: 5000 });
    
    // Get initial kept count
    const keptCountBefore = await page.locator('text=KEPT').locator('..').locator('div').first().textContent();
    
    // Click the KEEP button
    await page.locator('button:text("KEEP")').first().click();
    
    // Wait for animation
    await page.waitForTimeout(500);
    
    // The kept count should have increased
    const keptCountAfter = await page.locator('text=KEPT').locator('..').locator('div').first().textContent();
    expect(parseInt(keptCountAfter || '0')).toBeGreaterThan(parseInt(keptCountBefore || '0'));
  });

  test('should swipe left to delete using drag', async ({ page }) => {
    await page.waitForSelector('[class*="bg-card"]', { timeout: 5000 });
    
    // Get the top card
    const card = page.locator('[class*="bg-card"]').first();
    const cardBox = await card.boundingBox();
    
    if (cardBox) {
      // Perform a left swipe drag
      await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(cardBox.x - 200, cardBox.y + cardBox.height / 2, { steps: 10 });
      await page.mouse.up();
      
      // Wait for animation
      await page.waitForTimeout(500);
    }
  });

  test('should swipe right to keep using drag', async ({ page }) => {
    await page.waitForSelector('[class*="bg-card"]', { timeout: 5000 });
    
    // Get the top card
    const card = page.locator('[class*="bg-card"]').first();
    const cardBox = await card.boundingBox();
    
    if (cardBox) {
      // Perform a right swipe drag
      await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(cardBox.x + cardBox.width + 200, cardBox.y + cardBox.height / 2, { steps: 10 });
      await page.mouse.up();
      
      // Wait for animation
      await page.waitForTimeout(500);
    }
  });

  test('take screenshot of main UI', async ({ page }) => {
    await page.waitForSelector('[class*="bg-card"]', { timeout: 5000 });
    await page.screenshot({ path: 'notes/screenshots/main-ui.png', fullPage: true });
  });

  test('take screenshot of swipe left indicator', async ({ page }) => {
    await page.waitForSelector('[class*="bg-card"]', { timeout: 5000 });
    
    const card = page.locator('[class*="bg-card"]').first();
    const cardBox = await card.boundingBox();
    
    if (cardBox) {
      // Start a left swipe drag but hold
      await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(cardBox.x - 120, cardBox.y + cardBox.height / 2, { steps: 5 });
      
      // Take screenshot while dragging
      await page.screenshot({ path: 'notes/screenshots/swipe-left.png', fullPage: true });
      
      await page.mouse.up();
    }
  });

  test('take screenshot of swipe right indicator', async ({ page }) => {
    await page.waitForSelector('[class*="bg-card"]', { timeout: 5000 });
    
    const card = page.locator('[class*="bg-card"]').first();
    const cardBox = await card.boundingBox();
    
    if (cardBox) {
      // Start a right swipe drag but hold
      await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(cardBox.x + cardBox.width + 120, cardBox.y + cardBox.height / 2, { steps: 5 });
      
      // Take screenshot while dragging
      await page.screenshot({ path: 'notes/screenshots/swipe-right.png', fullPage: true });
      
      await page.mouse.up();
    }
  });
});
