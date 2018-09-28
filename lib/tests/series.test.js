/* eslint-disable */
const Series = require('../Series')
const series = new Series(1, 2, 3, 4, 5)

test('constructor', () => {
    let series = new Series(1, 2, 3, 4, 5)
    expect(series.currentValue()).toEqual(5)
})

test('currentValue', () => {
    expect(series.currentValue()).toEqual(5)
})

test('previousValue', () => {
    expect(series.previousValue()).toEqual(4)
    expect(series.previousValue(0)).toEqual(5)
    expect(series.previousValue(1)).toEqual(4)
    expect(series.previousValue(2)).toEqual(3)
    expect(series.previousValue(-2)).toEqual(3)
})

test('getValues', () => {
    expect(series.getValues()).toEqual([1, 2, 3, 4, 5])
})

test('forEach', () => {
    let expected = [1, 2, 3, 4, 5]

    series.getValues().forEach((val, index) => {
        expect(val).toEqual(expected[index])
    })

    series.forEach((val, index) => {
        expect(val).toEqual(expected[index])
    })
})


