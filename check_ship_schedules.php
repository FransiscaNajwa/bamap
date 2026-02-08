<?php
// Database connection
include 'db_config.php';

$id = 1; // Test ID

$query = "SELECT * FROM ship_schedules WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $data = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode(["status" => "success", "data" => $data]);
} else {
    echo json_encode(["status" => "error", "message" => "Data not found"]);
}

$stmt->close();
$conn->close();
?>