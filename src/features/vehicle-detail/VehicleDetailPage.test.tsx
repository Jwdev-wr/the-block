import { describe, it, expect } from 'vitest'
import { Route, Routes } from 'react-router'
import { renderWithProviders, screen, userEvent, within } from '@/test/test-utils'
import { VehicleDetailPage } from './VehicleDetailPage'
import { vehicles } from '@/data'

function renderDetail(vehicleId: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/vehicles/:vehicleId" element={<VehicleDetailPage />} />
    </Routes>,
    { route: `/vehicles/${vehicleId}` },
  )
}

describe('VehicleDetailPage', () => {
  it('renders the title, specs, condition, dealer, and a bid panel for a known vehicle', () => {
    const v = vehicles[0]
    renderDetail(v.id)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      new RegExp(`${v.year}.*${v.make}.*${v.model}`, 'i'),
    )
    expect(screen.getByRole('heading', { name: /^specs$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^condition$/i })).toBeInTheDocument()
    expect(screen.getByText(v.selling_dealership)).toBeInTheDocument()
    expect(screen.getByText(v.vin)).toBeInTheDocument()
    expect(screen.getAllByLabelText(/place a bid/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders the friendly empty-damage state for a vehicle with no damage notes', () => {
    const noDamage = vehicles.find((v) => v.damage_notes.length === 0)
    if (!noDamage) throw new Error('Fixture data: expected a vehicle with no damage notes')
    renderDetail(noDamage.id)
    expect(screen.getByTestId('no-damage-state')).toBeInTheDocument()
    expect(screen.queryByTestId('damage-notes')).not.toBeInTheDocument()
  })

  it('renders the damage notes list when notes are present', () => {
    const withDamage = vehicles.find((v) => v.damage_notes.length > 0)
    if (!withDamage) throw new Error('Fixture data: expected a vehicle with damage notes')
    renderDetail(withDamage.id)
    const list = screen.getByTestId('damage-notes')
    expect(within(list).getAllByRole('listitem')).toHaveLength(withDamage.damage_notes.length)
  })

  it('shows a 404 state for an unknown vehicle id', () => {
    renderDetail('does-not-exist')
    expect(screen.getByTestId('not-found')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to inventory/i })).toBeInTheDocument()
  })

  it('rejects an invalid bid with an inline error', async () => {
    const v = vehicles.find((x) => x.current_bid !== null)!
    renderDetail(v.id)
    const user = userEvent.setup()
    const input = screen.getAllByTestId(`bid-input-${v.id}`)[0]
    await user.type(input, '1')
    await user.click(screen.getAllByTestId(`submit-bid-${v.id}`)[0])
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('accepts a valid bid and updates the displayed bid and bid count', async () => {
    const v = vehicles.find((x) => x.current_bid !== null && x.buy_now_price === null)!
    renderDetail(v.id)
    const user = userEvent.setup()
    const input = screen.getAllByTestId(`bid-input-${v.id}`)[0]
    const next = (v.current_bid ?? 0) + 5000
    await user.type(input, String(next))
    await user.click(screen.getAllByTestId(`submit-bid-${v.id}`)[0])

    // The new bid count is rendered in the panel header line ("N bids · Starting bid …").
    expect(
      await screen.findByText(new RegExp(`${v.bid_count + 1} bids`)),
    ).toBeInTheDocument()
    // No alert should be present.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('transitions the reserve status from "not met" to "met" when a bid crosses the reserve', async () => {
    // Find a vehicle where reserve is set and the current bid is below it.
    const target = vehicles.find(
      (v) =>
        v.reserve_price !== null &&
        v.current_bid !== null &&
        v.current_bid < v.reserve_price &&
        v.buy_now_price === null,
    )!
    renderDetail(target.id)
    // The panel should currently render "Reserve not met"
    expect(screen.getAllByLabelText(/reserve not met/i).length).toBeGreaterThan(0)
    const user = userEvent.setup()
    const input = screen.getAllByTestId(`bid-input-${target.id}`)[0]
    await user.type(input, String(target.reserve_price! + 500))
    await user.click(screen.getAllByTestId(`submit-bid-${target.id}`)[0])
    expect(await screen.findAllByLabelText(/reserve met/i)).not.toHaveLength(0)
  })
})
