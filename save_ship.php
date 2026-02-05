<?php
include 'db_config.php';
header('Content-Type: application/json');

// Ambil data dari request
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['shipName']) || !isset($data['company'])) {
    error_log("Data tidak lengkap: " . json_encode($data));
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap"]);
    exit;
}

// Ambil data dari request
$shipName = $data['shipName'] ?? null;
$company = $data['company'] ?? null;
$code = $data['code'] ?? null;
$length = $data['length'] ?? null;
$draft = $data['draft'] ?? null;
$destPort = $data['destPort'] ?? null;
$berthLocation = $data['berthLocation'] ?? null;
$nKd = $data['nKd'] ?? null;
$minKd = $data['minKd'] ?? null;
$loadValue = $data['loadValue'] ?? 0;
$dischargeValue = $data['dischargeValue'] ?? 0;
$etaTime = $data['etaTime'] ?? null;
$startTime = $data['startTime'] ?? null;
$etcTime = $data['etcTime'] ?? null;
$endTime = $data['endTime'] ?? null;
$status = $data['status'] ?? null;
$berthSide = $data['berthSide'] ?? null;
$bsh = $data['bsh'] ?? null;
$qccName = $data['qccName'] ?? null;

// Map KD ke ID berth (karena kolom berthLocation adalah FK ke berths.id)
$berthId = null;
if ($berthLocation !== null && $berthLocation !== '') {
    $lookup = $conn->prepare("SELECT id FROM berths WHERE ? BETWEEN startKd AND endKd LIMIT 1");
    if (!$lookup) {
        error_log("Prepare failed (lookup berth): " . $conn->error);
        echo json_encode(["status" => "error", "message" => $conn->error]);
        exit;
    }
    $lookup->bind_param("i", $berthLocation);
    $lookup->execute();
    $lookup->bind_result($foundBerthId);
    error_log("BerthLocation diterima: " . $berthLocation);

    if ($lookup->fetch()) {
        $berthId = $foundBerthId;
        error_log("Berth ditemukan: ID = " . $berthId);
    } else {
        error_log("Berth tidak ditemukan untuk KD: " . $berthLocation);
    }
    $lookup->close();
}

if ($berthId === null) {
    echo json_encode(["status" => "error", "message" => "Berth untuk KD tidak ditemukan. Pastikan tabel berths terisi."]);
    exit;
}

// Query untuk menyisipkan data (sesuai kolom di database/ba_map.sql)
$sql = "INSERT INTO ship_schedules (
            shipName, company, code, length, draft, destPort, berthLocation, nKd, minKd,
            loadValue, dischargeValue, etaTime, startTime, etcTime, endTime, status,
            berthSide, bsh, qccName
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    error_log("Prepare failed: " . $conn->error);
    echo json_encode(["status" => "error", "message" => $conn->error]);
    exit;
}

// Pastikan bsh null saat kosong
if ($bsh === '' || $bsh === null) {
    $bsh = null;
}

$stmt->bind_param(
    "sssidsiiiiissssssis",
    $shipName,
    $company,
    $code,
    $length,
    $draft,
    $destPort,
    $berthId,
    $nKd,
    $minKd,
    $loadValue,
    $dischargeValue,
    $etaTime,
    $startTime,
    $etcTime,
    $endTime,
    $status,
    $berthSide,
    $bsh,
    $qccName
);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    error_log("Error saat menyimpan data: " . $stmt->error);
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}
error_log("Data diterima: " . json_encode($data));
?>
