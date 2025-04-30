const { test, expect } = require('@playwright/test');

test.describe('Markdown Editor', () => {
  // This test assumes user is logged in
  test.beforeEach(async ({ page }) => {
    // Mock authentication or login here
    // For testing purposes, you can navigate directly to the editor if it's accessible without login
    await page.goto('/editor');
    
    // Skip if the page redirects to login
    if (page.url().includes('login')) {
      test.skip('Login required - test skipped');
    }
  });

  test('editor should load correctly', async ({ page }) => {
    // Check for editor components
    await expect(page.locator('.cm-editor')).toBeVisible();
  });

  test('should be able to type markdown content', async ({ page }) => {
    // Get the editor element (CodeMirror editor)
    const editor = page.locator('.cm-editor');
    
    // Focus and clear the editor
    await editor.click();
    
    // Type content
    await page.keyboard.type('# Test Heading');
    await page.keyboard.press('Enter');
    await page.keyboard.type('This is a test paragraph with **bold** text.');
    
    // Verify content exists in editor
    await expect(page.locator('.cm-content')).toContainText('Test Heading');
    await expect(page.locator('.cm-content')).toContainText('This is a test paragraph');
  });

  test('preview should render markdown correctly', async ({ page }) => {
    // Type some markdown content
    const editor = page.locator('.cm-editor');
    await editor.click();
    await page.keyboard.type('# Test Heading');
    await page.keyboard.press('Enter');
    await page.keyboard.type('This is **bold** text.');
    
    // Click the preview button/tab if it exists
    const previewButton = page.getByRole('button', { name: /preview/i }) || 
                         page.getByRole('tab', { name: /preview/i });
    
    if (await previewButton.count() > 0) {
      await previewButton.click();
      
      // Check that markdown is rendered correctly in preview
      await expect(page.getByRole('heading', { name: 'Test Heading', level: 1 })).toBeVisible();
      await expect(page.locator('strong')).toContainText('bold');
    } else {
      // If there's no separate preview button (e.g., live preview editor)
      // Look for rendered elements directly
      await expect(page.frameLocator('.preview-panel').getByRole('heading', { level: 1 })).toBeVisible();
    }
  });

  test('should be able to save content', async ({ page }) => {
    // Type content
    const editor = page.locator('.cm-editor');
    await editor.click();
    await page.keyboard.type('# Saved Post');
    await page.keyboard.press('Enter');
    await page.keyboard.type('This is a test post.');
    
    // Add title if there's a title field
    const titleField = page.getByLabel(/title/i);
    if (await titleField.count() > 0) {
      await titleField.fill('Test Title');
    }
    
    // Click save button
    const saveButton = page.getByRole('button', { name: /save|publish/i });
    await saveButton.click();
    
    // Check for success notification or message
    await expect(page.getByText(/saved|published|success/i)).toBeVisible();
  });
}); 