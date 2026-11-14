import commandLineArgs from 'command-line-args'
import dotenv from 'dotenv'
import { createClient } from 'redis'
import nodemailer from 'nodemailer'
import { openDb, quoteId } from './lib/db.ts'
import type BaseStrategy from './lib/BaseStrategy.ts'
import type { Bar, Signal, StrategyConfig } from './lib/types.ts'

type StrategyConstructor = new (symbols: string[], config?: StrategyConfig) => BaseStrategy

const cliParams = [
  { name: 'strategy', alias: 's', type: String, defaultOption: true }
]
const params = commandLineArgs(cliParams)

if (undefined === params.strategy) {
  console.log('[!] ERROR: You must specify a strategy')
  process.exit()
}

dotenv.config()

const config: StrategyConfig = (await import(`./strategies/${params.strategy}/config.json`, { with: { type: 'json' } })).default
const Strategy: StrategyConstructor = (await import(`./strategies/${params.strategy}/strategy.ts`)).default
const strategy = new Strategy(Object.keys(config.symbols))

const redisBars = createClient({
  socket: {
    host: (process.env.REDIS_HOST || '127.0.0.1'),
    port: Number(process.env.REDIS_PORT || 6379)
  },
  password: (process.env.REDIS_PASS || undefined),
  database: Number(process.env.REDIS_DB || 0)
})

const redisSignals = redisBars.duplicate()

const db = openDb()

const smtp = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

console.log('============================================================')
console.log((new Date()).toISOString())
console.log('')

let historyLoaded = false

try {
  Object.keys(config.symbols).forEach((symbol) => {
    // Newest bars first so LIMIT keeps the most recent ones, then reverse
    const bars = db.prepare(`SELECT *, ? AS symbol FROM ${quoteId(symbol.toLowerCase())} ORDER BY start DESC LIMIT ?`)
      .all(symbol, config.historicBars)
      .reverse() as unknown as Bar[]

    strategy.addHistory(symbol, bars)
  })

  db.close()
  console.log('[+] History Loaded')

  historyLoaded = true
} catch (error) {
  console.log(`[!] SQLite ERROR: ${(error as Error).message}`)
  db.close()
  shutdownRedis().finally(() => {
    process.exit(3)
  })
}

redisSignals.on('connect', () => {
  console.log('[+] [Redis:Signals] Connected')
})

redisSignals.on('error', (error) => {
  console.log(`[!] [Redis:Signals] Error: ${error.message}`)
})

redisSignals.on('end', () => {
  console.log('[-] [Redis:Signals] Disconnected')
})

redisBars.on('connect', () => {
  console.log('[+] [Redis:Bars] Connected')
})

redisBars.on('error', (error) => {
  console.log(`[!] [Redis:Bars] Error: ${error.message}`)
})

redisBars.on('end', () => {
  console.log('[-] [Redis:Bars] Disconnected')
})

function onBar (message: string, _channel: string) {
  if (historyLoaded === true) {
    const bar = JSON.parse(message)

    if (bar.symbol && strategy.symbols[bar.symbol.toUpperCase()]) {
      strategy.addBar(bar.symbol.toUpperCase(), bar, onSignal)
    }
  }
}

async function shutdownRedis () {
  try {
    if (redisBars.isOpen) {
      await redisBars.unsubscribe()
      await redisBars.quit()
    }

    if (redisSignals.isOpen) {
      await redisSignals.quit()
    }
  } catch (error) {
    console.log(`[!] Redis shutdown error: ${(error as Error).message}`)
  }
}

Promise.all([redisBars.connect(), redisSignals.connect()])
  .then(() => redisBars.subscribe(Object.keys(config.symbols), onBar))
  .catch((error) => {
    console.log(`[!] Redis startup error: ${error.message}`)
    process.exit(2)
  })

process.on('SIGINT', async () => {
  await shutdownRedis()

  console.log('[-] Exiting')

  process.exit(0)
})

function onSignal (signal: Signal) {
  if (signal.buy) {
    const date = (new Date(signal.bar.start)).toISOString()

    publishSignal(signal, 'BUY')

    console.log(`[BUY]\t${params.strategy}\t${signal.symbol}\t${date}\t$${signal.bar.close.toFixed(2)}`)
    email(`[BUY] | ${params.strategy} | ${signal.symbol} | ${signal.bar.close.toFixed(2)}`)
  } else if (signal.sell) {
    const date = (new Date(signal.bar.start)).toISOString()

    publishSignal(signal, 'SELL')

    console.log(`[SELL]\t${params.strategy}\t${signal.symbol}\t${date}\t$${signal.bar.close.toFixed(2)}`)
    email(`[SELL] | ${params.strategy} | ${signal.symbol} | ${signal.bar.close.toFixed(2)}`)
  }
}

function publishSignal (signal: Signal, action: 'BUY' | 'SELL') {
  redisSignals.publish(`${params.strategy}_${signal.symbol}`, JSON.stringify({ strategy: params.strategy, symbol: signal.symbol, action, price: signal.bar.close }))
    .catch((error) => console.log(`[!] [Redis:Signals] Publish error: ${error.message}`))
}

function email (message: string) {
  smtp.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_TO,
    subject: 'Trading Signal',
    text: `${message}`
  }, (error) => {
    if (error) {
      console.log(`[!] SMTP ERROR: ${error}`)
    }
  })
}
