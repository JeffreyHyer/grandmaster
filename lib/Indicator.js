const Series = require('./Series')

class Indicator {
    constructor() {
        this.values = new Series()
    }

    calculate() {}

    nextValue(value) {
        this.values.nextValue(value)
    }

    currentValue() {
        return this.values.currentValue()
    }

    previousValue(offset = 1) {
        return this.values.previousValue(offset)
    }

    getValues() {
        return this.values.getValues()
    }
}

module.exports = Indicator
