/* eslint-disable */
const SMA = require('../SMA')

/**
 * @link http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:moving_averages
 */
const prices = [
    22.27, 22.19, 22.08, 22.17, 22.18, 22.13, 22.23, 22.43, 22.24, 22.29,
    22.15, 22.39, 22.38, 22.61, 23.36, 24.05, 23.75, 23.83, 23.95, 23.63,
    23.82, 23.87, 23.65, 23.19, 23.10, 23.33, 22.68, 23.10, 22.40, 22.17
]

/**
 * NOTE We use a modified version of SMA where we begin calculating on the first value.
 *      This supports streaming better and after [period] values the results are identical
 */
const expectedValues = [
    22.27, 22.23, 22.18, 22.18, 22.18, 22.17, 22.18, 22.21, 22.21, 22.22,
    22.21, 22.23, 22.26, 22.30, 22.42, 22.61, 22.77, 22.91, 23.08, 23.21,
    23.38, 23.53, 23.65, 23.71, 23.68, 23.61, 23.51, 23.43, 23.28, 23.13
]

const sma = new SMA({ period: 10 })

test('SMA - streaming', () => {
    prices.forEach((price, index) => {
        let next = sma.nextValue(price)

        expect(next).toBeCloseTo(expectedValues[index], 1)
    })
})

test('SMA - static', () => {
    let sma = new SMA({ period: 10, values: prices })
    let i = (expectedValues.length - 1)

    expect(sma.currentValue()).toBeCloseTo(expectedValues[i], 1)
    expect(sma.previousValue()).toBeCloseTo(expectedValues[i - 1], 1)
})
