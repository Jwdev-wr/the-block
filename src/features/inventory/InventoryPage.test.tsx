import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, userEvent, within } from '@/test/test-utils'
import { InventoryPage } from './InventoryPage'

describe('InventoryPage', () => {
  it('renders all 200 vehicles by default', () => {
    renderWithProviders(<InventoryPage />)
    const grid = screen.getByTestId('vehicle-grid')
    expect(within(grid).getAllByRole('listitem')).toHaveLength(200)
  })

  it('narrows results when the user searches', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InventoryPage />)
    await user.type(screen.getByTestId('search-input'), 'Bronco')
    const grid = screen.getByTestId('vehicle-grid')
    const cards = within(grid).getAllByRole('listitem')
    expect(cards.length).toBeGreaterThan(0)
    // Every visible card's primary link is labeled with the vehicle title (year/make/model/trim).
    cards.forEach((card) => {
      expect(within(card).getByRole('link').getAttribute('aria-label') ?? '').toMatch(/bronco/i)
    })
  })

  it('shows the empty state and a clear action when no vehicles match', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InventoryPage />)
    await user.type(screen.getByTestId('search-input'), 'lamborghini')
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /clear search/i }))
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
    const grid = screen.getByTestId('vehicle-grid')
    expect(within(grid).getAllByRole('listitem').length).toBeGreaterThan(50)
  })

  it('applies a filter, surfaces it as a chip, and clears it', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InventoryPage />)
    await user.click(screen.getByTestId('filter-no-reserve'))

    const chip = await screen.findByTestId('chip-noReserve')
    expect(chip).toBeInTheDocument()
    await user.click(chip)
    expect(screen.queryByTestId('chip-noReserve')).not.toBeInTheDocument()
  })

  it('displays the visible count when filters narrow the inventory', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InventoryPage />)
    await user.click(screen.getByTestId('filter-has-buy-now'))
    const count = await screen.findByTestId('visible-count')
    expect(Number(count.textContent)).toBeGreaterThan(0)
    expect(Number(count.textContent)).toBeLessThan(200)
  })

  it('reorders cards when the sort changes from Recommended to Year newest', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InventoryPage />)

    const grid = () => screen.getByTestId('vehicle-grid')
    const labels = () =>
      within(grid())
        .getAllByRole('listitem')
        .slice(0, 10)
        .map((li) => within(li).getByRole('link').getAttribute('aria-label') ?? '')

    const initialOrder = labels()
    await user.click(screen.getByTestId('sort-select'))
    await user.click(await screen.findByTestId('sort-option-year_desc'))
    const newOrder = labels()
    expect(newOrder).not.toEqual(initialOrder)
    // First few cards should be from the newest years in the dataset (2025/2026).
    expect(newOrder.slice(0, 3).every((label) => /20(25|26)/.test(label))).toBe(true)
  })

  it('opens the mobile filter sheet, applies a filter, and closes it', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InventoryPage />)

    await user.click(screen.getByTestId('open-filters'))
    // The sheet is portaled — finding by role and accessible name is reliable.
    const sheet = await screen.findByRole('dialog', { name: /filters/i })
    expect(sheet).toBeInTheDocument()
    // The inline filter panel and the sheet both render checkboxes; pick the one inside the sheet.
    const noReserveInSheet = within(sheet).getByTestId('filter-no-reserve')
    await user.click(noReserveInSheet)
    // Active filter chip should appear in the main page.
    expect(await screen.findByTestId('chip-noReserve')).toBeInTheDocument()
    // Close via the "Show N vehicles" button at the bottom of the sheet.
    await user.click(within(sheet).getByRole('button', { name: /show \d+ vehicles/i }))
    // Wait for Radix to finish closing.
    await screen.findByTestId('chip-noReserve')
  })
})
