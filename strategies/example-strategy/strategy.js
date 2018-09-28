const BaseStrategy      = require('../../lib/BaseStrategy')
const BollingerBands    = require('../../lib/BollingerBands')
const utils             = require('../../lib/utils')
const config            = require('./config')

/**
 * A strategy must always extend the `BaseStrategy` class.
 */
class Strategy extends BaseStrategy {
    /**
     * @param String[] symbols
     */
    constructor (symbols = []) {
        super(symbols)

        // Setup any indicators you need for your strategy
        symbols.forEach(symbol => {
            this.symbols[symbol].indicators['BollingerBands'] = new BollingerBands({ period: 20, stdDev: 2 })
        })
    }

    /**
     * Called when a new bar is available, if your strategy doesn't
     * require the use of technical indicators and only uses basic
     * data (open, high, low, close, volume) then you can omit this
     * function because it overrides the `addBar` function in
     * BaseStrategy which is unnecessary if you don't perform
     * additional actions inside this function.
     *
     * @param String symbol     The symbol that `bar` represents
     *
     * @param Object bar        { open , close, high, low, volume }
     *
     * @param Function callback [Optional] Function to call when the
     *                          bar has been added, also triggers,
     *                          the execution of the buy/sell
     *                          indicator functions.
     */
    addBar(symbol, bar, callback) {
        // Add the latest close price to our Bollinger Band indicator
        this.symbols[symbol].indicators['BollingerBands'].nextValue(bar.close)

        // Execute the parent's `addBar` function AFTER we've
        // performed our strategy-specific operations.
        super.addBar(symbol, bar, callback)
    }

    /**
     * Function that holds our logic for determining when to execute a
     * BUY/LONG order for the given `symbol`.
     *
     * @param String symbol
     *
     * @returns Boolean True if conditions indicate we should buy,
     *                  False otherwise.
     */
    buy(symbol) {
        let data = this.symbols[symbol]

        if (data.times.length >= config.historicBars) {
            if (data.bought === false) {
                // In this case, we trigger a BUY signal when the
                // closing price crosses below the lower Bollinger
                // band.
                let buySignal = (utils.crossunderSeries(data.close, data.indicators['BollingerBands'].lowerBand))

                if (buySignal) {
                    this.symbols[symbol].bought = true
                }

                return buySignal
            }
        }

        return false
    }

    /**
     * Function that holds our logic for determining when to execute a
     * SELL order for the given `symbol`.
     *
     * @param String symbol
     *
     * @returns Boolean True if conditions indicate we should sell.
     *                  False otherwise.
     */
    sell(symbol) {
        let data = this.symbols[symbol]

        if (data.bought === true) {
            // In this case, we trigger a SELL signal when the
            // close price crosses above the upper Bollinger band.
            let sellSignal = (utils.crossoverSeries(data.close, data.indicators['BollingerBands'].upperBand))

            if (sellSignal) {
                this.symbols[symbol].bought = false
            }

            return sellSignal
        }

        return false
    }
}

module.exports = Strategy
