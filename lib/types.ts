export interface Bar {
  symbol?: string
  start: string | number | Date
  end?: string | number | Date
  open: number
  high: number
  low: number
  close: number
  volume: number
  trades?: number
}

export interface Signal {
  symbol: string
  bar: Bar
  buy: boolean
  sell: boolean
}

export type SignalCallback = (signal: Signal) => void

export interface StrategyConfig {
  historicBars: number
  symbols: Record<string, object>
  params?: Record<string, unknown>
}

/** Anything that exposes the most recent (and earlier) numeric values. */
export interface ValueSeries {
  currentValue(): number
  previousValue(offset?: number): number
}

/** The subset of a bar that volume/range-based indicators need. */
export type HLCV = Pick<Bar, 'high' | 'low' | 'close' | 'volume'>
