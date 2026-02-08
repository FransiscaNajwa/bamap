<?php
include 'db_config.php';
header('Content-Type: application/json');

// Log tambahan untuk debugging
error_log("Payload mentah: " . file_get_contents('php://input'));

// Periksa error decoding JSON
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("Error decoding JSON: " . json_last_error_msg());
    echo json_encode(["status" => "error", "message" => "Error decoding JSON: " . json_last_error_msg()]);
    exit;
}

// Log the raw payload for debugging
error_log("Raw payload: " . file_get_contents('php://input'));

// Decode JSON and handle errors
$data = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("JSON decode error: " . json_last_error_msg());
    echo json_encode(["status" => "error", "message" => "Invalid JSON payload."]);
    exit;
}

// Tambahkan validasi untuk memastikan payload JSON valid
if (!$data) {
    error_log("Payload JSON tidak valid atau kosong.");
    echo json_encode(["status" => "error", "message" => "Payload JSON tidak valid atau kosong."]);
    exit;
}

if (!isset($data['shipName'])) {
    error_log("Field 'shipName' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'shipName' tidak ditemukan."]);
    exit;
}

if (!isset($data['company'])) {
    error_log("Field 'company' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'company' tidak ditemukan."]);
    exit;
}

if (!isset($data['code'])) {
    error_log("Field 'code' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'code' tidak ditemukan."]);
    exit;
}

if (!isset($data['length'])) {
    error_log("Field 'length' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'length' tidak ditemukan."]);
    exit;
}

if (!isset($data['draft'])) {
    error_log("Field 'draft' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'draft' tidak ditemukan."]);
    exit;
}

if (!isset($data['destPort'])) {
    error_log("Field 'destPort' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'destPort' tidak ditemukan."]);
    exit;
}

if (!isset($data['berthLocation'])) {
    error_log("Field 'berthLocation' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'berthLocation' tidak ditemukan."]);
    exit;
}

if (!isset($data['nKd'])) {
    error_log("Field 'nKd' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'nKd' tidak ditemukan."]);
    exit;
}

if (!isset($data['minKd'])) {
    error_log("Field 'minKd' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'minKd' tidak ditemukan."]);
    exit;
}

if (!isset($data['loadValue'])) {
    error_log("Field 'loadValue' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'loadValue' tidak ditemukan."]);
    exit;
}

if (!isset($data['dischargeValue'])) {
    error_log("Field 'dischargeValue' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'dischargeValue' tidak ditemukan."]);
    exit;
}

if (!isset($data['etaTime'])) {
    error_log("Field 'etaTime' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'etaTime' tidak ditemukan."]);
    exit;
}

if (!isset($data['startTime'])) {
    error_log("Field 'startTime' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'startTime' tidak ditemukan."]);
    exit;
}

if (!isset($data['etcTime'])) {
    error_log("Field 'etcTime' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'etcTime' tidak ditemukan."]);
    exit;
}

if (!isset($data['endTime'])) {
    error_log("Field 'endTime' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'endTime' tidak ditemukan."]);
    exit;
}

if (!isset($data['status'])) {
    error_log("Field 'status' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'status' tidak ditemukan."]);
    exit;
}

if (!isset($data['berthSide'])) {
    error_log("Field 'berthSide' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'berthSide' tidak ditemukan."]);
    exit;
}

if (!isset($data['bsh'])) {
    error_log("Field 'bsh' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'bsh' tidak ditemukan."]);
    exit;
}

if (!isset($data['qccName'])) {
    error_log("Field 'qccName' tidak ditemukan dalam payload.");
    echo json_encode(["status" => "error", "message" => "Field 'qccName' tidak ditemukan."]);
    exit;
}

// Extract values dari $data array
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

// Validasi shipping_company_id berdasarkan nama perusahaan pelayaran
$shippingCompanyId = null;
if ($company !== null && $company !== '') {
    $lookupCompany = $conn->prepare("SELECT id FROM shipping_companies WHERE name = ? LIMIT 1");
    if (!$lookupCompany) {
        error_log("Prepare failed (lookup shipping company): " . $conn->error);
        echo json_encode(["status" => "error", "message" => $conn->error]);
        exit;
    }
    $lookupCompany->bind_param("s", $company);
    $lookupCompany->execute();
    $lookupCompany->bind_result($foundCompanyId);

    if ($lookupCompany->fetch()) {
        $shippingCompanyId = $foundCompanyId;
        error_log("Shipping company ditemukan: ID = " . $shippingCompanyId);
    } else {
        error_log("Shipping company tidak ditemukan: " . $company);
        echo json_encode(["status" => "error", "message" => "Perusahaan pelayaran tidak ditemukan. Pastikan tabel shipping_companies terisi."]);
        exit;
    }
    $lookupCompany->close();
}

// Fetch QCC names from the database
$qccNames = [];
$qccQuery = $conn->query("SELECT name FROM qcc_names");
if ($qccQuery) {
    while ($row = $qccQuery->fetch_assoc()) {
        $qccNames[] = $row['name'];
    }
    error_log("Available QCC names: " . json_encode($qccNames));
} else {
    error_log("Error fetching QCC names: " . $conn->error);
}

// Validate QCC name(s) - allow multiple values separated by " & " or commas
if ($qccName !== null && $qccName !== '') {
    $qccParts = preg_split('/\s*(?:&|,)\s*|\s+&\s+/', $qccName);
    foreach ($qccParts as $qccPart) {
        $qccPart = trim($qccPart);
        if ($qccPart === '') continue;
        if (!in_array($qccPart, $qccNames)) {
            error_log("Invalid QCC name: " . $qccPart);
            echo json_encode(["status" => "error", "message" => "Invalid QCC name: " . $qccPart]);
            exit;
        }
    }
}

// Query untuk menyisipkan data (dengan shipping_company_id dan berthLocation)
$sql = "INSERT INTO ship_schedules (
            shipName, company, code, length, draft, destPort, berthLocation, nKd, minKd,
            loadValue, dischargeValue, etaTime, startTime, etcTime, endTime, status,
            berthSide, bsh, qccName, shipping_company_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

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
    "sssidsiiiiisssssiisi",
    $shipName,
    $company,
    $code,
    $length,
    $draft,
    $destPort,
    $berthLocation,
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
    $shippingCompanyId
);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    error_log("Error saat menyimpan data: " . $stmt->error);
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}
error_log("Data diterima: " . json_encode($data));
?>
