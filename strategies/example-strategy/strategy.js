const BaseStrategy      = require('../../lib/BaseStrategy')
const BollingerBands    = require('../../lib/BollingerBands')
const utils             = require('../../lib/utils')
const config            = require('./config')

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
     * Called when a new bar is available
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
        // Add the close price to our Bollinger Band indicator
        this.symbols[symbol].indicators['BollingerBands'].nextValue(bar.close)

        // Execute the parents (BaseStrategy) `addBar` function after
        // we've performed our strategy-specific operations.
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
