<?php
// Simulasi pengiriman payload JSON ke save_ship.php

$url = 'http://localhost/berth-map-main/save_ship.php';

$data = [
    'shipName' => 'Test Ship',
    'company' => 'Test Company',
    'code' => 'TST123',
    'length' => 100,
    'draft' => 5.5,
    'destPort' => 'Test Port',
    'berthLocation' => null,
    'nKd' => 500,
    'minKd' => 400,
    'loadValue' => 300,
    'dischargeValue' => 200,
    'etaTime' => '2026-02-10 10:00:00',
    'startTime' => '2026-02-10 12:00:00',
    'etcTime' => '2026-02-10 14:00:00',
    'endTime' => '2026-02-11 16:00:00',
    'status' => 'Scheduled',
    'berthSide' => 'P',
    'bsh' => 50,
    'qccName' => 'QCC1'
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
    ],
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    echo "Error occurred while sending data.";
} else {
    echo $result;
}
?>