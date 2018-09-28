/* eslint-disable */
const EMA = require('../EMA')

/**
 * @link http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:moving_averages
 */
const prices = [
    22.27, 22.19, 22.08, 22.17, 22.18, 22.13, 22.23, 22.43, 22.24, 22.29,
    22.15, 22.39, 22.38, 22.61, 23.36, 24.05, 23.75, 23.83, 23.95, 23.63,
    23.82, 23.87, 23.65, 23.19, 23.10, 23.33, 22.68, 23.10, 22.40, 22.17
]

/**
 * NOTE We use a modified version of EMA where we begin calculating on the first value.
 *      This supports streaming better and within a number of periods the values converge so
 *      the methods produce the same values in the long run.
 */
const expectedValues = [
    22.27, 22.26, 22.23, 22.22, 22.21, 22.20, 22.20, 22.25, 22.25, 22.25,
    22.24, 22.26, 22.29, 22.34, 22.53, 22.81, 22.98, 23.13, 23.28, 23.35,
    23.43, 23.51, 23.54, 23.47, 23.41, 23.39, 23.26, 23.23, 23.08, 22.92
]

const ema = new EMA({ period: 10 })

test('EMA - streaming', () => {
    prices.forEach((price, index) => {
        let next = ema.nextValue(price)

        expect(next).toBeCloseTo(expectedValues[index], 0)
    })
})

test('EMA - static', () => {
    let ema = new EMA({ period: 10, values: prices })
    let i = (expectedValues.length - 1)

    expect(ema.currentValue()).toBeCloseTo(expectedValues[i], 0)
    expect(ema.previousValue()).toBeCloseTo(expectedValues[i - 1], 0)
})
