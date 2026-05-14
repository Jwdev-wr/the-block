export type TitleStatus = 'clean' | 'salvage' | 'rebuilt'
export type FuelType = 'gasoline' | 'hybrid' | 'electric' | 'diesel'
export type Drivetrain = 'FWD' | 'RWD' | 'AWD' | '4WD'
export type Transmission = 'automatic' | 'manual' | 'CVT' | 'single-speed'
export type BodyStyle = 'SUV' | 'sedan' | 'truck' | 'coupe' | 'hatchback'

export interface Vehicle {
  id: string
  vin: string
  year: number
  make: string
  model: string
  trim: string
  body_style: BodyStyle
  exterior_color: string
  interior_color: string
  engine: string
  transmission: Transmission
  drivetrain: Drivetrain
  odometer_km: number
  fuel_type: FuelType
  condition_grade: number
  condition_report: string
  damage_notes: string[]
  title_status: TitleStatus
  province: string
  city: string
  auction_start: string
  starting_bid: number
  reserve_price: number | null
  buy_now_price: number | null
  images: string[]
  selling_dealership: string
  lot: string
  current_bid: number | null
  bid_count: number
}

/**
 * A user-placed bid override for a vehicle. Stored in localStorage and merged
 * onto the canonical vehicle record at render time.
 */
export interface BidOverride {
  vehicleId: string
  current_bid: number
  bid_count: number
  bought_now: boolean
  last_bid_at: string
}

export type ReserveStatus = 'no_reserve' | 'reserve_met' | 'reserve_not_met'

export type SortKey =
  | 'recommended'
  | 'bid_asc'
  | 'bid_desc'
  | 'year_desc'
  | 'odometer_asc'
  | 'grade_desc'
  | 'auction_soonest'

export interface FilterState {
  search: string
  makes: string[]
  bodyStyles: BodyStyle[]
  provinces: string[]
  titleStatuses: TitleStatus[]
  fuelTypes: FuelType[]
  drivetrains: Drivetrain[]
  transmissions: Transmission[]
  gradeMin: number | null
  priceMin: number | null
  priceMax: number | null
  odometerMin: number | null
  odometerMax: number | null
  hasBuyNow: boolean
  noReserve: boolean
}

export const emptyFilterState: FilterState = {
  search: '',
  makes: [],
  bodyStyles: [],
  provinces: [],
  titleStatuses: [],
  fuelTypes: [],
  drivetrains: [],
  transmissions: [],
  gradeMin: null,
  priceMin: null,
  priceMax: null,
  odometerMin: null,
  odometerMax: null,
  hasBuyNow: false,
  noReserve: false,
}
