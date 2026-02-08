<?php
// Periksa struktur tabel ship_schedules
include 'db_config.php';

$query = "DESCRIBE ship_schedules";
$result = $conn->query($query);

if ($result) {
    $columns = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode(["status" => "success", "columns" => $columns]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}

$conn->close();
?>