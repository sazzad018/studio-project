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
    
    // Auto-migrate missing columns for projects table
    $columns = [
        "category VARCHAR(100) DEFAULT ''",
        "thumbnailUrl LONGTEXT",
        "script TEXT",
        "link VARCHAR(255)",
        "clientAdvance DECIMAL(10, 2) DEFAULT 0",
        "modelPayment DECIMAL(10, 2) DEFAULT 0",
        "extraExpenses DECIMAL(10, 2) DEFAULT 0",
        "contentLog TEXT"
    ];
    
    foreach ($columns as $col) {
        try {
            $pdo->exec("ALTER TABLE projects ADD COLUMN $col");
        } catch (\PDOException $e) {
            // Column already exists or other error, ignore
        }
    }
    
    // Also try to modify existing thumbnailUrl to LONGTEXT if it was created as TEXT
    try {
        $pdo->exec("ALTER TABLE projects MODIFY COLUMN thumbnailUrl LONGTEXT");
    } catch (\PDOException $e) {}
    
    // Auto-migrate categories table if missing
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS categories (name VARCHAR(100) PRIMARY KEY)");
        // Insert default categories if table is empty
        $stmt = $pdo->query("SELECT COUNT(*) FROM categories");
        if ($stmt->fetchColumn() == 0) {
            $pdo->exec("INSERT INTO categories (name) VALUES ('Fashion'), ('Commercial'), ('Editorial'), ('Fitness'), ('Parts')");
        }
    } catch (\PDOException $e) {}
    
    // Auto-migrate missing columns for models table
    $modelColumns = [
        "phone VARCHAR(50)",
        "email VARCHAR(100)",
        "facebook VARCHAR(255)"
    ];
    foreach ($modelColumns as $col) {
        try {
            $pdo->exec("ALTER TABLE models ADD COLUMN $col");
        } catch (\PDOException $e) {}
    }
    
    // Modify imageUrl to LONGTEXT in models table
    try {
        $pdo->exec("ALTER TABLE models MODIFY COLUMN imageUrl LONGTEXT");
    } catch (\PDOException $e) {}
    
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
