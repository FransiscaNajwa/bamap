<?php
include 'db_config.php';
header('Content-Type: application/json');

// Ambil data dari request
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['type']) || !isset($data['startKd']) || !isset($data['endKd'])) {
    error_log("Data tidak lengkap: " . json_encode($data));
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap"]);
    exit;
}

// Ambil data dari request
$type = $data['type'] ?? null;
$startKd = $data['startKd'] ?? null;
$endKd = $data['endKd'] ?? null;
$startTime = $data['startTime'] ?? null;
$endTime = $data['endTime'] ?? null;
$keterangan = $data['keterangan'] ?? null;

// Query untuk menyisipkan data ke tabel maintenance_schedules
$sql = "INSERT INTO maintenance_schedules (type, startKd, endKd, startTime, endTime, keterangan) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log("Prepare failed: " . $conn->error);
    echo json_encode(["status" => "error", "message" => $conn->error]);
    exit;
}

$stmt->bind_param("siisss", $type, $startKd, $endKd, $startTime, $endTime, $keterangan);

// Tambahkan log untuk debugging
error_log("Data diterima: " . json_encode($data));

if ($stmt->execute()) {
    error_log("Data berhasil disimpan ke maintenance_schedules.");
    echo json_encode(["status" => "success"]);
} else {
    error_log("Error saat menyimpan data: " . $stmt->error);
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}
?>