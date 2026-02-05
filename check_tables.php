<?php
include 'db_config.php';

header('Content-Type: text/plain');

$result = $conn->query('SHOW TABLES');
if ($result) {
    while ($row = $result->fetch_array()) {
        print_r($row);
    }
} else {
    echo "Error: " . $conn->error;
}
?>