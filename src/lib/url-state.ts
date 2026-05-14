import type {
  BodyStyle,
  Drivetrain,
  FilterState,
  FuelType,
  SortKey,
  TitleStatus,
  Transmission,
} from '@/types/vehicle'
import { emptyFilterState } from '@/types/vehicle'

type ParsedState = { filters: FilterState; sort: SortKey }

const SORT_KEYS: SortKey[] = [
  'recommended',
  'bid_asc',
  'bid_desc',
  'year_desc',
  'odometer_asc',
  'grade_desc',
  'auction_soonest',
]

const TITLE_STATUSES: TitleStatus[] = ['clean', 'salvage', 'rebuilt']
const FUEL_TYPES: FuelType[] = ['gasoline', 'hybrid', 'electric', 'diesel']
const DRIVETRAINS: Drivetrain[] = ['FWD', 'RWD', 'AWD', '4WD']
const TRANSMISSIONS: Transmission[] = ['automatic', 'manual', 'CVT', 'single-speed']
const BODY_STYLES: BodyStyle[] = ['SUV', 'sedan', 'truck', 'coupe', 'hatchback']

function readList(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key)
  if (!raw) return []
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

function readListConstrained<T extends string>(
  params: URLSearchParams,
  key: string,
  allowed: readonly T[],
): T[] {
  const list = readList(params, key)
  const allowedSet = new Set<string>(allowed)
  return list.filter((s): s is T => allowedSet.has(s))
}

function readNumber(params: URLSearchParams, key: string): number | null {
  const raw = params.get(key)
  if (raw === null || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function readBool(params: URLSearchParams, key: string): boolean {
  return params.get(key) === '1'
}

export function parseUrlState(params: URLSearchParams): ParsedState {
  const sortRaw = params.get('sort') as SortKey | null
  const sort: SortKey = sortRaw && SORT_KEYS.includes(sortRaw) ? sortRaw : 'recommended'

  const filters: FilterState = {
    ...emptyFilterState,
    search: params.get('q') ?? '',
    makes: readList(params, 'make'),
    bodyStyles: readListConstrained(params, 'body', BODY_STYLES),
    provinces: readList(params, 'prov'),
    titleStatuses: readListConstrained(params, 'title', TITLE_STATUSES),
    fuelTypes: readListConstrained(params, 'fuel', FUEL_TYPES),
    drivetrains: readListConstrained(params, 'drive', DRIVETRAINS),
    transmissions: readListConstrained(params, 'trans', TRANSMISSIONS),
    gradeMin: readNumber(params, 'gradeMin'),
    priceMin: readNumber(params, 'priceMin'),
    priceMax: readNumber(params, 'priceMax'),
    odometerMin: readNumber(params, 'odoMin'),
    odometerMax: readNumber(params, 'odoMax'),
    hasBuyNow: readBool(params, 'buyNow'),
    noReserve: readBool(params, 'noReserve'),
  }

  return { filters, sort }
}

function writeList(params: URLSearchParams, key: string, values: readonly string[]) {
  if (values.length) params.set(key, values.join(','))
  else params.delete(key)
}

function writeNumber(params: URLSearchParams, key: string, value: number | null) {
  if (value === null) params.delete(key)
  else params.set(key, String(value))
}

function writeBool(params: URLSearchParams, key: string, value: boolean) {
  if (value) params.set(key, '1')
  else params.delete(key)
}

export function serializeUrlState(filters: FilterState, sort: SortKey): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.search) params.set('q', filters.search)
  writeList(params, 'make', filters.makes)
  writeList(params, 'body', filters.bodyStyles)
  writeList(params, 'prov', filters.provinces)
  writeList(params, 'title', filters.titleStatuses)
  writeList(params, 'fuel', filters.fuelTypes)
  writeList(params, 'drive', filters.drivetrains)
  writeList(params, 'trans', filters.transmissions)
  writeNumber(params, 'gradeMin', filters.gradeMin)
  writeNumber(params, 'priceMin', filters.priceMin)
  writeNumber(params, 'priceMax', filters.priceMax)
  writeNumber(params, 'odoMin', filters.odometerMin)
  writeNumber(params, 'odoMax', filters.odometerMax)
  writeBool(params, 'buyNow', filters.hasBuyNow)
  writeBool(params, 'noReserve', filters.noReserve)
  if (sort !== 'recommended') params.set('sort', sort)
  return params
}
