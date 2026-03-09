<?php
require 'db.php';

$stmt = $pdo->query("SELECT * FROM schedule");
$schedule = $stmt->fetchAll();

// Convert participants string back to array for frontend
foreach ($schedule as &$event) {
    $event['participants'] = json_decode($event['participants']);
}

echo json_encode($schedule);
?>
