<?php
// Error reporting for debugging
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Global exception handler to return JSON errors
set_exception_handler(function ($e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Server Error: ' . $e->getMessage()]);
    exit;
});

$host = 'localhost';
$db   = 'studio_management';
$user = 'root'; // আপনার ডাটাবেজ ইউজারনেম দিন (যেমন: XAMPP এর জন্য root)
$pass = '';     // আপনার ডাটাবেজ পাসওয়ার্ড দিন (XAMPP এর জন্য ফাঁকা রাখুন)
$charset = 'utf8mb4';

try {
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    if (strpos($e->getMessage(), 'could not find driver') !== false) {
        echo json_encode(['error' => 'PDO MySQL driver is missing on your server. Please enable "pdo_mysql" and "mysqli" extensions in your cPanel PHP Selector.']);
    } else {
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    }
    exit;
}
?>
