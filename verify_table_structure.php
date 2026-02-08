<?php
include 'db_config.php';

// Verify table structure for ship_schedules and maintenance_schedules
$tables = ['ship_schedules', 'maintenance_schedules'];

foreach ($tables as $table) {
    $result = $conn->query("DESCRIBE $table");
    echo "Structure of $table:\n";
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . " - " . $row['Type'] . "\n";
    }
    echo "\n";
}