# MarkByte E2E Tests

This directory contains end-to-end tests for the MarkByte application using Playwright.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install browser engines:
   ```bash
   npm run install:browsers
   ```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests with UI mode (useful for debugging):
```bash
npm run test:ui
```

Run specific test file:
```bash
npx playwright test tests/home.spec.js
```

## Test Structure

- `home.spec.js` - Tests for the home page 
- `auth.spec.js` - Tests for authentication flows
- `editor.spec.js` - Tests for the markdown editor functionality

## How the Tests Work with Shadcn UI

These tests use Playwright's modern selector engines which work well with Shadcn UI components:

- Uses role-based selectors (`getByRole`) to find buttons, links, etc.
- Uses label-based selectors (`getByLabel`) to find form fields
- Uses text-based selectors (`getByText`) for finding text elements

The tests include fallback selectors to handle different UI variations and are designed to be resilient to minor UI changes.

## CI Integration

These tests are integrated into the GitHub Actions CI/CD pipeline and run on pull requests and merges to main branches.

## Debugging Failed Tests

When tests fail in CI, a report is uploaded as an artifact that you can download to see screenshots and traces of the failures.

Locally, you can use the UI mode for debugging:
```bash
npm run test:ui
``` 