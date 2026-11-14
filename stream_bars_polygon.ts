import dotenv from 'dotenv'
import { format } from 'date-fns'
import NATS from 'nats'
import { createClient } from 'redis'
import { openDb, quoteId, ensureBarsTable } from './lib/db.ts'

dotenv.config()

const redis = createClient({
  socket: {
    host: (process.env.REDIS_HOST || '127.0.0.1'),
    port: Number(process.env.REDIS_PORT || 6379)
  },
  password: (process.env.REDIS_PASS || undefined),
  database: Number(process.env.REDIS_DB || 0)
})

const db = openDb()

interface Tick {
  size: number
  price: number
  time: number
}

const firstMinute: Record<string, boolean> = {
  TVIX: true
}

const lastMinute: Record<string, number | null> = {
  TVIX: null
}

const symbols: Record<string, Tick[][]> = {
  TVIX: [[]]
}

console.log('===============================================================================')
console.log((new Date()).toISOString())

const nats = NATS.connect({
  servers: [
    'nats://nats1.polygon.io:31101',
    'nats://nats2.polygon.io:31102',
    'nats://nats3.polygon.io:31103'
  ],
  token: process.env.ALPACA_KEY
})

nats.on('error', (error) => {
  console.log('[!] ERROR:')
  console.log(error)
})

nats.on('connect', () => {
  console.log('[+] NATS connected')
})

nats.on('disconnect', () => {
  console.log('[-] NATS disconnected')
})

nats.on('close', () => {
  console.log('[-] NATS connection closed')
})

nats.on('reconnect', () => {
  console.log('[~] NATS reconnecting')
})

const natsID = nats.subscribe('T.TVIX', (msg: string) => {
  const data = JSON.parse(msg)

  /**
     *  data: {
     *      sym: symbol,
     *      x:   exchange_id,
     *      p:   trade_price,
     *      s:   trade_size,
     *      c:   trade_conditions,
     *      t:   timestamp_ms
     *  }
     */

  // console.log(`[TVIX]\t${data.s} @ ${data.p}`)

  const time = new Date(data.t)

  // Ignore messages outside of normal market hours
  if (time.getHours() < 9) {
    return
  } else if ((time.getHours() === 9) && (time.getMinutes() < 30)) {
    return
  } else if (time.getHours() > 15) {
    return
  }

  const minute = time.getMinutes()

  if (lastMinute['TVIX'] !== minute) {
    if (lastMinute['TVIX'] !== null) {
      symbols['TVIX'].unshift([])

      consolidateBar('TVIX')
    }

    lastMinute['TVIX'] = minute
  }

  symbols['TVIX'][0].push({
    size: data.s,
    price: data.p,
    time: data.t
  })
})

redis.on('connect', () => {
  console.log('(+) Redis connected')
})

redis.on('error', (error) => {
  console.log(`(!) Redis Error: ${error}`)
})

redis.on('end', () => {
  console.log('(-) Redis disconnected')
})

redis.connect().catch((error) => {
  console.log(`(!) Redis connect failed: ${error}`)
  process.exit(2)
})

process.on('SIGINT', async () => {
  nats.unsubscribe(natsID)
  nats.close()

  try {
    if (redis.isOpen) {
      await redis.quit()
    }
  } catch (error) {
    console.log(`(!) Redis Error: ${error}`)
  }

  db.close()

  process.exit()
})

const consolidateBar = (symbol: string) => {
  if (symbols[symbol] && (symbols[symbol].length > 1)) {
    const trades = symbols[symbol].pop()!

    if (firstMinute[symbol] === true) {
      firstMinute[symbol] = false
      return
    }

    const bar: {
      symbol: string
      start: number | string
      end: number | string
      open_time: number | string
      close_time: number | string
      open: number
      high: number
      low: number
      close: number
      volume: number
      trades: number
    } = {
      symbol,
      start: 0,
      end: 0,
      open_time: 0,
      close_time: 0,
      open: 0,
      high: 0,
      low: Infinity,
      close: 0,
      volume: 0,
      trades: 0
    }

    trades.forEach(trade => {
      const time = (new Date(trade.time)).getTime()
      const price = Number(trade.price)

      if ((!bar.open_time) || (time < Number(bar.open_time))) {
        bar.open_time = time
        bar.open = price
      }

      if ((!bar.close_time) || (time > Number(bar.close_time))) {
        bar.close_time = time
        bar.close = price
      }

      if (price > bar.high) {
        bar.high = price
      }

      if (price < bar.low) {
        bar.low = price
      }

      bar.trades += 1
      bar.volume += Number(trade.size)
    })

    // Set start and end time
    const date = new Date(Number(bar.open_time))
    bar.start = date.setSeconds(0, 0)
    bar.end = date.setMinutes((date.getMinutes() + 1), 0, 0)

    // Convert all timestamps to datetime strings (the format stored in SQLite)
    bar.start = format(bar.start, 'yyyy-MM-dd HH:mm:ss')
    bar.end = format(bar.end, 'yyyy-MM-dd HH:mm:ss')
    bar.open_time = format(bar.open_time, 'yyyy-MM-dd HH:mm:ss')
    bar.close_time = format(bar.close_time, 'yyyy-MM-dd HH:mm:ss')

    // Save to database
    try {
      const table = bar.symbol.toLowerCase()

      ensureBarsTable(db, table)
      db.prepare(`INSERT INTO ${quoteId(table)} VALUES (?, ?, ?, ?, ?, ?)`)
        .run(bar.start, bar.open, bar.high, bar.low, bar.close, bar.volume)
    } catch (error) {
      console.log(`[!] SQLite ERROR: ${error}`)
    }

    redis.publish(bar.symbol, JSON.stringify(bar)).catch((error) => {
      console.log(`(!) Redis publish error: ${error}`)
    })
  } else {
    console.log(`[!] ERROR: consolidateBar() was called for ${symbol} but no data was found`)
  }
}
