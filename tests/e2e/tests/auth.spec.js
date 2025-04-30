const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {
  test('should show validation errors with invalid login', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill in invalid credentials - using getByLabel which works well with shadcn
    await page.getByLabel(/email|username/i).fill('invaliduser@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Click login button
    await page.getByRole('button', { name: /sign in|login|log in/i }).click();
    
    // Check for error message
    await expect(page.getByText(/invalid credentials|incorrect password|user not found/i)).toBeVisible();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    // This test is marked as "todo" because it requires test user credentials
    // In a real test, you would use test user credentials
    test.skip('Requires test user credentials');
    
    // Navigate to login page
    await page.goto('/login');
    
    // Fill in valid credentials (replace with actual test user)
    await page.getByLabel(/email|username/i).fill('testuser@example.com');
    await page.getByLabel(/password/i).fill('testpassword');
    
    // Click login button
    await page.getByRole('button', { name: /sign in|login|log in/i }).click();
    
    // Check redirection to dashboard
    await expect(page).toHaveURL(/dashboard/);
    
    // Verify logged in state (e.g., user profile element is visible)
    await expect(page.getByRole('button', { name: /profile|account|user/i })).toBeVisible();
  });
  
  test('should be able to register a new account', async ({ page }) => {
    test.skip('Requires ability to create temporary users for testing');
    
    // Navigate to registration page
    await page.goto('/register');
    
    // Fill registration form
    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill(`test-${Date.now()}@example.com`);
    await page.getByLabel(/password/i).fill('SecurePassword123!');
    
    // If there's a confirm password field
    const confirmPasswordField = page.getByLabel(/confirm password|repeat password/i);
    if (await confirmPasswordField.count() > 0) {
      await confirmPasswordField.fill('SecurePassword123!');
    }
    
    // Submit form
    await page.getByRole('button', { name: /register|sign up|create account/i }).click();
    
    // Check for success message or redirection
    await expect(page).toHaveURL(/dashboard|profile|success/);
  });
}); 