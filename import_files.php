<?php

require('./vendor/autoload.php');

use Carbon\Carbon;
use Dotenv\Dotenv;

$dotenv = new Dotenv(__DIR__);
$dotenv->load();

$db = new mysqli($_ENV['MYSQL_HOST'], $_ENV['MYSQL_USER'], $_ENV['MYSQL_PASS'], $_ENV['MYSQL_DB']);

$dir = './data';
$fileList = scandir($dir);

foreach ($fileList as $fileName) {
    if (substr($fileName, -4) !== "json") {
        fwrite(STDOUT, "[-] Skipping: {$fileName}" . PHP_EOL);
        continue;
    }

    $file = json_decode(file_get_contents("{$dir}/{$fileName}"), true);

    foreach ($file['series']['data'] as $bar) {
        $start      = (new Carbon($bar['time']))->format('Y-m-d H:i:s');
        $open       = (double)$bar['open'];
        $close      = (double)$bar['close'];
        $high       = (double)$bar['high'];
        $low        = (double)$bar['low'];
        $volume     = (double)$bar['volume'];

        $db->query("INSERT IGNORE INTO {$symbol} VALUES('{$start}', '{$open}', '{$high}', '{$low}', '{$close}', '{$volume}')");

        if ($db->error) {
            fwrite(STDOUT, "[!] MYSQL ERROR: {$db->error}" . PHP_EOL);
        }
    }

    fwrite(STDOUT, "[+] Processed: {$dir}/{$fileName}" . PHP_EOL);
}

$db->close();
