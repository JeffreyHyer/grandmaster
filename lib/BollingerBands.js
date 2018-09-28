const Indicator = require('./Indicator')
const Series    = require('./Series')

/**
 * Bollinger Bands
 */
class BollingerBands extends Indicator {
    /**
     * @param Object params     Default: { period: 20, stdDev: 2 }
     */
    constructor(params = {}) {
        super(false)

        this.period     = (params.period || 20)
        this.stdDev     = (params.stdDev || 2)
        this.prices     = new Series()
        this.upperBand  = new Series()
        this.lowerBand  = new Series()
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
    nextValue(value, retval = true) {
        this.prices.push(value)

        if (this.prices.length >= this.period) {
            let slice = this.prices.slice((this.prices.length - this.period))
            let avgValue = (slice.reduce((sum, value) => (sum + value), 0) / this.period)
            let stdDev = Math.sqrt((slice.map((value) => (Math.pow((value - avgValue), 2))).reduce((sum, value) => (sum + value), 0) * (1 / this.period)))

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
    currentValue() {
        return {
            upper:  this.upperBand.currentValue(),
            middle: this.middleBand.currentValue(),
            lower:  this.lowerBand.currentValue()
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
    previousValue(offset = 1) {
        return {
            upper:  this.upperBand.previousValue(offset),
            middle: this.middleBand.previousValue(offset),
            lower:  this.lowerBand.previousValue(offset)
        }
    }

    /**
     * Return all the values for the indicator.
     *
     * @returns Array   [{ upper: Number,
     *                     middle: Number,
     *                     lower: Number }]
     */
    getValues() {
        let values = []

        this.upperBand.forEach((upper, index) => {
            values.push({
                upper: upper,
                middle: this.middleBand[index],
                lower: this.lowerBand[index]
            })
        })

        return values
    }
}

module.exports = BollingerBands
