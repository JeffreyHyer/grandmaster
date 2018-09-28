class Series extends Array {
    /**
     * Retreive the current (i.e. most recent) item in the series
     */
    currentValue() {
        return this.slice(-1)[0]
    }

    /**
     * Retrieve the value from [offset] periods ago
     *
     * @param Number offset
     */
    previousValue(offset = 1) {
        if (offset < 0) {
            offset = Math.abs(offset)
        }

        return this[this.length - 1 - offset]
    }

    nextValue(value) {
        this.push(value)

        return this.currentValue()
    }

    /**
     * Return all the values in the series
     */
    getValues() {
        return this
    }
}

module.exports = Series
