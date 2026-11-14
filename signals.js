const cliParams = [
  { name: 'strategy', alias: 's', type: String, defaultOption: true }
]
const params = require('command-line-args')(cliParams)

if (undefined === params.strategy) {
  console.log('[!] ERROR: You must specify a strategy')
  process.exit()
}

require('dotenv').config()

const config = require(`./strategies/${params.strategy}/config`)
const Strategy = require(`./strategies/${params.strategy}/strategy`)
const strategy = new Strategy(Object.keys(config.symbols))

const { createClient } = require('redis')
const redisBars = createClient({
  socket: {
    host: (process.env.REDIS_HOST || '127.0.0.1'),
    port: Number(process.env.REDIS_PORT || 6379)
  },
  password: (process.env.REDIS_PASS || undefined),
  database: Number(process.env.REDIS_DB || 0)
})

const redisSignals = redisBars.duplicate()

const mysql = require('mysql')
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
  multipleStatements: true
})

const nodemailer = require('nodemailer')
const smtp = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

console.log('============================================================')
console.log((new Date()).toISOString())
console.log('')

const queries = []
let historyLoaded = false

Object.keys(config.symbols).forEach((symbol) => {
  queries.push(`SELECT *, '${symbol}' AS symbol FROM \`${symbol.toLowerCase()}\` ORDER BY \`start\` DESC LIMIT ${config.historicBars}`)
})

db.query(queries.join(';'), (error, results) => {
  if (error) {
    console.log(`[!] MySQL ERROR: ${error.message}`)
    shutdownRedis().finally(() => {
      db.end(() => { process.exit(3) })
    })
    return
  }

  if (queries.length > 1) {
    results.forEach((result) => {
      const bars = []

      result.forEach((bar) => {
        bars.unshift(bar)
      })

      strategy.addHistory(bars[0].symbol, bars)
    })
  } else {
    const bars = []

    results.forEach((bar) => {
      bars.unshift(bar)
    })

    strategy.addHistory(bars[0].symbol, bars)
  }

  db.end(() => {
    console.log('[+] History Loaded')

    historyLoaded = true
  })
})

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

function onBar (message, symbol) {
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
    console.log(`[!] Redis shutdown error: ${error.message}`)
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

function onSignal (signal) {
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

function publishSignal (signal, action) {
  redisSignals.publish(`${params.strategy}_${signal.symbol}`, JSON.stringify({ strategy: params.strategy, symbol: signal.symbol, action, price: signal.bar.close }))
    .catch((error) => console.log(`[!] [Redis:Signals] Publish error: ${error.message}`))
}

function email (message) {
  smtp.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_TO,
    subject: 'Trading Signal',
    text: `${message}`
  }, (error, info) => {
    if (error) {
      console.log(`[!] SMTP ERROR: ${error}`)
    }
  })
}
