-- Bars tables for SQLite. One table per symbol (lowercased); `iex_` / `alpaca_`
-- prefixes are used for the alternate data sources.
--
-- You normally don't need to run this: the importers and the bar streamer create
-- tables on demand. Apply manually with:  sqlite3 data/grandmaster.sqlite < tables.sql

CREATE TABLE IF NOT EXISTS "tvix" (
  start  TEXT PRIMARY KEY NOT NULL,  -- 'YYYY-MM-DD HH:MM:SS'
  open   REAL,
  high   REAL,
  low    REAL,
  close  REAL,
  volume INTEGER
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS "tvix_close" ON "tvix" (close);

CREATE TABLE IF NOT EXISTS "spy" (
  start  TEXT PRIMARY KEY NOT NULL,  -- 'YYYY-MM-DD HH:MM:SS'
  open   REAL,
  high   REAL,
  low    REAL,
  close  REAL,
  volume INTEGER
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS "spy_close" ON "spy" (close);

CREATE TABLE IF NOT EXISTS "fb" (
  start  TEXT PRIMARY KEY NOT NULL,  -- 'YYYY-MM-DD HH:MM:SS'
  open   REAL,
  high   REAL,
  low    REAL,
  close  REAL,
  volume INTEGER
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS "fb_close" ON "fb" (close);

CREATE TABLE IF NOT EXISTS "nflx" (
  start  TEXT PRIMARY KEY NOT NULL,  -- 'YYYY-MM-DD HH:MM:SS'
  open   REAL,
  high   REAL,
  low    REAL,
  close  REAL,
  volume INTEGER
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS "nflx_close" ON "nflx" (close);
