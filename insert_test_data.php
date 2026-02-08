<?php
// Database connection
include 'db_config.php';

$query = "INSERT INTO ship_schedules (id, company, shipName, code, length, draft, destPort, nKd, minKd, loadValue, dischargeValue, etaTime, startTime, etcTime, endTime, status, berthSide, bsh, qccName, created_at, shipping_company_id) VALUES (1, 'Test Company', 'Test Ship', 'TST123', 100, 5.5, 'Test Port', 500, 400, 300, 200, '2026-02-10 10:00:00', '2026-02-10 12:00:00', '2026-02-10 14:00:00', '2026-02-11 16:00:00', 'Scheduled', 'P', 50, 'QCC1', NOW(), 1)";

if ($conn->query($query) === TRUE) {
    echo json_encode(["status" => "success", "message" => "Test data inserted successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}

$conn->close();
?>