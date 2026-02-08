<?php
// Periksa data yang disimpan di tabel ship_schedules
include 'db_config.php';

$query = "SELECT * FROM ship_schedules ORDER BY id DESC LIMIT 1";
$result = $conn->query($query);

if ($result) {
    $data = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode(["status" => "success", "data" => $data]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}

$conn->close();
?>