/* eslint-disable */
const RSI = require('../RSI')

/**
 * @link http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi
 */
const prices = [
    44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61, 46.28,
    46.28, 46.00, 46.03, 46.41, 46.22, 45.64, 46.21, 46.25, 45.71, 46.45, 45.78, 45.35, 44.03, 44.18,
    44.22, 44.57, 43.42, 42.66, 43.13
]

const expectedValues = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    70.53, 66.32, 66.55, 69.41, 66.36, 57.97, 62.93, 63.26, 56.06, 62.38, 54.71, 50.42, 39.99, 41.46,
    41.87, 45.46, 37.30, 33.08, 37.77
]

const rsi = new RSI({ period: 14 })

// Be within 2% of expected value
const threshold = (1 + 0.02)

test('RSI - streaming', () => {
    prices.forEach((price, index) => {
        let next = rsi.nextValue(price)

        expect(next).toBeLessThanOrEqual((expectedValues[index] * threshold))
        expect(next).toBeGreaterThanOrEqual((expectedValues[index] / threshold))
    })
})

test('RSI - static', () => {
    let rsi = new RSI({ period: 14, values: prices })
    let i = (expectedValues.length - 1)

    expect(rsi.currentValue()).toBeLessThanOrEqual((expectedValues[i] * threshold))
    expect(rsi.currentValue()).toBeGreaterThanOrEqual((expectedValues[i] / threshold))

    expect(rsi.previousValue(5)).toBeLessThanOrEqual((expectedValues[i - 5] * threshold))
    expect(rsi.previousValue(5)).toBeGreaterThanOrEqual((expectedValues[i - 5] / threshold))
})
