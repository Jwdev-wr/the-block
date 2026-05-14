import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { VehicleCard } from './VehicleCard'
import { makeVehicle } from '@/lib/__fixtures__'

describe('VehicleCard', () => {
  it('links to the vehicle detail page', () => {
    renderWithProviders(<VehicleCard vehicle={makeVehicle({ id: 'abc123' })} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/vehicles/abc123')
  })

  it('shows the current bid label when bids exist', () => {
    renderWithProviders(
      <VehicleCard vehicle={makeVehicle({ current_bid: 18000, starting_bid: 10000, bid_count: 4 })} />,
    )
    expect(screen.getByText(/current bid/i)).toBeInTheDocument()
    expect(screen.getByText(/\$18,000/)).toBeInTheDocument()
    expect(screen.getByText(/4 bids/i)).toBeInTheDocument()
  })

  it('falls back to the starting bid label when there are no bids', () => {
    renderWithProviders(
      <VehicleCard vehicle={makeVehicle({ current_bid: null, starting_bid: 9500, bid_count: 0 })} />,
    )
    expect(screen.getByText(/starting bid/i)).toBeInTheDocument()
    expect(screen.getByText(/\$9,500/)).toBeInTheDocument()
    expect(screen.getByText(/no bids yet/i)).toBeInTheDocument()
  })

  it('shows the no-reserve badge when reserve_price is null', () => {
    renderWithProviders(<VehicleCard vehicle={makeVehicle({ reserve_price: null })} />)
    expect(screen.getByText(/no reserve/i)).toBeInTheDocument()
  })

  it('shows the buy-now badge when buy_now_price is present', () => {
    renderWithProviders(<VehicleCard vehicle={makeVehicle({ buy_now_price: 22000 })} />)
    expect(screen.getByText(/buy now/i)).toBeInTheDocument()
  })

  it('exposes meaningful alt text on the primary image', () => {
    renderWithProviders(
      <VehicleCard
        vehicle={makeVehicle({ year: 2024, make: 'Honda', model: 'Civic', trim: 'EX' })}
      />,
    )
    expect(screen.getByAltText(/2024 honda civic ex photo 1/i)).toBeInTheDocument()
  })
})
