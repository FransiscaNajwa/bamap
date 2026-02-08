<?php
// Tambahkan data perusahaan pelayaran untuk pengujian
include 'db_config.php';

$query = "INSERT INTO shipping_companies (name) VALUES ('Test Company')";

if ($conn->query($query) === TRUE) {
    echo json_encode(["status" => "success", "message" => "Shipping company added successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}

$conn->close();
?>