<?php
include 'db_config.php';

try {
    $sql = "INSERT INTO qcc_names (name) VALUES 
        ('QCC01'),
        ('QCC02'),
        ('QCC03'),
        ('QCC04');";

    if ($conn->query($sql) === TRUE) {
        echo "QCC names inserted successfully.";
    } else {
        echo "Error inserting QCC names: " . $conn->error;
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

$conn->close();
?>