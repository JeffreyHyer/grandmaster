<?php

/**
 * Usage:   php import_iex.php [SYMBOL] [DATE]
 *     e.g. php import_iex.php tvix 2018-09-25
 */

require('./vendor/autoload.php');

use Carbon\Carbon;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

if ($argc < 2) {
    print "Usage: php import_iex.php [SYMBOL] [DATE=YYYY-MM-DD]" . PHP_EOL;
    exit();
}

$symbol = strtolower($argv[1]);

if ($argc > 2) {
    $date = new Carbon($argv[2]);
} else {
    $date = Carbon::now();
}

require_once __DIR__ . '/db.php';
$db = openDb();
$table = "iex_{$symbol}";
ensureBarsTable($db, $table);

$client = new GuzzleHttp\Client();
$request = $client->request(
    'GET',
    'https://api.iextrading.com/1.0/stock/' . strtoupper($symbol) . '/chart/date/' . $date->format('Ymd'),
    [
        'headers' => [
            'Accept' => 'application/json'
        ]
    ]
);
$data = $request->getBody();
file_put_contents("./data/iex/" . strtoupper($symbol) . "_{$date->format('Y-m-d')}.json", $data);
$file = json_decode($data, true);

foreach ($file as $bar) {
    $start      = (new Carbon($bar['date'] . " " . $bar['minute'] . ":00", 'US/Eastern'))->format('Y-m-d H:i:s');
    $open       = (double)$bar['marketOpen'];
    $close      = (double)$bar['marketClose'];
    $high       = (double)$bar['marketHigh'];
    $low        = (double)$bar['marketLow'];
    $volume     = (double)$bar['marketVolume'];

    insertBar($db, $table, [$start, $open, $high, $low, $close, $volume]);
}

fwrite(STDOUT, "[+] Processed: ./data/iex/{$symbol}_{$date->format('Y-m-d')}.json" . PHP_EOL);

$db = null;
