# Grandmaster

Grandmaster is a strategy backtesting and execution engine written in Node.js. The strategies are largely configurable by the user and can include any number of technical indicators and supplemental data sources. It's very flexible and easy to get started with. I am not an expert but I've had great success with my own strategies running on this engine trading both traditional equities (stocks) and modern assets (cryptocurrencies). Use at your own risk.


## Installation

### Requirements
- Node.js >= 8
- NPM -OR- Yarn
- MySQL


### Optional, but suggested
- PHP >= 7.0 (may work with PHP 5.5+ but this hasn't been tested)
    - Used to import historical data but if you already have the data or have another means to obtain it then PHP isn't a requirement.
- Composer
    - Used to install dependencies for the aforementioned PHP scripts.
- Redis (optional)
    - Used to stream data and trading signals to/from the execution engine. If you're only using this system to backtest your strategies OR you want to use something else to handle the streaming then you won't need Redis.


### Recommended Setup
I recommend installing/running everything in an isolated environment like a virtual machine or a container. You can do that with something like Vagrant or Docker.

It is possible to run this on your local machine as long as you have Node.js and MySQL installed but it isn't recommended. Dependency conflicts and runtime configration conflicts can cause lots of unnecessary problems that are easily avoided by running inside a virtual machine or a container.


### Usage
To get started [download](https://github.com/JeffreyHyer/grandmaster/archive/master.zip) a copy of this repository and extract the archive wherever you'd like to setup this project.

If you prefer NPM, from the project root directory run:
```shell
$ npm install
```

or if you prefer Yarn, run:

```shell
$ yarn install
```

to install all the javascript dependencies for the project. For the curious and security concious, you can see all the dependencies required by this project in the `package.json` file in the root directory of the project.

If you intend to use the PHP scripts to import historical data you'll also need to run:

```shell
$ composer install
```

Similarly, the PHP dependencies that will be installed can be found in the `composer.json` file.

From here you'll need to copy or rename the `./.env.example` file to `./.env`. Edit this file, inserting your MySQL hostname and credentials along with the other config paramters available.


## Getting Started
First things first, in order to backtest our strategies we're going to need some historical data for the symbols we're interested in. Currently grandmaster supports importing data from the Tradier API. You'll need an account with Tradier and you'll need to add your API/access key to the `./.env` file.

Before we can import the data we need somewhere to store the data. We're going to use a MySQL database for this because it's easy and fast to setup. Using the `./tables.sql` file as a reference, create one table for each symbol you intend to import data for.

When you're ready you can use the `./import.php` file to import data for each symbol directly from the Tradier API. From your terminal run:
```shell
$ php import.php [SYMBOL] [DATE]
```

Where `[SYMBOL]` is the symbol you want to import data for, e.g. NFLX

And `[DATE]` is a single date formatted as YYYY-MM-DD, e.g. 2018-09-28

You'll need to do this for each date you want data for. It's worth noting that the Tradier API only returns data for the last 30 days so if you want to go further back than that you'll need to find another source of data.

It should also be noted that the `import.php` script imports 1-minute bars for the given symbol. If you want finer or courser-grained data (e.g. tick or 5-minute bars) you'll need to modify the script to accomplish that or find an alternative data source.

Once the data is in the database you're ready to start backtesting your strategies. An example strategy is provided at: `./strategies/example-strategy/`. Continue reading below to learn how to create your own strategies and configure existing strategies to fit your needs.

## Strategies
The easiest way to create your own strategy is to copy the example strategy folder and rename it with the name of your strategy:

```shell
$ cp -R ./strategies/example-strategy ./strategies/my-strategy
```

From there you can modify `strategy.js` and `config.json` as needed to fit your needs.

### Custom Strategies
A strategy in grandmaster is defined with a folder in the `./strategies` folder with whatever unique name you want. You will use this folder name to reference your strategy in the backtester and the execution engine later on so remember it.

Inside this folder you must have (at minimum) a `strategy.js` file and a `config.json` file.

A `strategy.js` file looks something like this:

```javascript
class Strategy extends BaseStrategy {
    buy() {
        // In the buy() function we define the logic
        // that determines when to trigger a BUY indicator.
    }

    sell() {
        // In the sell() function we define the logic
        // that determines when to trigger a SELL indicator.
    }
}
```

Within this file we can define our algorithm/strategy for trading a given equity. Within the `buy` function we execute the logic that determines when to buy the equity. Similarly within the `sell` function we determine when to sell that equity.

### Strategy Configuration
A strategy requires a configuration file `config.json`. At minimum it must contain two keys: `historicBars` and `symbols`.

`historicBars` determines how many bars to load from the history before we attempt to generate buy or sell signals for an equity. This is used to warm up our indicators when necessary. For example: If you're using a Bollinger Band with a 20-period look back window you'll want the the `historicBars` to be *at least* 20 beause you won't get accurate data from the Bollinger Band indicator until at least 20 bars have been seen.

`symbols` defines which symbols to include in the backtest. You need to define at least one symbol but you can define as many as you want. One backtest will be run for each symbol defined. You can also use this object to define symbol-specific configuration values that can be accessed within your strategy when determining when to buy or sell.

A bare-bones `config.json` file looks like this:
```json
{
    "historicBars": 60,

    "symbols": {
        "SPY": {}
    }
}
```


## Backtesting
Once you've defined your strategy you can backtest it against historical data to validate it's performance.

To execute a backtest run:
```shell
$ node backtest.js -s [YOUR STRATEGY FOLDER]
```

The backtester also accepts several flags to modify it's behavior:

Short Flag | Long Flag | Parameter | Description
-----------|-----------|-----------|-----------
-s | --strategy | [FOLDER NAME] | The strategy to backtest.<br>**Required**
-v | --verbose | | Toggle verbosity. When included all the buy/sell signals will be output as well as the performance summary for the backtest.
-b | --begin | [DATE]<br>e.g. 2018-09-28 | Set the beginning date for the backtest.
-e | --end | [DATE]<br>e.g. 2018-09-28 | Set the ending date for the backtest.
-c | --capital | [NUMBER]<br>e.g. 5000 | Set the amount of capital to be used for the backtest.<br>Default is 1000.
-o | --tofile | | When included the output will be sent to a file instead of the console. Helpful for backtests that generate a lot of signals.
-d | --debug | | When included all data (bars and indicators setup on the strategy) will be output to a CSV file for easier debugging.
-f | --format | `table` \| `json` | Determines the output format, either an ASCII table or a JSON object (as a string).
-g | --config | [stringified JSON] | Allows you to pass in a custom config object in JSON format to override the default `config.json`.


## Available Indicators
You can browse all the available indicators in the `./lib` folder.

### Included Indicators
- SMA (Simple Moving Average)
- EMA (Exponential Moving Average)
- RSI (Relative Strength Index)
- CMF (Chaikin Money Flow)
- Bollinger Bands

If you would like to contribute additional indicators you're more than welcome to open a pull request. If you don't feel you have the time/skills to contribute the code but would like to see a particular indicator included feel free to open an issue and let me know.

### Utilities
We include various utility functions for working with `Series` and streaming data.

- Cross Over
- Cross Under
- etc


## Contributing
Feel free to contribute to this project by opening issues when you find something wrong or have questions about the project and submitting pull requests with improved code or documentation.

### Testing
All indicators and utilities have tests to verify the correctness of the implementation. To run these tests simply run:
```shell
$ yarn test
````

from the root project directory. All the tests can be found in `./lib/tests/` and by default all tests are executed when the above command is executed. If you want to run a single set of tests you can specify it like so:

```shell
$ yarn test sma
```

## License
See [LICENSE](https://github.com/JeffreyHyer/grandmaster/blob/master/LICENSE.md) for details.