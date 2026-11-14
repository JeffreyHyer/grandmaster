import Series from './Series.ts'

export interface IndicatorParams<TInput = number> {
  period?: number
  values?: TInput[]
}

/**
 * @typeParam TValue  The type of each value the indicator produces
 * @typeParam TInput  The type of each input fed to `nextValue()`
 */
class Indicator<TValue = number, TInput = TValue> {
  values: Series<TValue>

  constructor () {
    this.values = new Series<TValue>()
  }

  calculate () {}

  nextValue (value: TInput): TValue | undefined {
    this.values.nextValue(value as unknown as TValue)

    return undefined
  }

  currentValue (): TValue {
    return this.values.currentValue()
  }

  previousValue (offset = 1): TValue {
    return this.values.previousValue(offset)
  }

  getValues (): TValue[] {
    return this.values.getValues()
  }
}

export default Indicator
