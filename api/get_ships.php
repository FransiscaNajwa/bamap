<?php
include 'db_config.php';
header('Content-Type: application/json');

$response = [];

// Ambil Data Kapal
$ships = $conn->query("SELECT * FROM ship_schedules ORDER BY etaTime ASC");
$response['shipSchedules'] = $ships->fetch_all(MYSQLI_ASSOC);

// Ambil Data Maintenance
$maint = $conn->query("SELECT * FROM maintenance_schedules");
$response['maintenanceSchedules'] = $maint->fetch_all(MYSQLI_ASSOC);

// Ambil Data Rest Time
$rest = $conn->query("SELECT * FROM rest_schedules");
$response['restSchedules'] = $rest->fetch_all(MYSQLI_ASSOC);

// Ambil Data Log
$logs = $conn->query("SELECT * FROM communication_logs");
$response['communicationLogs'] = $logs->fetch_all(MYSQLI_ASSOC);

echo json_encode($response);
?>