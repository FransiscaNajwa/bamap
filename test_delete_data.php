<?php
// Test script for delete_data.php

// Move output buffering to the very beginning of the file
ob_start();

$testCases = [
    ["id" => 1, "type" => "ship"],
    ["id" => 999, "type" => "ship"], // Non-existent ID
    ["id" => 2, "type" => "maintenance"],
    ["id" => 0, "type" => "ship"], // Invalid ID
    ["id" => 1, "type" => "invalid_type"], // Invalid type
];

foreach ($testCases as $testCase) {
    ob_start(); // Start output buffering to prevent header issues
    $url = "http://localhost/Berth-Map-main/delete_data.php?id=" . $testCase['id'] . "&type=" . $testCase['type'];
    
    $response = file_get_contents($url);
    
    ob_end_flush(); // Flush the output buffer at the end
    
    // Replace echo with logging and clean the buffer before including delete_data.php
    error_log("Test Case: " . json_encode($testCase));
    error_log("Response: " . $response);
}

ob_end_flush();

// Ensure no direct output is generated
include 'delete_data.php';
