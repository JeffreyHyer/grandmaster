<?php

require('./vendor/autoload.php');

use Carbon\Carbon;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

require_once __DIR__ . '/db.php';
$db = openDb();

$dir = './data';
$fileList = scandir($dir);

foreach ($fileList as $fileName) {
    if (substr($fileName, -4) !== "json") {
        fwrite(STDOUT, "[-] Skipping: {$fileName}" . PHP_EOL);
        continue;
    }

    // Files are named SYMBOL_YYYY-MM-DD.json (see import.php)
    $table = strtolower(explode('_', $fileName)[0]);
    ensureBarsTable($db, $table);

    $file = json_decode(file_get_contents("{$dir}/{$fileName}"), true);

    foreach ($file['series']['data'] as $bar) {
        $start      = (new Carbon($bar['time']))->format('Y-m-d H:i:s');
        $open       = (double)$bar['open'];
        $close      = (double)$bar['close'];
        $high       = (double)$bar['high'];
        $low        = (double)$bar['low'];
        $volume     = (double)$bar['volume'];

        insertBar($db, $table, [$start, $open, $high, $low, $close, $volume]);
    }

    fwrite(STDOUT, "[+] Processed: {$dir}/{$fileName}" . PHP_EOL);
}

$db = null;
