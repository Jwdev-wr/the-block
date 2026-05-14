import { test, expect } from '@playwright/test'

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

test('inventory loads and shows vehicle cards', async ({ page }) => {
  await freshSession(page)
  await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible()
  // 200 cards in the dataset.
  await expect(page.getByTestId('vehicle-grid').locator('> li')).toHaveCount(200)
})

test('user searches for a make and opens a vehicle detail', async ({ page }) => {
  await freshSession(page)
  await page.getByTestId('search-input').fill('Bronco')
  const firstCard = page.getByTestId('vehicle-grid').locator('> li').first()
  await expect(firstCard).toContainText('Bronco')
  await firstCard.getByRole('link').first().click()
  await expect(page).toHaveURL(/\/vehicles\//)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Bronco')
})

test('user filters by province and clears the filters', async ({ page }) => {
  await freshSession(page)
  // The province + title checkboxes live in the desktop sidebar.
  // We click the visible label rather than the (offscreen-when-scrolled) input.
  await page.getByText('Ontario', { exact: true }).first().click()
  await page.getByTestId('filter-title-clean').first().click()
  // Active chip surfaces in the chip bar.
  await expect(page.getByTestId('chip-titleStatuses:clean')).toBeVisible()
  const cards = page.getByTestId('vehicle-grid').locator('> li')
  const count = await cards.count()
  expect(count).toBeGreaterThan(0)
  expect(count).toBeLessThan(200)
  // Clear via the top button in the panel.
  await page.getByTestId('clear-all-filters').first().click()
  await expect(cards).toHaveCount(200)
})

test('invalid vehicle URL renders 404 and returns home', async ({ page }) => {
  await freshSession(page, '/vehicles/does-not-exist')
  await expect(page.getByTestId('not-found')).toBeVisible()
  await page.getByTestId('not-found').getByRole('link', { name: /back to inventory/i }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible()
})

test('search is preserved when navigating to a vehicle and back', async ({ page }) => {
  await freshSession(page)
  // Filter the inventory by search.
  await page.getByTestId('search-input').fill('Bronco')
  const cards = page.getByTestId('vehicle-grid').locator('> li')
  const filteredCount = await cards.count()
  expect(filteredCount).toBeGreaterThan(0)
  expect(filteredCount).toBeLessThan(200)
  // URL should already carry the search query.
  await expect(page).toHaveURL(/[?&]q=Bronco/i)

  // Open a vehicle detail page.
  await cards.first().getByRole('link').first().click()
  await expect(page).toHaveURL(/\/vehicles\//)

  // Click "Back to inventory" — we should return to the same searched view.
  await page.getByTestId('back-to-inventory').click()
  await expect(page).toHaveURL(/\/\?.*q=Bronco/i)
  await expect(page.getByTestId('search-input')).toHaveValue('Bronco')
  await expect(page.getByTestId('vehicle-grid').locator('> li')).toHaveCount(filteredCount)
})
