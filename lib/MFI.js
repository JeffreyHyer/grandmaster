const Indicator = require('./Indicator')
const Series    = require('./Series')

class MFI extends Indicator {
    constructor (params = {}) {
        super()

        this.period         = (params.period || 14)
        this.typicalPrices  = new Series()
        this.positiveMF     = new Series()
        this.negativeMF     = new Series()

        if (params.values && params.values.length) {
            params.values.forEach((bar) => {
                this.nextValue(bar)
            })
        }
    }

    nextValue(bar) {
        const typicalPrice  = ((bar.high + bar.low + bar.close) / 3)

        if (this.typicalPrices.length > 0) {
            const moneyFlow     = (typicalPrice * bar.volume)
            const direction     = ((typicalPrice > this.typicalPrices.currentValue()) ? 1 : -1)

            if (direction === 1) {
                this.positiveMF.push(moneyFlow)
                this.negativeMF.push(0)
            } else {
                this.positiveMF.push(0)
                this.negativeMF.push(moneyFlow)
            }

            this.typicalPrices.push(typicalPrice)

            if (this.typicalPrices.length === (this.period + 1)) {
                const sumOfPosMF = this.positiveMF.slice(0, this.period).reduce((sum, price) => (sum + price))
                const sumOfNegMF = this.negativeMF.slice(0, this.period).reduce((sum, price) => (sum + price))
                const MFratio = (sumOfPosMF / sumOfNegMF)
                const MFindex = Number((100 - (100 / (1 + MFratio))).toFixed(2))

                this.values.push(MFindex)

                this.typicalPrices.shift()
                this.positiveMF.shift()
                this.negativeMF.shift()
            } else {
                this.values.push(0)
            }
        } else {
            this.typicalPrices.push(typicalPrice)
            this.values.push(0)
        }

        return this.currentValue()
    }
}

module.exports = MFI
