<?php
include 'db_config.php';
header('Content-Type: application/json');

$response = [];

try {
    // Ambil semua data dari tabel ship_schedules + join berths
    $ships = $conn->query("
        SELECT
            s.*,
            b.startKd AS berthStartKd,
            b.endKd AS berthEndKd,
            b.name AS berthName
        FROM ship_schedules s
        LEFT JOIN berths b ON s.berthLocation = b.id
        ORDER BY s.etaTime ASC
    ");
    $response['shipSchedules'] = $ships->fetch_all(MYSQLI_ASSOC);

    error_log("Data yang diambil: " . json_encode($response['shipSchedules']));

    // Ambil semua data dari tabel maintenance_schedules
    $maintenance = $conn->query("SELECT * FROM maintenance_schedules ORDER BY startTime ASC");
    $response['maintenanceSchedules'] = $maintenance->fetch_all(MYSQLI_ASSOC);

    error_log("Data maintenance yang diambil: " . json_encode($response['maintenanceSchedules']));

    // Ambil semua data dari tabel rest_schedules
    $rest = $conn->query("SELECT * FROM rest_schedules ORDER BY startTime ASC");
    $response['restSchedules'] = $rest->fetch_all(MYSQLI_ASSOC);

    error_log("Data rest schedules yang diambil: " . json_encode($response['restSchedules']));

    echo json_encode($response);
} catch (Exception $e) {
    error_log("Error saat mengambil data: " . $e->getMessage());
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
