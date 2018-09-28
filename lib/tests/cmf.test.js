/* eslint-disable */
const CMF = require('../CMF')

/**
 * @link http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:chaikin_money_flow_cmf
 */
const bars = [
    { high: 62.34, low: 61.37, close: 62.15, volume: 7849 },
    { high: 62.05, low: 60.69, close: 60.81, volume: 11692 },
    { high: 62.27, low: 60.10, close: 60.45, volume: 10575 },
    { high: 60.79, low: 58.61, close: 59.18, volume: 13059 },
    { high: 59.93, low: 58.71, close: 59.24, volume: 20734 },
    { high: 61.75, low: 59.86, close: 60.20, volume: 29630 },
    { high: 60.00, low: 57.97, close: 58.48, volume: 17705 },
    { high: 59.00, low: 58.02, close: 58.24, volume: 7259 },
    { high: 59.07, low: 57.48, close: 58.69, volume: 10475 },
    { high: 59.22, low: 58.30, close: 58.65, volume: 5204 },
    { high: 58.75, low: 57.83, close: 58.47, volume: 3423 },
    { high: 58.65, low: 57.86, close: 58.02, volume: 3962 },
    { high: 58.47, low: 57.91, close: 58.17, volume: 4096 },
    { high: 58.25, low: 57.83, close: 58.07, volume: 3766 },
    { high: 58.35, low: 57.53, close: 58.13, volume: 4239 },
    { high: 59.86, low: 58.58, close: 58.94, volume: 8040 },
    { high: 59.53, low: 58.30, close: 59.10, volume: 6957 },
    { high: 62.10, low: 58.53, close: 61.92, volume: 18172 },
    { high: 62.16, low: 59.80, close: 61.37, volume: 22226 },
    { high: 62.67, low: 60.93, close: 61.68, volume: 14614 },
    { high: 62.38, low: 60.15, close: 62.09, volume: 12320 },
    { high: 63.73, low: 62.26, close: 62.89, volume: 15008 },
    { high: 63.85, low: 63.00, close: 63.53, volume: 8880 },
    { high: 66.15, low: 63.58, close: 64.01, volume: 22694 },
    { high: 65.34, low: 64.07, close: 64.77, volume: 10192 },
    { high: 66.48, low: 65.20, close: 65.22, volume: 10074 },
    { high: 65.23, low: 63.21, close: 63.28, volume: 9412 },
    { high: 63.40, low: 61.88, close: 62.40, volume: 10392 },
    { high: 63.18, low: 61.11, close: 61.55, volume: 8927 },
    { high: 62.70, low: 61.25, close: 62.69, volume: 7460 }
]

const expectedValues = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    -0.121, -0.100, -0.066, -0.026, -0.062, -0.048, -0.009,
    -0.009, -0.005, -0.058, -0.015
]

const cmf = new CMF({ period: 20 })

test('CMF - streaming', () => {
    bars.forEach((bar, index) => {
        let next = cmf.nextValue(bar)

        expect(next).toBeCloseTo(expectedValues[index], 2)
    })
})

test('CMF - static', () => {
    let cmf = new CMF({ period: 20, values: bars })
    let i = (expectedValues.length - 1)

    expect(cmf.currentValue()).toBeCloseTo(expectedValues[i], 2)
    expect(cmf.previousValue(5)).toBeCloseTo(expectedValues[i - 5], 2)
})
