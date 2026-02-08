<?php
include 'db_config.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS qcc_names (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
    );";

    if ($conn->query($sql) === TRUE) {
        echo "Table 'qcc_names' created successfully.";
    } else {
        echo "Error creating table: " . $conn->error;
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

$conn->close();
?>