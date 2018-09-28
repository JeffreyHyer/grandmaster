const Indicator = require('./Indicator')

class EMA extends Indicator {
    constructor(params = {}) {
        super()

        this.period = (params.period || 12)
        this.alpha  = (2 / (this.period + 1))

        if (params.values && params.values.length) {
            params.values.forEach((value) => {
                this.nextValue(value)
            })
        }
    }

    nextValue(value) {
        if (this.values.length > 0) {
            let prevEma = this.values.currentValue()

            this.values.push((((value - prevEma) * this.alpha) + prevEma))
        } else {
            this.values.push(value)
        }

        return this.currentValue()
    }
}

module.exports = EMA
