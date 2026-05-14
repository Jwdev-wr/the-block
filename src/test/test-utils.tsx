import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { BidProvider } from '@/features/bidding/BidContext'
import { Toaster } from '@/components/ui/toaster'

interface WrapperOptions {
  route?: string
}

function makeWrapper({ route = '/' }: WrapperOptions = {}) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <BidProvider>
          {children}
          <Toaster />
        </BidProvider>
      </MemoryRouter>
    )
  }
}

export function renderWithProviders(
  ui: ReactElement,
  { route, ...options }: WrapperOptions & Omit<RenderOptions, 'wrapper'> = {},
) {
  return render(ui, { wrapper: makeWrapper({ route }), ...options })
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
