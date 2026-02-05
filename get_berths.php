<?php
include 'db_config.php';
header('Content-Type: application/json');

$response = [];

try {
    $berths = $conn->query("SELECT id, name, startKd, endKd FROM berths ORDER BY startKd ASC");
    $response['berths'] = $berths->fetch_all(MYSQLI_ASSOC);
    echo json_encode($response);
} catch (Exception $e) {
    error_log("Error saat mengambil berths: " . $e->getMessage());
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
