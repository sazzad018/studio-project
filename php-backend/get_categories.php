<?php
require 'db.php';

$stmt = $pdo->query("SELECT name FROM categories");
$categories = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo json_encode($categories);
?>
