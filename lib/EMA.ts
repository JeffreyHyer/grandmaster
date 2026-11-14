import Indicator, { type IndicatorParams } from './Indicator.ts'

class EMA extends Indicator {
  period: number
  alpha: number

  constructor (params: IndicatorParams = {}) {
    super()

    this.period = (params.period || 12)
    this.alpha = (2 / (this.period + 1))

    if (params.values && params.values.length) {
      params.values.forEach((value) => {
        this.nextValue(value)
      })
    }
  }

  nextValue (value: number): number {
    if (this.values.length > 0) {
      const prevEma = this.values.currentValue()

      this.values.push((((value - prevEma) * this.alpha) + prevEma))
    } else {
      this.values.push(value)
    }

    return this.currentValue()
  }
}

export default EMA
