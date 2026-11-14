<?php

/**
 * Open the SQLite database shared with the Node scripts (SQLITE_PATH in .env,
 * default ./data/grandmaster.sqlite) and make sure a bars table exists.
 */

function openDb(): PDO
{
    $file = $_ENV['SQLITE_PATH'] ?? (__DIR__ . '/data/grandmaster.sqlite');

    if (!is_dir(dirname($file))) {
        mkdir(dirname($file), 0777, true);
    }

    $db = new PDO('sqlite:' . $file);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec('PRAGMA journal_mode = WAL');
    $db->exec('PRAGMA busy_timeout = 5000');

    return $db;
}

function ensureBarsTable(PDO $db, string $table): void
{
    $t = '"' . str_replace('"', '""', $table) . '"';
    $i = '"' . str_replace('"', '""', $table . '_close') . '"';

    $db->exec("CREATE TABLE IF NOT EXISTS {$t} (
        start  TEXT PRIMARY KEY NOT NULL,
        open   REAL,
        high   REAL,
        low    REAL,
        close  REAL,
        volume INTEGER
    ) WITHOUT ROWID");
    $db->exec("CREATE INDEX IF NOT EXISTS {$i} ON {$t} (close)");
}

function insertBar(PDO $db, string $table, array $bar): void
{
    $t = '"' . str_replace('"', '""', $table) . '"';

    $db->prepare("INSERT OR IGNORE INTO {$t} VALUES (?, ?, ?, ?, ?, ?)")->execute($bar);
}
