import { test, expect } from '@playwright/test'

// Clearing localStorage via addInitScript fires on EVERY navigation, which
// would erase a bid made earlier in the same test. Instead, each test starts
// by navigating to the home page and clearing storage exactly once.
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

test('user places a valid bid and sees updated current bid + count', async ({ page }) => {
  await freshSession(page)

  // Click into the first card with an active bid (Recommended sort puts those first).
  const firstCard = page.getByTestId('vehicle-grid').locator('> li').first()
  await expect(firstCard).toContainText('Current bid')
  const currentBidText = await firstCard.locator('text=/\\$[0-9,]+/').first().textContent()
  const currentBid = Number((currentBidText ?? '0').replace(/[^0-9]/g, ''))
  expect(currentBid).toBeGreaterThan(0)

  await firstCard.getByRole('link').first().click()
  await expect(page).toHaveURL(/\/vehicles\//)

  // Bid panel is on the right (desktop) and bottom (mobile); use the first match.
  const bidPanel = page.getByLabel(/place a bid/i).first()
  await expect(bidPanel).toBeVisible()
  const newBid = currentBid + 5000
  await bidPanel.locator('input').fill(String(newBid))
  await bidPanel.getByRole('button', { name: /^place bid$/i }).click()

  // The header current-bid number updates to the new bid.
  await expect(page.getByText(`$${newBid.toLocaleString('en-CA')}`).first()).toBeVisible()
  // Returning to inventory should also show the updated bid on the card.
  await page.getByTestId('back-to-inventory').click()
  await expect(page.getByTestId('vehicle-grid').locator('> li').first()).toContainText(
    `$${newBid.toLocaleString('en-CA')}`,
  )
})

test('user attempts an invalid bid and sees inline validation', async ({ page }) => {
  await freshSession(page)
  const firstCard = page.getByTestId('vehicle-grid').locator('> li').first()
  await firstCard.getByRole('link').first().click()

  const bidPanel = page.getByLabel(/place a bid/i).first()
  await bidPanel.locator('input').fill('1')
  await bidPanel.getByRole('button', { name: /^place bid$/i }).click()

  await expect(page.getByRole('alert').first()).toBeVisible()
  await expect(bidPanel.locator('input')).toHaveAttribute('aria-invalid', 'true')
})

test('bid state persists across a page reload', async ({ page }) => {
  await freshSession(page)
  const firstCard = page.getByTestId('vehicle-grid').locator('> li').first()
  await firstCard.getByRole('link').first().click()
  const url = page.url()

  // Read the prominent dollar amount in the bid summary header (first match on page).
  const amountText = await page.locator('.tabular-nums').first().textContent()
  const amount = Number((amountText ?? '0').replace(/[^0-9]/g, ''))
  expect(amount).toBeGreaterThan(0)

  const bidForm = page.getByLabel(/place a bid/i).first()
  const newBid = amount + 5000
  await bidForm.locator('input').fill(String(newBid))
  await bidForm.getByRole('button', { name: /^place bid$/i }).click()
  await expect(page.getByText(`$${newBid.toLocaleString('en-CA')}`).first()).toBeVisible()

  // Reload (without clearing storage) and confirm the bid is still there.
  await page.goto(url)
  await expect(page.getByText(`$${newBid.toLocaleString('en-CA')}`).first()).toBeVisible()
})
