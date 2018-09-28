const regression = require('regression')

/**
 * Determine if a series has crossed under (from above)
 * another series or a given number
 */
module.exports.crossunder = (seriesX, number) => {
    if (seriesX && number) {
        return ((seriesX.previousValue() > number) && (seriesX.currentValue() <= number))
    } else {
        return false
    }
}

module.exports.crossunderSeries = (seriesX, seriesY) => {
    return ((seriesX.previousValue() > seriesY.previousValue()) && (seriesX.currentValue() <= seriesY.currentValue()))
}

/**
 * Determine if a series has crossed over (from below)
 * another series or a given number
 */
module.exports.crossover = (seriesX, number) => {
    if (seriesX && number) {
        return ((seriesX.previousValue() < number) && (seriesX.currentValue() >= number))
    } else {
        return false
    }
}

module.exports.crossoverSeries = (seriesX, seriesY) => {
    return ((seriesX.previousValue() < seriesY.previousValue()) && (seriesX.currentValue() >= seriesY.currentValue()))
}

module.exports.calcTrend = (price, slope = 0.025) => {
    let period = 10
    let points = []

    let i = (price.length - 1)

    for (let idx = i; idx > (i - period); idx--) {
        points.push([idx, price[idx]])
    }

    let linreg = regression.linear(points)

    // linreg.equation[0] is the slope of the best-fit line (m in: y = mx+b)
    // return (linreg.equation[0] >= -0.025)
    return (linreg.equation[0] > slope)
}

/**
 * Essentially, this algorithm determines that:
 *  - The last [time - 1] derivatives have been negative AND
 *  - The [time-th] derivative is positive
 * Then the [series] peaked [time] bars ago.
 *
 * @param Series series
 * @param Number time
 */
module.exports.hasPeaked = (series, time = 1) => {
    for (let i = 0; i <= time; i++) {
        let derivative = (series.previousValue(i) - series.previousValue(i + 1))

        if (i === time) {
            if (derivative <= 0) {
                return false
            }
        } else {
            if (derivative > 0) {
                return false
            }
        }
    }

    return true
}

/**
 * Essentially, this algorithm determines that:
 *  - The last [time - 1] derivatives have been positive AND
 *  - The [time-th] derivative is negative
 * Then the [series] bottomed out [time] bars ago.
 *
 * @param Series series
 * @param Number time
 */
module.exports.hasBottomed = (series, time = 1) => {
    for (let i = 0; i <= time; i++) {
        let derivative = (series.previousValue(i) - series.previousValue(i + 1))

        if (i === time) {
            if (derivative >= 0) {
                return false
            }
        } else {
            if (derivative < 0) {
                return false
            }
        }
    }

    return true
}

/**
 * Determine if a series has crossed under (from above) AND remained
 * under the other series for [time] periods
 *
 * @param Indicator x1  Series 1
 *
 * @param Indicator x2  Series 2
 *
 * @param Number time   The number of periods x1 must remain above x2
 *                      to be considered persistent.
 *
 * @return boolean
 */
module.exports.persistentCrossunder = (x1, x2, time) => {
    if (x1.previousValue(time) >= x2.previousValue(time)) {
        for (let i = 1; i < time; i++) {
            if (x1.previousValue(i) >= x2.previousValue(i)) {
                return false
            }
        }

        return true
    }

    return false
}

module.exports.persistentCrossover = (x1, x2, time) => {
    if (x1.previousValue(time) <= x2.previousValue(time)) {
        for (let i = 1; i < time; i++) {
            if (x1.previousValue(i) <= x2.previousValue(i)) {
                return false
            }
        }

        return true
    }

    return false
}

module.exports.pctDiff = (seriesX, seriesY) => {
    return Math.abs(((seriesX.currentValue() - seriesY.currentValue()) / seriesY.currentValue()))
}

/**
 * Detect if two series have crossed over from below within the last [n] (inclusive) bars or less.
 * @param Series seriesX
 * @param Series seriesY
 * @param Number within
 */
module.exports.crossoverSeriesWithin = (seriesX, seriesY, within) => {
    for (let i = 0; i <= within; i++) {
        if ((seriesX.previousValue(i + 1) > seriesY.previousValue(i + 1)) && (seriesX.previousValue(i) <= seriesY.previousValue(i))) {
            return true
        }
    }

    return false
}

module.exports.slope = (series) => {
    let derivative = (series.currentValue() - series.previousValue())

    if (derivative > 0) {
        return 1
    } else if (derivative < 0) {
        return -1
    }

    return 0
}
