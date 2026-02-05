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

error_log("Received parameters: ID = $id, Type = $type");

if ($id > 0 && array_key_exists($type, $tableMap)) {
    $tableName = $tableMap[$type];

    // Periksa apakah data dengan ID yang diminta ada di database
    $checkStmt = $conn->prepare("SELECT COUNT(*) FROM $tableName WHERE id = ?");
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $checkStmt->bind_result($count);
    $checkStmt->fetch();
    $checkStmt->close();

    if ($count === 0) {
        error_log("Data dengan ID: $id tidak ditemukan di tabel: $tableName");
        echo json_encode(["status" => "error", "message" => "Data not found"]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM $tableName WHERE id = ?");
    $stmt->bind_param("i", $id);

    error_log("Executing query: DELETE FROM $tableName WHERE id = $id");

    if ($stmt->execute()) {
        error_log("Data successfully deleted from table: $tableName, ID: $id");
        echo json_encode(["status" => "success"]);
    } else {
        error_log("Failed to delete data from table: $tableName, ID: $id. Error: " . $stmt->error);
        echo json_encode(["status" => "error", "message" => "Failed to delete data"]);
    }

    $stmt->close();
} else {
    error_log("Invalid parameters: ID = $id, Type = $type");
    echo json_encode(["status" => "error", "message" => "Invalid parameters"]);
}
?>