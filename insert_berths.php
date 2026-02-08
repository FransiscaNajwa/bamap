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

// SQL query to insert data into berths table
$sql = "INSERT INTO berths (id, startKd, endKd) VALUES 
        (1, 330, 490),
        (2, 490, 650)";

if ($conn->query($sql) === TRUE) {
    echo "Data successfully inserted into berths table.";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>