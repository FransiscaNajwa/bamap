<?php
include 'db_config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['id'])) {
    echo json_encode(["status" => "error", "message" => "ID tidak ditemukan"]);
    exit;
}

$id = $data['id'];

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

// Map KD ke ID berth (kolom berthLocation adalah FK ke berths.id)
$berthId = null;
if ($berthLocation !== null && $berthLocation !== '') {
    $lookup = $conn->prepare("SELECT id FROM berths WHERE ? BETWEEN startKd AND endKd LIMIT 1");
    if (!$lookup) {
        echo json_encode(["status" => "error", "message" => $conn->error]);
        exit;
    }
    $lookup->bind_param("i", $berthLocation);
    $lookup->execute();
    $lookup->bind_result($foundBerthId);
    if ($lookup->fetch()) {
        $berthId = $foundBerthId;
    }
    $lookup->close();
}

if ($berthId === null) {
    echo json_encode(["status" => "error", "message" => "Berth untuk KD tidak ditemukan. Pastikan tabel berths terisi."]);
    exit;
}

if ($bsh === '' || $bsh === null) {
    $bsh = null;
}

$sql = "UPDATE ship_schedules SET
            shipName = ?, company = ?, code = ?, length = ?, draft = ?, destPort = ?,
            berthLocation = ?, nKd = ?, minKd = ?, loadValue = ?, dischargeValue = ?,
            etaTime = ?, startTime = ?, etcTime = ?, endTime = ?, status = ?,
            berthSide = ?, bsh = ?, qccName = ?
        WHERE id = ?";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["status" => "error", "message" => $conn->error]);
    exit;
}

$stmt->bind_param(
    "sssidsiiiiissssssisi",
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
    $qccName,
    $id
);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}
?>
