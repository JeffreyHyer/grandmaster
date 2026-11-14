import Series from './Series.ts'
import type Indicator from './Indicator.ts'
import type { Bar, SignalCallback } from './types.ts'

export interface SymbolState {
  times: Series
  open: Series
  close: Series
  high: Series
  low: Series
  volume: Series

  indicators: Record<string, Indicator<any, any>>

  bought: boolean
}

class BaseStrategy {
  symbols: Record<string, SymbolState>

  /**
   * @param symbols
   */
  constructor (symbols: string[] = []) {
    this.symbols = {}

    if (Array.isArray(symbols)) {
      symbols.forEach((s) => {
        this.initSymbol(s)
      })
    }
  }

  /**
   * @param symbol
   */
  initSymbol (symbol: string) {
    if (undefined === this.symbols[symbol]) {
      this.symbols[symbol] = {
        times: new Series(),
        open: new Series(),
        close: new Series(),
        high: new Series(),
        low: new Series(),
        volume: new Series(),

        indicators: {},

        bought: false
      }
    }
  }

  /**
   * @param symbol
   * @param bar
   * @param callback
   */
  addBar (symbol: string, bar: Bar, callback?: SignalCallback) {
    this.symbols[symbol].times.push((new Date(bar.start)).getTime())
    this.symbols[symbol].open.push(bar.open)
    this.symbols[symbol].close.push(bar.close)
    this.symbols[symbol].high.push(bar.high)
    this.symbols[symbol].low.push(bar.low)
    this.symbols[symbol].volume.push(bar.volume)

    if (callback) {
      // eslint-disable-next-line n/no-callback-literal -- the callback receives a signal, not an error
      callback({
        symbol,
        bar,
        buy: this.buy(symbol),
        sell: this.sell(symbol)
      })
    }
  }

  addHistory (symbol: string, bars: Bar[]) {
    if (Array.isArray(bars)) {
      bars.forEach((bar) => {
        this.addBar(symbol, bar)
      })

      return true
    }
  }

  buy (_symbol: string): boolean { return false }

  sell (_symbol: string): boolean { return false }
}

export default BaseStrategy
