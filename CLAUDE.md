# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Grandmaster is a Node.js strategy backtesting and live signal engine for equities/crypto. Strategies are user-defined folders under `strategies/`; the same strategy class is used by both the backtester and the live signal runner. PHP scripts (`import*.php`) load historical bars into SQLite.

## Commands

```shell
yarn install              # JS deps (composer install only needed for the PHP importers)
yarn test                 # jest, all tests in lib/tests/
yarn typecheck           # tsc --noEmit (TypeScript 6, strict)
yarn test sma             # single test file (matches lib/tests/sma.test.ts)
npx eslint .              # lint (standard style, 4-space indent; no lint script in package.json)

node backtest.ts -s <strategy-folder> [-v] [-b YYYY-MM-DD] [-e YYYY-MM-DD] [-c capital] [-o] [-d] [-f table|json] [-g '<json config>'] [-a iex|alpaca]
node signals.ts -s <strategy-folder>        # live: consumes bars from Redis, publishes signals
node stream_bars_polygon.ts                 # live: Polygon NATS ticks -> bars -> SQLite + Redis
pm2 start pm2.config.cjs                     # runs the bars streamer + signals runner
php import.php SYMBOL YYYY-MM-DD            # Tradier 1-min bars (also import_iex.php, import_polygon.php, import_files.php)
```

The project is TypeScript + native ESM (`"type": "module"`). Node runs the `.ts` files directly via type stripping (no build step), so relative imports must include the `.ts` extension and only erasable syntax is allowed (no enums / parameter properties). `tsc` is used purely for type checking; jest uses `@swc/jest` (`jest.config.json`). `pm2.config.cjs` stays CommonJS because pm2 loads it with `require`.

Config comes from `.env` (copy `.env.example`): optional `SQLITE_PATH`, Redis, SMTP, and data-provider keys.

## Architecture

**Strategy contract** (`lib/BaseStrategy.ts`): a strategy folder needs `strategy.ts` (class extending `BaseStrategy`, implementing `buy(symbol)` / `sell(symbol)`) and `config.json` (at least `historicBars` and `symbols`). Per-symbol state lives in `this.symbols[symbol]` (`times/open/close/high/low/volume` as `Series`, an `indicators` map, and a `bought` flag). `addBar(symbol, bar, callback)` appends the bar then calls `buy`/`sell`. Strategies that use indicators override `addBar` to feed indicators *before* calling `super.addBar` (see `strategies/example-strategy/strategy.ts`). `addHistory` replays bars without a callback to warm up indicators; `historicBars` is the warm-up length.

**Indicators** (`lib/*.ts`) extend `Indicator`, which wraps a `Series` (an `Array` subclass with `currentValue()` / `previousValue(offset)`). `lib/utils.ts` holds series helpers such as `crossoverSeries` / `crossunderSeries`. Tests for each live in `lib/tests/`.

**Entry points load strategies dynamically** via `require('./strategies/${name}/strategy')` and `.../config`, so the `-s` value must match the folder name.

**Data flow**
- Historical: PHP importers -> one SQLite table per symbol in `data/grandmaster.sqlite` (lowercased symbol; schema in `tables.sql`, tables auto-created by `lib/db.ts` / `db.php`; `-a iex` prefixes the table, e.g. `iex_spy`). `backtest.ts` selects bars ordered by `start` and replays them through the strategy, one backtest per symbol in `config.symbols`.
- Live: `stream_bars_polygon.ts` aggregates Polygon ticks into bars, stores them in SQLite and publishes JSON to a Redis channel named after the symbol. `signals.ts` first loads the last `historicBars` bars from SQLite, then subscribes to the symbol channels, feeds bars to the strategy, and publishes BUY/SELL JSON to Redis channel `<strategy>_<SYMBOL>` (and emails via SMTP). Note `stream_bars_polygon.ts` hardcodes the `T.TVIX` subscription, and `pm2.config.cjs` hardcodes the strategy `2-tvix-rsi`; neither is present in `strategies/` by default.

Queries bind values as parameters; table names (from symbols) are quoted via `quoteId` in `lib/db.ts`. Uses the built-in `node:sqlite` module (no driver dependency); `start` is stored as a `'YYYY-MM-DD HH:MM:SS'` text value.
