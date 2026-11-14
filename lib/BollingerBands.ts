import Indicator, { type IndicatorParams } from './Indicator.ts'
import Series from './Series.ts'

/**
 * Bollinger Bands
 */
export interface Bands {
  upper: number
  middle: number
  lower: number
}

export interface BollingerBandsParams extends IndicatorParams {
  stdDev?: number
}

class BollingerBands extends Indicator<Bands, number> {
  period: number
  stdDev: number
  prices: Series
  upperBand: Series
  lowerBand: Series
  middleBand: Series

  /**
     * @param Object params     Default: { period: 20, stdDev: 2 }
     */
  constructor (params: BollingerBandsParams = {}) {
    super()

    this.period = (params.period || 20)
    this.stdDev = (params.stdDev || 2)
    this.prices = new Series()
    this.upperBand = new Series()
    this.lowerBand = new Series()
    this.middleBand = new Series()

    if (params.values && params.values.length) {
      params.values.forEach((price) => {
        this.nextValue(price, false)
      })
    }
  }

  /**
     * Add a value (price) to the series and update the Bollinger Band
     * calculation and optionally return the new current value for the
     * indicator.
     *
     * @param Number value      The next value (price) in the series
     *
     * @param Boolean retval    True to return the current value of
     *                          the indicator
     *
     * @returns Object | null   See `currentValue()` below.
     */
  nextValue (value: number, retval = true): Bands | undefined {
    this.prices.push(value)

    if (this.prices.length >= this.period) {
      const slice = this.prices.slice((this.prices.length - this.period))
      const avgValue = (slice.reduce((sum, value) => (sum + value), 0) / this.period)
      const stdDev = Math.sqrt((slice.map((value) => (Math.pow((value - avgValue), 2))).reduce((sum, value) => (sum + value), 0) * (1 / this.period)))

      this.middleBand.push(avgValue)
      this.upperBand.push(avgValue + (stdDev * this.stdDev))
      this.lowerBand.push(avgValue - (stdDev * this.stdDev))

      this.prices.shift()

      if (retval === true) {
        return this.currentValue()
      }
    } else {
      this.middleBand.push(0)
      this.upperBand.push(0)
      this.lowerBand.push(0)

      if (retval === true) {
        return this.currentValue()
      }
    }
  }

  /**
     * Return the current value of the indicator.
     *
     * @returns Object  { upper: Number,
     *                    middle: Number,
     *                    lower: Number }
     */
  currentValue (): Bands {
    return {
      upper: this.upperBand.currentValue(),
      middle: this.middleBand.currentValue(),
      lower: this.lowerBand.currentValue()
    }
  }

  /**
     * Return the Nth (offset) previous value for the indicator.
     *
     * @param Number offset     The Nth previous value to return from
     *                          the indicator. Default = 1.
     *
     * @returns Object  { upper: Number,
     *                    middle: Number,
     *                    lower: Number }
     */
  previousValue (offset = 1): Bands {
    return {
      upper: this.upperBand.previousValue(offset),
      middle: this.middleBand.previousValue(offset),
      lower: this.lowerBand.previousValue(offset)
    }
  }

  /**
     * Return all the values for the indicator.
     *
     * @returns Array   [{ upper: Number,
     *                     middle: Number,
     *                     lower: Number }]
     */
  getValues (): Bands[] {
    const values: Bands[] = []

    this.upperBand.forEach((upper, index) => {
      values.push({
        upper,
        middle: this.middleBand[index],
        lower: this.lowerBand[index]
      })
    })

    return values
  }
}

export default BollingerBands
