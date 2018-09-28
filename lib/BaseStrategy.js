const Series = require('./Series')

class BaseStrategy {
    /**
     * @param String[] symbols
     */
    constructor (symbols = []) {
        this.symbols = {}

        if (Array.isArray(symbols)) {
            symbols.forEach((s) => {
                this.initSymbol(s)
            })
        }
    }

    /**
     * @param String symbol
     */
    initSymbol(symbol) {
        if (undefined === this.symbols[symbol]) {
            this.symbols[symbol] = {
                times:  new Series(),
                open:   new Series(),
                close:  new Series(),
                high:   new Series(),
                low:    new Series(),
                volume: new Series(),

                indicators: {},

                bought: false
            }
        }
    }

    /**
     * @param String    symbol
     * @param Object    bar
     * @param Function  callback
     */
    addBar(symbol, bar) {
        this.symbols[symbol].times.push((new Date(bar.start)).getTime())
        this.symbols[symbol].open.push(bar.open)
        this.symbols[symbol].close.push(bar.close)
        this.symbols[symbol].high.push(bar.high)
        this.symbols[symbol].low.push(bar.low)
        this.symbols[symbol].volume.push(bar.volume)
    }

    /**
     *
     */
    addHistory(symbol, bars) {
        if (Array.isArray(bars)) {
            bars.forEach((bar) => {
                this.addBar(symbol, bar)
            })

            return true
        }
    }

    /**
     *
     */
    buy() {}

    /**
     *
     */
    sell() {}
}

module.exports = BaseStrategy
