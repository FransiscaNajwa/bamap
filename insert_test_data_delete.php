<?php
include 'db_config.php';

// Insert test data for delete_data.php
$testData = [
    ["id" => 1, "shipName" => "Test Ship 1", "etaTime" => "2026-02-06 10:00:00", "endTime" => "2026-02-06 18:00:00"],
    ["id" => 2, "type" => "maintenance", "startTime" => "2026-02-07 08:00:00", "endTime" => "2026-02-07 12:00:00"]
];

foreach ($testData as $data) {
    if (isset($data['shipName'])) {
        $stmt = $conn->prepare("INSERT INTO ship_schedules (id, shipName, etaTime, endTime) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("isss", $data['id'], $data['shipName'], $data['etaTime'], $data['endTime']);
    } else {
        $stmt = $conn->prepare("INSERT INTO maintenance_schedules (id, type, startTime, endTime) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("isss", $data['id'], $data['type'], $data['startTime'], $data['endTime']);
    }
    $stmt->execute();
    echo "Inserted test data: ID = " . $data['id'] . "\n";
}
