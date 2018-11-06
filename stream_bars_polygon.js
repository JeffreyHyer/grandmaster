require('dotenv').config()

const format = require('date-fns/format')

const NATS = require('nats')

const Redis = require('redis')
const redis = Redis.createClient({
    host: (process.env.REDIS_HOST || '127.0.0.1'),
    port: (process.env.REDIS_PORT || 6379),
    password: (process.env.REDIS_PASS || null),
    db: (process.env.REDIS_DB || 0)
})

const mysql = require('mysql')
const db = mysql.createConnection({
    host:       process.env.MYSQL_HOST,
    user:       process.env.MYSQL_USER,
    password:   process.env.MYSQL_PASS,
    database:   process.env.MYSQL_DB
})

var firstMinute = {
    'TVIX': true
}

var lastMinute = {
    'TVIX': null
}

var symbols = {
    'TVIX': [[]]
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
    console.log(`[!] ERROR:`)
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

const natsID = nats.subscribe('T.TVIX', (msg) => {
    let data = JSON.parse(msg)

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

    let time = new Date(data.t)

    // Ignore messages outside of normal market hours
    if (time.getHours() < 9) {
        return
    } else if ((time.getHours() === 9) && (time.getMinutes() < 30)) {
        return
    } else if (time.getHours() > 15) {
        return
    }

    let minute = time.getMinutes()

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

process.on('SIGINT', () => {
    nats.unsubscribe(natsID)
    nats.close()
    redis.quit()
    db.end()

    process.exit()
})

var consolidateBar = (symbol) => {
    if (symbols[symbol] && (symbols[symbol].length > 1)) {
        let trades = symbols[symbol].pop()

        if (firstMinute[symbol] === true) {
            firstMinute[symbol] = false
            return
        }

        let bar = {
            symbol: symbol,
            start: null,
            end: null,
            open_time: null,
            close_time: null,
            open: 0,
            high: 0,
            low: Infinity,
            close: 0,
            volume: 0,
            trades: 0
        }

        trades.forEach(trade => {
            let time = (new Date(trade.time)).getTime()
            let price = Number(trade.price)

            if ((!bar.open_time) || (time < bar.open_time)) {
                bar.open_time = time
                bar.open = price
            }

            if ((!bar.close_time) || (time > bar.close_time)) {
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
        let date = new Date(bar.open_time)
        bar.start = date.setSeconds(0, 0)
        bar.end = date.setMinutes((date.getMinutes() + 1), 0, 0)

        // Convert all timestamps to MySQL compatible datetime strings
        bar.start = format(bar.start, 'YYYY-MM-DD HH:mm:ss')
        bar.end = format(bar.end, 'YYYY-MM-DD HH:mm:ss')
        bar.open_time = format(bar.open_time, 'YYYY-MM-DD HH:mm:ss')
        bar.close_time = format(bar.close_time, 'YYYY-MM-DD HH:mm:ss')

        // Save to database
        db.query(
            `INSERT INTO ${bar.symbol.toLowerCase()} VALUES(?, ?, ?, ?, ?, ?)`,
            [
                bar.start,
                bar.open,
                bar.high,
                bar.low,
                bar.close,
                bar.volume
            ],
            (error) => {
                if (error) {
                    console.log(`[!] MySQL ERROR: ${error}`)
                }
            }
        )

        redis.publish(bar.symbol, JSON.stringify(bar))
    } else {
        console.log(`[!] ERROR: consolidateBar() was called for ${symbol} but no data was found`)
    }
}
