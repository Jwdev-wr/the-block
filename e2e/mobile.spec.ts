import { test, expect } from '@playwright/test'

// This file is run only by the mobile project (Pixel 7) because the sticky
// bottom bid bar is hidden on lg+ viewports. Tag the file so it's easy to scope.
async function freshSession(page: import('@playwright/test').Page, path = '/') {
  await page.goto(path)
  await page.evaluate(() => {
    try {
      localStorage.clear()
    } catch {
      /* ignore */
    }
  })
  await page.reload()
}

test.describe('@mobile', () => {
  test('opens the filter sheet, applies a filter, opens detail, and bids via the sticky bottom bar', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'mobile-only flow')

    await freshSession(page)

    // Open the filter sheet.
    await page.getByTestId('open-filters').click()
    const sheet = page.getByRole('dialog', { name: /filters/i })
    await expect(sheet).toBeVisible()

    // Apply "No reserve" by clicking the visible label text inside the sheet.
    await sheet.getByText('No reserve', { exact: true }).click()

    // Close the sheet via "Show N vehicles".
    await sheet.getByRole('button', { name: /show \d+ vehicles/i }).click()
    await expect(sheet).toBeHidden()

    // Active chip is visible on the page.
    await expect(page.getByTestId('chip-noReserve')).toBeVisible()

    // Open the first card.
    const firstCard = page.getByTestId('vehicle-grid').locator('> li').first()
    await firstCard.getByRole('link').first().click()
    await expect(page).toHaveURL(/\/vehicles\//)

    // Use the sticky bottom bid bar.
    const bottomBar = page.getByTestId('mobile-bid-bar')
    await expect(bottomBar).toBeVisible()

    // Submit empty bid to confirm validation surfaces.
    await bottomBar.getByRole('button', { name: /^place bid$/i }).click()
    await expect(page.getByRole('alert').first()).toBeVisible()
  })
})
