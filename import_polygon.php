<?php

/**
 * Usage:   php import_polygon.php [SYMBOL] [DATE]
 *     e.g. php import_polygon.php tvix 2018-09-25
 */

require('./vendor/autoload.php');

use Carbon\Carbon;
use Dotenv\Dotenv;

$dotenv = new Dotenv(__DIR__);
$dotenv->load();

if ($argc < 2) {
    print "Usage: php import_polygon.php [SYMBOL] [DATE=YYYY-MM-DD]" . PHP_EOL;
    exit();
}

$symbol = strtolower($argv[1]);

if ($argc > 2) {
    $date = new Carbon($argv[2]);
} else {
    $date = Carbon::now();
}

$db = new mysqli($_ENV['MYSQL_HOST'], $_ENV['MYSQL_USER'], $_ENV['MYSQL_PASS'], $_ENV['MYSQL_DB']);

$client = new GuzzleHttp\Client();
$request = $client->request(
    'GET',
    'https://api.polygon.io/v1/historic/agg/minute/' . strtoupper($symbol) . '?from=' . $date->format('Y-m-d') . '&to=' . $date->copy()->addDays(1)->format('Y-m-d') . '&apiKey=' . $_ENV['ALPACA_KEY'],
    [
        'headers' => [
            'Accept' => 'application/json'
        ]
    ]
);
$data = $request->getBody();
file_put_contents("./data/alpaca/" . strtoupper($symbol) . "_{$date->format('Y-m-d')}.json", $data);
$file = json_decode($data, true);

$firstBar = $date->copy()->timezone('US/Eastern')->addDay(1)->hour(9)->minute(30)->second(0);
$lastBar = $date->copy()->timezone('US/Eastern')->addDay(1)->hour(15)->minute(59)->second(0);

foreach ($file['ticks'] as $bar) {
    $start = Carbon::createFromTimestampMs($bar['d'], 'US/Eastern'); //->format('Y-m-d H:i:s');

    if ($start->lessThan($firstBar) || $start->greaterThan($lastBar)) {
        continue;
    }

    $start      = $start->format('Y-m-d H:i:s');
    $open       = (double)$bar['o'];
    $close      = (double)$bar['c'];
    $high       = (double)$bar['h'];
    $low        = (double)$bar['l'];
    $volume     = (double)$bar['v'];

    $db->query("INSERT IGNORE INTO alpaca_{$symbol} VALUES('{$start}', '{$open}', '{$high}', '{$low}', '{$close}', '{$volume}')");

    if ($db->error) {
        fwrite(STDOUT, "[!] MYSQL ERROR: {$db->error}" . PHP_EOL);
    }
}

fwrite(STDOUT, "[+] Processed: ./data/alpaca/{$symbol}_{$date->format('Y-m-d')}.json" . PHP_EOL);

$db->close();
