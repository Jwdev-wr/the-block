import { Route, Routes } from 'react-router'
import { Header } from '@/components/layout/Header'
import { Toaster } from '@/components/ui/toaster'
import { BidProvider } from '@/features/bidding/BidContext'
import { InventoryPage } from '@/features/inventory/InventoryPage'
import { VehicleDetailPage } from '@/features/vehicle-detail/VehicleDetailPage'
import { NotFound } from '@/features/vehicle-detail/NotFound'

export function App() {
  return (
    <BidProvider>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<InventoryPage />} />
            <Route path="/vehicles/:vehicleId" element={<VehicleDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer className="border-t border-border bg-background/60">
          <div className="container-page py-4 text-xs text-muted-foreground">
            The Block prototype · synthetic dataset · bids saved in your browser only.
          </div>
        </footer>
      </div>
      <Toaster />
    </BidProvider>
  )
}
