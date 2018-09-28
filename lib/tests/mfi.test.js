/* eslint-disable */
const MFI = require('../MFI')

/**
 * @link http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:money_flow_index_mfi
 */
const bars = [
    { high: 24.83, low: 24.32, close: 24.75, volume: 18730 },
    { high: 24.76, low: 24.60, close: 24.71, volume: 12272 },
    { high: 25.16, low: 24.78, close: 25.04, volume: 24691 },
    { high: 25.58, low: 24.95, close: 25.55, volume: 18358 },
    { high: 25.68, low: 24.81, close: 25.07, volume: 22964 },
    { high: 25.34, low: 25.06, close: 25.11, volume: 15919 },
    { high: 25.29, low: 24.85, close: 24.89, volume: 16067 },
    { high: 25.13, low: 24.75, close: 25.00, volume: 16568 },
    { high: 25.28, low: 24.93, close: 25.05, volume: 16019 },
    { high: 25.39, low: 25.03, close: 25.34, volume: 9774 },
    { high: 25.54, low: 25.05, close: 25.06, volume: 22573 },
    { high: 25.60, low: 25.06, close: 25.45, volume: 12987 },
    { high: 25.74, low: 25.54, close: 25.56, volume: 10907 },
    { high: 25.72, low: 25.46, close: 25.56, volume: 5799 },
    { high: 25.67, low: 25.29, close: 25.41, volume: 7395 },
    { high: 25.45, low: 25.17, close: 25.37, volume: 5818 },
    { high: 25.32, low: 24.92, close: 25.04, volume: 7165 },
    { high: 25.26, low: 24.91, close: 24.92, volume: 5673 },
    { high: 25.04, low: 24.83, close: 24.88, volume: 5625 },
    { high: 25.01, low: 24.71, close: 24.97, volume: 5023 },
    { high: 25.31, low: 25.03, close: 25.05, volume: 7457 },
    { high: 25.12, low: 24.34, close: 24.45, volume: 11798 },
    { high: 24.69, low: 24.27, close: 24.57, volume: 12366 },
    { high: 24.55, low: 23.89, close: 24.02, volume: 13295 },
    { high: 24.27, low: 23.78, close: 23.88, volume: 9257 },
    { high: 24.27, low: 23.72, close: 24.20, volume: 9691 },
    { high: 24.60, low: 24.20, close: 24.28, volume: 8870 },
    { high: 24.48, low: 24.24, close: 24.33, volume: 7169 },
    { high: 24.56, low: 23.43, close: 24.44, volume: 11356 },
    { high: 25.16, low: 24.27, close: 25.00, volume: 13379 }
]

const expectedValues = [
    0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
    0.00, 0.00, 49.47, 45.11, 36.27, 28.41, 31.53, 33.87, 41.30, 42.80,
    31.83, 23.76, 26.51, 24.07, 22.38, 22.18, 21.53, 30.84
]

const mfi = new MFI({ period: 14 })

test('MFI - streaming', () => {
    bars.forEach((bar, index) => {
        let next = mfi.nextValue(bar)

        expect(next).toBeCloseTo(expectedValues[index], 2)
    })
})

test('MFI - static', () => {
    let mfi = new MFI({ period: 14, values: bars })
    let i = (expectedValues.length - 1)

    expect(mfi.currentValue()).toBeCloseTo(expectedValues[i], 2)
    expect(mfi.previousValue(5)).toBeCloseTo(expectedValues[i - 5], 2)
})
