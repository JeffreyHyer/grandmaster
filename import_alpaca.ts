/**
 * Import bars from the Alpaca market data API into SQLite.
 *
 * Usage:   node import_alpaca.ts SYMBOL [START=YYYY-MM-DD] [END=YYYY-MM-DD] [TIMEFRAME=1Min|1D] [FEED=iex|sip]
 *     e.g. node import_alpaca.ts spy 2024-01-02 2024-01-31
 *
 * Reads ALPACA_KEY / ALPACA_SECRET and SQLITE_PATH from .env.
 * Bars are stored in Eastern time in a table named after the lowercased symbol.
 */

import https from 'node:https'
import dotenv from 'dotenv'
import { openDb, quoteId, ensureBarsTable } from './lib/db.ts'

dotenv.config()

interface AlpacaBar {
  t: string
  o: number
  h: number
  l: number
  c: number
  v: number
}

interface AlpacaBarsResponse {
  bars?: AlpacaBar[] | null
  next_page_token?: string | null
}

const [symbolArg, startArg, endArg, timeframe = '1Min', feed = 'sip'] = process.argv.slice(2)

if (!symbolArg) {
  console.log('Usage: node import_alpaca.ts SYMBOL [START=YYYY-MM-DD] [END=YYYY-MM-DD] [FEED=iex|sip]')
  process.exit(1)
}

if (!process.env.ALPACA_KEY || !process.env.ALPACA_SECRET) {
  console.error('[!] ALPACA_KEY and ALPACA_SECRET must be set in .env')
  process.exit(1)
}

const symbol = symbolArg.toLowerCase()
if (!/^[a-z0-9._-]+$/.test(symbol)) {
  console.error('[!] Invalid symbol')
  process.exit(1)
}

const today = new Date().toISOString().slice(0, 10)
const start = startArg || today
const end = endArg || start

const etFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23'
})

// "2024-01-02T14:30:00Z" -> "2024-01-02 09:30:00" (Eastern)
function toEastern (iso: string) {
  const p: Record<string, string> = {}
  etFormat.formatToParts(new Date(iso)).forEach(x => { p[x.type] = x.value })
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`
}

function getJson (url: string) {
  return new Promise<AlpacaBarsResponse>((resolve, reject) => {
    https.get(url, {
      headers: {
        'APCA-API-KEY-ID': process.env.ALPACA_KEY!,
        'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET!,
        Accept: 'application/json'
      }
    }, res => {
      let body = ''
      res.on('data', chunk => { body += chunk })
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}: ${body}`))
        }
        try { resolve(JSON.parse(body)) } catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

const db = openDb()

async function main () {
  ensureBarsTable(db, symbol)
  const insert = db.prepare(`INSERT OR IGNORE INTO ${quoteId(symbol)}${timeframe === '1Min' ? '' : `_${timeframe.toLowerCase().substring(0, 2)}` } (start, open, high, low, close, volume) VALUES (?, ?, ?, ?, ?, ?)`)

  let pageToken: string | null | undefined = null
  let total = 0

  do {
    const params = new URLSearchParams({
      timeframe,
      start: `${start}T00:00:00-05:00`,
      end: `${end}T23:59:59-05:00`,
      limit: '10000',
      adjustment: 'raw',
      feed
    })
    if (pageToken) params.set('page_token', pageToken)

    const url = `https://data.alpaca.markets/v2/stocks/${encodeURIComponent(symbol.toUpperCase())}/bars?${params}`
    const data = await getJson(url)
    const bars = data.bars || []

    if (bars.length) {
      const rows = bars.map(b => [toEastern(b.t), b.o, b.h, b.l, b.c, b.v] as const)
      db.exec('BEGIN')
      try {
        rows.forEach(r => insert.run(...r))
        db.exec('COMMIT')
      } catch (e) {
        db.exec('ROLLBACK')
        throw e
      }
      total += rows.length
      console.log(`[+] Imported ${rows.length} bars (${total} total)`)
    }

    pageToken = data.next_page_token
  } while (pageToken)

  console.log(`[+] Done: ${total} bars for ${symbol.toUpperCase()} ${start} -> ${end}`)
}

main()
  .catch(err => {
    console.error(`[!] ${err.message}`)
    process.exitCode = 1
  })
  .then(() => db.close())
