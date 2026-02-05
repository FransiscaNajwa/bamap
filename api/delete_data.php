<?php
include 'db_config.php';
header('Content-Type: application/json');

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$type = isset($_GET['type']) ? $_GET['type'] : '';

$tableMap = [
    'ship' => 'ship_schedules',
    'maintenance' => 'maintenance_schedules',
    'rest' => 'rest_schedules'
];

if ($id > 0 && array_key_exists($type, $tableMap)) {
    $tableName = $tableMap[$type];
    if ($conn->query("DELETE FROM $tableName WHERE id = $id")) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error"]);
    }
}
?>