import { mkdirSync } from 'fs'
import { join, dirname, resolve } from 'path'
import { DatabaseSync } from 'node:sqlite'

const DEFAULT_PATH = join(__dirname, '..', 'data', 'grandmaster.sqlite')

/**
 * Open (creating if needed) the SQLite database. The location comes from
 * SQLITE_PATH in .env, defaulting to ./data/grandmaster.sqlite.
 *
 * @returns DatabaseSync
 */
function openDb () {
  const file = process.env.SQLITE_PATH || DEFAULT_PATH

  mkdirSync(dirname(resolve(file)), { recursive: true })

  const db = new DatabaseSync(file)

  // Allow the bar streamer, signal runner and importers to share the file
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA busy_timeout = 5000')

  return db
}

/**
 * Quote a table name for safe interpolation into SQL.
 *
 * @param String name
 * @returns String
 */
function quoteId (name) {
  return `"${String(name).replace(/"/g, '""')}"`
}

/**
 * Create the bars table for a symbol if it doesn't already exist.
 * `start` holds a 'YYYY-MM-DD HH:MM:SS' string, which sorts chronologically.
 *
 * @param DatabaseSync db
 * @param String table
 */
function ensureBarsTable (db, table) {
  const t = quoteId(table)

  db.exec(`CREATE TABLE IF NOT EXISTS ${t} (
    start  TEXT PRIMARY KEY NOT NULL,
    open   REAL,
    high   REAL,
    low    REAL,
    close  REAL,
    volume INTEGER
  ) WITHOUT ROWID`)
  db.exec(`CREATE INDEX IF NOT EXISTS ${quoteId(`${table}_close`)} ON ${t} (close)`)
}

export default { openDb, quoteId, ensureBarsTable }
