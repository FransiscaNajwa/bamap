<?php
// Database connection
$servername = "localhost";
$username = "root";
$password = ""; // Replace with your MySQL root password
$dbname = "ba_map";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Drop foreign key constraint
$sqlDropFK = "ALTER TABLE ship_schedules DROP FOREIGN KEY fk_ship_berth";
if ($conn->query($sqlDropFK) === TRUE) {
    echo "Foreign key constraint 'fk_ship_berth' successfully dropped.\n";
} else {
    echo "Error dropping foreign key: " . $conn->error . "\n";
}

// Drop the berthLocation column
$sqlDropColumn = "ALTER TABLE ship_schedules DROP COLUMN berthLocation";
if ($conn->query($sqlDropColumn) === TRUE) {
    echo "Column 'berthLocation' successfully dropped from ship_schedules table.";
} else {
    echo "Error dropping column: " . $conn->error . "\n";
}

$conn->close();
?>