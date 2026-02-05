<?php
include 'db_config.php';
header('Content-Type: application/json');

$response = [];

try {
    $data = json_decode(file_get_contents('php://input'), true);

    error_log('Input data: ' . json_encode($data));

    if (!isset($data['startTime'], $data['endTime'], $data['keterangan'])) {
        throw new Exception('Invalid input data');
    }

    $startTime = $conn->real_escape_string($data['startTime']);
    $endTime = $conn->real_escape_string($data['endTime']);
    $keterangan = $conn->real_escape_string($data['keterangan']);

    $query = "INSERT INTO rest_schedules (startTime, endTime, keterangan) VALUES ('$startTime', '$endTime', '$keterangan')";

    if ($conn->query($query)) {
        error_log('Query executed successfully: ' . $query);
        $response['status'] = 'success';
        $response['message'] = 'Break data saved successfully';
    } else {
        error_log('Query failed: ' . $conn->error);
        throw new Exception('Failed to save break data: ' . $conn->error);
    }
} catch (Exception $e) {
    $response['status'] = 'error';
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>