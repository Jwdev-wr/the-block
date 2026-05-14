import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/test-utils'
import { BidPanel } from './BidPanel'
import { makeVehicle } from '@/lib/__fixtures__'

describe('BidPanel', () => {
  it('renders the current bid label and minimum next bid', () => {
    const v = makeVehicle({ current_bid: 22000, starting_bid: 15000, bid_count: 6, buy_now_price: null })
    renderWithProviders(<BidPanel vehicle={v} />)
    expect(screen.getByText(/current bid/i)).toBeInTheDocument()
    expect(screen.getByText('$22,000')).toBeInTheDocument()
    expect(screen.getByText(/minimum \$22,500/i)).toBeInTheDocument()
  })

  it('shows "No reserve" when reserve_price is null', () => {
    const v = makeVehicle({ reserve_price: null })
    renderWithProviders(<BidPanel vehicle={v} />)
    expect(screen.getAllByLabelText(/no reserve/i).length).toBeGreaterThan(0)
  })

  it('shows the Buy Now button only when buy_now_price is set', () => {
    const without = makeVehicle({ id: 'no-bn', buy_now_price: null })
    const { rerender } = renderWithProviders(<BidPanel vehicle={without} />)
    expect(screen.queryByTestId(`buy-now-${without.id}`)).not.toBeInTheDocument()

    const withBn = makeVehicle({ id: 'with-bn', buy_now_price: 28000 })
    rerender(<BidPanel vehicle={withBn} />)
    expect(screen.getByTestId(`buy-now-${withBn.id}`)).toBeInTheDocument()
  })

  it('rejects a decimal bid with a helpful message', async () => {
    const user = userEvent.setup()
    const v = makeVehicle({ id: 'dec', current_bid: 12000, starting_bid: 8000, buy_now_price: null })
    renderWithProviders(<BidPanel vehicle={v} />)
    await user.type(screen.getByTestId(`bid-input-${v.id}`), '12500.50')
    await user.click(screen.getByTestId(`submit-bid-${v.id}`))
    expect(await screen.findByRole('alert')).toHaveTextContent(/whole dollar/i)
  })

  it('rejects an empty bid', async () => {
    const user = userEvent.setup()
    const v = makeVehicle({ id: 'empty', current_bid: 12000, starting_bid: 8000, buy_now_price: null })
    renderWithProviders(<BidPanel vehicle={v} />)
    await user.click(screen.getByTestId(`submit-bid-${v.id}`))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('locks the form into a "purchased" state after Buy Now', async () => {
    const user = userEvent.setup()
    const v = makeVehicle({ id: 'bn', current_bid: 12000, starting_bid: 8000, buy_now_price: 18000 })
    renderWithProviders(<BidPanel vehicle={v} />)
    await user.click(screen.getByTestId(`buy-now-${v.id}`))
    // The text appears in both the panel's locked state and the success toast.
    expect(await screen.findByText(/bidding closed for this prototype/i)).toBeInTheDocument()
    expect(screen.queryByTestId(`bid-input-${v.id}`)).not.toBeInTheDocument()
  })
})
