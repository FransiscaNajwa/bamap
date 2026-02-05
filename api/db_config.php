<?php
// Pengaturan Koneksi
$host = "localhost";
$user = "root"; 
$pass = ""; 
$dbname = "berthing_db"; // Nama database yang Anda buat di phpMyAdmin

$conn = new mysqli($host, $user, $pass, $dbname);

// Cek Koneksi
if ($conn->connect_error) {
    header('Content-Type: application/json');
    die(json_encode(["status" => "error", "message" => "Koneksi Database Gagal"]));
}
?>