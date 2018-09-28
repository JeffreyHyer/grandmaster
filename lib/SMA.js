const Indicator = require('./Indicator')
const Series    = require('./Series')

class SMA extends Indicator {
    constructor(params = {}) {
        super()

        this.period = (params.period || 12)
        this.prices = new Series()

        if (params.values && params.values.length) {
            params.values.forEach((value) => {
                this.nextValue(value)
            })
        }
    }

    nextValue(value) {
        this.prices.push(value)

        if (this.prices.length >= this.period) {
            let average = (this.prices.slice((this.period * -1)).reduce((sum, val) => (sum + val), 0) / this.period)

            this.values.push(average)
            this.prices.shift()
        } else if (this.prices.length > 0) {
            let average = (this.prices.reduce((sum, val) => (sum + val), 0) / this.prices.length)

            this.values.push(average)
        } else {
            this.values.push(value)
        }

        return this.currentValue()
    }
}

module.exports = SMA
