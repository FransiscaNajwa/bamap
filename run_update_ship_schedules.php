<?php
require_once 'db_config.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check and add 'service' column if not exists
$result = $conn->query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ship_schedules' AND COLUMN_NAME = 'service'");
if ($result->num_rows == 0) {
    $conn->query("ALTER TABLE ship_schedules ADD COLUMN service VARCHAR(255)");
}

// Check and add 'mean' column if not exists
$result = $conn->query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ship_schedules' AND COLUMN_NAME = 'mean'");
if ($result->num_rows == 0) {
    $conn->query("ALTER TABLE ship_schedules ADD COLUMN mean VARCHAR(255)");
}

$conn->close();

echo "Database updated successfully.";
?>