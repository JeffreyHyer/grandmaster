/* eslint-disable */
const BollingerBands = require('../BollingerBands')

/**
 * @link http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:bollinger_bands
 */
const prices = [
    86.16, 89.09, 88.78, 90.32, 89.07, 91.15, 89.44, 89.18, 86.93, 87.68, 86.96, 89.43, 89.32, 88.72,
    87.45, 87.26, 89.50, 87.90, 89.13, 90.70, 92.90, 92.98, 91.80, 92.66, 92.68, 92.30, 92.77, 92.54,
    92.95, 93.20, 91.07, 89.83, 89.74, 90.40, 90.74, 88.02, 88.09, 88.84, 90.78, 90.54, 91.39, 90.65
]

const expectedValues = [
    { middle: 0,     upper: 0,     lower: 0 }, { middle: 0,     upper: 0,     lower: 0 }, { middle: 0,     upper: 0,     lower: 0 },
    { middle: 0,     upper: 0,     lower: 0 }, { middle: 0,     upper: 0,     lower: 0 }, { middle: 0,     upper: 0,     lower: 0 },
    { middle: 0,     upper: 0,     lower: 0 }, { middle: 0,     upper: 0,     lower: 0 }, { middle: 0,     upper: 0,     lower: 0 },
    { middle: 0,     upper: 0,     lower: 0 }, { middle: 0,     upper: 0,     lower: 0 }, { middle: 0,     upper: 0,     lower: 0 },
    { middle: 0,     upper: 0,     lower: 0 }, { middle: 0,     upper: 0,     lower: 0 }, { middle: 0,     upper: 0,     lower: 0 },
    { middle: 0,     upper: 0,     lower: 0 }, { middle: 0,     upper: 0,     lower: 0 }, { middle: 0,     upper: 0,     lower: 0 },
    { middle: 0,     upper: 0,     lower: 0 }, { middle: 88.71, upper: 91.29, lower: 86.12 }, { middle: 89.05, upper: 91.95, lower: 86.14 },
    { middle: 89.24, upper: 92.61, lower: 85.87 }, { middle: 89.39, upper: 92.93, lower: 85.85 }, { middle: 89.51, upper: 93.31, lower: 85.70 },
    { middle: 89.69, upper: 93.73, lower: 85.65 }, { middle: 89.75, upper: 93.90, lower: 85.59 }, { middle: 89.91, upper: 94.27, lower: 85.56 },
    { middle: 90.08, upper: 94.57, lower: 85.60 }, { middle: 90.38, upper: 94.79, lower: 85.98 }, { middle: 90.66, upper: 95.04, lower: 86.27 },
    { middle: 90.86, upper: 94.91, lower: 86.82 }, { middle: 90.88, upper: 94.90, lower: 86.87 }, { middle: 90.91, upper: 94.90, lower: 86.91 },
    { middle: 90.99, upper: 94.86, lower: 87.12 }, { middle: 91.15, upper: 94.67, lower: 87.63 }, { middle: 91.19, upper: 94.56, lower: 87.83 },
    { middle: 91.12, upper: 94.68, lower: 87.56 }, { middle: 91.17, upper: 94.58, lower: 87.76 }, { middle: 91.25, upper: 94.53, lower: 87.97 },
    { middle: 91.24, upper: 94.53, lower: 87.95 }, { middle: 91.17, upper: 94.37, lower: 87.96 }, { middle: 91.05, upper: 94.15, lower: 87.95 }
]

const bb = new BollingerBands({ period: 20, stdDev: 2 })

test('Bollinger Bands - streaming', () => {
    prices.forEach((price, index) => {
        let next = bb.nextValue(price)

        expect(next.upper).toBeCloseTo(expectedValues[index].upper, 1)
        expect(next.middle).toBeCloseTo(expectedValues[index].middle, 1)
        expect(next.lower).toBeCloseTo(expectedValues[index].lower, 1)
    })
})

test('Bollinger Bands - static', () => {
    let bb = new BollingerBands({ period: 20, stdDev: 2, values: prices })
    let i = (expectedValues.length - 1)

    expect(bb.currentValue().upper).toBeCloseTo(expectedValues[i].upper, 1)
    expect(bb.currentValue().middle).toBeCloseTo(expectedValues[i].middle, 1)
    expect(bb.currentValue().lower).toBeCloseTo(expectedValues[i].lower, 1)
})
