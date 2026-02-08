<?php
include 'db_config.php';

header('Content-Type: application/json');

$response = [];

try {
    $tables = $conn->query("SHOW TABLES");
    $response['tables'] = $tables->fetch_all(MYSQLI_ASSOC);
    echo json_encode($response);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>