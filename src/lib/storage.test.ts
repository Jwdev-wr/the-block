import { describe, it, expect, beforeEach } from 'vitest'
import {
  __STORAGE_KEY__,
  clearBidOverrides,
  loadBidOverrides,
  saveBidOverrides,
} from './storage'

describe('bid overrides storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns an empty object when there is nothing stored', () => {
    expect(loadBidOverrides()).toEqual({})
  })

  it('round-trips overrides through localStorage', () => {
    const data = {
      'veh-1': {
        vehicleId: 'veh-1',
        current_bid: 12500,
        bid_count: 17,
        bought_now: false,
        last_bid_at: '2026-05-14T10:00:00.000Z',
      },
    }
    saveBidOverrides(data)
    expect(loadBidOverrides()).toEqual(data)
  })

  it('returns an empty object when the stored payload is corrupt', () => {
    localStorage.setItem(__STORAGE_KEY__, '{not valid json')
    expect(loadBidOverrides()).toEqual({})
  })

  it('returns an empty object when the stored payload is the wrong shape', () => {
    localStorage.setItem(__STORAGE_KEY__, JSON.stringify(['array', 'not', 'object']))
    expect(loadBidOverrides()).toEqual({})
  })

  it('clears the stored overrides', () => {
    saveBidOverrides({
      'veh-1': {
        vehicleId: 'veh-1',
        current_bid: 12500,
        bid_count: 17,
        bought_now: false,
        last_bid_at: '2026-05-14T10:00:00.000Z',
      },
    })
    clearBidOverrides()
    expect(loadBidOverrides()).toEqual({})
  })
})
