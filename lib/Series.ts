class Series<T = number> extends Array<T> {
  /**
     * Retreive the current (i.e. most recent) item in the series
     */
  currentValue (): T {
    return this.slice(-1)[0]
  }

  /**
     * Retrieve the value from [offset] periods ago
     *
     * @param offset
     */
  previousValue (offset = 1): T {
    if (offset < 0) {
      offset = Math.abs(offset)
    }

    return this[this.length - 1 - offset]
  }

  nextValue (value: T): T {
    this.push(value)

    return this.currentValue()
  }

  /**
     * Return all the values in the series
     */
  getValues (): this {
    return this
  }
}

export default Series
