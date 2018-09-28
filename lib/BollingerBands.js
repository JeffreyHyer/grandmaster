const Indicator = require('./Indicator')
const Series    = require('./Series')

class BollingerBands extends Indicator {
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

    currentValue() {
        return {
            upper:  this.upperBand.currentValue(),
            middle: this.middleBand.currentValue(),
            lower:  this.lowerBand.currentValue()
        }
    }

    previousValue(offset = 1) {
        return {
            upper:  this.upperBand.previousValue(offset),
            middle: this.middleBand.previousValue(offset),
            lower:  this.lowerBand.previousValue(offset)
        }
    }

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
