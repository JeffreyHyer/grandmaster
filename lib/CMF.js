const Indicator = require('./Indicator')
const Series    = require('./Series')

/**
 * Chaikin Money Flow (CMF)
 */
class CMF extends Indicator {
    constructor (params = {}) {
        super()

        this.period     = (params.period || 20)
        this.volume     = new Series()
        this.volumeMF   = new Series()

        if (params.values && params.values.length) {
            params.values.forEach((bar) => {
                this.nextValue(bar)
            })
        }
    }

    nextValue(bar) {
        const multiplier = Number((((bar.close - bar.low) - (bar.high - bar.close)) / (bar.high - bar.low)).toFixed(4))

        this.volume.push(bar.volume)
        this.volumeMF.push((bar.volume * multiplier))

        if (this.volume.length === this.period) {
            const sumOfVolume   = this.volume.slice(0, this.period).reduce((sum, volume) => (sum + volume))
            const sumOfVolumeMF = this.volumeMF.slice(0, this.period).reduce((sum, volume) => (sum + volume))

            this.values.push(Number((sumOfVolumeMF / sumOfVolume).toFixed(3)))

            this.volume.shift()
            this.volumeMF.shift()
        } else {
            this.values.push(0)
        }

        return this.currentValue()
    }
}

module.exports = CMF
