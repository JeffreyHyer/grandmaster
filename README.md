# Grandmaster

Grandmaster is a strategy backtesting and execution engine written in node.js.
The strategies are largely configurable by the user and can include any number
of technical indicators and supplemental data sources. It's very flexible and
easy to get started with. I am not an expert but I've had great success with
my own strategies running on this engine trading both traditional equities
(stocks) and modern assets (cryptocurrencies). Use at your own risk.


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

Similarly, this PHP dependencies that will be installed can be found in the `composer.json` file.


## Getting Started

TODO
- Setup MySQL tables
- Import historical data
- etc.


## Strategy Creation
TODO
- Create a custom strategy from the example strategy


## Available Indicators
TODO

### Indicators
- SMA (Simple Moving Average)
- EMA (Exponential Moving Average)
- RSI (Relative Strength Index)
- CMF (Chaikin Money Flow)
- Bollinger Bands

### Utilities
- Cross Over
- Cross Under
- etc


## Contributing
TODO

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