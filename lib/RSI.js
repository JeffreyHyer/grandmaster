const Indicator = require('./Indicator')
const Series    = require('./Series')

class RSI extends Indicator {
    constructor (params = {}) {
        super()

        this.period     = (params.period || 14)
        this.prices     = new Series()
        this.avgGain    = 0
        this.avgLoss    = 0

        if (params.values && params.values.length) {
            params.values.forEach((price) => {
                this.nextValue(price)
            })
        }
    }

    nextValue(value) {
        this.prices.push(value)

        if (this.prices.length === (this.period + 1)) {
            let gains = []
            let losses = []

            this.prices.slice(0, this.period).forEach((value, index) => {
                if (index > 0) {
                    if (this.prices[index - 1] > value) {
                        gains.push(0)
                        losses.push(Math.abs((value - this.prices[index - 1])))
                    } else if (this.prices[index - 1] < value) {
                        gains.push((value - this.prices[index - 1]))
                        losses.push(0)
                    } else {
                        gains.push(0)
                        losses.push(0)
                    }
                }
            })

            this.avgGain = (gains.reduce((sum, value) => (sum + value), 0) / gains.length)
            this.avgLoss = (losses.reduce((sum, value) => (sum + value), 0) / losses.length)

            if (this.avgLoss === 0) {
                this.values.push(100)
            } else {
                this.values.push(Number((100 - (100 / (1 + (this.avgGain / this.avgLoss)))).toFixed(2)))
            }
        } else if (this.prices.length > this.period) {
            const prevValue = this.prices.previousValue(1)
            let gain = 0
            let loss = 0

            if (value > prevValue) {
                gain = (value - prevValue)
            } else if (value < prevValue) {
                loss = Math.abs(value - prevValue)
            }

            this.avgGain = (((this.avgGain * (this.period - 1)) + gain) / this.period)
            this.avgLoss = (((this.avgLoss * (this.period - 1)) + loss) / this.period)

            if (this.avgLoss === 0) {
                this.values.push(100)
            } else {
                this.values.push(Number((100 - (100 / (1 + (this.avgGain / this.avgLoss)))).toFixed(2)))
            }

            this.prices.shift()
        } else {
            this.values.push(0)
        }

        return this.currentValue()
    }
}

module.exports = RSI
